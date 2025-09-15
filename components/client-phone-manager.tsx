'use client'

import { useState, useEffect } from 'react'
import { 
  Phone, 
  Plus, 
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  Play,
  Download,
  Clock,
  Calendar,
  BarChart3,
  Settings,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ClientPhoneManagerProps {
  clientId: string
  clientName: string
}

// Mock data for demonstration
const mockCallRecords = [
  {
    id: 'call-1',
    fromNumber: '+1234567890',
    toNumber: '+1987654321',
    status: 'completed',
    direction: 'inbound',
    duration: 180,
    startTime: '2024-01-24T10:30:00Z',
    recordingUrl: 'https://example.com/recording1.mp3',
    hasRecording: true
  },
  {
    id: 'call-2',
    fromNumber: '+1555666777',
    toNumber: '+1987654321',
    status: 'completed',
    direction: 'inbound',
    duration: 245,
    startTime: '2024-01-24T14:15:00Z',
    recordingUrl: 'https://example.com/recording2.mp3',
    hasRecording: true
  },
  {
    id: 'call-3',
    fromNumber: '+1987654321',
    toNumber: '+1444555666',
    status: 'no-answer',
    direction: 'outbound',
    duration: 0,
    startTime: '2024-01-23T16:45:00Z',
    hasRecording: false
  }
]

export function ClientPhoneManager({ clientId, clientName }: ClientPhoneManagerProps) {
  const [mounted, setMounted] = useState(false)
  const [assignedNumber, setAssignedNumber] = useState<string | null>(null)
  const [forwardingNumber, setForwardingNumber] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)
  const [callRecords, setCallRecords] = useState(mockCallRecords)
  const [showAssignForm, setShowAssignForm] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadPhoneNumberData()
  }, [clientId])

  const loadPhoneNumberData = async () => {
    try {
      // In a real implementation, load from TwilioService
      // For now, use localStorage or mock data
      const savedNumber = localStorage.getItem(`client_phone_${clientId}`)
      if (savedNumber) {
        setAssignedNumber(JSON.parse(savedNumber).twilioNumber)
        setForwardingNumber(JSON.parse(savedNumber).clientNumber)
      }
    } catch (error) {
      console.error('Failed to load phone number data:', error)
    }
  }

  const handleAssignNumber = async () => {
    if (!forwardingNumber.trim()) return
    
    setIsAssigning(true)
    
    try {
      // In a real implementation, this would:
      // 1. Purchase a new Twilio number or use an existing one
      // 2. Configure forwarding to the client's number
      // 3. Update the database
      
      // For demo, simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const phoneData = {
        twilioNumber: '+1800555DEMO',
        clientNumber: forwardingNumber,
        clientId
      }
      
      localStorage.setItem(`client_phone_${clientId}`, JSON.stringify(phoneData))
      setAssignedNumber(phoneData.twilioNumber)
      setShowAssignForm(false)
      
      console.log('Phone number assigned successfully')
    } catch (error) {
      console.error('Failed to assign phone number:', error)
    } finally {
      setIsAssigning(false)
    }
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getCallStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ringing': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'no-answer': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'busy': return 'bg-red-100 text-red-800 border-red-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!mounted) {
    return <div className="animate-pulse bg-gray-200 h-64 rounded-lg" />
  }

  return (
    <div className="space-y-6">
      {/* Phone Number Configuration */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Phone className="mr-2 h-5 w-5 text-blue-600" />
            Phone Number Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {assignedNumber ? (
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Twilio Number: {assignedNumber}</p>
                  <p className="text-sm text-gray-600">Forwards to: {forwardingNumber}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-700">Active & Forwarding</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Configure
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAssignForm(true)}
                >
                  Change
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Phone className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Phone Number Assigned</h3>
              <p className="text-gray-600 mb-4">
                Assign a Twilio phone number to track calls for {clientName}
              </p>
              <Button 
                onClick={() => setShowAssignForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Assign Phone Number
              </Button>
            </div>
          )}

          {/* Assignment Form */}
          {showAssignForm && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="forwardingNumber">Client's Phone Number</Label>
                  <Input
                    id="forwardingNumber"
                    type="tel"
                    value={forwardingNumber}
                    onChange={(e) => setForwardingNumber(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Calls to the Twilio number will be forwarded to this number
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    onClick={handleAssignNumber}
                    disabled={isAssigning || !forwardingNumber.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isAssigning ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <Phone className="mr-2 h-4 w-4" />
                        Assign Number
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowAssignForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call Analytics Summary */}
      {assignedNumber && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <PhoneCall className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Calls</p>
                  <p className="text-2xl font-bold text-gray-900">{callRecords.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Duration</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatDuration(callRecords.reduce((sum, call) => sum + call.duration, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <PhoneIncoming className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Inbound Calls</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {callRecords.filter(call => call.direction === 'inbound').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-50 rounded-lg">
                  <PhoneOutgoing className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Outbound Calls</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {callRecords.filter(call => call.direction === 'outbound').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Calls */}
      {assignedNumber && (
        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
                Recent Calls
              </CardTitle>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Direction</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">From/To</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">Recording</th>
                  </tr>
                </thead>
                <tbody>
                  {callRecords.map((call) => (
                    <tr key={call.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {call.direction === 'inbound' ? (
                            <PhoneIncoming className="h-4 w-4 text-green-600" />
                          ) : (
                            <PhoneOutgoing className="h-4 w-4 text-blue-600" />
                          )}
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {call.direction}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-900">
                            From: {call.fromNumber}
                          </p>
                          <p className="text-sm text-gray-600">
                            To: {call.toNumber}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-900">
                          {call.duration > 0 ? formatDuration(call.duration) : '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getCallStatusColor(call.status)} variant="outline">
                          {call.status.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-gray-600">
                          {new Date(call.startTime).toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {call.hasRecording ? (
                          <div className="flex items-center justify-end space-x-2">
                            <Button variant="ghost" size="sm" title="Play Recording">
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Download Recording">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">No recording</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call Analytics Chart Placeholder */}
      {assignedNumber && callRecords.length > 0 && (
        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-purple-600" />
              Call Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
              <div className="text-center space-y-2">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto" />
                <p className="text-gray-600 font-medium">Call Analytics Chart</p>
                <p className="text-xs text-gray-500">Interactive call analytics coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
