import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuthService } from '@/lib/google-auth'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const profileId = searchParams.get('profileId')
    const googleBusinessId = searchParams.get('googleBusinessId')

    if (!profileId || !googleBusinessId) {
      return NextResponse.json(
        { error: 'Missing required parameters: profileId and googleBusinessId' },
        { status: 400 }
      )
    }

    // Get authentication
    const authService = GoogleAuthService.getInstance()
    if (!authService.isAuthenticated()) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const accessToken = await authService.getValidAccessToken()
    
    // Extract location ID from googleBusinessId
    const locationMatch = googleBusinessId.match(/locations\/([^\/]+)/)
    if (!locationMatch) {
      return NextResponse.json(
        { error: 'Invalid business ID format' },
        { status: 400 }
      )
    }
    
    const locationId = locationMatch[1]
    const endpoint = `https://mybusinessqanda.googleapis.com/v1/locations/${locationId}/questions`

    console.log('[API] Q&A endpoint:', endpoint)

    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('[API] Q&A response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('[API] Q&A error response:', errorText)
      
      if (response.status === 403) {
        return NextResponse.json({
          success: true,
          questions: [],
          message: 'Q&A not available for this location'
        })
      } else if (response.status === 404) {
        return NextResponse.json({
          success: true,
          questions: [],
          message: 'No questions found for this location'
        })
      }
      
      return NextResponse.json(
        { error: `Google API Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('[API] Q&A success, found:', data.questions?.length || 0, 'questions')
    
    const questions = data.questions || []

    // Load answers for each question
    for (const question of questions) {
      try {
        if (!question.topAnswers || question.topAnswers.length === 0) {
          console.log('[API] Loading answers for question:', question.name)
          const answersEndpoint = `https://mybusinessqanda.googleapis.com/v1/${question.name}/answers`
          const answersResponse = await fetch(answersEndpoint, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          })

          if (answersResponse.ok) {
            const answersData = await answersResponse.json()
            question.topAnswers = answersData.answers || []
            console.log(`[API] Loaded ${question.topAnswers.length} answers for question`)
          } else {
            console.warn('[API] Failed to load answers for question:', question.name, answersResponse.status)
            question.topAnswers = []
          }
        }
      } catch (answerError) {
        console.warn('[API] Failed to load answers for question:', question.name, answerError)
        question.topAnswers = []
      }
    }

    return NextResponse.json({
      success: true,
      questions: questions
    })

  } catch (error) {
    console.error('[API] Q&A error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch questions and answers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 