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
      openTime: string | { hours: number; minutes?: number }
      closeDay: string
      closeTime: string | { hours: number; minutes?: number }
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
    serviceTypes?: Array<{
      serviceTypeId: string
      displayName: string
    }>
    moreHoursTypes?: Array<{
      hoursTypeId: string
      displayName: string
      localizedDisplayName: string
    }>
  }
  additionalCategories?: Array<{
    categoryId: string
    displayName: string
  }>
  metadata?: {
    hasGoogleUpdated: boolean
    hasPendingEdits: boolean
    canDelete: boolean
    canOperateLocalPost: boolean
    canModifyServiceList: boolean
    canHaveFoodMenus: boolean
    canOperateHealthData: boolean
    canOperateLodgingData: boolean
    placeId: string
    duplicateLocation?: string
    mapsUri: string
    newReviewUri: string
    canHaveBusinessCalls: boolean
    hasVoiceOfMerchant: boolean
  }
  serviceArea?: {
    businessType: string
    places?: {
      placeInfos: Array<{
        placeName: string
        placeId: string
      }>
    }
    regionCode?: string
  }
  labels?: string[]
  latlng?: {
    latitude: number
    longitude: number
  }
  openInfo?: {
    status: string
    canReopen: boolean
    openingDate?: {
      year: number
      month: number
      day: number
    }
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
  profile?: {
    description: string
  }
  relationshipData?: {
    parentLocation?: {
      placeId: string
      relationType: string
    }
    childrenLocations?: Array<{
      placeId: string
      relationType: string
    }>
    parentChain?: string
  }
  moreHours?: Array<{
    hoursTypeId: string
    periods: Array<{
      openDay: string
      openTime: string | { hours: number; minutes?: number }
      closeDay: string
      closeTime: string | { hours: number; minutes?: number }
    }>
  }>
  serviceItems?: Array<{
    price?: {
      currencyCode: string
      units: string
      nanos: number
    }
    structuredServiceItem?: {
      serviceTypeId: string
      description: string
    }
    freeFormServiceItem?: {
      category: string
      label: {
        displayName: string
        description: string
        languageCode: string
      }
    }
  }>
  adWordsLocationExtensions?: {
    adPhone: string
  }
  // Additional computed fields for easier access
  rating?: number
  reviewCount?: number
  totalReviews?: number
  isOpen?: boolean
  businessType?: string
  isVerified?: boolean
  categories?: {
    primaryCategory?: {
      displayName: string
      serviceTypes?: Array<{
        serviceTypeId: string
        displayName: string
      }>
      moreHoursTypes?: Array<{
        hoursTypeId: string
        displayName: string
        localizedDisplayName: string
      }>
    }
    additionalCategories?: Array<{
      displayName: string
    }>
  }
  phoneNumbers?: {
    primaryPhone?: string
    additionalPhones?: string[]
  }
  languageCode?: string
  storeCode?: string
  specialHours?: {
    specialHourPeriods: Array<{
      startDate: any
      endDate?: any
      openTime?: any
      closeTime?: any
      closed?: boolean
    }>
  }
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

export interface ReviewReply {
  comment: string
  updateTime: string
}

export interface Reviewer {
  profilePhotoUrl?: string
  displayName?: string
  isAnonymous?: boolean
}

export interface BusinessReview {
  name?: string
  reviewId?: string
  reviewer?: Reviewer
  starRating?: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'STAR_RATING_UNSPECIFIED'
  comment?: string
  createTime?: string
  updateTime?: string
  reviewReply?: ReviewReply
}

export interface ReviewsResponse {
  reviews: BusinessReview[]
  totalReviewCount: number
  averageRating: number
  nextPageToken?: string
}

// Performance Analytics Interfaces
export interface DailyMetricTimeSeries {
  dailyMetric: 'BUSINESS_IMPRESSIONS_DESKTOP_MAPS' | 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH' | 'BUSINESS_IMPRESSIONS_MOBILE_MAPS' | 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH' | 'BUSINESS_DIRECTION_REQUESTS' | 'CALL_CLICKS' | 'WEBSITE_CLICKS' | 'BUSINESS_BOOKINGS' | 'BUSINESS_CONVERSATIONS' | 'BUSINESS_FOOD_ORDERS' | 'BUSINESS_FOOD_MENU_CLICKS'
  dailySubEntityType?: {
    timeOfDay?: 'TIME_OF_DAY_UNSPECIFIED' | 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT'
    dayOfWeek?: 'DAY_OF_WEEK_UNSPECIFIED' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'
  }
  timeSeries: {
    datedValues: Array<{
      date: {
        year: number
        month: number
        day: number
      }
      value: string
    }>
  }
}

export interface MultiDailyMetricTimeSeries {
  dailyMetricTimeSeries: DailyMetricTimeSeries[]
}

export interface PerformanceMetricsResponse {
  multiDailyMetricTimeSeries: MultiDailyMetricTimeSeries[]
}

export interface DailyRange {
  start_date: {
    year: number
    month: number
    day: number
  }
  end_date: {
    year: number
    month: number
    day: number
  }
}

// Verification Interfaces
export interface VerificationOption {
  verificationMethod: 'VERIFICATION_METHOD_UNSPECIFIED' | 'ADDRESS' | 'EMAIL' | 'PHONE_CALL' | 'SMS' | 'AUTO' | 'VETTED_PARTNER'
  phoneNumber?: string
  addressData?: {
    businessName: string
    address: {
      addressLines: string[]
      locality: string
      administrativeArea: string
      postalCode: string
      regionCode: string
    }
  }
}

export interface VerificationState {
  method: string
  state: 'STATE_UNSPECIFIED' | 'PENDING' | 'COMPLETED' | 'FAILED'
}

export interface VoiceOfMerchantState {
  hasVoiceOfMerchant: boolean
  hasBusinessAuthority: boolean
  complyWithGuidelines: boolean
  waitingForVoiceOfMerchant: boolean
}

// Media API Interfaces
export interface MediaItem {
  name: string
  mediaFormat: 'PHOTO' | 'VIDEO' | 'MEDIA_FORMAT_UNSPECIFIED'
  locationAssociation?: {
    category?: 'COVER' | 'PROFILE' | 'LOGO' | 'EXTERIOR' | 'INTERIOR' | 'PRODUCT' | 'AT_WORK' | 'FOOD_AND_DRINK' | 'MENU' | 'COMMON_AREA' | 'ROOMS' | 'TEAMS' | 'ADDITIONAL' | 'CATEGORY_UNSPECIFIED'
    priceListItemId?: string
  }
  googleUrl?: string
  thumbnailUrl?: string
  createTime?: string
  dimensions?: {
    widthPixels: number
    heightPixels: number
  }
  insights?: {
    viewCount: string
  }
  attribution?: {
    profileName: string
    profilePhotoUrl: string
    takedownUrl: string
    profileUrl: string
  }
  description?: string
  sourceUrl?: string
  dataRef?: {
    resourceName: string
  }
}

export interface MediaResponse {
  mediaItems: MediaItem[]
  nextPageToken?: string
  totalMediaItemsCount?: number
}

export interface BusinessMedia {
  coverPhoto?: MediaItem
  profilePhoto?: MediaItem
  logoPhoto?: MediaItem
  exteriorPhotos: MediaItem[]
  interiorPhotos: MediaItem[]
  productPhotos: MediaItem[]
  foodAndDrinkPhotos: MediaItem[]
  menuPhotos: MediaItem[]
  teamPhotos: MediaItem[]
  additionalPhotos: MediaItem[]
  allPhotos: MediaItem[]
}

export class GoogleBusinessAPI {
  private authService: GoogleAuthService
  // Updated to use the correct Google Business Profile API endpoints
  private accountsBaseUrl = 'https://mybusinessaccountmanagement.googleapis.com/v1'
  private businessInfoBaseUrl = 'https://mybusinessbusinessinformation.googleapis.com/v1'
  private postsBaseUrl = 'https://mybusiness.googleapis.com/v4'
  private performanceBaseUrl = 'https://businessprofileperformance.googleapis.com/v1'
  private verificationsBaseUrl = 'https://mybusinessverifications.googleapis.com/v1'
  private mediaBaseUrl = 'https://mybusiness.googleapis.com/v4'

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
    
    // The API requires a read_mask parameter - use comprehensive fields
    const readMask = 'name,title,storefrontAddress,websiteUri,primaryPhone,primaryCategory,regularHours,metadata,openInfo,locationState'
    
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
    const readMask = 'name,title,storefrontAddress,websiteUri,primaryPhone,primaryCategory,regularHours,metadata,serviceArea,labels,latlng,openInfo,locationState,attributes'
    
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
  async getReviews(locationName: string): Promise<BusinessReview[]> {
    console.log('[Google Business API] Fetching reviews for location:', locationName)
    
    try {
      const accessToken = await this.authService.getValidAccessToken()
      
      const response = await fetch(`/api/google-business/reviews?locationName=${encodeURIComponent(locationName)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      return data.reviews || []
    } catch (error) {
      console.error('[Google Business API] Failed to fetch reviews:', error)
      throw error
    }
  }

  // Get reviews with pagination
  async getReviewsPaginated(locationName: string, pageSize: number = 50, pageToken?: string): Promise<ReviewsResponse> {
    console.log('[Google Business API] Fetching paginated reviews for location:', locationName)
    
    try {
      const accessToken = await this.authService.getValidAccessToken()
      
      let url = `/api/google-business/reviews?locationName=${encodeURIComponent(locationName)}&pageSize=${pageSize}`
      if (pageToken) {
        url += `&pageToken=${encodeURIComponent(pageToken)}`
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      
      // Calculate average rating and total count
      const reviews = data.reviews || []
      const totalReviewCount = data.totalReviewCount || reviews.length
      const averageRating = this.calculateAverageRating(reviews)
      
      return {
        reviews,
        totalReviewCount,
        averageRating,
        nextPageToken: data.nextPageToken
      }
    } catch (error) {
      console.error('[Google Business API] Failed to fetch paginated reviews:', error)
      throw error
    }
  }

  // Get all reviews for a location (handles pagination automatically)
  async getAllReviews(locationName: string): Promise<ReviewsResponse> {
    let allReviews: BusinessReview[] = []
    let nextPageToken: string | undefined
    let totalReviewCount = 0
    
    do {
      const response = await this.getReviewsPaginated(locationName, 50, nextPageToken)
      allReviews = allReviews.concat(response.reviews)
      nextPageToken = response.nextPageToken
      totalReviewCount = response.totalReviewCount
    } while (nextPageToken)
    
    const averageRating = this.calculateAverageRating(allReviews)
    
    return {
      reviews: allReviews,
      totalReviewCount,
      averageRating,
      nextPageToken: undefined
    }
  }

  // Calculate average rating from reviews
  private calculateAverageRating(reviews: BusinessReview[]): number {
    if (reviews.length === 0) return 0
    
    const ratingValues = {
      'ONE': 1,
      'TWO': 2,
      'THREE': 3,
      'FOUR': 4,
      'FIVE': 5,
      'STAR_RATING_UNSPECIFIED': 0
    }
    
    const totalRating = reviews.reduce((sum, review) => {
      const starRating = review.starRating || 'STAR_RATING_UNSPECIFIED'
      return sum + (ratingValues[starRating as keyof typeof ratingValues] || 0)
    }, 0)
    
    return Math.round((totalRating / reviews.length) * 10) / 10
  }

  // Convert star rating enum to number
  static getStarRatingValue(starRating?: string): number {
    if (!starRating) return 0
    
    const ratingValues = {
      'ONE': 1,
      'TWO': 2,
      'THREE': 3,
      'FOUR': 4,
      'FIVE': 5,
      'STAR_RATING_UNSPECIFIED': 0
    }
    return ratingValues[starRating as keyof typeof ratingValues] || 0
  }

  // Format review date
  static formatReviewDate(dateString?: string): string {
    if (!dateString) return 'Unknown date'
    
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Unknown date'
    }
  }

  // Get review summary for a location
  async getReviewSummary(locationName: string): Promise<{ averageRating: number; totalReviews: number }> {
    try {
      const reviewsData = await this.getReviewsPaginated(locationName, 1) // Just get first page for summary
      return {
        averageRating: reviewsData.averageRating,
        totalReviews: reviewsData.totalReviewCount
      }
    } catch (error) {
      console.warn('[Google Business API] Failed to get review summary:', error)
      return {
        averageRating: 0,
        totalReviews: 0
      }
    }
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

  // Get all locations with complete details
  async getLocationsWithCompleteDetails(accountName: string): Promise<BusinessLocation[]> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching locations with complete details for account:', accountName)
    
    // Use only basic, commonly available fields from the official API documentation
    const readMask = 'name,title,storefrontAddress,websiteUri,phoneNumbers,categories,regularHours'
    
    const response = await fetch(`${this.businessInfoBaseUrl}/${accountName}/locations?readMask=${readMask}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await this.handleApiResponse(response, 'Fetch Locations with Complete Details')
    return data.locations || []
  }

  // Get complete location details with all available information
  async getLocationDetails(locationName: string): Promise<BusinessLocation> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching complete location details:', locationName)
    
    // Use comprehensive read mask to get all available business information
    const readMask = 'name,title,languageCode,storeCode,storefrontAddress,websiteUri,phoneNumbers,categories,regularHours,specialHours,serviceArea,labels,latlng,openInfo,metadata,profile,relationshipData,moreHours,serviceItems'
    
    const response = await fetch(`${this.businessInfoBaseUrl}/${locationName}?readMask=${readMask}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    return await this.handleApiResponse(response, 'Fetch Complete Location Details')
  }

  // Process and enrich business location data
  static enrichLocationData(location: BusinessLocation): BusinessLocation {
    const enriched = { ...location }
    
    // Compute isOpen status
    if (location.openInfo?.status) {
      enriched.isOpen = location.openInfo.status === 'OPEN'
    }
    
    // Extract business type from service area
    if (location.serviceArea?.businessType) {
      enriched.businessType = location.serviceArea.businessType
    }
    
    // Set verification status from location state
    if (location.locationState?.isVerified !== undefined) {
      enriched.isVerified = location.locationState.isVerified
    }
    
    // Extract rating and review count from metadata if available
    // Note: These might come from separate reviews API calls
    
    return enriched
  }

  // Get business hours in a readable format
  static formatBusinessHours(location: BusinessLocation): string[] {
    const hours: string[] = []
    
    if (location.regularHours?.periods) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      
      location.regularHours.periods.forEach(period => {
        let openDay = period.openDay
        let closeDay = period.closeDay
        
        // Convert day names if they're in enum format
        if (openDay === 'MONDAY') openDay = 'Monday'
        else if (openDay === 'TUESDAY') openDay = 'Tuesday'
        else if (openDay === 'WEDNESDAY') openDay = 'Wednesday'
        else if (openDay === 'THURSDAY') openDay = 'Thursday'
        else if (openDay === 'FRIDAY') openDay = 'Friday'
        else if (openDay === 'SATURDAY') openDay = 'Saturday'
        else if (openDay === 'SUNDAY') openDay = 'Sunday'
        
        if (closeDay === 'MONDAY') closeDay = 'Monday'
        else if (closeDay === 'TUESDAY') closeDay = 'Tuesday'
        else if (closeDay === 'WEDNESDAY') closeDay = 'Wednesday'
        else if (closeDay === 'THURSDAY') closeDay = 'Thursday'
        else if (closeDay === 'FRIDAY') closeDay = 'Friday'
        else if (closeDay === 'SATURDAY') closeDay = 'Saturday'
        else if (closeDay === 'SUNDAY') closeDay = 'Sunday'
        
        // Handle time objects properly and prevent [object Object]
        let openTime = period.openTime
        let closeTime = period.closeTime
        
        // If time is an object with hours property, format it
        if (typeof openTime === 'object' && openTime !== null && openTime.hours !== undefined) {
          const hours = openTime.hours
          const minutes = openTime.minutes || 0
          openTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        } else if (typeof openTime === 'object') {
          // Fallback for any other object format
          openTime = 'Open'
        }
        
        if (typeof closeTime === 'object' && closeTime !== null && closeTime.hours !== undefined) {
          const hours = closeTime.hours
          const minutes = closeTime.minutes || 0
          closeTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        } else if (typeof closeTime === 'object') {
          // Fallback for any other object format
          closeTime = 'Close'
        }
        
        // Ensure we have string values
        openTime = String(openTime)
        closeTime = String(closeTime)
        
        if (openDay === closeDay) {
          hours.push(`${openDay}: ${openTime} - ${closeTime}`)
        } else {
          hours.push(`${openDay} ${openTime} - ${closeDay} ${closeTime}`)
        }
      })
    }
    
    return hours
  }

  // Get all categories (primary + additional) - always show all
  static getAllCategories(location: BusinessLocation): string[] {
    const categories: string[] = []
    
    // Handle the new categories structure first
    if (location.categories?.primaryCategory?.displayName) {
      categories.push(location.categories.primaryCategory.displayName)
    }
    
    if (location.categories?.additionalCategories) {
      location.categories.additionalCategories.forEach(cat => {
        if (cat.displayName && !categories.includes(cat.displayName)) {
          categories.push(cat.displayName)
        }
      })
    }
    
    // Fallback to old structure for backward compatibility
    if (location.primaryCategory?.displayName && !categories.includes(location.primaryCategory.displayName)) {
      categories.push(location.primaryCategory.displayName)
    }
    
    if (location.additionalCategories) {
      location.additionalCategories.forEach(cat => {
        if (cat.displayName && !categories.includes(cat.displayName)) {
          categories.push(cat.displayName)
        }
      })
    }
    
    return categories
  }

  // Get formatted address
  static getFormattedAddress(location: BusinessLocation): string {
    const address = location.storefrontAddress || location.address
    if (!address) return 'Address not available'
    
    const parts = []
    if (address.addressLines?.length) {
      parts.push(address.addressLines.join(', '))
    }
    if (address.locality) parts.push(address.locality)
    if (address.administrativeArea) parts.push(address.administrativeArea)
    if (address.postalCode) parts.push(address.postalCode)
    
    return parts.join(', ') || 'Address not available'
  }

  // Get business capabilities
  static getBusinessCapabilities(location: BusinessLocation): string[] {
    const capabilities: string[] = []
    
    if (location.metadata) {
      const meta = location.metadata
      if (meta.canOperateLocalPost) capabilities.push('Local Posts')
      if (meta.canHaveFoodMenus) capabilities.push('Food Menus')
      if (meta.canOperateHealthData) capabilities.push('Health Data')
      if (meta.canOperateLodgingData) capabilities.push('Lodging Data')
      if (meta.canHaveBusinessCalls) capabilities.push('Business Calls')
      if (meta.hasVoiceOfMerchant) capabilities.push('Voice of Merchant')
    }
    
    return capabilities
  }

  // Get primary phone number
  static getPrimaryPhone(location: BusinessLocation): string {
    // Handle the new phoneNumbers structure
    if (location.phoneNumbers?.primaryPhone) {
      return location.phoneNumbers.primaryPhone
    }
    
    // Fallback to old structure for backward compatibility
    if (location.primaryPhone) {
      return location.primaryPhone
    }
    
    return 'Phone not available'
  }

  // Get additional phone numbers
  static getAdditionalPhones(location: BusinessLocation): string[] {
    const phones: string[] = []
    
    // Handle the new phoneNumbers structure
    if (location.phoneNumbers?.additionalPhones) {
      phones.push(...location.phoneNumbers.additionalPhones)
    }
    
    return phones
  }

  // Get service types from primary category
  static getServiceTypes(location: BusinessLocation): Array<{serviceTypeId: string, displayName: string}> {
    const serviceTypes: Array<{serviceTypeId: string, displayName: string}> = []
    
    // Handle the new categories structure
    if (location.categories?.primaryCategory?.serviceTypes) {
      serviceTypes.push(...location.categories.primaryCategory.serviceTypes)
    }
    
    // Fallback to old structure for backward compatibility
    if (location.primaryCategory?.serviceTypes) {
      serviceTypes.push(...location.primaryCategory.serviceTypes)
    }
    
    return serviceTypes
  }

  // Get more hours types available for this business - DON'T USE THIS FOR DISPLAY
  static getMoreHoursTypes(location: BusinessLocation): Array<{hoursTypeId: string, displayName: string, localizedDisplayName: string}> {
    // This method returns available types, not configured ones
    // Use getMoreHours() instead for actual configured hours
    const moreHoursTypes: Array<{hoursTypeId: string, displayName: string, localizedDisplayName: string}> = []
    
    // Handle the new categories structure
    if (location.categories?.primaryCategory?.moreHoursTypes) {
      moreHoursTypes.push(...location.categories.primaryCategory.moreHoursTypes)
    }
    
    return moreHoursTypes
  }

  // Get business language
  static getLanguage(location: BusinessLocation): string {
    return location.languageCode || 'Not specified'
  }

  // Get store code
  static getStoreCode(location: BusinessLocation): string {
    return location.storeCode || 'Not specified'
  }

  // Get business description
  static getBusinessDescription(location: BusinessLocation): string {
    return location.profile?.description || 'No description available'
  }

  // Get opening date
  static getOpeningDate(location: BusinessLocation): string {
    if (location.openInfo?.openingDate) {
      const date = location.openInfo.openingDate
      if (date.year && date.month && date.day) {
        return `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`
      } else if (date.year && date.month) {
        return `${date.year}-${date.month.toString().padStart(2, '0')}`
      } else if (date.year) {
        return date.year.toString()
      }
    }
    return 'Not specified'
  }

  // Get service area information
  static getServiceArea(location: BusinessLocation): {
    businessType?: string
    places?: Array<{placeName: string, placeId: string}>
    regionCode?: string
  } {
    const serviceArea: any = {}
    
    if (location.serviceArea) {
      if (location.serviceArea.businessType) {
        serviceArea.businessType = location.serviceArea.businessType
      }
      if (location.serviceArea.places?.placeInfos) {
        serviceArea.places = location.serviceArea.places.placeInfos
      }
      if (location.serviceArea.regionCode) {
        serviceArea.regionCode = location.serviceArea.regionCode
      }
    }
    
    return serviceArea
  }

  // Get special hours
  static getSpecialHours(location: BusinessLocation): Array<{
    startDate: any
    endDate?: any
    openTime?: any
    closeTime?: any
    closed?: boolean
  }> {
    const specialHours: Array<any> = []
    
    if (location.specialHours?.specialHourPeriods) {
      specialHours.push(...location.specialHours.specialHourPeriods)
    }
    
    return specialHours
  }

  // Get more hours (additional hour types) - only configured ones
  static getMoreHours(location: BusinessLocation): Array<{
    hoursTypeId: string
    displayName?: string
    periods: Array<{
      openDay: string
      openTime: any
      closeDay: string
      closeTime: any
    }>
  }> {
    const moreHours: Array<any> = []
    
    if (location.moreHours) {
      // Only return hours that actually have periods configured
      location.moreHours.forEach(hourType => {
        if (hourType.periods && hourType.periods.length > 0) {
          moreHours.push(hourType)
        }
      })
    }
    
    return moreHours
  }

  // Get service items
  static getServiceItems(location: BusinessLocation): Array<{
    price?: any
    structuredServiceItem?: any
    freeFormServiceItem?: any
  }> {
    const serviceItems: Array<any> = []
    
    if (location.serviceItems) {
      serviceItems.push(...location.serviceItems)
    }
    
    return serviceItems
  }

  // Get relationship data
  static getRelationshipData(location: BusinessLocation): {
    parentLocation?: any
    childrenLocations?: any[]
    parentChain?: string
  } {
    const relationshipData: any = {}
    
    if (location.relationshipData) {
      if (location.relationshipData.parentLocation) {
        relationshipData.parentLocation = location.relationshipData.parentLocation
      }
      if (location.relationshipData.childrenLocations) {
        relationshipData.childrenLocations = location.relationshipData.childrenLocations
      }
      if (location.relationshipData.parentChain) {
        relationshipData.parentChain = location.relationshipData.parentChain
      }
    }
    
    return relationshipData
  }

  // Get business status
  static getBusinessStatus(location: BusinessLocation): {
    status?: string
    canReopen?: boolean
    isOpen?: boolean
  } {
    const openInfo = location.openInfo
    if (!openInfo) return {}

    return {
      status: openInfo.status,
      canReopen: openInfo.canReopen,
      isOpen: openInfo.status === 'OPEN'
    }
  }

  // Performance Analytics Methods
  async fetchMultiDailyMetricsTimeSeries(
    locationId: string,
    metrics: string[],
    startDate: { year: number; month: number; day: number },
    endDate: { year: number; month: number; day: number }
  ): Promise<PerformanceMetricsResponse> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching performance metrics for location:', locationId)
    
    // Build query parameters
    const params = new URLSearchParams()
    metrics.forEach(metric => params.append('dailyMetrics', metric))
    params.append('dailyRange.start_date.year', startDate.year.toString())
    params.append('dailyRange.start_date.month', startDate.month.toString())
    params.append('dailyRange.start_date.day', startDate.day.toString())
    params.append('dailyRange.end_date.year', endDate.year.toString())
    params.append('dailyRange.end_date.month', endDate.month.toString())
    params.append('dailyRange.end_date.day', endDate.day.toString())
    
    const response = await fetch(
      `${this.performanceBaseUrl}/locations/${locationId}:fetchMultiDailyMetricsTimeSeries?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return await this.handleApiResponse(response, 'Fetch Performance Metrics')
  }

  // Get performance metrics for the last 30 days
  async getRecentPerformanceMetrics(locationId: string): Promise<PerformanceMetricsResponse> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - 30)

    // Use correct DailyMetric enum values from the API documentation
    const metrics = [
      'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
      'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH', 
      'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
      'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
      'BUSINESS_DIRECTION_REQUESTS',
      'CALL_CLICKS',
      'WEBSITE_CLICKS',
      'BUSINESS_BOOKINGS',
      'BUSINESS_CONVERSATIONS'
    ]

    return this.fetchMultiDailyMetricsTimeSeries(
      locationId,
      metrics,
      {
        year: startDate.getFullYear(),
        month: startDate.getMonth() + 1,
        day: startDate.getDate()
      },
      {
        year: endDate.getFullYear(),
        month: endDate.getMonth() + 1,
        day: endDate.getDate()
      }
    )
  }

  // Verification Methods
  async fetchVerificationOptions(locationName: string): Promise<VerificationOption[]> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching verification options for location:', locationName)
    
    const response = await fetch(
      `${this.verificationsBaseUrl}/${locationName}:fetchVerificationOptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          languageCode: 'en-US'
        })
      }
    )

    const data = await this.handleApiResponse(response, 'Fetch Verification Options')
    return data.options || []
  }

  async getVoiceOfMerchantState(locationName: string): Promise<VoiceOfMerchantState> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching Voice of Merchant state for location:', locationName)
    
    const response = await fetch(
      `${this.verificationsBaseUrl}/${locationName}/VoiceOfMerchantState`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return await this.handleApiResponse(response, 'Get Voice of Merchant State')
  }

  async listVerifications(locationName: string): Promise<VerificationState[]> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Listing verifications for location:', locationName)
    
    const response = await fetch(
      `${this.verificationsBaseUrl}/${locationName}/verifications`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await this.handleApiResponse(response, 'List Verifications')
    return data.verifications || []
  }

  // Enhanced verification status check
  async getVerificationStatus(locationName: string): Promise<{
    isVerified: boolean
    verificationMethod?: string
    verificationState?: string
    hasVoiceOfMerchant?: boolean
    verificationOptions?: VerificationOption[]
  }> {
    try {
      // Get verification state from location data
      const location = await this.getLocationDetails(locationName)
      const isVerifiedFromLocation = location.locationState?.isVerified || false

      // Get Voice of Merchant state
      let voiceOfMerchantState: VoiceOfMerchantState | null = null
      try {
        voiceOfMerchantState = await this.getVoiceOfMerchantState(locationName)
      } catch (error) {
        console.warn('Could not fetch Voice of Merchant state:', error)
      }

      // Get verification history
      let verifications: VerificationState[] = []
      try {
        verifications = await this.listVerifications(locationName)
      } catch (error) {
        console.warn('Could not fetch verification history:', error)
      }

      // Get verification options if not verified
      let verificationOptions: VerificationOption[] = []
      if (!isVerifiedFromLocation) {
        try {
          verificationOptions = await this.fetchVerificationOptions(locationName)
        } catch (error) {
          console.warn('Could not fetch verification options:', error)
        }
      }

      const latestVerification = verifications.length > 0 ? verifications[0] : null

      return {
        isVerified: isVerifiedFromLocation,
        verificationMethod: latestVerification?.method,
        verificationState: latestVerification?.state,
        hasVoiceOfMerchant: voiceOfMerchantState?.hasVoiceOfMerchant,
        verificationOptions: verificationOptions
      }
    } catch (error) {
      console.error('Error getting verification status:', error)
      return {
        isVerified: false
      }
    }
  }

  // Media API Methods
  
  // Get all media items for a location
  async getLocationMedia(locationName: string): Promise<MediaResponse> {
    console.log('[Google Business API] Fetching media for location:', locationName)
    
    try {
      const accessToken = await this.authService.getValidAccessToken()
      
      const response = await fetch(`/api/google-business/media?locationName=${encodeURIComponent(locationName)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('[Google Business API] Failed to fetch media:', error)
      throw error
    }
  }

  // Get organized business media by category
  async getBusinessMedia(locationName: string): Promise<BusinessMedia> {
    try {
      const mediaResponse = await this.getLocationMedia(locationName)
      const mediaItems = mediaResponse.mediaItems || []
      
      console.log('[Google Business API] Processing', mediaItems.length, 'media items for location:', locationName)
      
      const businessMedia: BusinessMedia = {
        exteriorPhotos: [],
        interiorPhotos: [],
        productPhotos: [],
        foodAndDrinkPhotos: [],
        menuPhotos: [],
        teamPhotos: [],
        additionalPhotos: [],
        allPhotos: mediaItems
      }

      // Organize media by category
      mediaItems.forEach(item => {
        const category = item.locationAssociation?.category
        
        switch (category) {
          case 'COVER':
            businessMedia.coverPhoto = item
            break
          case 'PROFILE':
            businessMedia.profilePhoto = item
            break
          case 'LOGO':
            businessMedia.logoPhoto = item
            break
          case 'EXTERIOR':
            businessMedia.exteriorPhotos.push(item)
            break
          case 'INTERIOR':
            businessMedia.interiorPhotos.push(item)
            break
          case 'PRODUCT':
            businessMedia.productPhotos.push(item)
            break
          case 'FOOD_AND_DRINK':
            businessMedia.foodAndDrinkPhotos.push(item)
            break
          case 'MENU':
            businessMedia.menuPhotos.push(item)
            break
          case 'TEAMS':
            businessMedia.teamPhotos.push(item)
            break
          case 'ADDITIONAL':
          default:
            businessMedia.additionalPhotos.push(item)
            break
        }
      })

      console.log('[Google Business API] Organized media:', {
        coverPhoto: !!businessMedia.coverPhoto,
        profilePhoto: !!businessMedia.profilePhoto,
        logoPhoto: !!businessMedia.logoPhoto,
        exteriorPhotos: businessMedia.exteriorPhotos.length,
        interiorPhotos: businessMedia.interiorPhotos.length,
        productPhotos: businessMedia.productPhotos.length,
        totalPhotos: mediaItems.length
      })

      return businessMedia
    } catch (error) {
      console.warn('[Google Business API] Media API not available for this location:', error)
      
      // Return empty media structure gracefully - this is expected for many locations
      // as the Google Business Profile Media API is not available for all business types
      return {
        exteriorPhotos: [],
        interiorPhotos: [],
        productPhotos: [],
        foodAndDrinkPhotos: [],
        menuPhotos: [],
        teamPhotos: [],
        additionalPhotos: [],
        allPhotos: []
      }
    }
  }

  // Get cover photo URL for a location
  async getCoverPhotoUrl(locationName: string): Promise<string | null> {
    try {
      const businessMedia = await this.getBusinessMedia(locationName)
      return businessMedia.coverPhoto?.googleUrl || businessMedia.coverPhoto?.thumbnailUrl || null
    } catch (error) {
      console.error('[Google Business API] Failed to get cover photo:', error)
      return null
    }
  }

  // Get profile photo URL for a location
  async getProfilePhotoUrl(locationName: string): Promise<string | null> {
    try {
      const businessMedia = await this.getBusinessMedia(locationName)
      return businessMedia.profilePhoto?.googleUrl || businessMedia.profilePhoto?.thumbnailUrl || null
    } catch (error) {
      console.error('[Google Business API] Failed to get profile photo:', error)
      return null
    }
  }

  // Get the best available photos for display (cover, exterior, interior, etc.)
  async getDisplayPhotos(locationName: string, maxPhotos: number = 6): Promise<MediaItem[]> {
    try {
      const businessMedia = await this.getBusinessMedia(locationName)
      const displayPhotos: MediaItem[] = []

      // Prioritize photos in order of importance for display
      if (businessMedia.coverPhoto) {
        displayPhotos.push(businessMedia.coverPhoto)
      }

      // Add exterior photos (most important for businesses)
      displayPhotos.push(...businessMedia.exteriorPhotos.slice(0, Math.max(0, maxPhotos - displayPhotos.length)))

      // Add interior photos if we have space
      if (displayPhotos.length < maxPhotos) {
        displayPhotos.push(...businessMedia.interiorPhotos.slice(0, maxPhotos - displayPhotos.length))
      }

      // Add product photos if we have space
      if (displayPhotos.length < maxPhotos) {
        displayPhotos.push(...businessMedia.productPhotos.slice(0, maxPhotos - displayPhotos.length))
      }

      // Add food and drink photos if we have space
      if (displayPhotos.length < maxPhotos) {
        displayPhotos.push(...businessMedia.foodAndDrinkPhotos.slice(0, maxPhotos - displayPhotos.length))
      }

      // Fill remaining slots with additional photos
      if (displayPhotos.length < maxPhotos) {
        displayPhotos.push(...businessMedia.additionalPhotos.slice(0, maxPhotos - displayPhotos.length))
      }

      console.log('[Google Business API] Selected', displayPhotos.length, 'display photos for location:', locationName)
      return displayPhotos.slice(0, maxPhotos)
    } catch (error) {
      console.warn('[Google Business API] Could not get display photos for location:', locationName, error)
      return []
    }
  }

  // Helper method to get the best image URL from a media item
  static getBestImageUrl(mediaItem: MediaItem): string | null {
    return mediaItem.googleUrl || mediaItem.thumbnailUrl || mediaItem.sourceUrl || null
  }

  // Helper method to check if media item is a photo
  static isPhoto(mediaItem: MediaItem): boolean {
    return mediaItem.mediaFormat === 'PHOTO'
  }

  // Helper method to get media item dimensions
  static getMediaDimensions(mediaItem: MediaItem): { width: number; height: number } | null {
    if (mediaItem.dimensions) {
      return {
        width: mediaItem.dimensions.widthPixels,
        height: mediaItem.dimensions.heightPixels
      }
    }
    return null
  }
} 