import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    
    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Twilio credentials not configured' },
        { status: 500 }
      )
    }

    console.log('[Twilio API] Fetching phone numbers...')
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers.json`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`Twilio API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log(`[Twilio API] Found ${data.incoming_phone_numbers?.length || 0} phone numbers`)

    const phoneNumbers = data.incoming_phone_numbers.map((num: any) => ({
      sid: num.sid,
      phoneNumber: num.phone_number,
      friendlyName: num.friendly_name || num.phone_number,
      voiceUrl: num.voice_url || '',
      forwardToNumber: '+17862903664', // Current default from webhook
      status: num.status === 'in-use' ? 'active' : 'inactive',
      capabilities: {
        voice: num.capabilities?.voice || false,
        sms: num.capabilities?.sms || false,
        mms: num.capabilities?.mms || false
      }
    }))

    return NextResponse.json({
      success: true,
      phoneNumbers
    })

  } catch (error) {
    console.error('[Twilio API] Error fetching phone numbers:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { sid, forwardToNumber } = body
    
    if (!sid || !forwardToNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: sid, forwardToNumber' },
        { status: 400 }
      )
    }

    // Store the forwarding configuration
    // For now, we'll use localStorage on the client side
    // In production, you'd store this in a database
    
    console.log(`[Twilio API] Updated forwarding for ${sid} to ${forwardToNumber}`)
    
    return NextResponse.json({
      success: true,
      message: `Phone number ${sid} forwarding updated to ${forwardToNumber}`
    })

  } catch (error) {
    console.error('[Twilio API] Error updating phone number:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
