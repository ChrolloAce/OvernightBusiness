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

    const tokenRequestBody = new URLSearchParams({
      client_id: GOOGLE_CONFIG.clientId,
      client_secret: GOOGLE_CONFIG.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: GOOGLE_CONFIG.redirectUri,
    })

    console.log('Token request body:', tokenRequestBody.toString())

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenRequestBody,
    })

    const responseText = await tokenResponse.text()
    console.log('Google response status:', tokenResponse.status)
    console.log('Google response:', responseText)

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', responseText)
      
      // Try to parse error details
      let errorDetails = responseText
      try {
        const errorJson = JSON.parse(responseText)
        errorDetails = errorJson.error_description || errorJson.error || responseText
      } catch (e) {
        // Keep original response text
      }

      return NextResponse.json(
        { 
          error: 'Failed to exchange code for tokens', 
          details: errorDetails,
          status: tokenResponse.status 
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