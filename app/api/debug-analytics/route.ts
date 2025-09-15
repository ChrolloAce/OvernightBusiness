import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuthService } from '@/lib/google-auth'
import { GoogleBusinessAPI } from '@/lib/google-business-api'
import { BusinessProfilesStorage } from '@/lib/business-profiles-storage'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('profileId')
    
    if (!profileId) {
      return NextResponse.json(
        { error: 'Missing profileId parameter' },
        { status: 400 }
      )
    }

    // Get the business profile
    const profile = BusinessProfilesStorage.getProfile(profileId)
    if (!profile) {
      return NextResponse.json(
        { error: 'Business profile not found' },
        { status: 404 }
      )
    }

    // Check authentication
    const authService = GoogleAuthService.getInstance()
    if (!authService.isAuthenticated()) {
      return NextResponse.json(
        { error: 'Not authenticated with Google' },
        { status: 401 }
      )
    }

    // Get access token
    const accessToken = await authService.getValidAccessToken()
    
    // Extract location ID
    let locationId = profile.googleBusinessId
    const locationMatch = profile.googleBusinessId.match(/locations\/([^\/]+)/)
    if (locationMatch) {
      locationId = locationMatch[1]
    } else if (profile.googleBusinessId.includes('accounts/')) {
      const parts = profile.googleBusinessId.split('/')
      const locationIndex = parts.indexOf('locations')
      if (locationIndex >= 0 && locationIndex + 1 < parts.length) {
        locationId = parts[locationIndex + 1]
      }
    }

    // Test Performance API access
    const googleAPI = new GoogleBusinessAPI()
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 7) // Last 7 days

    console.log('[Debug Analytics] Testing with location ID:', locationId)
    console.log('[Debug Analytics] Date range:', { startDate, endDate })

    try {
      const performanceData = await googleAPI.fetchMultiDailyMetricsTimeSeries(
        locationId,
        ['BUSINESS_IMPRESSIONS_DESKTOP_MAPS', 'BUSINESS_IMPRESSIONS_MOBILE_MAPS'],
        {
          year: startDate.getFullYear(),
          month: startDate.getMonth() + 1,
          day: startDate.getDate()
        },
        {
          year: endDate.getFullYear(),
          month: endDate.getMonth() + 1,
          day: endDate.getDate()
        }
      )

      return NextResponse.json({
        success: true,
        debug: {
          profileId,
          businessName: profile.name,
          originalGoogleBusinessId: profile.googleBusinessId,
          extractedLocationId: locationId,
          dateRange: { startDate, endDate },
          hasAccessToken: !!accessToken,
          tokenLength: accessToken?.length || 0
        },
        performanceData
      })
    } catch (apiError) {
      console.error('[Debug Analytics] Performance API error:', apiError)
      
      return NextResponse.json({
        success: false,
        debug: {
          profileId,
          businessName: profile.name,
          originalGoogleBusinessId: profile.googleBusinessId,
          extractedLocationId: locationId,
          dateRange: { startDate, endDate },
          hasAccessToken: !!accessToken,
          tokenLength: accessToken?.length || 0
        },
        error: apiError instanceof Error ? apiError.message : 'Unknown API error',
        apiError: apiError
      })
    }

  } catch (error) {
    console.error('[Debug Analytics] General error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

// Health check
export async function POST() {
  return NextResponse.json({
    status: 'Analytics Debug API is working',
    timestamp: new Date().toISOString()
  })
}
