import { NextRequest, NextResponse } from 'next/server'
import { ClientInfo } from '@/lib/client-management'
import { EnhancedReportData } from '@/lib/pdf-report-generator'

// Email service configuration
// Note: In production, you would use a service like SendGrid, Mailgun, or AWS SES
// For now, this is a mock implementation that logs the email details

interface EmailRequest {
  client: ClientInfo
  reportData: EnhancedReportData
  pdfBlob: Blob
  reportPeriod: 'weekly' | 'monthly'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client, reportData, reportPeriod } = body as Omit<EmailRequest, 'pdfBlob'>

    // In a real implementation, you would:
    // 1. Convert the PDF blob to a buffer
    // 2. Use an email service to send the email with PDF attachment
    // 3. Handle email delivery status and retries

    // Mock email sending
    const emailResult = await sendReportEmail(client, reportData, reportPeriod)

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Report sent successfully',
        emailId: emailResult.emailId
      })
    } else {
      return NextResponse.json({
        success: false,
        error: emailResult.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error sending report:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to send report'
    }, { status: 500 })
  }
}

// Mock email sending function
async function sendReportEmail(
  client: ClientInfo,
  reportData: EnhancedReportData,
  reportPeriod: 'weekly' | 'monthly'
): Promise<{ success: boolean; emailId?: string; error?: string }> {
  // Simulate email sending with 90% success rate
  const isSuccess = Math.random() > 0.1
  
  if (isSuccess) {
    const emailContent = generateEmailContent(client, reportData, reportPeriod)
    
    // In production, you would use an email service like SendGrid, Mailgun, or AWS SES
    // Example:
    // const response = await emailService.send({
    //   to: client.email,
    //   subject: emailContent.subject,
    //   html: emailContent.html,
    //   text: emailContent.text,
    //   attachments: [{ filename: 'report.pdf', content: pdfBlob }]
    // })
    
    console.log(`📧 Email sent to ${client.email}:`, emailContent.subject)
    
    return {
      success: true,
      emailId: `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  } else {
    return {
      success: false,
      error: 'Email delivery failed'
    }
  }
}

function generateEmailContent(
  client: ClientInfo,
  reportData: EnhancedReportData,
  reportPeriod: 'weekly' | 'monthly'
) {
  const businessName = reportData.businessProfile.name
  const reportDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })

  const subject = `📊 ${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)} Performance Report - ${businessName}`
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessName} - ${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)} Performance Report</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            max-width: 600px; 
            margin: 0 auto; 
            background: #f8fafc;
        }
        .container { 
            background: white; 
            margin: 20px; 
            border-radius: 12px; 
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            text-align: center; 
        }
        .header h1 { 
            margin: 0 0 10px 0; 
            font-size: 28px; 
            font-weight: bold; 
        }
        .header p { 
            margin: 0; 
            opacity: 0.9; 
            font-size: 16px; 
        }
        .content { 
            padding: 30px; 
        }
        .metrics-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
            gap: 20px; 
            margin: 30px 0; 
        }
        .metric-card { 
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
            padding: 20px; 
            border-radius: 8px; 
            text-align: center; 
            border: 1px solid #e2e8f0;
        }
        .metric-value { 
            font-size: 24px; 
            font-weight: bold; 
            color: #2563eb; 
            margin-bottom: 5px; 
        }
        .metric-label { 
            font-size: 12px; 
            color: #64748b; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
        }
        .trend-indicator {
            font-size: 12px;
            margin-top: 5px;
        }
        .trend-up { color: #059669; }
        .trend-down { color: #dc2626; }
        .trend-neutral { color: #6b7280; }
        .section { 
            margin: 30px 0; 
            padding: 20px; 
            background: #f8fafc; 
            border-radius: 8px; 
            border-left: 4px solid #3b82f6; 
        }
        .section h3 { 
            margin: 0 0 15px 0; 
            color: #1e40af; 
            font-size: 18px; 
        }
        .footer { 
            background: #f1f5f9; 
            padding: 20px; 
            text-align: center; 
            color: #64748b; 
            font-size: 14px; 
        }
        .highlight { 
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); 
            padding: 15px; 
            border-radius: 6px; 
            border-left: 4px solid #f59e0b; 
            margin: 20px 0; 
        }
        .reviews-section {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            border-left-color: #059669;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${businessName}</h1>
            <p>📊 ${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)} Performance Report</p>
            <p>Generated on ${reportDate}</p>
        </div>
        
        <div class="content">
            <h2>📈 Performance Overview</h2>
            <p>Dear ${client.name},</p>
            <p>Here's your ${reportPeriod} performance summary for <strong>${businessName}</strong>:</p>
            
            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">${reportData.analytics.totalViews.toLocaleString()}</div>
                    <div class="metric-label">👁️ Profile Views</div>
                    <div class="trend-indicator trend-${reportData.analytics.trends.viewsTrend > 0 ? 'up' : reportData.analytics.trends.viewsTrend < 0 ? 'down' : 'neutral'}">
                        ${reportData.analytics.trends.viewsTrend > 0 ? '↗️' : reportData.analytics.trends.viewsTrend < 0 ? '↘️' : '→'} ${Math.abs(reportData.analytics.trends.viewsTrend).toFixed(1)}%
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${reportData.analytics.totalSearches.toLocaleString()}</div>
                    <div class="metric-label">🔍 Searches</div>
                    <div class="trend-indicator trend-${reportData.analytics.trends.searchesTrend > 0 ? 'up' : reportData.analytics.trends.searchesTrend < 0 ? 'down' : 'neutral'}">
                        ${reportData.analytics.trends.searchesTrend > 0 ? '↗️' : reportData.analytics.trends.searchesTrend < 0 ? '↘️' : '→'} ${Math.abs(reportData.analytics.trends.searchesTrend).toFixed(1)}%
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${reportData.analytics.totalActions.toLocaleString()}</div>
                    <div class="metric-label">⚡ Customer Actions</div>
                    <div class="trend-indicator trend-${reportData.analytics.trends.actionsTrend > 0 ? 'up' : reportData.analytics.trends.actionsTrend < 0 ? 'down' : 'neutral'}">
                        ${reportData.analytics.trends.actionsTrend > 0 ? '↗️' : reportData.analytics.trends.actionsTrend < 0 ? '↘️' : '→'} ${Math.abs(reportData.analytics.trends.actionsTrend).toFixed(1)}%
                    </div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${reportData.analytics.callClicks}</div>
                    <div class="metric-label">📞 Phone Calls</div>
                    <div class="trend-indicator trend-${reportData.analytics.trends.callClicksTrend > 0 ? 'up' : reportData.analytics.trends.callClicksTrend < 0 ? 'down' : 'neutral'}">
                        ${reportData.analytics.trends.callClicksTrend > 0 ? '↗️' : reportData.analytics.trends.callClicksTrend < 0 ? '↘️' : '→'} ${Math.abs(reportData.analytics.trends.callClicksTrend).toFixed(1)}%
                    </div>
                </div>
            </div>

            <div class="highlight">
                <strong>🚀 Key Highlights:</strong><br>
                • Your business gained ${reportData.analytics.totalViews.toLocaleString()} profile views this period<br>
                • ${reportData.analytics.callClicks} customers called your business directly<br>
                • Customer engagement reached ${reportData.analytics.totalActions.toLocaleString()} total actions<br>
                • Average rating maintained at ${reportData.reviews.averageRating.toFixed(1)} ⭐
            </div>

            <div class="section reviews-section">
                <h3>⭐ Customer Reviews</h3>
                <p><strong>Total Reviews:</strong> ${reportData.reviews.totalReviews} | <strong>Average Rating:</strong> ${reportData.reviews.averageRating.toFixed(1)} ⭐</p>
                <p><strong>New Reviews:</strong> ${reportData.reviews.newReviews} this period</p>
                ${reportData.reviews.recentReviews.length > 0 ? `
                <p><strong>Recent Review:</strong></p>
                <div style="background: white; padding: 15px; border-radius: 6px; margin-top: 10px;">
                    <div style="margin-bottom: 5px;">${'⭐'.repeat(reportData.reviews.recentReviews[0].rating)} - ${reportData.reviews.recentReviews[0].author}</div>
                    ${reportData.reviews.recentReviews[0].comment ? `<div style="font-style: italic; color: #64748b;">"${reportData.reviews.recentReviews[0].comment}"</div>` : ''}
                </div>
                ` : ''}
            </div>

            <div class="section">
                <h3>📸 Content Performance</h3>
                <p><strong>Photos:</strong> ${reportData.content.totalPhotos} total (${reportData.content.newPhotos} new this period)</p>
                <p><strong>Business Posts:</strong> ${reportData.content.totalPosts} total (${reportData.content.newPosts} new this period)</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <p>📎 <strong>Detailed analytics report is attached as PDF</strong></p>
                <p style="color: #64748b; font-size: 14px;">The attached PDF contains comprehensive charts, trends, and detailed insights about your business performance.</p>
            </div>
        </div>
        
        <div class="footer">
            <p>📊 Generated by OvernightBiz Analytics Dashboard</p>
            <p>This report was automatically generated for ${client.name} on ${reportDate}</p>
            <p style="font-size: 12px; margin-top: 10px;">
                Next report scheduled: ${reportPeriod === 'weekly' ? 'Next week' : 'Next month'}
            </p>
        </div>
    </div>
</body>
</html>
  `

  const text = `
${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)} Performance Report - ${businessName}

Dear ${client.name},

Here's your ${reportPeriod} performance summary for ${businessName}:

PERFORMANCE HIGHLIGHTS:
- Profile Views: ${reportData.analytics.totalViews.toLocaleString()} (${reportData.analytics.trends.viewsTrend > 0 ? '+' : ''}${reportData.analytics.trends.viewsTrend.toFixed(1)}%)
- Searches: ${reportData.analytics.totalSearches.toLocaleString()} (${reportData.analytics.trends.searchesTrend > 0 ? '+' : ''}${reportData.analytics.trends.searchesTrend.toFixed(1)}%)  
- Customer Actions: ${reportData.analytics.totalActions.toLocaleString()} (${reportData.analytics.trends.actionsTrend > 0 ? '+' : ''}${reportData.analytics.trends.actionsTrend.toFixed(1)}%)
- Phone Calls: ${reportData.analytics.callClicks} (${reportData.analytics.trends.callClicksTrend > 0 ? '+' : ''}${reportData.analytics.trends.callClicksTrend.toFixed(1)}%)

CUSTOMER REVIEWS:
- Total Reviews: ${reportData.reviews.totalReviews}
- Average Rating: ${reportData.reviews.averageRating.toFixed(1)} stars
- New Reviews: ${reportData.reviews.newReviews} this period

CONTENT PERFORMANCE:
- Photos: ${reportData.content.totalPhotos} total (${reportData.content.newPhotos} new)
- Business Posts: ${reportData.content.totalPosts} total (${reportData.content.newPosts} new)

The detailed PDF report is attached with comprehensive charts and analytics.

Best regards,
The OvernightBiz Team

---
Generated by OvernightBiz Analytics Dashboard on ${reportDate}
Next report scheduled: ${reportPeriod === 'weekly' ? 'Next week' : 'Next month'}
  `

  return { subject, html, text }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Email Report Service',
    timestamp: new Date().toISOString()
  })
} 