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
  ChevronDown,
  Star,
  MessageSquare,
  MapPin,
  Phone,
  Globe,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useProfile } from '@/contexts/profile-context'

interface AnalyticsData {
  views: { total: number; change: number }
  searches: { total: number; change: number }
  calls: { total: number; change: number }
  directions: { total: number; change: number }
  photos: { total: number; change: number }
  reviews: { total: number; change: number; rating: number }
}

interface MetricCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ComponentType<any>
  trend?: 'up' | 'down' | 'neutral'
}

function MetricCard({ title, value, change, icon: Icon, trend }: MetricCardProps) {
  const getTrendColor = () => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-500'
  }

  const getTrendIcon = () => {
    if (change > 0) return <ArrowUp className="h-3 w-3" />
    if (change < 0) return <ArrowDown className="h-3 w-3" />
    return null
  }

  return (
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
          <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
            {getTrendIcon()}
            <span className="text-sm font-medium">
              {change > 0 ? '+' : ''}{change}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false)
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(false)
  const { selectedProfile } = useProfile()

  // Mock analytics data - replace with real API calls
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    views: { total: 1245, change: 12.5 },
    searches: { total: 892, change: -3.2 },
    calls: { total: 156, change: 8.7 },
    directions: { total: 324, change: 15.3 },
    photos: { total: 67, change: 22.1 },
    reviews: { total: 28, change: 5.4, rating: 4.6 }
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const refreshData = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">
      <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
              {selectedProfile && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {selectedProfile.name}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={refreshData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {!selectedProfile ? (
          <div className="text-center py-16">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Business Selected</h3>
            <p className="text-gray-500">
              Select a business profile to view analytics data
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard
                  title="Total Views"
                  value={analyticsData.views.total.toLocaleString()}
                  change={analyticsData.views.change}
                  icon={Eye}
                />
                <MetricCard
                  title="Search Queries"
                  value={analyticsData.searches.total.toLocaleString()}
                  change={analyticsData.searches.change}
                  icon={BarChart3}
                />
                <MetricCard
                  title="Phone Calls"
                  value={analyticsData.calls.total}
                  change={analyticsData.calls.change}
                  icon={Phone}
                />
                <MetricCard
                  title="Direction Requests"
                  value={analyticsData.directions.total}
                  change={analyticsData.directions.change}
                  icon={MapPin}
                />
                <MetricCard
                  title="Photo Views"
                  value={analyticsData.photos.total}
                  change={analyticsData.photos.change}
                  icon={Eye}
                />
                <MetricCard
                  title="Customer Reviews"
                  value={`${analyticsData.reviews.total} (${analyticsData.reviews.rating}★)`}
                  change={analyticsData.reviews.change}
                  icon={Star}
                />
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Views Over Time */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Views Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                      <p>Chart visualization would go here</p>
                      <p className="text-sm">Integration with charting library needed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Actions */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Customer Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Website Clicks</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">245</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Direction Requests</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{analyticsData.directions.total}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Phone Calls</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{analyticsData.calls.total}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Photo Views</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{analyticsData.photos.total}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search Queries */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Top Search Queries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { query: selectedProfile.name, count: 145 },
                    { query: `${selectedProfile.category} near me`, count: 89 },
                    { query: `${selectedProfile.name} hours`, count: 67 },
                    { query: `${selectedProfile.name} phone number`, count: 43 },
                    { query: `${selectedProfile.name} reviews`, count: 32 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-700">{item.query}</span>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {item.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Business Information Summary */}
            <Card className="bg-white border border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Business Profile Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Star className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.reviews.rating}</p>
                    <p className="text-sm text-gray-600">Average Rating</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <MessageSquare className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.reviews.total}</p>
                    <p className="text-sm text-gray-600">Total Reviews</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Eye className="h-6 w-6 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.photos.total}</p>
                    <p className="text-sm text-gray-600">Photos Added</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{analyticsData.views.total}</p>
                    <p className="text-sm text-gray-600">Profile Views</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
} 