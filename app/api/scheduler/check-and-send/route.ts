import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuthService } from '@/lib/google-auth'

interface ScheduledPost {
  id: string
  businessProfileId: string
  businessName: string
  content: string
  postType: 'update' | 'offer' | 'event' | 'product'
  status: 'scheduled' | 'publishing' | 'published' | 'failed'
  scheduledDate: string
  publishedDate?: string
  callToAction?: {
    text: string
    url: string
  }
  createdAt: string
  updatedAt: string
  error?: string
}

// In a production app, this would be stored in a database
// For now, we'll use a simple file-based approach or memory store
let scheduledPosts: ScheduledPost[] = []

// Load scheduled posts from a persistent store (in production, use a database)
function loadScheduledPosts(): ScheduledPost[] {
  // This would typically load from a database
  // For now, return the in-memory array
  return scheduledPosts
}

function saveScheduledPost(post: ScheduledPost) {
  const index = scheduledPosts.findIndex(p => p.id === post.id)
  if (index >= 0) {
    scheduledPosts[index] = post
  } else {
    scheduledPosts.push(post)
  }
  // In production, save to database here
}

function getPostsReadyForExecution(): ScheduledPost[] {
  const now = new Date()
  return scheduledPosts.filter(post => 
    post.status === 'scheduled' && 
    new Date(post.scheduledDate) <= now
  )
}

async function executeScheduledPost(post: ScheduledPost): Promise<boolean> {
  console.log('[Server Scheduler] Executing scheduled post:', post.id)
  
  // Update status to publishing
  post.status = 'publishing'
  post.updatedAt = new Date().toISOString()
  saveScheduledPost(post)

  try {
    // Get access token
    const googleAuth = GoogleAuthService.getInstance()
    const accessToken = await googleAuth.getValidAccessToken()
    
    if (!accessToken) {
      throw new Error('No access token available')
    }

    // Get accounts to find the correct account for the location
    const accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!accountsResponse.ok) {
      throw new Error(`Failed to get accounts: ${accountsResponse.status}`)
    }

    const accountsData = await accountsResponse.json()
    const accounts = accountsData.accounts || []
    
    if (accounts.length === 0) {
      throw new Error('No business accounts found')
    }

    // Use the first account
    const accountName = accounts[0].name
    const locationId = post.businessProfileId.split('/')[1] || post.businessProfileId
    
    // Build the API URL
    const apiUrl = `https://mybusiness.googleapis.com/v4/${accountName}/locations/${locationId}/localPosts`

    // Map post type to Google's topic type
    const topicTypeMap = {
      'update': 'STANDARD',
      'offer': 'OFFER',
      'event': 'EVENT',
      'product': 'STANDARD'
    }

    // Build the post data
    const postData = {
      topicType: topicTypeMap[post.postType] || 'STANDARD',
      summary: post.content,
      languageCode: 'en',
      ...(post.callToAction && {
        callToAction: {
          actionType: post.callToAction.text.toLowerCase().includes('call') ? 'CALL' : 
                      post.callToAction.text.toLowerCase().includes('book') ? 'BOOK' :
                      post.callToAction.text.toLowerCase().includes('order') ? 'ORDER' : 'LEARN_MORE',
          ...(post.callToAction.url && { url: post.callToAction.url })
        }
      })
    }

    // Make the API call to create the post
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    })

    if (response.ok) {
      // Update status to published
      post.status = 'published'
      post.publishedDate = new Date().toISOString()
      post.updatedAt = new Date().toISOString()
      saveScheduledPost(post)
      
      console.log('[Server Scheduler] Post published successfully:', post.id)
      return true
    } else {
      const errorText = await response.text()
      throw new Error(`API Error: ${response.status} - ${errorText}`)
    }
  } catch (error) {
    console.error('[Server Scheduler] Error executing post:', error)
    
    // Update status to failed
    post.status = 'failed'
    post.error = error instanceof Error ? error.message : 'Unknown error'
    post.updatedAt = new Date().toISOString()
    saveScheduledPost(post)
    
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('[Server Scheduler] Checking for scheduled posts...')
    
    const readyPosts = getPostsReadyForExecution()
    
    if (readyPosts.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No posts ready for execution',
        checkedAt: new Date().toISOString(),
        totalScheduled: scheduledPosts.filter(p => p.status === 'scheduled').length
      })
    }

    console.log(`[Server Scheduler] Found ${readyPosts.length} posts ready for execution`)
    
    const results = []
    
    for (const post of readyPosts) {
      try {
        const success = await executeScheduledPost(post)
        results.push({
          postId: post.id,
          businessName: post.businessName,
          success,
          status: post.status,
          error: post.error
        })
      } catch (error) {
        console.error(`[Server Scheduler] Error executing post ${post.id}:`, error)
        results.push({
          postId: post.id,
          businessName: post.businessName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    
    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} posts, ${successCount} successful`,
      results,
      checkedAt: new Date().toISOString(),
      totalScheduled: scheduledPosts.filter(p => p.status === 'scheduled').length
    })

  } catch (error) {
    console.error('[Server Scheduler] Error in check-and-send:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        checkedAt: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { scheduledPosts: clientPosts } = await request.json()
    
    if (Array.isArray(clientPosts)) {
      // Sync client posts to server
      scheduledPosts = clientPosts
      console.log(`[Server Scheduler] Synced ${clientPosts.length} posts from client`)
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Synced ${clientPosts?.length || 0} posts`,
      syncedAt: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('[Server Scheduler] Error syncing posts:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 