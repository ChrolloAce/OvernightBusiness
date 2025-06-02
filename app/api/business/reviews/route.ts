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
    
    const endpoint = `https://mybusiness.googleapis.com/v4/${googleBusinessId}/reviews`

    console.log('[API] Reviews endpoint:', endpoint)

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('[API] Reviews response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('[API] Reviews error response:', errorText)
      
      if (response.status === 403) {
        return NextResponse.json({
          success: true,
          reviews: [],
          totalReviewCount: 0,
          averageRating: 0,
          message: 'Reviews not available for this location'
        })
      } else if (response.status === 404) {
        return NextResponse.json({
          success: true,
          reviews: [],
          totalReviewCount: 0,
          averageRating: 0,
          message: 'No reviews found for this location'
        })
      }
      
      return NextResponse.json(
        { error: `Google API Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[API] Reviews success, found:', data.reviews?.length || 0, 'reviews')
    
    const reviews = data.reviews || []
    const totalReviewCount = data.totalReviewCount || 0
    const averageRating = data.averageRating || 0

    return NextResponse.json({
      success: true,
      reviews: reviews,
      totalReviewCount: totalReviewCount,
      averageRating: averageRating
    })

  } catch (error) {
    console.error('[API] Reviews error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch reviews',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 