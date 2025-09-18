'use client'

import { useState, useEffect } from 'react'
import { 
  PhoneCall, 
  Settings, 
  Copy, 
  Check, 
  ExternalLink,
  AlertCircle,
  Edit,
  Save,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClients } from '@/contexts/client-context'

// TwilioPhoneNumber interface removed - no longer needed since assignment is handled from Phone Numbers tab

interface ClientPhoneTrackingProps {
  clientId: string
  clientName: string
  clientPhone?: string
  trackingNumber?: string
  trackingPhoneSid?: string
}

export function ClientPhoneTracking({ 
  clientId, 
  clientName, 
  clientPhone, 
  trackingNumber, 
  trackingPhoneSid 
}: ClientPhoneTrackingProps) {
  const [loading, setLoading] = useState(false)
  const [editingPhone, setEditingPhone] = useState(false)
  const [phoneValue, setPhoneValue] = useState(clientPhone || '')
  const [copiedText, setCopiedText] = useState<string | null>(null)
  
  const { updateClient } = useClients()

  // useEffect and loadAvailableNumbers removed - no longer needed since assignment is handled from Phone Numbers tab

  // Assignment functionality removed - now handled from Phone Numbers tab

  const handleSaveClientPhone = () => {
    updateClient(clientId, { phone: phoneValue })
    setEditingPhone(false)
  }

  const handleCancelPhoneEdit = () => {
    setPhoneValue(clientPhone || '')
    setEditingPhone(false)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatPhoneNumber = (number: string) => {
    if (number.startsWith('+1')) {
      const digits = number.slice(2)
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    return number
  }

  return (
    <div className="space-y-6">
      {/* Client Phone Configuration */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <PhoneCall className="mr-2 h-5 w-5 text-blue-600" />
            Phone Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Client's Real Phone Number */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Client's Phone Number</label>
                <p className="text-xs text-gray-500">Where calls will be forwarded to</p>
              </div>
              <div className="flex items-center space-x-2">
                {editingPhone ? (
                  <>
                    <Input
                      value={phoneValue}
                      onChange={(e) => setPhoneValue(e.target.value)}
                      placeholder="+1234567890"
                      className="w-40 h-8 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveClientPhone}
                      className="h-8 w-8 p-0 text-green-600"
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelPhoneEdit}
                      className="h-8 w-8 p-0 text-gray-600"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </>
                ) : (
                  <>
                    <span className="text-sm font-mono text-gray-900">
                      {clientPhone ? formatPhoneNumber(clientPhone) : 'Not set'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingPhone(true)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Tracking Number Display Only */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Tracking Number</label>
                <p className="text-xs text-gray-500">Assigned from Phone Numbers tab</p>
              </div>
              <div className="flex items-center space-x-2">
                {trackingNumber ? (
                  <>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {formatPhoneNumber(trackingNumber)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(trackingNumber)}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-blue-600"
                      title="Copy tracking number"
                    >
                      {copiedText === trackingNumber ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="text-right">
                    <Badge variant="outline" className="bg-gray-50 text-gray-600">
                      No tracking number
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      Assign from Phone Numbers tab
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      {trackingNumber && (
        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Settings className="mr-2 h-5 w-5 text-purple-600" />
              Tracking Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-blue-900">Custom Webhook Endpoint</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      This client's tracking number uses a dedicated webhook for call analytics:
                    </p>
                    <div className="mt-2 flex items-center space-x-2">
                      <code className="bg-white px-2 py-1 rounded border text-xs font-mono flex-1">
                        https://overnight-business.vercel.app/api/twilio/client-webhook/{clientId}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`https://overnight-business.vercel.app/api/twilio/client-webhook/${clientId}`)}
                        className="h-6 w-6 p-0 text-blue-600"
                      >
                        {copiedText === `https://overnight-business.vercel.app/api/twilio/client-webhook/${clientId}` ? (
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
                  <label className="text-sm font-medium text-gray-700">Call Flow</label>
                  <div className="mt-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <span>Caller →</span>
                      <Badge variant="outline" className="text-xs">{formatPhoneNumber(trackingNumber)}</Badge>
                      <span>→</span>
                      <Badge variant="outline" className="text-xs">
                        {clientPhone ? formatPhoneNumber(clientPhone) : 'Client Phone'}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Features</label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs">Call Recording</Badge>
                    <Badge variant="secondary" className="text-xs">Analytics</Badge>
                    <Badge variant="secondary" className="text-xs">Caller ID</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
