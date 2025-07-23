// Automated Content Generation and Scheduling Service

import { GoogleAuthService } from './google-auth'
import { schedulingService, ScheduledPost } from './scheduling-service'

export interface ContentTemplate {
  id: string
  name: string
  type: 'update' | 'offer' | 'event' | 'product'
  prompts: string[]
  frequency: 'daily' | 'weekly' | 'monthly'
  active: boolean
}

export interface AutoPostConfig {
  businessProfileId: string
  businessName: string
  enabled: boolean
  frequency: 'daily' | '3_times_week' | 'weekly'
  postTimes: string[] // ['09:00', '15:00', '18:00']
  contentTypes: ('update' | 'offer' | 'event' | 'product')[]
  customPrompts: string[]
  lastGenerated: string
  totalGenerated: number
}

export interface GeneratedContentItem {
  id: string
  businessProfileId: string
  content: string
  postType: 'update' | 'offer' | 'event' | 'product'
  prompt: string
  generatedAt: string
  scheduledFor?: string
  status: 'generated' | 'scheduled' | 'posted' | 'failed'
}

export class AutomatedContentService {
  private static instance: AutomatedContentService
  private static readonly CONFIG_STORAGE_KEY = 'overnight_biz_auto_config'
  private static readonly CONTENT_STORAGE_KEY = 'overnight_biz_auto_content'
  private static readonly CHECK_INTERVAL = 60000 // Check every minute

  // Default content templates
  private defaultTemplates: ContentTemplate[] = [
    {
      id: 'daily_tips',
      name: 'Daily Tips & Advice',
      type: 'update',
      prompts: [
        'Share a helpful tip about {businessType} for customers',
        'Give advice on how customers can get the most value from {businessType}',
        'Share an industry insight that would benefit our customers',
        'Provide a quick tip that saves customers time or money'
      ],
      frequency: 'daily',
      active: true
    },
    {
      id: 'weekly_offers',
      name: 'Weekly Special Offers',
      type: 'offer',
      prompts: [
        'Create a limited-time discount offer for this week',
        'Announce a special promotion for loyal customers',
        'Share an exclusive deal for new customers',
        'Create a weekend special offer'
      ],
      frequency: 'weekly',
      active: true
    },
    {
      id: 'behind_scenes',
      name: 'Behind the Scenes',
      type: 'update',
      prompts: [
        'Share what goes on behind the scenes at {businessName}',
        'Talk about the team and what makes {businessName} special',
        'Share the story of how we serve our customers',
        'Highlight our commitment to quality and service'
      ],
      frequency: 'weekly',
      active: true
    },
    {
      id: 'customer_focus',
      name: 'Customer Stories',
      type: 'update',
      prompts: [
        'Share how {businessName} helps customers achieve their goals',
        'Talk about a typical day serving customers at {businessName}',
        'Share what customers love most about {businessName}',
        'Highlight customer success stories (without names)'
      ],
      frequency: 'weekly',
      active: true
    }
  ]

  private constructor() {
    this.startAutomatedService()
  }

  public static getInstance(): AutomatedContentService {
    if (!AutomatedContentService.instance) {
      AutomatedContentService.instance = new AutomatedContentService()
    }
    return AutomatedContentService.instance
  }

  // Configuration Management
  public getAutoPostConfigs(): AutoPostConfig[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(AutomatedContentService.CONFIG_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading auto-post configs:', error)
      return []
    }
  }

  public saveAutoPostConfig(config: AutoPostConfig): void {
    if (typeof window === 'undefined') return
    
    try {
      const configs = this.getAutoPostConfigs()
      const existingIndex = configs.findIndex(c => c.businessProfileId === config.businessProfileId)
      
      if (existingIndex >= 0) {
        configs[existingIndex] = config
      } else {
        configs.push(config)
      }
      
      localStorage.setItem(AutomatedContentService.CONFIG_STORAGE_KEY, JSON.stringify(configs))
      console.log('[AutoContent] Config saved for:', config.businessName)
    } catch (error) {
      console.error('Error saving auto-post config:', error)
    }
  }

  public getConfigForBusiness(businessProfileId: string): AutoPostConfig | null {
    const configs = this.getAutoPostConfigs()
    return configs.find(c => c.businessProfileId === businessProfileId) || null
  }

  // Content Generation
  public async generateContentForBusiness(
    businessProfileId: string, 
    businessName: string,
    businessType: string,
    contentType?: 'update' | 'offer' | 'event' | 'product'
  ): Promise<GeneratedContentItem | null> {
    try {
      const config = this.getConfigForBusiness(businessProfileId)
      if (!config || !config.enabled) {
        console.log('[AutoContent] Auto-posting disabled for:', businessName)
        return null
      }

      // Select content type
      const selectedType = contentType || this.selectContentType(config)
      
      // Generate prompt
      const prompt = this.generatePrompt(selectedType, businessName, businessType, config)
      
      console.log('[AutoContent] Generating content for:', businessName, 'Type:', selectedType)
      
      // Call OpenAI to generate content
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          businessName,
          businessType,
          businessDescription: '',
          postType: selectedType
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const data = await response.json()
      
      const generatedItem: GeneratedContentItem = {
        id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        businessProfileId,
        content: data.content,
        postType: selectedType,
        prompt,
        generatedAt: new Date().toISOString(),
        status: 'generated'
      }

      // Store generated content
      this.saveGeneratedContent(generatedItem)
      
      // Update config
      config.lastGenerated = new Date().toISOString()
      config.totalGenerated = (config.totalGenerated || 0) + 1
      this.saveAutoPostConfig(config)

      console.log('[AutoContent] Content generated successfully for:', businessName)
      return generatedItem

    } catch (error) {
      console.error('[AutoContent] Error generating content:', error)
      return null
    }
  }

  // Smart Scheduling
  public async scheduleGeneratedContent(item: GeneratedContentItem): Promise<boolean> {
    try {
      const config = this.getConfigForBusiness(item.businessProfileId)
      if (!config) return false

      // Calculate next optimal posting time
      const scheduledTime = this.calculateNextPostTime(config)
      
      // Schedule the post using the scheduling service
      const scheduledPost = schedulingService.schedulePost({
        businessProfileId: item.businessProfileId,
        businessName: config.businessName,
        content: item.content,
        postType: item.postType,
        status: 'scheduled',
        scheduledDate: scheduledTime.toISOString()
      })

      // Update the generated content item
      item.scheduledFor = scheduledTime.toISOString()
      item.status = 'scheduled'
      this.saveGeneratedContent(item)

      console.log('[AutoContent] Content scheduled for:', scheduledTime.toLocaleString())
      return true

    } catch (error) {
      console.error('[AutoContent] Error scheduling content:', error)
      return false
    }
  }

  // Automated Service Runner
  private startAutomatedService(): void {
    if (typeof window === 'undefined') return

    console.log('[AutoContent] Starting automated content service')
    
    setInterval(() => {
      this.checkAndGenerateContent()
    }, AutomatedContentService.CHECK_INTERVAL)
  }

  private async checkAndGenerateContent(): Promise<void> {
    const configs = this.getAutoPostConfigs()
    const activeConfigs = configs.filter(c => c.enabled)
    
    if (activeConfigs.length === 0) return

    for (const config of activeConfigs) {
      try {
        if (this.shouldGenerateContent(config)) {
          console.log('[AutoContent] Generating content for:', config.businessName)
          
          const generatedContent = await this.generateContentForBusiness(
            config.businessProfileId,
            config.businessName,
            this.extractBusinessType(config.businessName)
          )

          if (generatedContent) {
            await this.scheduleGeneratedContent(generatedContent)
          }
        }
      } catch (error) {
        console.error('[AutoContent] Error in automated generation for:', config.businessName, error)
      }
    }
  }

  // Helper Methods
  private shouldGenerateContent(config: AutoPostConfig): boolean {
    if (!config.lastGenerated) return true

    const lastGenerated = new Date(config.lastGenerated)
    const now = new Date()
    const hoursSinceLastGenerated = (now.getTime() - lastGenerated.getTime()) / (1000 * 60 * 60)

    switch (config.frequency) {
      case 'daily':
        return hoursSinceLastGenerated >= 24
      case '3_times_week':
        return hoursSinceLastGenerated >= 56 // ~2.3 days
      case 'weekly':
        return hoursSinceLastGenerated >= 168 // 7 days
      default:
        return false
    }
  }

  private selectContentType(config: AutoPostConfig): 'update' | 'offer' | 'event' | 'product' {
    const availableTypes = config.contentTypes.length > 0 ? config.contentTypes : ['update']
    const randomIndex = Math.floor(Math.random() * availableTypes.length)
    return availableTypes[randomIndex]
  }

  private generatePrompt(
    contentType: string,
    businessName: string,
    businessType: string,
    config: AutoPostConfig
  ): string {
    const customPrompts = config.customPrompts || []
    const template = this.defaultTemplates.find(t => t.type === contentType)
    
    let availablePrompts = [...customPrompts]
    if (template) {
      availablePrompts.push(...template.prompts)
    }

    if (availablePrompts.length === 0) {
      availablePrompts = [`Create an engaging ${contentType} post for ${businessName}`]
    }

    const selectedPrompt = availablePrompts[Math.floor(Math.random() * availablePrompts.length)]
    
    // Replace placeholders
    return selectedPrompt
      .replace(/\{businessName\}/g, businessName)
      .replace(/\{businessType\}/g, businessType)
  }

  private calculateNextPostTime(config: AutoPostConfig): Date {
    const now = new Date()
    const postTimes = config.postTimes.length > 0 ? config.postTimes : ['09:00']
    
    // Find next available post time
    for (const timeStr of postTimes) {
      const [hours, minutes] = timeStr.split(':').map(Number)
      const potentialTime = new Date()
      potentialTime.setHours(hours, minutes, 0, 0)
      
      // If this time is in the future today, use it
      if (potentialTime > now) {
        return potentialTime
      }
    }
    
    // If no time today, use first time tomorrow
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const [hours, minutes] = postTimes[0].split(':').map(Number)
    tomorrow.setHours(hours, minutes, 0, 0)
    
    return tomorrow
  }

  private extractBusinessType(businessName: string): string {
    // Simple business type extraction - could be enhanced
    const keywords = {
      'restaurant': ['restaurant', 'cafe', 'diner', 'bistro', 'eatery'],
      'retail': ['store', 'shop', 'boutique', 'market'],
      'service': ['service', 'services', 'repair', 'maintenance'],
      'healthcare': ['clinic', 'medical', 'dental', 'health'],
      'fitness': ['gym', 'fitness', 'yoga', 'pilates']
    }

    const lowerName = businessName.toLowerCase()
    
    for (const [type, words] of Object.entries(keywords)) {
      if (words.some(word => lowerName.includes(word))) {
        return type
      }
    }
    
    return 'business'
  }

  // Content Storage
  private saveGeneratedContent(item: GeneratedContentItem): void {
    if (typeof window === 'undefined') return
    
    try {
      const existing = this.getGeneratedContent()
      const index = existing.findIndex(c => c.id === item.id)
      
      if (index >= 0) {
        existing[index] = item
      } else {
        existing.push(item)
      }
      
      // Keep only last 100 items
      const sorted = existing.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
      const trimmed = sorted.slice(0, 100)
      
      localStorage.setItem(AutomatedContentService.CONTENT_STORAGE_KEY, JSON.stringify(trimmed))
    } catch (error) {
      console.error('Error saving generated content:', error)
    }
  }

  public getGeneratedContent(): GeneratedContentItem[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(AutomatedContentService.CONTENT_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading generated content:', error)
      return []
    }
  }

  // Public API Methods
  public createDefaultConfig(businessProfileId: string, businessName: string): AutoPostConfig {
    return {
      businessProfileId,
      businessName,
      enabled: false,
      frequency: 'daily',
      postTimes: ['09:00', '15:00'],
      contentTypes: ['update', 'offer'],
      customPrompts: [],
      lastGenerated: '',
      totalGenerated: 0
    }
  }

  public enableAutomationForBusiness(businessProfileId: string, businessName: string): void {
    let config = this.getConfigForBusiness(businessProfileId)
    if (!config) {
      config = this.createDefaultConfig(businessProfileId, businessName)
    }
    config.enabled = true
    this.saveAutoPostConfig(config)
  }

  public disableAutomationForBusiness(businessProfileId: string): void {
    const config = this.getConfigForBusiness(businessProfileId)
    if (config) {
      config.enabled = false
      this.saveAutoPostConfig(config)
    }
  }

  public getStats(): {
    totalConfigs: number
    activeConfigs: number
    totalGenerated: number
    scheduledPosts: number
  } {
    const configs = this.getAutoPostConfigs()
    const generated = this.getGeneratedContent()
    const scheduled = generated.filter(c => c.status === 'scheduled')
    
    return {
      totalConfigs: configs.length,
      activeConfigs: configs.filter(c => c.enabled).length,
      totalGenerated: generated.length,
      scheduledPosts: scheduled.length
    }
  }
}

// Export singleton instance
export const automatedContentService = AutomatedContentService.getInstance() 