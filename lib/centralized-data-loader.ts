import { GoogleAuthService } from './google-auth'
import { GoogleBusinessAPI, BusinessLocation, BusinessReview, PerformanceMetricsResponse, BusinessMedia, BusinessQuestion, QuestionsResponse } from './google-business-api'
import { BusinessProfilesStorage, SavedBusinessProfile } from './business-profiles-storage'

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

  // Load reviews for a business profile
  static async loadReviews(profile: SavedBusinessProfile): Promise<{
    success: boolean
    reviews?: BusinessReview[]
    summary?: {
      averageRating: number
      totalReviews: number
      ratingDistribution: { [key: number]: number }
      repliedCount: number
      unrepliedCount: number
    }
    error?: string
  }> {
    if (!profile.googleBusinessId) {
      return { success: false, error: 'No Google Business ID found for this profile' }
    }

    try {
      console.log('[CentralizedDataLoader] Loading reviews for profile:', profile.name)
      const reviewsData = await this.googleAPI.getAllReviews(profile.googleBusinessId)
      
      // Calculate rating distribution
      const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      let repliedCount = 0
      let unrepliedCount = 0
      
      reviewsData.reviews.forEach(review => {
        const rating = GoogleBusinessAPI.getStarRatingValue(review.starRating)
        if (rating > 0) distribution[rating]++
        
        if (review.reviewReply) {
          repliedCount++
        } else {
          unrepliedCount++
        }
      })

      const summary = {
        averageRating: reviewsData.averageRating,
        totalReviews: reviewsData.totalReviewCount,
        ratingDistribution: distribution,
        repliedCount,
        unrepliedCount
      }

      // Update profile with reviews data
      const updatedProfile = {
        ...profile,
        googleData: {
          ...profile.googleData,
          reviews: reviewsData.reviews,
          reviewsSummary: {
            averageRating: reviewsData.averageRating,
            totalReviews: reviewsData.totalReviewCount,
            lastUpdated: new Date().toISOString()
          }
        }
      }
      BusinessProfilesStorage.updateProfile(profile.id, updatedProfile)
      
      console.log(`[CentralizedDataLoader] Loaded ${reviewsData.reviews.length} reviews for ${profile.name}`)
      
      return {
        success: true,
        reviews: reviewsData.reviews,
        summary
      }
      
    } catch (error) {
      console.error('[CentralizedDataLoader] Failed to load reviews:', error)
      return {
        success: false,
        error: `Failed to load reviews: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // Load analytics/performance data for a business profile
  static async loadAnalytics(
    profile: SavedBusinessProfile,
    options: {
      dateRange?: string
      customStartDate?: string
      customEndDate?: string
      enabledMetrics?: Record<string, boolean>
    } = {}
  ): Promise<{
    success: boolean
    data?: PerformanceMetricsResponse
    error?: string
  }> {
    if (!profile.googleBusinessId) {
      return { success: false, error: 'No Google Business ID found for this profile' }
    }

    try {
      console.log('[CentralizedDataLoader] Loading analytics for profile:', profile.name)
      
      // Extract location ID from the full name
      const locationId = profile.googleBusinessId.split('/').pop()
      if (!locationId) {
        throw new Error('Invalid location ID')
      }

      // Calculate date range
      let start = new Date()
      let end = new Date()
      
      if (options.customStartDate && options.customEndDate) {
        start = new Date(options.customStartDate)
        end = new Date(options.customEndDate)
      } else if (options.dateRange) {
        const days = parseInt(options.dateRange)
        start.setDate(end.getDate() - days)
      } else {
        // Default to 30 days
        start.setDate(end.getDate() - 30)
      }

      // Default metrics if none provided
      const defaultMetrics: Record<string, boolean> = {
        'BUSINESS_IMPRESSIONS_DESKTOP_MAPS': true,
        'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH': true,
        'BUSINESS_IMPRESSIONS_MOBILE_MAPS': true,
        'BUSINESS_IMPRESSIONS_MOBILE_SEARCH': true,
        'CALL_CLICKS': true,
        'WEBSITE_CLICKS': true,
        'BUSINESS_DIRECTION_REQUESTS': true,
        'BUSINESS_BOOKINGS': true,
        'BUSINESS_CONVERSATIONS': true
      }

      // Get enabled metrics only
      const enabledMetrics = options.enabledMetrics || defaultMetrics
      const enabledMetricKeys = Object.keys(enabledMetrics).filter(key => enabledMetrics[key])
      
      const data = await this.googleAPI.fetchMultiDailyMetricsTimeSeries(
        locationId,
        enabledMetricKeys,
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
      
      // Update profile with performance data
      const updatedProfile = {
        ...profile,
        googleData: {
          ...profile.googleData,
          performanceData: data,
          lastPerformanceUpdate: new Date().toISOString()
        }
      }
      BusinessProfilesStorage.updateProfile(profile.id, updatedProfile)
      
      console.log(`[CentralizedDataLoader] Loaded analytics data for ${profile.name}`)
      
      return {
        success: true,
        data
      }
      
    } catch (error) {
      console.error('[CentralizedDataLoader] Failed to load analytics:', error)
      return {
        success: false,
        error: `Failed to load analytics: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // Load business media for a profile
  static async loadBusinessMedia(profile: SavedBusinessProfile): Promise<{
    success: boolean
    media?: BusinessMedia
    error?: string
  }> {
    if (!profile.googleBusinessId) {
      return { success: false, error: 'No Google Business ID found for this profile' }
    }

    try {
      console.log('[CentralizedDataLoader] Loading business media for profile:', profile.name)
      const media = await this.googleAPI.getBusinessMedia(profile.googleBusinessId)
      
      // Update profile with media data
      const updatedProfile = {
        ...profile,
        googleData: {
          ...profile.googleData,
          media: media,
          coverPhotoUrl: media.coverPhoto ? GoogleBusinessAPI.getBestImageUrl(media.coverPhoto) || undefined : undefined,
          profilePhotoUrl: media.profilePhoto ? GoogleBusinessAPI.getBestImageUrl(media.profilePhoto) || undefined : undefined,
          displayPhotos: await this.googleAPI.getDisplayPhotos(profile.googleBusinessId, 6),
          lastMediaUpdate: new Date().toISOString()
        }
      }
      BusinessProfilesStorage.updateProfile(profile.id, updatedProfile)
      
      console.log(`[CentralizedDataLoader] Loaded media for ${profile.name}`)
      
      return {
        success: true,
        media
      }
      
    } catch (error) {
      console.error('[CentralizedDataLoader] Failed to load business media:', error)
      // Set empty media on error - this is expected for many locations
      const emptyMedia: BusinessMedia = {
        exteriorPhotos: [],
        interiorPhotos: [],
        productPhotos: [],
        foodAndDrinkPhotos: [],
        menuPhotos: [],
        teamPhotos: [],
        additionalPhotos: [],
        allPhotos: []
      }
      
      return {
        success: true, // Return success with empty media as this is expected behavior
        media: emptyMedia
      }
    }
  }

  // Load Q&A for a specific business profile
  static async loadQuestionsAndAnswers(profile: SavedBusinessProfile): Promise<{
    success: boolean
    questions: BusinessQuestion[]
    totalQuestions: number
    error?: string
  }> {
    console.log('[CentralizedDataLoader] Loading Q&A for profile:', profile.name)
    
    try {
      const authService = GoogleAuthService.getInstance()
      const isConnected = authService.isAuthenticated()
      if (!isConnected) {
        return {
          success: false,
          questions: [],
          totalQuestions: 0,
          error: 'Google account not connected'
        }
      }

      const userInfo = authService.getUserInfo()
      const sessionInfo = authService.getSessionInfo()
      
      if (!userInfo || !sessionInfo) {
        return {
          success: false,
          questions: [],
          totalQuestions: 0,
          error: 'User session not available'
        }
      }

      // Extract location ID from the profile's Google Business ID
      const locationId = profile.googleBusinessId.replace('accounts/', '').replace('/locations/', '/locations/')
      
      const questionsResponse = await this.googleAPI.getQuestions(
        '', // We'll need to get the account ID from profile
        locationId,
        50 // Load up to 50 questions
      )

      // Load answers for each question
      const questionsWithAnswers = await Promise.all(
        questionsResponse.questions.map(async (question) => {
          try {
            const answersResponse = await this.googleAPI.getQuestionAnswers(question.name, 10)
            return {
              ...question,
              topAnswers: answersResponse.answers
            }
          } catch (error) {
            console.error(`Failed to load answers for question ${question.name}:`, error)
            return question
          }
        })
      )

      console.log(`[CentralizedDataLoader] Loaded ${questionsWithAnswers.length} questions with answers`)
      
      return {
        success: true,
        questions: questionsWithAnswers,
        totalQuestions: questionsResponse.totalSize
      }
    } catch (error) {
      console.error('[CentralizedDataLoader] Error loading Q&A:', error)
      return {
        success: false,
        questions: [],
        totalQuestions: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Create a new question for a business profile
  static async createQuestion(profile: SavedBusinessProfile, questionText: string): Promise<{
    success: boolean
    question?: BusinessQuestion
    error?: string
  }> {
    console.log('[CentralizedDataLoader] Creating question for profile:', profile.name)
    
    try {
      const authService = GoogleAuthService.getInstance()
      const isConnected = authService.isAuthenticated()
      if (!isConnected) {
        return {
          success: false,
          error: 'Google account not connected'
        }
      }

      // Extract location ID from the profile's Google Business ID
      const locationId = profile.googleBusinessId.replace('accounts/', '').replace('/locations/', '/locations/')
      
      const question = await this.googleAPI.createQuestion(locationId, questionText)

      console.log('[CentralizedDataLoader] Question created successfully')
      
      return {
        success: true,
        question
      }
    } catch (error) {
      console.error('[CentralizedDataLoader] Error creating question:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Answer a question
  static async answerQuestion(questionName: string, answerText: string): Promise<{
    success: boolean
    answer?: any
    error?: string
  }> {
    console.log('[CentralizedDataLoader] Answering question:', questionName)
    
    try {
      const authService = GoogleAuthService.getInstance()
      const isConnected = authService.isAuthenticated()
      if (!isConnected) {
        return {
          success: false,
          error: 'Google account not connected'
        }
      }

      const answer = await this.googleAPI.answerQuestion(questionName, answerText)

      console.log('[CentralizedDataLoader] Question answered successfully')
      
      return {
        success: true,
        answer
      }
    } catch (error) {
      console.error('[CentralizedDataLoader] Error answering question:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  // Enhanced loadAllProfileData to include Q&A
  static async loadAllProfileData(profile: SavedBusinessProfile, options: {
    includeReviews?: boolean
    includeAnalytics?: boolean
    includeMedia?: boolean
    includeQA?: boolean
  } = {}): Promise<{
    success: boolean
    reviews?: BusinessReview[]
    reviewsSummary?: any
    analytics?: PerformanceMetricsResponse
    media?: BusinessMedia
    questions?: BusinessQuestion[]
    totalQuestions?: number
    error?: string
  }> {
    console.log('[CentralizedDataLoader] Loading all profile data for:', profile.name)
    
    try {
      const results: any = { success: true }
      const promises: Promise<any>[] = []

      // Load reviews
      if (options.includeReviews) {
        promises.push(
          this.loadReviews(profile).then(result => {
            if (result.success) {
              results.reviews = result.reviews
              results.reviewsSummary = result.summary
            }
            return result
          })
        )
      }

      // Load analytics with proper parameters
      if (options.includeAnalytics) {
        promises.push(
          this.loadAnalytics(profile, { dateRange: '30' }).then(result => {
            if (result.success) {
              results.analytics = result.data
            }
            return result
          })
        )
      }

      // Load media
      if (options.includeMedia) {
        promises.push(
          this.loadBusinessMedia(profile).then(result => {
            if (result.success) {
              results.media = result.media
            }
            return result
          })
        )
      }

      // Load Q&A
      if (options.includeQA) {
        promises.push(
          this.loadQuestionsAndAnswers(profile).then(result => {
            if (result.success) {
              results.questions = result.questions
              results.totalQuestions = result.totalQuestions
            }
            return result
          })
        )
      }

      await Promise.all(promises)

      console.log('[CentralizedDataLoader] All profile data loaded successfully')
      return results

    } catch (error) {
      console.error('[CentralizedDataLoader] Error loading all profile data:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
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

  // Check authentication status
  static checkAuthStatus(): {
    isConnected: boolean
    userInfo?: { email: string; name: string; picture?: string }
    sessionInfo?: { created_at: number; last_refreshed: number; expires_at: number }
  } {
    const authService = GoogleAuthService.getInstance()
    const isConnected = authService.isAuthenticated()
    
    if (isConnected) {
      const userInfo = authService.getUserInfo()
      const sessionInfo = authService.getSessionInfo()
      return { 
        isConnected, 
        userInfo: userInfo || undefined, 
        sessionInfo: sessionInfo || undefined 
      }
    }
    
    return { isConnected }
  }

  // Bulk operations for efficiency
  static async loadReviewsForAllProfiles(): Promise<{ [profileId: string]: any }> {
    console.log('[CentralizedDataLoader] Loading reviews for all profiles')
    const profiles = this.loadProfiles()
    const results: { [profileId: string]: any } = {}
    
    await Promise.all(
      profiles.map(async (profile) => {
        const result = await this.loadReviews(profile)
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
} 