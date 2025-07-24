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
      businessProfileId,
      businessName,
      postCount,
      startDate,
      frequency,
      postType
    })

    // Validate required fields
    if (!businessProfileId) {
      throw new Error('Missing required field: businessProfileId')
    }
    if (!businessName) {
      throw new Error('Missing required field: businessName')
    }
    if (!startDate) {
      throw new Error('Missing required field: startDate')
    }

    // Load business photos (optional - don't fail if this doesn't work)
    let businessPhotos: any[] = []
    try {
      // Try to find the profile for photos (optional)
      const profile = BusinessProfilesStorage.getProfileByGoogleId(businessProfileId)
      if (profile) {
        console.log('[Bulk Schedule API] Profile found, loading photos...')
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
      } else {
        console.log('[Bulk Schedule API] Profile not found, continuing without photos')
      }
    } catch (error) {
      console.warn('[Bulk Schedule API] Failed to load photos (continuing without photos):', error)
      // Continue without photos - this shouldn't block the entire process
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

    // Natural, specific content templates - no generic language
    const contentTemplates = [
      (topic: string, businessType: string) => 
        `${businessName} provides ${topic} for residential and commercial clients. Our licensed technicians complete each project with attention to detail and use only quality materials. We serve the local area and offer free estimates for all ${businessType.toLowerCase()} work. Call us to schedule your consultation.`,
      
      (topic: string, businessType: string) => 
        `Need ${topic}? ${businessName} has completed over 500 successful projects since opening. We handle everything from initial planning to final cleanup. Our team works Monday through Friday and can accommodate weekend appointments. Contact us for pricing and availability.`,
      
      (topic: string, businessType: string) => 
        `${businessName} specializes in ${topic} using modern equipment and proven techniques. We maintain full insurance coverage and all required permits. Most projects are completed within the quoted timeframe. Request your free quote today and see why customers recommend our services.`,
      
      (topic: string, businessType: string) => 
        `Looking for reliable ${topic}? ${businessName} has served this community for years with honest pricing and quality workmanship. We provide written estimates and stand behind our work with a satisfaction guarantee. Schedule an appointment to discuss your ${businessType.toLowerCase()} needs.`,
      
      (topic: string, businessType: string) => 
        `${businessName} offers ${topic} for both small repairs and large installations. Our crew arrives on time and completes work efficiently without compromising quality. We clean up thoroughly after each job. Call now for same-day estimates on most ${businessType.toLowerCase()} services.`,
      
      (topic: string, businessType: string) => 
        `Professional ${topic} from ${businessName} includes detailed planning and skilled execution. We source materials locally when possible and always follow manufacturer specifications. Our work meets all building codes and inspection requirements. Get your project started with a quick phone call.`,
      
      (topic: string, businessType: string) => 
        `${businessName} delivers ${topic} that lasts. We use established suppliers and maintain high standards on every job site. Our team communicates clearly throughout each project and respects your property. Experience the difference proper ${businessType.toLowerCase()} makes for your investment.`,
      
      (topic: string, businessType: string) => 
        `When you choose ${businessName} for ${topic}, you get experienced professionals who show up prepared. We bring the right tools for each job and complete work according to schedule. Fair pricing and reliable service have earned us referrals from satisfied customers.`
    ]

    console.log('[Bulk Schedule API] Generating posts...')
    for (let i = 0; i < postCount; i++) {
      try {
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
        const businessType = 'business' // Default since we might not have profile
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
      } catch (error) {
        console.error(`[Bulk Schedule API] Error generating post ${i + 1}:`, error)
        throw new Error(`Failed to generate post ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    console.log(`[Bulk Schedule API] Generated ${posts.length} posts, returning to client for scheduling...`)

    // Return the posts to the client - don't try to save them server-side
    // The client will handle saving to localStorage using schedulingService
    return NextResponse.json({
      success: true,
      message: `Generated ${posts.length} SEO posts${businessPhotos.length > 0 ? ' with business photos' : ''}`,
      postsToSchedule: posts, // Send the full post objects to the client
      posts: posts.map(p => ({
        id: `bulk-${Date.now()}-${Math.random()}`,
        content: p.content.substring(0, 150) + '...',
        scheduledDate: p.scheduledDate,
        hasPhoto: !!p.photo,
        photoUrl: p.photo?.url,
        photoDescription: p.photo?.description,
        keywords: p.keywords.slice(0, 5) // Show first 5 keywords
      })),
      photosFound: businessPhotos.length,
      samplePhotos: businessPhotos.slice(0, 3).map(photo => ({
        url: GoogleBusinessAPI.getBestImageUrl(photo) || '',
        description: `${businessName} - Business Photo`
      }))
    })

  } catch (error) {
    console.error('[Bulk Schedule API] Error:', error)
    
    // Return detailed error information for debugging
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json({
      success: false,
      error: 'Failed to bulk schedule posts',
      details: errorDetails.message,
      debug: process.env.NODE_ENV === 'development' ? errorDetails : undefined
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