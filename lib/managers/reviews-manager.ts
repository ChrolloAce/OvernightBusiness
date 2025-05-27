import { GoogleAuthService } from '../google-auth'

export interface Review {
  name: string
  reviewId: string
  reviewer: {
    profilePhotoUrl?: string
    displayName: string
    isAnonymous: boolean
  }
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE'
  comment: string
  createTime: string
  updateTime: string
  reviewReply?: {
    comment: string
    updateTime: string
  }
}

export interface ReviewSummary {
  totalReviews: number
  averageRating: number
  ratingDistribution: {
    five: number
    four: number
    three: number
    two: number
    one: number
  }
  recentReviews: Review[]
  unrepliedReviews: Review[]
}

export interface ReviewReplyRequest {
  comment: string
}

export class ReviewsManager {
  private static instance: ReviewsManager
  private authService: GoogleAuthService
  private readonly baseUrl = 'https://mybusinessbusinessinformation.googleapis.com/v1'

  private constructor() {
    this.authService = GoogleAuthService.getInstance()
  }

  public static getInstance(): ReviewsManager {
    if (!ReviewsManager.instance) {
      ReviewsManager.instance = new ReviewsManager()
    }
    return ReviewsManager.instance
  }

  // Fetch Reviews for a Location
  public async getReviews(locationName: string): Promise<Review[]> {
    try {
      const accessToken = await this.authService.getValidAccessToken()
      
      console.log('[ReviewsManager] Fetching reviews for location:', locationName)
      
      const response = await fetch(`${this.baseUrl}/${locationName}/reviews`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data.reviews || []
    } catch (error) {
      console.error('[ReviewsManager] Failed to fetch reviews:', error)
      throw new Error(`Failed to fetch reviews: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Get a Specific Review
  public async getReview(reviewName: string): Promise<Review> {
    try {
      const accessToken = await this.authService.getValidAccessToken()
      
      console.log('[ReviewsManager] Fetching review:', reviewName)
      
      const response = await fetch(`${this.baseUrl}/${reviewName}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch review: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[ReviewsManager] Failed to fetch review:', error)
      throw new Error(`Failed to fetch review: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Reply to a Review
  public async replyToReview(reviewName: string, replyRequest: ReviewReplyRequest): Promise<void> {
    try {
      const accessToken = await this.authService.getValidAccessToken()
      
      console.log('[ReviewsManager] Replying to review:', reviewName)
      
      const response = await fetch(`${this.baseUrl}/${reviewName}/reply`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(replyRequest),
      })

      if (!response.ok) {
        throw new Error(`Failed to reply to review: ${response.status} ${response.statusText}`)
      }

      console.log('[ReviewsManager] Successfully replied to review')
    } catch (error) {
      console.error('[ReviewsManager] Failed to reply to review:', error)
      throw new Error(`Failed to reply to review: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Update a Review Reply
  public async updateReviewReply(reviewName: string, replyRequest: ReviewReplyRequest): Promise<void> {
    try {
      const accessToken = await this.authService.getValidAccessToken()
      
      console.log('[ReviewsManager] Updating review reply:', reviewName)
      
      const response = await fetch(`${this.baseUrl}/${reviewName}/reply`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(replyRequest),
      })

      if (!response.ok) {
        throw new Error(`Failed to update review reply: ${response.status} ${response.statusText}`)
      }

      console.log('[ReviewsManager] Successfully updated review reply')
    } catch (error) {
      console.error('[ReviewsManager] Failed to update review reply:', error)
      throw new Error(`Failed to update review reply: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Delete a Review Reply
  public async deleteReviewReply(reviewName: string): Promise<void> {
    try {
      const accessToken = await this.authService.getValidAccessToken()
      
      console.log('[ReviewsManager] Deleting review reply:', reviewName)
      
      const response = await fetch(`${this.baseUrl}/${reviewName}/reply`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to delete review reply: ${response.status} ${response.statusText}`)
      }

      console.log('[ReviewsManager] Successfully deleted review reply')
    } catch (error) {
      console.error('[ReviewsManager] Failed to delete review reply:', error)
      throw new Error(`Failed to delete review reply: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Generate Review Summary
  public generateReviewSummary(reviews: Review[]): ReviewSummary {
    const totalReviews = reviews.length
    
    if (totalReviews === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { five: 0, four: 0, three: 0, two: 0, one: 0 },
        recentReviews: [],
        unrepliedReviews: []
      }
    }

    // Calculate rating distribution
    const ratingDistribution = {
      five: reviews.filter(r => r.starRating === 'FIVE').length,
      four: reviews.filter(r => r.starRating === 'FOUR').length,
      three: reviews.filter(r => r.starRating === 'THREE').length,
      two: reviews.filter(r => r.starRating === 'TWO').length,
      one: reviews.filter(r => r.starRating === 'ONE').length
    }

    // Calculate average rating
    const ratingValues = {
      'FIVE': 5,
      'FOUR': 4,
      'THREE': 3,
      'TWO': 2,
      'ONE': 1
    }
    
    const totalRatingPoints = reviews.reduce((sum, review) => {
      return sum + ratingValues[review.starRating]
    }, 0)
    
    const averageRating = Math.round((totalRatingPoints / totalReviews) * 10) / 10

    // Get recent reviews (last 10)
    const recentReviews = reviews
      .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
      .slice(0, 10)

    // Get unreplied reviews
    const unrepliedReviews = reviews.filter(review => !review.reviewReply)

    return {
      totalReviews,
      averageRating,
      ratingDistribution,
      recentReviews,
      unrepliedReviews
    }
  }

  // Utility Methods
  public getStarRatingNumber(starRating: string): number {
    switch (starRating) {
      case 'FIVE': return 5
      case 'FOUR': return 4
      case 'THREE': return 3
      case 'TWO': return 2
      case 'ONE': return 1
      default: return 0
    }
  }

  public getStarRatingFromNumber(rating: number): string {
    if (rating >= 5) return 'FIVE'
    if (rating >= 4) return 'FOUR'
    if (rating >= 3) return 'THREE'
    if (rating >= 2) return 'TWO'
    return 'ONE'
  }

  public formatReviewDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Unknown date'
    }
  }

  public formatReviewDateTime(dateString: string): string {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return 'Unknown date'
    }
  }

  public getReviewerDisplayName(reviewer: Review['reviewer']): string {
    if (reviewer.isAnonymous) {
      return 'Anonymous'
    }
    return reviewer.displayName || 'Unknown Reviewer'
  }

  public getReviewSentiment(starRating: string): 'positive' | 'neutral' | 'negative' {
    const rating = this.getStarRatingNumber(starRating)
    if (rating >= 4) return 'positive'
    if (rating >= 3) return 'neutral'
    return 'negative'
  }

  public getSentimentColor(sentiment: 'positive' | 'neutral' | 'negative'): string {
    switch (sentiment) {
      case 'positive': return 'text-green-600'
      case 'neutral': return 'text-yellow-600'
      case 'negative': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  public truncateComment(comment: string, maxLength: number = 150): string {
    if (comment.length <= maxLength) return comment
    return comment.slice(0, maxLength) + '...'
  }

  // Filter and Search Methods
  public filterReviewsByRating(reviews: Review[], minRating: number, maxRating: number = 5): Review[] {
    return reviews.filter(review => {
      const rating = this.getStarRatingNumber(review.starRating)
      return rating >= minRating && rating <= maxRating
    })
  }

  public filterReviewsByDateRange(reviews: Review[], startDate: Date, endDate: Date): Review[] {
    return reviews.filter(review => {
      const reviewDate = new Date(review.createTime)
      return reviewDate >= startDate && reviewDate <= endDate
    })
  }

  public searchReviews(reviews: Review[], query: string): Review[] {
    const lowercaseQuery = query.toLowerCase().trim()
    
    if (!lowercaseQuery) {
      return reviews
    }

    return reviews.filter(review => 
      review.comment.toLowerCase().includes(lowercaseQuery) ||
      this.getReviewerDisplayName(review.reviewer).toLowerCase().includes(lowercaseQuery) ||
      (review.reviewReply?.comment.toLowerCase().includes(lowercaseQuery))
    )
  }

  public sortReviews(reviews: Review[], sortBy: 'date' | 'rating', order: 'asc' | 'desc' = 'desc'): Review[] {
    return [...reviews].sort((a, b) => {
      let comparison = 0
      
      if (sortBy === 'date') {
        const dateA = new Date(a.createTime).getTime()
        const dateB = new Date(b.createTime).getTime()
        comparison = dateA - dateB
      } else if (sortBy === 'rating') {
        const ratingA = this.getStarRatingNumber(a.starRating)
        const ratingB = this.getStarRatingNumber(b.starRating)
        comparison = ratingA - ratingB
      }
      
      return order === 'desc' ? -comparison : comparison
    })
  }

  // Analytics Methods
  public getReviewTrends(reviews: Review[], days: number = 30): {
    period: string
    totalReviews: number
    averageRating: number
    positiveReviews: number
    negativeReviews: number
  }[] {
    const now = new Date()
    const trends: any[] = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0]
      
      const dayReviews = reviews.filter(review => {
        const reviewDate = new Date(review.createTime).toISOString().split('T')[0]
        return reviewDate === dateString
      })
      
      const summary = this.generateReviewSummary(dayReviews)
      const positiveReviews = dayReviews.filter(r => this.getReviewSentiment(r.starRating) === 'positive').length
      const negativeReviews = dayReviews.filter(r => this.getReviewSentiment(r.starRating) === 'negative').length
      
      trends.push({
        period: dateString,
        totalReviews: summary.totalReviews,
        averageRating: summary.averageRating,
        positiveReviews,
        negativeReviews
      })
    }
    
    return trends
  }

  // Validation Methods
  public validateReplyComment(comment: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (!comment.trim()) {
      errors.push('Reply comment cannot be empty')
    }
    
    if (comment.length > 4096) {
      errors.push('Reply comment cannot exceed 4096 characters')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Test API Access
  public async testReviewsAccess(locationName: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.getReviews(locationName)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
} 