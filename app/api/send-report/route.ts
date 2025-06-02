import { NextRequest, NextResponse } from 'next/server'
import { ClientInfo } from '@/lib/client-management'
import { ReportData } from '@/lib/pdf-report-generator'

// Email service configuration
// Note: In production, you would use a service like SendGrid, Mailgun, or AWS SES
// For now, this is a mock implementation that logs the email details

interface EmailRequest {
  client: ClientInfo
  reportData: ReportData
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
  reportData: ReportData,
  reportPeriod: 'weekly' | 'monthly'
): Promise<{ success: boolean; emailId?: string; error?: string }> {
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mock email content
  const emailContent = generateEmailContent(client, reportData, reportPeriod)
  
  // Log email details (in production, this would be actual email sending)
  console.log('📧 Sending Email Report:')
  console.log('To:', client.email)
  console.log('Subject:', emailContent.subject)
  console.log('Business:', reportData.businessProfile.name)
  console.log('Period:', reportPeriod)
  console.log('Content Preview:', emailContent.html.substring(0, 200) + '...')

  // Simulate success/failure (90% success rate)
  const success = Math.random() > 0.1

  if (success) {
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
  reportData: ReportData,
  reportPeriod: 'weekly' | 'monthly'
) {
  const businessName = reportData.businessProfile.name
  const periodText = reportPeriod === 'weekly' ? 'Weekly' : 'Monthly'
  
  const subject = `${periodText} Business Report - ${businessName}`
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #2563eb, #3b82f6);
          color: white;
          padding: 30px 20px;
          border-radius: 12px;
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 10px 0 0 0;
          opacity: 0.9;
          font-size: 16px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 15px;
          margin: 30px 0;
        }
        .metric-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
        }
        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 5px;
        }
        .metric-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .section {
          margin: 30px 0;
          padding: 25px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }
        .section h2 {
          margin: 0 0 15px 0;
          color: #1e293b;
          font-size: 20px;
          border-bottom: 2px solid #2563eb;
          padding-bottom: 8px;
        }
        .highlight {
          background: #dbeafe;
          border-left: 4px solid #2563eb;
          padding: 15px;
          margin: 15px 0;
          border-radius: 0 8px 8px 0;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding: 20px;
          background: #f8fafc;
          border-radius: 8px;
          font-size: 14px;
          color: #64748b;
        }
        .cta-button {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 15px 0;
        }
        @media (max-width: 600px) {
          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${businessName}</h1>
        <p>${periodText} Business Performance Report</p>
        <p>${new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>

      <p>Hello ${client.name},</p>
      
      <p>Here's your ${periodText.toLowerCase()} business performance report for <strong>${businessName}</strong>. We're excited to share the latest insights about your business's online presence and customer engagement.</p>

      <div class="summary-grid">
        <div class="metric-card">
          <div class="metric-value">${reportData.analytics.views.toLocaleString()}</div>
          <div class="metric-label">Profile Views</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${reportData.analytics.searches.toLocaleString()}</div>
          <div class="metric-label">Searches</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${reportData.analytics.actions.toLocaleString()}</div>
          <div class="metric-label">Customer Actions</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${reportData.reviews.averageRating.toFixed(1)} ⭐</div>
          <div class="metric-label">Average Rating</div>
        </div>
      </div>

      <div class="section">
        <h2>📊 Performance Highlights</h2>
        <div class="highlight">
          <strong>Great News!</strong> Your business received <strong>${reportData.analytics.views}</strong> profile views and <strong>${reportData.analytics.searches}</strong> searches this ${reportPeriod}.
        </div>
        <ul>
          <li><strong>${reportData.analytics.callClicks}</strong> customers clicked to call your business</li>
          <li><strong>${reportData.analytics.websiteClicks}</strong> visitors clicked through to your website</li>
          <li><strong>${reportData.analytics.directionRequests}</strong> people requested directions to your location</li>
        </ul>
      </div>

      ${reportData.reviews.newReviews > 0 ? `
      <div class="section">
        <h2>⭐ Customer Reviews</h2>
        <p>You received <strong>${reportData.reviews.newReviews} new review${reportData.reviews.newReviews > 1 ? 's' : ''}</strong> this ${reportPeriod}!</p>
        <p>Your current average rating is <strong>${reportData.reviews.averageRating.toFixed(1)} stars</strong> based on ${reportData.reviews.totalReviews} total reviews.</p>
        ${reportData.reviews.recentReviews.length > 0 ? `
        <div class="highlight">
          <strong>Latest Review:</strong><br>
          "${'⭐'.repeat(reportData.reviews.recentReviews[0].rating)} ${reportData.reviews.recentReviews[0].comment || 'Great service!'}"<br>
          <em>- ${reportData.reviews.recentReviews[0].author}</em>
        </div>
        ` : ''}
      </div>
      ` : ''}

      ${reportData.photos.newPhotos > 0 || reportData.updates.newPosts > 0 ? `
      <div class="section">
        <h2>📸 Content Updates</h2>
        <ul>
          ${reportData.photos.newPhotos > 0 ? `<li><strong>${reportData.photos.newPhotos}</strong> new photos were added to your business profile</li>` : ''}
          ${reportData.updates.newPosts > 0 ? `<li><strong>${reportData.updates.newPosts}</strong> new business updates were published</li>` : ''}
        </ul>
      </div>
      ` : ''}

      <div class="section">
        <h2>📋 Detailed Report</h2>
        <p>For a comprehensive analysis including detailed analytics, customer feedback, and actionable insights, please see the attached PDF report.</p>
        <p>The detailed report includes:</p>
        <ul>
          <li>Complete performance analytics and trends</li>
          <li>Full customer review analysis</li>
          <li>Photo and content performance metrics</li>
          <li>Q&A activity summary</li>
          <li>Recommendations for improvement</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="https://www.overnightbiz.com/analytics" class="cta-button">View Live Dashboard</a>
      </div>

      <p>Thank you for trusting us with your business's online presence. If you have any questions about this report or would like to discuss strategies to improve your performance, please don't hesitate to reach out.</p>

      <p>Best regards,<br>
      <strong>The OvernightBiz Team</strong></p>

      <div class="footer">
        <p>This report was automatically generated by OvernightBiz Dashboard</p>
        <p>Visit <a href="https://www.overnightbiz.com">www.overnightbiz.com</a> for more insights</p>
        <p style="font-size: 12px; margin-top: 15px;">
          You're receiving this email because you're subscribed to ${periodText.toLowerCase()} reports for ${businessName}. 
          <a href="#">Unsubscribe</a> | <a href="#">Update Preferences</a>
        </p>
      </div>
    </body>
    </html>
  `

  const text = `
${periodText} Business Report - ${businessName}

Hello ${client.name},

Here's your ${periodText.toLowerCase()} business performance report for ${businessName}.

PERFORMANCE HIGHLIGHTS:
- Profile Views: ${reportData.analytics.views.toLocaleString()}
- Searches: ${reportData.analytics.searches.toLocaleString()}
- Customer Actions: ${reportData.analytics.actions.toLocaleString()}
- Average Rating: ${reportData.reviews.averageRating.toFixed(1)} stars

CUSTOMER ENGAGEMENT:
- ${reportData.analytics.callClicks} customers clicked to call
- ${reportData.analytics.websiteClicks} visitors clicked to your website
- ${reportData.analytics.directionRequests} people requested directions

${reportData.reviews.newReviews > 0 ? `
NEW REVIEWS:
You received ${reportData.reviews.newReviews} new review${reportData.reviews.newReviews > 1 ? 's' : ''} this ${reportPeriod}.
Current average: ${reportData.reviews.averageRating.toFixed(1)} stars (${reportData.reviews.totalReviews} total reviews)
` : ''}

For detailed analytics and insights, please see the attached PDF report.

Best regards,
The OvernightBiz Team

---
This report was automatically generated by OvernightBiz Dashboard
Visit www.overnightbiz.com for more insights
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