import { NextRequest, NextResponse } from 'next/server'
import { localSEOContentGenerator, BusinessContext } from '@/lib/local-seo-content-generator'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { profileId, businessInfo, contentType, tone } = body
  
  try {
    
    if (!profileId || !businessInfo) {
      return NextResponse.json(
        { error: 'Missing required fields: profileId, businessInfo' },
        { status: 400 }
      )
    }

    console.log(`[Google Content Generator] Generating LOCAL SEO content for profile: ${profileId}`)

    // Convert businessInfo to enhanced BusinessContext
    const businessContext: BusinessContext = {
      name: businessInfo.name || 'Business',
      category: businessInfo.category || 'Service Provider',
      address: businessInfo.address || '',
      website: businessInfo.website,
      phone: businessInfo.phone,
      serviceArea: businessInfo.serviceArea || {
        businessType: businessInfo.businessType,
        places: businessInfo.places || [],
        regionCode: businessInfo.regionCode
      },
      serviceTypes: businessInfo.serviceTypes || [],
      allCategories: businessInfo.allCategories || [],
      businessHours: businessInfo.businessHours || [],
      rating: businessInfo.rating,
      reviewCount: businessInfo.reviewCount
    }

    console.log('[Google Content Generator] Enhanced business context:', {
      name: businessContext.name,
      category: businessContext.category,
      serviceAreaPlaces: businessContext.serviceArea?.places?.length || 0,
      serviceTypes: businessContext.serviceTypes?.length || 0,
      allCategories: businessContext.allCategories?.length || 0
    })

    // Generate enhanced local SEO content
    const enhancedContent = await localSEOContentGenerator.generateOptimizedContent(
      businessContext,
      contentType
    )

    console.log(`[Google Content Generator] LOCAL SEO content generated with:`)
    console.log(`- Service-location pairs: ${enhancedContent.serviceLocationPairs.length}`)
    console.log(`- Local keywords: ${enhancedContent.localKeywords.length}`)
    console.log(`- Hashtags: ${enhancedContent.hashtags.length}`)

    return NextResponse.json({
      success: true,
      content: {
        title: enhancedContent.title,
        description: enhancedContent.description,
        fullContent: `${enhancedContent.title}\n\n${enhancedContent.description}\n\n${enhancedContent.hashtags.join(' ')}`,
        hashtags: enhancedContent.hashtags,
        localKeywords: enhancedContent.localKeywords,
        serviceLocationPairs: enhancedContent.serviceLocationPairs,
        seoOptimized: true
      },
      profileId,
      seoMetadata: {
        localKeywords: enhancedContent.localKeywords,
        serviceLocationPairs: enhancedContent.serviceLocationPairs,
        targetLocations: enhancedContent.serviceLocationPairs.map(p => p.location),
        targetServices: enhancedContent.serviceLocationPairs.map(p => p.service),
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('[Google Content Generator] Error generating content:', error)
    
    // Fallback to template content if ChatGPT fails
    const fallbackContent = generateFallbackContent(body.businessInfo, body.contentType)
    
    return NextResponse.json({
      success: true,
      content: fallbackContent,
      profileId: body.profileId,
      note: 'Generated using fallback template (ChatGPT unavailable)'
    })
  }
}

function generatePrompt(businessInfo: any, contentType: string, tone: string): string {
  const businessName = businessInfo.name || 'Business'
  const businessCategory = businessInfo.category || 'Service Provider'
  const businessAddress = businessInfo.address || ''
  
  const basePrompt = `Create a ${tone} Google Business Profile post for ${businessName}, a ${businessCategory} business located at ${businessAddress}.`
  
  switch (contentType) {
    case 'business_updates':
      return `${basePrompt} 
      
      Create an engaging business update post that:
      - Highlights recent achievements or improvements
      - Showcases the business value proposition
      - Includes a call-to-action for customers
      - Is relevant to the ${businessCategory} industry
      - Uses a ${tone} tone
      
      Format: Start with an engaging title, followed by the post content. Keep it under 300 words total.`
      
    case 'promotional':
      return `${basePrompt}
      
      Create a promotional post that:
      - Promotes a service or special offer
      - Creates urgency or excitement
      - Includes clear benefits for customers
      - Relevant to ${businessCategory} services
      - Uses a ${tone} tone with call-to-action
      
      Format: Start with an engaging title, followed by the post content. Keep it under 300 words total.`
      
    case 'educational':
      return `${basePrompt}
      
      Create an educational post that:
      - Provides valuable tips or insights related to ${businessCategory}
      - Positions the business as an expert
      - Helps customers understand their services better
      - Uses a ${tone} tone
      
      Format: Start with an engaging title, followed by the post content. Keep it under 300 words total.`
      
    default:
      return `${basePrompt} Create an engaging post about the business that would interest potential customers. Use a ${tone} tone and keep it under 300 words.`
  }
}

function generateFallbackContent(businessInfo: any, contentType: string) {
  const businessName = businessInfo.name || 'Our Business'
  
  const templates = {
    business_updates: {
      title: `Exciting Updates from ${businessName}!`,
      description: `We're constantly improving our services to better serve you. Check out what's new at ${businessName} and see how we can help with your needs. Contact us today to learn more about our latest offerings!`
    },
    promotional: {
      title: `Special Offer from ${businessName}`,
      description: `Don't miss out on our latest promotion! ${businessName} is offering exceptional value to our customers. Get in touch today to take advantage of this limited-time offer.`
    },
    educational: {
      title: `Expert Tips from ${businessName}`,
      description: `Our team of experts at ${businessName} wants to share valuable insights with you. Learn from our experience and discover how we can help you achieve your goals.`
    }
  }
  
  return templates[contentType as keyof typeof templates] || templates.business_updates
}
