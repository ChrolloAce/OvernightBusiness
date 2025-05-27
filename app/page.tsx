'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  BarChart3, 
  FileText, 
  Settings, 
  Moon,
  Sun,
  Search,
  Bell,
  Plus,
  TrendingUp,
  Calendar,
  MessageSquare,
  Star,
  Eye,
  DollarSign,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import { AppManager } from '@/lib/managers/app-manager'
import { Review } from '@/lib/managers/reviews-manager'
import { Badge } from '@/components/ui/badge'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [appManager] = useState(() => AppManager.getInstance())
  const [stats, setStats] = useState({
    totalProfiles: 0,
    totalPosts: 0,
    averageRating: 0,
    totalReviews: 0,
    verificationRate: 0
  })
  const [reviewAnalytics, setReviewAnalytics] = useState({
    totalReviews: 0,
    averageRating: 0,
    positiveReviews: 0,
    neutralReviews: 0,
    negativeReviews: 0,
    unrepliedReviews: 0,
    recentReviews: [] as Review[]
  })
  const [recentActivity, setRecentActivity] = useState<Array<{
    action: string
    profile: string
    time: string
    status: 'success' | 'info' | 'warning' | 'error'
  }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'profiles', label: 'Business Profiles', icon: Building2 },
    { id: 'content', label: 'Content Hub', icon: FileText },
  ]

  useEffect(() => {
    initializeDashboard()
  }, [])

  const initializeDashboard = async () => {
    try {
      await appManager.initialize()
      await loadDashboardData()
    } catch (error) {
      console.error('Failed to initialize dashboard:', error)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const loadDashboardData = async () => {
    try {
      // Load basic stats
      const basicStats = appManager.getDashboardStats()
      setStats(basicStats)

      // Load review analytics
      const analytics = await appManager.getReviewAnalytics()
      setReviewAnalytics(analytics)

      // Load recent activity
      const activity = appManager.getRecentActivity()
      setRecentActivity(activity)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setError('Failed to load some dashboard data')
    }
  }

  const syncAllReviews = async () => {
    setIsSyncing(true)
    setError(null)

    try {
      const result = await appManager.syncAllProfileReviews()
      
      if (result.successCount > 0) {
        await loadDashboardData() // Reload dashboard data
        console.log(`Successfully synced reviews for ${result.successCount} profiles`)
      }
      
      if (result.failureCount > 0) {
        setError(`Failed to sync ${result.failureCount} profiles`)
      }
    } catch (error) {
      console.error('Failed to sync reviews:', error)
      setError('Failed to sync reviews')
    } finally {
      setIsSyncing(false)
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const getActivityIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-blue-600" />
    }
  }

  const getStarRating = (starRating: string): number => {
    switch (starRating) {
      case 'FIVE': return 5
      case 'FOUR': return 4
      case 'THREE': return 3
      case 'TWO': return 2
      case 'ONE': return 1
      default: return 0
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 border-r bg-card/50 backdrop-blur-sm"
      >
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Overnight Biz</h1>
          </div>
        </div>
        
        <nav className="px-4 space-y-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 h-9 w-[300px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">JD</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                  <p className="text-muted-foreground">
                    Overview of your Google Business Profile management.
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={syncAllReviews} 
                    disabled={isSyncing}
                    variant="outline"
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    Sync Reviews
                  </Button>
                  <Button onClick={() => setActiveTab('content')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Content
                  </Button>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                      <div>
                        <p className="text-red-600 dark:text-red-400 font-medium">Error</p>
                        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setError(null)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats Overview */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Business Profiles</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalProfiles}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.verificationRate}% verified
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Content Posts</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalPosts}</div>
                    <p className="text-xs text-muted-foreground">
                      AI-generated content
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold flex items-center">
                      {reviewAnalytics.averageRating.toFixed(1)}
                      <div className="flex ml-2">
                        {renderStars(Math.round(reviewAnalytics.averageRating))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      From {reviewAnalytics.totalReviews} reviews
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{reviewAnalytics.totalReviews}</div>
                    <p className="text-xs text-muted-foreground">
                      {reviewAnalytics.unrepliedReviews} need replies
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Review Analytics */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                      Positive Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {reviewAnalytics.positiveReviews}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {reviewAnalytics.totalReviews > 0 
                        ? Math.round((reviewAnalytics.positiveReviews / reviewAnalytics.totalReviews) * 100)
                        : 0
                      }% of all reviews
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="mr-2 h-5 w-5 text-yellow-600" />
                      Neutral Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {reviewAnalytics.neutralReviews}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {reviewAnalytics.totalReviews > 0 
                        ? Math.round((reviewAnalytics.neutralReviews / reviewAnalytics.totalReviews) * 100)
                        : 0
                      }% of all reviews
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="mr-2 h-5 w-5 text-red-600" />
                      Negative Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {reviewAnalytics.negativeReviews}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {reviewAnalytics.totalReviews > 0 
                        ? Math.round((reviewAnalytics.negativeReviews / reviewAnalytics.totalReviews) * 100)
                        : 0
                      }% of all reviews
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Reviews and Activity */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Reviews */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Recent Reviews
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.location.href = '/reviews'}
                      >
                        View All
                      </Button>
                    </CardTitle>
                    <CardDescription>
                      Latest customer feedback across all profiles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {reviewAnalytics.recentReviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviewAnalytics.recentReviews.slice(0, 5).map((review, index) => {
                          const rating = getStarRating(review.starRating)
                          const reviewerName = appManager.getReviewerDisplayName(review.reviewer)
                          const sentiment = appManager.getReviewSentiment(review.starRating)
                          
                          return (
                            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                {reviewerName.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-sm">{reviewerName}</span>
                                  <div className="flex">
                                    {renderStars(rating)}
                                  </div>
                                  <Badge 
                                    variant="outline" 
                                    className={
                                      sentiment === 'positive' ? 'text-green-600 border-green-200' :
                                      sentiment === 'neutral' ? 'text-yellow-600 border-yellow-200' :
                                      'text-red-600 border-red-200'
                                    }
                                  >
                                    {sentiment}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {review.comment}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    {appManager.formatReviewDate(review.createTime)}
                                  </span>
                                  {!review.reviewReply && (
                                    <Badge variant="outline" className="text-orange-600 border-orange-200">
                                      Needs Reply
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Recent Reviews</h3>
                        <p className="text-muted-foreground mb-4">
                          Sync your business profiles to see recent reviews.
                        </p>
                        <Button onClick={syncAllReviews} disabled={isSyncing}>
                          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                          Sync Reviews
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Clock className="mr-2 h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>
                      Latest actions and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            {getActivityIcon(activity.status)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium">{activity.action}</p>
                              <p className="text-sm text-muted-foreground">{activity.profile}</p>
                              <p className="text-xs text-muted-foreground">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Recent Activity</h3>
                        <p className="text-muted-foreground mb-4">
                          Start creating content to see activity here.
                        </p>
                        <Button onClick={() => setActiveTab('content')}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Content
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks and shortcuts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      onClick={() => setActiveTab('profiles')}
                    >
                      <Building2 className="h-6 w-6" />
                      <span>Manage Profiles</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      onClick={() => setActiveTab('content')}
                    >
                      <FileText className="h-6 w-6" />
                      <span>Create Content</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      onClick={() => window.location.href = '/reviews'}
                    >
                      <MessageSquare className="h-6 w-6" />
                      <span>View Reviews</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="h-20 flex flex-col items-center justify-center space-y-2"
                      onClick={syncAllReviews}
                      disabled={isSyncing}
                    >
                      <RefreshCw className={`h-6 w-6 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>Sync Data</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Business Profiles Page */}
          {activeTab === 'profiles' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center h-[400px]"
            >
              <Card className="w-full max-w-md text-center">
                <CardHeader>
                  <CardTitle>Business Profiles</CardTitle>
                  <CardDescription>
                    Manage your Google Business Profiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Visit the dedicated Business Profiles page to manage your locations.
                  </p>
                  <Button onClick={() => window.location.href = '/profiles'}>
                    Go to Business Profiles
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Content Hub Page */}
          {activeTab === 'content' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center h-[400px]"
            >
              <Card className="w-full max-w-md text-center">
                <CardHeader>
                  <CardTitle>Content Hub</CardTitle>
                  <CardDescription>
                    Create AI-powered content for your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Visit the dedicated Content Hub page to create and manage content.
                  </p>
                  <Button onClick={() => window.location.href = '/content'}>
                    Go to Content Hub
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Other tab content */}
          {activeTab !== 'dashboard' && activeTab !== 'profiles' && activeTab !== 'content' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center h-[400px]"
            >
              <Card className="w-full max-w-md text-center">
                <CardHeader>
                  <CardTitle className="capitalize">{activeTab}</CardTitle>
                  <CardDescription>
                    This section is under development
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Coming soon! This feature will be available in the next update.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
} 