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
  displayName: string
  isAnonymous: boolean
}

export interface BusinessReview {
  name: string
  reviewId: string
  reviewer: Reviewer
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'STAR_RATING_UNSPECIFIED'
  comment: string
  createTime: string
  updateTime: string
  reviewReply?: ReviewReply
}

export interface ReviewsResponse {
  reviews: BusinessReview[]
  totalReviewCount: number
  averageRating: number
  nextPageToken?: string
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

  // Get reviews with pagination
  async getReviewsPaginated(locationName: string, pageSize: number = 50, pageToken?: string): Promise<ReviewsResponse> {
    const accessToken = await this.authService.getValidAccessToken()
    
    console.log('[Google Business API] Fetching paginated reviews for location:', locationName)
    
    let url = `${this.businessInfoBaseUrl}/${locationName}/reviews?pageSize=${pageSize}`
    if (pageToken) {
      url += `&pageToken=${pageToken}`
    }
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    const data = await this.handleApiResponse(response, 'Fetch Paginated Reviews')
    
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
      return sum + (ratingValues[review.starRating] || 0)
    }, 0)
    
    return Math.round((totalRating / reviews.length) * 10) / 10
  }

  // Convert star rating enum to number
  static getStarRatingValue(starRating: string): number {
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
  static formatReviewDate(dateString: string): string {
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
    const status: any = {}
    
    if (location.openInfo) {
      if (location.openInfo.status) {
        status.status = location.openInfo.status
      }
      if (location.openInfo.canReopen !== undefined) {
        status.canReopen = location.openInfo.canReopen
      }
    }
    
    // Determine if currently open based on status
    if (location.openInfo?.status) {
      status.isOpen = location.openInfo.status === 'OPEN'
    }
    
    return status
  }
} 