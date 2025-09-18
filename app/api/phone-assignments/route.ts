import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Initialize Prisma client
const prisma = new PrismaClient()

// GET all phone assignments
export async function GET(request: NextRequest) {
  try {
    console.log('[Phone Assignments API] Fetching all assignments')
    
    // Check if database is available
    const isDatabaseAvailable = process.env.DATABASE_URL && process.env.DATABASE_URL !== ''
    
    if (!isDatabaseAvailable) {
      console.log('[Phone Assignments API] Database not configured, using localStorage fallback')
      
      // Fallback to localStorage data for now
      return NextResponse.json({
        success: true,
        assignments: [],
        source: 'localStorage',
        message: 'Database not configured, returning empty assignments'
      })
    }
    
    // Fetch from database
    const assignments = await prisma.phoneAssignment.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            website: true
          }
        },
        _count: {
          select: {
            callRecords: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    console.log(`[Phone Assignments API] Found ${assignments.length} assignments`)
    
    return NextResponse.json({
      success: true,
      assignments,
      source: 'database'
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
    
    // Check if database is available
    const isDatabaseAvailable = process.env.DATABASE_URL && process.env.DATABASE_URL !== ''
    
    if (!isDatabaseAvailable) {
      console.log('[Phone Assignments API] Database not configured, cannot save assignment')
      
      return NextResponse.json({
        success: false,
        error: 'Database not configured. Phone assignments require database connection.',
        requiresDatabase: true
      }, { status: 503 })
    }
    
    // Upsert phone assignment in database
    const assignment = await prisma.phoneAssignment.upsert({
      where: { twilioSid },
      create: {
        twilioSid,
        phoneNumber,
        clientId: clientId || null,
        forwardToNumber: forwardToNumber || null,
        isActive: true,
        webhookUrl: clientId 
          ? `https://overnight-business.vercel.app/api/twilio/client-webhook/${clientId}`
          : 'https://overnight-business.vercel.app/api/twilio/webhook'
      },
      update: {
        clientId: clientId || null,
        forwardToNumber: forwardToNumber || null,
        webhookUrl: clientId 
          ? `https://overnight-business.vercel.app/api/twilio/client-webhook/${clientId}`
          : 'https://overnight-business.vercel.app/api/twilio/webhook',
        updatedAt: new Date()
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        }
      }
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
    
    return NextResponse.json({
      success: true,
      assignment,
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
    
    // Check if database is available
    const isDatabaseAvailable = process.env.DATABASE_URL && process.env.DATABASE_URL !== ''
    
    if (!isDatabaseAvailable) {
      console.log('[Phone Assignments API] Database not configured')
      
      return NextResponse.json({
        success: false,
        error: 'Database not configured'
      }, { status: 503 })
    }
    
    // Delete from database
    await prisma.phoneAssignment.delete({
      where: { twilioSid }
    })
    
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
