import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { areaCode } = await request.json()
    
    // Initialize Twilio client
    const twilio = require('twilio')
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )

    console.log('[Twilio API] Searching for available phone numbers in area code:', areaCode)

    // Search for available phone numbers
    const availableNumbers = await client.availablePhoneNumbers('US')
      .local
      .list({
        areaCode: areaCode,
        limit: 10
      })

    if (availableNumbers.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No phone numbers available in area code ${areaCode}`
      }, { status: 404 })
    }

    // Purchase the first available number
    const selectedNumber = availableNumbers[0]
    
    const purchasedNumber = await client.incomingPhoneNumbers.create({
      phoneNumber: selectedNumber.phoneNumber,
      voiceUrl: `${process.env.TWILIO_WEBHOOK_URL || 'https://yourdomain.com/api/twilio/webhook'}`,
      voiceMethod: 'POST',
      statusCallback: `${process.env.TWILIO_WEBHOOK_URL || 'https://yourdomain.com/api/twilio/webhook'}`,
      statusCallbackMethod: 'POST'
    })

    console.log('[Twilio API] Phone number purchased successfully:', purchasedNumber.phoneNumber)

    return NextResponse.json({
      success: true,
      phoneNumber: purchasedNumber.phoneNumber,
      sid: purchasedNumber.sid,
      friendlyName: purchasedNumber.friendlyName
    })

  } catch (error) {
    console.error('[Twilio API] Error purchasing phone number:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to purchase phone number'
    }, { status: 500 })
  }
}

// Get available phone numbers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const areaCode = searchParams.get('areaCode') || '415'
    
    const twilio = require('twilio')
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )

    const availableNumbers = await client.availablePhoneNumbers('US')
      .local
      .list({
        areaCode: areaCode,
        limit: 20
      })

    return NextResponse.json({
      success: true,
      availableNumbers: availableNumbers.map((num: any) => ({
        phoneNumber: num.phoneNumber,
        locality: num.locality,
        region: num.region,
        capabilities: num.capabilities
      }))
    })

  } catch (error) {
    console.error('[Twilio API] Error fetching available numbers:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch available numbers'
    }, { status: 500 })
  }
}
