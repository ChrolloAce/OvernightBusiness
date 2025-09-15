'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { SavedBusinessProfile } from '@/lib/business-profiles-storage'
import { CentralizedDataLoader } from '@/lib/centralized-data-loader'

interface ProfileContextType {
  selectedProfile: SavedBusinessProfile | null
  profiles: SavedBusinessProfile[]
  setSelectedProfile: (profile: SavedBusinessProfile | null) => void
  loadProfiles: () => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [selectedProfile, setSelectedProfile] = useState<SavedBusinessProfile | null>(null)
  const [profiles, setProfiles] = useState<SavedBusinessProfile[]>([])

  const loadProfiles = () => {
    const savedProfiles = CentralizedDataLoader.loadProfiles()
    setProfiles(savedProfiles)
    
    // Auto-select first profile if none selected and profiles exist
    if (!selectedProfile && savedProfiles.length > 0) {
      setSelectedProfile(savedProfiles[0])
    }
  }

  useEffect(() => {
    loadProfiles()
  }, [])

  return (
    <ProfileContext.Provider 
      value={{ 
        selectedProfile, 
        profiles, 
        setSelectedProfile, 
        loadProfiles 
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider')
  }
  return context
} 