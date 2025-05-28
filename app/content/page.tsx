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
  HelpCircle
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
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    )
  }

  if (hasError || !logoUrl) {
    return (
      <div className={`${className} bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg`}>
        <Building2 className="w-8 h-8 text-white" />
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
        className="w-full h-full object-contain p-2"
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
  const [auditMode, setAuditMode] = useState(true)
  const [businessMedia, setBusinessMedia] = useState<BusinessMedia | null>(null)
  const [loadingMedia, setLoadingMedia] = useState(false)

  const googleAPI = new GoogleBusinessAPI()

  useEffect(() => {
    loadProfiles()
  }, [])

  useEffect(() => {
    if (selectedProfile) {
      performProfileAudit(selectedProfile)
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

  const performProfileAudit = async (profile: SavedBusinessProfile) => {
    setLoading(true)
    
    try {
      // Load business media first
      await loadBusinessMedia(profile)
      
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

      if ((profile.reviewCount || 0) < 10) {
        issues.push({
          id: 'low-review-count',
          category: 'recommended',
          title: 'Need More Reviews',
          description: `Only ${profile.reviewCount || 0} reviews (target: 25+)`,
          impact: 'Fewer reviews reduce credibility',
          solution: 'Encourage satisfied customers to leave reviews',
          priority: 6,
          icon: <Star className="w-4 h-4" />,
          status: 'incomplete',
          section: 'reviews'
        })
        score -= 4
      } else if ((profile.reviewCount || 0) >= 10) {
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

      // Identify strengths
      const strengths: string[] = []
      if (profile.rating && profile.rating >= 4.0) strengths.push('High customer rating')
      if (profile.reviewCount && profile.reviewCount >= 25) strengths.push('Strong review count')
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
    if (!hours) return 'Hours not specified'
    // Simplified hours display
    return 'Open • Closes 6 AM Wed'
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
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Profile Audit Simulator</h1>
            <Select value={selectedProfile?.id || ''} onValueChange={handleProfileSelect}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select business profile">
                  {selectedProfile && (
                    <div className="flex items-center gap-2">
                      <BusinessLogo 
                        businessName={selectedProfile.name} 
                        website={selectedProfile.website}
                        className="w-6 h-6"
                      />
                      <span className="truncate">{selectedProfile.name}</span>
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
                        className="w-6 h-6"
                      />
                      <span>{profile.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant={auditMode ? "default" : "outline"}
              size="sm"
              onClick={() => setAuditMode(!auditMode)}
            >
              <Target className="w-4 h-4 mr-2" />
              {auditMode ? 'Hide Audit' : 'Show Audit'}
            </Button>
            <Button onClick={refreshAudit} disabled={loading} size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Google Business Profile Simulator */}
      <div className="max-w-4xl mx-auto p-6">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium">Analyzing Profile...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            {/* Profile Header */}
            <div className="relative">
              {/* Cover Photo Area */}
              <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative overflow-hidden">
                {/* Display actual cover photo if available */}
                {businessMedia?.coverPhoto && !auditMode && (
                  <img
                    src={GoogleBusinessAPI.getBestImageUrl(businessMedia.coverPhoto) || ''}
                    alt="Business cover photo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to gradient background on error
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
                
                {/* Display photo gallery if no cover photo but has other photos */}
                {!businessMedia?.coverPhoto && businessMedia?.allPhotos && businessMedia.allPhotos.length > 0 && !auditMode && (
                  <div className="grid grid-cols-3 gap-1 h-full p-2">
                    {businessMedia.allPhotos.slice(0, 6).map((photo, index) => (
                      <div key={index} className="relative overflow-hidden rounded-lg">
                        <img
                          src={GoogleBusinessAPI.getBestImageUrl(photo) || ''}
                          alt={`Business photo ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                
                {auditMode && getIssueForSection('photos') && (
                  <AuditHighlight 
                    issue={getIssueForSection('photos')!}
                    className="absolute inset-4"
                  >
                    <div className="h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <Camera className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">
                          {businessMedia?.allPhotos && businessMedia.allPhotos.length > 0 
                            ? `${businessMedia.allPhotos.length} photos (need ${Math.max(0, 10 - businessMedia.allPhotos.length)} more)`
                            : 'Add photos'
                          }
                        </p>
                      </div>
                    </div>
                  </AuditHighlight>
                )}
                
                {!auditMode && (!businessMedia?.coverPhoto && (!businessMedia?.allPhotos || businessMedia.allPhotos.length === 0)) && (
                  <div className="absolute inset-4 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Camera className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Business Photos</p>
                    </div>
                  </div>
                )}
                
                {/* Loading overlay */}
                {loadingMedia && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                      <p className="text-sm">Loading photos...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Business Info */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Use profile photo if available, otherwise fallback to logo */}
                  {businessMedia?.profilePhoto ? (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50">
                      <img
                        src={GoogleBusinessAPI.getBestImageUrl(businessMedia.profilePhoto) || ''}
                        alt={`${selectedProfile.name} profile`}
                        className="w-full h-full object-cover"
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
                      className="w-20 h-20"
                    />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {selectedProfile.name}
                        </h1>
                        
                        <div className="flex items-center gap-2 mb-2">
                          {renderStars(selectedProfile.rating || 0)}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {selectedProfile.rating} • {selectedProfile.reviewCount} Google reviews
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Construction company in {selectedProfile.address?.split(',')[1] || 'Miami-Dade County'}, Florida
                        </p>
                      </div>
                      
                      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        You manage this Business Profile
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-4">
                      {auditMode && getIssueForSection('contact') ? (
                        <AuditHighlight issue={getIssueForSection('contact')!}>
                          <Button variant="outline" size="sm" className="opacity-50">
                            <Globe className="w-4 h-4 mr-2" />
                            Website
                          </Button>
                        </AuditHighlight>
                      ) : (
                        <Button variant="outline" size="sm">
                          <Globe className="w-4 h-4 mr-2" />
                          Website
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <Navigation className="w-4 h-4 mr-2" />
                        Directions
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Star className="w-4 h-4 mr-2" />
                        Reviews
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Share className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{selectedProfile.address}</span>
                      </div>
                      
                      {auditMode && getIssueForSection('contact') ? (
                        <AuditHighlight issue={getIssueForSection('contact')!}>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Phone className="w-4 h-4" />
                            <span>Phone number missing</span>
                          </div>
                        </AuditHighlight>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span>{selectedProfile.phone || '(786) 257-8816'}</span>
                        </div>
                      )}
                      
                      {auditMode && getIssueForSection('hours') ? (
                        <AuditHighlight issue={getIssueForSection('hours')!}>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>Hours not specified</span>
                          </div>
                        </AuditHighlight>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{formatBusinessHours(selectedProfile.googleData?.businessHours)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Description */}
            <div className="px-6 pb-4">
              {auditMode && getIssueForSection('description') ? (
                <AuditHighlight issue={getIssueForSection('description')!}>
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p className="text-gray-500 italic">Business description missing or too short</p>
                  </div>
                </AuditHighlight>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedProfile.googleData?.businessDescription || 
                     "AG Construction redefines new construction, home building, and remodeling in Miami through cutting-edge design, premium craftsmanship, and exceptional service."}
                  </p>
                </div>
              )}
            </div>

            {/* Products/Services Section */}
            <div className="px-6 pb-4">
              <h3 className="font-semibold mb-3">Products</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="w-full h-24 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                  <p className="text-sm font-medium">REMODELING</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center">
                  <div className="w-full h-24 bg-gray-200 dark:bg-gray-600 rounded mb-2"></div>
                  <p className="text-sm font-medium">Home Remodeling</p>
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center flex items-center justify-center">
                  <Plus className="w-6 h-6 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Q&A Section */}
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Questions & answers</h3>
                <Button variant="outline" size="sm">Ask a question</Button>
              </div>
              
              {auditMode && getIssueForSection('qa') ? (
                <AuditHighlight issue={getIssueForSection('qa')!}>
                  <div className="text-center py-8 text-gray-500">
                    <HelpCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No questions and answers yet</p>
                  </div>
                </AuditHighlight>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">See all questions (1)</p>
                </div>
              )}
            </div>

            {/* Reviews Section */}
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Reviews</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Get more reviews</Button>
                  <Button variant="outline" size="sm">Add a photo</Button>
                </div>
              </div>
              
              {auditMode && getIssueForSection('reviews') ? (
                <AuditHighlight issue={getIssueForSection('reviews')!}>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold">{selectedProfile.rating || '5.0'}</div>
                    <div>
                      {renderStars(selectedProfile.rating || 5)}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedProfile.reviewCount || 7} Google reviews (Need more reviews)
                      </p>
                    </div>
                  </div>
                </AuditHighlight>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-2xl font-bold">{selectedProfile.rating || '5.0'}</div>
                  <div>
                    {renderStars(selectedProfile.rating || 5)}
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedProfile.reviewCount || 7} Google reviews
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Posts Section */}
            <div className="px-6 pb-6">
              <h3 className="font-semibold mb-3">From AMERICAN GLOBAL CONSTRUCTION LLC</h3>
              
              {auditMode && getIssueForSection('posts') ? (
                <AuditHighlight issue={getIssueForSection('posts')!}>
                  <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No posts yet - start sharing updates!</p>
                  </div>
                </AuditHighlight>
              ) : (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Recent business posts would appear here</p>
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
            className="mt-6"
          >
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-800 dark:text-purple-200">
                  <Target className="w-5 h-5" />
                  Audit Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {profileAudit.overallScore}
                    </div>
                    <p className="text-sm text-purple-700 dark:text-purple-300">Overall Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {profileAudit.completionPercentage}%
                    </div>
                    <p className="text-sm text-blue-700 dark:text-blue-300">Complete</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {profileAudit.issues.length}
                    </div>
                    <p className="text-sm text-orange-700 dark:text-orange-300">Issues Found</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Immediate Actions */}
                  <div>
                    <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
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
                    <h4 className="font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
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
                    <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
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
    </div>
  )
} 