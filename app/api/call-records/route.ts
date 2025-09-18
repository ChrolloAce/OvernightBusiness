import { NextRequest, NextResponse } from 'next/server'
import { firebaseCallRecordService } from '@/lib/firebase/phone-service'
import { getCurrentCompanyId } from '@/lib/firebase'

// GET call records with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const phoneAssignmentId = searchParams.get('phoneAssignmentId')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    console.log('[Call Records API] Fetching records:', { clientId, phoneAssignmentId, limit })
    
    // Fetch call records from Firebase
    const callRecords = await firebaseCallRecordService.getCallRecords({
      phoneAssignmentId: phoneAssignmentId || undefined,
      clientId: clientId || undefined,
      limit
    })
    
    // Calculate statistics
    const stats = await firebaseCallRecordService.getCallStatistics(phoneAssignmentId || undefined)
    
    console.log(`[Call Records API] Found ${callRecords.length} records`)
    
    return NextResponse.json({
      success: true,
      callRecords,
      stats,
      source: 'firebase'
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
    
    // Create call record in Firebase
    const callRecord = await firebaseCallRecordService.createCallRecord({
      companyId: getCurrentCompanyId(),
      twilioCallSid,
      phoneAssignmentId,
      fromNumber,
      toNumber,
      forwardedTo: forwardedTo || undefined,
      status,
      direction: direction || 'inbound'
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
    
    // Update call record in Firebase
    const updateData: any = {}
    
    if (duration !== undefined) updateData.duration = duration
    if (recordingUrl !== undefined) updateData.recordingUrl = recordingUrl
    if (status !== undefined) updateData.status = status
    
    await firebaseCallRecordService.updateCallRecord(twilioCallSid, updateData)
    
    console.log('[Call Records API] Call record updated:', twilioCallSid)
    
    return NextResponse.json({
      success: true,
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
