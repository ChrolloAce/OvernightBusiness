'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Zap
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AutomationDashboard } from '@/components/automation-dashboard'
import { useProfile } from '@/contexts/profile-context'

interface ScheduledPost {
  id: string
  title: string
  content: string
  platform: string
  scheduledDate: string
  status: 'scheduled' | 'published' | 'failed' | 'draft'
  businessProfile: string
}

export default function SchedulerPage() {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [mounted, setMounted] = useState(false)
  const { selectedProfile, profiles } = useProfile()

  useEffect(() => {
    setMounted(true)
    // Load sample scheduled posts
    setScheduledPosts([
      {
        id: '1',
        title: 'Weekend Special Promotion',
        content: 'Join us this weekend for our special promotion! 20% off all services.',
        platform: 'Google Business Profile',
        scheduledDate: '2024-01-20T10:00:00Z',
        status: 'scheduled',
        businessProfile: 'Downtown Cafe'
      },
      {
        id: '2',
        title: 'New Product Launch',
        content: 'Excited to announce our new product line! Check it out in store.',
        platform: 'Google Business Profile',
        scheduledDate: '2024-01-18T14:30:00Z',
        status: 'published',
        businessProfile: 'Tech Solutions Inc'
      },
      {
        id: '3',
        title: 'Holiday Hours Update',
        content: 'Please note our updated holiday hours for the upcoming week.',
        platform: 'Google Business Profile',
        scheduledDate: '2024-01-22T09:00:00Z',
        status: 'draft',
        businessProfile: 'Local Bakery'
      }
    ])
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="w-4 h-4" />
      case 'published': return <CheckCircle className="w-4 h-4" />
      case 'failed': return <AlertCircle className="w-4 h-4" />
      case 'draft': return <Edit className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (!mounted) {
    return <div>Loading...</div>
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
                      <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                        Smart Scheduler
                      </h1>
                      <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 font-medium">
                        Manual scheduling & AI-powered automated posting
                      </p>
                    </div>
                  </div>
                </div>
                <Button 
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Plus className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10">Schedule New Post</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                      {scheduledPosts.filter(p => p.status === 'scheduled').length}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Scheduled</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                      {scheduledPosts.filter(p => p.status === 'published').length}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Published</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Edit className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                      {scheduledPosts.filter(p => p.status === 'draft').length}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Drafts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                      {scheduledPosts.length}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">Total Posts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Manual Scheduling and Automation */}
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Manual Scheduling</span>
              </TabsTrigger>
              <TabsTrigger value="automation" className="flex items-center space-x-2">
                <Bot className="w-4 h-4" />
                <span>AI Automation</span>
              </TabsTrigger>
            </TabsList>

            {/* Manual Scheduling Tab */}
            <TabsContent value="manual">
              <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                <CardHeader className="pb-3 lg:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <Calendar className="w-4 h-4 lg:w-5 lg:h-5" />
                    Scheduled Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 lg:space-y-4">
                    {scheduledPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl blur-sm" />
                    <div className="relative bg-white/50 dark:bg-black/20 backdrop-blur-sm rounded-xl border border-white/30 dark:border-white/20 p-3 lg:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm lg:text-base truncate">{post.title}</h3>
                            <Badge className={`${getStatusColor(post.status)} flex items-center gap-1 text-xs w-fit`}>
                              {getStatusIcon(post.status)}
                              {post.status}
                            </Badge>
                          </div>
                          <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{post.content}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(post.scheduledDate)}
                            </span>
                            <span className="hidden sm:inline">Platform: {post.platform}</span>
                            <span className="hidden sm:inline">Profile: {post.businessProfile}</span>
                          </div>
                          <div className="flex sm:hidden mt-2 space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>Platform: {post.platform}</span>
                            <span>•</span>
                            <span>Profile: {post.businessProfile}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 sm:ml-4">
                          <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="w-8 h-8 p-0">
                            {post.status === 'scheduled' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </Button>
                          <Button variant="outline" size="sm" className="w-8 h-8 p-0 text-red-600 hover:text-red-700">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Automation Tab */}
            <TabsContent value="automation">
              <AutomationDashboard 
                selectedProfile={selectedProfile}
                profiles={profiles}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
} 