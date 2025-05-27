import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const locationName = searchParams.get('locationName')
    const pageSize = searchParams.get('pageSize') || '50'
    const pageToken = searchParams.get('pageToken')

    if (!locationName) {
      return NextResponse.json(
        { error: 'Location name is required' },
        { status: 400 }
      )
    }

    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header with Bearer token is required' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7)

    // Build the Google API URL
    let apiUrl = `https://mybusinessbusinessinformation.googleapis.com/v1/${locationName}/reviews?pageSize=${pageSize}`
    if (pageToken) {
      apiUrl += `&pageToken=${pageToken}`
    }

    console.log('[Reviews API] Fetching reviews for:', locationName)

    // Make the API call to Google
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const responseText = await response.text()
    console.log('[Reviews API] Google API Response Status:', response.status)
    console.log('[Reviews API] Google API Response:', responseText)

    if (!response.ok) {
      let errorMessage = `Google API Error: ${response.status} ${response.statusText}`
      
      try {
        const errorData = JSON.parse(responseText)
        if (errorData.error) {
          errorMessage = errorData.error.message || errorData.error
          
          // Provide specific guidance for common errors
          if (errorData.error.code === 403) {
            errorMessage += '\n\nThis usually means:\n1. The Reviews API is not enabled in Google Cloud Console\n2. You don\'t have permission to access reviews for this business\n3. The business profile doesn\'t have reviews enabled'
          } else if (errorData.error.code === 404) {
            errorMessage += '\n\nThis usually means:\n1. The business location doesn\'t exist\n2. You don\'t have access to this location\n3. The location ID is incorrect'
          } else if (errorData.error.code === 401) {
            errorMessage += '\n\nThis usually means:\n1. Your access token has expired\n2. You don\'t have the required OAuth scopes for reviews\n3. Authentication failed'
          }
        }
      } catch (e) {
        errorMessage += ` - ${responseText}`
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      )
    }

    // Parse and return the response
    try {
      const data = JSON.parse(responseText)
      return NextResponse.json(data)
    } catch (e) {
      return NextResponse.json({ reviews: [], totalReviewCount: 0 })
    }

  } catch (error) {
    console.error('[Reviews API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 