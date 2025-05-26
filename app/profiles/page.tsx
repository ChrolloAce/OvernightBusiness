'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  AlertCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GoogleAuthService } from '@/lib/google-auth'
import { GoogleBusinessAPI } from '@/lib/google-business-api'
import { BusinessProfilesStorage, SavedBusinessProfile } from '@/lib/business-profiles-storage'

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

interface GoogleBusinessLocation {
  name: string
  locationName?: string
  title?: string
  displayName?: string
  primaryPhone?: string
  websiteUri?: string
  rating?: number
  reviewCount?: number
  address?: {
    addressLines: string[]
    locality: string
    administrativeArea: string
    postalCode: string
    regionCode: string
  }
  storefrontAddress?: {
    addressLines: string[]
    locality: string
    administrativeArea: string
    postalCode: string
    regionCode: string
  }
  primaryCategory?: {
    categoryId: string
    displayName: string
  }
  locationState?: {
    isGoogleUpdated: boolean
    isDuplicate: boolean
    isSuspended: boolean
    canUpdate: boolean
    canDelete: boolean
    isVerified: boolean
    needsReverification: boolean
  }
  openInfo?: {
    status: string
    canReopen: boolean
    openingDate?: {
      year: number
      month: number
      day: number
    }
  }
  regularHours?: {
    periods: Array<{
      openDay: string
      openTime: string
      closeDay: string
      closeTime: string
    }>
  }
  moreHours?: Array<{
    periods: Array<{
      openDay: string
      openTime: string
      closeDay: string
      closeTime: string
    }>
  }>
  metadata?: {
    hasGoogleUpdated: boolean
    hasPendingEdits: boolean
    canDelete: boolean
    canOperateLocalPost: boolean
    canModifyServiceList: boolean
    canHaveFoodMenus: boolean
    canOperateHealthData: boolean
    canOperateLodgingData: boolean
    placeId: string
    duplicateLocation?: string
    mapsUri: string
    newReviewUri: string
    canHaveBusinessCalls: boolean
    hasVoiceOfMerchant: boolean
  }
  latlng?: {
    latitude: number
    longitude: number
  }
  attributes?: Array<{
    attributeId: string
    valueType: string
    values: any[]
  }>
  profile?: {
    description: string
  }
  relationshipData?: any
  serviceItems?: any[]
  additionalCategories?: Array<{
    categoryId: string
    displayName: string
  }>
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<BusinessProfile[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [googleLocations, setGoogleLocations] = useState<GoogleBusinessLocation[]>([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<{ email: string; name: string; picture?: string } | null>(null)
  const [sessionInfo, setSessionInfo] = useState<{ created_at: number; last_refreshed: number; expires_at: number } | null>(null)
  const [refreshingToken, setRefreshingToken] = useState(false)

  // Check connection status after component mounts
  useEffect(() => {
    setMounted(true)
    checkAuthStatus()
  }, [])

  const checkAuthStatus = () => {
    const authService = GoogleAuthService.getInstance()
    const connected = authService.isAuthenticated()
    setIsConnected(connected)
    
    if (connected) {
      // Get user info and session details
      const user = authService.getUserInfo()
      const session = authService.getSessionInfo()
      setUserInfo(user)
      setSessionInfo(session)
      
      // Load saved profiles from storage
      const savedProfiles = BusinessProfilesStorage.getAllProfiles()
      const convertedProfiles: BusinessProfile[] = savedProfiles.map(saved => ({
        id: saved.id,
        name: saved.name,
        address: saved.address,
        phone: saved.phone,
        website: saved.website,
        category: saved.category,
        rating: saved.rating,
        reviewCount: saved.reviewCount,
        status: saved.status,
        lastUpdated: saved.lastUpdated,
        googleBusinessId: saved.googleBusinessId
      }))
      setProfiles(convertedProfiles)
      console.log('[Profiles] Loaded', savedProfiles.length, 'saved profiles from storage')
    } else {
      // Show template data when not connected
      setUserInfo(null)
      setSessionInfo(null)
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

  const fetchGoogleBusinessProfiles = async () => {
    if (!isConnected) return

    setLoadingLocations(true)
    setError(null)

    try {
      const businessAPI = new GoogleBusinessAPI()
      
      // First, test API access to get better error information
      console.log('Testing API access...')
      const apiTest = await businessAPI.testApiAccess()
      
      if (!apiTest.accounts) {
        setError(`API Access Test Failed:\n${apiTest.errors.join('\n')}`)
        setLoadingLocations(false)
        return
      }
      
      // Get all accounts
      const accounts = await businessAPI.getAccounts()
      console.log('Accounts:', accounts)

      if (accounts.length === 0) {
        setError('No Google Business accounts found. Make sure you have access to Google Business Profile and have business profiles set up.')
        setLoadingLocations(false)
        return
      }

      // Try to get locations for the first account
      let locations: any[] = []
      const accountName = accounts[0].name
      
      try {
        // Try minimal method first (most likely to work)
        locations = await businessAPI.getLocationsMinimal(accountName)
        console.log('Locations (minimal method):', locations)
      } catch (locationError) {
        console.warn('Minimal locations method failed, trying standard...', locationError)
        
        // Try standard method
        try {
          locations = await businessAPI.getLocations(accountName)
          console.log('Locations (standard method):', locations)
        } catch (standardError) {
          console.warn('Standard locations method failed, trying comprehensive...', standardError)
          
          // Try comprehensive method as last resort
          try {
            locations = await businessAPI.getLocationsWithReadMask(accountName)
            console.log('Locations (comprehensive method):', locations)
          } catch (comprehensiveError) {
            console.error('All location methods failed:', comprehensiveError)
            throw new Error(`Failed to fetch locations using all methods: ${comprehensiveError instanceof Error ? comprehensiveError.message : 'Unknown error'}`)
          }
        }
      }

      setGoogleLocations(locations)
      
      if (locations.length === 0) {
        setError('No business locations found in your Google Business Profile account. Make sure you have verified business locations set up.')
      }
    } catch (error) {
      console.error('Error fetching Google Business Profiles:', error)
      
      // Enhanced error handling with more specific messages
      let errorMessage = 'Failed to fetch business profiles'
      
      if (error instanceof Error) {
        errorMessage = error.message
        
        // Check for specific error types and provide guidance
        if (error.message.includes('403')) {
          errorMessage += '\n\n🔧 To fix this:\n1. Go to Google Cloud Console\n2. Enable "My Business Account Management API" and "My Business Business Information API"\n3. Make sure your OAuth consent screen is properly configured\n4. Verify you have admin access to your Google Business Profile'
        } else if (error.message.includes('401')) {
          setError('Your session has expired. Please reconnect your Google account.')
          checkAuthStatus()
          return
        } else if (error.message.includes('404')) {
          errorMessage += '\n\n🔧 To fix this:\n1. Make sure you have Google Business Profile accounts set up\n2. Verify your business locations are claimed and verified\n3. Check that you\'re using the correct Google account'
        }
      }
      
      setError(errorMessage)
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
    fetchGoogleBusinessProfiles()
  }

  const addGoogleProfile = async (location: any) => {
    try {
      setLoadingLocations(true)
      setError(null)
      
      // Check if this profile already exists
      if (BusinessProfilesStorage.profileExistsByGoogleId(location.name)) {
        setError('This business profile has already been added.')
        setLoadingLocations(false)
        return
      }

      console.log('[Profiles] Fetching complete details for location:', location.name)
      
      // Fetch complete location details from Google API
      const businessAPI = new GoogleBusinessAPI()
      let completeLocation = location
      
      try {
        completeLocation = await businessAPI.getLocationDetails(location.name)
        // Enrich the location data with computed fields
        completeLocation = GoogleBusinessAPI.enrichLocationData(completeLocation)
        console.log('[Profiles] Complete location details:', completeLocation)
      } catch (detailsError) {
        console.warn('[Profiles] Failed to fetch complete details, using basic info:', detailsError)
        // Continue with basic location data if detailed fetch fails
      }

      // Handle both old and new location data structures
      const locationName = completeLocation.title || completeLocation.displayName || completeLocation.locationName || 'Unknown Business'
      const formattedAddress = GoogleBusinessAPI.getFormattedAddress(completeLocation)
      const allCategories = GoogleBusinessAPI.getAllCategories(completeLocation)
      const businessHours = GoogleBusinessAPI.formatBusinessHours(completeLocation)
      const capabilities = GoogleBusinessAPI.getBusinessCapabilities(completeLocation)
      
      const profileId = Date.now().toString()
      
      // Create the business profile with complete information
      const newProfile: BusinessProfile = {
        id: profileId,
        name: locationName,
        address: formattedAddress,
        phone: GoogleBusinessAPI.getPrimaryPhone(completeLocation),
        website: completeLocation.websiteUri || '',
        category: allCategories[0] || 'Business',
        rating: completeLocation.rating || 0,
        reviewCount: completeLocation.reviewCount || 0,
        status: completeLocation.isVerified ? 'active' : 'pending',
        lastUpdated: new Date().toISOString().split('T')[0],
        googleBusinessId: completeLocation.name || location.name || `temp_${profileId}`
      }

      // Create the saved profile with complete Google data
      const savedProfile: SavedBusinessProfile = {
        ...newProfile,
        googleBusinessId: completeLocation.name || location.name || `temp_${profileId}`,
        googleData: {
          title: completeLocation.title,
          storefrontAddress: completeLocation.storefrontAddress,
          primaryCategory: completeLocation.primaryCategory,
          additionalCategories: completeLocation.additionalCategories,
          regularHours: completeLocation.regularHours,
          moreHours: completeLocation.moreHours,
          metadata: completeLocation.metadata,
          latlng: completeLocation.latlng,
          locationState: completeLocation.locationState,
          attributes: completeLocation.attributes,
          profile: completeLocation.profile,
          relationshipData: completeLocation.relationshipData,
          serviceItems: completeLocation.serviceItems,
          openInfo: completeLocation.openInfo,
          serviceArea: completeLocation.serviceArea,
          labels: completeLocation.labels,
          adWordsLocationExtensions: completeLocation.adWordsLocationExtensions,
          // Computed fields
          businessHours: businessHours,
          allCategories: allCategories,
          capabilities: capabilities,
          isOpen: completeLocation.isOpen,
          businessType: completeLocation.businessType
        },
        isVerified: completeLocation.isVerified || false,
        totalReviews: completeLocation.reviewCount || 0,
        lastSynced: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      // Save to local storage
      BusinessProfilesStorage.saveProfile(savedProfile)
      
      // Update the UI
      setProfiles(prev => [...prev, newProfile])
      setShowAddForm(false)
      setGoogleLocations([])
      
      console.log('[Profiles] Successfully added and saved profile:', locationName)
      
      // Show success message
      setError(null)
      
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
    checkAuthStatus() // This will reload profiles from storage
  }

  const handleClearAllProfiles = () => {
    if (confirm('Are you sure you want to clear all saved business profiles? This action cannot be undone.')) {
      BusinessProfilesStorage.clearAllProfiles()
      setProfiles([])
      console.log('[Profiles] Cleared all profiles')
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Profiles</h1>
          <p className="text-muted-foreground">
            Manage your Google Business Profile locations and settings.
          </p>
        </div>
        <Button onClick={handleAddProfile} disabled={!isConnected}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Profile
        </Button>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            Google Business Profile Connection
          </CardTitle>
          <CardDescription>
            Connect your Google account to manage business profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Connection Status Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${mounted && isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm font-medium">
                  {mounted ? (isConnected ? 'Connected' : 'Not Connected') : 'Checking...'}
                </span>
                {isTokenExpiringSoon() && (
                  <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Token Expiring Soon
                  </Badge>
                )}
              </div>
              <div className="flex space-x-2">
                {mounted && !isConnected && (
                  <Button variant="outline" onClick={handleConnectGoogle}>
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
                    >
                      {refreshingToken ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-2 h-4 w-4" />
                      )}
                      Refresh Token
                    </Button>
                    <Button variant="outline" onClick={handleDisconnect}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Disconnect
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* User Info (when connected) */}
            {mounted && isConnected && userInfo && (
              <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{userInfo.name}</span>
                  <span className="text-sm text-muted-foreground">({userInfo.email})</span>
                </div>
              </div>
            )}

            {/* Session Info (when connected) */}
            {mounted && isConnected && sessionInfo && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Connected: {formatDate(sessionInfo.created_at)}</div>
                <div>Last Refreshed: {formatDate(sessionInfo.last_refreshed)}</div>
                <div>Token Expires: {formatDate(sessionInfo.expires_at)}</div>
              </div>
            )}

            {/* Status Description */}
            <p className="text-xs text-muted-foreground">
              {mounted && isConnected 
                ? 'Your Google account is connected and ready to manage business profiles.'
                : 'You need to connect your Google account to sync business profiles and manage posts.'
              }
            </p>
          </div>
        </CardContent>
      </Card>

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {profiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {/* Business Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {profile.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">{profile.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {profile.category}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(profile.status)}>
                      {profile.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-muted-foreground">{profile.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{profile.phone}</span>
                    </div>
                    {profile.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{profile.rating}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {profile.reviewCount} reviews
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last updated: {profile.lastUpdated}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full w-10 h-10 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (profile.googleBusinessId && profile.googleBusinessId.includes('accounts/')) {
                          // Open Google Business Profile in new tab
                          const businessUrl = `https://business.google.com/dashboard/l/${profile.googleBusinessId.split('/').pop()}`
                          window.open(businessUrl, '_blank')
                        } else if (profile.website) {
                          // Fallback to business website
                          window.open(profile.website, '_blank')
                        }
                      }}
                      title="View on Google Business"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full w-10 h-10 p-0 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteProfile(profile.id)
                      }}
                      title="Delete Profile"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {profiles.length === 0 && isConnected && (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Business Profiles</h3>
            <p className="text-muted-foreground mb-4">
              Connect your Google Business Profile to start managing your locations.
            </p>
            <Button onClick={handleAddProfile}>
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
                <span className="ml-2">Loading your business profiles...</span>
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
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {(location.title || location.displayName || location.locationName || 'B').charAt(0).toUpperCase()}
                          </div>
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
                              {GoogleBusinessAPI.getPrimaryPhone(location) !== 'Phone not available' && (
                                <div className="flex items-center space-x-2 mb-2">
                                  <Phone className="h-4 w-4 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    {GoogleBusinessAPI.getPrimaryPhone(location)}
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
                                <span>{location.reviewCount || 0} reviews</span>
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
    </div>
  )
} 