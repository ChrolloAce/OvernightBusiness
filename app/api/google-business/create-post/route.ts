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
    console.log(`[Google Business Post API] Business info:`, businessInfo)
    console.log(`[Google Business Post API] Content:`, content)

    // Get the account ID dynamically
    let accountId = null
    try {
      const accountsResponse = await fetch('https://mybusiness.googleapis.com/v4/accounts', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json()
        if (accountsData.accounts && accountsData.accounts.length > 0) {
          // Get the account name (e.g., "accounts/100474937961057265076")
          accountId = accountsData.accounts[0].name
          console.log(`[Google Business Post API] Found account: ${accountId}`)
        }
      }
    } catch (error) {
      console.error('[Google Business Post API] Failed to get account ID:', error)
    }

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

    // The profileId should be in format: accounts/{accountId}/locations/{locationId}
    // But we're getting just the location name like "locations/16888103425774150266"
    // We need to construct the full path using the dynamic account ID
    
    let fullLocationPath = profileId
    if (!profileId.includes('accounts/') && accountId) {
      // Extract just the location ID if it's in "locations/123" format
      const locationId = profileId.includes('locations/') ? profileId.split('locations/')[1] : profileId
      
      // Use the dynamic account ID
      fullLocationPath = `${accountId}/locations/${locationId}`
    } else if (!profileId.includes('accounts/')) {
      // Fallback if we couldn't get account ID
      console.error('[Google Business Post API] No account ID available and profileId is not in full format')
      return NextResponse.json(
        { error: 'Unable to determine account ID for Google Business Profile' },
        { status: 400 }
      )
    }
    
    const apiUrl = `https://mybusiness.googleapis.com/v4/${fullLocationPath}/localPosts`
    console.log(`[Google Business Post API] API call to: ${apiUrl}`)
    console.log(`[Google Business Post API] Original profile ID: ${profileId}`)
    console.log(`[Google Business Post API] Full location path: ${fullLocationPath}`)
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(postData)
    })

    console.log(`[Google Business Post API] Response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Google Business Post API] Google API error:`, errorText)
      console.error(`[Google Business Post API] Response status: ${response.status}`)
      console.error(`[Google Business Post API] Full API URL used: ${apiUrl}`)
      
      return NextResponse.json(
        { 
          error: `Google API error: ${response.status}`,
          details: errorText,
          apiUrl: apiUrl,
          profileId: profileId,
          fullLocationPath: fullLocationPath
        },
        { status: response.status }
      )
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
