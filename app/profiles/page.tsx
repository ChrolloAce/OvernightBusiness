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
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GoogleAuthService } from '@/lib/google-auth'
import { GoogleBusinessAPI } from '@/lib/google-business-api'

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
  locationName: string
  primaryPhone?: string
  websiteUri?: string
  address?: {
    addressLines: string[]
    locality: string
    administrativeArea: string
    postalCode: string
    regionCode: string
  }
  primaryCategory?: {
    displayName: string
  }
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<BusinessProfile[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [googleLocations, setGoogleLocations] = useState<GoogleBusinessLocation[]>([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check connection status after component mounts
  useEffect(() => {
    setMounted(true)
    const authService = GoogleAuthService.getInstance()
    const connected = authService.isAuthenticated()
    setIsConnected(connected)
    
    // Only show template data if not connected
    if (!connected) {
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
  }, [])

  const handleConnectGoogle = () => {
    const authService = GoogleAuthService.getInstance()
    const authUrl = authService.getAuthUrl()
    window.location.href = authUrl
  }

  const handleDisconnect = () => {
    const authService = GoogleAuthService.getInstance()
    authService.logout()
    setIsConnected(false)
    setProfiles([])
    setGoogleLocations([])
    setError(null)
    // Reload the page to reset everything
    window.location.reload()
  }

  const fetchGoogleBusinessProfiles = async () => {
    if (!isConnected) return

    setLoadingLocations(true)
    setError(null)

    try {
      const businessAPI = new GoogleBusinessAPI()
      
      // First, get all accounts
      const accounts = await businessAPI.getAccounts()
      console.log('Accounts:', accounts)

      if (accounts.length === 0) {
        setError('No Google Business accounts found. Make sure you have access to Google Business Profile.')
        setLoadingLocations(false)
        return
      }

      // Get locations for the first account (you can modify this to handle multiple accounts)
      const accountName = accounts[0].name
      const locations = await businessAPI.getLocations(accountName)
      console.log('Locations:', locations)

      setGoogleLocations(locations)
      
      if (locations.length === 0) {
        setError('No business locations found in your Google Business Profile account.')
      }
    } catch (error) {
      console.error('Error fetching Google Business Profiles:', error)
      setError(`Failed to fetch business profiles: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

  const addGoogleProfile = (location: GoogleBusinessLocation) => {
    const newProfile: BusinessProfile = {
      id: Date.now().toString(),
      name: location.locationName || 'Unknown Business',
      address: location.address 
        ? `${location.address.addressLines.join(', ')}, ${location.address.locality}, ${location.address.administrativeArea} ${location.address.postalCode}`
        : 'Address not available',
      phone: location.primaryPhone || 'Phone not available',
      website: location.websiteUri || '',
      category: location.primaryCategory?.displayName || 'Business',
      rating: 0, // Would need to fetch from reviews API
      reviewCount: 0, // Would need to fetch from reviews API
      status: 'active',
      lastUpdated: new Date().toISOString().split('T')[0],
      googleBusinessId: location.name
    }

    setProfiles(prev => [...prev, newProfile])
    setShowAddForm(false)
    setGoogleLocations([])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${mounted && isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                {mounted ? (isConnected ? 'Connected' : 'Not Connected') : 'Checking...'}
              </span>
            </div>
            <div className="flex space-x-2">
              {mounted && !isConnected && (
                <Button variant="outline" onClick={handleConnectGoogle}>
                  Connect Google Account
                </Button>
              )}
              {mounted && isConnected && (
                <Button variant="outline" onClick={handleDisconnect}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {mounted && isConnected 
              ? 'Your Google account is connected and ready to manage business profiles.'
              : 'You need to connect your Google account to sync business profiles and manage posts.'
            }
          </p>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
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
                    <div>
                      <CardTitle className="text-lg">{profile.name}</CardTitle>
                      <CardDescription>{profile.category}</CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(profile.status)}`}>
                      {profile.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span className="truncate">{profile.address}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="mr-2 h-4 w-4" />
                      <span>{profile.phone}</span>
                    </div>
                    {profile.website && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Globe className="mr-2 h-4 w-4" />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                           className="text-primary hover:underline truncate">
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm font-medium">{profile.rating}</span>
                      <span className="ml-1 text-sm text-muted-foreground">
                        ({profile.reviewCount} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Last updated: {new Date(profile.lastUpdated).toLocaleDateString()}
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="mr-2 h-3 w-3" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Trash2 className="h-3 w-3" />
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
                  <Card key={index} className="cursor-pointer hover:bg-accent" onClick={() => addGoogleProfile(location)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{location.locationName || 'Unknown Business'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {location.address 
                              ? `${location.address.addressLines.join(', ')}, ${location.address.locality}`
                              : 'Address not available'
                            }
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {location.primaryCategory?.displayName || 'Business'}
                          </p>
                        </div>
                        <Button size="sm">
                          Add Profile
                        </Button>
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

            <div className="flex justify-end mt-6">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 