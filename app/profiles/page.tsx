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
  ExternalLink
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { GoogleAuthService } from '@/lib/google-auth'

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

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<BusinessProfile[]>([
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

  const [showAddForm, setShowAddForm] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Check connection status after component mounts
  useEffect(() => {
    setMounted(true)
    const authService = GoogleAuthService.getInstance()
    setIsConnected(authService.isAuthenticated())
  }, [])

  const handleConnectGoogle = () => {
    const authService = GoogleAuthService.getInstance()
    const authUrl = authService.getAuthUrl()
    window.location.href = authUrl
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
        <Button onClick={() => setShowAddForm(true)}>
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
            {mounted && !isConnected && (
              <Button variant="outline" onClick={handleConnectGoogle}>
                Connect Google Account
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {mounted && isConnected 
              ? 'Your Google account is connected and ready to manage business profiles.'
              : 'You need to connect your Google account to sync business profiles and manage posts.'
            }
          </p>
        </CardContent>
      </Card>

      {/* Profiles Grid */}
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
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Globe className="mr-2 h-4 w-4" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                       className="text-primary hover:underline truncate">
                      {profile.website}
                    </a>
                  </div>
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

      {/* Add Profile Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h2 className="text-xl font-semibold mb-4">Add New Business Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Business Name</label>
                <input 
                  type="text" 
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  placeholder="Enter business name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <input 
                  type="text" 
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  placeholder="Enter full address"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <input 
                  type="tel" 
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <input 
                  type="url" 
                  className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background"
                  placeholder="Enter website URL"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background">
                  <option>Restaurant</option>
                  <option>Retail</option>
                  <option>Technology</option>
                  <option>Healthcare</option>
                  <option>Professional Services</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button className="flex-1">
                Add Profile
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 