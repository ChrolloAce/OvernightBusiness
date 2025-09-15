import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? 'Present' : 'Missing',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Present' : 'Missing',
    redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'Missing',
    // Don't expose actual values for security
  })
} 