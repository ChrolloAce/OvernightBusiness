import { SavedBusinessProfile } from '../business-profiles-storage'

export interface ContentPost {
  id: string
  businessProfileId: string
  businessName: string
  title: string
  content: string
  type: 'update' | 'offer' | 'event' | 'product'
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  scheduledDate?: string
  publishedDate?: string
  media?: {
    type: 'image' | 'video'
    url: string
    alt?: string
  }[]
  callToAction?: {
    text: string
    url: string
  }
  createdAt: string
  updatedAt: string
}

export interface ContentIdea {
  title: string
  description: string
  type: 'update' | 'offer' | 'event' | 'product'
  category: string
}

export interface GenerateContentRequest {
  prompt: string
  businessName: string
  businessType: string
  businessDescription?: string
  postType: 'update' | 'offer' | 'event' | 'product'
}

export class ContentManager {
  private static instance: ContentManager
  private readonly STORAGE_KEY = 'overnight_biz_content_posts'

  private constructor() {}

  public static getInstance(): ContentManager {
    if (!ContentManager.instance) {
      ContentManager.instance = new ContentManager()
    }
    return ContentManager.instance
  }

  // Content Ideas Management
  public getContentIdeas(): ContentIdea[] {
    return [
      { title: 'Weekly Special Offer', description: 'Promote a limited-time discount or deal', type: 'offer', category: 'Promotion' },
      { title: 'Behind the Scenes', description: 'Show your team at work or business operations', type: 'update', category: 'Engagement' },
      { title: 'Customer Spotlight', description: 'Feature a happy customer or testimonial', type: 'update', category: 'Social Proof' },
      { title: 'New Product Launch', description: 'Announce a new product or service', type: 'product', category: 'Announcement' },
      { title: 'Upcoming Event', description: 'Promote an event or workshop', type: 'event', category: 'Event' },
      { title: 'Tips & Advice', description: 'Share industry expertise and helpful tips', type: 'update', category: 'Education' },
      { title: 'Seasonal Content', description: 'Holiday or seasonal themed posts', type: 'update', category: 'Seasonal' },
      { title: 'Community Involvement', description: 'Share local community activities', type: 'update', category: 'Community' }
    ]
  }

  // Posts CRUD Operations
  public getAllPosts(): ContentPost[] {
    if (typeof window === 'undefined') return []
    
    try {
      const savedPosts = localStorage.getItem(this.STORAGE_KEY)
      return savedPosts ? JSON.parse(savedPosts) : []
    } catch (error) {
      console.error('[ContentManager] Failed to load posts:', error)
      return []
    }
  }

  public getPostsByBusinessProfile(businessProfileId: string): ContentPost[] {
    return this.getAllPosts().filter(post => post.businessProfileId === businessProfileId)
  }

  public getPostById(postId: string): ContentPost | null {
    return this.getAllPosts().find(post => post.id === postId) || null
  }

  public createPost(
    profile: SavedBusinessProfile,
    content: string,
    prompt: string,
    postType: 'update' | 'offer' | 'event' | 'product',
    scheduledDate?: string,
    callToAction?: { text: string; url: string }
  ): ContentPost {
    const newPost: ContentPost = {
      id: Date.now().toString(),
      businessProfileId: profile.id,
      businessName: profile.name,
      title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
      content: content,
      type: postType,
      status: scheduledDate ? 'scheduled' : 'draft',
      scheduledDate: scheduledDate || undefined,
      callToAction: callToAction && callToAction.text && callToAction.url ? callToAction : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.savePost(newPost)
    return newPost
  }

  public updatePost(postId: string, updates: Partial<ContentPost>): boolean {
    try {
      const posts = this.getAllPosts()
      const index = posts.findIndex(post => post.id === postId)
      
      if (index >= 0) {
        posts[index] = {
          ...posts[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        this.savePosts(posts)
        return true
      }
      return false
    } catch (error) {
      console.error('[ContentManager] Failed to update post:', error)
      return false
    }
  }

  public deletePost(postId: string): boolean {
    try {
      const posts = this.getAllPosts()
      const filteredPosts = posts.filter(post => post.id !== postId)
      
      if (filteredPosts.length !== posts.length) {
        this.savePosts(filteredPosts)
        return true
      }
      return false
    } catch (error) {
      console.error('[ContentManager] Failed to delete post:', error)
      return false
    }
  }

  public publishPost(postId: string): boolean {
    return this.updatePost(postId, {
      status: 'published',
      publishedDate: new Date().toISOString()
    })
  }

  public schedulePost(postId: string, scheduledDate: string): boolean {
    return this.updatePost(postId, {
      status: 'scheduled',
      scheduledDate: scheduledDate
    })
  }

  // AI Content Generation
  public async generateContent(request: GenerateContentRequest): Promise<string> {
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.content) {
        throw new Error('No content generated')
      }

      return data.content
    } catch (error) {
      console.error('[ContentManager] Content generation failed:', error)
      throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Utility Methods
  public getPostStatusColor(status: string): string {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  public getPostTypeIcon(type: string): string {
    switch (type) {
      case 'offer': return 'Sparkles'
      case 'event': return 'Calendar'
      case 'product': return 'Building2'
      default: return 'FileText'
    }
  }

  public getPostsCount(): number {
    return this.getAllPosts().length
  }

  public getPostsCountByProfile(businessProfileId: string): number {
    return this.getPostsByBusinessProfile(businessProfileId).length
  }

  public getScheduledPosts(): ContentPost[] {
    return this.getAllPosts().filter(post => post.status === 'scheduled')
  }

  public getDraftPosts(): ContentPost[] {
    return this.getAllPosts().filter(post => post.status === 'draft')
  }

  public getPublishedPosts(): ContentPost[] {
    return this.getAllPosts().filter(post => post.status === 'published')
  }

  // Private Methods
  private savePost(post: ContentPost): void {
    const posts = this.getAllPosts()
    posts.push(post)
    this.savePosts(posts)
  }

  private savePosts(posts: ContentPost[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts))
    } catch (error) {
      console.error('[ContentManager] Failed to save posts:', error)
      throw new Error('Failed to save posts to storage')
    }
  }

  // Bulk Operations
  public clearAllPosts(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('[ContentManager] Failed to clear posts:', error)
    }
  }

  public exportPosts(): string {
    return JSON.stringify(this.getAllPosts(), null, 2)
  }

  public importPosts(jsonData: string): boolean {
    try {
      const posts = JSON.parse(jsonData) as ContentPost[]
      
      if (!Array.isArray(posts)) {
        throw new Error('Invalid data format')
      }

      this.savePosts(posts)
      return true
    } catch (error) {
      console.error('[ContentManager] Failed to import posts:', error)
      return false
    }
  }
} 