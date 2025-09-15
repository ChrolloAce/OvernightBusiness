import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract recording webhook data
    const recordingSid = formData.get('RecordingSid') as string
    const recordingUrl = formData.get('RecordingUrl') as string
    const callSid = formData.get('CallSid') as string
    const recordingStatus = formData.get('RecordingStatus') as string
    const duration = formData.get('RecordingDuration') as string
    
    console.log('[Twilio Recording Webhook] Recording status update:', {
      recordingSid,
      callSid,
      recordingStatus,
      duration
    })

    // In a real implementation, you'd update the database with recording information
    // For now, we'll just log the information
    const recordingData = {
      recordingSid,
      recordingUrl,
      callSid,
      status: recordingStatus,
      duration: parseInt(duration || '0'),
      timestamp: new Date().toISOString()
    }

    console.log('[Twilio Recording Webhook] Recording data:', recordingData)

    // Here you would typically:
    // 1. Find the call record in your database by callSid
    // 2. Update it with the recording information
    // 3. Notify the client that a recording is available

    return NextResponse.json({
      success: true,
      message: 'Recording status updated successfully'
    })

  } catch (error) {
    console.error('[Twilio Recording Webhook] Error processing recording status:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process recording status'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'Twilio recording status webhook is active',
    timestamp: new Date().toISOString()
  })
}
