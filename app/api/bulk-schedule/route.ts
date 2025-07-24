import { NextRequest, NextResponse } from 'next/server'
import { CentralizedDataLoader } from '@/lib/centralized-data-loader'
import { BusinessProfilesStorage } from '@/lib/business-profiles-storage'
import { GoogleBusinessAPI } from '@/lib/google-business-api'

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

    // Load business profile and photos
    const profile = BusinessProfilesStorage.getProfile(businessProfileId)
    
    if (!profile) {
      throw new Error('Business profile not found')
    }

    // Load business photos
    let businessPhotos: any[] = []
    try {
      const result = await CentralizedDataLoader.loadAllProfileData(profile, {
        includeMedia: true,
        includeReviews: false,
        includeAnalytics: false,
        includeQA: false,
        includePosts: false
      })

      if (result.success && result.media) {
        businessPhotos = result.media.allPhotos || []
        console.log(`[Bulk Schedule API] Loaded ${businessPhotos.length} business photos`)
      }
    } catch (error) {
      console.warn('[Bulk Schedule API] Failed to load photos:', error)
    }

    const posts = []
    
    // Generate keyword-focused topics
    const keywordTopics = customTopics ? customTopics.split(',').map((t: string) => t.trim()) : [
      `professional ${businessName.toLowerCase()} services`,
      `quality service at ${businessName}`,
      `experienced team at ${businessName}`,
      `trusted ${businessName} experts`,
      `local ${businessName} professionals`,
      `affordable solutions from ${businessName}`,
      `customer satisfaction at ${businessName}`,
      `reliable ${businessName} service`,
      `expert ${businessName} consultation`,
      `comprehensive ${businessName} solutions`,
      `premium ${businessName} quality`,
      `certified ${businessName} specialists`,
      `personalized ${businessName} approach`,
      `industry-leading ${businessName}`,
      `community-focused ${businessName}`,
      `innovative ${businessName} methods`,
      `results-driven ${businessName}`,
      `licensed ${businessName} professionals`,
      `award-winning ${businessName} service`,
      `established ${businessName} reputation`
    ]

    // Human-style content templates without emojis/hashtags
    const contentTemplates = [
      (topic: string, businessType: string) => 
        `Looking for ${topic}? Our team at ${businessName} brings years of experience and dedication to every project. We understand that choosing the right ${businessType.toLowerCase()} is important, which is why we focus on delivering exceptional results that exceed expectations. Contact us today to discuss how we can help with your needs.`,
      
      (topic: string, businessType: string) => 
        `At ${businessName}, we believe in ${topic} that makes a real difference. Our skilled professionals work closely with each client to understand their unique requirements and deliver solutions that truly matter. Whether you need consultation, implementation, or ongoing support, we are here to help you achieve your goals.`,
      
      (topic: string, businessType: string) => 
        `What sets ${businessName} apart is our commitment to ${topic}. We have built our reputation on trust, quality, and results. Our experienced team understands the local market and knows what it takes to deliver outstanding ${businessType.toLowerCase()} services. Let us show you why so many customers choose us for their important projects.`,
      
      (topic: string, businessType: string) => 
        `When you need ${topic}, experience matters. ${businessName} has been serving the community with professional ${businessType.toLowerCase()} services that you can depend on. We take pride in our work and stand behind everything we do. Our team is ready to discuss your project and provide the expert guidance you deserve.`,
      
      (topic: string, businessType: string) => 
        `Discover why ${businessName} is the preferred choice for ${topic}. Our approach combines industry expertise with personalized service to deliver results that make a lasting impact. We understand that every client is unique, and we tailor our ${businessType.toLowerCase()} solutions to meet your specific needs and budget.`,
      
      (topic: string, businessType: string) => 
        `${businessName} is dedicated to providing ${topic} that you can trust. Our certified professionals bring extensive knowledge and proven methods to every engagement. We believe in transparent communication, fair pricing, and delivering on our promises. Get in touch to learn more about how we can assist with your ${businessType.toLowerCase()} needs.`,
      
      (topic: string, businessType: string) => 
        `Looking to partner with professionals who understand ${topic}? ${businessName} offers comprehensive ${businessType.toLowerCase()} solutions designed to meet the highest standards. Our team stays current with industry best practices and uses proven approaches to ensure your success. We would love to discuss your project requirements.`,
      
      (topic: string, businessType: string) => 
        `At ${businessName}, we specialize in ${topic} that delivers measurable results. Our commitment to excellence means we go above and beyond to ensure your complete satisfaction. From initial consultation through project completion, we maintain the highest standards of professionalism and quality in everything we do.`
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

      // Generate human-style content
      const topic = keywordTopics[i % keywordTopics.length]
      const template = contentTemplates[Math.floor(Math.random() * contentTemplates.length)]
      const businessType = profile.category || 'business'
      const content = template(topic, businessType)

      // Randomly select a business photo if available
      let selectedPhoto = null
      if (businessPhotos.length > 0) {
        const randomIndex = Math.floor(Math.random() * businessPhotos.length)
        selectedPhoto = businessPhotos[randomIndex]
      }

      posts.push({
        businessProfileId,
        businessName,
        content,
        postType,
        status: 'scheduled' as const,
        scheduledDate: scheduleDate.toISOString(),
        photo: selectedPhoto ? {
          url: GoogleBusinessAPI.getBestImageUrl(selectedPhoto),
          description: `${businessName} - Professional Services`
        } : null,
        keywords: topic.split(' ').filter((word: string) => word.length > 3), // Extract relevant keywords
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    // Save to scheduling service
    const schedulingService = (await import('@/lib/scheduling-service')).schedulingService
    
    for (const post of posts) {
      await schedulingService.schedulePost({
        businessProfileId: post.businessProfileId,
        businessName: post.businessName,
        content: post.content,
        postType: post.postType,
        status: post.status,
        scheduledDate: post.scheduledDate
      })
    }

    console.log(`[Bulk Schedule API] Successfully scheduled ${posts.length} posts with ${businessPhotos.length > 0 ? 'photos' : 'no photos'}`)

    return NextResponse.json({
      success: true,
      message: `Successfully scheduled ${posts.length} SEO posts${businessPhotos.length > 0 ? ' with business photos' : ''}`,
      posts: posts.map(p => ({
        id: `bulk-${Date.now()}-${Math.random()}`,
        content: p.content.substring(0, 150) + '...',
        scheduledDate: p.scheduledDate,
        hasPhoto: !!p.photo,
        keywords: p.keywords.slice(0, 5) // Show first 5 keywords
      })),
      photosFound: businessPhotos.length
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
    service: 'Bulk Scheduling Service with Photo Integration',
    timestamp: new Date().toISOString()
  })
} 