import { NextRequest, NextResponse } from 'next/server'
import { ClientManager } from '@/lib/managers/client-manager'

export async function POST(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  try {
    const { clientId } = params
    const formData = await request.formData()
    
    // Extract Twilio webhook data
    const callSid = formData.get('CallSid') as string
    const from = formData.get('From') as string
    const to = formData.get('To') as string
    const callStatus = formData.get('CallStatus') as string
    const direction = formData.get('Direction') as string
    
    console.log(`[Client Webhook ${clientId}] Incoming call:`, {
      callSid,
      from,
      to,
      callStatus,
      direction
    })

    // Get client data to find their real phone number
    const clientManager = ClientManager.getInstance()
    const client = clientManager.getClient(clientId)
    
    if (!client) {
      console.error(`[Client Webhook] Client not found: ${clientId}`)
      return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say>Sorry, this number is not properly configured.</Say>
        </Response>`, {
        headers: { 'Content-Type': 'text/xml' }
      })
    }

    // Use client's phone number or fallback to default
    const forwardToNumber = client.phone || '+17862903664'
    
    console.log(`[Client Webhook ${clientId}] Forwarding call to client phone: ${forwardToNumber}`)

    // Create TwiML response to forward the call to client's number
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Dial record="true" recordingStatusCallback="/api/twilio/recording-status/${clientId}">
          <Number>${forwardToNumber}</Number>
        </Dial>
        <Say>Sorry, the call could not be completed. Please try again later.</Say>
      </Response>`

    // Save call record for analytics
    const callRecord = {
      clientId: clientId,
      twilioCallSid: callSid,
      fromNumber: from,
      toNumber: to, // This is the tracking number
      forwardedToNumber: forwardToNumber, // Client's real number
      status: callStatus,
      direction: direction as 'inbound' | 'outbound',
      startTime: new Date().toISOString()
    }

    // Store call record in localStorage (in production, use database)
    const existingCalls = JSON.parse(localStorage.getItem(`client_calls_${clientId}`) || '[]')
    existingCalls.push(callRecord)
    localStorage.setItem(`client_calls_${clientId}`, JSON.stringify(existingCalls))

    console.log(`[Client Webhook ${clientId}] Call record saved:`, callRecord)

    return new NextResponse(twimlResponse, {
      headers: { 'Content-Type': 'text/xml' }
    })

  } catch (error) {
    console.error(`[Client Webhook] Error processing webhook for client ${params.clientId}:`, error)
    
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

// Handle call status updates and recording status
export async function GET(
  request: NextRequest,
  { params }: { params: { clientId: string } }
) {
  const { searchParams } = new URL(request.url)
  const callSid = searchParams.get('CallSid')
  
  return NextResponse.json({
    status: `Client webhook endpoint active for ${params.clientId}`,
    callSid,
    timestamp: new Date().toISOString()
  })
}
