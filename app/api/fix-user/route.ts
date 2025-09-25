import { NextRequest, NextResponse } from 'next/server'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, COLLECTIONS, getCurrentCompanyId } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, name } = body
    
    if (!userId || !email) {
      return NextResponse.json({
        success: false,
        error: 'Missing userId or email'
      }, { status: 400 })
    }

    console.log('[Fix User] Fixing user record:', { userId, email })
    
    // Create/update user record with company ID
    const userRef = doc(db, COLLECTIONS.USERS, userId)
    const companyId = getCurrentCompanyId()
    
    const userData = {
      email,
      name: name || 'User',
      role: 'owner',
      companyId: companyId,
      permissions: ['all'],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    await setDoc(userRef, userData, { merge: true })
    
    console.log('[Fix User] User record updated with company ID:', companyId)
    
    return NextResponse.json({
      success: true,
      message: 'User record fixed successfully',
      userData: {
        userId,
        email,
        companyId,
        role: 'owner'
      }
    })
    
  } catch (error) {
    console.error('[Fix User] Error fixing user record:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fix user record'
    }, { status: 500 })
  }
}
