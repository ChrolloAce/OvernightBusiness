import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { 
      businessProfileId, 
      businessName, 
      postCount = 5, 
      startDate, 
      frequency = 'daily',
      customTopics = '',
      postType = 'update'
    } = await request.json()

    console.log('[Bulk Schedule API] Generating bulk posts:', {
      businessName,
      postCount,
      startDate,
      frequency
    })

    const posts = []
    
    // SEO-focused post topics
    const seoTopics = customTopics ? customTopics.split(',').map((t: string) => t.trim()) : [
      `Special offers at ${businessName}`,
      `Why choose ${businessName} for your needs`,
      `Behind the scenes at ${businessName}`,
      `Customer success stories from ${businessName}`,
      `Tips and advice from ${businessName} experts`,
      `What's new at ${businessName} this month`,
      `The ${businessName} difference explained`,
      `Local community involvement by ${businessName}`,
      `Seasonal services at ${businessName}`,
      `Professional expertise at ${businessName}`,
      `Quality service at ${businessName}`,
      `Customer testimonials for ${businessName}`,
      `Local expertise from ${businessName}`,
      `Trusted professionals at ${businessName}`,
      `Community-focused ${businessName}`
    ]

    // Generate SEO content templates
    const seoTemplates = [
      (topic: string) => `🌟 ${topic}! At ${businessName}, we're committed to excellence. Contact us today to learn more about our services. #${businessName.replace(/\s+/g, '')} #LocalBusiness #Quality`,
      (topic: string) => `✨ Discover what makes ${businessName} special! ${topic}. We're here to serve our community with dedication and expertise. #CommunityFirst #${businessName.replace(/\s+/g, '')}`,
      (topic: string) => `💼 ${topic}. ${businessName} has been proudly serving our customers with professional service and competitive prices. Get in touch! #Professional #${businessName.replace(/\s+/g, '')}`,
      (topic: string) => `🎯 ${topic}. Trust ${businessName} for reliable, high-quality service. We're locally owned and operated. Call us today! #LocallyOwned #Trusted #${businessName.replace(/\s+/g, '')}`,
      (topic: string) => `🏆 ${topic}. At ${businessName}, customer satisfaction is our top priority. Experience the difference quality makes! #CustomerFirst #Excellence #${businessName.replace(/\s+/g, '')}`,
      (topic: string) => `⭐ ${topic}. Choose ${businessName} for exceptional service and unmatched expertise in our field. We're here for you! #Exceptional #${businessName.replace(/\s+/g, '')}`,
      (topic: string) => `🚀 ${topic}. ${businessName} continues to innovate and provide top-tier service to our valued customers. #Innovation #${businessName.replace(/\s+/g, '')}`,
      (topic: string) => `💯 ${topic}. At ${businessName}, we go above and beyond to ensure your complete satisfaction. Contact us! #AboveAndBeyond #${businessName.replace(/\s+/g, '')}`,
    ]

    for (let i = 0; i < postCount; i++) {
      // Calculate schedule date
      const scheduleDate = new Date(startDate)
      
      switch (frequency) {
        case 'daily':
          scheduleDate.setDate(scheduleDate.getDate() + i)
          break
        case 'every2days':
          scheduleDate.setDate(scheduleDate.getDate() + (i * 2))
          break
        case 'weekly':
          scheduleDate.setDate(scheduleDate.getDate() + (i * 7))
          break
      }

      // Random time between 9 AM and 5 PM for better engagement
      const hour = 9 + Math.floor(Math.random() * 8)
      const minute = Math.floor(Math.random() * 60)
      scheduleDate.setHours(hour, minute, 0, 0)

      // Generate SEO content
      const topic = seoTopics[i % seoTopics.length]
      const template = seoTemplates[Math.floor(Math.random() * seoTemplates.length)]
      const content = template(topic)

      posts.push({
        id: `bulk-${Date.now()}-${i}`,
        businessProfileId,
        businessName,
        content,
        postType,
        status: 'scheduled' as const,
        scheduledDate: scheduleDate.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    // Save to scheduling service
    const schedulingService = (await import('@/lib/scheduling-service')).schedulingService
    
    for (const post of posts) {
      await schedulingService.schedulePost(post)
    }

    console.log(`[Bulk Schedule API] Successfully scheduled ${posts.length} posts`)

    return NextResponse.json({
      success: true,
      message: `Successfully scheduled ${posts.length} SEO posts`,
      posts: posts.map(p => ({
        id: p.id,
        content: p.content.substring(0, 100) + '...',
        scheduledDate: p.scheduledDate
      }))
    })

  } catch (error) {
    console.error('[Bulk Schedule API] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to bulk schedule posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Bulk Scheduling Service',
    timestamp: new Date().toISOString()
  })
} 