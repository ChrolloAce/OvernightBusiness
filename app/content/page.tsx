'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PenTool, 
  Calendar, 
  Clock, 
  Building2, 
  Sparkles, 
  FileText, 
  Link,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AppManager } from '@/lib/managers/app-manager'
import { ContentPost, ContentIdea } from '@/lib/managers/content-manager'
import { SavedBusinessProfile } from '@/lib/business-profiles-storage'

export default function ContentHubPage() {
  const [appManager] = useState(() => AppManager.getInstance())
  const [businessProfiles, setBusinessProfiles] = useState<SavedBusinessProfile[]>([])
  const [selectedProfile, setSelectedProfile] = useState<SavedBusinessProfile | null>(null)
  const [posts, setPosts] = useState<ContentPost[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [contentPrompt, setContentPrompt] = useState('')
  const [postType, setPostType] = useState<'update' | 'offer' | 'event' | 'product'>('update')
  const [scheduledDate, setScheduledDate] = useState('')
  const [callToAction, setCallToAction] = useState({ text: '', url: '' })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeApp()
  }, [])

  const initializeApp = async () => {
    try {
      await appManager.initialize()
      loadData()
    } catch (error) {
      console.error('Failed to initialize app:', error)
      setError('Failed to initialize application')
    }
  }

  const loadData = () => {
    const profiles = appManager.getAllBusinessProfiles()
    setBusinessProfiles(profiles)
    
    if (profiles.length > 0 && !selectedProfile) {
      const firstProfile = profiles[0]
      setSelectedProfile(firstProfile)
      appManager.selectBusinessProfile(firstProfile)
    }
    
    loadPosts()
  }

  const loadPosts = () => {
    const allPosts = appManager.getPostsForCurrentProfile()
    setPosts(allPosts)
  }

  const handleProfileSelect = (profile: SavedBusinessProfile) => {
    setSelectedProfile(profile)
    appManager.selectBusinessProfile(profile)
    
    // Load posts for the selected profile
    const profilePosts = appManager.getPostsForCurrentProfile()
    setPosts(profilePosts)
  }

  const handleGenerateContent = async () => {
    if (!selectedProfile || !contentPrompt.trim()) {
      setError('Please select a profile and enter a content prompt')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      // Update app manager state
      appManager.setContentPrompt(contentPrompt)
      appManager.setPostType(postType)
      
      const content = await appManager.generateContent(contentPrompt)
      setGeneratedContent(content)
      appManager.setUIState({ generatedContent: content })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate content'
      setError(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCreatePost = () => {
    if (!selectedProfile || !generatedContent.trim()) {
      setError('Please generate content before creating a post')
      return
    }

    try {
      // Update app manager state
      appManager.setScheduledDate(scheduledDate)
      appManager.setCallToAction(callToAction)
      
      const post = appManager.createPost()
      if (post) {
        // Reset form
        resetCreateForm()
        loadPosts() // Refresh posts list
      } else {
        setError('Failed to create post')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create post'
      setError(errorMessage)
    }
  }

  const handleDeletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      const success = appManager.deletePost(postId)
      if (success) {
        loadPosts() // Refresh posts list
      } else {
        setError('Failed to delete post')
      }
    }
  }

  const handleIdeaClick = (idea: ContentIdea) => {
    setContentPrompt(idea.description)
    setPostType(idea.type)
    setShowCreateForm(true)
    appManager.handleIdeaClick(idea)
  }

  const resetCreateForm = () => {
    setShowCreateForm(false)
    setGeneratedContent('')
    setContentPrompt('')
    setScheduledDate('')
    setCallToAction({ text: '', url: '' })
    setError(null)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'offer': return <Sparkles className="h-4 w-4" />
      case 'event': return <Calendar className="h-4 w-4" />
      case 'product': return <Building2 className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const contentIdeas = appManager.getContentIdeas()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Hub</h1>
          <p className="text-muted-foreground">
            Generate AI-powered content and schedule posts for your business profiles.
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} disabled={!selectedProfile}>
          <Plus className="mr-2 h-4 w-4" />
          Create Content
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-2">
              <div className="text-red-600 dark:text-red-400">⚠️</div>
              <div>
                <p className="text-red-600 dark:text-red-400 font-medium">Error</p>
                <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Business Profile Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="mr-2 h-5 w-5" />
            Select Business Profile
          </CardTitle>
          <CardDescription>
            Choose which business profile to create content for
          </CardDescription>
        </CardHeader>
        <CardContent>
          {businessProfiles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {businessProfiles.map((profile) => (
                <Button
                  key={profile.id}
                  variant={selectedProfile?.id === profile.id ? "default" : "outline"}
                  onClick={() => handleProfileSelect(profile)}
                  className="flex items-center space-x-2"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{profile.name}</span>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Business Profiles</h3>
              <p className="text-muted-foreground mb-4">
                You need to add business profiles before creating content.
              </p>
              <Button onClick={() => window.location.href = '/profiles'}>
                Add Business Profiles
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProfile && (
        <>
          {/* Content Ideas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="mr-2 h-5 w-5" />
                Content Ideas
              </CardTitle>
              <CardDescription>
                Quick inspiration for your next post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {contentIdeas.map((idea, idx) => (
                  <Card 
                    key={idx} 
                    className="cursor-pointer hover:bg-accent transition-colors border-2 hover:border-primary/20"
                    onClick={() => handleIdeaClick(idea)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getTypeIcon(idea.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm mb-1">{idea.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{idea.description}</p>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              {idea.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {idea.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Posts List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Content Posts
                </div>
                <Badge variant="outline">
                  {posts.length} posts
                </Badge>
              </CardTitle>
              <CardDescription>
                Manage your content posts for {selectedProfile.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <Card key={post.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {getTypeIcon(post.type)}
                              <h3 className="font-semibold">{post.title}</h3>
                              <Badge className={getStatusColor(post.status)}>
                                {post.status}
                              </Badge>
                              <Badge variant="outline" className="capitalize">
                                {post.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {post.content}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                              {post.scheduledDate && (
                                <span className="flex items-center">
                                  <Clock className="mr-1 h-3 w-3" />
                                  Scheduled: {new Date(post.scheduledDate).toLocaleDateString()}
                                </span>
                              )}
                              {post.callToAction && (
                                <span className="flex items-center">
                                  <Link className="mr-1 h-3 w-3" />
                                  Has CTA
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeletePost(post.id)}
                              className="hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Content Posts</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first AI-generated content post for {selectedProfile.name}.
                  </p>
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Post
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Create Content Modal */}
      {showCreateForm && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-background rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Create Content for {selectedProfile.name}</h2>
              <Button variant="ghost" size="sm" onClick={resetCreateForm}>
                ×
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left Column - Input */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PenTool className="mr-2 h-5 w-5" />
                      Content Generation
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Post Type</label>
                      <div className="flex flex-wrap gap-2">
                        {(['update', 'offer', 'event', 'product'] as const).map((type) => (
                          <Button
                            key={type}
                            variant={postType === type ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPostType(type)}
                            className="capitalize"
                          >
                            {getTypeIcon(type)}
                            <span className="ml-2">{type}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Content Prompt</label>
                      <textarea
                        value={contentPrompt}
                        onChange={(e) => setContentPrompt(e.target.value)}
                        placeholder="Describe what you want to post about... (e.g., 'Create a post about our new winter menu items with a 20% discount for first-time customers')"
                        className="w-full h-32 p-3 border rounded-lg resize-none"
                      />
                    </div>

                    <Button 
                      onClick={handleGenerateContent} 
                      disabled={!contentPrompt.trim() || isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Content
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Scheduling & Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Schedule Date (Optional)</label>
                      <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full p-3 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Call to Action (Optional)</label>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={callToAction.text}
                          onChange={(e) => setCallToAction(prev => ({ ...prev, text: e.target.value }))}
                          placeholder="CTA text (e.g., 'Book Now', 'Learn More')"
                          className="w-full p-3 border rounded-lg"
                        />
                        <input
                          type="url"
                          value={callToAction.url}
                          onChange={(e) => setCallToAction(prev => ({ ...prev, url: e.target.value }))}
                          placeholder="CTA URL (e.g., https://your-website.com/book)"
                          className="w-full p-3 border rounded-lg"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Preview */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Eye className="mr-2 h-5 w-5" />
                      Content Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatedContent ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                              {selectedProfile.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{selectedProfile.name}</p>
                              <p className="text-xs text-muted-foreground">Google Business Post</p>
                            </div>
                          </div>
                          <div className="whitespace-pre-wrap text-sm">{generatedContent}</div>
                          {callToAction.text && callToAction.url && (
                            <div className="mt-3 pt-3 border-t">
                              <Button size="sm" className="w-full">
                                {callToAction.text}
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-3">
                          <Button onClick={handleCreatePost} className="flex-1">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            {scheduledDate ? 'Schedule Post' : 'Save as Draft'}
                          </Button>
                          <Button variant="outline" onClick={() => setGeneratedContent('')}>
                            <Edit className="mr-2 h-4 w-4" />
                            Regenerate
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Sparkles className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">AI Content Preview</h3>
                        <p className="text-muted-foreground">
                          Enter a prompt and generate content to see the preview here.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 