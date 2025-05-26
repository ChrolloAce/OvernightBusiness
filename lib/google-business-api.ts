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

export interface BusinessReview {
  name: string
  reviewId: string
  reviewer: {
    profilePhotoUrl?: string
    displayName?: string
    isAnonymous?: boolean
  }
  starRating: {
    value: number
  }
  comment?: string
  createTime: string
  updateTime: string
  reviewReply?: {
    comment: string
    updateTime: string
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
  private v4BaseUrl = 'https://mybusiness.googleapis.com/v4' // For reviews and other v4 endpoints

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
          errorMessage = `${errorData.error.message || errorData.error}`
          
          // Provide specific guidance for common errors
          if (errorData.error.code === 403) {
            errorMessage += '\n\n🔧 This usually means:\n1. The API is not enabled in Google Cloud Console\n2. You don\'t have permission to access this business account\n3. The business profile doesn\'t exist or isn\'t verified\n4. Your account type might not support business locations'
          } else if (errorData.error.code === 404) {
            errorMessage += '\n\n🔧 This usually means:\n1. The business account or location doesn\'t exist\n2. You don\'t have access to this resource\n3. The resource ID is incorrect'
          } else if (errorData.error.code === 401) {
            errorMessage += '\n\n🔧 This usually means:\n1. Your access token has expired\n2. You don\'t have the required OAuth scopes\n3. Authentication failed'
          } else if (errorData.error.code === 400) {
            if (errorData.error.message?.includes('read_mask')) {
              errorMessage += '\n\n🔧 Read mask error - this usually means:\n1. Invalid field names in the read_mask parameter\n2. The API endpoint doesn\'t support the requested fields\n3. Your account might not have business locations set up'
            } else if (errorData.error.message?.includes('invalid argument')) {
              errorMessage += '\n\n🔧 Invalid argument error - this usually means:\n1. The account might be a personal account without business locations\n2. Required parameters are missing or incorrect\n3. The account needs to be verified for business use'
            }
          }
          
          // Add details about field violations if available
          if (errorData.error.details) {
            errorData.error.details.forEach((detail: any) => {
              if (detail.fieldViolations) {
                detail.fieldViolations.forEach((violation: any) => {
                  errorMessage += `\n- Field "${violation.field}": ${violation.description}`
                })
              }
            })
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
    
    // Use correct field names based on Business Information API documentation
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
    
    // Use comprehensive read mask with correct field names from Business Information API
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
    
    // Use minimal read mask to test basic connectivity - only essential fields
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
    
    // Use comprehensive read mask for single location
    const readMask = 'name,title,storefrontAddress,websiteUri,primaryPhone,primaryCategory,regularHours,metadata'
    
    const response = await fetch(`${this.businessInfoBaseUrl}/${locationName}?readMask=${readMask}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    return await this.handleApiResponse(response, 'Fetch Location')
  }

  // Get reviews for a location using the v4 API
  async getReviews(locationName: string): Promise<BusinessReview[]> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching reviews for location:', locationName)
    
    // Use the v4 API for reviews
    const response = await fetch(`${this.v4BaseUrl}/${locationName}/reviews`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await this.handleApiResponse(response, 'Fetch Reviews')
    return data.reviews || []
  }

  // Get reviews with pagination and additional options
  async getReviewsWithOptions(locationName: string, options: {
    pageSize?: number
    pageToken?: string
    orderBy?: string
  } = {}): Promise<{
    reviews: BusinessReview[]
    averageRating: number
    totalReviewCount: number
    nextPageToken?: string
  }> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching reviews with options for location:', locationName)
    
    // Build query parameters
    const params = new URLSearchParams()
    if (options.pageSize) params.append('pageSize', options.pageSize.toString())
    if (options.pageToken) params.append('pageToken', options.pageToken)
    if (options.orderBy) params.append('orderBy', options.orderBy)
    
    const queryString = params.toString() ? `?${params.toString()}` : ''
    
    // Use the v4 API for reviews
    const response = await fetch(`${this.v4BaseUrl}/${locationName}/reviews${queryString}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await this.handleApiResponse(response, 'Fetch Reviews with Options')
    return {
      reviews: data.reviews || [],
      averageRating: data.averageRating || 0,
      totalReviewCount: data.totalReviewCount || 0,
      nextPageToken: data.nextPageToken
    }
  }

  // Test API connectivity and permissions
  async testApiAccess(): Promise<{ accounts: boolean; locations: boolean; reviews: boolean; errors: string[] }> {
    const errors: string[] = []
    let accountsWorking = false
    let locationsWorking = false
    let reviewsWorking = false

    try {
      console.log('[Google Business API] Testing API access...')
      
      // Test accounts endpoint
      try {
        const accounts = await this.getAccounts()
        accountsWorking = true
        console.log('[Google Business API] Accounts API working, found:', accounts.length, 'accounts')
        
        // Test each account's business capabilities
        if (accounts.length > 0) {
          for (const account of accounts) {
            console.log(`[Google Business API] Checking account: ${account.accountName} (${account.type})`)
            
            const capabilities = await this.checkAccountBusinessCapabilities(account.name)
            console.log('[Google Business API] Account capabilities:', capabilities)
            
            if (capabilities.canManageLocations) {
              // Try to get locations for this account
              try {
                const locations = await this.getLocationsMinimal(account.name)
                locationsWorking = true
                console.log('[Google Business API] Locations API working, found:', locations.length, 'locations')
                
                // Test reviews endpoint if we have locations
                if (locations.length > 0) {
                  const locationName = locations[0].name
                  try {
                    const reviews = await this.getReviews(locationName)
                    reviewsWorking = true
                    console.log('[Google Business API] Reviews API working, found:', reviews.length, 'reviews')
                  } catch (reviewError) {
                    errors.push(`Reviews API failed: ${reviewError instanceof Error ? reviewError.message : 'Unknown error'}`)
                  }
                } else {
                  errors.push(`No business locations found in account "${account.accountName}". This account may not have any business profiles set up.`)
                }
                break // Found a working account, no need to test others
              } catch (locationError) {
                errors.push(`Locations API failed for account "${account.accountName}": ${locationError instanceof Error ? locationError.message : 'Unknown error'}`)
              }
            } else {
              errors.push(`Account "${account.accountName}" (${capabilities.accountType}, ${capabilities.verificationState}) cannot manage business locations: ${capabilities.errorMessage || 'Unknown reason'}`)
            }
          }
          
          if (!locationsWorking) {
            errors.push('None of your Google accounts have business locations. To use this feature:\n1. Set up a Google Business Profile at https://business.google.com\n2. Add and verify your business locations\n3. Make sure your account type supports business management')
          }
        } else {
          errors.push('No Google Business accounts found - make sure you have Google Business Profile accounts set up')
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
      reviews: reviewsWorking,
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
    
    const response = await fetch(`${this.v4BaseUrl}/${locationName}/localPosts`, {
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
    
    const response = await fetch(`${this.v4BaseUrl}/${locationName}/localPosts`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await this.handleApiResponse(response, 'Fetch Posts')
    return data.localPosts || []
  }

  // Reply to a review
  async replyToReview(reviewName: string, reply: string): Promise<any> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Replying to review:', reviewName)
    
    const response = await fetch(`${this.v4BaseUrl}/${reviewName}/reply`, {
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
    
    const response = await fetch(`${this.v4BaseUrl}/${locationName}/reportInsights`, {
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
    
    // Use comprehensive read mask with correct field names from Business Information API
    const readMask = 'name,title,storefrontAddress,websiteUri,primaryPhone,primaryCategory,regularHours,metadata,serviceArea,labels,latlng,openInfo,locationState,attributes'
    
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
    
    // Use comprehensive read mask with correct field names from Business Information API
    const readMask = 'name,title,storefrontAddress,websiteUri,primaryPhone,primaryCategory,regularHours,metadata,serviceArea,labels,latlng,openInfo,locationState,attributes'
    
    const response = await fetch(`${this.businessInfoBaseUrl}/${accountName}/locations?readMask=${readMask}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await this.handleApiResponse(response, 'Fetch Locations with Complete Details')
    return data.locations || []
  }

  // Get comprehensive business data including reviews and ratings
  async getCompleteBusinessData(locationName: string): Promise<{
    location: BusinessLocation;
    reviews: BusinessReview[];
    rating: number;
    reviewCount: number;
    totalReviews: number;
  }> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching comprehensive business data for:', locationName)
    
    try {
      // Fetch location details
      const locationDetails = await this.getLocationDetails(locationName)
      
      // Fetch reviews with comprehensive data
      let reviewsData = {
        reviews: [] as BusinessReview[],
        averageRating: 0,
        totalReviewCount: 0
      }
      
      try {
        console.log('[Google Business API] Fetching reviews for location:', locationName)
        reviewsData = await this.getReviewsWithOptions(locationName, {
          pageSize: 50, // Get up to 50 reviews
          orderBy: 'updateTime desc' // Get most recent reviews first
        })
        
        console.log('[Google Business API] Reviews data:', {
          reviewsFound: reviewsData.reviews.length,
          averageRating: reviewsData.averageRating,
          totalReviewCount: reviewsData.totalReviewCount
        })
      } catch (reviewError) {
        console.warn('[Google Business API] Failed to fetch reviews:', reviewError)
        // Continue without reviews data
      }
      
      return {
        location: locationDetails,
        reviews: reviewsData.reviews,
        rating: reviewsData.averageRating,
        reviewCount: reviewsData.reviews.length,
        totalReviews: reviewsData.totalReviewCount
      }
    } catch (error) {
      console.error('[Google Business API] Failed to fetch comprehensive business data:', error)
      throw error
    }
  }

  // Enhanced method to get locations with real-time data
  async getLocationsWithRealTimeData(accountName: string): Promise<any[]> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching locations with real-time data for account:', accountName)
    
    try {
      // First get basic locations
      const locations = await this.getLocationsMinimal(accountName)
      
      // Then enhance each location with comprehensive data
      const enhancedLocations = await Promise.all(
        locations.map(async (location) => {
          try {
            const comprehensiveData = await this.getCompleteBusinessData(location.name)
            
            return {
              ...location,
              ...comprehensiveData.location,
              rating: comprehensiveData.rating,
              reviewCount: comprehensiveData.reviewCount,
              totalReviews: comprehensiveData.totalReviews,
              reviews: comprehensiveData.reviews,
              // Add computed fields
              hasReviews: comprehensiveData.reviews.length > 0,
              isVerified: comprehensiveData.location.locationState?.isVerified || false,
              lastFetched: new Date().toISOString()
            }
          } catch (error) {
            console.warn('[Google Business API] Failed to enhance location data for:', location.name, error)
            // Return basic location data if enhancement fails
            return {
              ...location,
              rating: 0,
              reviewCount: 0,
              totalReviews: 0,
              reviews: [],
              hasReviews: false,
              isVerified: false,
              lastFetched: new Date().toISOString()
            }
          }
        })
      )
      
      console.log('[Google Business API] Enhanced', enhancedLocations.length, 'locations with real-time data')
      return enhancedLocations
    } catch (error) {
      console.error('[Google Business API] Failed to fetch locations with real-time data:', error)
      throw error
    }
  }

  // Check if an account has business capabilities
  async checkAccountBusinessCapabilities(accountName: string): Promise<{
    hasBusinessLocations: boolean;
    accountType: string;
    verificationState: string;
    canManageLocations: boolean;
    errorMessage?: string;
  }> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Checking business capabilities for account:', accountName)
    
    try {
      // First, get account details
      const accountResponse = await fetch(`${this.accountsBaseUrl}/${accountName}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      
      const accountData = await this.handleApiResponse(accountResponse, 'Check Account Details')
      
      console.log('[Google Business API] Account details:', accountData)
      
      // Try to fetch locations with minimal read mask
      try {
        const locationsResponse = await fetch(`${this.businessInfoBaseUrl}/${accountName}/locations?readMask=name`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (locationsResponse.ok) {
          const locationsData = await locationsResponse.json()
          return {
            hasBusinessLocations: (locationsData.locations?.length || 0) > 0,
            accountType: accountData.type || 'UNKNOWN',
            verificationState: accountData.verificationState || 'UNKNOWN',
            canManageLocations: true
          }
        } else {
          const errorText = await locationsResponse.text()
          console.log('[Google Business API] Locations check failed:', errorText)
          
          return {
            hasBusinessLocations: false,
            accountType: accountData.type || 'UNKNOWN',
            verificationState: accountData.verificationState || 'UNKNOWN',
            canManageLocations: false,
            errorMessage: `Cannot access business locations: ${errorText}`
          }
        }
      } catch (locationError) {
        return {
          hasBusinessLocations: false,
          accountType: accountData.type || 'UNKNOWN',
          verificationState: accountData.verificationState || 'UNKNOWN',
          canManageLocations: false,
          errorMessage: `Location access error: ${locationError instanceof Error ? locationError.message : 'Unknown error'}`
        }
      }
    } catch (error) {
      return {
        hasBusinessLocations: false,
        accountType: 'UNKNOWN',
        verificationState: 'UNKNOWN',
        canManageLocations: false,
        errorMessage: `Account check failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
} 