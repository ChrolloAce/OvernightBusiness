import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { jobId, profileId, content, businessInfo, accessToken } = await request.json()

    if (!jobId || !profileId || !content || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log(`[Cron API] Executing job ${jobId} for profile ${profileId}`)

    // Call the existing Google Business Profile API
    const postResponse = await fetch(`${request.nextUrl.origin}/api/google-business/create-post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profileId,
        content,
        businessInfo,
        accessToken
      })
    })

    if (!postResponse.ok) {
      const errorText = await postResponse.text()
      throw new Error(`Failed to create post: ${errorText}`)
    }

    const result = await postResponse.json()
    
    console.log(`[Cron API] Successfully executed job ${jobId} for profile ${profileId}`)
    
    return NextResponse.json({
      success: true,
      jobId,
      profileId,
      post: result
    })

  } catch (error) {
    console.error('[Cron API] Error executing cron job:', error)
    return NextResponse.json(
      { 
        error: 'Failed to execute cron job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check cron job status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID required' },
        { status: 400 }
      )
    }

    // This would typically check job status in a database
    // For now, return a simple response
    return NextResponse.json({
      jobId,
      status: 'active',
      lastRun: new Date().toISOString(),
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })

  } catch (error) {
    console.error('[Cron API] Error checking job status:', error)
    return NextResponse.json(
      { error: 'Failed to check job status' },
      { status: 500 }
    )
  }
}
