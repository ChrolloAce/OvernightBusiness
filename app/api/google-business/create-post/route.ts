import { NextRequest, NextResponse } from 'next/server'
import { GoogleBusinessAPI } from '@/lib/google-business-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileId, content, businessInfo, accessToken } = body
    
    if (!profileId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: profileId, content' },
        { status: 400 }
      )
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No tokens available. Please authenticate first.' },
        { status: 401 }
      )
    }

    console.log(`[Google Business Post API] Creating post for profile: ${profileId}`)

    // Use the access token directly for this request
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

    // Make direct API call to Google Business Profile
    const response = await fetch(`https://mybusiness.googleapis.com/v4/${profileId}/localPosts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Google Business Post API] Google API error:`, errorText)
      throw new Error(`Google API error: ${response.status} - ${errorText}`)
    }

    const result = await response.json()
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
