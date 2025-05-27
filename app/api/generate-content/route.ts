import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { prompt, businessName, businessType, businessDescription, postType } = await request.json()

    if (!prompt || !businessName) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt and businessName' },
        { status: 400 }
      )
    }

    // Create a comprehensive system prompt based on the business information
    const systemPrompt = `You are an expert content creator for Google Business Profile posts. You specialize in creating engaging, professional content that drives customer engagement and business growth.

Business Information:
- Business Name: ${businessName}
- Business Type: ${businessType}
- Business Description: ${businessDescription || 'Not provided'}
- Post Type: ${postType}

Guidelines for creating content:
1. Keep posts concise and engaging (150-300 words max)
2. Include relevant keywords naturally
3. Use a friendly, professional tone
4. Include a clear call-to-action when appropriate
5. Make it specific to the business and location
6. Focus on customer benefits and value
7. Use emojis sparingly but effectively
8. Ensure content is authentic and not overly promotional

Post Type Guidelines:
- UPDATE: Share news, behind-the-scenes content, or general business updates
- OFFER: Promote special deals, discounts, or limited-time offers
- EVENT: Announce upcoming events, workshops, or special occasions
- PRODUCT: Highlight new products, services, or featured items

Create content that feels authentic and would genuinely engage local customers.`

    const userPrompt = `Create a ${postType} post for ${businessName} based on this request: ${prompt}

Please generate engaging content that follows Google Business Profile best practices and would appeal to local customers.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const generatedContent = completion.choices[0]?.message?.content

    if (!generatedContent) {
      throw new Error('No content generated')
    }

    return NextResponse.json({
      content: generatedContent.trim(),
      usage: completion.usage
    })

  } catch (error) {
    console.error('Error generating content:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Content generation failed: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while generating content' },
      { status: 500 }
    )
  }
} 