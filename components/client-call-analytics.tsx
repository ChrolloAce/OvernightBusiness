'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PhoneCall, 
  TrendingUp, 
  Clock, 
  Users, 
  Play,
  Download,
  Calendar,
  BarChart3,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface CallRecord {
  clientId: string
  twilioCallSid: string
  fromNumber: string
  toNumber: string
  forwardedToNumber: string
  status: string
  direction: 'inbound' | 'outbound'
  startTime: string
  duration?: number
  recordingUrl?: string
}

interface CallAnalytics {
  totalCalls: number
  totalDuration: number
  averageDuration: number
  missedCalls: number
  answeredCalls: number
  callsByDay: Array<{ date: string; calls: number; duration: number }>
  topCallers: Array<{ number: string; calls: number }>
  peakHours: Array<{ hour: number; calls: number }>
}

interface ClientCallAnalyticsProps {
  clientId: string
  clientName: string
  trackingNumber?: string
}

export function ClientCallAnalytics({ clientId, clientName, trackingNumber }: ClientCallAnalyticsProps) {
  const [callRecords, setCallRecords] = useState<CallRecord[]>([])
  const [analytics, setAnalytics] = useState<CallAnalytics | null>(null)
  const [timeRange, setTimeRange] = useState('30')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCallData()
  }, [clientId, timeRange])

  const loadCallData = () => {
    setLoading(true)
    try {
      // Load call records for this client
      const savedCalls = localStorage.getItem(`client_calls_${clientId}`)
      const calls: CallRecord[] = savedCalls ? JSON.parse(savedCalls) : []
      
      // Filter by time range
      const daysAgo = parseInt(timeRange)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo)
      
      const filteredCalls = calls.filter(call => 
        new Date(call.startTime) >= cutoffDate
      )
      
      setCallRecords(filteredCalls)
      setAnalytics(calculateAnalytics(filteredCalls))
      
      console.log(`[ClientCallAnalytics] Loaded ${filteredCalls.length} calls for ${clientName}`)
    } catch (error) {
      console.error('[ClientCallAnalytics] Error loading call data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (calls: CallRecord[]): CallAnalytics => {
    const totalCalls = calls.length
    const answeredCalls = calls.filter(call => call.status === 'completed').length
    const missedCalls = totalCalls - answeredCalls
    const totalDuration = calls.reduce((sum, call) => sum + (call.duration || 0), 0)
    const averageDuration = totalCalls > 0 ? totalDuration / totalCalls : 0

    // Group calls by day
    const callsByDay = new Map<string, { calls: number; duration: number }>()
    const topCallersMap = new Map<string, number>()
    const hourlyCallsMap = new Map<number, number>()

    calls.forEach(call => {
      const date = new Date(call.startTime).toISOString().split('T')[0]
      const hour = new Date(call.startTime).getHours()
      
      // Daily stats
      if (!callsByDay.has(date)) {
        callsByDay.set(date, { calls: 0, duration: 0 })
      }
      const dayData = callsByDay.get(date)!
      dayData.calls += 1
      dayData.duration += call.duration || 0
      
      // Top callers
      topCallersMap.set(call.fromNumber, (topCallersMap.get(call.fromNumber) || 0) + 1)
      
      // Peak hours
      hourlyCallsMap.set(hour, (hourlyCallsMap.get(hour) || 0) + 1)
    })

    return {
      totalCalls,
      totalDuration,
      averageDuration,
      missedCalls,
      answeredCalls,
      callsByDay: Array.from(callsByDay.entries()).map(([date, data]) => ({
        date,
        calls: data.calls,
        duration: data.duration
      })).sort((a, b) => a.date.localeCompare(b.date)),
      topCallers: Array.from(topCallersMap.entries())
        .map(([number, calls]) => ({ number, calls }))
        .sort((a, b) => b.calls - a.calls)
        .slice(0, 5),
      peakHours: Array.from(hourlyCallsMap.entries())
        .map(([hour, calls]) => ({ hour, calls }))
        .sort((a, b) => b.calls - a.calls)
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatPhoneNumber = (number: string) => {
    if (number.startsWith('+1')) {
      const digits = number.slice(2)
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
    }
    return number
  }

  if (!trackingNumber) {
    return (
      <div className="space-y-6">
        <Card className="bg-white shadow-sm border-gray-200">
          <CardContent className="p-12 text-center">
            <PhoneCall className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tracking Number Assigned</h3>
            <p className="text-gray-600 mb-4">
              Assign a Twilio tracking number to this client to view call analytics
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Assign Tracking Number
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Call Analytics</h2>
          <p className="text-gray-600">Call tracking for {formatPhoneNumber(trackingNumber)}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadCallData}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Calls</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalCalls || 0}
                </p>
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
                <p className="text-sm font-medium text-green-600">Answered Calls</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.answeredCalls || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Total Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(analytics?.totalDuration || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">Avg Duration</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDuration(analytics?.averageDuration || 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Calls Trend */}
        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
              Calls Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics?.callsByDay || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="calls" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Callers */}
        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Users className="mr-2 h-5 w-5 text-green-600" />
              Top Callers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.topCallers.length ? analytics.topCallers.map((caller, index) => (
                <div key={caller.number} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formatPhoneNumber(caller.number)}</p>
                      <p className="text-xs text-gray-500">{caller.calls} calls</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {caller.calls} calls
                  </Badge>
                </div>
              )) : (
                <p className="text-center text-gray-500 py-8">No call data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Calls & Recordings */}
      <Card className="bg-white shadow-sm border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <PhoneCall className="mr-2 h-5 w-5 text-purple-600" />
            Recent Calls & Recordings
          </CardTitle>
        </CardHeader>
        <CardContent>
          {callRecords.length === 0 ? (
            <div className="text-center py-12">
              <PhoneCall className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No calls yet</h3>
              <p className="text-gray-600">
                Calls to {trackingNumber ? formatPhoneNumber(trackingNumber) : 'this tracking number'} will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {callRecords.slice(0, 10).map((call, index) => (
                <motion.div
                  key={call.twilioCallSid}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <PhoneCall className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {formatPhoneNumber(call.fromNumber)}
                        </p>
                        <Badge 
                          className={call.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                          variant="outline"
                        >
                          {call.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{new Date(call.startTime).toLocaleString()}</span>
                        {call.duration && (
                          <span>Duration: {formatDuration(call.duration)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {call.recordingUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(call.recordingUrl, '_blank')}
                        className="text-purple-600 hover:text-purple-700"
                      >
                        <Play className="mr-1 h-4 w-4" />
                        Listen
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:text-gray-700"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
              
              {callRecords.length > 10 && (
                <div className="text-center pt-4">
                  <Button variant="outline" size="sm">
                    View All Calls ({callRecords.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
