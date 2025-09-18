import { NextRequest, NextResponse } from 'next/server'
import { firebaseClientService } from '@/lib/firebase/client-service'
import { firebasePhoneService, firebaseCallRecordService } from '@/lib/firebase/phone-service'

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

    // Get client data from Firebase
    let forwardToNumber = '+17862903664' // Default fallback
    let phoneAssignmentId: string | null = null
    
    try {
      // Get client from Firebase
      const client = await firebaseClientService.getClientById(clientId)
      
      if (client && client.phone) {
        forwardToNumber = client.phone
        console.log(`[Client Webhook ${clientId}] Found client ${client.name} with phone: ${client.phone}`)
      } else {
        console.log(`[Client Webhook ${clientId}] Client not found or no phone, using default: ${forwardToNumber}`)
      }
      
      // Find phone assignment for this call
      const phoneAssignments = await firebasePhoneService.getAllPhoneAssignments()
      const phoneAssignment = phoneAssignments.find(assignment => 
        assignment.phoneNumber === to && assignment.clientId === clientId
      )
      
      if (phoneAssignment) {
        phoneAssignmentId = phoneAssignment.twilioSid // Use twilioSid as the ID
        if (phoneAssignment.forwardToNumber) {
          forwardToNumber = phoneAssignment.forwardToNumber
        }
        console.log(`[Client Webhook ${clientId}] Found phone assignment: ${phoneAssignment.phoneNumber}`)
      }
      
    } catch (dbError) {
      console.error(`[Client Webhook ${clientId}] Firebase error, using fallback:`, dbError)
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

    // Save call record to Firebase
    try {
      if (phoneAssignmentId) {
        const callRecord = await firebaseCallRecordService.createCallRecord({
          twilioCallSid: callSid,
          phoneAssignmentId: phoneAssignmentId,
          fromNumber: from,
          toNumber: to,
          forwardedTo: forwardToNumber,
          status: callStatus,
          direction: direction || 'inbound'
        })
        
        console.log(`[Client Webhook ${clientId}] Call record saved to Firebase:`, callRecord.id)
      } else {
        console.log(`[Client Webhook ${clientId}] Call record (no assignment found):`, {
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
