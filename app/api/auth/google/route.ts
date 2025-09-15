import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI!,
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    console.log('[API Route] Received authorization code:', code ? 'Present' : 'Missing');
    console.log('[API Route] Environment check:', {
      clientId: GOOGLE_CONFIG.clientId ? 'Present' : 'Missing',
      clientSecret: GOOGLE_CONFIG.clientSecret ? 'Present' : 'Missing',
      redirectUri: GOOGLE_CONFIG.redirectUri,
    });

    if (!code) {
      console.error('[API Route] Authorization code is missing from request body');
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      );
    }

    if (!GOOGLE_CONFIG.clientId || !GOOGLE_CONFIG.clientSecret) {
      console.error('[API Route] Server configuration error: Missing OAuth credentials from env');
      return NextResponse.json(
        { error: 'Server configuration error: Missing OAuth credentials' },
        { status: 500 }
      );
    }

    const tokenRequestBody = new URLSearchParams();
    tokenRequestBody.append('client_id', GOOGLE_CONFIG.clientId);
    tokenRequestBody.append('client_secret', GOOGLE_CONFIG.clientSecret);
    tokenRequestBody.append('code', code as string); // Explicitly treat code as string
    tokenRequestBody.append('grant_type', 'authorization_code');
    tokenRequestBody.append('redirect_uri', GOOGLE_CONFIG.redirectUri);

    console.log('[API Route] Token request body being sent:', tokenRequestBody.toString());
    console.log('[API Route] Redirect URI being sent to Google:', GOOGLE_CONFIG.redirectUri);

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenRequestBody,
    });

    const responseText = await tokenResponse.text();
    console.log('[API Route] Google token endpoint response status:', tokenResponse.status);
    console.log('[API Route] Google token endpoint response body:', responseText);

    if (!tokenResponse.ok) {
      console.error('[API Route] Token exchange failed with Google. Response:', responseText);
      
      let errorDetails = responseText;
      let specificError = 'Failed to exchange code for tokens';
      
      try {
        const errorJson = JSON.parse(responseText);
        errorDetails = errorJson.error_description || errorJson.error || responseText;
        
        if (errorJson.error === 'invalid_grant') {
          specificError = 'Authorization code is invalid, expired, or already used. Please disconnect and try connecting again.';
        } else if (errorJson.error === 'invalid_client') {
          specificError = 'Invalid client credentials. Please check your Google Cloud Console setup and Vercel environment variables.';
        } else if (errorJson.error === 'redirect_uri_mismatch') {
          specificError = 'Redirect URI mismatch. Please ensure the Redirect URI in Google Cloud Console matches the one configured in your application exactly.';
        }
      } catch (e) {
        // Keep original response text if not JSON
      }

      return NextResponse.json(
        { 
          error: specificError, 
          details: errorDetails,
          status: tokenResponse.status,
          hint: 'Try disconnecting and reconnecting your Google account. Ensure your Google Cloud Console redirect URIs are correct.'
        },
        { status: 400 }
      );
    }

    const tokens = JSON.parse(responseText);
    console.log('[API Route] Successfully exchanged tokens with Google.');

    return NextResponse.json({ tokens });
  } catch (error) {
    console.error('[API Route] Unexpected error during token exchange:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during token exchange', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 