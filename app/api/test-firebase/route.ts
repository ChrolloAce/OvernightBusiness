import { NextRequest, NextResponse } from 'next/server'
import { firebaseClientService } from '@/lib/firebase/client-service'
import { firebasePhoneService } from '@/lib/firebase/phone-service'
import { getCurrentCompanyId, getCurrentUserId } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { test } = body
    
    console.log(`[Test Firebase] Running test: ${test}`)
    
    if (test === 'client') {
      // Test client creation
      const testClient = await firebaseClientService.createClient({
        companyId: getCurrentCompanyId(),
        name: `Test Client ${Date.now()}`,
        email: 'test@example.com',
        phone: '+1234567890',
        status: 'active',
        tags: ['test'],
        assignedUserId: getCurrentUserId(),
        createdBy: getCurrentUserId()
      })
      
      console.log('[Test Firebase] Client created:', testClient.id)
      
      return NextResponse.json({
        success: true,
        test: 'client',
        result: {
          id: testClient.id,
          name: testClient.name,
          companyId: testClient.companyId
        }
      })
      
    } else if (test === 'phone') {
      // Test phone assignment creation
      const testPhone = await firebasePhoneService.upsertPhoneAssignment({
        companyId: getCurrentCompanyId(),
        twilioSid: `test_phone_${Date.now()}`,
        phoneNumber: '+1555000TEST',
        isActive: true,
        createdBy: getCurrentUserId()
      })
      
      console.log('[Test Firebase] Phone assignment created:', testPhone.id)
      
      return NextResponse.json({
        success: true,
        test: 'phone',
        result: {
          id: testPhone.id,
          phoneNumber: testPhone.phoneNumber,
          companyId: testPhone.companyId
        }
      })
      
    } else {
      return NextResponse.json({
        success: false,
        error: 'Unknown test type'
      }, { status: 400 })
    }
    
  } catch (error) {
    console.error('[Test Firebase] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test failed'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test Firebase connection
    const companyId = getCurrentCompanyId()
    const userId = getCurrentUserId()
    
    // Test reading clients
    const clients = await firebaseClientService.getAllClients()
    
    // Test reading phone assignments  
    const phoneAssignments = await firebasePhoneService.getAllPhoneAssignments()
    
    return NextResponse.json({
      success: true,
      connection: 'working',
      companyId,
      userId,
      stats: {
        clients: clients.length,
        phoneAssignments: phoneAssignments.length
      }
    })
    
  } catch (error) {
    console.error('[Test Firebase] Connection test failed:', error)
    
    return NextResponse.json({
      success: false,
      connection: 'failed',
      error: error instanceof Error ? error.message : 'Connection test failed'
    }, { status: 500 })
  }
}
