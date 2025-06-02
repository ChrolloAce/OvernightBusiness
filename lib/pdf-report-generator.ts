// PDF Report Generator for Business Analytics

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { format, subDays, subWeeks, subMonths } from 'date-fns'
import { SavedBusinessProfile } from './business-profiles-storage'
import { ClientInfo } from './client-management'

export interface ReportData {
  businessProfile: SavedBusinessProfile
  analytics: {
    views: number
    searches: number
    actions: number
    callClicks: number
    websiteClicks: number
    directionRequests: number
    photoViews: number
    period: string
    previousPeriod?: {
      views: number
      searches: number
      actions: number
    }
  }
  reviews: {
    totalReviews: number
    averageRating: number
    newReviews: number
    ratingDistribution: { [key: number]: number }
    recentReviews: Array<{
      rating: number
      comment?: string
      author: string
      date: string
    }>
  }
  photos: {
    totalPhotos: number
    newPhotos: number
    recentPhotos: Array<{
      url: string
      caption?: string
      date: string
    }>
  }
  updates: {
    totalPosts: number
    newPosts: number
    recentPosts: Array<{
      type: string
      title?: string
      content: string
      date: string
    }>
  }
  qa: {
    totalQuestions: number
    newQuestions: number
    answeredQuestions: number
    recentQuestions: Array<{
      question: string
      answer?: string
      date: string
    }>
  }
}

export class PDFReportGenerator {
  private pdf: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin: number
  private currentY: number
  private primaryColor: string = '#2563eb'
  private secondaryColor: string = '#64748b'
  private accentColor: string = '#10b981'

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4')
    this.pageWidth = this.pdf.internal.pageSize.getWidth()
    this.pageHeight = this.pdf.internal.pageSize.getHeight()
    this.margin = 20
    this.currentY = this.margin
  }

  async generateReport(
    reportData: ReportData,
    client: ClientInfo,
    reportPeriod: 'weekly' | 'monthly'
  ): Promise<Blob> {
    // Reset PDF
    this.pdf = new jsPDF('p', 'mm', 'a4')
    this.currentY = this.margin

    // Generate report sections
    this.addHeader(reportData.businessProfile, reportPeriod)
    this.addExecutiveSummary(reportData)
    
    if (client.preferences.includeAnalytics) {
      this.addAnalyticsSection(reportData.analytics)
    }
    
    if (client.preferences.includeReviews) {
      this.addReviewsSection(reportData.reviews)
    }
    
    if (client.preferences.includePhotos) {
      this.addPhotosSection(reportData.photos)
    }
    
    if (client.preferences.includeUpdates) {
      this.addUpdatesSection(reportData.updates)
    }
    
    if (client.preferences.includeQA) {
      this.addQASection(reportData.qa)
    }

    this.addFooter(client)

    // Return PDF as blob
    return new Promise((resolve) => {
      const pdfBlob = this.pdf.output('blob')
      resolve(pdfBlob)
    })
  }

  private addHeader(businessProfile: SavedBusinessProfile, reportPeriod: 'weekly' | 'monthly'): void {
    // Header background
    this.pdf.setFillColor(37, 99, 235) // Blue background
    this.pdf.rect(0, 0, this.pageWidth, 40, 'F')

    // Business name
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(24)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text(businessProfile.name, this.margin, 20)

    // Report title
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'normal')
    const reportTitle = `${reportPeriod.charAt(0).toUpperCase() + reportPeriod.slice(1)} Business Report`
    this.pdf.text(reportTitle, this.margin, 30)

    // Date
    const reportDate = format(new Date(), 'MMMM dd, yyyy')
    this.pdf.text(`Generated on ${reportDate}`, this.pageWidth - this.margin - 60, 30)

    this.currentY = 50
  }

  private addExecutiveSummary(reportData: ReportData): void {
    this.addSectionTitle('Executive Summary')
    
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'normal')

    const summaryText = [
      `Your business had ${reportData.analytics.views} profile views and ${reportData.analytics.searches} searches this period.`,
      `Customer engagement: ${reportData.analytics.actions} total actions including ${reportData.analytics.callClicks} calls and ${reportData.analytics.websiteClicks} website visits.`,
      `Reviews: ${reportData.reviews.newReviews} new reviews with an average rating of ${reportData.reviews.averageRating.toFixed(1)} stars.`,
      `Content: ${reportData.photos.newPhotos} new photos and ${reportData.updates.newPosts} business updates were added.`
    ]

    summaryText.forEach(text => {
      const lines = this.pdf.splitTextToSize(text, this.pageWidth - 2 * this.margin)
      this.pdf.text(lines, this.margin, this.currentY)
      this.currentY += lines.length * 5 + 3
    })

    this.currentY += 10
  }

  private addAnalyticsSection(analytics: ReportData['analytics']): void {
    this.checkPageBreak(80)
    this.addSectionTitle('Performance Analytics')

    // Metrics grid
    const metrics = [
      { label: 'Profile Views', value: analytics.views.toLocaleString(), color: this.primaryColor },
      { label: 'Searches', value: analytics.searches.toLocaleString(), color: this.accentColor },
      { label: 'Total Actions', value: analytics.actions.toLocaleString(), color: '#f59e0b' },
      { label: 'Phone Calls', value: analytics.callClicks.toLocaleString(), color: '#ef4444' }
    ]

    const boxWidth = (this.pageWidth - 2 * this.margin - 15) / 2
    const boxHeight = 25

    metrics.forEach((metric, index) => {
      const x = this.margin + (index % 2) * (boxWidth + 5)
      const y = this.currentY + Math.floor(index / 2) * (boxHeight + 5)

      // Box background
      this.pdf.setFillColor(248, 250, 252)
      this.pdf.rect(x, y, boxWidth, boxHeight, 'F')

      // Border
      this.pdf.setDrawColor(226, 232, 240)
      this.pdf.rect(x, y, boxWidth, boxHeight, 'S')

      // Value
      this.pdf.setTextColor(0, 0, 0)
      this.pdf.setFontSize(16)
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text(metric.value, x + 5, y + 12)

      // Label
      this.pdf.setFontSize(10)
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.setTextColor(100, 116, 139)
      this.pdf.text(metric.label, x + 5, y + 20)
    })

    this.currentY += 60
  }

  private addReviewsSection(reviews: ReportData['reviews']): void {
    this.checkPageBreak(100)
    this.addSectionTitle('Customer Reviews')

    // Reviews summary
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'normal')

    const reviewsText = [
      `Total Reviews: ${reviews.totalReviews} | Average Rating: ${reviews.averageRating.toFixed(1)} ⭐`,
      `New Reviews This Period: ${reviews.newReviews}`
    ]

    reviewsText.forEach(text => {
      this.pdf.text(text, this.margin, this.currentY)
      this.currentY += 7
    })

    this.currentY += 5

    // Rating distribution
    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Rating Distribution:', this.margin, this.currentY)
    this.currentY += 8

    const ratings = [5, 4, 3, 2, 1] as const
    ratings.forEach((rating: number) => {
      const count = reviews.ratingDistribution[rating] || 0
      const percentage = reviews.totalReviews > 0 ? (count / reviews.totalReviews * 100).toFixed(1) : '0'
      
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.text(`${rating} ⭐: ${count} reviews (${percentage}%)`, this.margin + 5, this.currentY)
      this.currentY += 6
    })

    this.currentY += 10

    // Recent reviews
    if (reviews.recentReviews.length > 0) {
      this.pdf.setFontSize(10)
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text('Recent Reviews:', this.margin, this.currentY)
      this.currentY += 8

      reviews.recentReviews.slice(0, 3).forEach(review => {
        this.checkPageBreak(30)
        
        // Review box
        const boxHeight = review.comment ? 25 : 15
        this.pdf.setFillColor(249, 250, 251)
        this.pdf.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight, 'F')
        
        // Rating and author
        this.pdf.setFontSize(9)
        this.pdf.setFont('helvetica', 'bold')
        this.pdf.setTextColor(0, 0, 0)
        const stars = '⭐'.repeat(review.rating)
        this.pdf.text(`${stars} - ${review.author}`, this.margin + 3, this.currentY + 8)

        // Date
        this.pdf.setFont('helvetica', 'normal')
        this.pdf.setTextColor(100, 116, 139)
        this.pdf.text(review.date, this.pageWidth - this.margin - 30, this.currentY + 8)

        // Comment
        if (review.comment) {
          this.pdf.setTextColor(0, 0, 0)
          const commentLines = this.pdf.splitTextToSize(review.comment, this.pageWidth - 2 * this.margin - 10)
          this.pdf.text(commentLines.slice(0, 2), this.margin + 3, this.currentY + 16)
        }

        this.currentY += boxHeight + 5
      })
    }

    this.currentY += 10
  }

  private addPhotosSection(photos: ReportData['photos']): void {
    this.checkPageBreak(60)
    this.addSectionTitle('Business Photos')

    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'normal')

    const photosText = [
      `Total Photos: ${photos.totalPhotos}`,
      `New Photos This Period: ${photos.newPhotos}`
    ]

    photosText.forEach(text => {
      this.pdf.text(text, this.margin, this.currentY)
      this.currentY += 7
    })

    if (photos.recentPhotos.length > 0) {
      this.currentY += 5
      this.pdf.setFontSize(10)
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text('Recent Photos:', this.margin, this.currentY)
      this.currentY += 8

      photos.recentPhotos.slice(0, 3).forEach(photo => {
        this.pdf.setFont('helvetica', 'normal')
        this.pdf.text(`• ${photo.caption || 'Business photo'} (${photo.date})`, this.margin + 5, this.currentY)
        this.currentY += 6
      })
    }

    this.currentY += 15
  }

  private addUpdatesSection(updates: ReportData['updates']): void {
    this.checkPageBreak(80)
    this.addSectionTitle('Business Updates')

    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'normal')

    const updatesText = [
      `Total Posts: ${updates.totalPosts}`,
      `New Posts This Period: ${updates.newPosts}`
    ]

    updatesText.forEach(text => {
      this.pdf.text(text, this.margin, this.currentY)
      this.currentY += 7
    })

    if (updates.recentPosts.length > 0) {
      this.currentY += 5
      this.pdf.setFontSize(10)
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text('Recent Updates:', this.margin, this.currentY)
      this.currentY += 8

      updates.recentPosts.slice(0, 3).forEach(post => {
        this.checkPageBreak(25)
        
        // Post type and date
        this.pdf.setFont('helvetica', 'bold')
        this.pdf.text(`${post.type} - ${post.date}`, this.margin + 5, this.currentY)
        this.currentY += 6

        // Title if available
        if (post.title) {
          this.pdf.setFont('helvetica', 'bold')
          this.pdf.text(post.title, this.margin + 5, this.currentY)
          this.currentY += 6
        }

        // Content
        this.pdf.setFont('helvetica', 'normal')
        const contentLines = this.pdf.splitTextToSize(post.content, this.pageWidth - 2 * this.margin - 10)
        this.pdf.text(contentLines.slice(0, 2), this.margin + 5, this.currentY)
        this.currentY += contentLines.slice(0, 2).length * 5 + 5
      })
    }

    this.currentY += 10
  }

  private addQASection(qa: ReportData['qa']): void {
    this.checkPageBreak(60)
    this.addSectionTitle('Questions & Answers')

    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'normal')

    const qaText = [
      `Total Questions: ${qa.totalQuestions}`,
      `New Questions This Period: ${qa.newQuestions}`,
      `Answered Questions: ${qa.answeredQuestions}`
    ]

    qaText.forEach(text => {
      this.pdf.text(text, this.margin, this.currentY)
      this.currentY += 7
    })

    if (qa.recentQuestions.length > 0) {
      this.currentY += 5
      this.pdf.setFontSize(10)
      this.pdf.setFont('helvetica', 'bold')
      this.pdf.text('Recent Questions:', this.margin, this.currentY)
      this.currentY += 8

      qa.recentQuestions.slice(0, 3).forEach(item => {
        this.checkPageBreak(20)
        
        // Question
        this.pdf.setFont('helvetica', 'bold')
        this.pdf.text('Q:', this.margin + 5, this.currentY)
        this.pdf.setFont('helvetica', 'normal')
        const questionLines = this.pdf.splitTextToSize(item.question, this.pageWidth - 2 * this.margin - 15)
        this.pdf.text(questionLines, this.margin + 12, this.currentY)
        this.currentY += questionLines.length * 5 + 3

        // Answer
        if (item.answer) {
          this.pdf.setFont('helvetica', 'bold')
          this.pdf.text('A:', this.margin + 5, this.currentY)
          this.pdf.setFont('helvetica', 'normal')
          const answerLines = this.pdf.splitTextToSize(item.answer, this.pageWidth - 2 * this.margin - 15)
          this.pdf.text(answerLines, this.margin + 12, this.currentY)
          this.currentY += answerLines.length * 5 + 5
        } else {
          this.pdf.setFont('helvetica', 'italic')
          this.pdf.setTextColor(100, 116, 139)
          this.pdf.text('Not answered yet', this.margin + 12, this.currentY)
          this.pdf.setTextColor(0, 0, 0)
          this.currentY += 8
        }
      })
    }

    this.currentY += 10
  }

  private addSectionTitle(title: string): void {
    this.checkPageBreak(20)
    
    this.pdf.setTextColor(37, 99, 235)
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text(title, this.margin, this.currentY)
    
    // Underline
    this.pdf.setDrawColor(37, 99, 235)
    this.pdf.line(this.margin, this.currentY + 2, this.margin + 60, this.currentY + 2)
    
    this.currentY += 15
  }

  private addFooter(client: ClientInfo): void {
    const pageCount = this.pdf.getNumberOfPages()
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i)
      
      // Footer line
      this.pdf.setDrawColor(226, 232, 240)
      this.pdf.line(this.margin, this.pageHeight - 15, this.pageWidth - this.margin, this.pageHeight - 15)
      
      // Footer text
      this.pdf.setTextColor(100, 116, 139)
      this.pdf.setFontSize(8)
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.text('Generated by OvernightBiz Dashboard', this.margin, this.pageHeight - 8)
      this.pdf.text(`Page ${i} of ${pageCount}`, this.pageWidth - this.margin - 20, this.pageHeight - 8)
      this.pdf.text(format(new Date(), 'MMM dd, yyyy'), this.pageWidth / 2 - 15, this.pageHeight - 8)
    }
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.currentY + requiredSpace > this.pageHeight - 30) {
      this.pdf.addPage()
      this.currentY = this.margin
    }
  }

  // Static method to generate sample data for testing
  static generateSampleReportData(businessProfile: SavedBusinessProfile): ReportData {
    return {
      businessProfile,
      analytics: {
        views: Math.floor(Math.random() * 1000) + 500,
        searches: Math.floor(Math.random() * 200) + 100,
        actions: Math.floor(Math.random() * 150) + 75,
        callClicks: Math.floor(Math.random() * 50) + 25,
        websiteClicks: Math.floor(Math.random() * 75) + 35,
        directionRequests: Math.floor(Math.random() * 100) + 50,
        photoViews: Math.floor(Math.random() * 300) + 150,
        period: 'Last 7 days'
      },
      reviews: {
        totalReviews: Math.floor(Math.random() * 50) + 25,
        averageRating: 4.2 + Math.random() * 0.7,
        newReviews: Math.floor(Math.random() * 5) + 1,
        ratingDistribution: {
          5: Math.floor(Math.random() * 20) + 15,
          4: Math.floor(Math.random() * 10) + 5,
          3: Math.floor(Math.random() * 5) + 2,
          2: Math.floor(Math.random() * 3) + 1,
          1: Math.floor(Math.random() * 2)
        },
        recentReviews: [
          {
            rating: 5,
            comment: 'Excellent service and professional work. Highly recommended!',
            author: 'John Smith',
            date: format(subDays(new Date(), 2), 'MMM dd, yyyy')
          },
          {
            rating: 4,
            comment: 'Great experience overall. Very satisfied with the results.',
            author: 'Sarah Johnson',
            date: format(subDays(new Date(), 5), 'MMM dd, yyyy')
          }
        ]
      },
      photos: {
        totalPhotos: Math.floor(Math.random() * 30) + 20,
        newPhotos: Math.floor(Math.random() * 5) + 2,
        recentPhotos: [
          {
            url: '/sample-photo-1.jpg',
            caption: 'New outdoor kitchen installation',
            date: format(subDays(new Date(), 1), 'MMM dd, yyyy')
          },
          {
            url: '/sample-photo-2.jpg',
            caption: 'Beautiful landscape design',
            date: format(subDays(new Date(), 3), 'MMM dd, yyyy')
          }
        ]
      },
      updates: {
        totalPosts: Math.floor(Math.random() * 15) + 10,
        newPosts: Math.floor(Math.random() * 3) + 1,
        recentPosts: [
          {
            type: 'Offer',
            title: 'Spring Special - 20% Off Landscaping',
            content: 'Get ready for spring with our professional landscaping services. Limited time offer!',
            date: format(subDays(new Date(), 2), 'MMM dd, yyyy')
          },
          {
            type: 'Event',
            title: 'Free Consultation Week',
            content: 'Schedule your free outdoor design consultation this week.',
            date: format(subDays(new Date(), 7), 'MMM dd, yyyy')
          }
        ]
      },
      qa: {
        totalQuestions: Math.floor(Math.random() * 10) + 5,
        newQuestions: Math.floor(Math.random() * 3) + 1,
        answeredQuestions: Math.floor(Math.random() * 8) + 4,
        recentQuestions: [
          {
            question: 'Do you provide free estimates for outdoor kitchen projects?',
            answer: 'Yes, we provide free estimates for all our outdoor kitchen and landscaping projects.',
            date: format(subDays(new Date(), 1), 'MMM dd, yyyy')
          },
          {
            question: 'What is your typical project timeline?',
            answer: 'Most projects are completed within 2-4 weeks depending on scope and weather conditions.',
            date: format(subDays(new Date(), 4), 'MMM dd, yyyy')
          }
        ]
      }
    }
  }
} 