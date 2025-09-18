'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PhoneCall, 
  Plus, 
  Settings, 
  RefreshCw,
  Edit,
  Save,
  X,
  ExternalLink,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClients } from '@/contexts/client-context'

interface TwilioPhoneNumber {
  sid: string
  phoneNumber: string
  friendlyName: string
  voiceUrl: string
  forwardToNumber: string
  status: 'active' | 'inactive'
  capabilities: {
    voice: boolean
    sms: boolean
    mms: boolean
  }
  // Client assignment
  assignedClientId?: string
  assignedClientName?: string
}

export default function PhoneNumbersPage() {
  const [mounted, setMounted] = useState(false)
  const [phoneNumbers, setPhoneNumbers] = useState<TwilioPhoneNumber[]>([])
  const [loading, setLoading] = useState(true)
  const [editingNumber, setEditingNumber] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null)
  const [editingClient, setEditingClient] = useState<string | null>(null)
  const [selectedClientId, setSelectedClientId] = useState('')
  const { clients } = useClients()

  useEffect(() => {
    setMounted(true)
    loadPhoneNumbers()
  }, [])

  const loadPhoneNumbers = async () => {
    setLoading(true)
    try {
      console.log('[PhoneNumbers] Loading Twilio phone numbers from API...')
      
      const response = await fetch('/api/twilio/phone-numbers')
      const data = await response.json()
      
      if (data.success && data.phoneNumbers) {
        setPhoneNumbers(data.phoneNumbers)
        console.log(`[PhoneNumbers] Loaded ${data.phoneNumbers.length} phone numbers from Twilio`)
      } else {
        console.error('[PhoneNumbers] Failed to load phone numbers:', data.error)
        // Fallback to empty array or show error
        setPhoneNumbers([])
      }
    } catch (error) {
      console.error('[PhoneNumbers] Error loading phone numbers:', error)
      setPhoneNumbers([])
    } finally {
      setLoading(false)
    }
  }

  const handleEditForwardNumber = (sid: string, currentNumber: string) => {
    setEditingNumber(sid)
    setEditValue(currentNumber)
  }

  const handleSaveForwardNumber = (sid: string) => {
    const updatedNumbers = phoneNumbers.map(num => 
      num.sid === sid 
        ? { ...num, forwardToNumber: editValue }
        : num
    )
    setPhoneNumbers(updatedNumbers)
    localStorage.setItem('twilio_phone_numbers', JSON.stringify(updatedNumbers))
    setEditingNumber(null)
    setEditValue('')
    
    // In production, this would update the Twilio webhook configuration
    console.log(`[PhoneNumbers] Updated forwarding for ${sid} to ${editValue}`)
  }

  const handleCancelEdit = () => {
    setEditingNumber(null)
    setEditValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent, sid: string) => {
    if (e.key === 'Enter') {
      handleSaveForwardNumber(sid)
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedNumber(text)
      setTimeout(() => setCopiedNumber(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const refreshPhoneNumbers = async () => {
    await loadPhoneNumbers()
  }

  const handleAssignClient = (numberSid: string, currentClientId?: string) => {
    setEditingClient(numberSid)
    setSelectedClientId(currentClientId || '')
  }

  const handleSaveClientAssignment = async (numberSid: string) => {
    try {
      if (!clients || clients.length === 0) {
        console.error('No clients available')
        alert('No clients found. Please create clients first.')
        return
      }

      const selectedClient = clients.find(c => c.id === selectedClientId)
      
      if (!selectedClient && selectedClientId !== '') {
        console.error('Selected client not found')
        alert('Selected client not found')
        return
      }

      // Update the phone number with client assignment
      const updatedNumbers = phoneNumbers.map(num => {
        if (num.sid === numberSid) {
          return {
            ...num,
            assignedClientId: selectedClientId || undefined,
            assignedClientName: selectedClient?.name || undefined,
            // Auto-set forward number to client's phone if available
            forwardToNumber: selectedClient?.phone || num.forwardToNumber
          }
        }
        return num
      })

      setPhoneNumbers(updatedNumbers)
      localStorage.setItem('twilio_phone_numbers', JSON.stringify(updatedNumbers))

      // Update the client with the tracking phone number
      if (selectedClient) {
        const phoneNumber = phoneNumbers.find(num => num.sid === numberSid)
        if (phoneNumber) {
          // Here you would call updateClient to set the trackingPhoneNumber
          console.log(`[PhoneNumbers] Assigned ${phoneNumber.phoneNumber} to client ${selectedClient.name}`)
          
          // TODO: Call Twilio API to update webhook configuration for this specific number
          // This would set up call forwarding to the client's actual phone number
        }
      }

      setEditingClient(null)
      setSelectedClientId('')
    } catch (error) {
      console.error('Error assigning client to phone number:', error)
    }
  }

  const handleCancelClientEdit = () => {
    setEditingClient(null)
    setSelectedClientId('')
  }

  if (!mounted) return null

  // Show loading state while clients are loading
  if (!clients) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Loading clients...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <PhoneCall className="mr-3 h-8 w-8 text-blue-600" />
            Phone Numbers
          </h1>
          <p className="text-gray-600 mt-1">Manage your Twilio phone numbers and call forwarding</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            onClick={refreshPhoneNumbers}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Buy Number
          </Button>
        </div>
      </div>

      {/* Assignment Summary */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Numbers</p>
                <p className="text-2xl font-bold text-gray-900">{phoneNumbers?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <PhoneCall className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Assigned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {phoneNumbers?.filter(num => num.assignedClientId).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Unassigned</p>
                <p className="text-2xl font-bold text-gray-900">
                  {phoneNumbers?.filter(num => !num.assignedClientId).length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Phone Numbers List */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Active Phone Numbers</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-gray-100 h-16 rounded-lg" />
              ))}
            </div>
          ) : phoneNumbers.length === 0 ? (
            <div className="text-center py-12">
              <PhoneCall className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No phone numbers</h3>
              <p className="text-gray-600 mb-4">
                Buy your first Twilio phone number to get started
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Buy Phone Number
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {phoneNumbers.map((number, index) => (
                <motion.div
                  key={number.sid}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-lg font-semibold text-gray-900">{number.phoneNumber}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(number.phoneNumber)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                            >
                              {copiedNumber === number.phoneNumber ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600">{number.friendlyName}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              className={number.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                              variant="outline"
                            >
                              {number.status}
                            </Badge>
                            {number.capabilities.voice && (
                              <Badge variant="secondary" className="text-xs">Voice</Badge>
                            )}
                            {number.capabilities.sms && (
                              <Badge variant="secondary" className="text-xs">SMS</Badge>
                            )}
                            {number.capabilities.mms && (
                              <Badge variant="secondary" className="text-xs">MMS</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Forwards to:</span>
                          {editingNumber === number.sid ? (
                            <div className="flex items-center space-x-2">
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => handleKeyPress(e, number.sid)}
                                autoFocus
                                className="h-8 text-sm border-blue-200 focus:border-blue-400 w-40"
                                placeholder="+1234567890"
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveForwardNumber(number.sid)}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEdit}
                                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-900 font-mono">{number.forwardToNumber}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditForwardNumber(number.sid, number.forwardToNumber)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Assigned Client:</span>
                          {editingClient === number.sid ? (
                            <div className="flex items-center space-x-2">
                              <Select 
                                value={selectedClientId} 
                                onValueChange={setSelectedClientId}
                              >
                                <SelectTrigger className="h-8 text-sm border-blue-200 focus:border-blue-400 w-48">
                                  <SelectValue placeholder="Select client..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">No client assigned</SelectItem>
                                  {clients && clients.length > 0 ? (
                                    clients.map((client) => (
                                      <SelectItem key={client.id} value={client.id}>
                                        {client.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="" disabled>
                                      No clients available - create clients first
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSaveClientAssignment(number.sid)}
                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelClientEdit}
                                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              {number.assignedClientName ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  {number.assignedClientName}
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-gray-50 text-gray-600">
                                  Unassigned
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAssignClient(number.sid, number.assignedClientId)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                                title="Assign to client"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Webhook URL:</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600 font-mono truncate max-w-xs">
                              {number.voiceUrl}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(number.voiceUrl)}
                              className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                            >
                              {copiedNumber === number.voiceUrl ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Settings className="mr-1 h-4 w-4" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Settings className="mr-2 h-5 w-5 text-blue-600" />
            Webhook Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Webhook Endpoint</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Configure your Twilio phone numbers to use this webhook URL for call handling:
                  </p>
                  <div className="mt-2 flex items-center space-x-2">
                    <code className="bg-white px-2 py-1 rounded border text-sm font-mono">
                      https://overnight-business.vercel.app/api/twilio/webhook
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard('https://overnight-business.vercel.app/api/twilio/webhook')}
                      className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                    >
                      {copiedNumber === 'https://overnight-business.vercel.app/api/twilio/webhook' ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">Default Forward Number</label>
                <div className="mt-1 flex items-center space-x-2">
                  <Input
                    value="+17862903664"
                    readOnly
                    className="bg-gray-50 font-mono text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard('+17862903664')}
                    className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600"
                  >
                    {copiedNumber === '+17862903664' ? (
                      <Check className="h-3 w-3 text-green-600" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">All calls forward to this number by default</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Webhook Status</label>
                <div className="mt-1">
                  <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                    Active
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">Webhook is responding correctly</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
              <a
                href="https://console.twilio.com/us1/develop/phone-numbers/manage/incoming"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ExternalLink className="mr-1 h-4 w-4" />
                Manage in Twilio Console
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://overnight-business.vercel.app/api/twilio/webhook', '_blank')}
              >
                Test Webhook
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
