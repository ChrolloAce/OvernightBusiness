import { NextRequest, NextResponse } from 'next/server'
import { EnhancedPDFReportGenerator, EnhancedReportData } from '@/lib/pdf-report-generator'
import { ClientInfo } from '@/lib/client-management'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { reportData, client, reportPeriod } = body as {
      reportData: EnhancedReportData
      client: ClientInfo
      reportPeriod: 'weekly' | 'monthly'
    }

    // Generate PDF on server-side where chartjs-node-canvas works
    const generator = new EnhancedPDFReportGenerator()
    const pdfBlob = await generator.generateEnhancedReport(reportData, client, reportPeriod)

    // Convert blob to buffer for response
    const buffer = await pdfBlob.arrayBuffer()
    
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${reportData.businessProfile.name}-report-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    })

  } catch (error) {
    console.error('Error generating PDF on server:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate PDF report'
    }, { status: 500 })
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'PDF Generation Service',
    timestamp: new Date().toISOString()
  })
} 