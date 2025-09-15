'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Bot, 
  Calendar, 
  Clock, 
  Settings, 
  Play, 
  Pause, 
  Plus, 
  Trash2, 
  BarChart3,
  Lightbulb,
  Zap,
  Target,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { automatedContentService, AutoPostConfig, GeneratedContentItem } from '@/lib/automated-content-service'
import { SavedBusinessProfile } from '@/lib/business-profiles-storage'

interface AutomationDashboardProps {
  selectedProfile: SavedBusinessProfile | null
  profiles: SavedBusinessProfile[]
}

export function AutomationDashboard({ selectedProfile, profiles }: AutomationDashboardProps) {
  const [config, setConfig] = useState<AutoPostConfig | null>(null)
  const [stats, setStats] = useState({
    totalConfigs: 0,
    activeConfigs: 0,
    totalGenerated: 0,
    scheduledPosts: 0
  })
  const [generatedContent, setGeneratedContent] = useState<GeneratedContentItem[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    loadData()
  }, [selectedProfile])

  const loadData = () => {
    if (selectedProfile) {
      const profileConfig = automatedContentService.getConfigForBusiness(selectedProfile.googleBusinessId)
      setConfig(profileConfig || automatedContentService.createDefaultConfig(selectedProfile.googleBusinessId, selectedProfile.name))
    }
    
    setStats(automatedContentService.getStats())
    setGeneratedContent(automatedContentService.getGeneratedContent())
  }

  const saveConfig = (updatedConfig: AutoPostConfig) => {
    automatedContentService.saveAutoPostConfig(updatedConfig)
    setConfig(updatedConfig)
    loadData() // Refresh stats
  }

  const toggleAutomation = (enabled: boolean) => {
    if (!config || !selectedProfile) return
    
    const updatedConfig = { ...config, enabled }
    saveConfig(updatedConfig)
    
    if (enabled) {
      console.log('🤖 Automation enabled for:', selectedProfile.name)
    } else {
      console.log('⏸️ Automation disabled for:', selectedProfile.name)
    }
  }

  const generateTestContent = async () => {
    if (!selectedProfile || !config) return
    
    setIsGenerating(true)
    try {
      const result = await automatedContentService.generateContentForBusiness(
        selectedProfile.googleBusinessId,
        selectedProfile.name,
        selectedProfile.category
      )
      
      if (result) {
        await automatedContentService.scheduleGeneratedContent(result)
        loadData() // Refresh data
        alert('Test content generated and scheduled successfully!')
      }
    } catch (error) {
      console.error('Error generating test content:', error)
      alert('Failed to generate test content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const addCustomPrompt = () => {
    if (!config) return
    
    const newPrompt = prompt('Enter a custom content prompt:')
    if (newPrompt && newPrompt.trim()) {
      const updatedConfig = {
        ...config,
        customPrompts: [...(config.customPrompts || []), newPrompt.trim()]
      }
      saveConfig(updatedConfig)
    }
  }

  const removeCustomPrompt = (index: number) => {
    if (!config) return
    
    const updatedConfig = {
      ...config,
      customPrompts: config.customPrompts.filter((_, i) => i !== index)
    }
    saveConfig(updatedConfig)
  }

  const addPostTime = () => {
    if (!config) return
    
    const newTime = prompt('Enter post time (HH:MM format, e.g., 09:00):')
    if (newTime && /^\d{2}:\d{2}$/.test(newTime)) {
      const updatedConfig = {
        ...config,
        postTimes: [...config.postTimes, newTime]
      }
      saveConfig(updatedConfig)
    } else {
      alert('Please enter time in HH:MM format (e.g., 09:00)')
    }
  }

  const removePostTime = (time: string) => {
    if (!config) return
    
    const updatedConfig = {
      ...config,
      postTimes: config.postTimes.filter(t => t !== time)
    }
    saveConfig(updatedConfig)
  }

  const toggleContentType = (type: 'update' | 'offer' | 'event' | 'product') => {
    if (!config) return
    
    const updatedTypes = config.contentTypes.includes(type)
      ? config.contentTypes.filter(t => t !== type)
      : [...config.contentTypes, type]
    
    const updatedConfig = { ...config, contentTypes: updatedTypes }
    saveConfig(updatedConfig)
  }

  if (!selectedProfile) {
    return (
      <div className="text-center py-12">
        <Bot className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Select a business profile to configure automation</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Automation</h2>
          <p className="text-gray-600 dark:text-gray-300">Set up automated content generation and posting for {selectedProfile.name}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant={config?.enabled ? "default" : "secondary"} className="px-3 py-1">
            {config?.enabled ? "🤖 Active" : "⏸️ Disabled"}
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Automations</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.activeConfigs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Content Generated</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.totalGenerated}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Scheduled Posts</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.scheduledPosts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Profiles</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{profiles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="content">
            <Lightbulb className="w-4 h-4 mr-2" />
            Generated Content
          </TabsTrigger>
          <TabsTrigger value="overview">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Automation Settings</span>
              </CardTitle>
              <CardDescription>
                Configure when and what type of content to generate automatically
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {config && (
                <>
                  {/* Enable/Disable */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Enable Automation</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically generate and schedule content
                      </p>
                    </div>
                    <Switch
                      checked={config.enabled}
                      onCheckedChange={toggleAutomation}
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <Label>Posting Frequency</Label>
                    <Select 
                      value={config.frequency} 
                      onValueChange={(value: 'daily' | '3_times_week' | 'weekly') => {
                        saveConfig({ ...config, frequency: value })
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="3_times_week">3 times per week</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Post Times */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Posting Times</Label>
                      <Button size="sm" onClick={addPostTime}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Time
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {config.postTimes.map((time, index) => (
                        <Badge key={index} variant="outline" className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{time}</span>
                          <button 
                            onClick={() => removePostTime(time)}
                            className="ml-1 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Content Types */}
                  <div>
                    <Label className="mb-2 block">Content Types</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { type: 'update' as const, label: 'Updates', icon: Lightbulb },
                        { type: 'offer' as const, label: 'Offers', icon: Target },
                        { type: 'event' as const, label: 'Events', icon: Calendar },
                        { type: 'product' as const, label: 'Products', icon: Zap }
                      ].map(({ type, label, icon: Icon }) => (
                        <div 
                          key={type}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            config.contentTypes.includes(type) 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                          onClick={() => toggleContentType(type)}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4" />
                            <span className="font-medium">{label}</span>
                            {config.contentTypes.includes(type) && (
                              <CheckCircle className="w-4 h-4 text-green-500 ml-auto" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Custom Prompts */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Custom Prompts</Label>
                      <Button size="sm" onClick={addCustomPrompt}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Prompt
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {config.customPrompts.map((prompt, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                          <span className="flex-1 text-sm">{prompt}</span>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => removeCustomPrompt(index)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Test Generation */}
                  <div className="pt-4 border-t">
                    <Button 
                      onClick={generateTestContent}
                      disabled={isGenerating || !config.enabled}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Bot className="w-4 h-4 mr-2 animate-spin" />
                          Generating Test Content...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Generate Test Content
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generated Content Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>
                Review content that has been automatically generated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedContent.length === 0 ? (
                  <div className="text-center py-8">
                    <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">No content generated yet</p>
                  </div>
                ) : (
                  generatedContent.slice(0, 10).map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{item.postType}</Badge>
                          <Badge 
                            className={
                              item.status === 'posted' ? 'bg-green-100 text-green-800' :
                              item.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(item.generatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                        {item.content}
                      </p>
                      {item.scheduledFor && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          📅 Scheduled for: {new Date(item.scheduledFor).toLocaleString()}
                        </p>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">1</div>
                    <div>
                      <h4 className="font-medium">AI Content Generation</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Our AI creates engaging content based on your business type and custom prompts</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">2</div>
                    <div>
                      <h4 className="font-medium">Smart Scheduling</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Content is scheduled at optimal times based on your preferences</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">3</div>
                    <div>
                      <h4 className="font-medium">Automatic Posting</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Posts are automatically published to your Google Business Profile</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Post consistently (daily or 3x/week works best)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Mix content types (updates, offers, events)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Post during business hours for best engagement</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Review generated content regularly</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span>Keep your business information up to date</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
} 