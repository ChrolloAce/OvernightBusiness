'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2, 
  Sparkles, 
  FileText, 
  MessageSquare,
  Globe,
  Phone,
  MapPin,
  Star,
  Calendar,
  Users,
  Camera,
  Tag,
  Zap,
  TrendingUp,
  Shield,
  Award,
  RefreshCw,
  Loader2,
  Eye,
  Settings,
  Target,
  BarChart3,
  Info,
  Plus,
  ExternalLink,
  Share,
  Navigation,
  BookOpen,
  Edit3,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Download,
  Copy
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BusinessProfilesStorage, SavedBusinessProfile } from '@/lib/business-profiles-storage'
import { GoogleBusinessAPI, MediaItem, BusinessMedia, BusinessReview } from '@/lib/google-business-api'
import { CentralizedDataLoader } from '@/lib/centralized-data-loader'

// Business Logo Component
interface BusinessLogoProps {
  businessName: string
  website?: string
  className?: string
}

function BusinessLogo({ businessName, website, className = "w-16 h-16" }: BusinessLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const loadLogo = async () => {
      if (!website && !businessName) {
        setIsLoading(false)
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
          setIsLoading(false)
        } else {
          setHasError(true)
          setIsLoading(false)
        }
      } catch (error) {
        setHasError(true)
        setIsLoading(false)
      }
    }

    loadLogo()
  }, [businessName, website])

  if (isLoading) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center`}>
        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-gray-400 animate-spin" />
      </div>
    )
  }

  if (hasError || !logoUrl) {
    return (
      <div className={`${className} bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg`}>
        <Building2 className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
      </div>
    )
  }

  return (
    <div className={`${className} rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50`}>
      <Image
        src={logoUrl}
        alt={`${businessName} logo`}
        width={64}
        height={64}
        className="w-full h-full object-contain p-1 sm:p-2"
        onError={() => {
          setHasError(true)
          setLogoUrl(null)
        }}
        unoptimized
      />
    </div>
  )
}

// Image Gallery Modal Component
interface ImageGalleryModalProps {
  images: MediaItem[]
  isOpen: boolean
  onClose: () => void
  selectedImageIndex?: number
}

function ImageGalleryModal({ images, isOpen, onClose, selectedImageIndex = 0 }: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(selectedImageIndex)

  useEffect(() => {
    setCurrentIndex(selectedImageIndex)
  }, [selectedImageIndex])

  if (!isOpen) return null

  const currentImage = images[currentIndex]

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const downloadImage = () => {
    if (currentImage) {
      const link = document.createElement('a')
      link.href = GoogleBusinessAPI.getBestImageUrl(currentImage) || ''
      link.download = `business-image-${currentIndex + 1}.jpg`
      link.click()
    }
  }

  const copyImageUrl = async () => {
    if (currentImage) {
      const imageUrl = GoogleBusinessAPI.getBestImageUrl(currentImage) || ''
      await navigator.clipboard.writeText(imageUrl)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h3 className="text-xl font-bold">Business Photos</h3>
                <p className="text-sm opacity-75">{currentIndex + 1} of {images.length}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadImage}
                  className="text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyImageUrl}
                  className="text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center">
            {currentImage && (
              <Image
                src={GoogleBusinessAPI.getBestImageUrl(currentImage) || ''}
                alt={`Business photo ${currentIndex + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
                unoptimized
              />
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 backdrop-blur-sm rounded-full"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 backdrop-blur-sm rounded-full"
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnail Grid */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6">
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    index === currentIndex ? 'border-white' : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <Image
                    src={GoogleBusinessAPI.getBestImageUrl(image) || ''}
                    alt={`Thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Image Grid Component
interface ImageGridProps {
  images: MediaItem[]
  maxDisplay?: number
  className?: string
}

function ImageGrid({ images, maxDisplay = 6, className = "" }: ImageGridProps) {
  const [showModal, setShowModal] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className={`${className} bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center`}>
        <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No photos available</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Add photos to showcase your business</p>
      </div>
    )
  }

  const displayImages = images.slice(0, maxDisplay)
  const remainingCount = Math.max(0, images.length - maxDisplay)

  const openModal = (index: number) => {
    setSelectedIndex(index)
    setShowModal(true)
  }

  return (
    <>
      <div className={`${className} grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-4`}>
        {displayImages.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative group cursor-pointer"
            onClick={() => openModal(index)}
          >
            <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Image
                src={GoogleBusinessAPI.getBestImageUrl(image) || ''}
                alt={`Business photo ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
            </div>
          </motion.div>
        ))}
        
        {remainingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: displayImages.length * 0.1 }}
            className="relative group cursor-pointer"
            onClick={() => openModal(maxDisplay)}
          >
            <div className="aspect-square relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-dashed border-blue-300 dark:border-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 flex items-center justify-center">
              <div className="text-center">
                <Plus className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  +{remainingCount} more
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <ImageGalleryModal
        images={images}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedImageIndex={selectedIndex}
      />
    </>
  )
}

export default function ContentHubPage() {
  const [profiles, setProfiles] = useState<SavedBusinessProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<SavedBusinessProfile | null>(null)
  const [businessMedia, setBusinessMedia] = useState<BusinessMedia | null>(null)
  const [reviews, setReviews] = useState<BusinessReview[]>([])
  const [reviewsSummary, setReviewsSummary] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [loadingReviews, setLoadingReviews] = useState(false)

  useEffect(() => {
    loadProfiles()
  }, [])

  // Auto-load data when profile changes
  useEffect(() => {
    if (selectedProfile) {
      loadAllProfileData(selectedProfile)
    }
  }, [selectedProfile])

  const loadProfiles = () => {
    const savedProfiles = CentralizedDataLoader.loadProfiles()
    setProfiles(savedProfiles)
    if (savedProfiles.length > 0 && !selectedProfile) {
      const firstProfile = savedProfiles[0]
      setSelectedProfile(firstProfile)
    }
  }

  const loadAllProfileData = async (profile: SavedBusinessProfile) => {
    setLoading(true)
    setLoadingMedia(true)
    setLoadingReviews(true)

    try {
      // Load all data for the profile
      const result = await CentralizedDataLoader.loadAllProfileData(profile, {
        includeReviews: true,
        includeAnalytics: false, // We don't need analytics in content hub
        includeMedia: true
      })

      if (result.success) {
        if (result.media) {
          setBusinessMedia(result.media)
        }
        if (result.reviews && result.reviewsSummary) {
          setReviews(result.reviews)
          setReviewsSummary(result.reviewsSummary)
        }
      }
    } catch (error) {
      console.error('Failed to load profile data:', error)
    } finally {
      setLoading(false)
      setLoadingMedia(false)
      setLoadingReviews(false)
    }
  }

  const handleProfileSelect = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId)
    if (profile) {
      setSelectedProfile(profile)
      // Reset data for new profile
      setBusinessMedia(null)
      setReviews([])
      setReviewsSummary(null)
    }
  }

  const refreshData = () => {
    if (selectedProfile) {
      loadAllProfileData(selectedProfile)
    }
  }

  // Action button handlers
  const handleWebsiteClick = () => {
    if (selectedProfile?.website) {
      window.open(selectedProfile.website, '_blank')
    }
  }

  const handleDirectionsClick = () => {
    if (selectedProfile?.address) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedProfile.address)}`
      window.open(mapsUrl, '_blank')
    }
  }

  const handleReviewsClick = () => {
    if (selectedProfile?.googleBusinessId) {
      // Try to construct Google Business reviews URL
      const locationId = selectedProfile.googleBusinessId.split('/').pop()
      const reviewsUrl = `https://business.google.com/dashboard/l/${locationId}/reviews`
      window.open(reviewsUrl, '_blank')
    }
  }

  const handleShareClick = async () => {
    if (selectedProfile) {
      const shareData = {
        title: selectedProfile.name,
        text: `Check out ${selectedProfile.name} - ${selectedProfile.category}`,
        url: selectedProfile.website || window.location.href
      }

      try {
        if (navigator.share) {
          await navigator.share(shareData)
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(shareData.url)
          alert('Link copied to clipboard!')
        }
      } catch (error) {
        console.error('Error sharing:', error)
      }
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatBusinessHours = (profile: SavedBusinessProfile) => {
    const hours = profile.googleData?.businessHours
    if (!hours || hours.length === 0) {
      return ['Hours not available']
    }

    // Group hours by time to show ranges like "Mon-Fri: 9:00 AM - 5:00 PM"
    const groupedHours: { [key: string]: string[] } = {}
    
    hours.forEach(hour => {
      const [day, time] = hour.split(': ')
      if (!groupedHours[time]) {
        groupedHours[time] = []
      }
      groupedHours[time].push(day)
    })

    return Object.entries(groupedHours).map(([time, days]) => {
      let dayRange = ''
      if (days.length === 1) {
        dayRange = days[0]
      } else if (days.length === 5 && days.includes('Monday') && days.includes('Friday')) {
        dayRange = 'Mon-Fri'
      } else if (days.length === 2 && days.includes('Saturday') && days.includes('Sunday')) {
        dayRange = 'Weekends'
      } else if (days.length === 7) {
        dayRange = 'Every day'
      } else {
        dayRange = days.join(', ')
      }
      
      return `${dayRange}: ${time}`
    })
  }

  const getBusinessCategories = (profile: SavedBusinessProfile) => {
    return profile.googleData?.allCategories || [profile.category]
  }

  const getBusinessServices = (profile: SavedBusinessProfile) => {
    return profile.googleData?.serviceTypes?.map(service => service.displayName) || []
  }

  return (
    <div className="min-h-screen">
      {/* Page Content */}
      <main className="p-4 lg:p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 lg:space-y-6"
        >
          {/* Page Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 rounded-xl lg:rounded-2xl blur-xl lg:blur-2xl" />
            <div className="relative bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-xl lg:rounded-2xl border border-white/20 dark:border-white/10 p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
                        Content Hub
                      </h1>
                      <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 font-medium">
                        Manage your business profile content and media
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={refreshData} 
                  disabled={loading || !selectedProfile}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <RefreshCw className={`w-4 h-4 mr-2 relative z-10 ${loading ? 'animate-spin' : ''}`} />
                  <span className="relative z-10">Refresh Content</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Business Profile Selector */}
          <Card className="bg-white/80 dark:bg-black/40 backdrop-blur-xl border-white/30 dark:border-white/20 shadow-lg">
            <CardHeader className="pb-3 lg:pb-6">
              <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                <Building2 className="w-4 h-4 lg:w-5 lg:h-5" />
                Select Business Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedProfile?.id || ''} onValueChange={handleProfileSelect}>
                <SelectTrigger className="h-12 lg:h-16 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300">
                  <SelectValue placeholder="Choose a business profile to manage content">
                    {selectedProfile && (
                      <div className="flex items-center gap-2 lg:gap-3">
                        <BusinessLogo 
                          businessName={selectedProfile.name} 
                          website={selectedProfile.website}
                          className="w-8 h-8 lg:w-10 lg:h-10"
                        />
                        <div className="text-left min-w-0 flex-1">
                          <div className="font-medium text-gray-900 dark:text-white text-sm lg:text-base truncate">{selectedProfile.name}</div>
                          <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 truncate">{selectedProfile.address}</div>
                        </div>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-white/30 dark:border-white/20">
                  {profiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.id} className="h-12 lg:h-16 p-2 lg:p-3">
                      <div className="flex items-center gap-2 lg:gap-3 w-full">
                        <BusinessLogo 
                          businessName={profile.name} 
                          website={profile.website}
                          className="w-8 h-8 lg:w-10 lg:h-10"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white text-sm lg:text-base truncate">{profile.name}</div>
                          <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 truncate">{profile.address}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedProfile && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Business Overview */}
              <div className="lg:col-span-1 space-y-6">
                {/* Business Info Card */}
                <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <BusinessLogo 
                        businessName={selectedProfile.name} 
                        website={selectedProfile.website}
                        className="w-16 h-16 lg:w-20 lg:h-20"
                      />
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                          {selectedProfile.name}
                        </h2>
                        <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 truncate">
                          {selectedProfile.category}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {renderStars(selectedProfile.rating)}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedProfile.rating} • {reviewsSummary?.totalReviews || selectedProfile.reviewCount || 0} Google reviews
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProfile.website && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleWebsiteClick}
                          className="flex items-center justify-center gap-2 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300"
                        >
                          <Globe className="w-4 h-4" />
                          <span className="hidden sm:inline">Website</span>
                        </Button>
                      )}
                      {selectedProfile.address && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleDirectionsClick}
                          className="flex items-center justify-center gap-2 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300"
                        >
                          <Navigation className="w-4 h-4" />
                          <span className="hidden sm:inline">Directions</span>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleReviewsClick}
                        className="flex items-center justify-center gap-2 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">Reviews</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleShareClick}
                        className="flex items-center justify-center gap-2 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300"
                      >
                        <Share className="w-4 h-4" />
                        <span className="hidden sm:inline">Share</span>
                      </Button>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Contact Information</h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {selectedProfile.address}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {selectedProfile.phone}
                          </p>
                        </div>
                        
                        {selectedProfile.website && (
                          <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <a 
                              href={selectedProfile.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-300 truncate"
                            >
                              {selectedProfile.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Business Hours */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Business Hours
                      </h3>
                      <div className="space-y-1">
                        {formatBusinessHours(selectedProfile).slice(0, 4).map((hour, index) => (
                          <div key={index} className="flex justify-between items-center py-1 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                              {hour.split(': ')[0]}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {hour.split(': ')[1]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Categories */}
                    {getBusinessCategories(selectedProfile).length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Categories</h3>
                        <div className="flex flex-wrap gap-2">
                          {getBusinessCategories(selectedProfile).slice(0, 4).map((category, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Services */}
                {getBusinessServices(selectedProfile).length > 0 && (
                  <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        Services
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {getBusinessServices(selectedProfile).slice(0, 6).map((service, index) => (
                          <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Content Management */}
              <div className="lg:col-span-2 space-y-6">
                {/* Business Photos */}
                <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Business Photos
                      </div>
                      {businessMedia && businessMedia.allPhotos.length > 0 && (
                        <Badge variant="secondary">
                          {businessMedia.allPhotos.length} photos
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingMedia ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                          <p className="text-lg font-medium">Loading photos...</p>
                        </div>
                      </div>
                    ) : (
                      <ImageGrid 
                        images={businessMedia?.allPhotos || []} 
                        maxDisplay={6}
                        className="w-full"
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Photo Categories */}
                {businessMedia && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { title: 'Exterior Photos', photos: businessMedia.exteriorPhotos, icon: Building2 },
                      { title: 'Interior Photos', photos: businessMedia.interiorPhotos, icon: Building2 },
                      { title: 'Product Photos', photos: businessMedia.productPhotos, icon: Tag },
                      { title: 'Team Photos', photos: businessMedia.teamPhotos, icon: Users }
                    ].map(({ title, photos, icon: Icon }) => 
                      photos.length > 0 && (
                        <Card key={title} className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border-white/30 dark:border-white/20">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Icon className="w-4 h-4" />
                              {title}
                              <Badge variant="secondary" className="ml-auto">
                                {photos.length}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ImageGrid 
                              images={photos} 
                              maxDisplay={4}
                              className="w-full"
                            />
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
} 