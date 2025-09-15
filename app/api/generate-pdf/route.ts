import { NextRequest, NextResponse } from 'next/server'
// Temporarily disabled due to Vercel build issues with chartjs-node-canvas
// import { EnhancedPDFReportGenerator, EnhancedReportData } from '@/lib/pdf-report-generator'
// import { ClientInfo } from '@/lib/client-management'

export async function POST(request: NextRequest) {
  try {
    console.log('[PDF API] PDF generation temporarily disabled for Vercel deployment')
    
    return NextResponse.json({
      success: false,
      error: 'PDF generation temporarily disabled',
      message: 'PDF functionality is being updated and will be available soon.'
    }, { status: 503 })

  } catch (error) {
    console.error('[PDF API] Error:', error)
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
    service: 'PDF Generation Service (Temporarily Disabled)',
    timestamp: new Date().toISOString()
  })
} 