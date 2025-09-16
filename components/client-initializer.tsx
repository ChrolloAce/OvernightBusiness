'use client'

import { useEffect } from 'react'
import { schedulingService } from '@/lib/scheduling-service'
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
      
      // Import required services
      const { GoogleAuthService } = await import('@/lib/google-auth')
      const { CentralizedDataLoader } = await import('@/lib/centralized-data-loader')
      
      // Check if user is authenticated with Google
      const googleAuth = GoogleAuthService.getInstance()
      if (!googleAuth.isAuthenticated()) {
        console.log('[ClientInitializer] User not authenticated with Google, skipping auto-import')
        return
      }

      // Check if we already have profiles
      const existingProfiles = BusinessProfilesStorage.getAllProfiles()
      console.log('[ClientInitializer] Found existing profiles:', existingProfiles.length)

      // Always try to fetch fresh profiles from Google to ensure we have the latest
      try {
        console.log('[ClientInitializer] Fetching fresh Google Business Profiles...')
        
        // Get access token for API calls
        const accessToken = await googleAuth.getValidAccessToken()
        
        // Use CentralizedDataLoader to add Google profiles
        const result = await CentralizedDataLoader.addGoogleProfile(accessToken)
        
        if (result.success && result.profiles) {
          console.log(`[ClientInitializer] Successfully imported ${result.profiles.length} Google Business Profiles`)
          
          // Get updated profile count
          const updatedProfiles = BusinessProfilesStorage.getAllProfiles()
          console.log(`[ClientInitializer] Total profiles now available: ${updatedProfiles.length}`)
        } else {
          console.log('[ClientInitializer] Failed to import Google profiles:', result.error)
        }
      } catch (error) {
        console.error('[ClientInitializer] Error fetching Google profiles:', error)
        console.log('[ClientInitializer] Users can manually connect Google Business Profiles when needed')
      }
      
    } catch (error) {
      console.error('[ClientInitializer] Error during auto-import:', error)
    }
  }

  return null // This component doesn't render anything
} 