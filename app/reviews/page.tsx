'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BusinessProfilesStorage, SavedBusinessProfile } from '@/lib/business-profiles-storage'
import { GoogleBusinessAPI, BusinessReview } from '@/lib/google-business-api'
import { Star, MessageSquare, RefreshCw, Search } from 'lucide-react'

export default function ReviewsPage() {
  const [profiles, setProfiles] = useState<SavedBusinessProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<SavedBusinessProfile | null>(null)
  const [reviews, setReviews] = useState<BusinessReview[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRating, setFilterRating] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('newest')
  const [reviewsSummary, setReviewsSummary] = useState<{
    averageRating: number
    totalReviews: number
    ratingDistribution: { [key: number]: number }
  } | null>(null)

  const googleAPI = new GoogleBusinessAPI()

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = () => {
    const savedProfiles = BusinessProfilesStorage.getAllProfiles()
    setProfiles(savedProfiles)
    if (savedProfiles.length > 0 && !selectedProfile) {
      setSelectedProfile(savedProfiles[0])
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
      reviewsData.reviews.forEach(review => {
        const rating = GoogleBusinessAPI.getStarRatingValue(review.starRating)
        if (rating > 0) distribution[rating]++
      })

      setReviewsSummary({
        averageRating: reviewsData.averageRating,
        totalReviews: reviewsData.totalReviewCount,
        ratingDistribution: distribution
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
      // Load cached reviews first
      if (profile.googleData?.reviews) {
        setReviews(profile.googleData.reviews)
        if (profile.googleData.reviewsSummary) {
          const distribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          profile.googleData.reviews.forEach(review => {
            const rating = GoogleBusinessAPI.getStarRatingValue(review.starRating)
            if (rating > 0) distribution[rating]++
          })
          setReviewsSummary({
            averageRating: profile.googleData.reviewsSummary.averageRating,
            totalReviews: profile.googleData.reviewsSummary.totalReviews,
            ratingDistribution: distribution
          })
        }
      } else {
        setReviews([])
        setReviewsSummary(null)
      }
    }
  }

  const refreshReviews = () => {
    if (selectedProfile) {
      loadReviews(selectedProfile)
    }
  }

  const filteredAndSortedReviews = reviews
    .filter(review => {
      const matchesSearch = review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           review.reviewer.displayName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRating = filterRating === 'all' || 
                           GoogleBusinessAPI.getStarRatingValue(review.starRating).toString() === filterRating
      return matchesSearch && matchesRating
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createTime).getTime() - new Date(a.createTime).getTime()
        case 'oldest':
          return new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reviews Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor and manage your Google Business Profile reviews
          </p>
        </div>
        <Button onClick={refreshReviews} disabled={loading || !selectedProfile}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Reviews
        </Button>
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
            <SelectTrigger>
              <SelectValue placeholder="Choose a business profile to view reviews" />
            </SelectTrigger>
            <SelectContent>
              {profiles.map(profile => (
                <SelectItem key={profile.id} value={profile.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                      {profile.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{profile.name}</div>
                      <div className="text-sm text-gray-500">{profile.address}</div>
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
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterRating} onValueChange={setFilterRating}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="highest">Highest Rated</SelectItem>
                      <SelectItem value="lowest">Lowest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p>Loading reviews...</p>
                  </div>
                ) : filteredAndSortedReviews.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {filteredAndSortedReviews.map((review) => (
                      <div key={review.reviewId} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {review.reviewer.displayName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{review.reviewer.displayName}</div>
                              <div className="flex items-center gap-2">
                                {renderStars(GoogleBusinessAPI.getStarRatingValue(review.starRating))}
                                <span className="text-sm text-gray-500">
                                  {GoogleBusinessAPI.formatReviewDate(review.createTime)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {review.comment && (
                          <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                        )}
                        
                        {review.reviewReply && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 ml-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary">Business Response</Badge>
                              <span className="text-sm text-gray-500">
                                {GoogleBusinessAPI.formatReviewDate(review.reviewReply.updateTime)}
                              </span>
                            </div>
                            <p className="text-sm">{review.reviewReply.comment}</p>
                          </div>
                        )}
                      </div>
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
    </div>
  )
} 