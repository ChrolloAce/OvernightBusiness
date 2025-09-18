// Automation execution service for AI agents
import { BusinessProfilesStorage, SavedBusinessProfile } from './business-profiles-storage'

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

export class AutomationService {
  private static instance: AutomationService
  private isRunning: boolean = false

  constructor() {
    this.startScheduler()
  }

  static getInstance(): AutomationService {
    if (!AutomationService.instance) {
      AutomationService.instance = new AutomationService()
    }
    return AutomationService.instance
  }

  // Start the automation scheduler
  private startScheduler() {
    if (this.isRunning) return
    
    this.isRunning = true
    console.log('[AutomationService] Starting automation scheduler...')
    
    // Check for pending automations every minute
    setInterval(() => {
      this.checkAndExecuteAutomations()
    }, 60000) // Check every minute
    
    // Also check immediately on startup
    setTimeout(() => {
      this.checkAndExecuteAutomations()
    }, 5000) // Wait 5 seconds after startup
  }

  // Check for automations that need to run
  private async checkAndExecuteAutomations() {
    try {
      const automations = this.loadAutomations()
      const now = new Date()
      
      console.log(`[AutomationService] Checking ${automations.length} automations at ${now.toISOString()}`)
      
      for (const automation of automations) {
        if (automation.status === 'active' && this.shouldRunAutomation(automation, now)) {
          console.log(`[AutomationService] Executing automation: ${automation.name}`)
          await this.executeAutomation(automation)
        }
      }
    } catch (error) {
      console.error('[AutomationService] Error checking automations:', error)
    }
  }

  // Check if automation should run now
  private shouldRunAutomation(automation: Automation, now: Date): boolean {
    const [hours, minutes] = automation.schedule.time.split(':').map(Number)
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()
    
    // Check if it's the right time (within 1 minute window)
    const isRightTime = currentHour === hours && Math.abs(currentMinute - minutes) <= 1
    
    if (!isRightTime) return false
    
    // Check if already ran today
    const lastRun = automation.stats.lastRun ? new Date(automation.stats.lastRun) : null
    if (lastRun) {
      const timeSinceLastRun = now.getTime() - lastRun.getTime()
      const hoursSinceLastRun = timeSinceLastRun / (1000 * 60 * 60)
      
      switch (automation.schedule.frequency) {
        case 'daily':
          return hoursSinceLastRun >= 23 // At least 23 hours since last run
        case 'weekly':
          return hoursSinceLastRun >= 167 // At least 7 days since last run
        case 'monthly':
          return hoursSinceLastRun >= 719 // At least 30 days since last run
        default:
          return false
      }
    }
    
    return true // First run
  }

  // Execute a specific automation
  private async executeAutomation(automation: Automation) {
    try {
      console.log(`[AutomationService] Starting execution of automation: ${automation.name}`)
      
      const profiles = this.getAssignedProfiles(automation.assignedProfiles)
      let successCount = 0
      let totalAttempts = 0
      
      for (const profile of profiles) {
        try {
          totalAttempts++
          console.log(`[AutomationService] Generating content for profile: ${profile.name}`)
          
          // Generate content using ChatGPT
          const content = await this.generateContent(profile, automation.settings)
          
          if (content) {
            // Post to Google Business Profile
            const postSuccess = await this.postToGoogleProfile(profile, content)
            if (postSuccess) {
              successCount++
              console.log(`[AutomationService] Successfully posted to ${profile.name}`)
            }
          }
        } catch (error) {
          console.error(`[AutomationService] Error posting to profile ${profile.name}:`, error)
        }
      }
      
      // Update automation stats
      const successRate = totalAttempts > 0 ? (successCount / totalAttempts) * 100 : 0
      this.updateAutomationStats(automation.id, {
        totalPosts: automation.stats.totalPosts + successCount,
        lastRun: new Date().toISOString(),
        nextRun: this.calculateNextRun(automation).toISOString(),
        successRate: Math.round(successRate)
      })
      
      console.log(`[AutomationService] Automation ${automation.name} completed: ${successCount}/${totalAttempts} successful`)
      
    } catch (error) {
      console.error(`[AutomationService] Error executing automation ${automation.name}:`, error)
    }
  }

  // Generate content for a profile
  private async generateContent(profile: SavedBusinessProfile, settings: any) {
    try {
      const response = await fetch('/api/generate-google-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profileId: profile.id,
          businessInfo: {
            name: profile.name,
            category: profile.category,
            address: profile.address,
            website: profile.website,
            phone: profile.phone,
            // Enhanced context for local SEO
            serviceArea: profile.googleData?.serviceArea,
            serviceTypes: profile.googleData?.serviceTypes || [],
            allCategories: profile.googleData?.allCategories,
            businessHours: profile.googleData?.businessHours,
            rating: profile.rating,
            reviewCount: profile.reviewCount,
            businessType: profile.googleData?.businessType,
            places: profile.googleData?.serviceArea?.places?.placeInfos || [],
            regionCode: profile.googleData?.serviceArea?.regionCode
          },
          contentType: settings.contentType,
          tone: settings.tone
        })
      })

      const data = await response.json()
      return data.success ? data.content : null
    } catch (error) {
      console.error('[AutomationService] Error generating content:', error)
      return null
    }
  }

  // Post content to Google Business Profile via server-side API
  private async postToGoogleProfile(profile: SavedBusinessProfile, content: any): Promise<boolean> {
    try {
      console.log(`[AutomationService] Posting to Google Business Profile: ${profile.name}`)
      
      // Get access token from client-side storage
      let accessToken = ''
      try {
        // Try to get token from GoogleAuthService
        const { GoogleAuthService } = await import('./google-auth')
        const googleAuth = GoogleAuthService.getInstance()
        accessToken = await googleAuth.getValidAccessToken()
      } catch (error) {
        console.error('[AutomationService] Error getting access token:', error)
        throw new Error('No tokens available. Please authenticate first.')
      }
      
      // Use server-side API to avoid CORS issues
      const response = await fetch('/api/google-business/create-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profileId: profile.googleBusinessId,
          content: content,
          businessInfo: {
            name: profile.name,
            website: profile.website,
            category: profile.category
          },
          accessToken: accessToken
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log(`[AutomationService] Successfully posted to ${profile.name}`)
        return true
      } else {
        console.error(`[AutomationService] Failed to post to ${profile.name}:`, result.error)
        return false
      }
    } catch (error) {
      console.error(`[AutomationService] Error posting to Google Business Profile:`, error)
      return false
    }
  }

  // Load automations from storage
  private loadAutomations(): Automation[] {
    try {
      const savedAutomations = localStorage.getItem('ai_automations')
      return savedAutomations ? JSON.parse(savedAutomations) : []
    } catch (error) {
      console.error('[AutomationService] Error loading automations:', error)
      return []
    }
  }

  // Get assigned profiles
  private getAssignedProfiles(profileIds: string[]): SavedBusinessProfile[] {
    const allProfiles = BusinessProfilesStorage.getAllProfiles()
    return allProfiles.filter(profile => profileIds.includes(profile.id))
  }

  // Calculate next run time
  private calculateNextRun(automation: Automation): Date {
    const now = new Date()
    const [hours, minutes] = automation.schedule.time.split(':').map(Number)
    
    const nextRun = new Date()
    nextRun.setHours(hours, minutes, 0, 0)
    
    switch (automation.schedule.frequency) {
      case 'daily':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 1)
        }
        break
      case 'weekly':
        if (nextRun <= now) {
          nextRun.setDate(nextRun.getDate() + 7)
        }
        break
      case 'monthly':
        if (nextRun <= now) {
          nextRun.setMonth(nextRun.getMonth() + 1)
        }
        break
    }
    
    return nextRun
  }

  // Update automation statistics
  private updateAutomationStats(automationId: string, stats: Partial<Automation['stats']>) {
    try {
      const automations = this.loadAutomations()
      const updatedAutomations = automations.map(automation =>
        automation.id === automationId
          ? { ...automation, stats: { ...automation.stats, ...stats } }
          : automation
      )
      localStorage.setItem('ai_automations', JSON.stringify(updatedAutomations))
    } catch (error) {
      console.error('[AutomationService] Error updating automation stats:', error)
    }
  }

  // Manual execution for testing
  public async executeAutomationNow(automationId: string): Promise<boolean> {
    try {
      const automations = this.loadAutomations()
      const automation = automations.find(a => a.id === automationId)
      
      if (!automation) {
        console.error(`[AutomationService] Automation not found: ${automationId}`)
        return false
      }
      
      await this.executeAutomation(automation)
      return true
    } catch (error) {
      console.error(`[AutomationService] Error manually executing automation:`, error)
      return false
    }
  }
}
