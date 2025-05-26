import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    console.log('Received authorization code:', code ? 'Present' : 'Missing')
    console.log('Environment check:', {
      clientId: GOOGLE_CONFIG.clientId ? 'Present' : 'Missing',
      clientSecret: GOOGLE_CONFIG.clientSecret ? 'Present' : 'Missing',
      redirectUri: GOOGLE_CONFIG.redirectUri,
    })

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      )
    }

    if (!GOOGLE_CONFIG.clientId || !GOOGLE_CONFIG.clientSecret) {
      console.error('Missing required environment variables')
      return NextResponse.json(
        { error: 'Server configuration error: Missing OAuth credentials' },
        { status: 500 }
      )
    }

    // Manually construct the request body to avoid encoding issues
    const requestBody = [
      `client_id=${encodeURIComponent(GOOGLE_CONFIG.clientId)}`,
      `client_secret=${encodeURIComponent(GOOGLE_CONFIG.clientSecret)}`,
      `code=${encodeURIComponent(code)}`,
      `grant_type=authorization_code`,
      `redirect_uri=${encodeURIComponent(GOOGLE_CONFIG.redirectUri)}`
    ].join('&')

    console.log('Token request body:', requestBody)
    console.log('Redirect URI being sent:', GOOGLE_CONFIG.redirectUri)

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: requestBody,
    })

    const responseText = await tokenResponse.text()
    console.log('Google response status:', tokenResponse.status)
    console.log('Google response:', responseText)

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', responseText)
      
      // Try to parse error details
      let errorDetails = responseText
      let specificError = 'Failed to exchange code for tokens'
      
      try {
        const errorJson = JSON.parse(responseText)
        errorDetails = errorJson.error_description || errorJson.error || responseText
        
        // Provide specific error messages for common issues
        if (errorJson.error === 'invalid_grant') {
          specificError = 'Authorization code is invalid, expired, or already used. Please try connecting again.'
        } else if (errorJson.error === 'invalid_client') {
          specificError = 'Invalid client credentials. Please check your Google Cloud Console setup.'
        } else if (errorJson.error === 'redirect_uri_mismatch') {
          specificError = 'Redirect URI mismatch. Please verify your Google Cloud Console settings.'
        }
      } catch (e) {
        // Keep original response text
      }

      return NextResponse.json(
        { 
          error: specificError, 
          details: errorDetails,
          status: tokenResponse.status,
          hint: 'Try disconnecting and reconnecting your Google account'
        },
        { status: 400 }
      )
    }

    const tokens = JSON.parse(responseText)
    console.log('Successfully exchanged tokens')

    return NextResponse.json({ tokens })
  } catch (error) {
    console.error('Token exchange error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
} 