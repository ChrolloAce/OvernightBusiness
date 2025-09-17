import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profileId, businessInfo, contentType, tone } = body
    
    if (!profileId || !businessInfo) {
      return NextResponse.json(
        { error: 'Missing required fields: profileId, businessInfo' },
        { status: 400 }
      )
    }

    console.log(`[Google Content Generator] Generating content for profile: ${profileId}`)

    // Prepare ChatGPT prompt based on business info and content type
    const prompt = generatePrompt(businessInfo, contentType, tone)
    
    // Call OpenAI API (you'll need to add OPENAI_API_KEY to your environment)
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional content creator specializing in Google Business Profile posts. Create engaging, relevant content that drives customer engagement and showcases the business value.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const generatedContent = openaiData.choices[0]?.message?.content

    if (!generatedContent) {
      throw new Error('No content generated from ChatGPT')
    }

    console.log(`[Google Content Generator] Content generated successfully for ${profileId}`)

    // Parse the generated content to extract title and description
    const contentLines = generatedContent.trim().split('\n').filter(line => line.trim())
    const title = contentLines[0]?.replace(/^(Title:|Post:)\s*/i, '').substring(0, 100)
    const description = contentLines.slice(1).join('\n').substring(0, 1500)

    return NextResponse.json({
      success: true,
      content: {
        title: title || 'Business Update',
        description: description || generatedContent,
        fullContent: generatedContent
      },
      profileId
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
