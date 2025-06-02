import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuthService } from '@/lib/google-auth'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const profileId = searchParams.get('profileId')
    const googleBusinessId = searchParams.get('googleBusinessId')

    if (!profileId || !googleBusinessId) {
      return NextResponse.json(
        { error: 'Missing required parameters: profileId and googleBusinessId' },
        { status: 400 }
      )
    }

    // Get authentication
    const authService = GoogleAuthService.getInstance()
    if (!authService.isAuthenticated()) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const accessToken = await authService.getValidAccessToken()
    
    // Extract location ID from googleBusinessId
    const locationMatch = googleBusinessId.match(/locations\/([^\/]+)/)
    if (!locationMatch) {
      return NextResponse.json(
        { error: 'Invalid business ID format' },
        { status: 400 }
      )
    }
    
    const locationId = locationMatch[1]
    const accountId = googleBusinessId.split('/')[1]
    const endpoint = `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${accountId}/locations/${locationId}/localPosts`

    console.log('[API] Local Posts endpoint:', endpoint)

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('[API] Local Posts response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('[API] Local Posts error response:', errorText)
      
      if (response.status === 403) {
        return NextResponse.json({
          success: true,
          posts: [],
          message: 'Local Posts not available for this location'
        })
      } else if (response.status === 404) {
        return NextResponse.json({
          success: true,
          posts: [],
          message: 'No local posts found for this location'
        })
      }
      
      return NextResponse.json(
        { error: `Google API Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[API] Local Posts success, found:', data.localPosts?.length || 0, 'posts')
    
    const posts = data.localPosts || []
    
    // Sort posts by creation time (newest first)
    posts.sort((a: any, b: any) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())

    return NextResponse.json({
      success: true,
      posts: posts
    })

  } catch (error) {
    console.error('[API] Local Posts error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch local posts',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 