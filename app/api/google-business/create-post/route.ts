import { NextRequest, NextResponse } from 'next/server'
import { GoogleBusinessAPI } from '@/lib/google-business-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileId, content, businessInfo } = body
    
    if (!profileId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: profileId, content' },
        { status: 400 }
      )
    }

    console.log(`[Google Business Post API] Creating post for profile: ${profileId}`)

    // Initialize Google Business API
    const googleAPI = new GoogleBusinessAPI()
    
    // Prepare post data
    const postData = {
      topicType: 'STANDARD',
      languageCode: 'en-US',
      summary: content.description || content.title,
      callToAction: {
        actionType: 'LEARN_MORE',
        url: businessInfo?.website || 'https://maktubtechnologies.com'
      },
      media: [] // Can add images later
    }

    console.log(`[Google Business Post API] Post data:`, postData)

    // Create the post
    const result = await googleAPI.createPost(profileId, postData)
    
    console.log(`[Google Business Post API] Post created successfully:`, result)

    return NextResponse.json({
      success: true,
      post: result,
      message: 'Post created successfully'
    })

  } catch (error) {
    console.error('[Google Business Post API] Error creating post:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error creating post'
      },
      { status: 500 }
    )
  }
}
