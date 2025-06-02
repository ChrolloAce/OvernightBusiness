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

    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header with Bearer token is required' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7)

    // Extract account and location IDs from the location name
    // locationName format: "locations/16888103425774150266"
    // We need to convert this to: "accounts/{accountId}/locations/{locationId}"
    
    console.log('[Local Posts API] Getting accounts to find the correct account for location:', locationName)
    
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
    
    // Build the correct v4 API URL for local posts
    const apiUrl = `https://mybusiness.googleapis.com/v4/${accountName}/locations/${locationId}/localPosts`

    console.log('[Local Posts API] Fetching local posts from v4 API:', apiUrl)

    // Make the API call to Google v4 API
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const responseText = await response.text()
    console.log('[Local Posts API] Google API Response Status:', response.status)
    console.log('[Local Posts API] Google API Response:', responseText)

    if (!response.ok) {
      let errorMessage = `Google API Error: ${response.status} ${response.statusText}`
      
      try {
        const errorData = JSON.parse(responseText)
        if (errorData.error) {
          errorMessage = errorData.error.message || errorData.error
          
          // Provide specific guidance for common errors
          if (errorData.error.code === 403) {
            errorMessage += '\n\nThis usually means:\n1. The Posts API is not enabled in Google Cloud Console\n2. You don\'t have permission to access posts for this business\n3. The business profile doesn\'t have posts enabled'
          } else if (errorData.error.code === 404) {
            errorMessage += '\n\nThis usually means:\n1. The business location doesn\'t exist\n2. You don\'t have access to this location\n3. The location ID is incorrect\n4. No local posts exist for this location'
          } else if (errorData.error.code === 401) {
            errorMessage += '\n\nThis usually means:\n1. Your access token has expired\n2. You don\'t have the required OAuth scopes for posts\n3. Authentication failed'
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
      return NextResponse.json({ localPosts: [] })
    }

  } catch (error) {
    console.error('[Local Posts API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 