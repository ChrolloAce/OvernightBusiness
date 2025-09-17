'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  Plus, 
  Check, 
  AlertCircle,
  ExternalLink,
  Zap,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useClients } from '@/contexts/client-context'
import { useProfile } from '@/contexts/profile-context'
import { Client } from '@/lib/managers/client-manager'
import { SavedBusinessProfile } from '@/lib/business-profiles-storage'

interface GoogleProfileConnectorProps {
  client: Client
  onProfileConnected?: (profileId: string) => void
}

export function GoogleProfileConnector({ client, onProfileConnected }: GoogleProfileConnectorProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedProfileId, setSelectedProfileId] = useState('')
  const [autoAssignData, setAutoAssignData] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const { connectGoogleBusinessProfile } = useClients()
  const { profiles } = useProfile()

  // For now, show all profiles (we can add client connection tracking later)
  const availableProfiles = profiles

  const handleConnect = async () => {
    if (!selectedProfileId) return

    setIsConnecting(true)
    try {
      const success = connectGoogleBusinessProfile(client.id, selectedProfileId, autoAssignData)
      
      if (success) {
        setShowSuccess(true)
        onProfileConnected?.(selectedProfileId)
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false)
          setSelectedProfileId('')
        }, 3000)
      } else {
        alert('Failed to connect Google Business Profile. Please try again.')
      }
    } catch (error) {
      console.error('Error connecting Google Business Profile:', error)
      alert('Error connecting Google Business Profile. Check console for details.')
    } finally {
      setIsConnecting(false)
    }
  }

  const connectedProfile = client.googleBusinessProfile

  if (connectedProfile) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center text-green-800">
            <Check className="mr-2 h-5 w-5" />
            Google Business Profile Connected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">{connectedProfile.name}</p>
                <p className="text-sm text-green-700">{connectedProfile.category}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {connectedProfile.rating}★ ({connectedProfile.reviewCount} reviews)
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.setItem('selected_profile_id', connectedProfile.id)
                  window.location.href = '/content'
                }}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                <ExternalLink className="mr-1 h-3 w-3" />
                View Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 rounded-lg border p-6"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-green-900">Google Business Profile Connected!</h4>
            <p className="text-sm text-green-700">
              {autoAssignData ? 'Client data has been automatically updated with business information.' : 'Profile connected successfully.'}
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center text-gray-700">
          <Plus className="mr-2 h-5 w-5" />
          Connect Google Business Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {availableProfiles.length === 0 ? (
          <div className="text-center py-6">
            <AlertCircle className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-gray-600">No available Google Business Profiles found.</p>
            <p className="text-sm text-gray-500 mt-1">
              Add profiles in the Content Hub first.
            </p>
          </div>
        ) : (
          <>
            <div>
              <Label htmlFor="profile-select" className="text-sm font-medium text-gray-700">
                Select Google Business Profile
              </Label>
              <Select value={selectedProfileId} onValueChange={setSelectedProfileId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a business profile..." />
                </SelectTrigger>
                <SelectContent>
                  {availableProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      <div className="flex items-center space-x-2">
                        <Building2 className="h-4 w-4" />
                        <span>{profile.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {profile.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex items-center space-x-2 flex-1">
                  <Switch
                    id="auto-assign"
                    checked={autoAssignData}
                    onCheckedChange={setAutoAssignData}
                  />
                  <div className="flex-1">
                    <Label htmlFor="auto-assign" className="text-sm font-medium text-blue-900">
                      Auto-assign business data
                    </Label>
                    <p className="text-xs text-blue-700 mt-1">
                      Automatically update client phone, website, address, and business categories
                    </p>
                  </div>
                </div>
                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              </div>
              
              {autoAssignData && (
                <div className="mt-3 text-xs text-blue-800 bg-blue-100 rounded px-3 py-2">
                  <p className="font-medium mb-1">Will auto-assign:</p>
                  <ul className="space-y-1">
                    <li>• Phone number (if client doesn't have one)</li>
                    <li>• Website URL (if client doesn't have one)</li>
                    <li>• Business address (added to notes)</li>
                    <li>• Business categories (added as tags)</li>
                    <li>• Business hours (added to notes)</li>
                    <li className="text-blue-600">• Email will NOT be changed</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Zap className="h-4 w-4" />
                <span>Instant sync with Google data</span>
              </div>
              <Button
                onClick={handleConnect}
                disabled={!selectedProfileId || isConnecting}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Plus className="h-4 w-4" />
                    </motion.div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Connect Profile
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
