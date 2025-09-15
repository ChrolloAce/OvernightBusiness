import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
}

export async function POST(request: NextRequest) {
  try {
    const { refresh_token } = await request.json()

    console.log('[Refresh API] Received refresh token request');

    if (!refresh_token) {
      console.error('[Refresh API] Refresh token is missing from request body');
      return NextResponse.json(
        { error: 'Refresh token is required' },
        { status: 400 }
      );
    }

    if (!GOOGLE_CONFIG.clientId || !GOOGLE_CONFIG.clientSecret) {
      console.error('[Refresh API] Server configuration error: Missing OAuth credentials');
      return NextResponse.json(
        { error: 'Server configuration error: Missing OAuth credentials' },
        { status: 500 }
      );
    }

    const tokenRequestBody = new URLSearchParams();
    tokenRequestBody.append('client_id', GOOGLE_CONFIG.clientId);
    tokenRequestBody.append('client_secret', GOOGLE_CONFIG.clientSecret);
    tokenRequestBody.append('refresh_token', refresh_token);
    tokenRequestBody.append('grant_type', 'refresh_token');

    console.log('[Refresh API] Sending refresh request to Google');

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenRequestBody,
    });

    const responseText = await tokenResponse.text();
    console.log('[Refresh API] Google refresh response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      console.error('[Refresh API] Token refresh failed with Google. Response:', responseText);
      
      let errorDetails = responseText;
      let specificError = 'Failed to refresh access token';
      
      try {
        const errorJson = JSON.parse(responseText);
        errorDetails = errorJson.error_description || errorJson.error || responseText;
        
        if (errorJson.error === 'invalid_grant') {
          specificError = 'Refresh token is invalid or expired. Please re-authenticate.';
        } else if (errorJson.error === 'invalid_client') {
          specificError = 'Invalid client credentials. Please check your Google Cloud Console setup.';
        }
      } catch (e) {
        // Keep original response text if not JSON
      }

      return NextResponse.json(
        { 
          error: specificError, 
          details: errorDetails,
          status: tokenResponse.status
        },
        { status: 400 }
      );
    }

    const tokens = JSON.parse(responseText);
    console.log('[Refresh API] Successfully refreshed tokens with Google');

    return NextResponse.json(tokens);
  } catch (error) {
    console.error('[Refresh API] Unexpected error during token refresh:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error during token refresh', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 