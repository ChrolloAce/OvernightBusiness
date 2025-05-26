import { GoogleAuthService } from './google-auth'

export interface BusinessLocation {
  name: string
  locationName: string
  primaryPhone: string
  websiteUri: string
  regularHours: {
    periods: Array<{
      openDay: string
      openTime: string
      closeDay: string
      closeTime: string
    }>
  }
  address: {
    addressLines: string[]
    locality: string
    administrativeArea: string
    postalCode: string
    regionCode: string
  }
  primaryCategory: {
    categoryId: string
    displayName: string
  }
  metadata: {
    mapsUri: string
    newReviewUri: string
  }
}

export interface BusinessPost {
  name: string
  languageCode: string
  summary: string
  callToAction: {
    actionType: string
    url: string
  }
  media: Array<{
    mediaFormat: string
    sourceUrl: string
  }>
  topicType: string
  createTime: string
  updateTime: string
  searchUrl: string
}

export class GoogleBusinessAPI {
  private authService: GoogleAuthService
  private baseUrl = 'https://mybusinessbusinessinformation.googleapis.com/v1'
  private postsBaseUrl = 'https://mybusiness.googleapis.com/v4'

  constructor() {
    this.authService = GoogleAuthService.getInstance()
  }

  // Get all business accounts
  async getAccounts(): Promise<any[]> {
    const accessToken = await this.authService.getValidAccessToken()
    
    const response = await fetch(`${this.baseUrl}/accounts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch accounts: ${response.statusText}`)
    }

    const data = await response.json()
    return data.accounts || []
  }

  // Get all locations for an account
  async getLocations(accountName: string): Promise<BusinessLocation[]> {
    const accessToken = await this.authService.getValidAccessToken()
    
    const response = await fetch(`${this.baseUrl}/${accountName}/locations`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch locations: ${response.statusText}`)
    }

    const data = await response.json()
    return data.locations || []
  }

  // Get a specific location
  async getLocation(locationName: string): Promise<BusinessLocation> {
    const accessToken = await this.authService.getValidAccessToken()
    
    const response = await fetch(`${this.baseUrl}/${locationName}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch location: ${response.statusText}`)
    }

    return await response.json()
  }

  // Update a location
  async updateLocation(locationName: string, location: Partial<BusinessLocation>): Promise<BusinessLocation> {
    const accessToken = await this.authService.getValidAccessToken()
    
    const response = await fetch(`${this.baseUrl}/${locationName}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    })

    if (!response.ok) {
      throw new Error(`Failed to update location: ${response.statusText}`)
    }

    return await response.json()
  }

  // Create a new post
  async createPost(locationName: string, post: Partial<BusinessPost>): Promise<BusinessPost> {
    const accessToken = await this.authService.getValidAccessToken()
    
    const response = await fetch(`${this.postsBaseUrl}/${locationName}/localPosts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    })

    if (!response.ok) {
      throw new Error(`Failed to create post: ${response.statusText}`)
    }

    return await response.json()
  }

  // Get posts for a location
  async getPosts(locationName: string): Promise<BusinessPost[]> {
    const accessToken = await this.authService.getValidAccessToken()
    
    const response = await fetch(`${this.postsBaseUrl}/${locationName}/localPosts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`)
    }

    const data = await response.json()
    return data.localPosts || []
  }

  // Get reviews for a location
  async getReviews(locationName: string): Promise<any[]> {
    const accessToken = await this.authService.getValidAccessToken()
    
    const response = await fetch(`${this.baseUrl}/${locationName}/reviews`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch reviews: ${response.statusText}`)
    }

    const data = await response.json()
    return data.reviews || []
  }

  // Reply to a review
  async replyToReview(reviewName: string, reply: string): Promise<any> {
    const accessToken = await this.authService.getValidAccessToken()
    
    const response = await fetch(`${this.baseUrl}/${reviewName}/reply`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: reply
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to reply to review: ${response.statusText}`)
    }

    return await response.json()
  }

  // Get insights for a location
  async getInsights(locationName: string, startDate: string, endDate: string): Promise<any> {
    const accessToken = await this.authService.getValidAccessToken()
    
    const response = await fetch(`${this.baseUrl}/${locationName}/reportInsights`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationNames: [locationName],
        basicRequest: {
          metricRequests: [
            { metric: 'QUERIES_DIRECT' },
            { metric: 'QUERIES_INDIRECT' },
            { metric: 'VIEWS_MAPS' },
            { metric: 'VIEWS_SEARCH' },
            { metric: 'ACTIONS_WEBSITE' },
            { metric: 'ACTIONS_PHONE' },
            { metric: 'ACTIONS_DRIVING_DIRECTIONS' }
          ],
          timeRange: {
            startTime: startDate,
            endTime: endDate
          }
        }
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch insights: ${response.statusText}`)
    }

    return await response.json()
  }
} 