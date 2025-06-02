import { GoogleAuthService } from './google-auth'
import { GoogleBusinessAPI, BusinessLocation, BusinessReview, PerformanceMetricsResponse, BusinessMedia, ReviewsResponse } from './google-business-api'
import { BusinessProfilesStorage, SavedBusinessProfile } from './business-profiles-storage'

// Q&A interfaces
export interface BusinessQuestion {
  name: string
  author: {
    displayName: string
    profilePhotoUri?: string
    type?: 'AUTHOR_TYPE_UNSPECIFIED' | 'REGULAR_USER' | 'LOCAL_GUIDE' | 'MERCHANT'
  }
  upvoteCount?: number
  text: string
  createTime: string
  updateTime: string
  topAnswers: BusinessAnswer[]
  totalAnswerCount: number
}

export interface BusinessAnswer {
  name: string
  author: {
    displayName: string
    profilePhotoUri?: string
    type: 'AUTHOR_TYPE_UNSPECIFIED' | 'REGULAR_USER' | 'LOCAL_GUIDE' | 'MERCHANT'
  }
  upvoteCount?: number
  text: string
  createTime: string
  updateTime: string
}

// Centralized data loader for all business data operations
export class CentralizedDataLoader {
  private static googleAPI = new GoogleBusinessAPI()

  // Load all saved business profiles from storage
  static loadProfiles(): SavedBusinessProfile[] {
    console.log('[CentralizedDataLoader] Loading all profiles from storage')
    const savedProfiles = BusinessProfilesStorage.getAllProfiles()
    console.log(`[CentralizedDataLoader] Loaded ${savedProfiles.length} profiles`)
    return savedProfiles
  }

  // Convert saved profiles to display format with latest data
  static convertProfilesToDisplayFormat(savedProfiles: SavedBusinessProfile[]) {
    return savedProfiles.map(saved => {
      // Use cached reviews data if available, otherwise fall back to stored values
      const actualReviewCount = saved.googleData?.reviewsSummary?.totalReviews ?? saved.reviewCount
      const actualRating = saved.googleData?.reviewsSummary?.averageRating ?? saved.rating
      
      return {
        id: saved.id,
        name: saved.name,
        address: saved.address,
        phone: saved.phone,
        website: saved.website,
        category: saved.category,
        rating: actualRating,
        reviewCount: actualReviewCount,
        status: saved.status,
        lastUpdated: saved.lastUpdated,
        googleBusinessId: saved.googleBusinessId
      }
    })
  }

  // Load Google Business locations for adding new profiles
  static async loadGoogleBusinessLocations(): Promise<BusinessLocation[]> {
    console.log('[CentralizedDataLoader] Loading Google Business locations')
    
    try {
      // Test API access first
      const apiTest = await this.googleAPI.testApiAccess()
      console.log('[CentralizedDataLoader] API Test Results:', apiTest)
      
      if (!apiTest.accounts) {
        throw new Error('Cannot access Google Business accounts. Please check your OAuth permissions.')
      }
      
      if (!apiTest.locations) {
        throw new Error('Cannot access business locations. Please check your API permissions.')
      }
      
      // Get accounts
      const accounts = await this.googleAPI.getAccounts()
      console.log('[CentralizedDataLoader] Found accounts:', accounts.length)
      
      if (accounts.length === 0) {
        throw new Error('No Google Business accounts found. Please make sure you have Google Business Profile accounts set up.')
      }
      
      // Get locations for each account
      let allLocations: BusinessLocation[] = []
      for (const account of accounts) {
        try {
          console.log(`[CentralizedDataLoader] Fetching locations for account: ${account.name}`)
          const locations = await this.googleAPI.getLocationsWithCompleteDetails(account.name)
          console.log(`[CentralizedDataLoader] Found ${locations.length} locations for account ${account.name}`)
          allLocations = [...allLocations, ...locations]
        } catch (error) {
          console.error(`[CentralizedDataLoader] Failed to load locations for account ${account.name}:`, error)
        }
      }
      
      console.log('[CentralizedDataLoader] Total locations found:', allLocations.length)
      
      if (allLocations.length === 0) {
        throw new Error('No business locations found. Please make sure you have business locations set up in Google Business Profile.')
      }
      
      // Enhanced verification status checking for each location
      const locationsWithVerification = await Promise.all(
        allLocations.map(async (location) => {
          try {
            const verificationStatus = await this.googleAPI.getVerificationStatus(location.name)
            return {
              ...location,
              verificationStatus
            }
          } catch (error) {
            console.warn('[CentralizedDataLoader] Could not get verification status for location:', location.name, error)
            return location
          }
        })
      )
      
      return locationsWithVerification
      
    } catch (error) {
      console.error('[CentralizedDataLoader] Failed to load Google Business locations:', error)
      throw error
    }
  }

  // Add a new Google Business profile and save it
  static async addGoogleBusinessProfile(location: any): Promise<{ success: boolean; profile?: any; error?: string }> {
    try {
      console.log('[CentralizedDataLoader] Adding Google Business profile:', location.name)
      
      // Check if this profile already exists
      if (BusinessProfilesStorage.profileExistsByGoogleId(location.name)) {
        return { success: false, error: 'This business profile has already been added.' }
      }

      // Fetch complete location details from Google API
      let completeLocation = location
      
      try {
        completeLocation = await this.googleAPI.getLocationDetails(location.name)
        // Enrich the location data with computed fields
        completeLocation = GoogleBusinessAPI.enrichLocationData(completeLocation)
        console.log('[CentralizedDataLoader] Complete location details loaded')
      } catch (detailsError) {
        console.warn('[CentralizedDataLoader] Failed to fetch complete details, using basic info:', detailsError)
        // Continue with basic location data if detailed fetch fails
      }

      // Handle both old and new location data structures
      const locationName = completeLocation.title || completeLocation.displayName || completeLocation.locationName || 'Unknown Business'
      const formattedAddress = GoogleBusinessAPI.getFormattedAddress(completeLocation)
      const allCategories = GoogleBusinessAPI.getAllCategories(completeLocation)
      const businessHours = GoogleBusinessAPI.formatBusinessHours(completeLocation)
      const capabilities = GoogleBusinessAPI.getBusinessCapabilities(completeLocation)
      
      const profileId = Date.now().toString()
      
      // Create the saved profile with complete Google data
      const savedProfile: SavedBusinessProfile = {
        id: profileId,
        name: locationName,
        address: formattedAddress,
        phone: GoogleBusinessAPI.getPrimaryPhone(completeLocation),
        website: completeLocation.websiteUri || '',
        category: allCategories[0] || 'Business',
        rating: completeLocation.rating || 0,
        reviewCount: completeLocation.reviewCount || 0,
        status: (completeLocation.locationState?.isVerified || completeLocation.isVerified) ? 'active' : 'pending',
        lastUpdated: new Date().toISOString().split('T')[0],
        googleBusinessId: completeLocation.name || location.name || `temp_${profileId}`,
        googleData: {
          title: completeLocation.title,
          storefrontAddress: completeLocation.storefrontAddress,
          primaryCategory: completeLocation.primaryCategory,
          additionalCategories: completeLocation.additionalCategories,
          regularHours: completeLocation.regularHours,
          moreHours: completeLocation.moreHours,
          metadata: completeLocation.metadata,
          latlng: completeLocation.latlng,
          locationState: completeLocation.locationState,
          attributes: completeLocation.attributes,
          profile: completeLocation.profile,
          relationshipData: completeLocation.relationshipData,
          serviceItems: completeLocation.serviceItems,
          openInfo: completeLocation.openInfo,
          serviceArea: completeLocation.serviceArea,
          labels: completeLocation.labels,
          adWordsLocationExtensions: completeLocation.adWordsLocationExtensions,
          // Computed fields
          businessHours: businessHours,
          allCategories: allCategories,
          capabilities: capabilities,
          isOpen: completeLocation.isOpen,
          businessType: completeLocation.businessType,
          // New fields
          phoneNumbers: completeLocation.phoneNumbers,
          categories: completeLocation.categories,
          additionalPhones: GoogleBusinessAPI.getAdditionalPhones(completeLocation),
          serviceTypes: GoogleBusinessAPI.getServiceTypes(completeLocation),
          moreHoursTypes: GoogleBusinessAPI.getMoreHoursTypes(completeLocation),
          // Additional comprehensive data
          language: GoogleBusinessAPI.getLanguage(completeLocation),
          storeCode: GoogleBusinessAPI.getStoreCode(completeLocation),
          businessDescription: GoogleBusinessAPI.getBusinessDescription(completeLocation),
          openingDate: GoogleBusinessAPI.getOpeningDate(completeLocation),
          serviceAreaInfo: GoogleBusinessAPI.getServiceArea(completeLocation),
          specialHours: GoogleBusinessAPI.getSpecialHours(completeLocation),
          moreHoursData: GoogleBusinessAPI.getMoreHours(completeLocation),
          serviceItemsData: GoogleBusinessAPI.getServiceItems(completeLocation),
          relationshipInfo: GoogleBusinessAPI.getRelationshipData(completeLocation),
          businessStatusInfo: GoogleBusinessAPI.getBusinessStatus(completeLocation)
        },
        isVerified: completeLocation.locationState?.isVerified || completeLocation.isVerified || false,
        totalReviews: completeLocation.reviewCount || 0,
        lastSynced: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      // Save to local storage
      BusinessProfilesStorage.saveProfile(savedProfile)
      
      console.log('[CentralizedDataLoader] Successfully added and saved profile:', locationName)
      
      return { success: true, profile: savedProfile }
      
    } catch (error) {
      console.error('[CentralizedDataLoader] Error adding profile:', error)
      return { 
        success: false, 
        error: `Failed to add business profile: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }
    }
  }

  // Load analytics data for a specific profile
  static async loadAnalytics(profile: SavedBusinessProfile, options: {
    startDate?: string
    endDate?: string
    enabledMetrics?: Record<string, boolean>
  } = {}): Promise<{ success: boolean, data?: PerformanceMetricsResponse, error?: string }> {
    console.log('[CentralizedDataLoader] Loading analytics for profile:', profile.name)
    
    try {
      const authService = GoogleAuthService.getInstance()
      if (!authService.isAuthenticated()) {
        return { success: false, error: 'Not authenticated' }
      }

      const userInfo = authService.getUserInfo()
      const sessionInfo = authService.getSessionInfo()

      if (!userInfo || !sessionInfo?.expires_at) {
        return { success: false, error: 'Missing authentication data' }
      }

      // Extract location ID from googleBusinessId
      const locationMatch = profile.googleBusinessId.match(/locations\/([^\/]+)/)
      if (!locationMatch) {
        return { success: false, error: 'Invalid business ID format' }
      }
      
      const locationId = locationMatch[1]

      // Calculate date range
      let start = new Date()
      let end = new Date()
      
      if (options.startDate && options.endDate) {
        start = new Date(options.startDate)
        end = new Date(options.endDate)
      } else {
        // Default to 30 days
        start.setDate(end.getDate() - 30)
      }

      // Default metrics if none provided
      const defaultMetrics: string[] = [
        'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
        'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
        'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
        'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
        'CALL_CLICKS',
        'WEBSITE_CLICKS',
        'BUSINESS_DIRECTION_REQUESTS'
      ]

      // Get enabled metrics only
      const enabledMetrics = options.enabledMetrics || {}
      const enabledMetricKeys = Object.keys(enabledMetrics).filter(key => enabledMetrics[key])
      const metricsToUse = enabledMetricKeys.length > 0 ? enabledMetricKeys : defaultMetrics

      const data = await this.googleAPI.fetchMultiDailyMetricsTimeSeries(
        locationId,
        metricsToUse,
        {
          year: start.getFullYear(),
          month: start.getMonth() + 1,
          day: start.getDate()
        },
        {
          year: end.getFullYear(),
          month: end.getMonth() + 1,
          day: end.getDate()
        }
      )

      console.log('[CentralizedDataLoader] Analytics loaded successfully')
      return { success: true, data }
    } catch (error) {
      console.error('[CentralizedDataLoader] Failed to load analytics:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Load all reviews for a specific profile
  static async loadAllReviews(profile: SavedBusinessProfile): Promise<{ 
    success: boolean, 
    reviews?: BusinessReview[], 
    summary?: any,
    error?: string 
  }> {
    console.log('[CentralizedDataLoader] Loading all reviews for profile:', profile.name)
    
    try {
      const authService = GoogleAuthService.getInstance()
      if (!authService.isAuthenticated()) {
        return { success: false, error: 'Not authenticated' }
      }

      const userInfo = authService.getUserInfo()
      const sessionInfo = authService.getSessionInfo()

      if (!userInfo || !sessionInfo?.expires_at) {
        return { success: false, error: 'Missing authentication data' }
      }

      const reviewsResponse: ReviewsResponse = await this.googleAPI.getAllReviews(profile.googleBusinessId)

      // Calculate summary
      const summary = {
        totalReviews: reviewsResponse.totalReviewCount,
        averageRating: reviewsResponse.averageRating,
        ratingDistribution: {
          1: reviewsResponse.reviews.filter(r => GoogleBusinessAPI.getStarRatingValue(r.starRating) === 1).length,
          2: reviewsResponse.reviews.filter(r => GoogleBusinessAPI.getStarRatingValue(r.starRating) === 2).length,
          3: reviewsResponse.reviews.filter(r => GoogleBusinessAPI.getStarRatingValue(r.starRating) === 3).length,
          4: reviewsResponse.reviews.filter(r => GoogleBusinessAPI.getStarRatingValue(r.starRating) === 4).length,
          5: reviewsResponse.reviews.filter(r => GoogleBusinessAPI.getStarRatingValue(r.starRating) === 5).length,
        },
        repliedCount: reviewsResponse.reviews.filter(r => r.reviewReply).length,
        unrepliedCount: reviewsResponse.reviews.filter(r => !r.reviewReply).length
      }

      console.log(`[CentralizedDataLoader] Loaded ${reviewsResponse.reviews.length} reviews successfully`)
      return { success: true, reviews: reviewsResponse.reviews, summary }
    } catch (error) {
      console.error('[CentralizedDataLoader] Failed to load reviews:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Load business media for a specific profile
  static async loadBusinessMedia(profile: SavedBusinessProfile): Promise<{ 
    success: boolean, 
    media?: BusinessMedia, 
    error?: string 
  }> {
    console.log('[CentralizedDataLoader] Loading business media for profile:', profile.name)
    
    try {
      const authService = GoogleAuthService.getInstance()
      if (!authService.isAuthenticated()) {
        return { success: false, error: 'Not authenticated' }
      }

      const userInfo = authService.getUserInfo()
      const sessionInfo = authService.getSessionInfo()

      if (!userInfo || !sessionInfo?.expires_at) {
        return { success: false, error: 'Missing authentication data' }
      }

      const media = await this.googleAPI.getBusinessMedia(profile.googleBusinessId)

      console.log('[CentralizedDataLoader] Business media loaded successfully')
      return { success: true, media }
    } catch (error) {
      console.error('[CentralizedDataLoader] Failed to load business media:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Load Q&A for a specific profile
  static async loadQuestionsAndAnswers(profile: SavedBusinessProfile): Promise<{ 
    success: boolean, 
    questions?: BusinessQuestion[], 
    error?: string 
  }> {
    console.log('[CentralizedDataLoader] Loading Q&A for profile:', profile.name)
    
    try {
      const authService = GoogleAuthService.getInstance()
      if (!authService.isAuthenticated()) {
        return { success: false, error: 'Not authenticated' }
      }

      const sessionInfo = authService.getSessionInfo()
      if (!sessionInfo?.expires_at) {
        return { success: false, error: 'Missing authentication data' }
      }

      // Get valid access token
      const accessToken = await authService.getValidAccessToken()

      // Extract location ID from googleBusinessId
      const locationMatch = profile.googleBusinessId.match(/locations\/([^\/]+)/)
      if (!locationMatch) {
        console.log('[CentralizedDataLoader] Invalid business ID format:', profile.googleBusinessId)
        return { success: false, error: 'Invalid business ID format' }
      }
      
      const locationId = locationMatch[1]
      const endpoint = `https://mybusinessqanda.googleapis.com/v1/locations/${locationId}/questions`
      
      console.log('[CentralizedDataLoader] Q&A API endpoint:', endpoint)

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      console.log('[CentralizedDataLoader] Q&A API response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('[CentralizedDataLoader] Q&A API error response:', errorText)
        
        if (response.status === 403) {
          console.log('[CentralizedDataLoader] Q&A API access not available for this location (403 Forbidden)')
          return { success: true, questions: [] }
        } else if (response.status === 404) {
          console.log('[CentralizedDataLoader] Q&A API not found for this location (404 Not Found)')
          return { success: true, questions: [] }
        } else if (response.status === 400) {
          console.log('[CentralizedDataLoader] Q&A API bad request (400):', errorText)
          return { success: false, error: `Bad request: ${errorText}` }
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log('[CentralizedDataLoader] Q&A API response data:', data)
      
      const questions: BusinessQuestion[] = data.questions || []
      console.log(`[CentralizedDataLoader] Found ${questions.length} questions from API`)

      // Load answers for each question (if they don't already have topAnswers)
      for (const question of questions) {
        try {
          // Check if we already have answers in the question
          if (!question.topAnswers || question.topAnswers.length === 0) {
            console.log('[CentralizedDataLoader] Loading answers for question:', question.name)
            const answersEndpoint = `https://mybusinessqanda.googleapis.com/v1/${question.name}/answers`
            const answersResponse = await fetch(answersEndpoint, {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            })

            if (answersResponse.ok) {
              const answersData = await answersResponse.json()
              question.topAnswers = answersData.answers || []
              console.log(`[CentralizedDataLoader] Loaded ${question.topAnswers.length} answers for question`)
            } else {
              console.warn('[CentralizedDataLoader] Failed to load answers for question:', question.name, answersResponse.status, answersResponse.statusText)
              question.topAnswers = []
            }
          } else {
            console.log(`[CentralizedDataLoader] Question already has ${question.topAnswers.length} answers`)
          }
        } catch (answerError) {
          console.warn('[CentralizedDataLoader] Failed to load answers for question:', question.name, answerError)
          question.topAnswers = []
        }
      }

      console.log(`[CentralizedDataLoader] Successfully loaded ${questions.length} Q&A items with answers`)
      return { success: true, questions }
    } catch (error) {
      console.error('[CentralizedDataLoader] Failed to load Q&A:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Load all profile data at once
  static async loadAllProfileData(profile: SavedBusinessProfile, options: {
    includeAnalytics?: boolean
    includeReviews?: boolean
    includeMedia?: boolean
    includeQA?: boolean
    analyticsOptions?: any
  } = {}): Promise<{
    success: boolean
    analytics?: PerformanceMetricsResponse
    reviews?: BusinessReview[]
    reviewsSummary?: any
    media?: BusinessMedia
    questions?: BusinessQuestion[]
    errors?: string[]
  }> {
    console.log('[CentralizedDataLoader] Loading all data for profile:', profile.name)
    
    const results: any = { success: true, errors: [] }
    
    try {
      // Load data in parallel where possible
      const promises: Promise<any>[] = []
      
      if (options.includeAnalytics) {
        promises.push(
          this.loadAnalytics(profile, options.analyticsOptions || {})
            .then(result => ({ type: 'analytics', result }))
        )
      }
      
      if (options.includeReviews) {
        promises.push(
          this.loadAllReviews(profile)
            .then(result => ({ type: 'reviews', result }))
        )
      }
      
      if (options.includeMedia) {
        promises.push(
          this.loadBusinessMedia(profile)
            .then(result => ({ type: 'media', result }))
        )
      }

      if (options.includeQA) {
        promises.push(
          this.loadQuestionsAndAnswers(profile)
            .then(result => ({ type: 'qa', result }))
        )
      }
      
      const responses = await Promise.allSettled(promises)
      
      responses.forEach((response, index) => {
        if (response.status === 'fulfilled') {
          const { type, result } = response.value
          
          if (result.success) {
            switch (type) {
              case 'analytics':
                results.analytics = result.data
                break
              case 'reviews':
                results.reviews = result.reviews
                results.reviewsSummary = result.summary
                break
              case 'media':
                results.media = result.media
                break
              case 'qa':
                results.questions = result.questions
                break
            }
          } else {
            results.errors.push(`${type}: ${result.error}`)
          }
        } else {
          results.errors.push(`Promise ${index} rejected: ${response.reason}`)
        }
      })
      
      console.log('[CentralizedDataLoader] All profile data loading completed')
      return results
    } catch (error) {
      console.error('[CentralizedDataLoader] Failed to load all profile data:', error)
      return { 
        success: false, 
        errors: [error instanceof Error ? error.message : 'Unknown error'] 
      }
    }
  }

  // Refresh a profile by reloading its data
  static async refreshProfile(profileId: string): Promise<{
    success: boolean
    profile?: SavedBusinessProfile
    error?: string
  }> {
    try {
      const profile = BusinessProfilesStorage.getProfile(profileId)
      if (!profile) {
        return { success: false, error: 'Profile not found' }
      }

      // Reload all data for the profile
      await this.loadAllProfileData(profile)
      
      // Get the updated profile
      const updatedProfile = BusinessProfilesStorage.getProfile(profileId)
      
      return {
        success: true,
        profile: updatedProfile || profile
      }
      
    } catch (error) {
      console.error('[CentralizedDataLoader] Failed to refresh profile:', error)
      return {
        success: false,
        error: `Failed to refresh profile: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // Get authentication status
  static getAuthStatus(): { isAuthenticated: boolean, userInfo?: any } {
    const authService = GoogleAuthService.getInstance()
    const isAuthenticated = authService.isAuthenticated()
    const userInfo = isAuthenticated ? authService.getUserInfo() : null
    
    return { isAuthenticated, userInfo }
  }

  // Bulk operations for efficiency
  static async loadReviewsForAllProfiles(): Promise<{ [profileId: string]: any }> {
    console.log('[CentralizedDataLoader] Loading reviews for all profiles')
    const profiles = this.loadProfiles()
    const results: { [profileId: string]: any } = {}
    
    await Promise.all(
      profiles.map(async (profile) => {
        const result = await this.loadAllReviews(profile)
        results[profile.id] = result
      })
    )
    
    return results
  }

  static async loadAnalyticsForAllProfiles(options: any = {}): Promise<{ [profileId: string]: any }> {
    console.log('[CentralizedDataLoader] Loading analytics for all profiles')
    const profiles = this.loadProfiles()
    const results: { [profileId: string]: any } = {}
    
    await Promise.all(
      profiles.map(async (profile) => {
        const result = await this.loadAnalytics(profile, options)
        results[profile.id] = result
      })
    )
    
    return results
  }

  // Add business locations from Google
  static async addGoogleProfile(accessToken: string): Promise<{ success: boolean, profiles?: SavedBusinessProfile[], error?: string }> {
    console.log('[CentralizedDataLoader] Adding Google profiles')
    
    try {
      // First get accounts, then get locations for each account
      const accounts = await this.googleAPI.getAccounts()
      
      if (accounts.length === 0) {
        return { success: false, error: 'No Google Business accounts found.' }
      }

      const savedProfiles: SavedBusinessProfile[] = []
      
      // Get locations for each account
      for (const account of accounts) {
        try {
          const locations = await this.googleAPI.getLocationsWithCompleteDetails(account.name)
          
          for (const location of locations) {
            const profile: SavedBusinessProfile = {
              id: location.name,
              googleBusinessId: location.name,
              name: location.title || location.displayName || location.locationName || 'Unknown Business',
              address: GoogleBusinessAPI.getFormattedAddress(location),
              phone: GoogleBusinessAPI.getPrimaryPhone(location),
              website: location.websiteUri || '',
              category: location.primaryCategory?.displayName || 'Business',
              rating: 0,
              reviewCount: 0,
              status: 'active',
              lastUpdated: new Date().toISOString(),
              lastSynced: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              googleData: {
                title: location.title,
                storefrontAddress: location.storefrontAddress,
                primaryCategory: location.primaryCategory,
                additionalCategories: location.additionalCategories,
                regularHours: location.regularHours,
                moreHours: location.moreHours,
                metadata: location.metadata,
                latlng: location.latlng,
                locationState: location.locationState,
                attributes: location.attributes,
                profile: location.profile,
                relationshipData: location.relationshipData,
                serviceItems: location.serviceItems,
                openInfo: location.openInfo,
                serviceArea: location.serviceArea,
                labels: location.labels,
                adWordsLocationExtensions: location.adWordsLocationExtensions,
                language: GoogleBusinessAPI.getLanguage(location),
                storeCode: GoogleBusinessAPI.getStoreCode(location),
                businessDescription: GoogleBusinessAPI.getBusinessDescription(location),
                openingDate: GoogleBusinessAPI.getOpeningDate(location),
                businessHours: GoogleBusinessAPI.formatBusinessHours(location),
                allCategories: GoogleBusinessAPI.getAllCategories(location),
                serviceTypes: GoogleBusinessAPI.getServiceTypes(location),
                moreHoursTypes: GoogleBusinessAPI.getMoreHoursTypes(location),
                capabilities: GoogleBusinessAPI.getBusinessCapabilities(location),
                isOpen: GoogleBusinessAPI.getBusinessStatus(location).isOpen,
                businessType: GoogleBusinessAPI.getServiceArea(location).businessType,
                phoneNumbers: {
                  primaryPhone: GoogleBusinessAPI.getPrimaryPhone(location),
                  additionalPhones: GoogleBusinessAPI.getAdditionalPhones(location)
                },
                categories: {
                  primaryCategory: location.primaryCategory,
                  additionalCategories: location.additionalCategories
                },
                serviceAreaInfo: GoogleBusinessAPI.getServiceArea(location),
                specialHours: GoogleBusinessAPI.getSpecialHours(location),
                moreHoursData: GoogleBusinessAPI.getMoreHours(location),
                serviceItemsData: GoogleBusinessAPI.getServiceItems(location),
                relationshipInfo: GoogleBusinessAPI.getRelationshipData(location),
                businessStatusInfo: GoogleBusinessAPI.getBusinessStatus(location)
              }
            }

            BusinessProfilesStorage.saveProfile(profile)
            savedProfiles.push(profile)
          }
        } catch (locationError) {
          console.warn(`[CentralizedDataLoader] Failed to load locations for account ${account.name}:`, locationError)
        }
      }

      if (savedProfiles.length === 0) {
        return { success: false, error: 'No business locations found in your Google Business Profile accounts.' }
      }

      console.log(`[CentralizedDataLoader] Added ${savedProfiles.length} Google profiles successfully`)
      return { success: true, profiles: savedProfiles }
    } catch (error) {
      console.error('[CentralizedDataLoader] Failed to add Google profiles:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Load reviews in bulk for multiple profiles
  static async loadAllReviewsForProfiles(profiles: SavedBusinessProfile[]): Promise<Record<string, { success: boolean, reviews?: BusinessReview[], summary?: any, error?: string }>> {
    console.log('[CentralizedDataLoader] Loading reviews for multiple profiles')
    
    const results: Record<string, any> = {}
    
    await Promise.all(
      profiles.map(async (profile) => {
        const result = await this.loadAllReviews(profile)
        results[profile.id] = result
      })
    )
    
    return results
  }

  // Test Q&A API access for debugging
  static async testQAApiAccess(profile: SavedBusinessProfile): Promise<{
    success: boolean
    details: any
    error?: string
  }> {
    console.log('[CentralizedDataLoader] Testing Q&A API access for profile:', profile.name)
    
    try {
      const authService = GoogleAuthService.getInstance()
      if (!authService.isAuthenticated()) {
        return { success: false, details: { step: 'auth_check' }, error: 'Not authenticated' }
      }

      const accessToken = await authService.getValidAccessToken()
      const locationMatch = profile.googleBusinessId.match(/locations\/([^\/]+)/)
      
      if (!locationMatch) {
        return { 
          success: false, 
          details: { 
            step: 'location_id_extraction', 
            googleBusinessId: profile.googleBusinessId 
          }, 
          error: 'Invalid business ID format' 
        }
      }
      
      const locationId = locationMatch[1]
      const details: any = {
        profileName: profile.name,
        googleBusinessId: profile.googleBusinessId,
        extractedLocationId: locationId,
        endpoint: `https://mybusinessqanda.googleapis.com/v1/locations/${locationId}/questions`,
        steps: []
      }

      // Test 1: Try to access the questions endpoint
      console.log('[CentralizedDataLoader] Testing questions endpoint...')
      const questionsResponse = await fetch(`https://mybusinessqanda.googleapis.com/v1/locations/${locationId}/questions`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      details.steps.push({
        step: 'questions_api_call',
        status: questionsResponse.status,
        statusText: questionsResponse.statusText,
        ok: questionsResponse.ok
      })

      if (questionsResponse.ok) {
        const data = await questionsResponse.json()
        details.steps.push({
          step: 'questions_response_parse',
          questionsCount: data.questions?.length || 0,
          hasQuestions: !!(data.questions && data.questions.length > 0)
        })
        return { success: true, details }
      } else {
        const errorText = await questionsResponse.text()
        details.steps.push({
          step: 'questions_error_details',
          errorText: errorText,
          possibleCauses: questionsResponse.status === 403 ? [
            'Q&A API not enabled for this location',
            'Insufficient OAuth scopes',
            'Location not verified',
            'Q&A feature not available in this region'
          ] : questionsResponse.status === 404 ? [
            'Location not found',
            'Q&A not set up for this location',
            'Invalid location ID'
          ] : [
            'Unknown API error',
            'Rate limiting',
            'Authentication issues'
          ]
        })
        return { 
          success: false, 
          details, 
          error: `HTTP ${questionsResponse.status}: ${questionsResponse.statusText}` 
        }
      }

    } catch (error) {
      return { 
        success: false, 
        details: { step: 'exception', error: error instanceof Error ? error.message : 'Unknown error' },
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
} 