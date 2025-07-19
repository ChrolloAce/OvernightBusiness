// Scheduling Service for Business Profile Posts

export interface ScheduledPost {
  id: string
  businessProfileId: string
  businessName: string
  content: string
  postType: 'update' | 'offer' | 'event' | 'product'
  status: 'scheduled' | 'publishing' | 'published' | 'failed'
  scheduledDate: string
  publishedDate?: string
  callToAction?: {
    text: string
    url: string
  }
  createdAt: string
  updatedAt: string
  error?: string
}

export class SchedulingService {
  private static instance: SchedulingService
  private static readonly STORAGE_KEY = 'overnight_biz_scheduled_posts'
  private static readonly EXECUTION_INTERVAL = 60000 // Check every minute

  private constructor() {
    // Auto-start the scheduler when the service is created
    this.startScheduler()
  }

  public static getInstance(): SchedulingService {
    if (!SchedulingService.instance) {
      SchedulingService.instance = new SchedulingService()
    }
    return SchedulingService.instance
  }

  // Get all scheduled posts
  public getScheduledPosts(): ScheduledPost[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(SchedulingService.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading scheduled posts:', error)
      return []
    }
  }

  // Save scheduled posts to storage
  private saveScheduledPosts(posts: ScheduledPost[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(SchedulingService.STORAGE_KEY, JSON.stringify(posts))
    } catch (error) {
      console.error('Error saving scheduled posts:', error)
    }
  }

  // Schedule a new post
  public schedulePost(post: Omit<ScheduledPost, 'id' | 'createdAt' | 'updatedAt'>): ScheduledPost {
    const newPost: ScheduledPost = {
      ...post,
      id: `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const posts = this.getScheduledPosts()
    posts.push(newPost)
    this.saveScheduledPosts(posts)

    console.log('[SchedulingService] Post scheduled:', newPost.id, 'for', new Date(newPost.scheduledDate))
    return newPost
  }

  // Update a scheduled post
  public updateScheduledPost(id: string, updates: Partial<ScheduledPost>): ScheduledPost | null {
    const posts = this.getScheduledPosts()
    const index = posts.findIndex(p => p.id === id)
    
    if (index === -1) return null

    posts[index] = {
      ...posts[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    this.saveScheduledPosts(posts)
    return posts[index]
  }

  // Delete a scheduled post
  public deleteScheduledPost(id: string): boolean {
    const posts = this.getScheduledPosts()
    const filteredPosts = posts.filter(p => p.id !== id)
    
    if (filteredPosts.length === posts.length) return false

    this.saveScheduledPosts(filteredPosts)
    return true
  }

  // Get posts ready for execution
  public getPostsReadyForExecution(): ScheduledPost[] {
    const now = new Date()
    const posts = this.getScheduledPosts()
    
    return posts.filter(post => 
      post.status === 'scheduled' && 
      new Date(post.scheduledDate) <= now
    )
  }

  // Execute a scheduled post
  public async executeScheduledPost(post: ScheduledPost): Promise<boolean> {
    console.log('[SchedulingService] Executing scheduled post:', post.id)
    
    // Update status to publishing
    this.updateScheduledPost(post.id, { status: 'publishing' })

    try {
      // Get the current access token (you'll need to implement this)
      const accessToken = await this.getAccessToken()
      
      if (!accessToken) {
        throw new Error('No access token available')
      }

      // Make the API call to post the content
      const response = await fetch('/api/google-business/local-posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          businessProfileId: post.businessProfileId,
          content: post.content,
          postType: post.postType,
          callToAction: post.callToAction
        })
      })

      if (response.ok) {
        // Update status to published
        this.updateScheduledPost(post.id, {
          status: 'published',
          publishedDate: new Date().toISOString()
        })
        
        console.log('[SchedulingService] Post published successfully:', post.id)
        return true
      } else {
        const error = await response.text()
        throw new Error(`API Error: ${response.status} - ${error}`)
      }
    } catch (error) {
      console.error('[SchedulingService] Error executing post:', error)
      
      // Update status to failed
      this.updateScheduledPost(post.id, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      
      return false
    }
  }

  // Get access token (you'll need to implement this based on your auth system)
  private async getAccessToken(): Promise<string | null> {
    // This is a placeholder - you'll need to implement this based on your auth system
    // For example, you might get it from localStorage, sessionStorage, or make an API call
    try {
      // Check if there's a stored session
      const sessionData = localStorage.getItem('google_auth_session')
      if (sessionData) {
        const session = JSON.parse(sessionData)
        
        // Check if token is still valid
        if (session.tokens && session.tokens.expires_at > Date.now()) {
          return session.tokens.access_token
        }
        
        // If token is expired, you might want to refresh it here
        // For now, we'll return null
      }
      
      return null
    } catch (error) {
      console.error('Error getting access token:', error)
      return null
    }
  }

  // Start the scheduler
  private startScheduler(): void {
    // Only run in browser environment
    if (typeof window === 'undefined') return

    console.log('[SchedulingService] Starting scheduler')
    
    setInterval(() => {
      this.checkAndExecutePosts()
    }, SchedulingService.EXECUTION_INTERVAL)
  }

  // Check and execute posts that are ready
  private async checkAndExecutePosts(): Promise<void> {
    const readyPosts = this.getPostsReadyForExecution()
    
    if (readyPosts.length === 0) return

    console.log('[SchedulingService] Found', readyPosts.length, 'posts ready for execution')
    
    for (const post of readyPosts) {
      try {
        await this.executeScheduledPost(post)
      } catch (error) {
        console.error('[SchedulingService] Error executing post:', post.id, error)
      }
    }
  }

  // Get posts by business profile
  public getPostsByBusinessProfile(businessProfileId: string): ScheduledPost[] {
    return this.getScheduledPosts().filter(post => post.businessProfileId === businessProfileId)
  }

  // Get posts by status
  public getPostsByStatus(status: ScheduledPost['status']): ScheduledPost[] {
    return this.getScheduledPosts().filter(post => post.status === status)
  }

  // Get upcoming posts (next 7 days)
  public getUpcomingPosts(): ScheduledPost[] {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return this.getScheduledPosts().filter(post => 
      post.status === 'scheduled' &&
      new Date(post.scheduledDate) >= now &&
      new Date(post.scheduledDate) <= nextWeek
    )
  }

  // Clear all scheduled posts (useful for testing)
  public clearAllScheduledPosts(): void {
    this.saveScheduledPosts([])
  }
}

// Export singleton instance
export const schedulingService = SchedulingService.getInstance() 