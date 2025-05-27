'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BusinessProfilesStorage, SavedBusinessProfile } from '@/lib/business-profiles-storage'
import { GoogleBusinessAPI, BusinessReview } from '@/lib/google-business-api'
import { Star, MessageSquare, RefreshCw, Search, Building2, Loader2, Reply, CheckCircle, Clock } from 'lucide-react'

// Business Logo Component with fallback
interface BusinessLogoProps {
  businessName: string
  website?: string
  className?: string
  fallbackClassName?: string
}

function BusinessLogo({ businessName, website, className = "w-16 h-16", fallbackClassName }: BusinessLogoProps) {
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
            // If website is not a valid URL, try to extract domain
            domain = website.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0]
          }
        }

        // Try multiple logo sources with better fallbacks
        const logoSources = [
          // Google Favicon API (most reliable, no CORS issues)
          domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null,
          // DuckDuckGo Favicon API (good fallback)
          domain ? `https://icons.duckduckgo.com/ip3/${domain}.ico` : null,
          // Clearbit Logo API (high quality but may have CORS issues)
          domain ? `https://logo.clearbit.com/${domain}` : null,
        ].filter(Boolean)

        // Use the first available logo source
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
      <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center ${fallbackClassName}`}>
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    )
  }

  if (hasError || !logoUrl) {
    return (
      <div className={`${className} bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg ${fallbackClassName}`}>
        <Building2 className="w-8 h-8 text-white" />
      </div>
    )
  }

  return (
    <div className={`${className} rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 ${fallbackClassName}`}>
      <Image
        src={logoUrl}
        alt={`${businessName} logo`}
        width={64}
        height={64}
        className="w-full h-full object-contain p-2"
        onError={() => {
          // Fallback to business icon if logo fails to load
          setHasError(true)
          setLogoUrl(null)
        }}
        onLoad={() => {
          // Logo loaded successfully
          setHasError(false)
        }}
        unoptimized // Allow external images
      />
    </div>
  )
}

// Reviewer Avatar Component with profile image loading
interface ReviewerAvatarProps {
  reviewerName: string
  className?: string
}

function ReviewerAvatar({ reviewerName, className = "w-12 h-12" }: ReviewerAvatarProps) {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const loadProfileImage = async () => {
      if (!reviewerName || reviewerName === 'Anonymous') {
        setIsLoading(false)
        setHasError(true)
        return
      }

      try {
        // Try to get profile image from various sources
        const imageSources = [
          // Gravatar (most common for email-based profiles)
          `https://www.gravatar.com/avatar/${btoa(reviewerName.toLowerCase())}?s=128&d=404`,
          // UI Avatars (generates nice avatars from names)
          `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewerName)}&size=128&background=random&color=fff&bold=true`,
        ]

        // Try Gravatar first, then fallback to UI Avatars
        try {
          const response = await fetch(imageSources[0])
          if (response.ok) {
            setProfileImageUrl(imageSources[0])
            setIsLoading(false)
            return
          }
        } catch {
          // Gravatar failed, use UI Avatars as fallback
          setProfileImageUrl(imageSources[1])
          setIsLoading(false)
          return
        }

        // If all fails, show error state
        setHasError(true)
        setIsLoading(false)
      } catch (error) {
        setHasError(true)
        setIsLoading(false)
      }
    }

    loadProfileImage()
  }, [reviewerName])

  if (isLoading) {
    return (
      <div className={`${className} rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center shadow-lg`}>
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    )
  }

  if (hasError || !profileImageUrl) {
    return (
      <div className={`${className} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg`}>
        {reviewerName.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <div className={`${className} rounded-full overflow-hidden shadow-lg border-2 border-white/50 dark:border-gray-700/50`}>
      <Image
        src={profileImageUrl}
        alt={`${reviewerName} profile`}
        width={48}
        height={48}
        className="w-full h-full object-cover"
        onError={() => {
          setHasError(true)
          setProfileImageUrl(null)
        }}
        unoptimized
      />
    </div>
  )
}

export default function ReviewsPage() {
  const [profiles, setProfiles] = useState<SavedBusinessProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<SavedBusinessProfile | null>(null)
  const [reviews, setReviews] = useState<BusinessReview[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState<string>('all')
  const [filterReplyStatus, setFilterReplyStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [reviewsSummary, setReviewsSummary] = useState<{
    averageRating: number
    totalReviews: number
    ratingDistribution: { [key: number]: number }
    repliedCount: number
    unrepliedCount: number
  } | null>(null)

  const googleAPI = new GoogleBusinessAPI()

  useEffect(() => {
    loadProfiles()
  }, [])

  // Auto-load reviews when profile changes
  useEffect(() => {
    if (selectedProfile) {
      loadReviews(selectedProfile)
    }
  }, [selectedProfile])

  const loadProfiles = () => {
    const savedProfiles = BusinessProfilesStorage.getAllProfiles()
    setProfiles(savedProfiles)
    if (savedProfiles.length > 0 && !selectedProfile) {
      const firstProfile = savedProfiles[0]
      setSelectedProfile(firstProfile)
    }
  }

  const loadReviews = async (profile: SavedBusinessProfile) => {
    if (!profile.googleBusinessId) return

    setLoading(true)
    try {
      console.log('Loading reviews for profile:', profile.name)
      const reviewsData = await googleAPI.getAllReviews(profile.googleBusinessId)
      
      setReviews(reviewsData.reviews)
      
      // Calculate rating distribution
      const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      let repliedCount = 0
      let unrepliedCount = 0
      
      reviewsData.reviews.forEach(review => {
        const rating = GoogleBusinessAPI.getStarRatingValue(review.starRating)
        if (rating > 0) distribution[rating]++
        
        if (review.reviewReply) {
          repliedCount++
        } else {
          unrepliedCount++
        }
      })

      setReviewsSummary({
        averageRating: reviewsData.averageRating,
        totalReviews: reviewsData.totalReviewCount,
        ratingDistribution: distribution,
        repliedCount,
        unrepliedCount
      })

      // Update profile with reviews data
      const updatedProfile = {
        ...profile,
        googleData: {
          ...profile.googleData,
          reviews: reviewsData.reviews,
          reviewsSummary: {
            averageRating: reviewsData.averageRating,
            totalReviews: reviewsData.totalReviewCount,
            lastUpdated: new Date().toISOString()
          }
        }
      }
      BusinessProfilesStorage.updateProfile(profile.id, updatedProfile)
      
    } catch (error) {
      console.error('Failed to load reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSelect = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId)
    if (profile) {
      setSelectedProfile(profile)
      // Auto-loading will be handled by useEffect
    }
  }

  const refreshReviews = () => {
    if (selectedProfile) {
      loadReviews(selectedProfile)
    }
  }

  const filteredAndSortedReviews = reviews
    .filter(review => {
      const matchesSearch = (review.comment || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (review.reviewer?.displayName || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRating = filterRating === 'all' || 
                           GoogleBusinessAPI.getStarRatingValue(review.starRating).toString() === filterRating
      const matchesReplyStatus = filterReplyStatus === 'all' || 
                                (review.reviewReply ? 'replied' : 'unreplied') === filterReplyStatus
      return matchesSearch && matchesRating && matchesReplyStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createTime || 0).getTime() - new Date(a.createTime || 0).getTime()
        case 'oldest':
          return new Date(a.createTime || 0).getTime() - new Date(b.createTime || 0).getTime()
        case 'highest':
          return GoogleBusinessAPI.getStarRatingValue(b.starRating) - GoogleBusinessAPI.getStarRatingValue(a.starRating)
        case 'lowest':
          return GoogleBusinessAPI.getStarRatingValue(a.starRating) - GoogleBusinessAPI.getStarRatingValue(b.starRating)
        default:
          return 0
      }
    })

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'sm') => {
    const sizeClass = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const renderRatingDistribution = () => {
    if (!reviewsSummary) return null

    const maxCount = Math.max(...Object.values(reviewsSummary.ratingDistribution))

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map(rating => {
          const count = reviewsSummary.ratingDistribution[rating] || 0
          const percentage = reviewsSummary.totalReviews > 0 ? (count / reviewsSummary.totalReviews) * 100 : 0
          
          return (
            <div key={rating} className="flex items-center gap-2 text-sm">
              <span className="w-8">{rating}</span>
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-12 text-right text-gray-600 dark:text-gray-400">
                {count}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Page Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Page Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl blur-2xl" />
            <div className="relative bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-blue-800 dark:from-white dark:via-green-200 dark:to-blue-200 bg-clip-text text-transparent">
                        Reviews Management
                      </h1>
                      <p className="text-base text-gray-600 dark:text-gray-300 font-medium">
                        Monitor and manage your Google Business Profile reviews
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={refreshReviews} 
                  disabled={loading || !selectedProfile}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <RefreshCw className={`w-4 h-4 mr-2 relative z-10 ${loading ? 'animate-spin' : ''}`} />
                  <span className="relative z-10">Refresh Reviews</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Business Profile Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Select Business Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedProfile?.id || ''} onValueChange={handleProfileSelect}>
                <SelectTrigger className="h-16 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300">
                  <SelectValue placeholder="Choose a business profile to view reviews">
                    {selectedProfile && (
                      <div className="flex items-center gap-3">
                        <BusinessLogo 
                          businessName={selectedProfile.name} 
                          website={selectedProfile.website}
                          className="w-10 h-10"
                        />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">{selectedProfile.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{selectedProfile.address}</div>
                        </div>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-white/30 dark:border-white/20">
                  {profiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.id} className="h-16 p-3">
                      <div className="flex items-center gap-3 w-full">
                        <BusinessLogo 
                          businessName={profile.name} 
                          website={profile.website}
                          className="w-10 h-10"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white">{profile.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{profile.address}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">{profile.rating}</span>
                            </div>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">{profile.reviewCount} reviews</span>
                          </div>
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
              {/* Reviews Overview */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Reviews Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reviewsSummary ? (
                      <>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-yellow-500">
                            {reviewsSummary.averageRating.toFixed(1)}
                          </div>
                          {renderStars(Math.round(reviewsSummary.averageRating), 'lg')}
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Based on {reviewsSummary.totalReviews} reviews
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h4 className="font-medium">Rating Distribution</h4>
                          {renderRatingDistribution()}
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No reviews data available</p>
                        <p className="text-sm">Click "Refresh Reviews" to load</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                {reviewsSummary && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</span>
                        <span className="font-semibold">{reviewsSummary.totalReviews}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Average Rating</span>
                        <span className="font-semibold">{reviewsSummary.averageRating.toFixed(1)}/5</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                          Replied
                        </span>
                        <span className="font-semibold text-green-600">
                          {reviewsSummary.repliedCount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-orange-500" />
                          Pending Reply
                        </span>
                        <span className="font-semibold text-orange-600">
                          {reviewsSummary.unrepliedCount}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">5-Star Reviews</span>
                        <span className="font-semibold text-green-600">
                          {reviewsSummary.ratingDistribution[5] || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">1-Star Reviews</span>
                        <span className="font-semibold text-red-600">
                          {reviewsSummary.ratingDistribution[1] || 0}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search reviews..."
                          value={searchTerm}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300"
                        />
                      </div>
                      <Select value={filterRating} onValueChange={setFilterRating}>
                        <SelectTrigger className="w-36 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-white/30 dark:border-white/20">
                          <SelectItem value="all">All Ratings</SelectItem>
                          <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Stars</SelectItem>
                          <SelectItem value="4">⭐⭐⭐⭐ 4 Stars</SelectItem>
                          <SelectItem value="3">⭐⭐⭐ 3 Stars</SelectItem>
                          <SelectItem value="2">⭐⭐ 2 Stars</SelectItem>
                          <SelectItem value="1">⭐ 1 Star</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filterReplyStatus} onValueChange={setFilterReplyStatus}>
                        <SelectTrigger className="w-36 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-white/30 dark:border-white/20">
                          <SelectItem value="all">
                            <div className="flex items-center">
                              <MessageSquare className="w-4 h-4 mr-2 text-gray-500" />
                              All Replies
                            </div>
                          </SelectItem>
                          <SelectItem value="replied">
                            <div className="flex items-center">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              Replied
                            </div>
                          </SelectItem>
                          <SelectItem value="unreplied">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-2 text-orange-500" />
                              Unreplied
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-32 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-white/30 dark:border-white/20">
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="highest">Highest Rated</SelectItem>
                          <SelectItem value="lowest">Lowest Rated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    {loading ? (
                      <div className="text-center py-8">
                        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                        <p>Loading reviews...</p>
                      </div>
                    ) : filteredAndSortedReviews.length > 0 ? (
                      <div className="space-y-4 h-[600px] overflow-y-auto pr-2">
                        {filteredAndSortedReviews.map((review) => (
                          <motion.div 
                            key={review.reviewId || review.name} 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-2xl blur-xl" />
                            <div className="relative bg-white/60 dark:bg-black/30 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/20 p-6 space-y-4 hover:shadow-lg transition-all duration-300">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                  <ReviewerAvatar reviewerName={review.reviewer?.displayName || 'Anonymous'} />
                                  <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                      {review.reviewer?.displayName || 'Anonymous'}
                                    </div>
                                    <div className="flex items-center gap-3 mt-1">
                                      {renderStars(GoogleBusinessAPI.getStarRatingValue(review.starRating))}
                                      <span className="text-sm text-gray-500 dark:text-gray-400">
                                        {GoogleBusinessAPI.formatReviewDate(review.createTime)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Reply Status Badge */}
                                <div className="flex items-center space-x-2">
                                  {review.reviewReply ? (
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Replied
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800">
                                      <Clock className="w-3 h-3 mr-1" />
                                      Pending
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              {review.comment && (
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{review.comment}</p>
                                </div>
                              )}
                              
                              {review.reviewReply && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 ml-4 border border-blue-200/50 dark:border-blue-800/50">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                                      <Reply className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                        Business Response
                                      </Badge>
                                      <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                        {GoogleBusinessAPI.formatReviewDate(review.reviewReply.updateTime)}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{review.reviewReply.comment}</p>
                                </div>
                              )}
                              
                              {/* Action Buttons */}
                              {!review.reviewReply && (
                                <div className="flex justify-end pt-2">
                                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                                    <Reply className="w-4 h-4 mr-2" />
                                    Reply to Review
                                  </Button>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No reviews found</p>
                        {searchTerm || filterRating !== 'all' ? (
                          <p className="text-sm">Try adjusting your filters</p>
                        ) : (
                          <p className="text-sm">This business has no reviews yet</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
} 