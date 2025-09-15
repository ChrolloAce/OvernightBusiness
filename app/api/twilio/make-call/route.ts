import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { fromNumber, toNumber, clientId, message } = await request.json()
    
    if (!fromNumber || !toNumber) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: fromNumber and toNumber'
      }, { status: 400 })
    }

    // Initialize Twilio client
    const twilio = require('twilio')
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )

    console.log('[Twilio API] Making call:', { fromNumber, toNumber, clientId })

    // Create TwiML for the call
    const twimlUrl = message 
      ? `/api/twilio/twiml?message=${encodeURIComponent(message)}`
      : '/api/twilio/twiml'

    // Make the call
    const call = await client.calls.create({
      from: fromNumber,
      to: toNumber,
      url: `${process.env.TWILIO_WEBHOOK_URL?.replace('/webhook', '') || 'https://yourdomain.com/api/twilio'}${twimlUrl}`,
      method: 'POST',
      record: true,
      statusCallback: `${process.env.TWILIO_WEBHOOK_URL || 'https://yourdomain.com/api/twilio/webhook'}`,
      statusCallbackMethod: 'POST',
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed']
    })

    console.log('[Twilio API] Call initiated successfully:', call.sid)

    return NextResponse.json({
      success: true,
      callSid: call.sid,
      status: call.status,
      direction: call.direction
    })

  } catch (error) {
    console.error('[Twilio API] Error making call:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to make call'
    }, { status: 500 })
  }
}

// Get call details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const callSid = searchParams.get('callSid')
    
    if (!callSid) {
      return NextResponse.json({
        success: false,
        error: 'Missing callSid parameter'
      }, { status: 400 })
    }

    const twilio = require('twilio')
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )

    const call = await client.calls(callSid).fetch()

    return NextResponse.json({
      success: true,
      call: {
        sid: call.sid,
        from: call.from,
        to: call.to,
        status: call.status,
        direction: call.direction,
        duration: call.duration,
        price: call.price,
        priceUnit: call.priceUnit,
        startTime: call.startTime,
        endTime: call.endTime
      }
    })

  } catch (error) {
    console.error('[Twilio API] Error fetching call details:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch call details'
    }, { status: 500 })
  }
}
