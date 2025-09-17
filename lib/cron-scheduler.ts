// Cron Job Scheduler for Google Business Profile Automation
import { GoogleAuthService } from './google-auth'

export interface CronJob {
  id: string
  name: string
  agentId: string
  agentName: string
  profileIds: string[]
  schedule: {
    type: 'daily' | 'hourly' | 'weekly' | 'custom'
    time?: string // HH:MM format for daily
    hours?: number[] // Hours for hourly (0-23)
    days?: number[] // Days for weekly (0-6, 0=Sunday)
    cron?: string // Custom cron expression
    timezone: string
  }
  status: 'active' | 'paused' | 'draft'
  settings: {
    contentType: string
    tone: string
    includeImages: boolean
    maxPostsPerDay: number
  }
  stats: {
    totalRuns: number
    successfulRuns: number
    failedRuns: number
    lastRun?: string
    nextRun?: string
  }
  createdAt: string
  updatedAt: string
}

export class CronScheduler {
  private static readonly STORAGE_KEY = 'overnight_biz_cron_jobs'
  private static jobs: CronJob[] = []
  private static intervalId: NodeJS.Timeout | null = null
  private static isRunning = false

  // Initialize the cron scheduler
  static initialize() {
    if (typeof window === 'undefined') return
    
    this.loadJobs()
    this.startScheduler()
    console.log('[CronScheduler] Initialized with', this.jobs.length, 'jobs')
  }

  // Load jobs from localStorage
  static loadJobs(): CronJob[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        this.jobs = JSON.parse(stored)
        // Update next run times
        this.jobs.forEach(job => this.updateNextRunTime(job))
        this.saveJobs()
      }
    } catch (error) {
      console.error('[CronScheduler] Error loading jobs:', error)
      this.jobs = []
    }
    
    return this.jobs
  }

  // Save jobs to localStorage
  static saveJobs() {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.jobs))
    } catch (error) {
      console.error('[CronScheduler] Error saving jobs:', error)
    }
  }

  // Create a new cron job
  static createJob(jobData: Omit<CronJob, 'id' | 'stats' | 'createdAt' | 'updatedAt'>): CronJob {
    const job: CronJob = {
      ...jobData,
      id: `cron_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      stats: {
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.updateNextRunTime(job)
    this.jobs.push(job)
    this.saveJobs()

    console.log('[CronScheduler] Created new job:', job.name)
    return job
  }

  // Update an existing cron job
  static updateJob(jobId: string, updates: Partial<CronJob>): CronJob | null {
    const jobIndex = this.jobs.findIndex(job => job.id === jobId)
    if (jobIndex === -1) return null

    this.jobs[jobIndex] = {
      ...this.jobs[jobIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.updateNextRunTime(this.jobs[jobIndex])
    this.saveJobs()

    console.log('[CronScheduler] Updated job:', this.jobs[jobIndex].name)
    return this.jobs[jobIndex]
  }

  // Delete a cron job
  static deleteJob(jobId: string): boolean {
    const jobIndex = this.jobs.findIndex(job => job.id === jobId)
    if (jobIndex === -1) return false

    const job = this.jobs[jobIndex]
    this.jobs.splice(jobIndex, 1)
    this.saveJobs()

    console.log('[CronScheduler] Deleted job:', job.name)
    return true
  }

  // Get all cron jobs
  static getJobs(): CronJob[] {
    return this.jobs
  }

  // Get a specific cron job
  static getJob(jobId: string): CronJob | null {
    return this.jobs.find(job => job.id === jobId) || null
  }

  // Pause a cron job
  static pauseJob(jobId: string): boolean {
    const job = this.jobs.find(job => job.id === jobId)
    if (!job) return false

    job.status = 'paused'
    job.updatedAt = new Date().toISOString()
    this.saveJobs()

    console.log('[CronScheduler] Paused job:', job.name)
    return true
  }

  // Resume a cron job
  static resumeJob(jobId: string): boolean {
    const job = this.jobs.find(job => job.id === jobId)
    if (!job) return false

    job.status = 'active'
    job.updatedAt = new Date().toISOString()
    this.updateNextRunTime(job)
    this.saveJobs()

    console.log('[CronScheduler] Resumed job:', job.name)
    return true
  }

  // Calculate next run time for a job
  static updateNextRunTime(job: CronJob) {
    if (job.status !== 'active') {
      job.stats.nextRun = undefined
      return
    }

    const now = new Date()
    let nextRun: Date

    switch (job.schedule.type) {
      case 'daily':
        nextRun = this.getNextDailyRun(now, job.schedule.time || '09:00')
        break
      case 'hourly':
        nextRun = this.getNextHourlyRun(now, job.schedule.hours || [9, 12, 15, 18])
        break
      case 'weekly':
        nextRun = this.getNextWeeklyRun(now, job.schedule.days || [1, 3, 5], job.schedule.time || '09:00')
        break
      case 'custom':
        nextRun = this.getNextCustomRun(now, job.schedule.cron || '0 9 * * *')
        break
      default:
        nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Default to 24 hours
    }

    job.stats.nextRun = nextRun.toISOString()
  }

  // Get next daily run time
  private static getNextDailyRun(now: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number)
    const nextRun = new Date(now)
    nextRun.setHours(hours, minutes, 0, 0)

    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1)
    }

    return nextRun
  }

  // Get next hourly run time
  private static getNextHourlyRun(now: Date, hours: number[]): Date {
    const currentHour = now.getHours()
    const nextHour = hours.find(h => h > currentHour)

    const nextRun = new Date(now)
    if (nextHour !== undefined) {
      nextRun.setHours(nextHour, 0, 0, 0)
    } else {
      // Next day, first hour
      nextRun.setDate(nextRun.getDate() + 1)
      nextRun.setHours(hours[0], 0, 0, 0)
    }

    return nextRun
  }

  // Get next weekly run time
  private static getNextWeeklyRun(now: Date, days: number[], time: string): Date {
    const [hours, minutes] = time.split(':').map(Number)
    const currentDay = now.getDay()
    const nextDay = days.find(d => d > currentDay) || days[0]

    const nextRun = new Date(now)
    nextRun.setHours(hours, minutes, 0, 0)

    if (nextDay > currentDay || (nextDay === currentDay && nextRun > now)) {
      nextRun.setDate(nextRun.getDate() + (nextDay - currentDay))
    } else {
      nextRun.setDate(nextRun.getDate() + (7 - currentDay + nextDay))
    }

    return nextRun
  }

  // Get next custom cron run time (simplified)
  private static getNextCustomRun(now: Date, cron: string): Date {
    // For now, default to 24 hours - would need a proper cron parser for full functionality
    return new Date(now.getTime() + 24 * 60 * 60 * 1000)
  }

  // Start the scheduler
  static startScheduler() {
    if (this.isRunning) return

    this.isRunning = true
    console.log('[CronScheduler] Starting scheduler...')

    // Check every minute for jobs to run
    this.intervalId = setInterval(() => {
      this.checkAndRunJobs()
    }, 60000) // Check every minute

    // Also check immediately
    setTimeout(() => this.checkAndRunJobs(), 1000)
  }

  // Stop the scheduler
  static stopScheduler() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('[CronScheduler] Stopped scheduler')
  }

  // Check and run due jobs
  private static async checkAndRunJobs() {
    const now = new Date()
    const dueJobs = this.jobs.filter(job => 
      job.status === 'active' && 
      job.stats.nextRun && 
      new Date(job.stats.nextRun) <= now
    )

    if (dueJobs.length > 0) {
      console.log(`[CronScheduler] Found ${dueJobs.length} jobs to run`)
    }

    for (const job of dueJobs) {
      await this.executeJob(job)
    }
  }

  // Execute a cron job
  private static async executeJob(job: CronJob) {
    console.log(`[CronScheduler] Executing job: ${job.name}`)

    try {
      // Check if user is authenticated
      const authService = GoogleAuthService.getInstance()
      if (!authService.isAuthenticated()) {
        console.error(`[CronScheduler] User not authenticated, skipping job: ${job.name}`)
        return
      }

      // Update job stats
      job.stats.totalRuns++
      job.stats.lastRun = new Date().toISOString()

      // Execute the automation for each assigned profile
      let successCount = 0
      for (const profileId of job.profileIds) {
        try {
          await this.runAutomationForProfile(job, profileId)
          successCount++
        } catch (error) {
          console.error(`[CronScheduler] Failed to run automation for profile ${profileId}:`, error)
        }
      }

      if (successCount > 0) {
        job.stats.successfulRuns++
      } else {
        job.stats.failedRuns++
      }

      // Schedule next run
      this.updateNextRunTime(job)
      this.saveJobs()

      console.log(`[CronScheduler] Job completed: ${job.name} (${successCount}/${job.profileIds.length} successful)`)

    } catch (error) {
      console.error(`[CronScheduler] Error executing job ${job.name}:`, error)
      job.stats.failedRuns++
      this.updateNextRunTime(job)
      this.saveJobs()
    }
  }

  // Run automation for a specific profile
  private static async runAutomationForProfile(job: CronJob, profileId: string) {
    // Get access token
    const authService = GoogleAuthService.getInstance()
    const accessToken = await authService.getValidAccessToken()
    
    // Get profile info (would normally come from your profile storage)
    const profileName = 'Business Profile' // Would get from actual profile data
    
    // Generate content using ChatGPT
    const contentResponse = await fetch('/api/generate-google-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: profileName,
        industry: 'General Business',
        contentType: job.settings.contentType,
        tone: job.settings.tone
      })
    })

    if (!contentResponse.ok) {
      throw new Error('Failed to generate content')
    }

    const content = await contentResponse.json()

    // Execute via server-side cron API
    const cronResponse = await fetch('/api/cron/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: job.id,
        profileId: profileId,
        content: content,
        businessInfo: { name: profileName },
        accessToken: accessToken
      })
    })

    if (!cronResponse.ok) {
      const errorText = await cronResponse.text()
      throw new Error(`Cron execution failed: ${errorText}`)
    }

    const result = await cronResponse.json()
    console.log(`[CronScheduler] Successfully posted via cron API:`, result)
  }

  // Get job statistics
  static getStats() {
    const totalJobs = this.jobs.length
    const activeJobs = this.jobs.filter(job => job.status === 'active').length
    const pausedJobs = this.jobs.filter(job => job.status === 'paused').length
    const totalRuns = this.jobs.reduce((sum, job) => sum + job.stats.totalRuns, 0)
    const successfulRuns = this.jobs.reduce((sum, job) => sum + job.stats.successfulRuns, 0)

    return {
      totalJobs,
      activeJobs,
      pausedJobs,
      totalRuns,
      successfulRuns,
      successRate: totalRuns > 0 ? (successfulRuns / totalRuns * 100) : 0
    }
  }
}

// Initialize on import (client-side only)
if (typeof window !== 'undefined') {
  // Initialize after a short delay to ensure other services are ready
  setTimeout(() => CronScheduler.initialize(), 1000)
}
