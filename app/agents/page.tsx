'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Plus, 
  Settings, 
  Play,
  Pause,
  Edit,
  Trash2,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Bot,
  Globe,
  RefreshCw,
  Eye,
  Copy,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useProfile } from '@/contexts/profile-context'
import { GoogleAuthButton } from '@/components/google-auth-button'

interface Automation {
  id: string
  name: string
  type: 'google_posts' | 'review_responses' | 'content_creation'
  status: 'active' | 'paused' | 'draft'
  assignedProfiles: string[]
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    days?: string[]
  }
  settings: {
    contentType: string
    tone: string
    includeImages: boolean
    maxPosts: number
  }
  stats: {
    totalPosts: number
    lastRun: string
    nextRun: string
    successRate: number
  }
  createdAt: string
}

export default function AgentDashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [automations, setAutomations] = useState<Automation[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    type: 'google_posts' as const,
    assignedProfiles: [] as string[],
    frequency: 'weekly' as const,
    time: '09:00',
    contentType: 'business_updates',
    tone: 'professional'
  })
  const { profiles } = useProfile()

  useEffect(() => {
    setMounted(true)
    loadAutomations()
  }, [])

  const handleAuthChange = (authenticated: boolean) => {
    setIsAuthenticated(authenticated)
  }

  const loadAutomations = () => {
    try {
      const savedAutomations = localStorage.getItem('ai_automations')
      if (savedAutomations) {
        setAutomations(JSON.parse(savedAutomations))
      } else {
        // Create default Google automation
        const defaultAutomation: Automation = {
          id: `automation_${Date.now()}`,
          name: 'Google Business Updates',
          type: 'google_posts',
          status: 'draft',
          assignedProfiles: [],
          schedule: {
            frequency: 'weekly',
            time: '09:00',
            days: ['monday', 'wednesday', 'friday']
          },
          settings: {
            contentType: 'business_updates',
            tone: 'professional',
            includeImages: true,
            maxPosts: 3
          },
          stats: {
            totalPosts: 0,
            lastRun: '',
            nextRun: '',
            successRate: 0
          },
          createdAt: new Date().toISOString()
        }
        setAutomations([defaultAutomation])
        localStorage.setItem('ai_automations', JSON.stringify([defaultAutomation]))
      }
    } catch (error) {
      console.error('Error loading automations:', error)
    }
  }

  const handleCreateAutomation = () => {
    const automation: Automation = {
      id: `automation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newAutomation.name || 'New Automation',
      type: newAutomation.type,
      status: 'draft',
      assignedProfiles: newAutomation.assignedProfiles,
      schedule: {
        frequency: newAutomation.frequency,
        time: newAutomation.time,
        days: newAutomation.frequency === 'weekly' ? ['monday', 'wednesday', 'friday'] : undefined
      },
      settings: {
        contentType: newAutomation.contentType,
        tone: newAutomation.tone,
        includeImages: true,
        maxPosts: 3
      },
      stats: {
        totalPosts: 0,
        lastRun: '',
        nextRun: '',
        successRate: 0
      },
      createdAt: new Date().toISOString()
    }

    const updatedAutomations = [...automations, automation]
    setAutomations(updatedAutomations)
    localStorage.setItem('ai_automations', JSON.stringify(updatedAutomations))
    
    setIsCreating(false)
    setNewAutomation({
      name: '',
      type: 'google_posts',
      assignedProfiles: [],
      frequency: 'weekly',
      time: '09:00',
      contentType: 'business_updates',
      tone: 'professional'
    })
  }

  const toggleAutomationStatus = (automationId: string) => {
    const updatedAutomations = automations.map(automation =>
      automation.id === automationId
        ? { 
            ...automation, 
            status: (automation.status === 'active' ? 'paused' : 'active') as 'active' | 'paused' | 'draft'
          }
        : automation
    )
    setAutomations(updatedAutomations)
    localStorage.setItem('ai_automations', JSON.stringify(updatedAutomations))
  }

  const deleteAutomation = (automationId: string) => {
    if (confirm('Delete this automation?')) {
      const updatedAutomations = automations.filter(automation => automation.id !== automationId)
      setAutomations(updatedAutomations)
      localStorage.setItem('ai_automations', JSON.stringify(updatedAutomations))
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Sparkles className="mr-3 h-8 w-8 text-purple-600" />
            Agent Dashboard
          </h1>
          <p className="text-gray-600 mt-1">AI-powered automations for your business</p>
        </div>
        <div className="flex items-center space-x-3">
          <GoogleAuthButton 
            onAuthChange={handleAuthChange}
            size="sm"
          />
          <Button 
            onClick={() => setIsCreating(true)}
            disabled={!isAuthenticated}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </div>
      </div>

      {/* Authentication Warning */}
      {!isAuthenticated && (
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-orange-900">Google Authentication Required</h4>
                <p className="text-sm text-orange-700 mt-1">
                  To use AI automations for Google Business Profile posts, you need to authenticate with Google. 
                  Your tokens may have expired and need to be refreshed.
                </p>
                <div className="mt-3">
                  <GoogleAuthButton 
                    onAuthChange={handleAuthChange}
                    size="sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Active Agents</p>
                <p className="text-2xl font-bold text-gray-900">
                  {automations.filter(a => a.status === 'active').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Bot className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Posts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {automations.reduce((sum, a) => sum + a.stats.totalPosts, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {automations.length > 0 
                    ? Math.round(automations.reduce((sum, a) => sum + a.stats.successRate, 0) / automations.length)
                    : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${isAuthenticated ? 'from-green-50 to-emerald-50 border-green-200' : 'from-red-50 to-orange-50 border-red-200'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  Google Auth
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {isAuthenticated ? 'Connected' : 'Required'}
                </p>
              </div>
              <div className={`w-12 h-12 ${isAuthenticated ? 'bg-green-100' : 'bg-red-100'} rounded-xl flex items-center justify-center`}>
                {isAuthenticated ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create New Automation */}
      {isCreating && (
        <Card className="bg-white shadow-sm border-purple-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <Plus className="mr-2 h-5 w-5 text-purple-600" />
              Create New Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Agent Name</label>
                  <Input
                    placeholder="Google Content Creator"
                    value={newAutomation.name}
                    onChange={(e) => setNewAutomation({ ...newAutomation, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Automation Type</label>
                  <Select 
                    value={newAutomation.type} 
                    onValueChange={(value: any) => setNewAutomation({ ...newAutomation, type: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google_posts">Google Business Posts</SelectItem>
                      <SelectItem value="review_responses">Review Responses</SelectItem>
                      <SelectItem value="content_creation">Content Creation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Assign Google Profiles</label>
                <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                  {profiles.map((profile) => (
                    <div key={profile.id} className="flex items-center space-x-3 p-2 border border-gray-200 rounded-lg">
                      <input
                        type="checkbox"
                        id={profile.id}
                        checked={newAutomation.assignedProfiles.includes(profile.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAutomation({
                              ...newAutomation,
                              assignedProfiles: [...newAutomation.assignedProfiles, profile.id]
                            })
                          } else {
                            setNewAutomation({
                              ...newAutomation,
                              assignedProfiles: newAutomation.assignedProfiles.filter(id => id !== profile.id)
                            })
                          }
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor={profile.id} className="flex-1 text-sm text-gray-900 cursor-pointer">
                        {profile.name}
                      </label>
                      <Badge variant="secondary" className="text-xs">
                        {profile.category}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">Frequency</label>
                  <Select 
                    value={newAutomation.frequency} 
                    onValueChange={(value: any) => setNewAutomation({ ...newAutomation, frequency: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Time</label>
                  <Input
                    type="time"
                    value={newAutomation.time}
                    onChange={(e) => setNewAutomation({ ...newAutomation, time: e.target.value })}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Content Tone</label>
                  <Select 
                    value={newAutomation.tone} 
                    onValueChange={(value) => setNewAutomation({ ...newAutomation, tone: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsCreating(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateAutomation}
                  disabled={!newAutomation.name || newAutomation.assignedProfiles.length === 0}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Create Agent
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automations List */}
      <div className="space-y-4">
        {automations.length === 0 ? (
          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="p-12 text-center">
              <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents created</h3>
              <p className="text-gray-600 mb-4">
                Create your first AI agent to automate Google Business Profile posts
              </p>
              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Agent
              </Button>
            </CardContent>
          </Card>
        ) : (
          automations.map((automation, index) => (
            <motion.div
              key={automation.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white shadow-sm border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Sparkles className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{automation.name}</h3>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(automation.status)}
                            <Badge className={getStatusColor(automation.status)} variant="outline">
                              {automation.status}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {automation.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mb-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Schedule</p>
                          <p className="text-sm text-gray-900 mt-1">
                            {automation.schedule.frequency} at {automation.schedule.time}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Profiles</p>
                          <p className="text-sm text-gray-900 mt-1">
                            {automation.assignedProfiles.length} assigned
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Success Rate</p>
                          <p className="text-sm text-gray-900 mt-1">
                            {automation.stats.successRate}%
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {automation.assignedProfiles.map((profileId) => {
                          const profile = profiles.find(p => p.id === profileId)
                          return profile ? (
                            <Badge key={profileId} variant="outline" className="text-xs">
                              <Building2 className="mr-1 h-3 w-3" />
                              {profile.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          if (!isAuthenticated) {
                            alert('Please connect your Google account first to run automations.')
                            return
                          }
                          
                          try {
                            const { AutomationService } = await import('@/lib/automation-service')
                            const service = AutomationService.getInstance()
                            const success = await service.executeAutomationNow(automation.id)
                            if (success) {
                              alert('Automation executed successfully! Check your Google Business Profiles.')
                              loadAutomations() // Refresh to show updated stats
                            } else {
                              alert('Failed to execute automation. Check console for details.')
                            }
                          } catch (error) {
                            console.error('Error running automation:', error)
                            alert('Error running automation. Check console for details.')
                          }
                        }}
                        disabled={!isAuthenticated}
                        className={`${isAuthenticated ? 'text-purple-600 hover:text-purple-700' : 'text-gray-400'}`}
                        title={isAuthenticated ? "Run automation now" : "Connect Google account to run automations"}
                      >
                        <Zap className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAutomationStatus(automation.id)}
                        className={automation.status === 'active' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {automation.status === 'active' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAutomation(automation.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Google Automation Template */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center">
            <Zap className="mr-2 h-5 w-5 text-purple-600" />
            Google Business Automation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <h4 className="font-medium text-gray-900 mb-2">How it works:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">1</div>
                  <span>AI analyzes your business profiles and recent activity</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">2</div>
                  <span>ChatGPT generates relevant, engaging content</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">3</div>
                  <span>Posts automatically published to assigned Google profiles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-medium text-purple-600">4</div>
                  <span>Analytics and performance tracking provided</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Ready to automate your Google Business posts?</p>
                <p className="text-xs text-gray-600">Create an agent to get started with AI-powered content creation</p>
              </div>
              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Create Google Agent
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
