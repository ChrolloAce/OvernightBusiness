import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client with error handling
let openai: OpenAI | null = null

try {
  const apiKey = process.env.OPENAI_API_KEY
  if (apiKey) {
    openai = new OpenAI({
      apiKey: apiKey,
    })
  }
} catch (error) {
  console.warn('OpenAI client initialization failed:', error)
}

export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI is available
    if (!openai) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { prompt, businessName, businessType, businessDescription, postType } = body

    if (!prompt || !businessName || !businessType) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, businessName, businessType' },
        { status: 400 }
      )
    }

    // Create a comprehensive prompt for the AI
    const systemPrompt = `You are a professional social media content creator specializing in Google Business Profile posts. Create engaging, authentic content that drives customer engagement and reflects the business's personality.

Guidelines:
- Keep posts concise but engaging (150-300 words)
- Include relevant keywords naturally
- Use a friendly, professional tone
- Include a clear call-to-action when appropriate
- Make it specific to the business type and context
- Avoid overly promotional language
- Focus on value for customers`

    const userPrompt = `Create a ${postType} post for "${businessName}", which is a ${businessType} business.
    ${businessDescription ? `Business description: ${businessDescription}` : ''}
    
    Content request: ${prompt}
    
    Please create engaging content that would work well as a Google Business Profile post.`

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

    const content = completion.choices[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'Failed to generate content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ content })

  } catch (error) {
    console.error('Content generation error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Content generation failed: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred during content generation' },
      { status: 500 }
    )
  }
} 