'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Bot,
  Zap,
  RefreshCw,
  Bug,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  Users,
  TrendingUp,
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  Eye,
  Info
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AutomationDashboard } from '@/components/automation-dashboard'
import { useProfile } from '@/contexts/profile-context'
import { schedulingService, ScheduledPost } from '@/lib/scheduling-service'

export default function SchedulerPage() {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [mounted, setMounted] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [selectedTab, setSelectedTab] = useState('scheduled')
  const [searchQuery, setSearchQuery] = useState('')
  const { selectedProfile, profiles } = useProfile()

  // Load real scheduled posts from the scheduling service
  const loadScheduledPosts = () => {
    try {
      const posts = schedulingService.getScheduledPosts()
      const readyPosts = schedulingService.getPostsReadyForExecution()
      const upcomingPosts = schedulingService.getUpcomingPosts()
      
      setScheduledPosts(posts)
      setDebugInfo({
        totalPosts: posts.length,
        scheduledPosts: posts.filter(p => p.status === 'scheduled').length,
        publishedPosts: posts.filter(p => p.status === 'published').length,
        failedPosts: posts.filter(p => p.status === 'failed').length,
        readyToExecute: readyPosts.length,
        upcoming: upcomingPosts.length,
        lastUpdate: new Date().toLocaleTimeString()
      })
    } catch (error) {
      console.error('[Scheduler] Error loading posts:', error)
    }
  }

  useEffect(() => {
    setMounted(true)
    loadScheduledPosts()
    const interval = setInterval(loadScheduledPosts, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: ScheduledPost['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'publishing': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'published': return 'bg-green-50 text-green-700 border-green-200'
      case 'failed': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const deletePost = (postId: string) => {
    const success = schedulingService.deleteScheduledPost(postId)
    if (success) {
      loadScheduledPosts()
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (date.getTime() - now.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 24 && diffInHours > -24) {
      if (diffInHours > 0) {
        return `Tomorrow ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      } else if (diffInHours > -1) {
        return `${Math.abs(Math.floor(diffInHours * 60))} min ago`
      } else {
        return `${Math.abs(Math.floor(diffInHours))}h ago`
      }
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFilteredPosts = () => {
    let filtered = scheduledPosts

    // Filter by status based on selected tab
    switch (selectedTab) {
      case 'scheduled':
        filtered = filtered.filter(p => p.status === 'scheduled')
        break
      case 'published':
        filtered = filtered.filter(p => p.status === 'published')
        break
      case 'failed':
        filtered = filtered.filter(p => p.status === 'failed')
        break
      case 'drafts':
        filtered = filtered.filter(p => p.status === 'publishing')
        break
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.businessName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">Posts</h1>
                             <Button 
                 size="sm" 
                 className="bg-blue-600 hover:bg-blue-700 text-white"
                 onClick={() => window.location.href = '/content'}
               >
                 <Plus className="h-4 w-4 mr-2" />
                 New draft
               </Button>
               <Button 
                 size="sm" 
                 variant="outline" 
                 className="text-orange-600 border-orange-300 hover:bg-orange-50"
                 onClick={() => window.location.href = '/content'}
               >
                 Add to Queue
               </Button>
               <Button 
                 size="sm" 
                 className="bg-orange-600 hover:bg-orange-700 text-white"
                 onClick={() => window.location.href = '/content'}
               >
                 Post
               </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Manage queue
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Tabs */}
            <div className="mb-6">
              <nav className="flex space-x-8">
                {[
                  { id: 'scheduled', label: 'Scheduled', count: debugInfo.scheduledPosts },
                  { id: 'drafts', label: 'Drafts', count: 0 },
                  { id: 'published', label: 'Posted', count: debugInfo.publishedPosts },
                  { id: 'failed', label: 'Failed', count: debugInfo.failedPosts }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                        {tab.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {getFilteredPosts().length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
                  <p className="text-gray-500 mb-4">
                    {selectedTab === 'scheduled' 
                      ? "You haven't scheduled any posts yet."
                      : `No ${selectedTab} posts found.`
                    }
                  </p>
                                     <Button 
                     className="bg-blue-600 hover:bg-blue-700 text-white"
                     onClick={() => window.location.href = '/content'}
                   >
                     <Plus className="h-4 w-4 mr-2" />
                     Create your first post
                   </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredPosts().map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">
                                    {post.businessName.charAt(0)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {post.businessName}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <Badge className={`${getStatusColor(post.status)} text-xs`}>
                                    {post.status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}
                                    {post.status === 'published' && <CheckCircle className="h-3 w-3 mr-1" />}
                                    {post.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                                    {post.status === 'publishing' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                                    {post.status}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(post.scheduledDate)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <p className="text-sm text-gray-700 line-clamp-3">
                                {post.content}
                              </p>
                            </div>

                            {post.status === 'published' && (
                              <div className="flex items-center space-x-6 text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <Heart className="h-3 w-3" />
                                  <span>0</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MessageCircle className="h-3 w-3" />
                                  <span>0</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Repeat2 className="h-3 w-3" />
                                  <span>0</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Eye className="h-3 w-3" />
                                  <span>0</span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletePost(post.id)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Queue Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Scheduled</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{debugInfo.scheduledPosts || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Published</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{debugInfo.publishedPosts || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Failed</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{debugInfo.failedPosts || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Ready to post</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{debugInfo.readyToExecute || 0}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Last updated: {debugInfo.lastUpdate}</div>
                <Button
                  onClick={loadScheduledPosts}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>

            {/* AI Automation Panel */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Bot className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI Automation</h3>
              </div>
              
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="manual" className="text-sm">Manual</TabsTrigger>
                  <TabsTrigger value="automation" className="text-sm">AI Auto</TabsTrigger>
                </TabsList>
                
                <TabsContent value="manual" className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Create and schedule posts manually with AI assistance.
                  </p>
                                     <Button 
                     className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                     onClick={() => window.location.href = '/content'}
                   >
                     <Plus className="h-4 w-4 mr-2" />
                     Create Post
                   </Button>
                </TabsContent>
                
                <TabsContent value="automation" className="space-y-4">
                  <AutomationDashboard 
                    selectedProfile={selectedProfile}
                    profiles={profiles}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Scheduling Help Guide */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Info className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-blue-900">Scheduling Guide</h3>
              </div>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">📋 Quick Checklist:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-blue-800">Go to Content Hub</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-blue-800">Click "Create Content"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-blue-800">Generate content with AI</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-blue-800">Choose "Schedule for Later"</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-blue-800">Posts appear here automatically</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-blue-200 pt-4">
                  <h4 className="font-medium text-blue-900 mb-2">🔧 Troubleshooting:</h4>
                  <div className="space-y-1 text-blue-700">
                    <p>• Posts not appearing? Check your Google authentication</p>
                    <p>• Posts not publishing? Verify your business profile access</p>
                    <p>• Time zone issues? Use your local time when scheduling</p>
                    <p>• Still having issues? Check the browser console for errors</p>
                  </div>
                </div>

                <div className="border-t border-blue-200 pt-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Pro Tips:</h4>
                  <div className="space-y-1 text-blue-700">
                    <p>• Schedule posts at least 30 minutes in advance</p>
                    <p>• Posts auto-publish every 60 seconds when due</p>
                    <p>• Keep this tab open for best performance</p>
                    <p>• Check "Ready to post" count above for pending posts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 