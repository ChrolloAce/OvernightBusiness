import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { callSid: string } }) {
  try {
    const { callSid } = params
    
    if (!callSid) {
      return NextResponse.json({
        success: false,
        error: 'Missing call SID'
      }, { status: 400 })
    }

    // Initialize Twilio client
    const twilio = require('twilio')
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )

    console.log('[Twilio API] Fetching recordings for call:', callSid)

    // Get recordings for this call
    const recordings = await client.recordings.list({
      callSid: callSid,
      limit: 10
    })

    if (recordings.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No recordings found for this call'
      }, { status: 404 })
    }

    // Get the most recent recording
    const recording = recordings[0]
    const recordingUrl = `https://api.twilio.com${recording.uri.replace('.json', '.mp3')}`

    console.log('[Twilio API] Recording found:', recording.sid)

    return NextResponse.json({
      success: true,
      recordingUrl,
      recordingSid: recording.sid,
      duration: recording.duration,
      dateCreated: recording.dateCreated,
      callSid: recording.callSid
    })

  } catch (error) {
    console.error('[Twilio API] Error fetching recording:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch recording'
    }, { status: 500 })
  }
}
