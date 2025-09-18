import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Initialize Prisma client
const prisma = new PrismaClient()

// GET call records with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const phoneAssignmentId = searchParams.get('phoneAssignmentId')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    console.log('[Call Records API] Fetching records:', { clientId, phoneAssignmentId, limit })
    
    // Check if database is available
    const isDatabaseAvailable = process.env.DATABASE_URL && process.env.DATABASE_URL !== ''
    
    if (!isDatabaseAvailable) {
      console.log('[Call Records API] Database not configured')
      
      return NextResponse.json({
        success: true,
        callRecords: [],
        source: 'localStorage',
        message: 'Database not configured'
      })
    }
    
    // Build query filters
    const where: any = {}
    
    if (phoneAssignmentId) {
      where.phoneAssignmentId = phoneAssignmentId
    }
    
    if (clientId) {
      where.phoneAssignment = {
        clientId
      }
    }
    
    // Fetch call records
    const callRecords = await prisma.callRecord.findMany({
      where,
      include: {
        phoneAssignment: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })
    
    // Calculate statistics
    const stats = {
      totalCalls: callRecords.length,
      totalDuration: callRecords.reduce((sum, record) => sum + (record.duration || 0), 0),
      averageDuration: callRecords.length > 0 
        ? Math.round(callRecords.reduce((sum, record) => sum + (record.duration || 0), 0) / callRecords.length)
        : 0,
      todaysCalls: callRecords.filter(record => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return new Date(record.createdAt) >= today
      }).length
    }
    
    console.log(`[Call Records API] Found ${callRecords.length} records`)
    
    return NextResponse.json({
      success: true,
      callRecords,
      stats,
      source: 'database'
    })
    
  } catch (error) {
    console.error('[Call Records API] Error fetching records:', error)
    
    return NextResponse.json({
      success: false,
      callRecords: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// POST create new call record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      twilioCallSid,
      phoneAssignmentId,
      fromNumber,
      toNumber,
      forwardedTo,
      status,
      direction
    } = body
    
    console.log('[Call Records API] Creating call record:', {
      twilioCallSid,
      phoneAssignmentId,
      status
    })
    
    // Validate required fields
    if (!twilioCallSid || !phoneAssignmentId || !fromNumber || !toNumber) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 })
    }
    
    // Check if database is available
    const isDatabaseAvailable = process.env.DATABASE_URL && process.env.DATABASE_URL !== ''
    
    if (!isDatabaseAvailable) {
      console.log('[Call Records API] Database not configured, cannot save call record')
      
      return NextResponse.json({
        success: false,
        error: 'Database not configured'
      }, { status: 503 })
    }
    
    // Create call record
    const callRecord = await prisma.callRecord.create({
      data: {
        twilioCallSid,
        phoneAssignmentId,
        fromNumber,
        toNumber,
        forwardedTo: forwardedTo || null,
        status,
        direction: direction || 'inbound'
      },
      include: {
        phoneAssignment: {
          include: {
            client: true
          }
        }
      }
    })
    
    // Update phone assignment's last call time and total calls
    await prisma.phoneAssignment.update({
      where: { id: phoneAssignmentId },
      data: {
        lastCallAt: new Date(),
        totalCalls: {
          increment: 1
        }
      }
    })
    
    console.log('[Call Records API] Call record created:', callRecord.id)
    
    return NextResponse.json({
      success: true,
      callRecord,
      message: 'Call record saved successfully'
    })
    
  } catch (error) {
    console.error('[Call Records API] Error creating record:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create call record'
    }, { status: 500 })
  }
}

// PATCH update call record (for duration, recording URL, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { twilioCallSid, duration, recordingUrl, status } = body
    
    if (!twilioCallSid) {
      return NextResponse.json({
        success: false,
        error: 'Missing twilioCallSid'
      }, { status: 400 })
    }
    
    console.log('[Call Records API] Updating call record:', {
      twilioCallSid,
      duration,
      status
    })
    
    // Check if database is available
    const isDatabaseAvailable = process.env.DATABASE_URL && process.env.DATABASE_URL !== ''
    
    if (!isDatabaseAvailable) {
      console.log('[Call Records API] Database not configured')
      
      return NextResponse.json({
        success: false,
        error: 'Database not configured'
      }, { status: 503 })
    }
    
    // Update call record
    const updateData: any = {}
    
    if (duration !== undefined) updateData.duration = duration
    if (recordingUrl !== undefined) updateData.recordingUrl = recordingUrl
    if (status !== undefined) updateData.status = status
    
    const callRecord = await prisma.callRecord.update({
      where: { twilioCallSid },
      data: updateData
    })
    
    console.log('[Call Records API] Call record updated:', callRecord.id)
    
    return NextResponse.json({
      success: true,
      callRecord,
      message: 'Call record updated successfully'
    })
    
  } catch (error) {
    console.error('[Call Records API] Error updating record:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update call record'
    }, { status: 500 })
  }
}
