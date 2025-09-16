'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Calendar,
  Download,
  RefreshCw,
  Filter,
  Star,
  MessageSquare,
  MapPin,
  Phone,
  Globe,
  ArrowUp,
  ArrowDown,
  Activity,
  Target,
  MousePointer,
  Navigation,
  Smartphone,
  Monitor,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CentralizedDataLoader } from '@/lib/centralized-data-loader'
import { SavedBusinessProfile } from '@/lib/business-profiles-storage'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface ClientAnalyticsProps {
  clientId: string
  clientName: string
  googleBusinessProfile: SavedBusinessProfile | null
}

interface AnalyticsData {
  impressions: {
    total: number
    desktop_maps: number
    desktop_search: number
    mobile_maps: number
    mobile_search: number
    change: number
    trend: 'up' | 'down' | 'neutral'
  }
  actions: {
    total: number
    calls: number
    directions: number
    website_clicks: number
    change: number
    trend: 'up' | 'down' | 'neutral'
  }
  dailyData: Array<{
    date: string
    impressions: number
    calls: number
    directions: number
    website_clicks: number
  }>
}

export function ClientAnalytics({ clientId, clientName, googleBusinessProfile }: ClientAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('30')
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (googleBusinessProfile && mounted) {
      loadAnalyticsData()
    }
  }, [googleBusinessProfile, timeRange, mounted])

  const loadAnalyticsData = async () => {
    if (!googleBusinessProfile) return

    setAnalyticsLoading(true)
    setError(null)

    try {
      console.log(`[ClientAnalytics] Loading analytics for client: ${clientName}`)
      
      const result = await CentralizedDataLoader.loadAnalytics(googleBusinessProfile, {
        enabledMetrics: {
          'BUSINESS_IMPRESSIONS_DESKTOP_MAPS': true,
          'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH': true,
          'BUSINESS_IMPRESSIONS_MOBILE_MAPS': true,
          'BUSINESS_IMPRESSIONS_MOBILE_SEARCH': true,
          'CALL_CLICKS': true,
          'WEBSITE_CLICKS': true,
          'BUSINESS_DIRECTION_REQUESTS': true
        }
      })

      if (result.success && result.data) {
        console.log(`[ClientAnalytics] Analytics loaded for ${clientName}:`, result.data)
        const processedData = processAnalyticsData(result.data)
        setAnalyticsData(processedData)
      } else {
        console.error(`[ClientAnalytics] Failed to load analytics for ${clientName}:`, result.error)
        setError(result.error || 'Failed to load analytics data')
        // Use mock data as fallback
        setAnalyticsData(getMockAnalyticsData())
      }
    } catch (error) {
      console.error(`[ClientAnalytics] Error loading analytics for ${clientName}:`, error)
      setError(error instanceof Error ? error.message : 'Unknown error')
      setAnalyticsData(getMockAnalyticsData())
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const processAnalyticsData = (rawData: any): AnalyticsData => {
    console.log(`[ClientAnalytics] Processing analytics data for ${clientName}:`, rawData)
    
    // Initialize data structure
    const data: AnalyticsData = {
      impressions: {
        total: 0,
        desktop_maps: 0,
        desktop_search: 0,
        mobile_maps: 0,
        mobile_search: 0,
        change: 0,
        trend: 'neutral'
      },
      actions: {
        total: 0,
        calls: 0,
        directions: 0,
        website_clicks: 0,
        change: 0,
        trend: 'neutral'
      },
      dailyData: []
    }

    // Process the data similar to the main analytics page
    const dailyData = rawData.multiDailyMetricTimeSeries || []
    const dailyDataMap = new Map()

    dailyData.forEach((series: any) => {
      const metricType = series.metric
      const dataPoints = series.timeSeries?.datedValues || series.dailyBreakdowns || []

      dataPoints.forEach((dataPoint: any) => {
        const date = dataPoint.date || dataPoint.day
        let dateKey = ''

        if (date && typeof date === 'object') {
          dateKey = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
        } else if (typeof date === 'string') {
          dateKey = date
        } else {
          return
        }

        if (!dailyDataMap.has(dateKey)) {
          dailyDataMap.set(dateKey, {
            date: dateKey,
            impressions: 0,
            calls: 0,
            directions: 0,
            website_clicks: 0
          })
        }

        const dayData = dailyDataMap.get(dateKey)
        const value = parseInt(dataPoint.value || dataPoint.count || '0')

        switch (metricType) {
          case 'BUSINESS_IMPRESSIONS_DESKTOP_MAPS':
            data.impressions.desktop_maps += value
            dayData.impressions += value
            break
          case 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH':
            data.impressions.desktop_search += value
            dayData.impressions += value
            break
          case 'BUSINESS_IMPRESSIONS_MOBILE_MAPS':
            data.impressions.mobile_maps += value
            dayData.impressions += value
            break
          case 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH':
            data.impressions.mobile_search += value
            dayData.impressions += value
            break
          case 'CALL_CLICKS':
            data.actions.calls += value
            dayData.calls += value
            break
          case 'WEBSITE_CLICKS':
            data.actions.website_clicks += value
            dayData.website_clicks += value
            break
          case 'BUSINESS_DIRECTION_REQUESTS':
            data.actions.directions += value
            dayData.directions += value
            break
        }
      })
    })

    // Calculate totals
    data.impressions.total = data.impressions.desktop_maps + data.impressions.desktop_search + 
                            data.impressions.mobile_maps + data.impressions.mobile_search
    data.actions.total = data.actions.calls + data.actions.directions + data.actions.website_clicks

    // Set trends (mock for now)
    data.impressions.change = Math.floor(Math.random() * 20) - 10
    data.impressions.trend = data.impressions.change > 0 ? 'up' : data.impressions.change < 0 ? 'down' : 'neutral'
    data.actions.change = Math.floor(Math.random() * 15) - 7
    data.actions.trend = data.actions.change > 0 ? 'up' : data.actions.change < 0 ? 'down' : 'neutral'

    // Convert daily data map to array and sort by date
    data.dailyData = Array.from(dailyDataMap.values()).sort((a, b) => a.date.localeCompare(b.date))

    return data
  }

  const getMockAnalyticsData = (): AnalyticsData => {
    return {
      impressions: {
        total: 1250,
        desktop_maps: 320,
        desktop_search: 280,
        mobile_maps: 380,
        mobile_search: 270,
        change: 12.5,
        trend: 'up'
      },
      actions: {
        total: 89,
        calls: 34,
        directions: 28,
        website_clicks: 27,
        change: 8.3,
        trend: 'up'
      },
      dailyData: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        impressions: Math.floor(Math.random() * 50) + 20,
        calls: Math.floor(Math.random() * 5) + 1,
        directions: Math.floor(Math.random() * 4) + 1,
        website_clicks: Math.floor(Math.random() * 6) + 1
      }))
    }
  }

  if (!mounted) {
    return <div className="animate-pulse bg-gray-100 h-96 rounded-lg" />
  }

  if (!googleBusinessProfile) {
    return (
      <div className="space-y-6">
        <Card className="bg-white shadow-sm border-gray-200">
          <CardContent className="p-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Google Business Profile</h3>
            <p className="text-gray-600 mb-4">
              Assign a Google Business Profile to this client to view analytics
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Assign Profile
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
          <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
          <p className="text-gray-600">Performance insights for {googleBusinessProfile.name}</p>
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
            onClick={loadAnalyticsData}
            disabled={analyticsLoading}
          >
            {analyticsLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {analyticsLoading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Impressions */}
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Impressions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData?.impressions.total.toLocaleString() || '0'}
                    </p>
                    <div className="flex items-center mt-1">
                      {analyticsData?.impressions.trend === 'up' ? (
                        <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : analyticsData?.impressions.trend === 'down' ? (
                        <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
                      ) : null}
                      <span className={`text-sm ${
                        analyticsData?.impressions.trend === 'up' ? 'text-green-600' : 
                        analyticsData?.impressions.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {analyticsData?.impressions.change > 0 ? '+' : ''}{analyticsData?.impressions.change}%
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Actions */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Customer Actions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData?.actions.total.toLocaleString() || '0'}
                    </p>
                    <div className="flex items-center mt-1">
                      {analyticsData?.actions.trend === 'up' ? (
                        <ArrowUp className="h-4 w-4 text-green-600 mr-1" />
                      ) : analyticsData?.actions.trend === 'down' ? (
                        <ArrowDown className="h-4 w-4 text-red-600 mr-1" />
                      ) : null}
                      <span className={`text-sm ${
                        analyticsData?.actions.trend === 'up' ? 'text-green-600' : 
                        analyticsData?.actions.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {analyticsData?.actions.change > 0 ? '+' : ''}{analyticsData?.actions.change}%
                      </span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <MousePointer className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Phone Calls */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Phone Calls</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData?.actions.calls.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Direct calls from listing</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Phone className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Website Clicks */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-600">Website Clicks</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analyticsData?.actions.website_clicks.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Clicks to website</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Globe className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Impressions Trend */}
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                  Impressions Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData?.dailyData || []}>
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
                        dataKey="impressions" 
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

            {/* Actions Breakdown */}
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  <Activity className="mr-2 h-5 w-5 text-green-600" />
                  Customer Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData?.dailyData || []}>
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
                      <Bar dataKey="calls" fill="#8b5cf6" name="Calls" />
                      <Bar dataKey="directions" fill="#06b6d4" name="Directions" />
                      <Bar dataKey="website_clicks" fill="#f59e0b" name="Website" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Breakdown */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Impressions Breakdown */}
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Impressions by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Monitor className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">Desktop Maps</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {analyticsData?.impressions.desktop_maps.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Monitor className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">Desktop Search</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {analyticsData?.impressions.desktop_search.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">Mobile Maps</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {analyticsData?.impressions.mobile_maps.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium text-gray-900">Mobile Search</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {analyticsData?.impressions.mobile_search.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions Breakdown */}
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Customer Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">Phone Calls</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {analyticsData?.actions.calls.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Navigation className="h-5 w-5 text-cyan-600" />
                      <span className="text-sm font-medium text-gray-900">Direction Requests</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {analyticsData?.actions.directions.toLocaleString() || '0'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Globe className="h-5 w-5 text-orange-600" />
                      <span className="text-sm font-medium text-gray-900">Website Visits</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {analyticsData?.actions.website_clicks.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-sm text-red-600">
              Error loading analytics: {error}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
