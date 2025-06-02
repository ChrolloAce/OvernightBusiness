'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Filter,
  FileText,
  Download,
  Mail,
  Users,
  Plus,
  Edit,
  Trash2
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
import { CentralizedDataLoader } from '@/lib/centralized-data-loader'
import { useProfile } from '@/contexts/profile-context'
import { EnhancedPDFReportGenerator, EnhancedReportData } from '@/lib/pdf-report-generator'
import { ClientInfo, ClientManagementStorage } from '@/lib/client-management'
import { ClientManagementModal } from '@/components/client-management-modal'

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
  const { selectedProfile } = useProfile()
  const [performanceData, setPerformanceData] = useState<PerformanceMetricsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [dateRange, setDateRange] = useState('30')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line')
  const [enabledMetrics, setEnabledMetrics] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    METRIC_CONFIG.forEach(metric => {
      initial[metric.key] = true
    })
    return initial
  })

  // PDF and Client Management State
  const [clients, setClients] = useState<ClientInfo[]>([])
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<ClientInfo | undefined>()
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  useEffect(() => {
    // Set default date range
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 30)
    setCustomStartDate(start.toISOString().split('T')[0])
    setCustomEndDate(end.toISOString().split('T')[0])
  }, [])

  // Auto-refresh when profile changes
  useEffect(() => {
    if (selectedProfile) {
      loadPerformanceData(selectedProfile)
    }
  }, [selectedProfile, dateRange, enabledMetrics])

  // Load clients when profile changes
  useEffect(() => {
    if (selectedProfile) {
      const profileClients = ClientManagementStorage.getClientsByBusinessProfile(selectedProfile.id)
      setClients(profileClients)
    }
  }, [selectedProfile])

  const loadPerformanceData = async (profile: SavedBusinessProfile) => {
    setLoading(true)
    setPerformanceData(null)
    
    try {
      console.log('[Analytics] Loading performance data for profile:', profile.name)
      
      // Calculate date range
      let start = new Date()
      let end = new Date()
      
      if (customStartDate && customEndDate) {
        start = new Date(customStartDate)
        end = new Date(customEndDate)
      } else {
        const days = parseInt(dateRange)
        start.setDate(end.getDate() - days)
      }
      
      const result = await CentralizedDataLoader.loadAnalytics(profile, {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        enabledMetrics
      })
      
      if (result.success && result.data) {
        setPerformanceData(result.data)
        console.log('[Analytics] Performance data loaded successfully')
      } else {
        console.error('[Analytics] Failed to load performance data:', result.error)
        setPerformanceData(null)
      }
    } catch (error) {
      console.error('[Analytics] Error loading performance data:', error)
      setPerformanceData(null)
    } finally {
      setLoading(false)
    }
  }

  const handleDateRangeChange = (value: string) => {
    setDateRange(value)
    // Clear custom dates when selecting preset range
    setCustomStartDate('')
    setCustomEndDate('')
  }

  const handleCustomDateSubmit = () => {
    if (selectedProfile && customStartDate && customEndDate) {
      loadPerformanceData(selectedProfile)
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

  // Client Management Functions
  const handleAddClient = () => {
    setEditingClient(undefined)
    setIsClientModalOpen(true)
  }

  const handleEditClient = (client: ClientInfo) => {
    setEditingClient(client)
    setIsClientModalOpen(true)
  }

  const handleDeleteClient = (clientId: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      ClientManagementStorage.deleteClient(clientId)
      loadClients()
    }
  }

  const handleSaveClient = (client: ClientInfo) => {
    if (editingClient) {
      ClientManagementStorage.updateClient(client.id, client)
    } else {
      ClientManagementStorage.addClient(client)
    }
    loadClients()
    setEditingClient(undefined)
    setIsClientModalOpen(false)
  }

  // Load clients on component mount
  const loadClients = () => {
    const storedClients = ClientManagementStorage.getClientsByBusinessProfile(selectedProfile?.id || '')
    setClients(storedClients)
  }

  useEffect(() => {
    if (selectedProfile) {
      loadClients()
    }
  }, [selectedProfile])

  // PDF Generation Functions
  const generateReportData = (): EnhancedReportData | null => {
    if (!selectedProfile || !performanceData) return null

    // Calculate analytics from performance data
    const analytics = {
      views: metricsSummary?.TOTAL_IMPRESSIONS?.total || 0,
      searches: (metricsSummary?.BUSINESS_IMPRESSIONS_DESKTOP_SEARCH?.total || 0) + 
                (metricsSummary?.BUSINESS_IMPRESSIONS_MOBILE_SEARCH?.total || 0),
      actions: (metricsSummary?.CALL_CLICKS?.total || 0) + 
               (metricsSummary?.WEBSITE_CLICKS?.total || 0) + 
               (metricsSummary?.BUSINESS_DIRECTION_REQUESTS?.total || 0),
      callClicks: metricsSummary?.CALL_CLICKS?.total || 0,
      websiteClicks: metricsSummary?.WEBSITE_CLICKS?.total || 0,
      directionRequests: metricsSummary?.BUSINESS_DIRECTION_REQUESTS?.total || 0,
      photoViews: 0, // Would need to be fetched from photos API
      period: `Last ${dateRange} days`
    }

    // Use enhanced method to generate real report data
    return EnhancedPDFReportGenerator.generateEnhancedReportData(
      selectedProfile,
      performanceData,
      metricsSummary,
      dateRange
    )
  }

  const handleGeneratePDF = async () => {
    if (!selectedProfile) return

    setIsGeneratingPDF(true)
    try {
      const reportData = generateReportData()
      if (!reportData) {
        throw new Error('No data available for report generation')
      }

      const generator = new EnhancedPDFReportGenerator()
      const sampleClient: ClientInfo = {
        id: 'sample',
        businessProfileId: selectedProfile.id,
        name: 'Sample Client',
        email: 'client@example.com',
        reportFrequency: 'weekly',
        reportDay: 1,
        isActive: true,
        createdAt: new Date().toISOString(),
        preferences: {
          includePhotos: true,
          includeUpdates: true,
          includeReviews: true,
          includeAnalytics: true,
          includeQA: true
        }
      }

      const pdfBlob = await generator.generateEnhancedReport(reportData, sampleClient, 'weekly')
      
      // Download the PDF
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedProfile.name}-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF report. Please try again.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleSendReports = async () => {
    if (!selectedProfile || clients.length === 0) return

    setIsSendingEmail(true)
    const results = []

    try {
      const reportData = generateReportData()
      if (!reportData) {
        throw new Error('No data available for report generation')
      }

      const generator = new EnhancedPDFReportGenerator()

      for (const client of clients.filter(c => c.isActive)) {
        try {
          // Generate PDF for this client
          const pdfBlob = await generator.generateEnhancedReport(reportData, client, client.reportFrequency)
          
          // Convert blob to base64 for email
          const reader = new FileReader()
          const pdfBase64 = await new Promise<string>((resolve) => {
            reader.onloadend = () => {
              const base64data = reader.result as string
              resolve(base64data.split(',')[1])
            }
            reader.readAsDataURL(pdfBlob)
          })

          // Send email with PDF attachment
          const response = await fetch('/api/send-report', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              clientEmail: client.email,
              clientName: client.name,
              businessName: selectedProfile.name,
              reportPeriod: client.reportFrequency,
              pdfAttachment: pdfBase64,
              reportData
            })
          })

          const result = await response.json()
          results.push({
            client: client.name,
            success: result.success,
            message: result.message
          })

          // Update last sent date
          if (result.success) {
            ClientManagementStorage.markReportSent(client.id)
          }

        } catch (error) {
          console.error(`Error sending report to ${client.name}:`, error)
          results.push({
            client: client.name,
            success: false,
            message: 'Failed to send report'
          })
        }
      }

      // Show results
      const successCount = results.filter(r => r.success).length
      const totalCount = results.length
      
      if (successCount === totalCount) {
        alert(`✅ Successfully sent reports to all ${totalCount} clients!`)
      } else {
        alert(`📧 Sent ${successCount}/${totalCount} reports successfully. Check console for details.`)
        console.log('Email results:', results)
      }

      // Refresh clients to update last sent dates
      loadClients()

    } catch (error) {
      console.error('Error sending reports:', error)
      alert('Failed to send reports. Please try again.')
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Page Content */}
      <main className="p-4 lg:p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 lg:space-y-6"
        >
          {/* Page Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl lg:rounded-2xl blur-xl lg:blur-2xl" />
            <div className="relative bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-xl lg:rounded-2xl border border-white/20 dark:border-white/10 p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                        Analytics Dashboard
                      </h1>
                      <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 font-medium">
                        Track your Google Business Profile performance metrics
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => selectedProfile && loadPerformanceData(selectedProfile)} 
                  disabled={loading || !selectedProfile}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <RefreshCw className={`w-4 h-4 mr-2 relative z-10 ${loading ? 'animate-spin' : ''}`} />
                  <span className="relative z-10">Refresh Data</span>
                </Button>
              </div>
            </div>
          </div>

          {/* PDF Reports & Client Management */}
          {selectedProfile && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* PDF Report Generation */}
              <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                <CardHeader className="pb-3 lg:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <FileText className="w-4 h-4 lg:w-5 lg:h-5" />
                    PDF Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generate comprehensive business performance reports in PDF format.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={handleGeneratePDF}
                      disabled={isGeneratingPDF || !performanceData}
                      className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Generate PDF
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleSendReports}
                      disabled={isSendingEmail || clients.length === 0 || !performanceData}
                      variant="outline"
                      className="flex-1"
                    >
                      {isSendingEmail ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Email Reports ({clients.filter(c => c.isActive).length})
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Client Management */}
              <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                <CardHeader className="pb-3 lg:pb-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                      <Users className="w-4 h-4 lg:w-5 lg:h-5" />
                      Client Management ({clients.length})
                    </CardTitle>
                    <Button
                      onClick={handleAddClient}
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Client
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {clients.length === 0 ? (
                    <div className="text-center py-6">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        No clients added yet. Add clients to send automated reports.
                      </p>
                      <Button
                        onClick={handleAddClient}
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Your First Client
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {clients.slice(0, 3).map((client) => (
                        <div
                          key={client.id}
                          className="flex items-center justify-between p-2 bg-white/30 dark:bg-black/20 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${client.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                              <p className="text-sm font-medium truncate">{client.name}</p>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              {client.email} • {client.reportFrequency}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              onClick={() => handleEditClient(client)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteClient(client.id)}
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      {clients.length > 3 && (
                        <p className="text-xs text-gray-500 text-center pt-2">
                          +{clients.length - 3} more clients
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Metrics Toggles - Compact Version */}
          {selectedProfile && (
            <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
              <CardHeader className="pb-3 lg:pb-6">
                <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                  <Filter className="w-4 h-4 lg:w-5 lg:h-5" />
                  Metrics Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 lg:gap-3">
                  {METRIC_CONFIG.map((metric) => (
                    <div key={metric.key} className="flex items-center justify-between p-2 bg-white/30 dark:bg-black/20 rounded-lg">
                      <div className="flex items-center space-x-1 lg:space-x-2 min-w-0 flex-1">
                        <div 
                          className="w-5 h-5 lg:w-6 lg:h-6 rounded-md flex items-center justify-center text-white shadow-lg flex-shrink-0"
                          style={{ backgroundColor: metric.color }}
                        >
                          {React.cloneElement(metric.icon, { className: "w-3 h-3" })}
                        </div>
                        <Label className="text-xs lg:text-sm font-medium truncate">{metric.name.replace(' Impressions', '').replace('Business ', '')}</Label>
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
          )}

          {/* Metrics Summary Cards */}
          {metricsSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 lg:gap-4">
              {/* Show key combined metrics */}
              {[
                { key: 'TOTAL_IMPRESSIONS', name: 'Total Impressions', icon: <Eye className="w-4 h-4 lg:w-5 lg:h-5" />, color: '#3B82F6' },
                { key: 'CALL_CLICKS', name: 'Call Clicks', icon: <Phone className="w-4 h-4 lg:w-5 lg:h-5" />, color: '#8B5CF6' },
                { key: 'WEBSITE_CLICKS', name: 'Website Clicks', icon: <Globe className="w-4 h-4 lg:w-5 lg:h-5" />, color: '#06B6D4' },
                { key: 'BUSINESS_DIRECTION_REQUESTS', name: 'Direction Requests', icon: <MapPin className="w-4 h-4 lg:w-5 lg:h-5" />, color: '#84CC16' },
                { key: 'BUSINESS_BOOKINGS', name: 'Bookings', icon: <Calendar className="w-4 h-4 lg:w-5 lg:h-5" />, color: '#F97316' }
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
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl lg:rounded-2xl blur-lg lg:blur-xl" />
                    <Card className="relative bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                      <CardContent className="p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 lg:space-x-3">
                            <div 
                              className="p-1.5 lg:p-2 rounded-lg shadow-lg"
                              style={{ backgroundColor: color }}
                            >
                              {icon}
                            </div>
                            <div>
                              <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">
                                {name}
                              </p>
                              <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-white">
                                {data.total.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center mt-3 lg:mt-4 space-x-2">
                          {getTrendIcon(data.trend)}
                          <span className={`text-xs lg:text-sm font-medium ${
                            data.trend > 0 ? 'text-green-600' : 
                            data.trend < 0 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {Math.abs(data.trend)}%
                          </span>
                          <span className="text-xs lg:text-sm text-gray-500">vs last week</span>
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
            <div className="grid grid-cols-1 gap-4 lg:gap-6">
              {/* Main Chart */}
              <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                <CardHeader className="pb-3 lg:pb-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
                    <CardTitle className="text-base lg:text-lg">Performance Trends</CardTitle>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                      {/* Date Range Buttons */}
                      <div className="flex items-center gap-1 w-full sm:w-auto">
                        <Button
                          variant={dateRange === '7' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleDateRangeChange('7')}
                          className="flex-1 sm:flex-none"
                        >
                          7D
                        </Button>
                        <Button
                          variant={dateRange === '30' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleDateRangeChange('30')}
                          className="flex-1 sm:flex-none"
                        >
                          30D
                        </Button>
                        <Button
                          variant={dateRange === '90' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleDateRangeChange('90')}
                          className="flex-1 sm:flex-none"
                        >
                          90D
                        </Button>
                        <Button
                          variant={dateRange === 'custom' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handleDateRangeChange('custom')}
                          className="flex-1 sm:flex-none"
                        >
                          Custom
                        </Button>
                      </div>
                      
                      {/* Chart Type Buttons */}
                      <div className="flex items-center gap-1 w-full sm:w-auto">
                        <Button
                          variant={chartType === 'line' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setChartType('line')}
                          className="flex-1 sm:flex-none"
                        >
                          Line
                        </Button>
                        <Button
                          variant={chartType === 'area' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setChartType('area')}
                          className="flex-1 sm:flex-none"
                        >
                          Area
                        </Button>
                        <Button
                          variant={chartType === 'bar' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setChartType('bar')}
                          className="flex-1 sm:flex-none"
                        >
                          Bar
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Custom Date Range (if selected) */}
                  {dateRange === 'custom' && (
                    <div className="mt-4 p-4 bg-white/30 dark:bg-black/20 rounded-lg">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <Label htmlFor="start-date" className="text-sm">Start Date</Label>
                          <Input
                            id="start-date"
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 h-8"
                          />
                        </div>
                        <div>
                          <Label htmlFor="end-date" className="text-sm">End Date</Label>
                          <Input
                            id="end-date"
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 h-8"
                          />
                        </div>
                      </div>
                      <Button 
                        onClick={handleCustomDateSubmit}
                        disabled={!customStartDate || !customEndDate}
                        size="sm"
                        className="w-full"
                      >
                        Apply Custom Range
                      </Button>
                    </div>
                  )}
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
                  <Button onClick={() => selectedProfile && loadPerformanceData(selectedProfile)} disabled={!selectedProfile}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Load Analytics Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </main>

      {/* Client Management Modal */}
      {selectedProfile && (
        <ClientManagementModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          businessProfile={selectedProfile}
          client={editingClient}
          onSave={handleSaveClient}
        />
      )}
    </div>
  )
} 