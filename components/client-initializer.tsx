'use client'

import { useEffect } from 'react'
import { schedulingService } from '@/lib/scheduling-service'
import { GoogleAuthService } from '@/lib/google-auth'
import { GoogleBusinessAPI } from '@/lib/google-business-api'
import { BusinessProfilesStorage } from '@/lib/business-profiles-storage'

export function ClientInitializer() {
  useEffect(() => {
    // Initialize the scheduling service to ensure it starts running
    console.log('[ClientInitializer] Initializing scheduling service...')
    const _ = schedulingService // This ensures the singleton is created and starts running
    console.log('[ClientInitializer] Scheduling service initialized')

    // Auto-import Google Business Profiles in background
    autoImportGoogleProfiles()
  }, [])

  const autoImportGoogleProfiles = async () => {
    try {
      console.log('[ClientInitializer] Auto-importing Google Business Profiles...')
      
      // Check if user is authenticated
      const authService = GoogleAuthService.getInstance()
      const isAuthenticated = authService.isAuthenticated()
      if (!isAuthenticated) {
        console.log('[ClientInitializer] User not authenticated, skipping profile import')
        return
      }

      // Get existing profiles to avoid duplicates
      const existingProfiles = BusinessProfilesStorage.getAllProfiles()
      console.log('[ClientInitializer] Found existing profiles:', existingProfiles.length)

      // Fetch fresh profiles from Google
      const googleAPI = new GoogleBusinessAPI()
      const accounts = await googleAPI.listAccounts()
      
      if (accounts && accounts.length > 0) {
        for (const account of accounts) {
          try {
            const locations = await googleAPI.listLocations(account.name)
            
            if (locations && locations.length > 0) {
              for (const location of locations) {
                // Check if profile already exists
                const exists = existingProfiles.some(p => p.googleBusinessId === location.name)
                
                if (!exists) {
                  // Auto-save new profile
                  const profileData = {
                    id: location.name.split('/').pop() || `profile_${Date.now()}`,
                    name: location.title || 'Unnamed Business',
                    address: location.storefrontAddress?.addressLines?.join(', ') || '',
                    phone: location.primaryPhone || '',
                    website: location.websiteUri || '',
                    category: location.primaryCategory?.displayName || 'Business',
                    rating: 0,
                    reviewCount: 0,
                    status: 'active' as const,
                    lastUpdated: new Date().toISOString(),
                    googleBusinessId: location.name,
                    googleData: location
                  }
                  
                  BusinessProfilesStorage.saveProfile(profileData)
                  console.log('[ClientInitializer] Auto-imported profile:', profileData.name)
                }
              }
            }
          } catch (error) {
            console.error('[ClientInitializer] Error importing profiles for account:', account.name, error)
          }
        }
      }
      
      console.log('[ClientInitializer] Auto-import completed')
    } catch (error) {
      console.error('[ClientInitializer] Failed to auto-import Google profiles:', error)
    }
  }

  return null // This component doesn't render anything
} 