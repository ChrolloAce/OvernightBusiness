'use client'

import { useState, useEffect } from 'react'
import { User } from 'lucide-react'
import { SavedBusinessProfile } from '@/lib/business-profiles-storage'

interface ClientAvatarProps {
  clientName: string
  googleBusinessProfile?: SavedBusinessProfile | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm', 
  lg: 'w-10 h-10 text-base',
  xl: 'w-12 h-12 text-lg'
}

export function ClientAvatar({ 
  clientName, 
  googleBusinessProfile, 
  size = 'md',
  className = '' 
}: ClientAvatarProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)

  // Get client initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  useEffect(() => {
    if (!googleBusinessProfile?.website) {
      setLogoUrl(null)
      setHasError(false)
      return
    }

    const loadLogo = async () => {
      try {
        let domain = ''
        const website = googleBusinessProfile.website
        
        try {
          domain = new URL(website).hostname.replace('www.', '')
        } catch {
          domain = website.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0]
        }

        if (domain) {
          // Try Google's favicon service first
          const logoSources = [
            `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
            `https://icons.duckduckgo.com/ip3/${domain}.ico`
          ]

          setLogoUrl(logoSources[0])
        } else {
          setHasError(true)
        }
      } catch (error) {
        setHasError(true)
      }
    }

    loadLogo()
  }, [googleBusinessProfile?.website])

  const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center font-medium ${className}`

  // If we have a Google Business Profile and a logo, show the logo
  if (googleBusinessProfile && logoUrl && !hasError) {
    return (
      <div className={`${baseClasses} bg-white border border-gray-200 overflow-hidden`}>
        <img
          src={logoUrl}
          alt={`${googleBusinessProfile.name} logo`}
          className="w-full h-full object-contain"
          onError={() => {
            setHasError(true)
            setLogoUrl(null)
          }}
        />
      </div>
    )
  }

  // Otherwise, show minimalistic initials circle
  return (
    <div className={`${baseClasses} bg-gray-100 text-gray-700 border border-gray-200`}>
      {clientName ? getInitials(clientName) : <User className="w-3 h-3" />}
    </div>
  )
}
