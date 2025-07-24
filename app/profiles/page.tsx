'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  Building2, 
  Plus, 
  MapPin, 
  Phone, 
  Globe, 
  Clock, 
  Star,
  Edit,
  Trash2,
  ExternalLink,
  LogOut,
  Loader2,
  User,
  RefreshCw,
  AlertCircle,
  Eye,
  MessageSquare
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GoogleAuthService } from '@/lib/google-auth'
import { GoogleBusinessAPI, BusinessLocation } from '@/lib/google-business-api'
import { BusinessProfilesStorage, SavedBusinessProfile } from '@/lib/business-profiles-storage'
import { CentralizedDataLoader } from '@/lib/centralized-data-loader'
import { TestSubscriptionButton } from '@/components/test-subscription-button'

interface BusinessProfile {
  id: string
  name: string
  address: string
  phone: string
  website: string
  category: string
  rating: number
  reviewCount: number
  status: 'active' | 'pending' | 'suspended'
  lastUpdated: string
  googleBusinessId?: string
}

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

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<BusinessProfile[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [googleLocations, setGoogleLocations] = useState<BusinessLocation[]>([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<{ email: string; name: string; picture?: string } | null>(null)
  const [sessionInfo, setSessionInfo] = useState<{ created_at: number; last_refreshed: number; expires_at: number } | null>(null)
  const [refreshingToken, setRefreshingToken] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<SavedBusinessProfile | null>(null)
  const [showDetailView, setShowDetailView] = useState(false)

  // Check connection status after component mounts
  useEffect(() => {
    setMounted(true)
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    const authStatus = CentralizedDataLoader.getAuthStatus()
    setIsConnected(authStatus.isAuthenticated)
    setUserInfo(authStatus.userInfo || null)
    setSessionInfo(null) // This method doesn't return sessionInfo, we can remove this
    
    if (authStatus.isAuthenticated) {
      // Load saved profiles from storage using centralized loader
      const savedProfiles = CentralizedDataLoader.loadProfiles()
      const convertedProfiles = CentralizedDataLoader.convertProfilesToDisplayFormat(savedProfiles)
      setProfiles(convertedProfiles)
      console.log('[Profiles] Loaded', savedProfiles.length, 'saved profiles from storage')
    } else {
      // Show template data when not connected
      setProfiles([
        {
          id: '1',
          name: 'Downtown Cafe',
          address: '123 Main St, Downtown, NY 10001',
          phone: '+1 (555) 123-4567',
          website: 'https://downtowncafe.com',
          category: 'Restaurant',
          rating: 4.5,
          reviewCount: 127,
          status: 'active',
          lastUpdated: '2024-01-15',
          googleBusinessId: 'ChIJN1t_tDeuEmsRUsoyG83frY4'
        },
        {
          id: '2',
          name: 'Tech Solutions Inc',
          address: '456 Business Ave, Tech District, NY 10002',
          phone: '+1 (555) 987-6543',
          website: 'https://techsolutions.com',
          category: 'Technology',
          rating: 4.8,
          reviewCount: 89,
          status: 'active',
          lastUpdated: '2024-01-14',
          googleBusinessId: 'ChIJN1t_tDeuEmsRUsoyG83frY5'
        },
        {
          id: '3',
          name: 'Local Bakery',
          address: '789 Sweet St, Bakery Row, NY 10003',
          phone: '+1 (555) 456-7890',
          website: 'https://localbakery.com',
          category: 'Bakery',
          rating: 4.2,
          reviewCount: 203,
          status: 'pending',
          lastUpdated: '2024-01-13'
        }
      ])
    }
  }

  const handleConnectGoogle = () => {
    const authService = GoogleAuthService.getInstance()
    const authUrl = authService.getAuthUrl()
    window.location.href = authUrl
  }

  const handleDisconnect = async () => {
    const authService = GoogleAuthService.getInstance()
    await authService.forceReauth() // This will revoke tokens and clear session
    checkAuthStatus() // Refresh the UI
  }

  const handleRefreshToken = async () => {
    if (!isConnected) return
    
    setRefreshingToken(true)
    setError(null)
    
    try {
      const authService = GoogleAuthService.getInstance()
      await authService.refreshAccessToken()
      
      // Update session info
      const session = authService.getSessionInfo()
      setSessionInfo(session)
      
      console.log('Token refreshed successfully')
    } catch (error) {
      console.error('Failed to refresh token:', error)
      setError(`Failed to refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`)
      
      // If refresh fails, the auth service will automatically log out
      checkAuthStatus()
    } finally {
      setRefreshingToken(false)
    }
  }

  const loadBusinessProfiles = async () => {
    setLoadingLocations(true)
    setError('')
    
    try {
      console.log('Loading business profiles...')
      const locations = await CentralizedDataLoader.loadGoogleBusinessLocations()
      setGoogleLocations(locations)
    } catch (error) {
      console.error('Failed to load business profiles:', error)
      setError(error instanceof Error ? error.message : 'Failed to load business profiles')
    } finally {
      setLoadingLocations(false)
    }
  }

  const handleAddProfile = () => {
    if (!isConnected) {
      setError('Please connect your Google account first.')
      return
    }
    
    setShowAddForm(true)
    loadBusinessProfiles()
  }

  const addGoogleProfile = async (location: any) => {
    try {
      setLoadingLocations(true)
      setError(null)
      
      const result = await CentralizedDataLoader.addGoogleBusinessProfile(location)
      
      if (result.success && result.profile) {
        // Convert to display format
        const newProfile = {
          id: result.profile.id,
          name: result.profile.name,
          address: result.profile.address,
          phone: result.profile.phone,
          website: result.profile.website,
          category: result.profile.category,
          rating: result.profile.rating,
          reviewCount: result.profile.reviewCount,
          status: result.profile.status,
          lastUpdated: result.profile.lastUpdated,
          googleBusinessId: result.profile.googleBusinessId
        }
        
        // Update the UI
        setProfiles(prev => [...prev, newProfile])
        setShowAddForm(false)
        setGoogleLocations([])
        setError(null)
      } else {
        setError(result.error || 'Failed to add business profile')
      }
      
    } catch (error) {
      console.error('[Profiles] Error adding profile:', error)
      setError(`Failed to add business profile: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoadingLocations(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const isTokenExpiringSoon = () => {
    if (!sessionInfo) return false
    const now = Date.now()
    const timeUntilExpiry = sessionInfo.expires_at - now
    const fiveMinutes = 5 * 60 * 1000
    return timeUntilExpiry < fiveMinutes && timeUntilExpiry > 0
  }

  const handleDeleteProfile = (profileId: string) => {
    if (confirm('Are you sure you want to delete this business profile?')) {
      BusinessProfilesStorage.deleteProfile(profileId)
      setProfiles(prev => prev.filter(p => p.id !== profileId))
      console.log('[Profiles] Deleted profile:', profileId)
    }
  }

  const handleRefreshProfiles = () => {
    checkAuthStatus() // This will reload profiles with updated review counts
  }

  const handleViewProfileDetails = (profileId: string) => {
    const savedProfile = BusinessProfilesStorage.getProfile(profileId)
    if (savedProfile) {
      setSelectedProfile(savedProfile)
      setShowDetailView(true)
    }
  }

  const handleClearAllProfiles = () => {
    if (confirm('Are you sure you want to clear all saved business profiles? This action cannot be undone.')) {
      BusinessProfilesStorage.clearAllProfiles()
      setProfiles([])
      console.log('[Profiles] Cleared all profiles')
    }
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
          <div className="relative mb-6 lg:mb-8">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl lg:rounded-3xl blur-2xl lg:blur-3xl" />
            
            <div className="relative bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/20 dark:border-white/10 p-4 lg:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Building2 className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                        Business Profiles
                      </h1>
                      <p className="text-sm lg:text-lg text-gray-600 dark:text-gray-300 font-medium">
                        Manage your Google Business Profile locations with elite precision
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    onClick={handleRefreshProfiles}
                    className="w-full sm:w-auto bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                  <Button 
                    onClick={handleAddProfile} 
                    disabled={!isConnected}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Plus className="mr-2 h-4 w-4 relative z-10" />
                    <span className="relative z-10">Add New Profile</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Connection Status */}
          <div className="relative mb-6 lg:mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl lg:rounded-3xl blur-xl lg:blur-2xl" />
            
            <div className="relative bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/20 dark:border-white/10 overflow-hidden">
              {/* Header with Gradient */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 lg:p-6 border-b border-white/20 dark:border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">Google Business Profile</h3>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                      Connect your Google account to unlock premium features
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
                {/* Connection Status Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className={`w-4 h-4 rounded-full ${mounted && isConnected ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}></div>
                      <div className={`absolute inset-0 w-4 h-4 rounded-full ${mounted && isConnected ? 'bg-green-500' : 'bg-red-500'} animate-ping opacity-30`}></div>
                    </div>
                    <div>
                      <span className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
                        {mounted ? (isConnected ? 'Connected' : 'Not Connected') : 'Checking...'}
                      </span>
                      {isTokenExpiringSoon() && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Token Expiring Soon
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                    {mounted && !isConnected && (
                      <Button 
                        onClick={handleConnectGoogle}
                        className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                      >
                        Connect Google Account
                      </Button>
                    )}
                    {mounted && isConnected && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleRefreshToken}
                          disabled={refreshingToken}
                          className="w-full sm:w-auto bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300"
                        >
                          {refreshingToken ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="mr-2 h-4 w-4" />
                          )}
                          Refresh Token
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleDisconnect}
                          className="w-full sm:w-auto bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300"
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Disconnect
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Test Subscription Section - Only show in development */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="border-t border-white/20 dark:border-white/10 pt-4">
                    <TestSubscriptionButton className="w-full" />
                  </div>
                )}

                {/* User Info (when connected) */}
                {mounted && isConnected && userInfo && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-800/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                        <User className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base">{userInfo.name}</p>
                        <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">{userInfo.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Session Info (when connected) */}
                {mounted && isConnected && sessionInfo && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/50 dark:bg-black/20 rounded-xl p-3 border border-white/30 dark:border-white/20">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Connected</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(sessionInfo.created_at)}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 rounded-xl p-3 border border-white/30 dark:border-white/20">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Last Refreshed</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(sessionInfo.last_refreshed)}</p>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 rounded-xl p-3 border border-white/30 dark:border-white/20">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Token Expires</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDate(sessionInfo.expires_at)}</p>
                    </div>
                  </div>
                )}

                {/* Status Description */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200/50 dark:border-gray-700/50">
                  <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                    {mounted && isConnected 
                      ? '✨ Your Google account is connected and ready to manage business profiles with premium features.'
                      : '🔗 Connect your Google account to sync business profiles, manage posts, and unlock advanced analytics.'
                    }
                  </p>
                </div>
              </div>
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
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Profiles Grid */}
          {profiles.length > 0 && (
            <div className="grid gap-4 lg:gap-8 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {profiles.map((profile, index) => (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="relative h-full">
                    {/* Background Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl lg:rounded-3xl blur-lg lg:blur-xl group-hover:blur-xl lg:group-hover:blur-2xl transition-all duration-500" />
                    
                    {/* Card */}
                    <div className="relative h-full bg-white/60 dark:bg-black/30 backdrop-blur-xl rounded-2xl lg:rounded-3xl border border-white/30 dark:border-white/20 shadow-xl hover:shadow-2xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-white/50 dark:group-hover:border-white/30 overflow-hidden">
                      
                      {/* Header with Gradient Overlay */}
                      <div className="relative p-4 lg:p-6 bg-gradient-to-br from-white/20 to-transparent dark:from-black/20 border-b border-white/20 dark:border-white/10">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 lg:space-x-4">
                            {/* Premium Business Avatar */}
                            <div className="relative">
                              <BusinessLogo 
                                businessName={profile.name} 
                                website={profile.website}
                                className="w-12 h-12 lg:w-16 lg:h-16"
                              />
                              {/* Status Indicator */}
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 rounded-full border-2 border-white dark:border-gray-900 ${
                                profile.status === 'active' ? 'bg-green-500' : 
                                profile.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                              } shadow-lg`}>
                                <div className={`absolute inset-0 rounded-full animate-ping ${
                                  profile.status === 'active' ? 'bg-green-500' : 
                                  profile.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                } opacity-30`} />
                              </div>
                            </div>
                            
                            <div className="space-y-2 flex-1 min-w-0">
                              <h3 className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 truncate">
                                {profile.name}
                              </h3>
                              <div className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 dark:from-blue-900/30 dark:to-purple-900/30 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50">
                                {profile.category}
                              </div>
                            </div>
                          </div>
                          
                          <Badge className={`${getStatusColor(profile.status)} shadow-sm text-xs`}>
                            {profile.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 lg:p-6 space-y-3 lg:space-y-4">
                        {/* Contact Information */}
                        <div className="space-y-3">
                          <div className="flex items-start space-x-3">
                            <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors duration-300 flex-shrink-0">
                              <MapPin className="h-3 w-3 lg:h-4 lg:w-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                            </div>
                            <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{profile.address}</p>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors duration-300 flex-shrink-0">
                              <Phone className="h-3 w-3 lg:h-4 lg:w-4 text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300" />
                            </div>
                            <p className="text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300">{profile.phone}</p>
                          </div>
                          
                          {profile.website && (
                            <div className="flex items-center space-x-3">
                              <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors duration-300 flex-shrink-0">
                                <Globe className="h-3 w-3 lg:h-4 lg:w-4 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300" />
                              </div>
                              <a 
                                href={profile.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs lg:text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-300 truncate"
                              >
                                {profile.website.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Performance Metrics */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl lg:rounded-2xl p-3 lg:p-4 border border-yellow-200/50 dark:border-yellow-800/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 lg:space-x-3">
                              <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg">
                                <Star className="h-4 w-4 lg:h-5 lg:w-5 text-white fill-current" />
                              </div>
                              <div>
                                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{profile.rating}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Average Rating</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">{profile.reviewCount}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">Reviews</p>
                            </div>
                          </div>
                        </div>

                        {/* Last Updated */}
                        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-2 lg:px-3 py-2">
                          Last updated: {profile.lastUpdated}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="p-4 lg:p-6 pt-0">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 text-xs lg:text-sm bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300 hover:scale-105"
                            onClick={() => handleViewProfileDetails(profile.id)}
                          >
                            <Eye className="mr-1 lg:mr-2 h-3 w-3" />
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-10 h-8 lg:w-12 lg:h-10 p-0 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300 hover:scale-105"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (profile.googleBusinessId && profile.googleBusinessId.includes('accounts/')) {
                                const businessUrl = `https://business.google.com/dashboard/l/${profile.googleBusinessId.split('/').pop()}`
                                window.open(businessUrl, '_blank')
                              } else if (profile.website) {
                                window.open(profile.website, '_blank')
                              }
                            }}
                            title="View on Google Business"
                          >
                            <ExternalLink className="h-3 w-3 lg:h-4 lg:w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-10 h-8 lg:w-12 lg:h-10 p-0 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-300 hover:scale-105"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteProfile(profile.id)
                            }}
                            title="Delete Profile"
                          >
                            <Trash2 className="h-3 w-3 lg:h-4 lg:w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {profiles.length === 0 && isConnected && (
            <Card className="text-center py-8 lg:py-12">
              <CardContent>
                <Building2 className="mx-auto h-10 w-10 lg:h-12 lg:w-12 text-muted-foreground mb-4" />
                <h3 className="text-base lg:text-lg font-semibold mb-2">No Business Profiles</h3>
                <p className="text-xs lg:text-sm text-muted-foreground mb-4">
                  Connect your Google Business Profile to start managing your locations.
                </p>
                <Button onClick={handleAddProfile} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Profile
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Add Profile Modal - Google Business Profiles */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-background rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Add Google Business Profile</h2>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                    ×
                  </Button>
                </div>

                {loadingLocations ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading your business profiles and review data...</span>
                  </div>
                ) : googleLocations.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Select a business profile from your Google Business account:
                    </p>
                    {googleLocations.map((location, index) => (
                      <Card key={index} className="cursor-pointer hover:bg-accent transition-colors border-2 hover:border-primary/20">
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            {/* Business Image/Avatar */}
                            <div className="flex-shrink-0">
                              <BusinessLogo 
                                businessName={location.title || location.displayName || location.locationName || 'B'} 
                                website={location.websiteUri}
                                className="w-16 h-16"
                              />
                            </div>
                            
                            {/* Business Information */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="font-semibold text-lg text-foreground mb-1">
                                    {location.title || location.displayName || location.locationName || 'Unknown Business'}
                                  </h3>
                                  
                                  {/* Business Category */}
                                  {location.primaryCategory?.displayName && (
                                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 mb-2">
                                      {location.primaryCategory.displayName}
                                    </div>
                                  )}
                                  
                                  {/* Verification Status */}
                                  {location.locationState?.isVerified !== undefined && (
                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ml-2 ${
                                      location.locationState.isVerified 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                                    }`}>
                                      {location.locationState.isVerified ? '✓ Verified' : '⚠ Unverified'}
                                    </div>
                                  )}
                                  
                                  {/* Business Status */}
                                  {location.openInfo?.status && (
                                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ml-2 ${
                                      location.openInfo.status === 'OPEN' 
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                    }`}>
                                      {location.openInfo.status === 'OPEN' ? '🟢 Open' : '🔴 Closed'}
                                    </div>
                                  )}
                                  
                                  {/* Address */}
                                  {(location.storefrontAddress || location.address) && (
                                    <div className="flex items-start space-x-2 mb-2">
                                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                                      <p className="text-sm text-muted-foreground">
                                        {(location.storefrontAddress || location.address)?.addressLines?.join(', ') || ''}{(location.storefrontAddress || location.address)?.addressLines?.length ? ', ' : ''}{(location.storefrontAddress || location.address)?.locality || ''} {(location.storefrontAddress || location.address)?.administrativeArea || ''} {(location.storefrontAddress || location.address)?.postalCode || ''}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Phone Number */}
                                  {GoogleBusinessAPI.getPrimaryPhone(location as any) !== 'Phone not available' && (
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Phone className="h-4 w-4 text-muted-foreground" />
                                      <p className="text-sm text-muted-foreground">
                                        {GoogleBusinessAPI.getPrimaryPhone(location as any)}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Website */}
                                  {location.websiteUri && (
                                    <div className="flex items-center space-x-2 mb-2">
                                      <Globe className="h-4 w-4 text-muted-foreground" />
                                      <a 
                                        href={location.websiteUri} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        {location.websiteUri}
                                      </a>
                                    </div>
                                  )}
                                  
                                  {/* Business Hours */}
                                  {location.regularHours?.periods && location.regularHours.periods.length > 0 && (
                                    <div className="flex items-start space-x-2 mb-2">
                                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                                      <div className="text-sm text-muted-foreground">
                                        <div className="font-medium">Business Hours:</div>
                                        {GoogleBusinessAPI.formatBusinessHours(location as any).slice(0, 2).map((hour, idx) => (
                                          <div key={idx} className="text-xs">{hour}</div>
                                        ))}
                                        {GoogleBusinessAPI.formatBusinessHours(location as any).length > 2 && (
                                          <div className="text-xs text-blue-600">+{GoogleBusinessAPI.formatBusinessHours(location as any).length - 2} more</div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Reviews Info */}
                                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                    <div className="flex items-center space-x-1">
                                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                      <span>{location.rating || 'No rating'}</span>
                                    </div>
                                    <span>•</span>
                                    <span>{location.reviewCount || location.totalReviews || 0} reviews</span>
                                  </div>
                                  
                                  {/* Business Capabilities */}
                                  {location.metadata && GoogleBusinessAPI.getBusinessCapabilities(location as any).length > 0 && (
                                    <div className="mt-2">
                                      <div className="text-xs font-medium text-muted-foreground mb-1">Capabilities:</div>
                                      <div className="flex flex-wrap gap-1">
                                        {GoogleBusinessAPI.getBusinessCapabilities(location as any).slice(0, 3).map((capability, idx) => (
                                          <span key={idx} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                            {capability}
                                          </span>
                                        ))}
                                        {GoogleBusinessAPI.getBusinessCapabilities(location as any).length > 3 && (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                            +{GoogleBusinessAPI.getBusinessCapabilities(location as any).length - 3}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Add Profile Button */}
                                <Button 
                                  size="lg" 
                                  className="rounded-full w-12 h-12 p-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    addGoogleProfile(location)
                                  }}
                                >
                                  <Plus className="h-5 w-5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Business Profiles Found</h3>
                    <p className="text-muted-foreground">
                      Make sure you have business profiles set up in your Google Business Profile account.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* Detailed Profile View Modal */}
          {showDetailView && selectedProfile && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 dark:bg-black/80 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden"
              >
                {/* Header */}
                <div className="relative bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 p-6 border-b border-white/20 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <BusinessLogo businessName={selectedProfile.name} website={selectedProfile.website} className="w-14 h-14" />
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedProfile.name}</h2>
                        <p className="text-base text-gray-600 dark:text-gray-300">{selectedProfile.category}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={`${getStatusColor(selectedProfile.status)} text-xs`}>
                            {selectedProfile.status}
                          </Badge>
                          {selectedProfile.isVerified !== undefined && (
                            <Badge className={`text-xs ${selectedProfile.isVerified ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'}`}>
                              {selectedProfile.isVerified ? '✓ Verified' : '⚠ Unverified'}
                            </Badge>
                          )}
                          {selectedProfile.googleData?.businessStatusInfo?.isOpen !== undefined && (
                            <Badge className={`text-xs ${selectedProfile.googleData.businessStatusInfo.isOpen ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'}`}>
                              {selectedProfile.googleData.businessStatusInfo.isOpen ? '🟢 Open' : '🔴 Closed'}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowDetailView(false)}
                      className="w-8 h-8 p-0 rounded-full bg-white/50 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300"
                    >
                      ×
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(85vh-140px)] p-6">
                  {/* Performance Metrics */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl p-4 border border-yellow-200/50 dark:border-yellow-800/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                          <Star className="h-5 w-5 text-white fill-current" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedProfile.googleData?.reviewsSummary?.averageRating?.toFixed(1) || selectedProfile.rating}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Average Rating</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-800/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                          <MessageSquare className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {selectedProfile.googleData?.reviewsSummary?.totalReviews || selectedProfile.reviewCount}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Grid */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    
                    {/* Left Column */}
                    <div className="space-y-4">
                      
                      {/* Contact Information */}
                      <div className="bg-white/60 dark:bg-black/30 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/20 p-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                          <Phone className="mr-2 h-5 w-5 text-blue-500" />
                          Contact Information
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="font-medium text-sm text-gray-500 dark:text-gray-400">Primary Phone</p>
                            <p className="text-base text-gray-900 dark:text-white">{selectedProfile.phone}</p>
                          </div>
                          {selectedProfile.website && (
                            <div>
                              <p className="font-medium text-sm text-gray-500 dark:text-gray-400">Website</p>
                              <a 
                                href={selectedProfile.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-300 text-sm break-all"
                              >
                                {selectedProfile.website.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Location */}
                      <div className="bg-white/60 dark:bg-black/30 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/20 p-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                          <MapPin className="mr-2 h-5 w-5 text-green-500" />
                          Location
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <p className="font-medium text-sm text-gray-500 dark:text-gray-400">Address</p>
                            <p className="text-sm text-gray-900 dark:text-white leading-relaxed">{selectedProfile.address}</p>
                          </div>
                          {selectedProfile.googleData?.latlng && (
                            <div>
                              <p className="font-medium text-sm text-gray-500 dark:text-gray-400">Coordinates</p>
                              <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                                {selectedProfile.googleData.latlng.latitude.toFixed(6)}, {selectedProfile.googleData.latlng.longitude.toFixed(6)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Business Description */}
                      {selectedProfile.googleData?.businessDescription && selectedProfile.googleData.businessDescription !== 'No description available' && (
                        <div className="bg-white/60 dark:bg-black/30 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/20 p-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">About This Business</h3>
                          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{selectedProfile.googleData.businessDescription}</p>
                        </div>
                      )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                      
                      {/* Categories */}
                      {selectedProfile.googleData?.allCategories && selectedProfile.googleData.allCategories.length > 0 && (
                        <div className="bg-white/60 dark:bg-black/30 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/20 p-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                            <Building2 className="mr-2 h-5 w-5 text-purple-500" />
                            Business Categories
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedProfile.googleData.allCategories.slice(0, 6).map((category, idx) => (
                              <Badge key={idx} className={`text-xs ${idx === 0 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                {category} {idx === 0 && '(Primary)'}
                              </Badge>
                            ))}
                            {selectedProfile.googleData.allCategories.length > 6 && (
                              <Badge className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                +{selectedProfile.googleData.allCategories.length - 6} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Business Hours */}
                      {selectedProfile.googleData?.businessHours && selectedProfile.googleData.businessHours.length > 0 && (
                        <div className="bg-white/60 dark:bg-black/30 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/20 p-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                            <Clock className="mr-2 h-5 w-5 text-orange-500" />
                            Business Hours
                          </h3>
                          <div className="space-y-2">
                            {(() => {
                              // Group consecutive days with same hours
                              const groupedHours: { [key: string]: string[] } = {}
                              
                              selectedProfile.googleData.businessHours.forEach(hour => {
                                const [day, time] = hour.split(': ')
                                if (!groupedHours[time]) {
                                  groupedHours[time] = []
                                }
                                groupedHours[time].push(day)
                              })
                              
                              return Object.entries(groupedHours).slice(0, 4).map(([time, days], idx) => {
                                // Format consecutive days
                                let dayRange = ''
                                if (days.length === 1) {
                                  dayRange = days[0]
                                } else if (days.length === 5 && days.includes('Monday') && days.includes('Friday')) {
                                  dayRange = 'Mon-Fri'
                                } else if (days.length === 7) {
                                  dayRange = 'Every day'
                                } else if (days.length === 2 && days.includes('Saturday') && days.includes('Sunday')) {
                                  dayRange = 'Weekends'
                                } else {
                                  dayRange = days.join(', ')
                                }
                                
                                return (
                                  <div key={idx} className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">{dayRange}</span>
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">{time}</span>
                                  </div>
                                )
                              })
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Available Services */}
                      {selectedProfile.googleData?.serviceTypes && selectedProfile.googleData.serviceTypes.length > 0 && (
                        <div className="bg-white/60 dark:bg-black/30 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/20 p-4">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                            <Star className="mr-2 h-5 w-5 text-yellow-500" />
                            Available Services
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedProfile.googleData.serviceTypes.slice(0, 8).map((service, idx) => (
                              <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 text-xs">
                                {service.displayName}
                              </Badge>
                            ))}
                            {selectedProfile.googleData.serviceTypes.length > 8 && (
                              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800 text-xs">
                                +{selectedProfile.googleData.serviceTypes.length - 8} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Data Information */}
                      <div className="bg-white/60 dark:bg-black/30 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/20 p-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Data Information</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Last Updated</span>
                            <span className="text-sm text-gray-900 dark:text-white">{selectedProfile.lastUpdated}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Last Synced</span>
                            <span className="text-sm text-gray-900 dark:text-white">{new Date(selectedProfile.lastSynced).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Added</span>
                            <span className="text-sm text-gray-900 dark:text-white">{new Date(selectedProfile.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 p-6 pt-4 border-t border-white/20 dark:border-white/10 bg-gradient-to-r from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDetailView(false)}
                    className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300"
                  >
                    Close
                  </Button>
                  {selectedProfile.googleData?.metadata?.mapsUri && (
                    <Button 
                      variant="outline"
                      onClick={() => window.open(selectedProfile.googleData?.metadata?.mapsUri, '_blank')}
                      className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      View on Maps
                    </Button>
                  )}
                  {selectedProfile.googleBusinessId && (
                    <Button 
                      onClick={() => {
                        if (selectedProfile.googleBusinessId && selectedProfile.googleBusinessId.includes('accounts/')) {
                          const businessUrl = `https://business.google.com/dashboard/l/${selectedProfile.googleBusinessId.split('/').pop()}`
                          window.open(businessUrl, '_blank')
                        }
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <ExternalLink className="mr-2 h-4 w-4 relative z-10" />
                      <span className="relative z-10">Manage on Google</span>
                    </Button>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  )
} 