import { SavedBusinessProfile } from '../business-profiles-storage'
import { ContentPost, ContentIdea } from './content-manager'

export interface UIState {
  selectedProfile: SavedBusinessProfile | null
  showCreateForm: boolean
  isGenerating: boolean
  generatedContent: string
  contentPrompt: string
  postType: 'update' | 'offer' | 'event' | 'product'
  scheduledDate: string
  callToAction: { text: string; url: string }
  error: string | null
  loading: boolean
}

export interface UICallbacks {
  onProfileSelect: (profile: SavedBusinessProfile) => void
  onCreateFormToggle: (show: boolean) => void
  onContentGenerate: (prompt: string) => Promise<void>
  onPostCreate: () => void
  onPostDelete: (postId: string) => void
  onPostEdit: (postId: string) => void
  onPostView: (postId: string) => void
  onIdeaClick: (idea: ContentIdea) => void
  onError: (error: string) => void
  onClearError: () => void
}

export class UIManager {
  private static instance: UIManager
  private state: UIState
  private callbacks: Partial<UICallbacks>

  private constructor() {
    this.state = this.getInitialState()
    this.callbacks = {}
  }

  public static getInstance(): UIManager {
    if (!UIManager.instance) {
      UIManager.instance = new UIManager()
    }
    return UIManager.instance
  }

  // State Management
  public getState(): UIState {
    return { ...this.state }
  }

  public setState(updates: Partial<UIState>): void {
    this.state = { ...this.state, ...updates }
  }

  public resetState(): void {
    this.state = this.getInitialState()
  }

  private getInitialState(): UIState {
    return {
      selectedProfile: null,
      showCreateForm: false,
      isGenerating: false,
      generatedContent: '',
      contentPrompt: '',
      postType: 'update',
      scheduledDate: '',
      callToAction: { text: '', url: '' },
      error: null,
      loading: false
    }
  }

  // Callback Management
  public setCallbacks(callbacks: Partial<UICallbacks>): void {
    this.callbacks = { ...this.callbacks, ...callbacks }
  }

  public setCallback<K extends keyof UICallbacks>(key: K, callback: UICallbacks[K]): void {
    this.callbacks[key] = callback
  }

  // UI Actions
  public selectProfile(profile: SavedBusinessProfile): void {
    this.setState({ selectedProfile: profile })
    this.callbacks.onProfileSelect?.(profile)
  }

  public toggleCreateForm(show?: boolean): void {
    const shouldShow = show !== undefined ? show : !this.state.showCreateForm
    this.setState({ showCreateForm: shouldShow })
    this.callbacks.onCreateFormToggle?.(shouldShow)
  }

  public setContentPrompt(prompt: string): void {
    this.setState({ contentPrompt: prompt })
  }

  public setPostType(type: 'update' | 'offer' | 'event' | 'product'): void {
    this.setState({ postType: type })
  }

  public setScheduledDate(date: string): void {
    this.setState({ scheduledDate: date })
  }

  public setCallToAction(cta: { text: string; url: string }): void {
    this.setState({ callToAction: cta })
  }

  public setGeneratedContent(content: string): void {
    this.setState({ generatedContent: content })
  }

  public setLoading(loading: boolean): void {
    this.setState({ loading })
  }

  public setGenerating(generating: boolean): void {
    this.setState({ isGenerating: generating })
  }

  public setError(error: string | null): void {
    this.setState({ error })
    if (error) {
      this.callbacks.onError?.(error)
    } else {
      this.callbacks.onClearError?.()
    }
  }

  // Complex UI Actions
  public async generateContent(): Promise<void> {
    if (!this.state.selectedProfile || !this.state.contentPrompt.trim()) {
      this.setError('Please select a profile and enter a content prompt')
      return
    }

    this.setGenerating(true)
    this.setError(null)

    try {
      await this.callbacks.onContentGenerate?.(this.state.contentPrompt)
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to generate content')
    } finally {
      this.setGenerating(false)
    }
  }

  public createPost(): void {
    if (!this.state.selectedProfile || !this.state.generatedContent.trim()) {
      this.setError('Please generate content before creating a post')
      return
    }

    try {
      this.callbacks.onPostCreate?.()
      this.resetCreateForm()
    } catch (error) {
      this.setError(error instanceof Error ? error.message : 'Failed to create post')
    }
  }

  public handleIdeaClick(idea: ContentIdea): void {
    this.setState({
      contentPrompt: idea.description,
      postType: idea.type,
      showCreateForm: true
    })
    this.callbacks.onIdeaClick?.(idea)
  }

  public deletePost(postId: string): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.callbacks.onPostDelete?.(postId)
    }
  }

  public editPost(postId: string): void {
    this.callbacks.onPostEdit?.(postId)
  }

  public viewPost(postId: string): void {
    this.callbacks.onPostView?.(postId)
  }

  public resetCreateForm(): void {
    this.setState({
      showCreateForm: false,
      generatedContent: '',
      contentPrompt: '',
      scheduledDate: '',
      callToAction: { text: '', url: '' },
      error: null
    })
  }

  // Validation Methods
  public validateCreateForm(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!this.state.selectedProfile) {
      errors.push('Please select a business profile')
    }

    if (!this.state.contentPrompt.trim()) {
      errors.push('Please enter a content prompt')
    }

    if (this.state.callToAction.text && !this.state.callToAction.url) {
      errors.push('Please provide a URL for the call-to-action')
    }

    if (this.state.callToAction.url && !this.isValidUrl(this.state.callToAction.url)) {
      errors.push('Please provide a valid URL for the call-to-action')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // UI Helper Methods
  public getPostStatusColor(status: string): string {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
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

  public formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Invalid date'
    }
  }

  public formatDateTime(dateString: string): string {
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return 'Invalid date'
    }
  }

  public truncateText(text: string, maxLength: number = 100): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  // Form Helpers
  public isCreateFormValid(): boolean {
    return this.validateCreateForm().isValid
  }

  public canGenerateContent(): boolean {
    return !!(this.state.selectedProfile && this.state.contentPrompt.trim() && !this.state.isGenerating)
  }

  public canCreatePost(): boolean {
    return !!(this.state.selectedProfile && this.state.generatedContent.trim())
  }

  public getCreateButtonText(): string {
    if (this.state.scheduledDate) {
      return 'Schedule Post'
    }
    return 'Save as Draft'
  }

  public getGenerateButtonText(): string {
    if (this.state.isGenerating) {
      return 'Generating...'
    }
    return 'Generate Content'
  }

  // Navigation Helpers
  public navigateToProfiles(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/profiles'
    }
  }

  public openExternalLink(url: string): void {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  // Cleanup
  public cleanup(): void {
    this.resetState()
    this.callbacks = {}
  }
} 