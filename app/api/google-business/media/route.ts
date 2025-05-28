import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locationName = searchParams.get('locationName')
    
    if (!locationName) {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      )
    }

    console.log('[Media API] Fetching media for location:', locationName)

    // Get access token from Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header with Bearer token is required' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7) // Remove 'Bearer ' prefix

    // The locationName should be in format: accounts/{accountId}/locations/{locationId}
    // We need to construct the correct v4 media endpoint
    const mediaUrl = `https://mybusiness.googleapis.com/v4/${locationName}/media`
    
    console.log('[Media API] Requesting:', mediaUrl)

    const response = await fetch(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Media API] Error response:', response.status, errorText)
      
      let errorMessage = `Failed to fetch media: ${response.status} ${response.statusText}`
      
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.error) {
          errorMessage = errorData.error.message || errorData.error
          
          // Provide specific guidance for media API errors
          if (response.status === 404) {
            errorMessage += '\n\nNote: The Google Business Profile Media API may not be available for all locations or may require special permissions. This is a known limitation of the Google Business Profile API.'
          } else if (response.status === 403) {
            errorMessage += '\n\nThis usually means:\n1. The Google Business Profile Media API is not enabled\n2. You don\'t have permission to access media for this location\n3. The location may not support media features'
          }
        }
      } catch (e) {
        errorMessage += ` - ${errorText}`
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    const mediaData = await response.json()
    console.log('[Media API] Successfully fetched media:', mediaData.mediaItems?.length || 0, 'items')

    return NextResponse.json(mediaData)

  } catch (error) {
    console.error('[Media API] Server error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
} 