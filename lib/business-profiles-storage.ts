// Local storage service for business profiles
export interface SavedBusinessProfile {
  id: string
  name: string
  address: string
  phone: string
  website: string
  category: string
  rating: number
  reviewCount: number
  status: 'active' | 'pending' | 'suspended'
  lastUpdated: string
  googleBusinessId: string
  // Additional Google Business data
  googleData?: {
    title?: string
    storefrontAddress?: any
    primaryCategory?: any
    regularHours?: any
    metadata?: any
    latlng?: any
    locationState?: any
    attributes?: any[]
  }
  // Computed fields
  isVerified?: boolean
  totalReviews?: number
  lastSynced: string
  createdAt: string
}

export class BusinessProfilesStorage {
  private static readonly STORAGE_KEY = 'overnight_biz_profiles'
  private static readonly SYNC_KEY = 'overnight_biz_last_sync'

  // Save a business profile
  static saveProfile(profile: SavedBusinessProfile): void {
    if (typeof window === 'undefined') return

    try {
      const profiles = this.getAllProfiles()
      const existingIndex = profiles.findIndex(p => p.id === profile.id)
      
      const updatedProfile = {
        ...profile,
        lastUpdated: new Date().toISOString(),
        lastSynced: new Date().toISOString()
      }

      if (existingIndex >= 0) {
        profiles[existingIndex] = updatedProfile
      } else {
        profiles.push(updatedProfile)
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles))
      console.log('[Business Profiles Storage] Saved profile:', profile.name)
    } catch (error) {
      console.error('[Business Profiles Storage] Failed to save profile:', error)
    }
  }

  // Get all saved profiles
  static getAllProfiles(): SavedBusinessProfile[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('[Business Profiles Storage] Failed to load profiles:', error)
      return []
    }
  }

  // Get a specific profile by ID
  static getProfile(id: string): SavedBusinessProfile | null {
    const profiles = this.getAllProfiles()
    return profiles.find(p => p.id === id) || null
  }

  // Update a profile
  static updateProfile(id: string, updates: Partial<SavedBusinessProfile>): boolean {
    try {
      const profiles = this.getAllProfiles()
      const index = profiles.findIndex(p => p.id === id)
      
      if (index >= 0) {
        profiles[index] = {
          ...profiles[index],
          ...updates,
          lastUpdated: new Date().toISOString()
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles))
        console.log('[Business Profiles Storage] Updated profile:', id)
        return true
      }
      return false
    } catch (error) {
      console.error('[Business Profiles Storage] Failed to update profile:', error)
      return false
    }
  }

  // Delete a profile
  static deleteProfile(id: string): boolean {
    try {
      const profiles = this.getAllProfiles()
      const filteredProfiles = profiles.filter(p => p.id !== id)
      
      if (filteredProfiles.length !== profiles.length) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredProfiles))
        console.log('[Business Profiles Storage] Deleted profile:', id)
        return true
      }
      return false
    } catch (error) {
      console.error('[Business Profiles Storage] Failed to delete profile:', error)
      return false
    }
  }

  // Clear all profiles
  static clearAllProfiles(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(this.STORAGE_KEY)
      localStorage.removeItem(this.SYNC_KEY)
      console.log('[Business Profiles Storage] Cleared all profiles')
    } catch (error) {
      console.error('[Business Profiles Storage] Failed to clear profiles:', error)
    }
  }

  // Get profiles count
  static getProfilesCount(): number {
    return this.getAllProfiles().length
  }

  // Check if a Google Business ID already exists
  static profileExistsByGoogleId(googleBusinessId: string): boolean {
    const profiles = this.getAllProfiles()
    return profiles.some(p => p.googleBusinessId === googleBusinessId)
  }

  // Get last sync time
  static getLastSyncTime(): Date | null {
    if (typeof window === 'undefined') return null

    try {
      const lastSync = localStorage.getItem(this.SYNC_KEY)
      return lastSync ? new Date(lastSync) : null
    } catch (error) {
      console.error('[Business Profiles Storage] Failed to get last sync time:', error)
      return null
    }
  }

  // Update last sync time
  static updateLastSyncTime(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(this.SYNC_KEY, new Date().toISOString())
    } catch (error) {
      console.error('[Business Profiles Storage] Failed to update sync time:', error)
    }
  }

  // Export profiles as JSON
  static exportProfiles(): string {
    const profiles = this.getAllProfiles()
    return JSON.stringify(profiles, null, 2)
  }

  // Import profiles from JSON
  static importProfiles(jsonData: string): boolean {
    try {
      const profiles = JSON.parse(jsonData) as SavedBusinessProfile[]
      
      // Validate the data structure
      if (!Array.isArray(profiles)) {
        throw new Error('Invalid data format')
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profiles))
      console.log('[Business Profiles Storage] Imported', profiles.length, 'profiles')
      return true
    } catch (error) {
      console.error('[Business Profiles Storage] Failed to import profiles:', error)
      return false
    }
  }
} 