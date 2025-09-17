import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extract Twilio webhook data
    const callSid = formData.get('CallSid') as string
    const from = formData.get('From') as string
    const to = formData.get('To') as string
    const callStatus = formData.get('CallStatus') as string
    const direction = formData.get('Direction') as string
    
    console.log('[Twilio Webhook] Incoming call:', {
      callSid,
      from,
      to,
      callStatus,
      direction
    })

    // Forward all incoming calls to the main number: 7862903664
    const forwardToNumber = '+17862903664'
    
    console.log(`[Twilio Webhook] Forwarding call from ${from} to ${forwardToNumber}`)

    // Create TwiML response to forward the call immediately (no greeting message)
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Dial record="true" recordingStatusCallback="/api/twilio/recording-status">
          <Number>${forwardToNumber}</Number>
        </Dial>
        <Say>Sorry, the call could not be completed. Please try again later.</Say>
      </Response>`

    // Log the call attempt
    console.log('[Twilio Webhook] Forwarding call to main number:', forwardToNumber)

    // In a real implementation, you'd save this to the database
    // For now, we'll just log it
    const callRecord = {
      twilioCallSid: callSid,
      fromNumber: from,
      toNumber: to,
      forwardedToNumber: forwardToNumber,
      status: callStatus,
      direction: direction as 'inbound' | 'outbound',
      startTime: new Date().toISOString()
    }

    console.log('[Twilio Webhook] Call record created:', callRecord)

    return new NextResponse(twimlResponse, {
      headers: { 'Content-Type': 'text/xml' }
    })

  } catch (error) {
    console.error('[Twilio Webhook] Error processing webhook:', error)
    
    // Return error TwiML
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>Sorry, there was an error processing your call. Please try again later.</Say>
      </Response>`, {
      headers: { 'Content-Type': 'text/xml' },
      status: 500
    })
  }
}

// Handle call status updates
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const callSid = searchParams.get('CallSid')
  
  return NextResponse.json({
    status: 'Twilio webhook endpoint is active',
    callSid,
    timestamp: new Date().toISOString()
  })
}
