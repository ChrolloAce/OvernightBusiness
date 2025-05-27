'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { BusinessProfilesStorage, SavedBusinessProfile } from '@/lib/business-profiles-storage'
import { GoogleBusinessAPI, PerformanceMetricsResponse, DailyMetricTimeSeries } from '@/lib/google-business-api'
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Phone, 
  Globe, 
  MapPin, 
  Calendar,
  RefreshCw,
  Loader2,
  ArrowUp,
  ArrowDown,
  Minus,
  Settings,
  Filter
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'

// Business Logo Component (reused from profiles page)
interface BusinessLogoProps {
  businessName: string
  website?: string
  className?: string
}

function BusinessLogo({ businessName, website, className = "w-16 h-16" }: BusinessLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const loadLogo = async () => {
      if (!website && !businessName) {
        setIsLoading(false)
        setHasError(true)
        return
      }

      try {
        let domain = ''
        if (website) {
          try {
            domain = new URL(website).hostname.replace('www.', '')
          } catch {
            domain = website.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0]
          }
        }

        const logoSources = [
          domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : null,
          domain ? `https://icons.duckduckgo.com/ip3/${domain}.ico` : null,
        ].filter(Boolean)

        if (logoSources.length > 0) {
          setLogoUrl(logoSources[0] as string)
          setIsLoading(false)
        } else {
          setHasError(true)
          setIsLoading(false)
        }
      } catch (error) {
        setHasError(true)
        setIsLoading(false)
      }
    }

    loadLogo()
  }, [businessName, website])

  if (isLoading) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center`}>
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    )
  }

  if (hasError || !logoUrl) {
    return (
      <div className={`${className} bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg`}>
        <BarChart3 className="w-8 h-8 text-white" />
      </div>
    )
  }

  return (
    <div className={`${className} rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50`}>
      <img
        src={logoUrl}
        alt={`${businessName} logo`}
        className="w-full h-full object-contain p-2"
        onError={() => {
          setHasError(true)
          setLogoUrl(null)
        }}
      />
    </div>
  )
}

// Metric configuration
const METRIC_CONFIG = [
  { 
    key: 'BUSINESS_IMPRESSIONS_DESKTOP_MAPS', 
    name: 'Desktop Maps', 
    icon: <Eye className="w-4 h-4" />, 
    color: '#3B82F6',
    category: 'impressions'
  },
  { 
    key: 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH', 
    name: 'Desktop Search', 
    icon: <Eye className="w-4 h-4" />, 
    color: '#10B981',
    category: 'impressions'
  },
  { 
    key: 'BUSINESS_IMPRESSIONS_MOBILE_MAPS', 
    name: 'Mobile Maps', 
    icon: <Eye className="w-4 h-4" />, 
    color: '#F59E0B',
    category: 'impressions'
  },
  { 
    key: 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH', 
    name: 'Mobile Search', 
    icon: <Eye className="w-4 h-4" />, 
    color: '#EF4444',
    category: 'impressions'
  },
  { 
    key: 'CALL_CLICKS', 
    name: 'Call Clicks', 
    icon: <Phone className="w-4 h-4" />, 
    color: '#8B5CF6',
    category: 'actions'
  },
  { 
    key: 'WEBSITE_CLICKS', 
    name: 'Website Clicks', 
    icon: <Globe className="w-4 h-4" />, 
    color: '#06B6D4',
    category: 'actions'
  },
  { 
    key: 'BUSINESS_DIRECTION_REQUESTS', 
    name: 'Direction Requests', 
    icon: <MapPin className="w-4 h-4" />, 
    color: '#84CC16',
    category: 'actions'
  },
  { 
    key: 'BUSINESS_BOOKINGS', 
    name: 'Bookings', 
    icon: <Calendar className="w-4 h-4" />, 
    color: '#F97316',
    category: 'actions'
  },
  { 
    key: 'BUSINESS_CONVERSATIONS', 
    name: 'Conversations', 
    icon: <Calendar className="w-4 h-4" />, 
    color: '#EC4899',
    category: 'actions'
  }
]

export default function AnalyticsPage() {
  const [profiles, setProfiles] = useState<SavedBusinessProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<SavedBusinessProfile | null>(null)
  const [performanceData, setPerformanceData] = useState<PerformanceMetricsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState<string>('30')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [enabledMetrics, setEnabledMetrics] = useState<Record<string, boolean>>({
    'BUSINESS_IMPRESSIONS_DESKTOP_MAPS': true,
    'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH': true,
    'BUSINESS_IMPRESSIONS_MOBILE_MAPS': true,
    'BUSINESS_IMPRESSIONS_MOBILE_SEARCH': true,
    'CALL_CLICKS': true,
    'WEBSITE_CLICKS': true,
    'BUSINESS_DIRECTION_REQUESTS': true,
    'BUSINESS_BOOKINGS': true,
    'BUSINESS_CONVERSATIONS': true
  })
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('area')

  const googleAPI = new GoogleBusinessAPI()

  useEffect(() => {
    loadProfiles()
    // Set default date range
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 30)
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }, [])

  const loadProfiles = () => {
    const savedProfiles = BusinessProfilesStorage.getAllProfiles()
    setProfiles(savedProfiles)
    if (savedProfiles.length > 0 && !selectedProfile) {
      setSelectedProfile(savedProfiles[0])
    }
  }

  const loadPerformanceData = async (profile: SavedBusinessProfile, customStartDate?: string, customEndDate?: string) => {
    if (!profile.googleBusinessId) return

    setLoading(true)
    try {
      console.log('Loading performance data for profile:', profile.name)
      
      // Extract location ID from the full name
      const locationId = profile.googleBusinessId.split('/').pop()
      if (!locationId) {
        throw new Error('Invalid location ID')
      }

      // Calculate date range
      let start = new Date()
      let end = new Date()
      
      if (customStartDate && customEndDate) {
        start = new Date(customStartDate)
        end = new Date(customEndDate)
      } else if (dateRange === 'custom' && startDate && endDate) {
        start = new Date(startDate)
        end = new Date(endDate)
      } else {
        const days = parseInt(dateRange)
        start.setDate(end.getDate() - days)
      }

      // Get enabled metrics only
      const enabledMetricKeys = Object.keys(enabledMetrics).filter(key => enabledMetrics[key])
      
      const data = await googleAPI.fetchMultiDailyMetricsTimeSeries(
        locationId,
        enabledMetricKeys,
        {
          year: start.getFullYear(),
          month: start.getMonth() + 1,
          day: start.getDate()
        },
        {
          year: end.getFullYear(),
          month: end.getMonth() + 1,
          day: end.getDate()
        }
      )
      
      setPerformanceData(data)
      
      // Update profile with performance data
      const updatedProfile = {
        ...profile,
        googleData: {
          ...profile.googleData,
          performanceData: data,
          lastPerformanceUpdate: new Date().toISOString()
        }
      }
      BusinessProfilesStorage.updateProfile(profile.id, updatedProfile)
      
    } catch (error) {
      console.error('Failed to load performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProfileSelect = (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId)
    if (profile) {
      setSelectedProfile(profile)
      // Load cached performance data first
      if (profile.googleData?.performanceData) {
        setPerformanceData(profile.googleData.performanceData)
      } else {
        setPerformanceData(null)
      }
    }
  }

  const refreshData = () => {
    if (selectedProfile) {
      loadPerformanceData(selectedProfile)
    }
  }

  const handleDateRangeChange = (value: string) => {
    setDateRange(value)
    if (value !== 'custom' && selectedProfile) {
      loadPerformanceData(selectedProfile)
    }
  }

  const handleCustomDateSubmit = () => {
    if (selectedProfile && startDate && endDate) {
      loadPerformanceData(selectedProfile, startDate, endDate)
    }
  }

  const toggleMetric = (metricKey: string) => {
    setEnabledMetrics(prev => ({
      ...prev,
      [metricKey]: !prev[metricKey]
    }))
  }

  // Process performance data for charts
  const processChartData = () => {
    if (!performanceData?.multiDailyMetricTimeSeries) return null

    const chartData: any[] = []
    const metricsMap = new Map()

    // Process each metric time series
    performanceData.multiDailyMetricTimeSeries.forEach(series => {
      series.dailyMetricTimeSeries.forEach(metricSeries => {
        const metric = metricSeries.dailyMetric
        
        metricSeries.timeSeries.datedValues.forEach(dataPoint => {
          const dateKey = `${dataPoint.date.year}-${String(dataPoint.date.month).padStart(2, '0')}-${String(dataPoint.date.day).padStart(2, '0')}`
          
          if (!metricsMap.has(dateKey)) {
            metricsMap.set(dateKey, { date: dateKey, formattedDate: new Date(dateKey).toLocaleDateString() })
          }
          
          const existing = metricsMap.get(dateKey)
          existing[metric] = parseInt(dataPoint.value) || 0
          metricsMap.set(dateKey, existing)
        })
      })
    })

    // Convert map to array and sort by date
    return Array.from(metricsMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  }

  // Calculate totals and trends
  const calculateMetricsSummary = () => {
    const chartData = processChartData()
    if (!chartData || chartData.length === 0) return null

    // Updated metrics to match the new API response
    const metrics = Object.keys(enabledMetrics).filter(key => enabledMetrics[key])
    const summary: any = {}

    metrics.forEach(metric => {
      const values = chartData.map(d => d[metric] || 0)
      const total = values.reduce((sum, val) => sum + val, 0)
      const recent = values.slice(-7).reduce((sum, val) => sum + val, 0) // Last 7 days
      const previous = values.slice(-14, -7).reduce((sum, val) => sum + val, 0) // Previous 7 days
      
      let trend = 0
      if (previous > 0) {
        trend = ((recent - previous) / previous) * 100
      } else if (recent > 0) {
        trend = 100
      }

      summary[metric] = {
        total,
        recent,
        previous,
        trend: Math.round(trend * 10) / 10
      }
    })

    // Add combined metrics for better display
    const impressionMetrics = ['BUSINESS_IMPRESSIONS_DESKTOP_MAPS', 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH', 'BUSINESS_IMPRESSIONS_MOBILE_MAPS', 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH']
    const enabledImpressionMetrics = impressionMetrics.filter(metric => enabledMetrics[metric])
    
    if (enabledImpressionMetrics.length > 0) {
      const totalImpressions = enabledImpressionMetrics.reduce((sum, metric) => sum + (summary[metric]?.total || 0), 0)
      const recentImpressions = enabledImpressionMetrics.reduce((sum, metric) => sum + (summary[metric]?.recent || 0), 0)
      const previousImpressions = enabledImpressionMetrics.reduce((sum, metric) => sum + (summary[metric]?.previous || 0), 0)

      let impressionsTrend = 0
      if (previousImpressions > 0) {
        impressionsTrend = ((recentImpressions - previousImpressions) / previousImpressions) * 100
      } else if (recentImpressions > 0) {
        impressionsTrend = 100
      }

      summary['TOTAL_IMPRESSIONS'] = {
        total: totalImpressions,
        recent: recentImpressions,
        previous: previousImpressions,
        trend: Math.round(impressionsTrend * 10) / 10
      }
    }

    return summary
  }

  const chartData = processChartData()
  const metricsSummary = calculateMetricsSummary()

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-500" />
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-black/95 backdrop-blur-xl border border-white/30 dark:border-white/20 rounded-xl p-4 shadow-xl">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{new Date(label).toLocaleDateString()}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {METRIC_CONFIG.find(m => m.key === entry.dataKey)?.name || entry.dataKey}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen">
      {/* Page Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Page Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-2xl" />
            <div className="relative bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                        Analytics Dashboard
                      </h1>
                      <p className="text-base text-gray-600 dark:text-gray-300 font-medium">
                        Track your Google Business Profile performance metrics
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={refreshData} 
                  disabled={loading || !selectedProfile}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <RefreshCw className={`w-4 h-4 mr-2 relative z-10 ${loading ? 'animate-spin' : ''}`} />
                  <span className="relative z-10">Refresh Data</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Business Profile Selector */}
          <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Select Business Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedProfile?.id || ''} onValueChange={handleProfileSelect}>
                <SelectTrigger className="h-16 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300">
                  <SelectValue placeholder="Choose a business profile to view analytics">
                    {selectedProfile && (
                      <div className="flex items-center gap-3">
                        <BusinessLogo 
                          businessName={selectedProfile.name} 
                          website={selectedProfile.website}
                          className="w-10 h-10"
                        />
                        <div className="text-left">
                          <div className="font-medium text-gray-900 dark:text-white">{selectedProfile.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{selectedProfile.address}</div>
                        </div>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-white/30 dark:border-white/20">
                  {profiles.map(profile => (
                    <SelectItem key={profile.id} value={profile.id} className="h-16 p-3">
                      <div className="flex items-center gap-3 w-full">
                        <BusinessLogo 
                          businessName={profile.name} 
                          website={profile.website}
                          className="w-10 h-10"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 dark:text-white">{profile.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{profile.address}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedProfile && (
            <>
              {/* Controls Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Date Range Controls */}
                <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Date Range
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={dateRange === '7' ? 'default' : 'outline'}
                        onClick={() => handleDateRangeChange('7')}
                        className="w-full"
                      >
                        Last 7 Days
                      </Button>
                      <Button
                        variant={dateRange === '30' ? 'default' : 'outline'}
                        onClick={() => handleDateRangeChange('30')}
                        className="w-full"
                      >
                        Last 30 Days
                      </Button>
                      <Button
                        variant={dateRange === '90' ? 'default' : 'outline'}
                        onClick={() => handleDateRangeChange('90')}
                        className="w-full"
                      >
                        Last 90 Days
                      </Button>
                      <Button
                        variant={dateRange === 'custom' ? 'default' : 'outline'}
                        onClick={() => handleDateRangeChange('custom')}
                        className="w-full"
                      >
                        Custom Range
                      </Button>
                    </div>
                    
                    {dateRange === 'custom' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="start-date">Start Date</Label>
                            <Input
                              id="start-date"
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                              className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20"
                            />
                          </div>
                          <div>
                            <Label htmlFor="end-date">End Date</Label>
                            <Input
                              id="end-date"
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                              className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20"
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={handleCustomDateSubmit}
                          disabled={!startDate || !endDate}
                          className="w-full"
                        >
                          Apply Date Range
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Chart Controls */}
                <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Chart Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Chart Type</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <Button
                          variant={chartType === 'line' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setChartType('line')}
                        >
                          Line
                        </Button>
                        <Button
                          variant={chartType === 'area' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setChartType('area')}
                        >
                          Area
                        </Button>
                        <Button
                          variant={chartType === 'bar' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setChartType('bar')}
                        >
                          Bar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Metrics Toggles */}
              <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5" />
                    Metrics Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {METRIC_CONFIG.map((metric) => (
                      <div key={metric.key} className="flex items-center justify-between p-3 bg-white/30 dark:bg-black/20 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-lg"
                            style={{ backgroundColor: metric.color }}
                          >
                            {metric.icon}
                          </div>
                          <div>
                            <Label className="font-medium">{metric.name}</Label>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{metric.category}</p>
                          </div>
                        </div>
                        <Switch
                          checked={enabledMetrics[metric.key]}
                          onCheckedChange={() => toggleMetric(metric.key)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Metrics Summary Cards */}
              {metricsSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Show key combined metrics */}
                  {[
                    { key: 'TOTAL_IMPRESSIONS', name: 'Total Impressions', icon: <Eye className="w-5 h-5" />, color: '#3B82F6' },
                    { key: 'CALL_CLICKS', name: 'Call Clicks', icon: <Phone className="w-5 h-5" />, color: '#8B5CF6' },
                    { key: 'WEBSITE_CLICKS', name: 'Website Clicks', icon: <Globe className="w-5 h-5" />, color: '#06B6D4' },
                    { key: 'BUSINESS_DIRECTION_REQUESTS', name: 'Direction Requests', icon: <MapPin className="w-5 h-5" />, color: '#84CC16' },
                    { key: 'BUSINESS_BOOKINGS', name: 'Bookings', icon: <Calendar className="w-5 h-5" />, color: '#F97316' }
                  ].map(({ key, name, icon, color }) => {
                    const data = metricsSummary[key]
                    if (!data) return null
                    
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl" />
                        <Card className="relative bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div 
                                  className="p-2 rounded-lg shadow-lg"
                                  style={{ backgroundColor: color }}
                                >
                                  {icon}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                    {name}
                                  </p>
                                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {data.total.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center mt-4 space-x-2">
                              {getTrendIcon(data.trend)}
                              <span className={`text-sm font-medium ${
                                data.trend > 0 ? 'text-green-600' : 
                                data.trend < 0 ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                {Math.abs(data.trend)}%
                              </span>
                              <span className="text-sm text-gray-500">vs last week</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  }).filter(Boolean)}
                </div>
              )}

              {/* Charts */}
              {chartData && chartData.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {/* Main Chart */}
                  <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                    <CardHeader>
                      <CardTitle>Performance Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={500}>
                        {chartType === 'line' ? (
                          <LineChart data={chartData}>
                            <defs>
                              {METRIC_CONFIG.filter(m => enabledMetrics[m.key]).map((metric, index) => (
                                <linearGradient key={metric.key} id={`gradient-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={metric.color} stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor={metric.color} stopOpacity={0.1}/>
                                </linearGradient>
                              ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                            <XAxis 
                              dataKey="formattedDate" 
                              stroke="#6b7280"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis 
                              stroke="#6b7280"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => value.toLocaleString()}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {METRIC_CONFIG.filter(m => enabledMetrics[m.key]).map((metric) => (
                              <Line 
                                key={metric.key}
                                type="monotone" 
                                dataKey={metric.key} 
                                stroke={metric.color}
                                strokeWidth={3}
                                name={metric.name}
                                dot={{ fill: metric.color, strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, stroke: metric.color, strokeWidth: 2 }}
                              />
                            ))}
                          </LineChart>
                        ) : chartType === 'area' ? (
                          <AreaChart data={chartData}>
                            <defs>
                              {METRIC_CONFIG.filter(m => enabledMetrics[m.key]).map((metric) => (
                                <linearGradient key={metric.key} id={`gradient-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={metric.color} stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor={metric.color} stopOpacity={0.1}/>
                                </linearGradient>
                              ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                            <XAxis 
                              dataKey="formattedDate" 
                              stroke="#6b7280"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis 
                              stroke="#6b7280"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => value.toLocaleString()}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {METRIC_CONFIG.filter(m => enabledMetrics[m.key]).map((metric) => (
                              <Area 
                                key={metric.key}
                                type="monotone" 
                                dataKey={metric.key} 
                                stroke={metric.color}
                                strokeWidth={2}
                                fill={`url(#gradient-${metric.key})`}
                                name={metric.name}
                              />
                            ))}
                          </AreaChart>
                        ) : (
                          <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                            <XAxis 
                              dataKey="formattedDate" 
                              stroke="#6b7280"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                            />
                            <YAxis 
                              stroke="#6b7280"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => value.toLocaleString()}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            {METRIC_CONFIG.filter(m => enabledMetrics[m.key]).map((metric) => (
                              <Bar 
                                key={metric.key}
                                dataKey={metric.key} 
                                fill={metric.color}
                                name={metric.name}
                                radius={[2, 2, 0, 0]}
                              />
                            ))}
                          </BarChart>
                        )}
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Secondary Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pie Chart for Actions Distribution */}
                    <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                      <CardHeader>
                        <CardTitle>Actions Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={METRIC_CONFIG.filter(m => m.category === 'actions' && enabledMetrics[m.key] && metricsSummary?.[m.key]?.total > 0).map(metric => ({
                                name: metric.name,
                                value: metricsSummary?.[metric.key]?.total || 0,
                                fill: metric.color
                              }))}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {METRIC_CONFIG.filter(m => m.category === 'actions' && enabledMetrics[m.key]).map((metric, index) => (
                                <Cell key={`cell-${index}`} fill={metric.color} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value: any) => [value.toLocaleString(), 'Total']} />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Impressions Breakdown */}
                    <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                      <CardHeader>
                        <CardTitle>Impressions Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart 
                            data={METRIC_CONFIG.filter(m => m.category === 'impressions' && enabledMetrics[m.key] && metricsSummary?.[m.key]?.total > 0).map(metric => ({
                              name: metric.name.replace('Impressions ', ''),
                              value: metricsSummary?.[metric.key]?.total || 0,
                              fill: metric.color
                            }))}
                            layout="horizontal"
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                            <XAxis 
                              type="number"
                              stroke="#6b7280"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              tickFormatter={(value) => value.toLocaleString()}
                            />
                            <YAxis 
                              type="category"
                              dataKey="name"
                              stroke="#6b7280"
                              fontSize={12}
                              tickLine={false}
                              axisLine={false}
                              width={100}
                            />
                            <Tooltip formatter={(value: any) => [value.toLocaleString(), 'Total']} />
                            <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : loading ? (
                <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                      <p className="text-lg font-medium">Loading analytics data...</p>
                      <p className="text-sm text-gray-500">This may take a few moments</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-lg font-medium">No analytics data available</p>
                      <p className="text-sm text-gray-500 mb-4">Click "Refresh Data" to load performance metrics</p>
                      <Button onClick={refreshData} disabled={!selectedProfile}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Load Analytics Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </motion.div>
      </main>
    </div>
  )
} 