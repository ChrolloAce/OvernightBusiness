import { BusinessProfilesStorage, SavedBusinessProfile } from '../business-profiles-storage'
import { ReviewsManager, Review, ReviewSummary } from './reviews-manager'

export interface BusinessProfileSummary {
  id: string
  name: string
  category: string
  isVerified: boolean
  rating: number
  reviewCount: number
  status: 'active' | 'pending' | 'suspended'
}

export interface BusinessProfileWithReviews extends SavedBusinessProfile {
  reviews?: Review[]
  reviewSummary?: ReviewSummary
  lastReviewSync?: string
}

export class BusinessProfileManager {
  private static instance: BusinessProfileManager
  private profiles: SavedBusinessProfile[] = []
  private reviewsManager: ReviewsManager

  private constructor() {
    this.reviewsManager = ReviewsManager.getInstance()
    this.loadProfiles()
  }

  public static getInstance(): BusinessProfileManager {
    if (!BusinessProfileManager.instance) {
      BusinessProfileManager.instance = new BusinessProfileManager()
    }
    return BusinessProfileManager.instance
  }

  // Profile Loading and Management
  public loadProfiles(): void {
    this.profiles = BusinessProfilesStorage.getAllProfiles()
  }

  public getAllProfiles(): SavedBusinessProfile[] {
    return [...this.profiles]
  }

  public getProfile(id: string): SavedBusinessProfile | null {
    return this.profiles.find(profile => profile.id === id) || null
  }

  public getProfileByGoogleId(googleBusinessId: string): SavedBusinessProfile | null {
    return this.profiles.find(profile => profile.googleBusinessId === googleBusinessId) || null
  }

  public getProfilesCount(): number {
    return this.profiles.length
  }

  public hasProfiles(): boolean {
    return this.profiles.length > 0
  }

  // Reviews Integration Methods
  public async syncProfileReviews(profileId: string): Promise<{ success: boolean; error?: string; reviewCount?: number }> {
    try {
      const profile = this.getProfile(profileId)
      if (!profile || !profile.googleBusinessId) {
        return { success: false, error: 'Profile not found or missing Google Business ID' }
      }

      console.log('[BusinessProfileManager] Syncing reviews for profile:', profile.name)
      
      // Use the googleBusinessId as the location name for the Reviews API
      const locationName = profile.googleBusinessId
      const reviews = await this.reviewsManager.getReviews(locationName)
      const reviewSummary = this.reviewsManager.generateReviewSummary(reviews)
      
      // Update profile with real review data
      const updatedProfile = {
        ...profile,
        rating: reviewSummary.averageRating,
        reviewCount: reviewSummary.totalReviews,
        lastSynced: new Date().toISOString()
      }

      // Save updated profile
      const success = this.updateProfile(profileId, updatedProfile)
      
      if (success) {
        console.log(`[BusinessProfileManager] Successfully synced ${reviews.length} reviews for ${profile.name}`)
        return { 
          success: true, 
          reviewCount: reviews.length 
        }
      } else {
        return { success: false, error: 'Failed to update profile with review data' }
      }
    } catch (error) {
      console.error('[BusinessProfileManager] Failed to sync reviews:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  public async syncAllProfileReviews(): Promise<{ 
    totalProfiles: number
    successCount: number
    failureCount: number
    errors: string[]
  }> {
    const results = {
      totalProfiles: this.profiles.length,
      successCount: 0,
      failureCount: 0,
      errors: [] as string[]
    }

    console.log(`[BusinessProfileManager] Starting bulk review sync for ${this.profiles.length} profiles`)

    for (const profile of this.profiles) {
      try {
        const result = await this.syncProfileReviews(profile.id)
        if (result.success) {
          results.successCount++
        } else {
          results.failureCount++
          results.errors.push(`${profile.name}: ${result.error}`)
        }
      } catch (error) {
        results.failureCount++
        results.errors.push(`${profile.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    console.log(`[BusinessProfileManager] Bulk sync completed: ${results.successCount} success, ${results.failureCount} failures`)
    return results
  }

  public async getProfileWithReviews(profileId: string): Promise<BusinessProfileWithReviews | null> {
    try {
      const profile = this.getProfile(profileId)
      if (!profile || !profile.googleBusinessId) {
        return profile
      }

      const locationName = profile.googleBusinessId
      const reviews = await this.reviewsManager.getReviews(locationName)
      const reviewSummary = this.reviewsManager.generateReviewSummary(reviews)

      return {
        ...profile,
        reviews,
        reviewSummary,
        lastReviewSync: new Date().toISOString()
      }
    } catch (error) {
      console.error('[BusinessProfileManager] Failed to get profile with reviews:', error)
      return this.getProfile(profileId)
    }
  }

  public async getProfileReviews(profileId: string): Promise<Review[]> {
    try {
      const profile = this.getProfile(profileId)
      if (!profile || !profile.googleBusinessId) {
        return []
      }

      const locationName = profile.googleBusinessId
      return await this.reviewsManager.getReviews(locationName)
    } catch (error) {
      console.error('[BusinessProfileManager] Failed to get profile reviews:', error)
      return []
    }
  }

  public async getProfileReviewSummary(profileId: string): Promise<ReviewSummary | null> {
    try {
      const reviews = await this.getProfileReviews(profileId)
      return this.reviewsManager.generateReviewSummary(reviews)
    } catch (error) {
      console.error('[BusinessProfileManager] Failed to get profile review summary:', error)
      return null
    }
  }

  // Profile Operations
  public saveProfile(profile: SavedBusinessProfile): boolean {
    try {
      BusinessProfilesStorage.saveProfile(profile)
      this.loadProfiles() // Refresh local cache
      return true
    } catch (error) {
      console.error('[BusinessProfileManager] Failed to save profile:', error)
      return false
    }
  }

  public updateProfile(id: string, updates: Partial<SavedBusinessProfile>): boolean {
    try {
      const success = BusinessProfilesStorage.updateProfile(id, updates)
      if (success) {
        this.loadProfiles() // Refresh local cache
      }
      return success
    } catch (error) {
      console.error('[BusinessProfileManager] Failed to update profile:', error)
      return false
    }
  }

  public deleteProfile(id: string): boolean {
    try {
      const success = BusinessProfilesStorage.deleteProfile(id)
      if (success) {
        this.loadProfiles() // Refresh local cache
      }
      return success
    } catch (error) {
      console.error('[BusinessProfileManager] Failed to delete profile:', error)
      return false
    }
  }

  public clearAllProfiles(): boolean {
    try {
      BusinessProfilesStorage.clearAllProfiles()
      this.profiles = []
      return true
    } catch (error) {
      console.error('[BusinessProfileManager] Failed to clear profiles:', error)
      return false
    }
  }

  // Profile Validation
  public profileExists(id: string): boolean {
    return this.profiles.some(profile => profile.id === id)
  }

  public profileExistsByGoogleId(googleBusinessId: string): boolean {
    return BusinessProfilesStorage.profileExistsByGoogleId(googleBusinessId)
  }

  public validateProfile(profile: Partial<SavedBusinessProfile>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!profile.name?.trim()) {
      errors.push('Business name is required')
    }

    if (!profile.address?.trim()) {
      errors.push('Business address is required')
    }

    if (!profile.category?.trim()) {
      errors.push('Business category is required')
    }

    if (!profile.googleBusinessId?.trim()) {
      errors.push('Google Business ID is required')
    }

    if (profile.website && !this.isValidUrl(profile.website)) {
      errors.push('Invalid website URL')
    }

    if (profile.rating !== undefined && (profile.rating < 0 || profile.rating > 5)) {
      errors.push('Rating must be between 0 and 5')
    }

    if (profile.reviewCount !== undefined && profile.reviewCount < 0) {
      errors.push('Review count cannot be negative')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Profile Filtering and Searching
  public getVerifiedProfiles(): SavedBusinessProfile[] {
    return this.profiles.filter(profile => profile.isVerified)
  }

  public getUnverifiedProfiles(): SavedBusinessProfile[] {
    return this.profiles.filter(profile => !profile.isVerified)
  }

  public getActiveProfiles(): SavedBusinessProfile[] {
    return this.profiles.filter(profile => profile.status === 'active')
  }

  public getPendingProfiles(): SavedBusinessProfile[] {
    return this.profiles.filter(profile => profile.status === 'pending')
  }

  public getSuspendedProfiles(): SavedBusinessProfile[] {
    return this.profiles.filter(profile => profile.status === 'suspended')
  }

  public searchProfiles(query: string): SavedBusinessProfile[] {
    const lowercaseQuery = query.toLowerCase().trim()
    
    if (!lowercaseQuery) {
      return this.getAllProfiles()
    }

    return this.profiles.filter(profile => 
      profile.name.toLowerCase().includes(lowercaseQuery) ||
      profile.category.toLowerCase().includes(lowercaseQuery) ||
      profile.address.toLowerCase().includes(lowercaseQuery) ||
      (profile.googleData?.businessDescription?.toLowerCase().includes(lowercaseQuery))
    )
  }

  public getProfilesByCategory(category: string): SavedBusinessProfile[] {
    return this.profiles.filter(profile => 
      profile.category.toLowerCase() === category.toLowerCase()
    )
  }

  // Profile Statistics (Updated with Real Review Data)
  public getProfileSummaries(): BusinessProfileSummary[] {
    return this.profiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      category: profile.category,
      isVerified: profile.isVerified || false,
      rating: profile.rating, // Now uses real data from Google
      reviewCount: profile.reviewCount, // Now uses real data from Google
      status: profile.status
    }))
  }

  public getAverageRating(): number {
    if (this.profiles.length === 0) return 0
    
    const totalRating = this.profiles.reduce((sum, profile) => sum + profile.rating, 0)
    return Math.round((totalRating / this.profiles.length) * 10) / 10
  }

  public getTotalReviews(): number {
    return this.profiles.reduce((sum, profile) => sum + profile.reviewCount, 0)
  }

  public getVerificationRate(): number {
    if (this.profiles.length === 0) return 0
    
    const verifiedCount = this.getVerifiedProfiles().length
    return Math.round((verifiedCount / this.profiles.length) * 100)
  }

  public getCategoryDistribution(): { [category: string]: number } {
    const distribution: { [category: string]: number } = {}
    
    this.profiles.forEach(profile => {
      const category = profile.category
      distribution[category] = (distribution[category] || 0) + 1
    })
    
    return distribution
  }

  // Review Analytics
  public async getReviewAnalytics(): Promise<{
    totalReviews: number
    averageRating: number
    positiveReviews: number
    neutralReviews: number
    negativeReviews: number
    unrepliedReviews: number
    recentReviews: Review[]
  }> {
    let totalReviews = 0
    let totalRatingPoints = 0
    let positiveReviews = 0
    let neutralReviews = 0
    let negativeReviews = 0
    let unrepliedReviews = 0
    const allRecentReviews: Review[] = []

    for (const profile of this.profiles) {
      try {
        const reviews = await this.getProfileReviews(profile.id)
        const summary = this.reviewsManager.generateReviewSummary(reviews)
        
        totalReviews += summary.totalReviews
        totalRatingPoints += summary.averageRating * summary.totalReviews
        unrepliedReviews += summary.unrepliedReviews.length
        
        reviews.forEach(review => {
          const sentiment = this.reviewsManager.getReviewSentiment(review.starRating)
          if (sentiment === 'positive') positiveReviews++
          else if (sentiment === 'neutral') neutralReviews++
          else negativeReviews++
        })
        
        allRecentReviews.push(...summary.recentReviews)
      } catch (error) {
        console.error(`Failed to get reviews for profile ${profile.name}:`, error)
      }
    }

    // Sort and limit recent reviews
    const recentReviews = allRecentReviews
      .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
      .slice(0, 10)

    return {
      totalReviews,
      averageRating: totalReviews > 0 ? Math.round((totalRatingPoints / totalReviews) * 10) / 10 : 0,
      positiveReviews,
      neutralReviews,
      negativeReviews,
      unrepliedReviews,
      recentReviews
    }
  }

  // Profile Utilities
  public getProfileDisplayName(profile: SavedBusinessProfile): string {
    return profile.name || 'Unknown Business'
  }

  public getProfileInitials(profile: SavedBusinessProfile): string {
    const name = this.getProfileDisplayName(profile)
    return name.charAt(0).toUpperCase()
  }

  public getProfileStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  public formatLastUpdated(profile: SavedBusinessProfile): string {
    try {
      return new Date(profile.lastUpdated).toLocaleDateString()
    } catch {
      return 'Unknown'
    }
  }

  public formatLastSynced(profile: SavedBusinessProfile): string {
    try {
      return new Date(profile.lastSynced).toLocaleString()
    } catch {
      return 'Never synced'
    }
  }

  // Data Export/Import
  public exportProfiles(): string {
    return BusinessProfilesStorage.exportProfiles()
  }

  public importProfiles(jsonData: string): boolean {
    try {
      const success = BusinessProfilesStorage.importProfiles(jsonData)
      if (success) {
        this.loadProfiles() // Refresh local cache
      }
      return success
    } catch (error) {
      console.error('[BusinessProfileManager] Failed to import profiles:', error)
      return false
    }
  }

  // Sync Operations
  public getLastSyncTime(): Date | null {
    return BusinessProfilesStorage.getLastSyncTime()
  }

  public updateLastSyncTime(): void {
    BusinessProfilesStorage.updateLastSyncTime()
  }

  public needsSync(profile: SavedBusinessProfile, maxAgeHours: number = 24): boolean {
    if (!profile.lastSynced) return true
    
    const lastSyncTime = new Date(profile.lastSynced)
    const now = new Date()
    const hoursSinceSync = (now.getTime() - lastSyncTime.getTime()) / (1000 * 60 * 60)
    
    return hoursSinceSync > maxAgeHours
  }

  public getProfilesNeedingSync(maxAgeHours: number = 24): SavedBusinessProfile[] {
    return this.profiles.filter(profile => this.needsSync(profile, maxAgeHours))
  }

  public needsReviewSync(profile: SavedBusinessProfile, maxAgeHours: number = 6): boolean {
    if (!profile.lastSynced) return true
    
    const lastSyncTime = new Date(profile.lastSynced)
    const now = new Date()
    const hoursSinceSync = (now.getTime() - lastSyncTime.getTime()) / (1000 * 60 * 60)
    
    return hoursSinceSync > maxAgeHours
  }

  public getProfilesNeedingReviewSync(maxAgeHours: number = 6): SavedBusinessProfile[] {
    return this.profiles.filter(profile => this.needsReviewSync(profile, maxAgeHours))
  }

  // Business Hours Helpers
  public isBusinessOpen(profile: SavedBusinessProfile): boolean | null {
    if (!profile.googleData?.businessHours) return null
    
    const now = new Date()
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' })
    const currentTime = now.toTimeString().slice(0, 5) // HH:MM format
    
    const todayHours = profile.googleData.businessHours.find(hour => 
      hour.includes(currentDay)
    )
    
    if (!todayHours) return false
    
    // Simple time comparison (this could be enhanced for more complex scenarios)
    const timeMatch = todayHours.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/)
    if (!timeMatch) return null
    
    const [, openTime, closeTime] = timeMatch
    return currentTime >= openTime && currentTime <= closeTime
  }

  // Refresh and Cleanup
  public refresh(): void {
    this.loadProfiles()
  }

  public cleanup(): void {
    this.profiles = []
  }
} 