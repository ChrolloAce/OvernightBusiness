'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Badge } from '@/components/ui/badge'
import { 
  CalendarPlus, 
  Zap, 
  X, 
  Clock, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  Camera,
  Tags,
  TrendingUp
} from 'lucide-react'

interface BulkScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  selectedProfile: any
}

export function BulkScheduleModal({ isOpen, onClose, selectedProfile }: BulkScheduleModalProps) {
  const [postCount, setPostCount] = useState(10)
  const [startDate, setStartDate] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [customTopics, setCustomTopics] = useState('')
  const [postType, setPostType] = useState('update')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProfile || !startDate) return

    setIsGenerating(true)
    setResult(null)

    try {
      const response = await fetch('/api/bulk-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfileId: selectedProfile.id,
          businessName: selectedProfile.name,
          postCount: parseInt(postCount.toString()),
          startDate,
          frequency,
          customTopics,
          postType
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setResult(data)
      } else {
        throw new Error(data.error || 'Failed to bulk schedule posts')
      }
    } catch (error) {
      console.error('Bulk scheduling error:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create bulk posts'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const resetForm = () => {
    setResult(null)
    setPostCount(10)
    setStartDate('')
    setFrequency('daily')
    setCustomTopics('')
    setPostType('update')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-white/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Bulk Schedule SEO Posts
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {!result ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Business Info */}
              {selectedProfile && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-blue-900">{selectedProfile.name}</h3>
                  <p className="text-sm text-blue-700">{selectedProfile.category}</p>
                  <Badge variant="secondary" className="mt-2">
                    Profile: {selectedProfile.id}
                  </Badge>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postCount">Number of Posts</Label>
                  <Input
                    id="postCount"
                    type="number"
                    min="1"
                    max="30"
                    value={postCount}
                    onChange={(e) => setPostCount(parseInt(e.target.value) || 1)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">1-30 posts maximum</p>
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="every2days">Every 2 Days</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Post Type</Label>
                  <Select value={postType} onValueChange={(value) => setPostType(value as 'update' | 'offer' | 'event' | 'product')}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="update">Standard Post</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="offer">Offer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="customTopics">Custom Topics (Optional)</Label>
                <textarea
                  id="customTopics"
                  value={customTopics}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomTopics(e.target.value)}
                  placeholder="Enter custom topics separated by commas (e.g., summer services, new equipment, special pricing)"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px] resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use AI-generated SEO topics
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-900">Enhanced SEO Features</span>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <Camera className="w-3 h-3" />
                    Automatically includes business photos when available
                  </li>
                  <li className="flex items-center gap-2">
                    <Tags className="w-3 h-3" />
                    Human-style content with keyword optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Random posting times (9 AM - 5 PM) for better engagement
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={isGenerating || !selectedProfile || !startDate}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating {postCount} SEO Posts...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Generate & Schedule {postCount} Posts
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {result.success ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Success!</span>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="text-green-800 font-medium">{result.message}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{result.posts?.length || 0}</div>
                        <div className="text-sm text-green-700">Posts Scheduled</div>
                      </div>
                      
                      {result.photosFound !== undefined && (
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{result.photosFound}</div>
                          <div className="text-sm text-blue-700">
                            <Camera className="w-3 h-3 inline mr-1" />
                            Photos Available
                          </div>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {frequency === 'daily' ? postCount : 
                           frequency === 'every2days' ? postCount * 2 : 
                           postCount * 7}
                        </div>
                        <div className="text-sm text-purple-700">Days of Content</div>
                      </div>
                    </div>
                  </div>

                  {result.posts && result.posts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <CalendarPlus className="w-4 h-4" />
                        Scheduled Posts Preview
                      </h4>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {result.posts.slice(0, 5).map((post: any, index: number) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-3 border">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-sm text-gray-800">{post.content}</p>
                                {post.keywords && post.keywords.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {post.keywords.map((keyword: string, i: number) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {keyword}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div className="text-right text-xs text-gray-500 flex-shrink-0">
                                <div>{new Date(post.scheduledDate).toLocaleDateString()}</div>
                                <div>{new Date(post.scheduledDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                {post.hasPhoto && (
                                  <Badge variant="outline" className="mt-1">
                                    <Camera className="w-3 h-3 mr-1" />
                                    Photo
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {result.posts.length > 5 && (
                          <div className="text-center text-sm text-gray-500 py-2">
                            ... and {result.posts.length - 5} more posts
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">Error</span>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-red-800">{result.error}</p>
                    {result.details && (
                      <p className="text-sm text-red-600 mt-2">{result.details}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={resetForm}
                  variant="outline"
                  className="flex-1"
                >
                  Create More Posts
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1"
                >
                  Done
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 