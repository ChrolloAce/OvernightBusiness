'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PhoneCall, 
  Plus, 
  Search, 
  Filter,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  BarChart3,
  Download,
  Play,
  Users,
  TrendingUp,
  Calendar,
  Phone,
  Volume2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Mock call analytics data
const mockCallAnalytics = {
  totalCalls: 156,
  totalDuration: 8940, // seconds
  averageDuration: 57,
  inboundCalls: 124,
  outboundCalls: 32,
  completedCalls: 142,
  missedCalls: 14
}

const mockCallsByClient = [
  { client: 'BMW Company', calls: 45, duration: 2700, avatar: 'BC' },
  { client: 'Samsung Company', calls: 38, duration: 2280, avatar: 'SC' },
  { client: 'Fed Ex Company', calls: 32, duration: 1920, avatar: 'FE' },
  { client: 'Tinder Company', calls: 28, duration: 1680, avatar: 'TC' },
  { client: 'Tesla Inc', calls: 13, duration: 780, avatar: 'TI' }
]

const mockRecentCalls = [
  {
    id: 'call-1',
    clientName: 'BMW Company',
    clientAvatar: 'BC',
    fromNumber: '+1234567890',
    toNumber: '+1800555BMW1',
    direction: 'inbound',
    status: 'completed',
    duration: 180,
    startTime: '2024-01-24T10:30:00Z',
    hasRecording: true
  },
  {
    id: 'call-2',
    clientName: 'Samsung Company', 
    clientAvatar: 'SC',
    fromNumber: '+1555666777',
    toNumber: '+1800555SAMSUNG',
    direction: 'inbound',
    status: 'completed',
    duration: 245,
    startTime: '2024-01-24T14:15:00Z',
    hasRecording: true
  },
  {
    id: 'call-3',
    clientName: 'Fed Ex Company',
    clientAvatar: 'FE',
    fromNumber: '+1800555FEDEX',
    toNumber: '+1444555666',
    direction: 'outbound',
    status: 'no-answer',
    duration: 0,
    startTime: '2024-01-23T16:45:00Z',
    hasRecording: false
  }
]

export default function CallsPage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [clientFilter, setClientFilter] = useState('all')
  const [directionFilter, setDirectionFilter] = useState('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${remainingSeconds}s`
    }
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

  const filteredCalls = mockRecentCalls.filter(call => {
    const matchesSearch = call.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         call.fromNumber.includes(searchQuery) ||
                         call.toNumber.includes(searchQuery)
    
    const matchesClient = clientFilter === 'all' || call.clientName === clientFilter
    const matchesDirection = directionFilter === 'all' || call.direction === directionFilter
    
    return matchesSearch && matchesClient && matchesDirection
  })

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 lg:p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <PhoneCall className="mr-3 h-8 w-8 text-blue-600" />
                Call Analytics
              </h1>
              <p className="text-gray-600 mt-1">Track phone calls and recordings across all clients</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Purchase Number
              </Button>
            </div>
          </div>

          {/* Call Analytics Summary */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white shadow-sm border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <PhoneCall className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Calls</p>
                    <p className="text-2xl font-bold text-gray-900">{mockCallAnalytics.totalCalls}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{formatDuration(mockCallAnalytics.totalDuration)}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{mockCallAnalytics.inboundCalls}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                    <p className="text-2xl font-bold text-gray-900">{formatDuration(mockCallAnalytics.averageDuration)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search calls..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="BMW Company">BMW Company</SelectItem>
                    <SelectItem value="Samsung Company">Samsung Company</SelectItem>
                    <SelectItem value="Fed Ex Company">Fed Ex Company</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={directionFilter} onValueChange={setDirectionFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Direction" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Calls</SelectItem>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Calls by Client */}
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Users className="mr-2 h-5 w-5 text-purple-600" />
                Calls by Client
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockCallsByClient.map((client, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                        {client.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{client.client}</p>
                        <p className="text-sm text-gray-600">{client.calls} calls • {formatDuration(client.duration)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{client.calls}</p>
                      <p className="text-xs text-gray-500">calls</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Calls */}
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
                  Recent Calls
                </CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {filteredCalls.length} calls
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Direction</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Numbers</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Duration</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Recording</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCalls.map((call, index) => (
                      <motion.tr
                        key={call.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {call.clientAvatar}
                            </div>
                            <span className="font-medium text-gray-900">{call.clientName}</span>
                          </div>
                        </td>
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
                            <p className="text-sm text-gray-900">From: {call.fromNumber}</p>
                            <p className="text-sm text-gray-600">To: {call.toNumber}</p>
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
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Call Analytics Chart Placeholder */}
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-blue-600" />
                Call Volume Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                <div className="text-center space-y-2">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-gray-600 font-medium">Call Analytics Chart</p>
                  <p className="text-xs text-gray-500">Interactive call volume charts coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
