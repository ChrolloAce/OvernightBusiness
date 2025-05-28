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
  Info
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BusinessProfilesStorage, SavedBusinessProfile } from '@/lib/business-profiles-storage'

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
        <Search className="w-8 h-8 text-white" />
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

// Simple Progress component inline
interface ProgressProps {
  value: number
  className?: string
}

function Progress({ value, className = "" }: ProgressProps) {
  const percentage = Math.min(Math.max(value, 0), 100)
  
  return (
    <div className={`relative h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 ${className}`}>
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ease-in-out rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export default function ContentHubPage() {
  const [profiles, setProfiles] = useState<SavedBusinessProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<SavedBusinessProfile | null>(null)
  const [profileAudit, setProfileAudit] = useState<ProfileAudit | null>(null)
  const [loading, setLoading] = useState(false)
  const [auditFilter, setAuditFilter] = useState<'all' | 'critical' | 'important' | 'recommended' | 'optimization'>('all')

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

  const performProfileAudit = async (profile: SavedBusinessProfile) => {
    setLoading(true)
    
    try {
      // Simulate audit analysis
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const issues: AuditIssue[] = []
      let score = 100
      let completionItems = 0
      let totalItems = 20 // Total possible optimization items

      // Critical Issues
      if (!profile.googleData?.businessDescription || profile.googleData.businessDescription.length < 100) {
        issues.push({
          id: 'business-description',
          category: 'critical',
          title: 'Missing or Short Business Description',
          description: 'Your business description is missing or too short (less than 100 characters)',
          impact: 'Reduces search visibility and customer understanding of your business',
          solution: 'Add a detailed 150-250 character description highlighting your key services and unique value proposition',
          priority: 1,
          icon: <FileText className="w-4 h-4" />,
          status: !profile.googleData?.businessDescription ? 'missing' : 'incomplete'
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
          impact: 'Customers cannot easily find your online presence or make online purchases',
          solution: 'Add your business website URL to drive traffic and increase conversions',
          priority: 2,
          icon: <Globe className="w-4 h-4" />,
          status: 'missing'
        })
        score -= 12
      } else {
        completionItems++
      }

      if (!profile.phone || profile.phone === '') {
        issues.push({
          id: 'phone-missing',
          category: 'critical',
          title: 'No Phone Number Listed',
          description: 'Your business profile is missing a contact phone number',
          impact: 'Customers cannot easily call your business for inquiries or appointments',
          solution: 'Add your primary business phone number for customer contact',
          priority: 3,
          icon: <Phone className="w-4 h-4" />,
          status: 'missing'
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
          impact: 'Customers don\'t know when you\'re open, reducing foot traffic and calls',
          solution: 'Add complete business hours for all days of the week',
          priority: 4,
          icon: <Clock className="w-4 h-4" />,
          status: 'missing'
        })
        score -= 8
      } else {
        completionItems++
      }

      if (!(profile.googleData as any)?.photos || (profile.googleData as any).photos?.length < 5) {
        issues.push({
          id: 'insufficient-photos',
          category: 'important',
          title: 'Insufficient Photos',
          description: `Your profile has ${(profile.googleData as any)?.photos?.length || 0} photos (recommended: 10+)`,
          impact: 'Fewer photos reduce customer engagement and trust',
          solution: 'Add high-quality photos of your business, products, services, and team',
          priority: 5,
          icon: <Camera className="w-4 h-4" />,
          status: 'incomplete'
        })
        score -= 7
      } else if (((profile.googleData as any)?.photos?.length || 0) >= 5) {
        completionItems++
      }

      if (!(profile.googleData as any)?.services || (profile.googleData as any).services?.length < 3) {
        issues.push({
          id: 'missing-services',
          category: 'important',
          title: 'Limited Services Listed',
          description: `Only ${(profile.googleData as any)?.services?.length || 0} services listed (recommended: 5+)`,
          impact: 'Customers may not discover all your offerings',
          solution: 'Add comprehensive list of all services and products you offer',
          priority: 6,
          icon: <Tag className="w-4 h-4" />,
          status: 'incomplete'
        })
        score -= 6
      } else if (((profile.googleData as any)?.services?.length || 0) >= 3) {
        completionItems++
      }

      // Recommended Improvements
      if (!profile.googleData?.attributes || profile.googleData.attributes.length < 5) {
        issues.push({
          id: 'missing-attributes',
          category: 'recommended',
          title: 'Few Business Attributes',
          description: 'Your profile lacks important business attributes (WiFi, parking, accessibility, etc.)',
          impact: 'Customers can\'t find specific amenities they\'re looking for',
          solution: 'Add relevant attributes like WiFi availability, parking options, accessibility features',
          priority: 7,
          icon: <Shield className="w-4 h-4" />,
          status: 'incomplete'
        })
        score -= 5
      } else if ((profile.googleData?.attributes?.length || 0) >= 5) {
        completionItems++
      }

      if ((profile.reviewCount || 0) < 10) {
        issues.push({
          id: 'low-review-count',
          category: 'recommended',
          title: 'Low Review Count',
          description: `Your business has ${profile.reviewCount || 0} reviews (target: 25+)`,
          impact: 'Fewer reviews reduce credibility and search ranking',
          solution: 'Implement a review collection strategy to encourage satisfied customers to leave reviews',
          priority: 8,
          icon: <Star className="w-4 h-4" />,
          status: 'incomplete'
        })
        score -= 4
      } else if ((profile.reviewCount || 0) >= 10) {
        completionItems++
      }

      if ((profile.rating || 0) < 4.0) {
        issues.push({
          id: 'low-rating',
          category: 'recommended',
          title: 'Below Average Rating',
          description: `Your rating is ${profile.rating || 0}/5 (target: 4.0+)`,
          impact: 'Lower ratings reduce customer trust and search visibility',
          solution: 'Focus on improving customer service and addressing negative feedback',
          priority: 9,
          icon: <Star className="w-4 h-4" />,
          status: 'incomplete'
        })
        score -= 3
      } else if ((profile.rating || 0) >= 4.0) {
        completionItems++
      }

      // Optimization Opportunities
      if (!(profile.googleData as any)?.posts || (profile.googleData as any).posts?.length === 0) {
        issues.push({
          id: 'no-posts',
          category: 'optimization',
          title: 'No Recent Posts',
          description: 'Your profile has no recent posts or updates',
          impact: 'Missed opportunities to engage customers and improve visibility',
          solution: 'Create regular posts about offers, events, products, and business updates',
          priority: 10,
          icon: <MessageSquare className="w-4 h-4" />,
          status: 'missing'
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
          impact: 'Customers can\'t find quick answers to common questions',
          solution: 'Add frequently asked questions and detailed answers about your business',
          priority: 11,
          icon: <MessageSquare className="w-4 h-4" />,
          status: 'missing'
        })
        score -= 2
      } else {
        completionItems++
      }

      // Additional optimization checks
      const additionalChecks = [
        { key: 'specialHours', name: 'Special Hours', weight: 1 },
        { key: 'serviceArea', name: 'Service Area', weight: 1 },
        { key: 'paymentOptions', name: 'Payment Options', weight: 1 },
        { key: 'socialMedia', name: 'Social Media Links', weight: 1 },
        { key: 'menuUrl', name: 'Menu/Catalog', weight: 1 },
        { key: 'bookingUrl', name: 'Booking Link', weight: 1 },
        { key: 'virtualTour', name: 'Virtual Tour', weight: 1 },
        { key: 'messaging', name: 'Messaging Enabled', weight: 1 },
        { key: 'callTracking', name: 'Call Tracking', weight: 1 }
      ]

      additionalChecks.forEach((check, index) => {
        const hasFeature = profile.googleData?.[check.key as keyof typeof profile.googleData]
        if (!hasFeature) {
          issues.push({
            id: check.key,
            category: 'optimization',
            title: `Missing ${check.name}`,
            description: `Your profile doesn't have ${check.name.toLowerCase()} configured`,
            impact: 'Missing opportunities for customer engagement and conversions',
            solution: `Configure ${check.name.toLowerCase()} to improve customer experience`,
            priority: 12 + index,
            icon: <Zap className="w-4 h-4" />,
            status: 'missing'
          })
          score -= check.weight
        } else {
          completionItems++
        }
      })

      // Calculate completion percentage
      const completionPercentage = Math.round((completionItems / totalItems) * 100)

      // Categorize recommendations
      const immediate = issues.filter(issue => issue.category === 'critical').slice(0, 3)
      const shortTerm = issues.filter(issue => issue.category === 'important').slice(0, 4)
      const longTerm = issues.filter(issue => ['recommended', 'optimization'].includes(issue.category)).slice(0, 5)

      // Identify strengths
      const strengths: string[] = []
      if (profile.rating && profile.rating >= 4.0) strengths.push('High customer rating')
      if (profile.reviewCount && profile.reviewCount >= 25) strengths.push('Strong review count')
      if (profile.googleData?.businessDescription && profile.googleData.businessDescription.length >= 100) strengths.push('Detailed business description')
      if (profile.website) strengths.push('Website listed')
      if (profile.phone) strengths.push('Contact information complete')
      if ((profile.googleData as any)?.photos && (profile.googleData as any).photos.length >= 10) strengths.push('Rich photo gallery')
      if ((profile.googleData as any)?.services && (profile.googleData as any).services.length >= 5) strengths.push('Comprehensive services listed')
      if (profile.googleData?.businessHours) strengths.push('Business hours specified')

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600'
    if (score >= 60) return 'from-yellow-500 to-orange-600'
    return 'from-red-500 to-pink-600'
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />
      case 'important': return <Clock className="w-4 h-4 text-orange-500" />
      case 'recommended': return <TrendingUp className="w-4 h-4 text-blue-500" />
      case 'optimization': return <Zap className="w-4 h-4 text-purple-500" />
      default: return <Info className="w-4 h-4 text-gray-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'critical': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'
      case 'important': return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950'
      case 'recommended': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
      case 'optimization': return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950'
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950'
    }
  }

  const filteredIssues = profileAudit?.issues.filter(issue => 
    auditFilter === 'all' || issue.category === auditFilter
  ) || []

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
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 rounded-2xl blur-2xl" />
            <div className="relative bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Search className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
                        Content Hub
                      </h1>
                      <p className="text-base text-gray-600 dark:text-gray-300 font-medium">
                        Analyze and optimize your Google Business Profiles for maximum performance
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={refreshAudit} 
                  disabled={loading || !selectedProfile}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <RefreshCw className={`w-4 h-4 mr-2 relative z-10 ${loading ? 'animate-spin' : ''}`} />
                  <span className="relative z-10">Refresh Audit</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Business Profile Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Select Business Profile to Audit
              </CardTitle>
              <CardDescription>
                Choose a business profile to analyze and get optimization recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedProfile?.id || ''} onValueChange={handleProfileSelect}>
                <SelectTrigger className="h-16 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300">
                  <SelectValue placeholder="Choose a business profile to audit">
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
            <>
              {loading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                      <p className="text-lg font-medium">Analyzing Profile...</p>
                      <p className="text-sm text-gray-500">Performing comprehensive audit</p>
                    </div>
                  </CardContent>
                </Card>
              ) : profileAudit && (
                <>
                  {/* Audit Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Overall Score */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl" />
                      <Card className="relative bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                        <CardContent className="p-6 text-center">
                          <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${getScoreGradient(profileAudit.overallScore)} bg-clip-text text-transparent`}>
                            {profileAudit.overallScore}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Overall Score</p>
                          <div className="flex items-center justify-center space-x-2">
                            <Award className={`w-5 h-5 ${getScoreColor(profileAudit.overallScore)}`} />
                            <span className={`font-medium ${getScoreColor(profileAudit.overallScore)}`}>
                              {profileAudit.overallScore >= 80 ? 'Excellent' : 
                               profileAudit.overallScore >= 60 ? 'Good' : 'Needs Work'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Completion Percentage */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl" />
                      <Card className="relative bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <BarChart3 className="w-5 h-5 text-blue-500" />
                              <span className="font-medium">Completion</span>
                            </div>
                            <span className="text-2xl font-bold text-blue-600">{profileAudit.completionPercentage}%</span>
                          </div>
                          <Progress value={profileAudit.completionPercentage} className="h-3" />
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Profile optimization progress
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Issues Count */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-2xl blur-xl" />
                      <Card className="relative bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <AlertTriangle className="w-5 h-5 text-orange-500" />
                              <span className="font-medium">Issues Found</span>
                            </div>
                            <span className="text-2xl font-bold text-orange-600">{profileAudit.issues.length}</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-red-600">Critical:</span>
                              <span className="font-medium">{profileAudit.issues.filter(i => i.category === 'critical').length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-orange-600">Important:</span>
                              <span className="font-medium">{profileAudit.issues.filter(i => i.category === 'important').length}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Strengths */}
                  {profileAudit.strengths.length > 0 && (
                    <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                          <CheckCircle className="w-5 h-5" />
                          Profile Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {profileAudit.strengths.map((strength, index) => (
                            <div key={index} className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Issues Filter */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          Optimization Issues & Recommendations
                        </CardTitle>
                        <Select value={auditFilter} onValueChange={(value: any) => setAuditFilter(value)}>
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Issues ({profileAudit.issues.length})</SelectItem>
                            <SelectItem value="critical">Critical ({profileAudit.issues.filter(i => i.category === 'critical').length})</SelectItem>
                            <SelectItem value="important">Important ({profileAudit.issues.filter(i => i.category === 'important').length})</SelectItem>
                            <SelectItem value="recommended">Recommended ({profileAudit.issues.filter(i => i.category === 'recommended').length})</SelectItem>
                            <SelectItem value="optimization">Optimization ({profileAudit.issues.filter(i => i.category === 'optimization').length})</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {filteredIssues.length > 0 ? (
                        <div className="space-y-4">
                          {filteredIssues.map((issue, index) => (
                            <motion.div
                              key={issue.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`rounded-xl border p-6 ${getCategoryColor(issue.category)}`}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  {getCategoryIcon(issue.category)}
                                  <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{issue.title}</h3>
                                    <Badge variant="outline" className="mt-1 capitalize">
                                      {issue.category}
                                    </Badge>
                                  </div>
                                </div>
                                <Badge variant="outline" className="capitalize">
                                  {issue.status}
                                </Badge>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">Issue:</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{issue.description}</p>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">Impact:</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{issue.impact}</p>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-1">Solution:</h4>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{issue.solution}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">Priority:</span>
                                  <Badge variant="secondary" className="text-xs">
                                    #{issue.priority}
                                  </Badge>
                                </div>
                                <Button size="sm" variant="outline">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                          <p className="text-lg font-medium">No issues found in this category</p>
                          <p className="text-sm text-gray-500">Your profile looks great for this filter!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Action Plan */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Immediate Actions */}
                    <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                          <AlertTriangle className="w-5 h-5" />
                          Immediate Actions
                        </CardTitle>
                        <CardDescription className="text-red-600 dark:text-red-400">
                          Fix these critical issues first
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {profileAudit.recommendations.immediate.map((issue, index) => (
                            <div key={issue.id} className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                              {issue.icon}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-red-800 dark:text-red-200">{issue.title}</p>
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{issue.description}</p>
                              </div>
                            </div>
                          ))}
                          {profileAudit.recommendations.immediate.length === 0 && (
                            <p className="text-sm text-red-600 dark:text-red-400">No immediate actions needed!</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Short-term Goals */}
                    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                          <Clock className="w-5 h-5" />
                          Short-term Goals
                        </CardTitle>
                        <CardDescription className="text-orange-600 dark:text-orange-400">
                          Complete within 1-2 weeks
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {profileAudit.recommendations.shortTerm.map((issue, index) => (
                            <div key={issue.id} className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                              {issue.icon}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">{issue.title}</p>
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">{issue.description}</p>
                              </div>
                            </div>
                          ))}
                          {profileAudit.recommendations.shortTerm.length === 0 && (
                            <p className="text-sm text-orange-600 dark:text-orange-400">No short-term goals needed!</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Long-term Optimization */}
                    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                          <TrendingUp className="w-5 h-5" />
                          Long-term Optimization
                        </CardTitle>
                        <CardDescription className="text-blue-600 dark:text-blue-400">
                          Ongoing improvements
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {profileAudit.recommendations.longTerm.map((issue, index) => (
                            <div key={issue.id} className="flex items-start space-x-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                              {issue.icon}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{issue.title}</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{issue.description}</p>
                              </div>
                            </div>
                          ))}
                          {profileAudit.recommendations.longTerm.length === 0 && (
                            <p className="text-sm text-blue-600 dark:text-blue-400">No long-term optimizations needed!</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
} 