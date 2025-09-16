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
      
      // Check if we already have profiles
      const existingProfiles = BusinessProfilesStorage.getAllProfiles()
      console.log('[ClientInitializer] Found existing profiles:', existingProfiles.length)

      // If we already have profiles, skip auto-import
      if (existingProfiles.length > 0) {
        console.log('[ClientInitializer] Profiles already exist, skipping auto-import')
        return
      }

      // Try to load profiles from Google (simplified approach)
      try {
        // Import the CentralizedDataLoader which handles Google profile loading
        const { CentralizedDataLoader } = await import('@/lib/centralized-data-loader')
        const profiles = CentralizedDataLoader.loadProfiles()
        
        if (profiles.length === 0) {
          console.log('[ClientInitializer] No Google profiles found to auto-import')
          console.log('[ClientInitializer] Users can manually connect Google Business Profiles when needed')
        } else {
          console.log('[ClientInitializer] Auto-imported profiles:', profiles.length)
        }
      } catch (error) {
        console.log('[ClientInitializer] Auto-import not available, manual connection required:', error)
      }
      
    } catch (error) {
      console.error('[ClientInitializer] Failed to auto-import Google profiles:', error)
    }
  }

  return null // This component doesn't render anything
} 