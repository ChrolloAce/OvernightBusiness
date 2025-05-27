import { BusinessProfilesStorage, SavedBusinessProfile } from '../business-profiles-storage'

export interface BusinessProfileSummary {
  id: string
  name: string
  category: string
  isVerified: boolean
  rating: number
  reviewCount: number
  status: 'active' | 'pending' | 'suspended'
}

export class BusinessProfileManager {
  private static instance: BusinessProfileManager
  private profiles: SavedBusinessProfile[] = []

  private constructor() {
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

  // Profile Statistics
  public getProfileSummaries(): BusinessProfileSummary[] {
    return this.profiles.map(profile => ({
      id: profile.id,
      name: profile.name,
      category: profile.category,
      isVerified: profile.isVerified || false,
      rating: profile.rating,
      reviewCount: profile.reviewCount,
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