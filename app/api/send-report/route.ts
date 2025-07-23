import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('[Send Report API] Report sending temporarily disabled for Vercel deployment')
    
    return NextResponse.json({
      success: false,
      error: 'Report sending temporarily disabled',
      message: 'Email reporting functionality is being updated and will be available soon.'
    }, { status: 503 })

  } catch (error) {
    console.error('[Send Report API] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Service temporarily unavailable'
    }, { status: 503 })
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Email Report Service (Temporarily Disabled)',
    timestamp: new Date().toISOString()
  })
} 