'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Clock, 
  Calendar,
  Settings,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Zap,
  Save,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { CronScheduler, CronJob } from '@/lib/cron-scheduler'
import { useProfile } from '@/contexts/profile-context'

interface CronJobManagerProps {
  automations: any[]
}

export function CronJobManager({ automations }: CronJobManagerProps) {
  const [cronJobs, setCronJobs] = useState<CronJob[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<CronJob | null>(null)
  const [stats, setStats] = useState<any>({})
  const { profiles } = useProfile()

  // Load cron jobs on mount
  useEffect(() => {
    loadCronJobs()
    loadStats()
  }, [])

  const loadCronJobs = () => {
    const jobs = CronScheduler.getJobs()
    setCronJobs(jobs)
  }

  const loadStats = () => {
    const cronStats = CronScheduler.getStats()
    setStats(cronStats)
  }

  const handleCreateJob = () => {
    setEditingJob(null)
    setIsCreateModalOpen(true)
  }

  const handleEditJob = (job: CronJob) => {
    setEditingJob(job)
    setIsCreateModalOpen(true)
  }

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Are you sure you want to delete this cron job?')) {
      CronScheduler.deleteJob(jobId)
      loadCronJobs()
      loadStats()
    }
  }

  const handleToggleJob = (jobId: string, currentStatus: string) => {
    if (currentStatus === 'active') {
      CronScheduler.pauseJob(jobId)
    } else {
      CronScheduler.resumeJob(jobId)
    }
    loadCronJobs()
    loadStats()
  }

  const formatNextRun = (nextRun?: string) => {
    if (!nextRun) return 'Not scheduled'
    
    const date = new Date(nextRun)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffHours = Math.round(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Within 1 hour'
    if (diffHours < 24) return `In ${diffHours} hours`
    return `In ${Math.round(diffHours / 24)} days`
  }

  const getScheduleDescription = (schedule: CronJob['schedule']) => {
    switch (schedule.type) {
      case 'daily':
        return `Daily at ${schedule.time}`
      case 'hourly':
        return `Every hour at: ${schedule.hours?.join(', ')}`
      case 'weekly':
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        const days = schedule.days?.map(d => dayNames[d]).join(', ')
        return `Weekly on ${days} at ${schedule.time}`
      case 'custom':
        return `Custom: ${schedule.cron}`
      default:
        return 'Unknown schedule'
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold">{stats.totalJobs || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeJobs || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Total Runs</p>
                <p className="text-2xl font-bold">{stats.totalRuns || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats.successRate?.toFixed(1) || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cron Jobs</h2>
          <p className="text-gray-600">Schedule your Google Business Profile posts to run automatically</p>
        </div>
        <Button onClick={handleCreateJob} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Cron Job
        </Button>
      </div>

      {/* Cron Jobs List */}
      <div className="grid gap-4">
        {cronJobs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Cron Jobs Yet</h3>
              <p className="text-gray-600 mb-4">Create your first cron job to start scheduling automated posts</p>
              <Button onClick={handleCreateJob} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create First Cron Job
              </Button>
            </CardContent>
          </Card>
        ) : (
          cronJobs.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{job.name}</h3>
                        <Badge 
                          variant={job.status === 'active' ? 'default' : job.status === 'paused' ? 'secondary' : 'outline'}
                          className={
                            job.status === 'active' ? 'bg-green-100 text-green-800' :
                            job.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Schedule</p>
                          <p>{getScheduleDescription(job.schedule)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Next Run</p>
                          <p>{formatNextRun(job.stats.nextRun)}</p>
                        </div>
                        <div>
                          <p className="font-medium">Success Rate</p>
                          <p>
                            {job.stats.totalRuns > 0 
                              ? `${Math.round((job.stats.successfulRuns / job.stats.totalRuns) * 100)}%` 
                              : 'No runs yet'
                            }
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Profiles:</span> {job.profileIds.length} assigned
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Total Runs:</span> {job.stats.totalRuns} 
                          ({job.stats.successfulRuns} successful, {job.stats.failedRuns} failed)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleJob(job.id, job.status)}
                      >
                        {job.status === 'active' ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Resume
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditJob(job)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteJob(job.id)}
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

      {/* Create/Edit Modal */}
      {isCreateModalOpen && (
        <CronJobModal
          job={editingJob}
          automations={automations}
          profiles={profiles}
          onSave={(jobData) => {
            if (editingJob) {
              CronScheduler.updateJob(editingJob.id, jobData)
            } else {
              CronScheduler.createJob(jobData)
            }
            loadCronJobs()
            loadStats()
            setIsCreateModalOpen(false)
          }}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  )
}

// Cron Job Creation/Edit Modal
interface CronJobModalProps {
  job?: CronJob | null
  automations: any[]
  profiles: any[]
  onSave: (jobData: any) => void
  onClose: () => void
}

function CronJobModal({ job, automations, profiles, onSave, onClose }: CronJobModalProps) {
  const [formData, setFormData] = useState({
    name: job?.name || '',
    agentId: job?.agentId || '',
    agentName: job?.agentName || '',
    profileIds: job?.profileIds || [],
    scheduleType: job?.schedule.type || 'daily',
    scheduleTime: job?.schedule.time || '09:00',
    scheduleHours: job?.schedule.hours || [9, 12, 15, 18],
    scheduleDays: job?.schedule.days || [1, 2, 3, 4, 5],
    scheduleCron: job?.schedule.cron || '0 9 * * *',
    contentType: job?.settings.contentType || 'promotional',
    tone: job?.settings.tone || 'professional',
    includeImages: job?.settings.includeImages || true,
    maxPostsPerDay: job?.settings.maxPostsPerDay || 1
  })

  const handleSave = () => {
    if (!formData.name || !formData.agentId || formData.profileIds.length === 0) {
      alert('Please fill in all required fields')
      return
    }

    const jobData = {
      name: formData.name,
      agentId: formData.agentId,
      agentName: formData.agentName,
      profileIds: formData.profileIds,
      schedule: {
        type: formData.scheduleType as any,
        time: formData.scheduleTime,
        hours: formData.scheduleHours,
        days: formData.scheduleDays,
        cron: formData.scheduleCron,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      status: 'active' as any,
      settings: {
        contentType: formData.contentType,
        tone: formData.tone,
        includeImages: formData.includeImages,
        maxPostsPerDay: formData.maxPostsPerDay
      }
    }

    onSave(jobData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {job ? 'Edit Cron Job' : 'Create New Cron Job'}
            </h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <Label htmlFor="name">Job Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Daily Morning Posts"
              />
            </div>

            {/* Agent Selection */}
            <div>
              <Label htmlFor="agent">Automation Agent</Label>
              <Select
                value={formData.agentId}
                onValueChange={(value) => {
                  const agent = automations.find(a => a.id === value)
                  setFormData({ 
                    ...formData, 
                    agentId: value,
                    agentName: agent?.name || ''
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an automation agent" />
                </SelectTrigger>
                <SelectContent>
                  {automations.map((automation) => (
                    <SelectItem key={automation.id} value={automation.id}>
                      {automation.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Profile Selection */}
            <div>
              <Label>Google Business Profiles</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
                {profiles.map((profile) => (
                  <label key={profile.id} className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.profileIds.includes(profile.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            profileIds: [...formData.profileIds, profile.id]
                          })
                        } else {
                          setFormData({
                            ...formData,
                            profileIds: formData.profileIds.filter(id => id !== profile.id)
                          })
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span>{profile.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Schedule Type */}
            <div>
              <Label htmlFor="scheduleType">Schedule Type</Label>
              <Select
                value={formData.scheduleType}
                onValueChange={(value) => setFormData({ ...formData, scheduleType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="hourly">Multiple Times Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="custom">Custom Cron</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Schedule Details */}
            {formData.scheduleType === 'daily' && (
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.scheduleTime}
                  onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                />
              </div>
            )}

            {formData.scheduleType === 'hourly' && (
              <div>
                <Label>Hours (24-hour format)</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {Array.from({ length: 24 }, (_, i) => (
                    <label key={i} className="flex items-center space-x-1 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.scheduleHours.includes(i)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              scheduleHours: [...formData.scheduleHours, i].sort((a, b) => a - b)
                            })
                          } else {
                            setFormData({
                              ...formData,
                              scheduleHours: formData.scheduleHours.filter(h => h !== i)
                            })
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span>{i.toString().padStart(2, '0')}:00</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formData.scheduleType === 'weekly' && (
              <div className="space-y-4">
                <div>
                  <Label>Days of Week</Label>
                  <div className="flex space-x-2 mt-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                      <label key={day} className="flex items-center space-x-1 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.scheduleDays.includes(index)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                scheduleDays: [...formData.scheduleDays, index].sort()
                              })
                            } else {
                              setFormData({
                                ...formData,
                                scheduleDays: formData.scheduleDays.filter(d => d !== index)
                              })
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="weeklyTime">Time</Label>
                  <Input
                    id="weeklyTime"
                    type="time"
                    value={formData.scheduleTime}
                    onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
                  />
                </div>
              </div>
            )}

            {formData.scheduleType === 'custom' && (
              <div>
                <Label htmlFor="cron">Cron Expression</Label>
                <Input
                  id="cron"
                  value={formData.scheduleCron}
                  onChange={(e) => setFormData({ ...formData, scheduleCron: e.target.value })}
                  placeholder="0 9 * * * (every day at 9 AM)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Format: minute hour day month weekday
                </p>
              </div>
            )}

            {/* Content Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Content Settings</h3>
              
              <div>
                <Label htmlFor="contentType">Content Type</Label>
                <Select
                  value={formData.contentType}
                  onValueChange={(value) => setFormData({ ...formData, contentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="behind_scenes">Behind the Scenes</SelectItem>
                    <SelectItem value="customer_spotlight">Customer Spotlight</SelectItem>
                    <SelectItem value="tips">Tips & Advice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select
                  value={formData.tone}
                  onValueChange={(value) => setFormData({ ...formData, tone: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="includeImages"
                  checked={formData.includeImages}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeImages: checked })}
                />
                <Label htmlFor="includeImages">Include Images</Label>
              </div>

              <div>
                <Label htmlFor="maxPosts">Max Posts Per Day</Label>
                <Input
                  id="maxPosts"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxPostsPerDay}
                  onChange={(e) => setFormData({ ...formData, maxPostsPerDay: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {job ? 'Update Job' : 'Create Job'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
