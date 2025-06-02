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
  Heart,
  ThumbsUp,
  Send,
  Copy
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BusinessProfilesStorage, SavedBusinessProfile } from '@/lib/business-profiles-storage'
import { GoogleBusinessAPI, MediaItem, BusinessMedia, BusinessReview, BusinessQuestion } from '@/lib/google-business-api'
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
  const [loading, setLoading] = useState(false)
  const [businessMedia, setBusinessMedia] = useState<BusinessMedia | null>(null)
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [reviews, setReviews] = useState<BusinessReview[]>([])
  const [reviewsSummary, setReviewsSummary] = useState<any>(null)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [questions, setQuestions] = useState<BusinessQuestion[]>([])
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showQAModal, setShowQAModal] = useState(false)
  const [newQuestion, setNewQuestion] = useState('')
  const [newAnswer, setNewAnswer] = useState('')
  const [selectedQuestionForAnswer, setSelectedQuestionForAnswer] = useState<BusinessQuestion | null>(null)

  // Load profiles on mount
  useEffect(() => {
    const savedProfiles = CentralizedDataLoader.loadProfiles()
    setProfiles(savedProfiles)
    if (savedProfiles.length > 0) {
      setSelectedProfile(savedProfiles[0])
    }
  }, [])

  // Load all data when profile changes
  useEffect(() => {
    if (selectedProfile) {
      loadAllProfileData()
    }
  }, [selectedProfile])

  const loadAllProfileData = async () => {
    if (!selectedProfile) return
    
    setLoading(true)
    setLoadingMedia(true)
    setLoadingReviews(true)
    setLoadingQuestions(true)

    try {
      const result = await CentralizedDataLoader.loadAllProfileData(selectedProfile, {
        includeReviews: true,
        includeMedia: true,
        includeQA: true
      })

      if (result.success) {
        if (result.media) {
          setBusinessMedia(result.media)
        }
        if (result.reviews && result.reviewsSummary) {
          setReviews(result.reviews)
          setReviewsSummary(result.reviewsSummary)
        }
        if (result.questions) {
          setQuestions(result.questions)
        }
      }
    } catch (error) {
      console.error('Failed to load profile data:', error)
    } finally {
      setLoading(false)
      setLoadingMedia(false)
      setLoadingReviews(false)
      setLoadingQuestions(false)
    }
  }

  // Helper function to safely format address
  const getFormattedAddress = (profile: SavedBusinessProfile): string => {
    if (profile.googleData?.storefrontAddress) {
      // Create a minimal BusinessLocation object for the API call
      const locationData = {
        name: profile.googleBusinessId || '',
        storefrontAddress: profile.googleData.storefrontAddress,
        address: profile.googleData.storefrontAddress
      } as any
      return GoogleBusinessAPI.getFormattedAddress(locationData)
    }
    return profile.address || 'Address not available'
  }

  const handleDirections = () => {
    if (selectedProfile?.googleData?.storefrontAddress || selectedProfile?.address) {
      const address = getFormattedAddress(selectedProfile)
      const encodedAddress = encodeURIComponent(address)
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank')
    }
  }

  const handleWebsite = () => {
    if (selectedProfile?.website) {
      const url = selectedProfile.website.startsWith('http') ? selectedProfile.website : `https://${selectedProfile.website}`
      window.open(url, '_blank')
    }
  }

  const handleShare = async () => {
    if (selectedProfile) {
      const shareData = {
        title: selectedProfile.name,
        text: `Check out ${selectedProfile.name}`,
        url: selectedProfile.website || window.location.href
      }
      
      if (navigator.share) {
        try {
          await navigator.share(shareData)
        } catch (error) {
          console.log('Share cancelled')
        }
      } else {
        // Fallback to clipboard
        navigator.clipboard.writeText(shareData.url || window.location.href)
        alert('Link copied to clipboard!')
      }
    }
  }

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index)
    setShowImageModal(true)
  }

  const nextImage = () => {
    if (businessMedia?.allPhotos) {
      setSelectedImageIndex((prev) => (prev + 1) % businessMedia.allPhotos.length)
    }
  }

  const prevImage = () => {
    if (businessMedia?.allPhotos) {
      setSelectedImageIndex((prev) => (prev - 1 + businessMedia.allPhotos.length) % businessMedia.allPhotos.length)
    }
  }

  const createQuestion = async () => {
    if (!selectedProfile || !newQuestion.trim()) return

    try {
      const result = await CentralizedDataLoader.createQuestion(selectedProfile, newQuestion.trim())
      if (result.success) {
        setNewQuestion('')
        loadAllProfileData() // Refresh questions
      }
    } catch (error) {
      console.error('Failed to create question:', error)
    }
  }

  const answerQuestion = async () => {
    if (!selectedQuestionForAnswer || !newAnswer.trim()) return

    try {
      const result = await CentralizedDataLoader.answerQuestion(selectedQuestionForAnswer.name, newAnswer.trim())
      if (result.success) {
        setNewAnswer('')
        setSelectedQuestionForAnswer(null)
        loadAllProfileData() // Refresh questions
      }
    } catch (error) {
      console.error('Failed to answer question:', error)
    }
  }

  if (!selectedProfile) {
    return (
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Business Profiles</h2>
          <p className="text-gray-500">Add a business profile to get started with content management.</p>
        </div>
      </div>
    )
  }

  const businessHours = selectedProfile.googleData?.businessHours || []
  const allCategories = selectedProfile.googleData?.allCategories || [selectedProfile.category]
  const actualRating = reviewsSummary?.averageRating || selectedProfile.googleData?.reviewsSummary?.averageRating || selectedProfile.rating || 0
  const actualReviewCount = reviewsSummary?.totalReviews || selectedProfile.googleData?.reviewsSummary?.totalReviews || selectedProfile.reviewCount || 0
  const formattedAddress = getFormattedAddress(selectedProfile)
  const hasAddress = formattedAddress && formattedAddress !== 'Address not available'

  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Content Hub</h1>
          <p className="text-gray-600 mt-1">Manage your business content and engagement</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            value={selectedProfile?.id || ''}
            onChange={(e) => {
              const profile = profiles.find(p => p.id === e.target.value)
              setSelectedProfile(profile || null)
            }}
            className="px-4 py-2 border border-gray-300 rounded-xl lg:rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
          >
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
              </option>
            ))}
          </select>
          
          <button
            onClick={loadAllProfileData}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl lg:rounded-2xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
        </div>
      </div>

      {/* Business Overview Card */}
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 lg:p-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Business Info */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center text-white text-xl lg:text-2xl font-bold">
                  {selectedProfile.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1">{selectedProfile.name}</h2>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(actualRating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {actualRating.toFixed(1)} ({actualReviewCount} reviews)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {allCategories.map((category, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-lg"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                {selectedProfile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{selectedProfile.phone}</span>
                  </div>
                )}
                {hasAddress && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 truncate">{formattedAddress}</span>
                  </div>
                )}
                {selectedProfile.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 truncate">{selectedProfile.website}</span>
                  </div>
                )}
              </div>

              {/* Business Hours */}
              {businessHours.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Business Hours
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-sm">
                    {businessHours.map((hours, index) => (
                      <div key={index} className="text-gray-600">
                        {hours}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                {selectedProfile.website && (
                  <button
                    onClick={handleWebsite}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                  >
                    <Globe className="w-4 h-4" />
                    Website
                  </button>
                )}
                {hasAddress && (
                  <button
                    onClick={handleDirections}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors w-full sm:w-auto"
                  >
                    <Navigation className="w-4 h-4" />
                    Directions
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto"
                >
                  <Share className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>

            {/* Photos Section */}
            <div className="lg:w-80">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Photos ({businessMedia?.allPhotos?.length || 0})
              </h3>
              
              {loadingMedia ? (
                <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : businessMedia?.allPhotos && businessMedia.allPhotos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {businessMedia.allPhotos.slice(0, 6).map((photo, index) => {
                    const imageUrl = GoogleBusinessAPI.getBestImageUrl(photo)
                    return imageUrl ? (
                      <div
                        key={index}
                        className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => openImageModal(index)}
                      >
                        <Image
                          src={imageUrl}
                          alt={`Business photo ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        {index === 5 && businessMedia.allPhotos.length > 6 && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-semibold">
                            +{businessMedia.allPhotos.length - 6}
                          </div>
                        )}
                      </div>
                    ) : null
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                  <div className="text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No photos available</p>
                  </div>
                </div>
              )}
              
              {businessMedia?.allPhotos && businessMedia.allPhotos.length > 0 && (
                <button
                  onClick={() => openImageModal(0)}
                  className="w-full mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View All Photos
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Q&A Section */}
      <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200">
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Questions & Answers ({questions.length})
            </h3>
            <button
              onClick={() => setShowQAModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Ask Question
            </button>
          </div>

          {loadingQuestions ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : questions.length > 0 ? (
            <div className="space-y-4">
              {questions.slice(0, 5).map((question, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{question.text}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>By {question.author.displayName}</span>
                        <span>{new Date(question.createTime).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {question.upvoteCount}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {question.topAnswers && question.topAnswers.length > 0 && (
                    <div className="ml-11 space-y-2">
                      {question.topAnswers.map((answer, answerIndex) => (
                        <div key={answerIndex} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-gray-800">{answer.text}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span>By {answer.author.displayName}</span>
                            <span>{new Date(answer.createTime).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1">
                              <ThumbsUp className="w-3 h-3" />
                              {answer.upvoteCount}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="ml-11 mt-3">
                    <button
                      onClick={() => {
                        setSelectedQuestionForAnswer(question)
                        setShowQAModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Answer this question
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No questions yet. Be the first to ask!</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showImageModal && businessMedia?.allPhotos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <div className="relative w-full max-w-6xl max-h-full">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white hover:bg-opacity-70"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[80vh] overflow-y-auto p-4">
                {businessMedia.allPhotos.map((photo, index) => {
                  const imageUrl = GoogleBusinessAPI.getBestImageUrl(photo)
                  return imageUrl ? (
                    <div
                      key={index}
                      className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedImageIndex(index)
                      }}
                    >
                      <Image
                        src={imageUrl}
                        alt={`Business photo ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      {index === selectedImageIndex && (
                        <div className="absolute inset-0 border-4 border-blue-500 rounded-lg" />
                      )}
                    </div>
                  ) : null
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Q&A Modal */}
      <AnimatePresence>
        {showQAModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowQAModal(false)
              setSelectedQuestionForAnswer(null)
              setNewQuestion('')
              setNewAnswer('')
            }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedQuestionForAnswer ? 'Answer Question' : 'Ask a Question'}
              </h3>
              
              {selectedQuestionForAnswer ? (
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-gray-800 font-medium">{selectedQuestionForAnswer.text}</p>
                  </div>
                  <textarea
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="Write your answer..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={answerQuestion}
                      disabled={!newAnswer.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Submit Answer
                    </button>
                    <button
                      onClick={() => {
                        setSelectedQuestionForAnswer(null)
                        setNewAnswer('')
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="What would you like to know about this business?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={createQuestion}
                      disabled={!newQuestion.trim()}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Ask Question
                    </button>
                    <button
                      onClick={() => {
                        setShowQAModal(false)
                        setNewQuestion('')
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 