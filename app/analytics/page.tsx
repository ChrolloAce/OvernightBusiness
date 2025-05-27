'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Minus
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
  Cell
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

export default function AnalyticsPage() {
  const [profiles, setProfiles] = useState<SavedBusinessProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<SavedBusinessProfile | null>(null)
  const [performanceData, setPerformanceData] = useState<PerformanceMetricsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState<string>('30')

  const googleAPI = new GoogleBusinessAPI()

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = () => {
    const savedProfiles = BusinessProfilesStorage.getAllProfiles()
    setProfiles(savedProfiles)
    if (savedProfiles.length > 0 && !selectedProfile) {
      setSelectedProfile(savedProfiles[0])
    }
  }

  const loadPerformanceData = async (profile: SavedBusinessProfile) => {
    if (!profile.googleBusinessId) return

    setLoading(true)
    try {
      console.log('Loading performance data for profile:', profile.name)
      
      // Extract location ID from the full name (e.g., "accounts/123/locations/456" -> "456")
      const locationId = profile.googleBusinessId.split('/').pop()
      if (!locationId) {
        throw new Error('Invalid location ID')
      }

      const data = await googleAPI.getRecentPerformanceMetrics(locationId)
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
            metricsMap.set(dateKey, { date: dateKey })
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

    const metrics = ['BUSINESS_IMPRESSIONS', 'CALL_CLICKS', 'WEBSITE_CLICKS', 'BUSINESS_DIRECTION_REQUESTS', 'BUSINESS_BOOKINGS']
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

    return summary
  }

  const chartData = processChartData()
  const metricsSummary = calculateMetricsSummary()

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  const formatMetricName = (metric: string) => {
    return metric.replace('BUSINESS_', '').replace('_', ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'BUSINESS_IMPRESSIONS': return <Eye className="w-5 h-5" />
      case 'CALL_CLICKS': return <Phone className="w-5 h-5" />
      case 'WEBSITE_CLICKS': return <Globe className="w-5 h-5" />
      case 'BUSINESS_DIRECTION_REQUESTS': return <MapPin className="w-5 h-5" />
      case 'BUSINESS_BOOKINGS': return <Calendar className="w-5 h-5" />
      default: return <BarChart3 className="w-5 h-5" />
    }
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUp className="w-4 h-4 text-green-500" />
    if (trend < 0) return <ArrowDown className="w-4 h-4 text-red-500" />
    return <Minus className="w-4 h-4 text-gray-500" />
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
          <Card>
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
              {/* Metrics Summary Cards */}
              {metricsSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {Object.entries(metricsSummary).map(([metric, data]: [string, any]) => (
                    <motion.div
                      key={metric}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl" />
                      <Card className="relative bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                                {getMetricIcon(metric)}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                  {formatMetricName(metric)}
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
                  ))}
                </div>
              )}

              {/* Charts */}
              {chartData && chartData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Line Chart */}
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Performance Trends (Last 30 Days)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line type="monotone" dataKey="BUSINESS_IMPRESSIONS" stroke="#3B82F6" name="Impressions" />
                          <Line type="monotone" dataKey="CALL_CLICKS" stroke="#10B981" name="Calls" />
                          <Line type="monotone" dataKey="WEBSITE_CLICKS" stroke="#F59E0B" name="Website Clicks" />
                          <Line type="monotone" dataKey="BUSINESS_DIRECTION_REQUESTS" stroke="#EF4444" name="Directions" />
                          <Line type="monotone" dataKey="BUSINESS_BOOKINGS" stroke="#8B5CF6" name="Bookings" />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Bar Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Totals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData.slice(-7)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="BUSINESS_IMPRESSIONS" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Pie Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Actions Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Calls', value: metricsSummary?.CALL_CLICKS?.total || 0 },
                              { name: 'Website', value: metricsSummary?.WEBSITE_CLICKS?.total || 0 },
                              { name: 'Directions', value: metricsSummary?.BUSINESS_DIRECTION_REQUESTS?.total || 0 },
                              { name: 'Bookings', value: metricsSummary?.BUSINESS_BOOKINGS?.total || 0 },
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label
                          >
                            {COLORS.map((color, index) => (
                              <Cell key={`cell-${index}`} fill={color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              ) : loading ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                      <p className="text-lg font-medium">Loading analytics data...</p>
                      <p className="text-sm text-gray-500">This may take a few moments</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
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