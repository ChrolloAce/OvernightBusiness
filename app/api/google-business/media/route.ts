import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuthService } from '@/lib/google-auth'

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

    // Get access token from auth service
    const authService = GoogleAuthService.getInstance()
    const accessToken = await authService.getValidAccessToken()

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No valid access token available' },
        { status: 401 }
      )
    }

    // Make request to Google Business Profile Media API
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