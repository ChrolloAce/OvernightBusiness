'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Zap, Calendar, RefreshCw } from 'lucide-react'

interface BulkSchedulerProps {
  selectedProfile?: any
}

export function BulkScheduler({ selectedProfile }: BulkSchedulerProps) {
  const [postCount, setPostCount] = useState(10)
  const [startDate, setStartDate] = useState('')
  const [frequency, setFrequency] = useState('daily')
  const [customTopics, setCustomTopics] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)

  // Set default start date to tomorrow
  useState(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setStartDate(tomorrow.toISOString().split('T')[0])
  })

  const generateBulkPosts = async () => {
    if (!selectedProfile || !startDate) return

    setIsGenerating(true)
    setResult(null)

    try {
      const response = await fetch('/api/bulk-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessProfileId: selectedProfile.googleBusinessId,
          businessName: selectedProfile.name,
          postCount,
          startDate,
          frequency,
          customTopics,
          postType: 'update'
        })
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        // Reset form after success
        setPostCount(10)
        setCustomTopics('')
      }
    } catch (error) {
      console.error('Error generating bulk posts:', error)
      setResult({ success: false, error: 'Failed to generate posts' })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          Bulk SEO Scheduler
        </CardTitle>
        <p className="text-sm text-gray-600">Generate multiple SEO posts quickly</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Business Profile */}
        {selectedProfile && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">{selectedProfile.name}</p>
            <p className="text-xs text-blue-700">Selected Business Profile</p>
          </div>
        )}

        {/* Number of Posts */}
        <div>
          <Label htmlFor="postCount">Number of Posts</Label>
          <Input
            id="postCount"
            type="number"
            min="1"
            max="30"
            value={postCount}
            onChange={(e) => setPostCount(parseInt(e.target.value))}
            className="mt-1"
          />
        </div>

        {/* Start Date */}
        <div>
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1"
          />
        </div>

        {/* Frequency */}
        <div>
          <Label>Posting Frequency</Label>
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

        {/* Custom Topics */}
        <div>
          <Label htmlFor="customTopics">Custom Topics (Optional)</Label>
          <textarea
            id="customTopics"
            placeholder="Enter topics separated by commas, e.g. 'Holiday specials, New services'"
            value={customTopics}
            onChange={(e) => setCustomTopics(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank for auto-generated topics</p>
        </div>

        {/* Generate Button */}
        <Button 
          onClick={generateBulkPosts} 
          disabled={!selectedProfile || !startDate || isGenerating}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isGenerating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Zap className="h-4 w-4 mr-2" />
          )}
          Generate {postCount} SEO Posts
        </Button>

        {/* Result */}
        {result && (
          <div className={`p-3 rounded-lg ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            {result.success ? (
              <div>
                <p className="text-sm font-medium text-green-900">✅ Success!</p>
                <p className="text-xs text-green-700">{result.message}</p>
                {result.posts && (
                  <div className="mt-2">
                    <p className="text-xs text-green-600 font-medium">Scheduled Posts:</p>
                    {result.posts.slice(0, 3).map((post: any, i: number) => (
                      <div key={i} className="text-xs text-green-600 mt-1">
                        • {new Date(post.scheduledDate).toLocaleDateString()} - {post.content}
                      </div>
                    ))}
                    {result.posts.length > 3 && (
                      <p className="text-xs text-green-600 mt-1">...and {result.posts.length - 3} more</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-red-900">❌ Error</p>
                <p className="text-xs text-red-700">{result.error}</p>
              </div>
            )}
          </div>
        )}

        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 Posts will be automatically scheduled with SEO-optimized content at random times during business hours for maximum engagement.
          </p>
        </div>
      </CardContent>
    </Card>
  )
} 