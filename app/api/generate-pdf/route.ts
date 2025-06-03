import { NextRequest, NextResponse } from 'next/server'
import { EnhancedPDFReportGenerator, EnhancedReportData } from '@/lib/pdf-report-generator'
import { ClientInfo } from '@/lib/client-management'

export async function POST(request: NextRequest) {
  try {
    console.log('[PDF API] Starting PDF generation request...')
    
    const body = await request.json()
    const { reportData, client, reportPeriod } = body as {
      reportData: EnhancedReportData
      client: ClientInfo
      reportPeriod: 'weekly' | 'monthly'
    }

    console.log('[PDF API] Request data received:', {
      businessName: reportData.businessProfile.name,
      clientName: client.name,
      reportPeriod
    })

    try {
      // Try enhanced PDF generation with charts first
      console.log('[PDF API] Attempting enhanced PDF generation with charts...')
      const generator = new EnhancedPDFReportGenerator()
      const pdfBlob = await generator.generateEnhancedReport(reportData, client, reportPeriod)

      console.log('[PDF API] Enhanced PDF generated successfully')
      
      // Convert blob to buffer for response
      const buffer = await pdfBlob.arrayBuffer()
      
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${reportData.businessProfile.name}-report-${new Date().toISOString().split('T')[0]}.pdf"`
        }
      })

    } catch (chartError) {
      console.error('[PDF API] Enhanced PDF generation failed, falling back to simple PDF:', chartError)
      
      // Fallback to simple PDF without charts
      try {
        console.log('[PDF API] Generating fallback PDF without charts...')
        const simplePdf = await generateSimplePDF(reportData, client, reportPeriod)
        
        console.log('[PDF API] Fallback PDF generated successfully')
        
        return new NextResponse(simplePdf, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${reportData.businessProfile.name}-report-${new Date().toISOString().split('T')[0]}.pdf"`
          }
        })
      } catch (fallbackError) {
        console.error('[PDF API] Fallback PDF generation also failed:', fallbackError)
        throw fallbackError
      }
    }

  } catch (error) {
    console.error('[PDF API] Complete PDF generation failure:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate PDF report',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Simple PDF generation fallback without charts
async function generateSimplePDF(
  reportData: EnhancedReportData,
  client: ClientInfo,
  reportPeriod: 'weekly' | 'monthly'
): Promise<ArrayBuffer> {
  const jsPDF = (await import('jspdf')).default
  const { format } = await import('date-fns')
  
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const margin = 15
  let currentY = margin

  // Header
  pdf.setFillColor(37, 99, 235)
  pdf.rect(0, 0, pageWidth, 50, 'F')
  
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(24)
  pdf.setFont('helvetica', 'bold')
  pdf.text(reportData.businessProfile.name, margin, 25)
  
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)} Performance Report`, margin, 35)
  
  pdf.setFontSize(10)
  pdf.text(`Generated on ${format(new Date(), 'MMMM dd, yyyy')}`, margin, 42)

  currentY = 60

  // Executive Summary
  pdf.setTextColor(0, 0, 0)
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('📊 Executive Summary', margin, currentY)
  currentY += 15

  // Key Metrics
  const metrics = [
    { label: 'Total Views', value: reportData.analytics.totalViews, trend: reportData.analytics.trends.viewsTrend },
    { label: 'Customer Actions', value: reportData.analytics.totalActions, trend: reportData.analytics.trends.actionsTrend },
    { label: 'Phone Calls', value: reportData.analytics.callClicks, trend: reportData.analytics.trends.callClicksTrend },
    { label: 'Average Rating', value: reportData.reviews.averageRating.toFixed(1), trend: reportData.reviews.ratingTrend }
  ]

  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')

  metrics.forEach((metric, index) => {
    const y = currentY + index * 8
    const trendIndicator = metric.trend > 0 ? '↗️' : metric.trend < 0 ? '↘️' : '→'
    const trendText = `${Math.abs(metric.trend).toFixed(1)}%`
    
    pdf.text(`${metric.label}: ${metric.value} ${trendIndicator} ${trendText}`, margin, y)
  })

  currentY += metrics.length * 8 + 15

  // Reviews Summary
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('⭐ Customer Reviews', margin, currentY)
  currentY += 15

  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Total Reviews: ${reportData.reviews.totalReviews}`, margin, currentY)
  pdf.text(`Average Rating: ${reportData.reviews.averageRating.toFixed(1)} ⭐`, margin, currentY + 7)
  pdf.text(`New Reviews: ${reportData.reviews.newReviews} this period`, margin, currentY + 14)

  currentY += 30

  // Recent Reviews
  if (reportData.reviews.recentReviews.length > 0) {
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Recent Reviews:', margin, currentY)
    currentY += 10

    reportData.reviews.recentReviews.slice(0, 2).forEach((review, index) => {
      const y = currentY + index * 20
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`${'⭐'.repeat(review.rating)} - ${review.author}`, margin, y)
      
      if (review.comment) {
        pdf.setFont('helvetica', 'normal')
        const comment = review.comment.length > 80 ? review.comment.substring(0, 80) + '...' : review.comment
        const lines = pdf.splitTextToSize(`"${comment}"`, pageWidth - 2 * margin)
        pdf.text(lines, margin, y + 6)
      }
    })

    currentY += reportData.reviews.recentReviews.length * 20 + 10
  }

  // Content Performance
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.text('📸 Content Performance', margin, currentY)
  currentY += 15

  pdf.setFontSize(11)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Photos: ${reportData.content.totalPhotos} total (${reportData.content.newPhotos} new)`, margin, currentY)
  pdf.text(`Business Posts: ${reportData.content.totalPosts} total (${reportData.content.newPosts} new)`, margin, currentY + 7)

  currentY += 25

  // Footer
  pdf.setFontSize(8)
  pdf.setTextColor(100, 116, 139)
  pdf.text('📊 Generated by OvernightBiz Analytics Dashboard', margin, pageHeight - 15)
  pdf.text(`📅 ${format(new Date(), 'MMM dd, yyyy')}`, pageWidth - margin - 30, pageHeight - 15)

  return pdf.output('arraybuffer')
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'PDF Generation Service',
    timestamp: new Date().toISOString()
  })
} 