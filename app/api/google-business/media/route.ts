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
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header with Bearer token is required' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7) // Remove 'Bearer ' prefix

    let fullLocationName = locationName

    // Check if locationName is in the old format (just "locations/{id}")
    // If so, we need to get the account and construct the full path
    if (locationName.startsWith('locations/') && !locationName.includes('accounts/')) {
      console.log('[Media API] Converting location ID to full path for:', locationName)
      
      // Get accounts to find the correct account for this location
      const accountsResponse = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!accountsResponse.ok) {
        const accountsError = await accountsResponse.text()
        return NextResponse.json(
          { error: `Failed to get accounts: ${accountsError}` },
          { status: accountsResponse.status }
        )
      }

      const accountsData = await accountsResponse.json()
      const accounts = accountsData.accounts || []
      
      if (accounts.length === 0) {
        return NextResponse.json(
          { error: 'No business accounts found' },
          { status: 404 }
        )
      }

      // Use the first account (most common case)
      const accountName = accounts[0].name
      const locationId = locationName.split('/')[1] // Extract just the ID part
      
      // Construct the full location name
      fullLocationName = `${accountName}/locations/${locationId}`
      console.log('[Media API] Converted to full location name:', fullLocationName)
    }

    // The locationName should now be in format: accounts/{accountId}/locations/{locationId}
    // We need to construct the correct v4 media endpoint
    const mediaUrl = `https://mybusiness.googleapis.com/v4/${fullLocationName}/media`
    
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