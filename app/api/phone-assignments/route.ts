import { NextRequest, NextResponse } from 'next/server'
import { firebasePhoneService } from '@/lib/firebase/phone-service'
import { firebaseClientService } from '@/lib/firebase/client-service'

// GET all phone assignments
export async function GET(request: NextRequest) {
  try {
    console.log('[Phone Assignments API] Fetching all assignments from Firebase')
    
    // Fetch from Firebase
    const assignments = await firebasePhoneService.getAllPhoneAssignments()
    
    // Enrich with client data
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        if (assignment.clientId) {
          const client = await firebaseClientService.getClientById(assignment.clientId)
          return {
            ...assignment,
            client: client ? {
              id: client.id,
              name: client.name,
              phone: client.phone,
              email: client.email,
              website: client.website
            } : null
          }
        }
        return { ...assignment, client: null }
      })
    )
    
    console.log(`[Phone Assignments API] Found ${assignments.length} assignments`)
    
    return NextResponse.json({
      success: true,
      assignments: enrichedAssignments,
      source: 'firebase'
    })
    
  } catch (error) {
    console.error('[Phone Assignments API] Error fetching assignments:', error)
    
    // If database error, return empty array with error flag
    return NextResponse.json({
      success: false,
      assignments: [],
      source: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// POST create or update phone assignment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { twilioSid, phoneNumber, clientId, forwardToNumber } = body
    
    console.log('[Phone Assignments API] Creating/updating assignment:', {
      twilioSid,
      phoneNumber,
      clientId,
      forwardToNumber
    })
    
    // Validate required fields
    if (!twilioSid || !phoneNumber) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: twilioSid and phoneNumber'
      }, { status: 400 })
    }
    
    // Get client data if clientId provided
    let clientName: string | undefined
    if (clientId) {
      const client = await firebaseClientService.getClientById(clientId)
      clientName = client?.name
      
      // Use client's phone as forward number if not provided
      if (!forwardToNumber && client?.phone) {
        forwardToNumber = client.phone
      }
    }
    
    // Upsert phone assignment in Firebase
    const assignment = await firebasePhoneService.upsertPhoneAssignment({
      twilioSid,
      phoneNumber,
      clientId: clientId || undefined,
      clientName,
      forwardToNumber: forwardToNumber || undefined,
      isActive: true,
      webhookUrl: clientId 
        ? `https://overnight-business.vercel.app/api/twilio/client-webhook/${clientId}`
        : 'https://overnight-business.vercel.app/api/twilio/webhook'
    })
    
    console.log('[Phone Assignments API] Assignment saved:', assignment)
    
    // Also update Twilio webhook configuration
    if (clientId) {
      try {
        const webhookResponse = await fetch('https://overnight-business.vercel.app/api/twilio/update-webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            phoneSid: twilioSid,
            webhookUrl: assignment.webhookUrl,
            clientId
          })
        })
        
        const webhookResult = await webhookResponse.json()
        
        if (!webhookResult.success) {
          console.error('[Phone Assignments API] Failed to update Twilio webhook:', webhookResult.error)
        } else {
          console.log('[Phone Assignments API] Twilio webhook updated successfully')
        }
      } catch (twilioError) {
        console.error('[Phone Assignments API] Error updating Twilio webhook:', twilioError)
      }
    }
    
    // Add client data to response
    const client = clientId ? await firebaseClientService.getClientById(clientId) : null
    
    return NextResponse.json({
      success: true,
      assignment: {
        ...assignment,
        client: client ? {
          id: client.id,
          name: client.name,
          phone: client.phone,
          email: client.email
        } : null
      },
      message: 'Phone assignment saved successfully'
    })
    
  } catch (error) {
    console.error('[Phone Assignments API] Error saving assignment:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save assignment'
    }, { status: 500 })
  }
}

// DELETE remove phone assignment
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const twilioSid = searchParams.get('twilioSid')
    
    if (!twilioSid) {
      return NextResponse.json({
        success: false,
        error: 'Missing twilioSid parameter'
      }, { status: 400 })
    }
    
    console.log('[Phone Assignments API] Deleting assignment:', twilioSid)
    
    // Delete from Firebase
    await firebasePhoneService.deletePhoneAssignment(twilioSid)
    
    // Reset Twilio webhook to default
    try {
      const webhookResponse = await fetch('https://overnight-business.vercel.app/api/twilio/update-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneSid: twilioSid,
          webhookUrl: 'https://overnight-business.vercel.app/api/twilio/webhook',
          clientId: null
        })
      })
      
      const webhookResult = await webhookResponse.json()
      
      if (!webhookResult.success) {
        console.error('[Phone Assignments API] Failed to reset Twilio webhook:', webhookResult.error)
      }
    } catch (twilioError) {
      console.error('[Phone Assignments API] Error resetting Twilio webhook:', twilioError)
    }
    
    console.log('[Phone Assignments API] Assignment deleted successfully')
    
    return NextResponse.json({
      success: true,
      message: 'Phone assignment deleted successfully'
    })
    
  } catch (error) {
    console.error('[Phone Assignments API] Error deleting assignment:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete assignment'
    }, { status: 500 })
  }
}
