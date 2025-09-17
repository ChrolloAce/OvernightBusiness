import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phoneSid, webhookUrl, clientId } = body
    
    if (!phoneSid || !webhookUrl || !clientId) {
      return NextResponse.json(
        { error: 'Missing required fields: phoneSid, webhookUrl, clientId' },
        { status: 400 }
      )
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    
    if (!accountSid || !authToken) {
      return NextResponse.json(
        { error: 'Twilio credentials not configured' },
        { status: 500 }
      )
    }

    console.log(`[Twilio Update] Updating webhook for phone ${phoneSid} to ${webhookUrl}`)
    
    // Update Twilio phone number configuration
    const updateData = new URLSearchParams({
      VoiceUrl: webhookUrl,
      VoiceMethod: 'POST'
    })
    
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/IncomingPhoneNumbers/${phoneSid}.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: updateData
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Twilio API error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const updatedNumber = await response.json()
    console.log(`[Twilio Update] Successfully updated phone number webhook:`, updatedNumber)

    return NextResponse.json({
      success: true,
      message: `Phone number webhook updated successfully`,
      phoneNumber: updatedNumber.phone_number,
      voiceUrl: updatedNumber.voice_url
    })

  } catch (error) {
    console.error('[Twilio Update] Error updating phone number webhook:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}
