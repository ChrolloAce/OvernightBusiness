import { GoogleAuthService } from './google-auth'

export interface BusinessLocation {
  name: string
  locationName?: string
  title?: string
  displayName?: string
  primaryPhone?: string
  websiteUri?: string
  regularHours?: {
    periods: Array<{
      openDay: string
      openTime: string
      closeDay: string
      closeTime: string
    }>
  }
  address?: {
    addressLines: string[]
    locality: string
    administrativeArea: string
    postalCode: string
    regionCode: string
  }
  storefrontAddress?: {
    addressLines: string[]
    locality: string
    administrativeArea: string
    postalCode: string
    regionCode: string
  }
  primaryCategory?: {
    categoryId: string
    displayName: string
  }
  metadata?: {
    mapsUri: string
    newReviewUri: string
  }
  serviceArea?: {
    businessType: string
    places?: {
      placeInfos: Array<{
        name: string
        placeId: string
      }>
    }
  }
  labels?: string[]
  latlng?: {
    latitude: number
    longitude: number
  }
  openInfo?: {
    status: string
    canReopen: boolean
  }
  locationState?: {
    isGoogleUpdated: boolean
    isDuplicate: boolean
    isSuspended: boolean
    canUpdate: boolean
    canDelete: boolean
    isVerified: boolean
    needsReverification: boolean
  }
  attributes?: Array<{
    attributeId: string
    valueType: string
    values: any[]
  }>
  // Additional computed fields for easier access
  rating?: number
  reviewCount?: number
  totalReviews?: number
}

export interface BusinessAccount {
  name: string
  accountName?: string
  type?: string
  role?: string
  state?: {
    status: string
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
  // Updated to use the correct Google Business Profile API endpoints
  private accountsBaseUrl = 'https://mybusinessaccountmanagement.googleapis.com/v1'
  private businessInfoBaseUrl = 'https://mybusinessbusinessinformation.googleapis.com/v1'
  private postsBaseUrl = 'https://mybusiness.googleapis.com/v4'

  constructor() {
    this.authService = GoogleAuthService.getInstance()
  }

  // Enhanced error handling with detailed logging
  private async handleApiResponse(response: Response, operation: string): Promise<any> {
    const responseText = await response.text()
    
    console.log(`[Google Business API] ${operation} - Status:`, response.status)
    console.log(`[Google Business API] ${operation} - Response:`, responseText)
    
    if (!response.ok) {
      let errorMessage = `Failed to ${operation.toLowerCase()}: ${response.status} ${response.statusText}`
      
      try {
        const errorData = JSON.parse(responseText)
        if (errorData.error) {
          errorMessage = `${errorMessage} - ${errorData.error.message || errorData.error}`
          
          // Provide specific guidance for common errors
          if (errorData.error.code === 403) {
            errorMessage += '\n\nThis usually means:\n1. The API is not enabled in Google Cloud Console\n2. You don\'t have permission to access this business account\n3. The business profile doesn\'t exist or isn\'t verified'
          } else if (errorData.error.code === 404) {
            errorMessage += '\n\nThis usually means:\n1. The business account or location doesn\'t exist\n2. You don\'t have access to this resource\n3. The resource ID is incorrect'
          } else if (errorData.error.code === 401) {
            errorMessage += '\n\nThis usually means:\n1. Your access token has expired\n2. You don\'t have the required OAuth scopes\n3. Authentication failed'
          }
        }
      } catch (e) {
        // If response is not JSON, use the raw text
        errorMessage += ` - ${responseText}`
      }
      
      throw new Error(errorMessage)
    }

    try {
      return JSON.parse(responseText)
    } catch (e) {
      console.warn(`[Google Business API] ${operation} - Response is not valid JSON:`, responseText)
      return { rawResponse: responseText }
    }
  }

  // Get all business accounts using the correct endpoint
  async getAccounts(): Promise<BusinessAccount[]> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching accounts...')
    
    const response = await fetch(`${this.accountsBaseUrl}/accounts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await this.handleApiResponse(response, 'Fetch Accounts')
    return data.accounts || []
  }

  // Get all locations for an account using the correct endpoint
  async getLocations(accountName: string): Promise<BusinessLocation[]> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching locations for account:', accountName)
    
    // The API requires a read_mask parameter - use basic fields
    const readMask = 'name,title,storefrontAddress,websiteUri,primaryPhone,primaryCategory'
    
    // Use the business information API for locations
    const response = await fetch(`${this.businessInfoBaseUrl}/${accountName}/locations?readMask=${readMask}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await this.handleApiResponse(response, 'Fetch Locations')
    return data.locations || []
  }

  // Alternative method to get locations with different parameters
  async getLocationsWithReadMask(accountName: string): Promise<BusinessLocation[]> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching locations with comprehensive read mask for account:', accountName)
    
    // Use comprehensive read mask with correct field names
    const readMask = 'name,title,storefrontAddress,websiteUri,primaryPhone,primaryCategory,regularHours,metadata'
    
    const response = await fetch(`${this.businessInfoBaseUrl}/${accountName}/locations?readMask=${readMask}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await this.handleApiResponse(response, 'Fetch Locations with Comprehensive Read Mask')
    return data.locations || []
  }

  // Get locations with minimal fields for testing
  async getLocationsMinimal(accountName: string): Promise<BusinessLocation[]> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching locations with minimal read mask for account:', accountName)
    
    // Use minimal read mask to test basic connectivity
    const readMask = 'name,title'
    
    const response = await fetch(`${this.businessInfoBaseUrl}/${accountName}/locations?readMask=${readMask}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await this.handleApiResponse(response, 'Fetch Locations with Minimal Read Mask')
    return data.locations || []
  }

  // Get a specific location
  async getLocation(locationName: string): Promise<BusinessLocation> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching location:', locationName)
    
    const response = await fetch(`${this.businessInfoBaseUrl}/${locationName}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    return await this.handleApiResponse(response, 'Fetch Location')
  }

  // Test API connectivity and permissions
  async testApiAccess(): Promise<{ accounts: boolean; locations: boolean; errors: string[] }> {
    const errors: string[] = []
    let accountsWorking = false
    let locationsWorking = false

    try {
      console.log('[Google Business API] Testing API access...')
      
      // Test accounts endpoint
      try {
        const accounts = await this.getAccounts()
        accountsWorking = true
        console.log('[Google Business API] Accounts API working, found:', accounts.length, 'accounts')
        
        // Test locations endpoint if we have accounts
        if (accounts.length > 0) {
          const accountName = accounts[0].name
          
          // Try minimal locations method first
          try {
            const locationsMinimal = await this.getLocationsMinimal(accountName)
            locationsWorking = true
            console.log('[Google Business API] Minimal Locations API working, found:', locationsMinimal.length, 'locations')
          } catch (error) {
            errors.push(`Minimal Locations API failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
            
            // Try standard locations method
            try {
              const locations = await this.getLocations(accountName)
              locationsWorking = true
              console.log('[Google Business API] Standard Locations API working, found:', locations.length, 'locations')
            } catch (standardError) {
              errors.push(`Standard Locations API failed: ${standardError instanceof Error ? standardError.message : 'Unknown error'}`)
              
              // Try comprehensive locations method as last resort
              try {
                const locationsComprehensive = await this.getLocationsWithReadMask(accountName)
                locationsWorking = true
                console.log('[Google Business API] Comprehensive Locations API working, found:', locationsComprehensive.length, 'locations')
              } catch (comprehensiveError) {
                errors.push(`Comprehensive Locations API also failed: ${comprehensiveError instanceof Error ? comprehensiveError.message : 'Unknown error'}`)
              }
            }
          }
        } else {
          errors.push('No business accounts found - make sure you have Google Business Profile accounts set up')
        }
      } catch (error) {
        errors.push(`Accounts API failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    } catch (error) {
      errors.push(`General API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    return {
      accounts: accountsWorking,
      locations: locationsWorking,
      errors
    }
  }

  // Update a location
  async updateLocation(locationName: string, location: Partial<BusinessLocation>): Promise<BusinessLocation> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Updating location:', locationName)
    
    const response = await fetch(`${this.businessInfoBaseUrl}/${locationName}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location),
    })

    return await this.handleApiResponse(response, 'Update Location')
  }

  // Create a new post
  async createPost(locationName: string, post: Partial<BusinessPost>): Promise<BusinessPost> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Creating post for location:', locationName)
    
    const response = await fetch(`${this.postsBaseUrl}/${locationName}/localPosts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(post),
    })

    return await this.handleApiResponse(response, 'Create Post')
  }

  // Get posts for a location
  async getPosts(locationName: string): Promise<BusinessPost[]> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching posts for location:', locationName)
    
    const response = await fetch(`${this.postsBaseUrl}/${locationName}/localPosts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await this.handleApiResponse(response, 'Fetch Posts')
    return data.localPosts || []
  }

  // Get reviews for a location
  async getReviews(locationName: string): Promise<any[]> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching reviews for location:', locationName)
    
    const response = await fetch(`${this.businessInfoBaseUrl}/${locationName}/reviews`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await this.handleApiResponse(response, 'Fetch Reviews')
    return data.reviews || []
  }

  // Reply to a review
  async replyToReview(reviewName: string, reply: string): Promise<any> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Replying to review:', reviewName)
    
    const response = await fetch(`${this.businessInfoBaseUrl}/${reviewName}/reply`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        comment: reply
      }),
    })

    return await this.handleApiResponse(response, 'Reply to Review')
  }

  // Get insights for a location
  async getInsights(locationName: string, startDate: string, endDate: string): Promise<any> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching insights for location:', locationName)
    
    const response = await fetch(`${this.businessInfoBaseUrl}/${locationName}/reportInsights`, {
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

    return await this.handleApiResponse(response, 'Fetch Insights')
  }

  // Get complete location details with all available information
  async getLocationDetails(locationName: string): Promise<BusinessLocation> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching complete location details:', locationName)
    
    // Use comprehensive read mask to get all available fields
    const readMask = 'name,title,storefrontAddress,websiteUri,primaryPhone,primaryCategory,regularHours,metadata,serviceArea,labels,adWordsLocationExtensions,latlng,openInfo,locationState,attributes'
    
    const response = await fetch(`${this.businessInfoBaseUrl}/${locationName}?readMask=${readMask}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    return await this.handleApiResponse(response, 'Fetch Complete Location Details')
  }

  // Get all locations with complete details
  async getLocationsWithCompleteDetails(accountName: string): Promise<BusinessLocation[]> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching locations with complete details for account:', accountName)
    
    // Use comprehensive read mask to get all available business information
    const readMask = 'name,title,storefrontAddress,websiteUri,primaryPhone,primaryCategory,regularHours,metadata,serviceArea,labels,adWordsLocationExtensions,latlng,openInfo,locationState,attributes'
    
    const response = await fetch(`${this.businessInfoBaseUrl}/${accountName}/locations?readMask=${readMask}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await this.handleApiResponse(response, 'Fetch Locations with Complete Details')
    return data.locations || []
  }
} 