'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, Building2, MapPin, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { CentralizedDataLoader } from '@/lib/centralized-data-loader'
import { SavedBusinessProfile } from '@/lib/business-profiles-storage'

// Business Logo Component
interface BusinessLogoProps {
  businessName: string
  website?: string
  className?: string
}

function BusinessLogo({ businessName, website, className = "w-8 h-8" }: BusinessLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const loadLogo = async () => {
      if (!website && !businessName) {
        setHasError(true)
        return
      }

      try {
        let domain = ''
        if (website) {
          try {
            domain = new URL(website).hostname.replace('www.', '')
          } catch {
            domain = website.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0]
          }
        }

        const logoSources = [
          domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null,
          domain ? `https://icons.duckduckgo.com/ip3/${domain}.ico` : null,
        ].filter(Boolean)

        if (logoSources.length > 0) {
          setLogoUrl(logoSources[0] as string)
        } else {
          setHasError(true)
        }
      } catch (error) {
        setHasError(true)
      }
    }

    loadLogo()
  }, [businessName, website])

  if (hasError || !logoUrl) {
    return (
      <div className={`${className} bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg`}>
        <Building2 className="w-4 h-4 text-white" />
      </div>
    )
  }

  return (
    <div className={`${className} rounded-full overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50`}>
      <img
        src={logoUrl}
        alt={`${businessName} logo`}
        className="w-full h-full object-contain p-1"
        onError={() => {
          setHasError(true)
          setLogoUrl(null)
        }}
      />
    </div>
  )
}

interface FloatingProfileSelectorProps {
  selectedProfile: SavedBusinessProfile | null
  onProfileSelect: (profile: SavedBusinessProfile) => void
}

export default function FloatingProfileSelector({ selectedProfile, onProfileSelect }: FloatingProfileSelectorProps) {
  const [profiles, setProfiles] = useState<SavedBusinessProfile[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const loadProfiles = () => {
      const savedProfiles = CentralizedDataLoader.loadProfiles()
      setProfiles(savedProfiles)
    }
    loadProfiles()
  }, [])

  if (profiles.length === 0) {
    return null // Don't show if no profiles
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Profile List */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]"
          >
            <Card className="bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-white/30 dark:border-white/20 shadow-2xl">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-3 px-2">
                    Select Business Profile
                  </div>
                  
                  {profiles.map((profile) => (
                    <motion.button
                      key={profile.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onProfileSelect(profile)
                        setIsOpen(false)
                      }}
                      className={`w-full p-3 rounded-xl border transition-all duration-300 text-left ${
                        selectedProfile?.id === profile.id
                          ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-300 dark:border-purple-600'
                          : 'bg-white/50 dark:bg-black/20 border-gray-200 dark:border-gray-700 hover:bg-white/70 dark:hover:bg-black/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <BusinessLogo 
                          businessName={profile.name} 
                          website={profile.website}
                          className="w-10 h-10"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {profile.name}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{profile.address}</span>
                          </div>
                        </div>
                        {selectedProfile?.id === profile.id && (
                          <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className={`h-14 px-4 bg-white/90 dark:bg-black/90 backdrop-blur-xl border border-white/30 dark:border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-300 ${
            isOpen 
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white border-none' 
              : 'text-gray-900 dark:text-white hover:bg-white dark:hover:bg-black/95'
          }`}
        >
          <div className="flex items-center gap-3">
            {selectedProfile ? (
              <>
                <BusinessLogo 
                  businessName={selectedProfile.name} 
                  website={selectedProfile.website}
                  className="w-8 h-8"
                />
                <div className="text-left min-w-0 max-w-32">
                  <div className="font-medium text-sm truncate">
                    {selectedProfile.name}
                  </div>
                  <div className="text-xs opacity-75 truncate">
                    {selectedProfile.category}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 rounded-full flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">
                    Select Profile
                  </div>
                  <div className="text-xs opacity-75">
                    Choose business
                  </div>
                </div>
              </>
            )}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronUp className="w-4 h-4" />
            </motion.div>
          </div>
        </Button>
      </motion.div>
    </>
  )
} 