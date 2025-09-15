import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization header with Bearer token is required' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7)
    const formData = await request.formData()
    const image = formData.get('image') as File
    const locationName = formData.get('locationName') as string

    if (!image || !locationName) {
      return NextResponse.json(
        { error: 'Image and location name are required' },
        { status: 400 }
      )
    }

    console.log('[Upload Media API] Uploading image for location:', locationName)

    // Get accounts to find the correct account for the location
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
    
    // Create media item using Google Business Profile API
    const mediaUploadData = {
      locationAssociation: {
        category: 'LOGO' // This can be LOGO, COVER, PROFILE, etc.
      },
      mediaFormat: 'PHOTO'
    }

    // First, create the media item
    const createMediaUrl = `https://mybusiness.googleapis.com/v4/${accountName}/locations/${locationId}/media`
    
    const createMediaResponse = await fetch(createMediaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mediaUploadData)
    })

    if (!createMediaResponse.ok) {
      const createError = await createMediaResponse.text()
      console.error('[Upload Media API] Failed to create media item:', createError)
      
      // Fallback: Convert image to base64 and return it
      // This allows the frontend to still include the image in the post
      const arrayBuffer = await image.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const dataUrl = `data:${image.type};base64,${base64}`
      
      return NextResponse.json({
        mediaUrl: dataUrl,
        isBase64: true,
        message: 'Using base64 fallback due to Google API limitations'
      })
    }

    const mediaItem = await createMediaResponse.json()
    console.log('[Upload Media API] Created media item:', mediaItem.name)

    // For now, we'll use a base64 approach as the Google Business Profile Media API
    // has complex upload requirements and may not be available for all accounts
    const arrayBuffer = await image.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUrl = `data:${image.type};base64,${base64}`

    return NextResponse.json({
      mediaUrl: dataUrl,
      isBase64: true,
      googleMediaName: mediaItem.name,
      message: 'Image processed successfully'
    })

  } catch (error) {
    console.error('[Upload Media API] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error during media upload' },
      { status: 500 }
    )
  }
} 