'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  PenTool, 
  Calendar, 
  Send, 
  Clock, 
  Building2, 
  Sparkles, 
  FileText, 
  Image, 
  Video, 
  Link,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BusinessProfilesStorage, SavedBusinessProfile } from '@/lib/business-profiles-storage'

interface ContentPost {
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

interface ContentIdea {
  title: string
  description: string
  type: 'update' | 'offer' | 'event' | 'product'
  category: string
}

export default function ContentHubPage() {
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

  // Content ideas based on business type
  const contentIdeas: ContentIdea[] = [
    { title: 'Weekly Special Offer', description: 'Promote a limited-time discount or deal', type: 'offer', category: 'Promotion' },
    { title: 'Behind the Scenes', description: 'Show your team at work or business operations', type: 'update', category: 'Engagement' },
    { title: 'Customer Spotlight', description: 'Feature a happy customer or testimonial', type: 'update', category: 'Social Proof' },
    { title: 'New Product Launch', description: 'Announce a new product or service', type: 'product', category: 'Announcement' },
    { title: 'Upcoming Event', description: 'Promote an event or workshop', type: 'event', category: 'Event' },
    { title: 'Tips & Advice', description: 'Share industry expertise and helpful tips', type: 'update', category: 'Education' },
    { title: 'Seasonal Content', description: 'Holiday or seasonal themed posts', type: 'update', category: 'Seasonal' },
    { title: 'Community Involvement', description: 'Share local community activities', type: 'update', category: 'Community' }
  ]

  useEffect(() => {
    loadBusinessProfiles()
    loadPosts()
  }, [])

  const loadBusinessProfiles = () => {
    const profiles = BusinessProfilesStorage.getAllProfiles()
    setBusinessProfiles(profiles)
    if (profiles.length > 0 && !selectedProfile) {
      setSelectedProfile(profiles[0])
    }
  }

  const loadPosts = () => {
    // Load posts from localStorage
    const savedPosts = localStorage.getItem('overnight_biz_content_posts')
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts))
    }
  }

  const savePosts = (updatedPosts: ContentPost[]) => {
    localStorage.setItem('overnight_biz_content_posts', JSON.stringify(updatedPosts))
    setPosts(updatedPosts)
  }

  const generateContent = async () => {
    if (!selectedProfile || !contentPrompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: contentPrompt,
          businessName: selectedProfile.name,
          businessType: selectedProfile.category,
          businessDescription: selectedProfile.googleData?.businessDescription || '',
          postType: postType
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate content')
      }

      const data = await response.json()
      setGeneratedContent(data.content)
    } catch (error) {
      console.error('Error generating content:', error)
      alert('Failed to generate content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const createPost = () => {
    if (!selectedProfile || !generatedContent.trim()) return

    const newPost: ContentPost = {
      id: Date.now().toString(),
      businessProfileId: selectedProfile.id,
      businessName: selectedProfile.name,
      title: contentPrompt.slice(0, 50) + (contentPrompt.length > 50 ? '...' : ''),
      content: generatedContent,
      type: postType,
      status: scheduledDate ? 'scheduled' : 'draft',
      scheduledDate: scheduledDate || undefined,
      callToAction: callToAction.text && callToAction.url ? callToAction : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const updatedPosts = [...posts, newPost]
    savePosts(updatedPosts)
    
    // Reset form
    setShowCreateForm(false)
    setGeneratedContent('')
    setContentPrompt('')
    setScheduledDate('')
    setCallToAction({ text: '', url: '' })
  }

  const deletePost = (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      const updatedPosts = posts.filter(p => p.id !== postId)
      savePosts(updatedPosts)
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'offer': return <Sparkles className="h-4 w-4" />
      case 'event': return <Calendar className="h-4 w-4" />
      case 'product': return <Building2 className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const filteredPosts = selectedProfile 
    ? posts.filter(p => p.businessProfileId === selectedProfile.id)
    : posts

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
                  onClick={() => setSelectedProfile(profile)}
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
                    onClick={() => {
                      setContentPrompt(idea.description)
                      setPostType(idea.type)
                      setShowCreateForm(true)
                    }}
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
                  {filteredPosts.length} posts
                </Badge>
              </CardTitle>
              <CardDescription>
                Manage your content posts for {selectedProfile.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPosts.length > 0 ? (
                <div className="space-y-4">
                  {filteredPosts.map((post) => (
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
                              onClick={() => deletePost(post.id)}
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
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)}>
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
                      onClick={generateContent} 
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
                          <Button onClick={createPost} className="flex-1">
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