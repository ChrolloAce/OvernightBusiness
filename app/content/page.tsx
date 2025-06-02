'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BusinessProfilesStorage, SavedBusinessProfile } from '@/lib/business-profiles-storage'
import { GoogleBusinessAPI, MediaItem, BusinessMedia } from '@/lib/google-business-api'

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

// Audit Issue Types
interface AuditIssue {
  id: string
  category: 'critical' | 'important' | 'recommended' | 'optimization'
  title: string
  description: string
  impact: string
  solution: string
  priority: number
  icon: React.ReactNode
  status: 'missing' | 'incomplete' | 'outdated' | 'good'
  section: 'header' | 'photos' | 'description' | 'hours' | 'contact' | 'reviews' | 'qa' | 'posts' | 'services'
}

// Profile Audit Analysis
interface ProfileAudit {
  profileId: string
  overallScore: number
  completionPercentage: number
  issues: AuditIssue[]
  strengths: string[]
  lastAuditDate: string
  recommendations: {
    immediate: AuditIssue[]
    shortTerm: AuditIssue[]
    longTerm: AuditIssue[]
  }
}

// Audit Highlight Component
interface AuditHighlightProps {
  issue: AuditIssue
  children: React.ReactNode
  className?: string
}

function AuditHighlight({ issue, children, className = "" }: AuditHighlightProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  
  const getBorderColor = (category: string) => {
    switch (category) {
      case 'critical': return 'border-red-500 shadow-red-500/50'
      case 'important': return 'border-orange-500 shadow-orange-500/50'
      case 'recommended': return 'border-blue-500 shadow-blue-500/50'
      case 'optimization': return 'border-purple-500 shadow-purple-500/50'
      default: return 'border-gray-500 shadow-gray-500/50'
    }
  }

  const getTooltipColor = (category: string) => {
    switch (category) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
      case 'important': return 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-200'
      case 'recommended': return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200'
      case 'optimization': return 'bg-purple-50 border-purple-200 text-purple-800 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-200'
      default: return 'bg-gray-50 border-gray-200 text-gray-800 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-200'
    }
  }

  return (
    <div 
      className={`relative ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className={`border-2 border-dashed rounded-lg p-2 shadow-lg ${getBorderColor(issue.category)} animate-pulse`}>
        {children}
      </div>
      
      {showTooltip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute z-50 top-full left-0 mt-2 p-4 rounded-lg border shadow-xl max-w-sm ${getTooltipColor(issue.category)}`}
        >
          <div className="flex items-center gap-2 mb-2">
            {issue.icon}
            <span className="font-semibold text-sm">{issue.title}</span>
            <Badge variant="outline" className="text-xs capitalize">
              {issue.category}
            </Badge>
          </div>
          <p className="text-xs mb-2">{issue.description}</p>
          <p className="text-xs font-medium">Solution: {issue.solution}</p>
        </motion.div>
      )}
    </div>
  )
}

export default function ContentHubPage() {
  const [profiles, setProfiles] = useState<SavedBusinessProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<SavedBusinessProfile | null>(null)
  const [profileAudit, setProfileAudit] = useState<ProfileAudit | null>(null)
  const [loading, setLoading] = useState(false)
  const [auditMode, setAuditMode] = useState(false)
  const [businessMedia, setBusinessMedia] = useState<BusinessMedia | null>(null)
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [selectedImageModal, setSelectedImageModal] = useState<MediaItem | null>(null)
  const [businessReviews, setBusinessReviews] = useState<any[]>([])
  const [reviewsSummary, setReviewsSummary] = useState<any>(null)
  const [loadingReviews, setLoadingReviews] = useState(false)

  const googleAPI = new GoogleBusinessAPI()

  useEffect(() => {
    loadProfiles()
  }, [])

  useEffect(() => {
    if (selectedProfile) {
      performProfileAudit(selectedProfile)
    }
  }, [selectedProfile])

  // Debug effect for businessMedia state changes
  useEffect(() => {
    console.log('businessMedia state changed:', businessMedia)
    console.log('Cover photo available:', businessMedia?.coverPhoto ? 'Yes' : 'No')
    console.log('All photos count:', businessMedia?.allPhotos?.length || 0)
  }, [businessMedia])

  const loadProfiles = () => {
    const savedProfiles = BusinessProfilesStorage.getAllProfiles()
    setProfiles(savedProfiles)
    if (savedProfiles.length > 0 && !selectedProfile) {
      const firstProfile = savedProfiles[0]
      setSelectedProfile(firstProfile)
    }
  }

  const loadBusinessMedia = async (profile: SavedBusinessProfile) => {
    if (!profile.googleBusinessId) return

    setLoadingMedia(true)
    try {
      console.log('Loading business media for profile:', profile.name)
      const media = await googleAPI.getBusinessMedia(profile.googleBusinessId)
      setBusinessMedia(media)
      
      // Update profile with media data
      const updatedProfile = {
        ...profile,
        googleData: {
          ...profile.googleData,
          media: media,
          coverPhotoUrl: media.coverPhoto ? GoogleBusinessAPI.getBestImageUrl(media.coverPhoto) || undefined : undefined,
          profilePhotoUrl: media.profilePhoto ? GoogleBusinessAPI.getBestImageUrl(media.profilePhoto) || undefined : undefined,
          displayPhotos: await googleAPI.getDisplayPhotos(profile.googleBusinessId, 6),
          lastMediaUpdate: new Date().toISOString()
        }
      }
      BusinessProfilesStorage.updateProfile(profile.id, updatedProfile)
      
    } catch (error) {
      console.error('Failed to load business media:', error)
      // Set empty media on error
      setBusinessMedia({
        exteriorPhotos: [],
        interiorPhotos: [],
        productPhotos: [],
        foodAndDrinkPhotos: [],
        menuPhotos: [],
        teamPhotos: [],
        additionalPhotos: [],
        allPhotos: []
      })
    } finally {
      setLoadingMedia(false)
    }
  }

  const loadBusinessReviews = async (profile: SavedBusinessProfile) => {
    if (!profile.googleBusinessId) return

    setLoadingReviews(true)
    try {
      console.log('Loading reviews for profile:', profile.name)
      const reviewsData = await googleAPI.getAllReviews(profile.googleBusinessId)
      
      setBusinessReviews(reviewsData.reviews || [])
      
      // Calculate rating distribution
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      let repliedCount = 0
      let unrepliedCount = 0
      
      const reviews = reviewsData.reviews || []
      for (const review of reviews) {
        const rating = GoogleBusinessAPI.getStarRatingValue(review.starRating)
        if (rating >= 1 && rating <= 5) {
          distribution[rating as keyof typeof distribution] += 1
        }
        
        if (review.reviewReply) {
          repliedCount += 1
        } else {
          unrepliedCount += 1
        }
      }

      setReviewsSummary({
        averageRating: reviewsData.averageRating || profile.rating || 0,
        totalReviews: reviewsData.totalReviewCount || profile.reviewCount || 0,
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
      // Set fallback data
      setBusinessReviews([])
      setReviewsSummary({
        averageRating: profile.rating || 0,
        totalReviews: profile.reviewCount || 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        repliedCount: 0,
        unrepliedCount: 0
      })
    } finally {
      setLoadingReviews(false)
    }
  }

  const performProfileAudit = async (profile: SavedBusinessProfile) => {
    setLoading(true)
    
    try {
      // Load business media and reviews first
      await Promise.all([
        loadBusinessMedia(profile),
        loadBusinessReviews(profile)
      ])
      
      // Simulate audit analysis
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const issues: AuditIssue[] = []
      let score = 100
      let completionItems = 0
      let totalItems = 15 // Total possible optimization items

      // Critical Issues
      if (!profile.googleData?.businessDescription || profile.googleData.businessDescription.length < 100) {
        issues.push({
          id: 'business-description',
          category: 'critical',
          title: 'Missing Business Description',
          description: 'Your business description is missing or too short',
          impact: 'Reduces search visibility and customer understanding',
          solution: 'Add a detailed 150-250 character description',
          priority: 1,
          icon: <FileText className="w-4 h-4" />,
          status: !profile.googleData?.businessDescription ? 'missing' : 'incomplete',
          section: 'description'
        })
        score -= 15
      } else {
        completionItems++
      }

      if (!profile.website || profile.website === '') {
        issues.push({
          id: 'website-missing',
          category: 'critical',
          title: 'No Website Listed',
          description: 'Your business profile is missing a website URL',
          impact: 'Customers cannot find your online presence',
          solution: 'Add your business website URL',
          priority: 2,
          icon: <Globe className="w-4 h-4" />,
          status: 'missing',
          section: 'contact'
        })
        score -= 12
      } else {
        completionItems++
      }

      if (!profile.phone || profile.phone === '') {
        issues.push({
          id: 'phone-missing',
          category: 'critical',
          title: 'No Phone Number',
          description: 'Your business profile is missing a contact phone number',
          impact: 'Customers cannot easily call your business',
          solution: 'Add your primary business phone number',
          priority: 3,
          icon: <Phone className="w-4 h-4" />,
          status: 'missing',
          section: 'contact'
        })
        score -= 10
      } else {
        completionItems++
      }

      // Important Issues
      if (!profile.googleData?.businessHours || Object.keys(profile.googleData.businessHours).length === 0) {
        issues.push({
          id: 'business-hours',
          category: 'important',
          title: 'Missing Business Hours',
          description: 'Your business hours are not specified',
          impact: 'Customers don\'t know when you\'re open',
          solution: 'Add complete business hours for all days',
          priority: 4,
          icon: <Clock className="w-4 h-4" />,
          status: 'missing',
          section: 'hours'
        })
        score -= 8
      } else {
        completionItems++
      }

      // Check photos using loaded media data
      const totalPhotos = businessMedia?.allPhotos?.length || 0
      if (totalPhotos < 5) {
        issues.push({
          id: 'insufficient-photos',
          category: 'important',
          title: 'Need More Photos',
          description: `Only ${totalPhotos} photos (recommended: 10+)`,
          impact: 'Fewer photos reduce customer engagement',
          solution: 'Add high-quality photos of your business',
          priority: 5,
          icon: <Camera className="w-4 h-4" />,
          status: 'incomplete',
          section: 'photos'
        })
        score -= 7
      } else if (totalPhotos >= 5) {
        completionItems++
      }

      if ((reviewsSummary?.totalReviews || 0) < 10) {
        issues.push({
          id: 'low-review-count',
          category: 'recommended',
          title: 'Need More Reviews',
          description: `Only ${reviewsSummary?.totalReviews || 0} reviews (target: 25+)`,
          impact: 'Fewer reviews reduce credibility',
          solution: 'Encourage satisfied customers to leave reviews',
          priority: 6,
          icon: <Star className="w-4 h-4" />,
          status: 'incomplete',
          section: 'reviews'
        })
        score -= 4
      } else if ((reviewsSummary?.totalReviews || 0) >= 10) {
        completionItems++
      }

      // Optimization Opportunities
      if (!(profile.googleData as any)?.posts || (profile.googleData as any).posts?.length === 0) {
        issues.push({
          id: 'no-posts',
          category: 'optimization',
          title: 'No Recent Posts',
          description: 'Your profile has no recent posts or updates',
          impact: 'Missed opportunities to engage customers',
          solution: 'Create regular posts about offers and updates',
          priority: 7,
          icon: <MessageSquare className="w-4 h-4" />,
          status: 'missing',
          section: 'posts'
        })
        score -= 3
      } else {
        completionItems++
      }

      if (!(profile.googleData as any)?.qAndA || (profile.googleData as any).qAndA?.length === 0) {
        issues.push({
          id: 'no-qa',
          category: 'optimization',
          title: 'No Q&A Section',
          description: 'Your profile has no questions and answers',
          impact: 'Customers can\'t find quick answers',
          solution: 'Add frequently asked questions',
          priority: 8,
          icon: <HelpCircle className="w-4 h-4" />,
          status: 'missing',
          section: 'qa'
        })
        score -= 2
      } else {
        completionItems++
      }

      // Calculate completion percentage
      const completionPercentage = Math.round((completionItems / totalItems) * 100)

      // Categorize recommendations
      const immediate = issues.filter(issue => issue.category === 'critical').slice(0, 3)
      const shortTerm = issues.filter(issue => issue.category === 'important').slice(0, 3)
      const longTerm = issues.filter(issue => ['recommended', 'optimization'].includes(issue.category)).slice(0, 4)

      // Identify strengths using real data
      const strengths: string[] = []
      if (reviewsSummary?.averageRating && reviewsSummary.averageRating >= 4.0) strengths.push('High customer rating')
      if (reviewsSummary?.totalReviews && reviewsSummary.totalReviews >= 25) strengths.push('Strong review count')
      if (profile.googleData?.businessDescription && profile.googleData.businessDescription.length >= 100) strengths.push('Detailed business description')
      if (profile.website) strengths.push('Website listed')
      if (profile.phone) strengths.push('Contact information complete')
      if (totalPhotos >= 10) strengths.push('Rich photo gallery')

      const audit: ProfileAudit = {
        profileId: profile.id,
        overallScore: Math.max(0, Math.round(score)),
        completionPercentage,
        issues: issues.sort((a, b) => a.priority - b.priority),
        strengths,
        lastAuditDate: new Date().toISOString(),
        recommendations: {
          immediate,
          shortTerm,
          longTerm
        }
      }

      setProfileAudit(audit)
    } catch (error) {
      console.error('Failed to perform audit:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSelect = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId)
    if (profile) {
      setSelectedProfile(profile)
    }
  }

  const refreshAudit = () => {
    if (selectedProfile) {
      performProfileAudit(selectedProfile)
    }
  }

  const getIssueForSection = (section: string) => {
    return profileAudit?.issues.find(issue => issue.section === section)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
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

  const formatBusinessHours = (hours: any) => {
    if (!hours || typeof hours !== 'object') return 'Hours not specified'
    
    try {
      // Handle different hour formats from Google Business API
      if (hours.regularHours && Array.isArray(hours.regularHours)) {
        const today = new Date().getDay() // 0 = Sunday, 1 = Monday, etc.
        const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
        const todayName = dayNames[today]
        
        // Find today's hours
        const todayHours = hours.regularHours.find((day: any) => day.day === todayName)
        
        if (todayHours && todayHours.openTime && todayHours.closeTime) {
          const openTime = formatTime(todayHours.openTime)
          const closeTime = formatTime(todayHours.closeTime)
          return `Open • Closes ${closeTime}`
        } else if (todayHours && todayHours.isClosed) {
          return 'Closed today'
        }
      }
      
      // Fallback for other formats
      if (typeof hours === 'string') return hours
      
      return 'Hours available'
    } catch (error) {
      console.error('Error formatting business hours:', error)
      return 'Hours not specified'
    }
  }

  const formatTime = (timeObj: any) => {
    if (!timeObj) return ''
    
    try {
      if (typeof timeObj === 'string') return timeObj
      
      if (timeObj.hours !== undefined && timeObj.minutes !== undefined) {
        const hours = timeObj.hours
        const minutes = timeObj.minutes
        const period = hours >= 12 ? 'PM' : 'AM'
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
      }
      
      return timeObj.toString()
    } catch (error) {
      return ''
    }
  }

  const getBusinessCategories = (profile: SavedBusinessProfile) => {
    const categories = []
    
    if (profile.googleData?.primaryCategory) {
      categories.push(profile.googleData.primaryCategory)
    }
    
    if (profile.googleData?.additionalCategories) {
      categories.push(...profile.googleData.additionalCategories.slice(0, 2))
    }
    
    return categories
  }

  const getBusinessServices = (profile: SavedBusinessProfile) => {
    const services = []
    
    // Get services from Google Business data
    if (profile.googleData?.serviceItems) {
      services.push(...profile.googleData.serviceItems.slice(0, 6))
    }
    
    // Get services from categories
    if (profile.googleData?.categories?.additionalCategories) {
      profile.googleData.categories.additionalCategories.forEach((category: any) => {
        if (category.serviceTypes) {
          services.push(...category.serviceTypes.slice(0, 3))
        }
      })
    }
    
    return services.slice(0, 8) // Limit to 8 services
  }

  if (!selectedProfile) {
    return (
      <div className="min-h-screen p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-4">No Business Profiles</h2>
            <p className="text-gray-600 mb-6">Add business profiles to start auditing them</p>
            <Button onClick={() => window.location.href = '/profiles'}>
              Add Business Profiles
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Controls */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <h1 className="text-lg sm:text-xl font-bold">Profile Audit Simulator</h1>
            <Select value={selectedProfile?.id || ''} onValueChange={handleProfileSelect}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Select business profile">
                  {selectedProfile && (
                    <div className="flex items-center gap-2">
                      <BusinessLogo 
                        businessName={selectedProfile.name} 
                        website={selectedProfile.website}
                        className="w-5 h-5 sm:w-6 sm:h-6"
                      />
                      <span className="truncate text-sm sm:text-base">{selectedProfile.name}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {profiles.map(profile => (
                  <SelectItem key={profile.id} value={profile.id}>
                    <div className="flex items-center gap-2">
                      <BusinessLogo 
                        businessName={profile.name} 
                        website={profile.website}
                        className="w-5 h-5 sm:w-6 sm:h-6"
                      />
                      <span className="text-sm sm:text-base">{profile.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              variant={auditMode ? "default" : "outline"}
              size="sm"
              onClick={() => setAuditMode(!auditMode)}
              className="flex-1 sm:flex-none text-xs sm:text-sm"
            >
              <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              {auditMode ? 'Hide Audit' : 'Show Audit'}
            </Button>
            <Button onClick={refreshAudit} disabled={loading} size="sm" className="flex-1 sm:flex-none text-xs sm:text-sm">
              <RefreshCw className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Google Business Profile Simulator */}
      <div className="max-w-4xl mx-auto p-3 sm:p-6">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8 sm:py-12">
              <div className="text-center">
                <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin mx-auto mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-medium">Analyzing Profile...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Profile Header */}
            <div className="relative">
              {/* Cover Photo Area */}
              <div className="h-32 sm:h-40 md:h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
                {/* Display actual cover photo if available */}
                {businessMedia?.coverPhoto ? (
                  <img
                    src={GoogleBusinessAPI.getBestImageUrl(businessMedia.coverPhoto) || ''}
                    alt="Business cover photo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to gradient background on error
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                ) : (
                  /* Show placeholder when no cover photo */
                  <div className="absolute inset-2 sm:inset-4 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <div className="text-center text-white">
                      <Camera className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm">No cover photo</p>
                    </div>
                  </div>
                )}
                
                {/* Audit overlay - show on top of photos when in audit mode */}
                {auditMode && getIssueForSection('photos') && (
                  <AuditHighlight 
                    issue={getIssueForSection('photos')!}
                    className="absolute inset-2 sm:inset-4"
                  >
                    <div className="h-full bg-black/60 backdrop-blur-sm rounded-lg flex items-center justify-center">
                      <div className="text-center text-white">
                        <Camera className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                        <p className="text-xs sm:text-sm font-medium">
                          {businessMedia?.allPhotos && businessMedia.allPhotos.length > 0 
                            ? `${businessMedia.allPhotos.length} photos (need ${Math.max(0, 10 - businessMedia.allPhotos.length)} more)`
                            : 'Add photos'
                          }
                        </p>
                      </div>
                    </div>
                  </AuditHighlight>
                )}
                
                {/* Loading overlay */}
                {loadingMedia && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 animate-spin" />
                      <p className="text-xs sm:text-sm">Loading photos...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Business Info */}
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4">
                  {/* Use profile photo if available, otherwise fallback to logo */}
                  {businessMedia?.profilePhoto ? (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50 mx-auto sm:mx-0">
                      <img
                        src={GoogleBusinessAPI.getBestImageUrl(businessMedia.profilePhoto) || ''}
                        alt={`${selectedProfile.name} profile`}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          // Fallback to BusinessLogo component on error
                          e.currentTarget.parentElement!.innerHTML = ''
                          const logoDiv = document.createElement('div')
                          e.currentTarget.parentElement!.appendChild(logoDiv)
                        }}
                      />
                    </div>
                  ) : (
                    <BusinessLogo 
                      businessName={selectedProfile.name} 
                      website={selectedProfile.website}
                      className="w-16 h-16 sm:w-20 sm:h-20 mx-auto sm:mx-0"
                    />
                  )}
                  
                  <div className="flex-1 text-center sm:text-left w-full">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3">
                      <div className="w-full sm:flex-1">
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {selectedProfile.name}
                        </h1>
                        
                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                          {renderStars(selectedProfile.rating || 0)}
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {selectedProfile.rating} • {selectedProfile.reviewCount} Google reviews
                          </span>
                        </div>
                        
                        {/* Business Categories */}
                        <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 mb-3">
                          {getBusinessCategories(selectedProfile).map((category: any, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {category.displayName || category.name || category}
                            </Badge>
                          ))}
                        </div>
                        
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 px-2 sm:px-0">
                          {selectedProfile.googleData?.businessDescription?.substring(0, 100) || 
                           `Business in ${selectedProfile.address?.split(',')[1] || 'Miami-Dade County'}, Florida`}
                        </p>
                      </div>
                      
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs whitespace-nowrap">
                        You manage this Business Profile
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 mb-4">
                      {auditMode && getIssueForSection('contact') ? (
                        <AuditHighlight issue={getIssueForSection('contact')!}>
                          <Button variant="outline" size="sm" className="opacity-50 text-xs flex-1 sm:flex-none min-w-0">
                            <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Website</span>
                            <span className="sm:hidden">Web</span>
                          </Button>
                        </AuditHighlight>
                      ) : (
                        <Button variant="outline" size="sm" className="text-xs flex-1 sm:flex-none min-w-0">
                          <Globe className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Website</span>
                          <span className="sm:hidden">Web</span>
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm" className="text-xs flex-1 sm:flex-none min-w-0">
                        <Navigation className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Directions</span>
                        <span className="sm:hidden">Dir</span>
                      </Button>
                      
                      <Button variant="outline" size="sm" className="text-xs flex-1 sm:flex-none min-w-0">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Reviews</span>
                        <span className="sm:hidden">Rev</span>
                      </Button>
                      
                      <Button variant="outline" size="sm" className="text-xs flex-1 sm:flex-none min-w-0">
                        <Share className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        <span className="hidden sm:inline">Share</span>
                        <span className="sm:hidden">Shr</span>
                      </Button>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-center sm:text-left">{selectedProfile.address}</span>
                      </div>
                      
                      {auditMode && getIssueForSection('contact') ? (
                        <AuditHighlight issue={getIssueForSection('contact')!}>
                          <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400">
                            <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>Phone number missing</span>
                          </div>
                        </AuditHighlight>
                      ) : (
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                          <span>{selectedProfile.phone || '(786) 257-8816'}</span>
                        </div>
                      )}
                      
                      {auditMode && getIssueForSection('hours') ? (
                        <AuditHighlight issue={getIssueForSection('hours')!}>
                          <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-400">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                            <span>Hours not specified</span>
                          </div>
                        </AuditHighlight>
                      ) : (
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-center sm:text-left">{formatBusinessHours(selectedProfile.googleData?.businessHours)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Description */}
            <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
              {auditMode && getIssueForSection('description') ? (
                <AuditHighlight issue={getIssueForSection('description')!}>
                  <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                    <p className="text-gray-500 italic text-xs sm:text-sm">Business description missing or too short</p>
                  </div>
                </AuditHighlight>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    {selectedProfile.googleData?.businessDescription || 
                     "AG Construction redefines new construction, home building, and remodeling in Miami through cutting-edge design, premium craftsmanship, and exceptional service."}
                  </p>
                </div>
              )}
            </div>

            {/* Image Gallery Section */}
            {businessMedia?.allPhotos && businessMedia.allPhotos.length > 0 && (
              <div className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                  <h3 className="font-semibold text-sm sm:text-base">Photos ({businessMedia.allPhotos.length})</h3>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    View all
                  </Button>
                </div>
                
                {/* Responsive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                  {businessMedia.allPhotos.slice(0, 8).map((photo, index) => (
                    <div 
                      key={index} 
                      className={`relative overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${
                        index === 0 ? 'col-span-2 row-span-2' : ''
                      }`}
                      onClick={() => setSelectedImageModal(photo)}
                    >
                      <img
                        src={GoogleBusinessAPI.getBestImageUrl(photo) || ''}
                        alt={`Business photo ${index + 1}`}
                        className={`w-full object-cover ${
                          index === 0 ? 'h-32 sm:h-48 md:h-64' : 'h-16 sm:h-24 md:h-32'
                        }`}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                      {/* Overlay for first image if there are more */}
                      {index === 7 && businessMedia.allPhotos.length > 8 && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="text-white font-semibold text-xs sm:text-sm">
                            +{businessMedia.allPhotos.length - 8} more
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products/Services Section */}
            <div className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                <h3 className="font-semibold text-sm sm:text-base">Services & Products</h3>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Add service
                </Button>
              </div>
              
              {(() => {
                const services = getBusinessServices(selectedProfile)
                
                if (services.length > 0) {
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {services.map((service: any, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-xs sm:text-sm mb-1 truncate">
                                {service.displayName || service.name || service.title || 'Service'}
                              </h4>
                              {service.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {service.description.substring(0, 60)}...
                                </p>
                              )}
                              {service.price && (
                                <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-1">
                                  {service.price}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Add service card */}
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4 text-center flex items-center justify-center min-h-[60px] sm:min-h-[80px] hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer">
                        <div className="text-gray-500 dark:text-gray-400">
                          <Plus className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1" />
                          <p className="text-xs">Add service</p>
                        </div>
                      </div>
                    </div>
                  )
                } else {
                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 sm:p-4 text-center">
                        <div className="w-full h-12 sm:h-16 bg-gray-200 dark:bg-gray-600 rounded mb-2 flex items-center justify-center">
                          <Tag className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                        </div>
                        <p className="text-xs sm:text-sm font-medium">REMODELING</p>
                      </div>
                      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 sm:p-4 text-center">
                        <div className="w-full h-12 sm:h-16 bg-gray-200 dark:bg-gray-600 rounded mb-2 flex items-center justify-center">
                          <Building2 className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" />
                        </div>
                        <p className="text-xs sm:text-sm font-medium">Construction</p>
                      </div>
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 sm:p-4 text-center flex items-center justify-center col-span-1 sm:col-span-2 lg:col-span-1">
                        <div className="text-gray-400">
                          <Plus className="w-4 h-4 sm:w-6 sm:h-6 mx-auto mb-1" />
                          <p className="text-xs">Add service</p>
                        </div>
                      </div>
                    </div>
                  )
                }
              })()}
            </div>

            {/* Business Hours Section */}
            <div className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                <h3 className="font-semibold text-sm sm:text-base">Business Hours</h3>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Edit hours
                </Button>
              </div>
              
              {(() => {
                const hours = selectedProfile.googleData?.businessHours
                
                if (hours && typeof hours === 'object' && !Array.isArray(hours) && (hours as any).regularHours && Array.isArray((hours as any).regularHours)) {
                  const dayNames = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
                  const dayDisplayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                  const regularHours = (hours as any).regularHours
                  
                  return (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                      <div className="space-y-2 sm:space-y-3">
                        {dayNames.map((day, index) => {
                          const dayHours = regularHours.find((h: any) => h.day === day)
                          const today = new Date().getDay()
                          const isToday = (today === 0 ? 6 : today - 1) === index // Adjust for Sunday = 0
                          
                          return (
                            <div key={day} className={`flex items-center justify-between py-2 px-2 sm:px-3 rounded ${
                              isToday ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800' : ''
                            }`}>
                              <span className={`text-xs sm:text-sm font-medium ${
                                isToday ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                              }`}>
                                {dayDisplayNames[index]}
                                {isToday && <span className="ml-1 sm:ml-2 text-xs">(Today)</span>}
                              </span>
                              
                              <span className={`text-xs sm:text-sm ${
                                isToday ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {dayHours && dayHours.openTime && dayHours.closeTime ? (
                                  `${formatTime(dayHours.openTime)} - ${formatTime(dayHours.closeTime)}`
                                ) : (
                                  <span className="text-red-500 dark:text-red-400">Closed</span>
                                )}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                      
                      {/* Special Hours */}
                      {(hours as any).specialHours && Array.isArray((hours as any).specialHours) && (hours as any).specialHours.length > 0 && (
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-600">
                          <h4 className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Special Hours</h4>
                          <div className="space-y-2">
                            {(hours as any).specialHours.slice(0, 3).map((special: any, index: number) => (
                              <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                                <span className="text-orange-600 dark:text-orange-400 truncate mr-2">
                                  {special.date || 'Special day'}
                                </span>
                                <span className="text-gray-600 dark:text-gray-400 text-right">
                                  {special.isClosed ? 'Closed' : `${formatTime(special.openTime)} - ${formatTime(special.closeTime)}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                } else {
                  return (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
                      <div className="text-center py-4 sm:py-4">
                        <Clock className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">Business hours not specified</p>
                        <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                          Add business hours
                        </Button>
                      </div>
                    </div>
                  )
                }
              })()}
            </div>

            {/* Q&A Section */}
            <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2">
                <h3 className="font-semibold text-sm sm:text-base">Questions & answers</h3>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm w-full sm:w-auto">Ask a question</Button>
              </div>
              
              {auditMode && getIssueForSection('qa') ? (
                <AuditHighlight issue={getIssueForSection('qa')!}>
                  <div className="text-center py-6 sm:py-8 text-gray-500">
                    <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm">No questions and answers yet</p>
                  </div>
                </AuditHighlight>
              ) : (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm">See all questions (1)</p>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-4 gap-2">
                <h3 className="font-semibold text-sm sm:text-base">Reviews</h3>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Get more reviews
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                    <Camera className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Add a photo
                  </Button>
                </div>
              </div>
              
              {auditMode && getIssueForSection('reviews') ? (
                <AuditHighlight issue={getIssueForSection('reviews')!}>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-600">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4">
                      <div className="text-center">
                        <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{selectedProfile.rating || '5.0'}</div>
                        <div className="flex justify-center mb-1">
                          {renderStars(selectedProfile.rating || 5)}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {selectedProfile.reviewCount || 7} reviews (Need more reviews)
                        </p>
                      </div>
                      
                      <div className="flex-1 w-full">
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((stars) => {
                            const count = reviewsSummary?.ratingDistribution?.[stars] || 0
                            const total = reviewsSummary?.totalReviews || 1
                            const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                            
                            return (
                              <div key={stars} className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm w-3">{stars}</span>
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                  <div 
                                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500 w-8 sm:w-12 text-right">
                                  {count} ({percentage}%)
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </AuditHighlight>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-600">
                  <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">{selectedProfile.rating || '5.0'}</div>
                      <div className="text-4xl font-bold text-gray-900 dark:text-white">{selectedProfile.rating || '5.0'}</div>
                      <div className="flex justify-center mb-1">
                        {renderStars(selectedProfile.rating || 5)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedProfile.reviewCount || 7} Google reviews
                      </p>
                    </div>
                    
                    <div className="flex-1">
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = reviewsSummary?.ratingDistribution?.[stars] || 0
                          const total = reviewsSummary?.totalReviews || 1
                          const percentage = total > 0 ? Math.round((count / total) * 100) : 0
                          
                          return (
                            <div key={stars} className="flex items-center gap-2">
                              <span className="text-sm w-3">{stars}</span>
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                <div 
                                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500 w-12 text-right">
                                {count} ({percentage}%)
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Reviews */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Recent reviews</h4>
                    
                    {/* Real reviews from loaded data */}
                    {businessReviews && businessReviews.length > 0 ? (
                      <div className="space-y-4">
                        {businessReviews.slice(0, 3).map((review, index) => (
                          <div key={index} className="border-b border-gray-200 dark:border-gray-600 pb-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                                {(review.reviewer?.displayName || 'A').charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">
                                    {review.reviewer?.displayName || 'Anonymous'}
                                  </span>
                                  <div className="flex">
                                    {renderStars(GoogleBusinessAPI.getStarRatingValue(review.starRating))}
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {GoogleBusinessAPI.formatReviewDate(review.createTime)}
                                  </span>
                                </div>
                                {review.comment && (
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {review.comment}
                                  </p>
                                )}
                                {review.reviewReply && (
                                  <div className="mt-2 ml-4 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg border-l-2 border-blue-500">
                                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Business Response</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                      {review.reviewReply.comment}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No reviews available</p>
                        <p className="text-xs">Reviews will appear here when customers leave them</p>
                      </div>
                    )}
                    
                    <Button variant="outline" className="w-full">
                      <Star className="w-4 h-4 mr-2" />
                      View all {reviewsSummary?.totalReviews || 0} reviews
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Posts Section */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Posts & Updates</h3>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create post
                </Button>
              </div>
              
              {auditMode && getIssueForSection('posts') ? (
                <AuditHighlight issue={getIssueForSection('posts')!}>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">No posts yet</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Start sharing updates, offers, and events to engage with customers
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Create post
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Add event
                      </Button>
                    </div>
                  </div>
                </AuditHighlight>
              ) : (
                <div className="space-y-4">
                  {/* Sample posts - in real app, these would come from API */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-start gap-3">
                      <BusinessLogo 
                        businessName={selectedProfile.name} 
                        website={selectedProfile.website}
                        className="w-10 h-10"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">{selectedProfile.name}</span>
                          <Badge variant="outline" className="text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Offer
                          </Badge>
                          <span className="text-xs text-gray-500">3 days ago</span>
                        </div>
                        <h4 className="font-medium mb-2">🏗️ Special Winter Construction Discount!</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          Get 15% off all construction and remodeling projects booked this month. 
                          Professional quality work with premium materials. Contact us today!
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <button className="flex items-center gap-1 hover:text-blue-600">
                            <Star className="w-3 h-3" />
                            12 likes
                          </button>
                          <button className="flex items-center gap-1 hover:text-blue-600">
                            <MessageSquare className="w-3 h-3" />
                            3 comments
                          </button>
                          <button className="flex items-center gap-1 hover:text-blue-600">
                            <Share className="w-3 h-3" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-start gap-3">
                      <BusinessLogo 
                        businessName={selectedProfile.name} 
                        website={selectedProfile.website}
                        className="w-10 h-10"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">{selectedProfile.name}</span>
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            Update
                          </Badge>
                          <span className="text-xs text-gray-500">1 week ago</span>
                        </div>
                        <h4 className="font-medium mb-2">📸 Recent Project Completion</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          Just completed another successful home renovation project! 
                          Check out the amazing transformation we achieved for our client.
                        </p>
                        
                        {/* Sample project images */}
                        {businessMedia?.allPhotos && businessMedia.allPhotos.length > 0 && (
                          <div className="grid grid-cols-2 gap-2 mb-3">
                            {businessMedia.allPhotos.slice(0, 2).map((photo, index) => (
                              <div key={index} className="relative overflow-hidden rounded-lg h-32">
                                <img
                                  src={GoogleBusinessAPI.getBestImageUrl(photo) || ''}
                                  alt={`Project photo ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none'
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <button className="flex items-center gap-1 hover:text-blue-600">
                            <Star className="w-3 h-3" />
                            24 likes
                          </button>
                          <button className="flex items-center gap-1 hover:text-blue-600">
                            <MessageSquare className="w-3 h-3" />
                            8 comments
                          </button>
                          <button className="flex items-center gap-1 hover:text-blue-600">
                            <Share className="w-3 h-3" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex items-start gap-3">
                      <BusinessLogo 
                        businessName={selectedProfile.name} 
                        website={selectedProfile.website}
                        className="w-10 h-10"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">{selectedProfile.name}</span>
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            Event
                          </Badge>
                          <span className="text-xs text-gray-500">2 weeks ago</span>
                        </div>
                        <h4 className="font-medium mb-2">🎉 Free Consultation Week</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                          Join us for Free Consultation Week! Get expert advice on your next construction 
                          or remodeling project. Book your appointment today.
                        </p>
                        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-blue-600" />
                            <span className="font-medium">December 15-22, 2024</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm mt-1">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            <span>Our Office & Virtual Consultations</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <button className="flex items-center gap-1 hover:text-blue-600">
                            <Star className="w-3 h-3" />
                            18 likes
                          </button>
                          <button className="flex items-center gap-1 hover:text-blue-600">
                            <MessageSquare className="w-3 h-3" />
                            5 comments
                          </button>
                          <button className="flex items-center gap-1 hover:text-blue-600">
                            <Share className="w-3 h-3" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    View all posts
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audit Summary Panel */}
        {auditMode && profileAudit && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 sm:mt-6"
          >
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
              <CardHeader className="p-3 sm:p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200 text-sm sm:text-base">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                  Audit Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {profileAudit.overallScore}
                    </div>
                    <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">Overall Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {profileAudit.completionPercentage}%
                    </div>
                    <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">Complete</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {profileAudit.issues.length}
                    </div>
                    <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300">Issues Found</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  {/* Immediate Actions */}
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2 text-xs sm:text-sm">
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                      Immediate ({profileAudit.recommendations.immediate.length})
                    </h4>
                    <div className="space-y-2">
                      {profileAudit.recommendations.immediate.map((issue) => (
                        <div key={issue.id} className="text-xs p-2 bg-red-100 dark:bg-red-900 rounded">
                          {issue.title}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Short-term */}
                  <div>
                    <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-2 text-xs sm:text-sm">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      Short-term ({profileAudit.recommendations.shortTerm.length})
                    </h4>
                    <div className="space-y-2">
                      {profileAudit.recommendations.shortTerm.map((issue) => (
                        <div key={issue.id} className="text-xs p-2 bg-orange-100 dark:bg-orange-900 rounded">
                          {issue.title}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Long-term */}
                  <div>
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2 text-xs sm:text-sm">
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                      Long-term ({profileAudit.recommendations.longTerm.length})
                    </h4>
                    <div className="space-y-2">
                      {profileAudit.recommendations.longTerm.map((issue) => (
                        <div key={issue.id} className="text-xs p-2 bg-blue-100 dark:bg-blue-900 rounded">
                          {issue.title}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImageModal && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setSelectedImageModal(null)}
        >
          <div className="relative max-w-full max-h-full w-full h-full sm:w-auto sm:h-auto">
            <button
              onClick={() => setSelectedImageModal(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors touch-manipulation"
            >
              <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <img
              src={GoogleBusinessAPI.getBestImageUrl(selectedImageModal) || ''}
              alt="Business photo"
              className="max-w-full max-h-full w-full h-full sm:w-auto sm:h-auto object-contain rounded-none sm:rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            
            {/* Navigation buttons if there are multiple photos */}
            {businessMedia?.allPhotos && businessMedia.allPhotos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const currentIndex = businessMedia.allPhotos.findIndex(p => p === selectedImageModal)
                    const prevIndex = currentIndex > 0 ? currentIndex - 1 : businessMedia.allPhotos.length - 1
                    setSelectedImageModal(businessMedia.allPhotos[prevIndex])
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 sm:p-2 hover:bg-black/70 transition-colors touch-manipulation"
                >
                  <ChevronLeft className="w-6 h-6 sm:w-6 sm:h-6" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    const currentIndex = businessMedia.allPhotos.findIndex(p => p === selectedImageModal)
                    const nextIndex = currentIndex < businessMedia.allPhotos.length - 1 ? currentIndex + 1 : 0
                    setSelectedImageModal(businessMedia.allPhotos[nextIndex])
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 sm:p-2 hover:bg-black/70 transition-colors touch-manipulation"
                >
                  <ChevronRight className="w-6 h-6 sm:w-6 sm:h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 