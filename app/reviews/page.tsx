'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Star, 
  MessageSquare, 
  Clock, 
  Building2, 
  Search,
  Filter,
  RefreshCw,
  Reply,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  User,
  Calendar,
  BarChart3,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AppManager } from '@/lib/managers/app-manager'
import { Review, ReviewSummary } from '@/lib/managers/reviews-manager'
import { SavedBusinessProfile } from '@/lib/business-profiles-storage'

export default function ReviewsPage() {
  const [appManager] = useState(() => AppManager.getInstance())
  const [businessProfiles, setBusinessProfiles] = useState<SavedBusinessProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<SavedBusinessProfile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary | null>(null)
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showReplyModal, setShowReplyModal] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    initializeApp()
  }, [])

  useEffect(() => {
    if (selectedProfile) {
      loadReviews()
    }
  }, [selectedProfile])

  useEffect(() => {
    applyFilters()
  }, [reviews, searchQuery, ratingFilter, sortBy, sortOrder])

  const initializeApp = async () => {
    try {
      await appManager.initialize()
      const profiles = appManager.getAllBusinessProfiles()
      setBusinessProfiles(profiles)
      
      if (profiles.length > 0 && !selectedProfile) {
        setSelectedProfile(profiles[0])
      }
    } catch (error) {
      console.error('Failed to initialize app:', error)
      setError('Failed to initialize application')
    }
  }

  const loadReviews = async () => {
    if (!selectedProfile) return

    setIsLoading(true)
    setError(null)

    try {
      const [reviewsData, summaryData] = await Promise.all([
        appManager.getBusinessProfileReviews(selectedProfile.id),
        appManager.getBusinessProfileReviewSummary(selectedProfile.id)
      ])

      setReviews(reviewsData)
      setReviewSummary(summaryData)
    } catch (error) {
      console.error('Failed to load reviews:', error)
      setError('Failed to load reviews. Please check your Google Business Profile connection.')
    } finally {
      setIsLoading(false)
    }
  }

  const syncReviews = async () => {
    if (!selectedProfile) return

    setIsSyncing(true)
    setError(null)

    try {
      const result = await appManager.syncProfileReviews(selectedProfile.id)
      
      if (result.success) {
        await loadReviews() // Reload reviews after sync
        console.log(`Successfully synced ${result.reviewCount} reviews`)
      } else {
        setError(result.error || 'Failed to sync reviews')
      }
    } catch (error) {
      console.error('Failed to sync reviews:', error)
      setError('Failed to sync reviews')
    } finally {
      setIsSyncing(false)
    }
  }

  const syncAllReviews = async () => {
    setIsSyncing(true)
    setError(null)

    try {
      const result = await appManager.syncAllProfileReviews()
      
      if (result.successCount > 0) {
        await loadReviews() // Reload current profile reviews
        console.log(`Successfully synced reviews for ${result.successCount} profiles`)
      }
      
      if (result.failureCount > 0) {
        setError(`Failed to sync ${result.failureCount} profiles: ${result.errors.join(', ')}`)
      }
    } catch (error) {
      console.error('Failed to sync all reviews:', error)
      setError('Failed to sync all reviews')
    } finally {
      setIsSyncing(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...reviews]

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = appManager.searchReviews(filtered, searchQuery)
    }

    // Apply rating filter
    if (ratingFilter !== null) {
      filtered = appManager.filterReviewsByRating(filtered, ratingFilter, ratingFilter)
    }

    // Apply sorting
    filtered = appManager.sortReviews(filtered, sortBy, sortOrder)

    setFilteredReviews(filtered)
  }

  const handleReplyToReview = (review: Review) => {
    setSelectedReview(review)
    setReplyText(review.reviewReply?.comment || '')
    setShowReplyModal(true)
  }

  const submitReply = async () => {
    if (!selectedReview || !replyText.trim()) return

    try {
      const validation = appManager.validateReplyComment(replyText)
      if (!validation.isValid) {
        setError(validation.errors.join(', '))
        return
      }

      if (selectedReview.reviewReply) {
        // Update existing reply
        await appManager.updateReviewReply(selectedReview.name, { comment: replyText })
      } else {
        // Create new reply
        await appManager.replyToReview(selectedReview.name, { comment: replyText })
      }

      setShowReplyModal(false)
      setSelectedReview(null)
      setReplyText('')
      await loadReviews() // Reload to show updated reply
    } catch (error) {
      console.error('Failed to submit reply:', error)
      setError('Failed to submit reply')
    }
  }

  const deleteReply = async (reviewName: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return

    try {
      await appManager.deleteReviewReply(reviewName)
      await loadReviews() // Reload to show changes
    } catch (error) {
      console.error('Failed to delete reply:', error)
      setError('Failed to delete reply')
    }
  }

  const getStarRating = (starRating: string): number => {
    switch (starRating) {
      case 'FIVE': return 5
      case 'FOUR': return 4
      case 'THREE': return 3
      case 'TWO': return 2
      case 'ONE': return 1
      default: return 0
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getSentimentColor = (sentiment: 'positive' | 'neutral' | 'negative') => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50'
      case 'neutral': return 'text-yellow-600 bg-yellow-50'
      case 'negative': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reviews Management</h1>
          <p className="text-muted-foreground">
            Monitor and respond to Google Business Profile reviews.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={syncReviews} 
            disabled={!selectedProfile || isSyncing}
            variant="outline"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync Reviews
          </Button>
          <Button 
            onClick={syncAllReviews} 
            disabled={businessProfiles.length === 0 || isSyncing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            Sync All
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <p className="text-red-600 dark:text-red-400 font-medium">Error</p>
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Profile Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            Select Business Profile
          </CardTitle>
          <CardDescription>
            Choose which business profile to view reviews for
          </CardDescription>
        </CardHeader>
        <CardContent>
          {businessProfiles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {businessProfiles.map((profile) => (
                <Button
                  key={profile.id}
                  variant={selectedProfile?.id === profile.id ? "default" : "outline"}
                  onClick={() => setSelectedProfile(profile)}
                  className="flex items-center space-x-2"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{profile.name}</span>
                  <Badge variant="secondary" className="ml-2">
                    {profile.reviewCount} reviews
                  </Badge>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Business Profiles</h3>
              <p className="text-muted-foreground mb-4">
                You need to add business profiles before viewing reviews.
              </p>
              <Button onClick={() => window.location.href = '/profiles'}>
                Add Business Profiles
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProfile && (
        <>
          {/* Review Summary */}
          {reviewSummary && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reviewSummary.totalReviews}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center">
                    {reviewSummary.averageRating.toFixed(1)}
                    <div className="flex ml-2">
                      {renderStars(Math.round(reviewSummary.averageRating))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Positive Reviews</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {reviewSummary.ratingDistribution.five + reviewSummary.ratingDistribution.four}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Needs Reply</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {reviewSummary.unrepliedReviews.length}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="mr-2 h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search reviews..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <select
                    value={ratingFilter || ''}
                    onChange={(e) => setRatingFilter(e.target.value ? parseInt(e.target.value) : null)}
                    className="px-3 py-2 border rounded-lg"
                  >
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>

                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [sort, order] = e.target.value.split('-')
                      setSortBy(sort as 'date' | 'rating')
                      setSortOrder(order as 'asc' | 'desc')
                    }}
                    className="px-3 py-2 border rounded-lg"
                  >
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="rating-desc">Highest Rating</option>
                    <option value="rating-asc">Lowest Rating</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Reviews for {selectedProfile.name}
                </div>
                <Badge variant="outline">
                  {filteredReviews.length} of {reviews.length} reviews
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Loading reviews...</span>
                </div>
              ) : filteredReviews.length > 0 ? (
                <div className="space-y-4">
                  {filteredReviews.map((review) => {
                    const rating = getStarRating(review.starRating)
                    const sentiment = appManager.getReviewSentiment(review.starRating)
                    const reviewerName = appManager.getReviewerDisplayName(review.reviewer)
                    
                    return (
                      <Card key={review.reviewId} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {review.reviewer.profilePhotoUrl ? (
                                  <img 
                                    src={review.reviewer.profilePhotoUrl} 
                                    alt={reviewerName}
                                    className="w-10 h-10 rounded-full"
                                  />
                                ) : (
                                  <User className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-semibold">{reviewerName}</h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <div className="flex">
                                    {renderStars(rating)}
                                  </div>
                                  <Badge className={getSentimentColor(sentiment)}>
                                    {sentiment}
                                  </Badge>
                                  <span className="text-sm text-muted-foreground">
                                    {appManager.formatReviewDate(review.createTime)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleReplyToReview(review)}
                              >
                                <Reply className="h-4 w-4" />
                              </Button>
                              {review.reviewReply && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => deleteReply(review.name)}
                                  className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>

                          <p className="text-gray-700 mb-4">{review.comment}</p>

                          {review.reviewReply && (
                            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-l-green-500">
                              <div className="flex items-center space-x-2 mb-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="font-medium text-green-600">Business Reply</span>
                                <span className="text-sm text-muted-foreground">
                                  {appManager.formatReviewDate(review.reviewReply.updateTime)}
                                </span>
                              </div>
                              <p className="text-gray-700">{review.reviewReply.comment}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Reviews Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {reviews.length === 0 
                      ? `No reviews available for ${selectedProfile.name}. Try syncing to fetch the latest reviews.`
                      : 'No reviews match your current filters. Try adjusting your search criteria.'
                    }
                  </p>
                  {reviews.length === 0 && (
                    <Button onClick={syncReviews} disabled={isSyncing}>
                      <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                      Sync Reviews
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {selectedReview.reviewReply ? 'Edit Reply' : 'Reply to Review'}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setShowReplyModal(false)}>
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex">
                    {renderStars(getStarRating(selectedReview.starRating))}
                  </div>
                  <span className="font-medium">
                    {appManager.getReviewerDisplayName(selectedReview.reviewer)}
                  </span>
                </div>
                <p className="text-gray-700">{selectedReview.comment}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Your Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a professional response to this review..."
                  className="w-full h-32 p-3 border rounded-lg resize-none"
                  maxLength={4096}
                />
                <div className="text-sm text-muted-foreground mt-1">
                  {replyText.length}/4096 characters
                </div>
              </div>

              <div className="flex space-x-3">
                <Button onClick={submitReply} disabled={!replyText.trim()}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {selectedReview.reviewReply ? 'Update Reply' : 'Submit Reply'}
                </Button>
                <Button variant="outline" onClick={() => setShowReplyModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 