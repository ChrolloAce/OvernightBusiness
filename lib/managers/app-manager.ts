import { ContentManager, ContentPost, ContentIdea, GenerateContentRequest } from './content-manager'
import { UIManager, UIState, UICallbacks } from './ui-manager'
import { BusinessProfileManager, BusinessProfileSummary } from './business-profile-manager'
import { SavedBusinessProfile } from '../business-profiles-storage'

export interface AppState {
  isInitialized: boolean
  currentPage: string
  user: any | null
  theme: 'light' | 'dark'
}

export class AppManager {
  private static instance: AppManager
  private contentManager: ContentManager
  private uiManager: UIManager
  private businessProfileManager: BusinessProfileManager
  private appState: AppState

  private constructor() {
    this.contentManager = ContentManager.getInstance()
    this.uiManager = UIManager.getInstance()
    this.businessProfileManager = BusinessProfileManager.getInstance()
    
    this.appState = {
      isInitialized: false,
      currentPage: 'dashboard',
      user: null,
      theme: 'light'
    }

    this.initializeCallbacks()
  }

  public static getInstance(): AppManager {
    if (!AppManager.instance) {
      AppManager.instance = new AppManager()
    }
    return AppManager.instance
  }

  // Initialization
  public async initialize(): Promise<void> {
    try {
      // Load business profiles
      this.businessProfileManager.loadProfiles()
      
      // Set initial selected profile if available
      const profiles = this.businessProfileManager.getAllProfiles()
      if (profiles.length > 0) {
        this.uiManager.selectProfile(profiles[0])
      }

      this.appState.isInitialized = true
      console.log('[AppManager] Application initialized successfully')
    } catch (error) {
      console.error('[AppManager] Failed to initialize application:', error)
      throw error
    }
  }

  private initializeCallbacks(): void {
    const callbacks: UICallbacks = {
      onProfileSelect: (profile: SavedBusinessProfile) => {
        console.log('[AppManager] Profile selected:', profile.name)
      },
      
      onCreateFormToggle: (show: boolean) => {
        console.log('[AppManager] Create form toggled:', show)
      },
      
      onContentGenerate: async (prompt: string) => {
        await this.handleContentGeneration(prompt)
      },
      
      onPostCreate: () => {
        this.handlePostCreation()
      },
      
      onPostDelete: (postId: string) => {
        this.handlePostDeletion(postId)
      },
      
      onPostEdit: (postId: string) => {
        this.handlePostEdit(postId)
      },
      
      onPostView: (postId: string) => {
        this.handlePostView(postId)
      },
      
      onIdeaClick: (idea: ContentIdea) => {
        console.log('[AppManager] Content idea clicked:', idea.title)
      },
      
      onError: (error: string) => {
        console.error('[AppManager] UI Error:', error)
      },
      
      onClearError: () => {
        console.log('[AppManager] Error cleared')
      }
    }

    this.uiManager.setCallbacks(callbacks)
  }

  // Content Management Methods
  public async generateContent(prompt: string): Promise<string> {
    const uiState = this.uiManager.getState()
    
    if (!uiState.selectedProfile) {
      throw new Error('No business profile selected')
    }

    const request: GenerateContentRequest = {
      prompt,
      businessName: uiState.selectedProfile.name,
      businessType: uiState.selectedProfile.category,
      businessDescription: uiState.selectedProfile.googleData?.businessDescription,
      postType: uiState.postType
    }

    return await this.contentManager.generateContent(request)
  }

  public createPost(): ContentPost | null {
    const uiState = this.uiManager.getState()
    
    if (!uiState.selectedProfile || !uiState.generatedContent) {
      return null
    }

    return this.contentManager.createPost(
      uiState.selectedProfile,
      uiState.generatedContent,
      uiState.contentPrompt,
      uiState.postType,
      uiState.scheduledDate || undefined,
      uiState.callToAction.text && uiState.callToAction.url ? uiState.callToAction : undefined
    )
  }

  public getPostsForCurrentProfile(): ContentPost[] {
    const uiState = this.uiManager.getState()
    
    if (!uiState.selectedProfile) {
      return []
    }

    return this.contentManager.getPostsByBusinessProfile(uiState.selectedProfile.id)
  }

  public getAllPosts(): ContentPost[] {
    return this.contentManager.getAllPosts()
  }

  public deletePost(postId: string): boolean {
    return this.contentManager.deletePost(postId)
  }

  public updatePost(postId: string, updates: Partial<ContentPost>): boolean {
    return this.contentManager.updatePost(postId, updates)
  }

  public getContentIdeas(): ContentIdea[] {
    return this.contentManager.getContentIdeas()
  }

  // Business Profile Management Methods
  public getAllBusinessProfiles(): SavedBusinessProfile[] {
    return this.businessProfileManager.getAllProfiles()
  }

  public getBusinessProfile(id: string): SavedBusinessProfile | null {
    return this.businessProfileManager.getProfile(id)
  }

  public saveBusinessProfile(profile: SavedBusinessProfile): boolean {
    return this.businessProfileManager.saveProfile(profile)
  }

  public deleteBusinessProfile(id: string): boolean {
    return this.businessProfileManager.deleteProfile(id)
  }

  public searchBusinessProfiles(query: string): SavedBusinessProfile[] {
    return this.businessProfileManager.searchProfiles(query)
  }

  public getBusinessProfileSummaries(): BusinessProfileSummary[] {
    return this.businessProfileManager.getProfileSummaries()
  }

  public hasBusinessProfiles(): boolean {
    return this.businessProfileManager.hasProfiles()
  }

  // UI State Management Methods
  public getUIState(): UIState {
    return this.uiManager.getState()
  }

  public setUIState(updates: Partial<UIState>): void {
    this.uiManager.setState(updates)
  }

  public selectBusinessProfile(profile: SavedBusinessProfile): void {
    this.uiManager.selectProfile(profile)
  }

  public toggleCreateForm(show?: boolean): void {
    this.uiManager.toggleCreateForm(show)
  }

  public setContentPrompt(prompt: string): void {
    this.uiManager.setContentPrompt(prompt)
  }

  public setPostType(type: 'update' | 'offer' | 'event' | 'product'): void {
    this.uiManager.setPostType(type)
  }

  public setScheduledDate(date: string): void {
    this.uiManager.setScheduledDate(date)
  }

  public setCallToAction(cta: { text: string; url: string }): void {
    this.uiManager.setCallToAction(cta)
  }

  public setError(error: string | null): void {
    this.uiManager.setError(error)
  }

  // Event Handlers
  private async handleContentGeneration(prompt: string): Promise<void> {
    try {
      this.uiManager.setGenerating(true)
      this.uiManager.setError(null)
      
      const content = await this.generateContent(prompt)
      this.uiManager.setGeneratedContent(content)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate content'
      this.uiManager.setError(errorMessage)
    } finally {
      this.uiManager.setGenerating(false)
    }
  }

  private handlePostCreation(): void {
    try {
      const post = this.createPost()
      if (post) {
        this.uiManager.resetCreateForm()
        console.log('[AppManager] Post created successfully:', post.title)
      } else {
        this.uiManager.setError('Failed to create post')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post'
      this.uiManager.setError(errorMessage)
    }
  }

  private handlePostDeletion(postId: string): void {
    try {
      const success = this.deletePost(postId)
      if (!success) {
        this.uiManager.setError('Failed to delete post')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete post'
      this.uiManager.setError(errorMessage)
    }
  }

  private handlePostEdit(postId: string): void {
    // Implementation for post editing
    console.log('[AppManager] Edit post:', postId)
  }

  private handlePostView(postId: string): void {
    // Implementation for post viewing
    console.log('[AppManager] View post:', postId)
  }

  // Utility Methods
  public handleIdeaClick(idea: ContentIdea): void {
    this.uiManager.handleIdeaClick(idea)
  }

  public canGenerateContent(): boolean {
    return this.uiManager.canGenerateContent()
  }

  public canCreatePost(): boolean {
    return this.uiManager.canCreatePost()
  }

  public validateCreateForm(): { isValid: boolean; errors: string[] } {
    return this.uiManager.validateCreateForm()
  }

  // Statistics and Analytics
  public getDashboardStats(): {
    totalProfiles: number
    totalPosts: number
    averageRating: number
    totalReviews: number
    verificationRate: number
  } {
    return {
      totalProfiles: this.businessProfileManager.getProfilesCount(),
      totalPosts: this.contentManager.getPostsCount(),
      averageRating: this.businessProfileManager.getAverageRating(),
      totalReviews: this.businessProfileManager.getTotalReviews(),
      verificationRate: this.businessProfileManager.getVerificationRate()
    }
  }

  public getRecentActivity(): Array<{
    action: string
    profile: string
    time: string
    status: 'success' | 'info' | 'warning' | 'error'
  }> {
    const posts = this.getAllPosts()
    const recentPosts = posts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)

    return recentPosts.map(post => ({
      action: `${post.type} post created`,
      profile: post.businessName,
      time: this.uiManager.formatDateTime(post.createdAt),
      status: post.status === 'published' ? 'success' : 'info'
    }))
  }

  // App State Management
  public setCurrentPage(page: string): void {
    this.appState.currentPage = page
  }

  public getCurrentPage(): string {
    return this.appState.currentPage
  }

  public setTheme(theme: 'light' | 'dark'): void {
    this.appState.theme = theme
  }

  public getTheme(): 'light' | 'dark' {
    return this.appState.theme
  }

  public isInitialized(): boolean {
    return this.appState.isInitialized
  }

  // Cleanup and Reset
  public cleanup(): void {
    this.uiManager.cleanup()
    this.businessProfileManager.cleanup()
    this.contentManager.clearAllPosts()
    this.appState.isInitialized = false
  }

  public reset(): void {
    this.uiManager.resetState()
    this.appState = {
      isInitialized: false,
      currentPage: 'dashboard',
      user: null,
      theme: 'light'
    }
  }

  // Export/Import
  public exportAllData(): {
    profiles: string
    posts: string
    timestamp: string
  } {
    return {
      profiles: this.businessProfileManager.exportProfiles(),
      posts: this.contentManager.exportPosts(),
      timestamp: new Date().toISOString()
    }
  }

  public importAllData(data: { profiles?: string; posts?: string }): {
    profilesImported: boolean
    postsImported: boolean
    errors: string[]
  } {
    const errors: string[] = []
    let profilesImported = false
    let postsImported = false

    if (data.profiles) {
      try {
        profilesImported = this.businessProfileManager.importProfiles(data.profiles)
        if (!profilesImported) {
          errors.push('Failed to import business profiles')
        }
      } catch (error) {
        errors.push(`Profile import error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    if (data.posts) {
      try {
        postsImported = this.contentManager.importPosts(data.posts)
        if (!postsImported) {
          errors.push('Failed to import content posts')
        }
      } catch (error) {
        errors.push(`Posts import error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return {
      profilesImported,
      postsImported,
      errors
    }
  }
} 