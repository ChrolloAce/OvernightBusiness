'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  Play, 
  Pause,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  MoreHorizontal,
  ChevronDown,
  Save,
  X,
  Wand2,
  Send,
  CalendarDays,
  Timer,
  Archive,
  TrendingUp,
  Users,
  Eye,
  MessageSquare,
  Heart,
  Repeat2,
  Share,
  Wifi,
  WifiOff,
  Zap
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProfile } from '@/contexts/profile-context'
import { schedulingService, ScheduledPost } from '@/lib/scheduling-service'
import { GoogleAuthService } from '@/lib/google-auth'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated: () => void
  selectedProfile: any
}

function CreatePostModal({ isOpen, onClose, onPostCreated, selectedProfile }: CreatePostModalProps) {
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState<'update' | 'offer' | 'event' | 'product'>('update')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isScheduling, setIsScheduling] = useState(false)

  const generateContent = async () => {
    if (!selectedProfile) return
    
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Create a ${postType} post for ${selectedProfile.name}`,
          businessName: selectedProfile.name,
          businessType: selectedProfile.category,
          postType
        })
      })

      const data = await response.json()
      if (data.content) {
        setContent(data.content)
      }
    } catch (error) {
      console.error('Error generating content:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const schedulePost = async () => {
    if (!content || !scheduledDate || !scheduledTime || !selectedProfile) return

    setIsScheduling(true)
    try {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
      
      schedulingService.schedulePost({
        businessProfileId: selectedProfile.googleBusinessId,
        businessName: selectedProfile.name,
        content,
        postType,
        status: 'scheduled',
        scheduledDate: scheduledDateTime.toISOString()
      })

      onPostCreated()
      onClose()
      setContent('')
      setScheduledDate('')
      setScheduledTime('')
    } catch (error) {
      console.error('Error scheduling post:', error)
    } finally {
      setIsScheduling(false)
    }
  }

  const postNow = async () => {
    if (!content || !selectedProfile) return

    setIsScheduling(true)
    try {
      const googleAuth = GoogleAuthService.getInstance()
      const accessToken = await googleAuth.getValidAccessToken()

      const response = await fetch('/api/google-business/local-posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          businessProfileId: selectedProfile.googleBusinessId,
          content,
          postType
        })
      })

      if (response.ok) {
        onPostCreated()
        onClose()
        setContent('')
      }
    } catch (error) {
      console.error('Error posting:', error)
    } finally {
      setIsScheduling(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create Post</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Post Type</Label>
              <Select value={postType} onValueChange={(value: any) => setPostType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>&nbsp;</Label>
              <Button onClick={generateContent} disabled={isGenerating} className="w-full">
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                Generate with AI
              </Button>
            </div>
          </div>

          <div>
            <Label>Content</Label>
            <textarea 
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
              placeholder="Write your post content or generate with AI..."
              className="w-full min-h-32 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <Label>Time</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={postNow} disabled={!content || isScheduling} className="flex-1">
              {isScheduling ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Post Now
            </Button>
            <Button 
              onClick={schedulePost} 
              disabled={!content || !scheduledDate || !scheduledTime || isScheduling}
              variant="outline"
              className="flex-1"
            >
              {isScheduling ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Calendar className="h-4 w-4 mr-2" />
              )}
              Schedule
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              💡 Scheduled posts will be sent automatically by our server, even when your browser is closed!
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Bulk Schedule Modal Component
interface BulkScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onPostsCreated: () => void
  selectedProfile: any
}

function BulkScheduleModal({ isOpen, onClose, onPostsCreated, selectedProfile }: BulkScheduleModalProps) {
  const [postCount, setPostCount] = useState(5)
  const [startDate, setStartDate] = useState('')
  const [timeSpacing, setTimeSpacing] = useState('daily') // daily, every2days, weekly
  const [postType, setPostType] = useState<'update' | 'offer' | 'event' | 'product'>('update')
  const [isGenerating, setIsGenerating] = useState(false)
  const [seoTopics, setSeoTopics] = useState('')

  useEffect(() => {
    if (isOpen) {
      // Set default start date to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setStartDate(tomorrow.toISOString().split('T')[0])
    }
  }, [isOpen])

  const generateBulkPosts = async () => {
    if (!selectedProfile || !startDate) return

    setIsGenerating(true)
    try {
      const posts = []
      const businessName = selectedProfile.name
      
      // SEO-focused post topics
      const seoPostTopics = seoTopics ? seoTopics.split(',').map(t => t.trim()) : [
        `Special offers at ${businessName}`,
        `Why choose ${businessName} for your needs`,
        `Behind the scenes at ${businessName}`,
        `Customer success stories from ${businessName}`,
        `Tips and advice from ${businessName} experts`,
        `What's new at ${businessName} this month`,
        `The ${businessName} difference explained`,
        `Local community involvement by ${businessName}`,
        `Seasonal services at ${businessName}`,
        `Professional expertise at ${businessName}`
      ]

      for (let i = 0; i < postCount; i++) {
        // Calculate schedule date
        const scheduleDate = new Date(startDate)
        
        switch (timeSpacing) {
          case 'daily':
            scheduleDate.setDate(scheduleDate.getDate() + i)
            break
          case 'every2days':
            scheduleDate.setDate(scheduleDate.getDate() + (i * 2))
            break
          case 'weekly':
            scheduleDate.setDate(scheduleDate.getDate() + (i * 7))
            break
        }

        // Random time between 9 AM and 5 PM for better engagement
        const hour = 9 + Math.floor(Math.random() * 8)
        const minute = Math.floor(Math.random() * 60)
        scheduleDate.setHours(hour, minute, 0, 0)

        // Generate SEO-focused content
        const topic = seoPostTopics[i % seoPostTopics.length]
        const seoContent = await generateSEOContent(businessName, topic)

        posts.push({
          content: seoContent,
          scheduledDate: scheduleDate.toISOString(),
          postType
        })
      }

      // Schedule all posts
      for (const post of posts) {
        await schedulingService.schedulePost({
          id: `bulk-${Date.now()}-${Math.random()}`,
          businessProfileId: selectedProfile.googleBusinessId,
          businessName: selectedProfile.name,
          content: post.content,
          postType: post.postType,
          status: 'scheduled',
          scheduledDate: post.scheduledDate
        })
      }

      onPostsCreated()
      onClose()
      
      // Reset form
      setPostCount(5)
      setSeoTopics('')
      
    } catch (error) {
      console.error('Error generating bulk posts:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateSEOContent = async (businessName: string, topic: string): Promise<string> => {
    // Simple SEO-optimized content generation
    const seoTemplates = [
      `🌟 ${topic}! At ${businessName}, we're committed to excellence. Contact us today to learn more about our services. #${businessName.replace(/\s+/g, '')} #LocalBusiness #Quality`,
      `✨ Discover what makes ${businessName} special! ${topic}. We're here to serve our community with dedication and expertise. #CommunityFirst #${businessName.replace(/\s+/g, '')}`,
      `💼 ${topic}. ${businessName} has been proudly serving our customers with professional service and competitive prices. Get in touch! #Professional #${businessName.replace(/\s+/g, '')}`,
      `🎯 ${topic}. Trust ${businessName} for reliable, high-quality service. We're locally owned and operated. Call us today! #LocallyOwned #Trusted #${businessName.replace(/\s+/g, '')}`,
      `🏆 ${topic}. At ${businessName}, customer satisfaction is our top priority. Experience the difference quality makes! #CustomerFirst #Excellence #${businessName.replace(/\s+/g, '')}`
    ]
    
    return seoTemplates[Math.floor(Math.random() * seoTemplates.length)]
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-lg w-full max-w-md"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bulk Schedule SEO Posts</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Number of Posts */}
            <div>
              <Label htmlFor="postCount">Number of Posts</Label>
              <Input
                id="postCount"
                type="number"
                min="1"
                max="30"
                value={postCount}
                onChange={(e) => setPostCount(parseInt(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Generate 1-30 posts at once</p>
            </div>

            {/* Start Date */}
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Time Spacing */}
            <div>
              <Label>Posting Frequency</Label>
              <Select value={timeSpacing} onValueChange={setTimeSpacing}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="every2days">Every 2 Days</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Custom Topics (Optional) */}
            <div>
              <Label htmlFor="seoTopics">Custom Topics (Optional)</Label>
              <textarea
                id="seoTopics"
                placeholder="Enter topics separated by commas, e.g. 'Holiday specials, New services, Customer testimonials'"
                value={seoTopics}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSeoTopics(e.target.value)}
                className="mt-1 h-20 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Leave blank for auto-generated SEO topics</p>
            </div>

            {/* Post Type */}
            <div>
              <Label>Post Type</Label>
              <Select value={postType} onValueChange={setPostType}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="update">Standard Post</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="offer">Offer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={generateBulkPosts} 
              disabled={!selectedProfile || !startDate || isGenerating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              Generate {postCount} Posts
            </Button>
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700">
              💡 Posts will be automatically generated with SEO-optimized content and scheduled at random times during business hours for maximum engagement.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function SchedulerPage() {
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [mounted, setMounted] = useState(false)
  const [selectedTab, setSelectedTab] = useState('scheduled')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const { selectedProfile, profiles } = useProfile()

  // Server sync state
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<'success' | 'error' | 'pending' | null>(null)

  const loadScheduledPosts = () => {
    try {
      const posts = schedulingService.getScheduledPosts()
      setScheduledPosts(posts)
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
    schedulingService.deleteScheduledPost(postId)
    loadScheduledPosts()
  }

  const startEditing = (post: ScheduledPost) => {
    setEditingPost(post.id)
    setEditContent(post.content)
    const date = new Date(post.scheduledDate)
    setEditDate(date.toISOString().split('T')[0])
    setEditTime(date.toTimeString().slice(0, 5))
  }

  const saveEdit = () => {
    if (!editingPost || !editDate || !editTime) return
    
    const newDateTime = new Date(`${editDate}T${editTime}`)
    schedulingService.updateScheduledPost(editingPost, {
      content: editContent,
      scheduledDate: newDateTime.toISOString()
    })
    
    setEditingPost(null)
    loadScheduledPosts()
  }

  const cancelEdit = () => {
    setEditingPost(null)
    setEditContent('')
    setEditDate('')
    setEditTime('')
  }

  // Manual server sync functions
  const handleManualSync = async () => {
    setIsSyncing(true)
    setSyncStatus('pending')
    
    try {
      const success = await schedulingService.forceSyncToServer()
      if (success) {
        setSyncStatus('success')
        setLastSyncTime(new Date().toLocaleTimeString())
      } else {
        setSyncStatus('error')
      }
    } catch (error) {
      setSyncStatus('error')
      console.error('Manual sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleTriggerServerCheck = async () => {
    setIsSyncing(true)
    
    try {
      const result = await schedulingService.triggerServerCheck()
      if (result && result.success) {
        setSyncStatus('success')
        setLastSyncTime(new Date().toLocaleTimeString())
        // Refresh posts to see any status changes
        loadScheduledPosts()
      } else {
        setSyncStatus('error')
      }
    } catch (error) {
      setSyncStatus('error')
      console.error('Server check failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return `Today ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getFilteredPosts = () => {
    let filtered = scheduledPosts

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
    }

    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.businessName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered.sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
  }

  const groupPostsByDate = (posts: ScheduledPost[]) => {
    const groups: { [key: string]: ScheduledPost[] } = {}
    
    posts.forEach(post => {
      const date = new Date(post.scheduledDate)
      const dateKey = date.toDateString()
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(post)
    })
    
    return groups
  }

  if (!mounted) {
    return <div className="flex items-center justify-center min-h-screen">
      <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  }

  const filteredPosts = getFilteredPosts()
  const groupedPosts = groupPostsByDate(filteredPosts)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">Posts</h1>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {filteredPosts.length} {selectedTab}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-3">
          <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => setShowCreateModal(true)} disabled={!selectedProfile}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
              <Button onClick={() => setShowBulkModal(true)} disabled={!selectedProfile} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                <Zap className="h-4 w-4 mr-2" />
                Bulk Schedule
              </Button>
              <Button variant="outline" onClick={loadScheduledPosts}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
                    </div>

          {/* Tabs */}
          <div className="mt-4">
            <nav className="flex space-x-8">
              {[
                { id: 'scheduled', label: 'Scheduled', count: scheduledPosts.filter(p => p.status === 'scheduled').length },
                { id: 'published', label: 'Published', count: scheduledPosts.filter(p => p.status === 'published').length },
                { id: 'failed', label: 'Failed', count: scheduledPosts.filter(p => p.status === 'failed').length }
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
                  </div>
                </div>

      {/* Server Sync Status */}
      <div className="bg-blue-50 border-b border-blue-200">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  syncStatus === 'success' ? 'bg-green-500' : 
                  syncStatus === 'error' ? 'bg-red-500' : 
                  syncStatus === 'pending' ? 'bg-yellow-500 animate-pulse' : 'bg-gray-400'
                }`} />
                <span className="text-sm font-medium text-blue-900">
                  Server Sync Status
                </span>
              </div>
              {lastSyncTime && (
                <span className="text-xs text-blue-600">
                  Last synced: {lastSyncTime}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                onClick={handleManualSync}
                disabled={isSyncing}
                size="sm"
                variant="outline"
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                {isSyncing ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Sync to Server
              </Button>
                <Button 
                onClick={handleTriggerServerCheck}
                disabled={isSyncing}
                size="sm"
                variant="outline"
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
              >
                {isSyncing ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Send className="h-3 w-3 mr-1" />
                )}
                Check Server
                </Button>
              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                🤖 Auto-sync every 5min
              </div>
            </div>
          </div>
                  </div>
                </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {Object.keys(groupedPosts).length === 0 ? (
          <div className="text-center py-16">
            <CalendarDays className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-500 mb-6">
              {selectedTab === 'scheduled' 
                ? "Schedule your first post to get started"
                : `No ${selectedTab} posts found`
              }
            </p>
            <Button onClick={() => setShowCreateModal(true)} disabled={!selectedProfile}>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
                  </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedPosts).map(([dateKey, posts]) => (
              <div key={dateKey}>
                <div className="flex items-center space-x-3 mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {new Date(dateKey).toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </h2>
                  <div className="h-px bg-gray-200 flex-1" />
                  <Badge variant="secondary" className="text-xs">
                    {posts.length} post{posts.length !== 1 ? 's' : ''}
                  </Badge>
                </div>

                <div className="grid gap-4">
                  {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="p-4">
                                                 {editingPost === post.id ? (
                           <div className="space-y-4">
                             <textarea
                               value={editContent}
                               onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
                               className="w-full min-h-24 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                             />
                            <div className="grid grid-cols-2 gap-3">
                              <Input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                              />
                              <Input
                                type="time"
                                value={editTime}
                                onChange={(e) => setEditTime(e.target.value)}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button onClick={saveEdit} size="sm">
                                <Save className="h-4 w-4 mr-2" />
                                Save
                              </Button>
                              <Button onClick={cancelEdit} variant="outline" size="sm">
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">
                                    {post.businessName.charAt(0)}
                                  </span>
                                </div>
                        <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {post.businessName}
                                    </p>
                                    <Badge className={`${getStatusColor(post.status)} text-xs`}>
                                      {post.status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}
                                      {post.status === 'published' && <CheckCircle className="h-3 w-3 mr-1" />}
                                      {post.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                                      {post.status === 'publishing' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                              {post.status}
                            </Badge>
                          </div>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Timer className="h-3 w-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">
                              {formatDate(post.scheduledDate)}
                            </span>
                                    <Badge variant="outline" className="text-xs">
                                      {post.postType}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                                <p className="text-sm text-gray-700 leading-relaxed">
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
                                    <MessageSquare className="h-3 w-3" />
                                    <span>0</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Share className="h-3 w-3" />
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
                              {post.status === 'scheduled' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditing(post)}
                                  className="text-gray-400 hover:text-blue-500"
                                >
                                  <Edit3 className="h-4 w-4" />
                          </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deletePost(post.id)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                          </div>
                        )}
                    </div>
                  </motion.div>
                ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={loadScheduledPosts}
        selectedProfile={selectedProfile}
      />

      <BulkScheduleModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onPostsCreated={loadScheduledPosts}
        selectedProfile={selectedProfile}
      />
    </div>
  )
} 