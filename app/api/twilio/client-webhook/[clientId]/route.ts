import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

    // Try to get client data from database first
    let forwardToNumber = '+17862903664' // Default fallback
    let phoneAssignmentId: string | null = null
    
    try {
      // Check if database is available
      if (process.env.DATABASE_URL) {
        // Get client from database
        const client = await prisma.client.findUnique({
          where: { id: clientId },
          select: {
            id: true,
            name: true,
            phone: true
          }
        })
        
        if (client && client.phone) {
          forwardToNumber = client.phone
          console.log(`[Client Webhook ${clientId}] Found client ${client.name} with phone: ${client.phone}`)
        } else {
          console.log(`[Client Webhook ${clientId}] Client not found or no phone, using default: ${forwardToNumber}`)
        }
        
        // Find phone assignment for this call
        const phoneAssignment = await prisma.phoneAssignment.findFirst({
          where: {
            phoneNumber: to,
            clientId: clientId
          }
        })
        
        if (phoneAssignment) {
          phoneAssignmentId = phoneAssignment.id
          if (phoneAssignment.forwardToNumber) {
            forwardToNumber = phoneAssignment.forwardToNumber
          }
        }
      } else {
        console.log(`[Client Webhook ${clientId}] Database not configured, using default forwarding`)
      }
    } catch (dbError) {
      console.error(`[Client Webhook ${clientId}] Database error, using fallback:`, dbError)
    }
    
    console.log(`[Client Webhook ${clientId}] Forwarding call to client phone: ${forwardToNumber}`)

    // Create TwiML response to forward the call to client's number
    const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Dial record="true" recordingStatusCallback="/api/twilio/recording-status/${clientId}">
          <Number>${forwardToNumber}</Number>
        </Dial>
        <Say>Sorry, the call could not be completed. Please try again later.</Say>
      </Response>`

    // Save call record to database
    try {
      if (process.env.DATABASE_URL && phoneAssignmentId) {
        const callRecord = await prisma.callRecord.create({
          data: {
            twilioCallSid: callSid,
            phoneAssignmentId: phoneAssignmentId,
            fromNumber: from,
            toNumber: to,
            forwardedTo: forwardToNumber,
            status: callStatus,
            direction: direction || 'inbound'
          }
        })
        
        console.log(`[Client Webhook ${clientId}] Call record saved to database:`, callRecord.id)
      } else {
        console.log(`[Client Webhook ${clientId}] Call record (not saved):`, {
          clientId,
          callSid,
          from,
          to,
          forwardedTo: forwardToNumber,
          status: callStatus
        })
      }
    } catch (recordError) {
      console.error(`[Client Webhook ${clientId}] Failed to save call record:`, recordError)
    }

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
