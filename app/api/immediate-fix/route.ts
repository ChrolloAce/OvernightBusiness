import { NextRequest, NextResponse } from 'next/server'
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { auth, db, COLLECTIONS } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    // Get current authenticated user
    const currentUser = auth.currentUser
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('[Immediate Fix] Fixing user:', currentUser.email)

    // Create a simple company ID
    const companyId = `company_${currentUser.uid.substring(0, 8)}`
    
    // 1. Create/update company record
    const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId)
    await setDoc(companyRef, {
      name: 'OvernightBiz Main Company',
      email: currentUser.email,
      phone: '+17862903664',
      website: 'https://www.overnightbiz.com',
      industry: 'Digital Marketing',
      size: 'small',
      subscription: 'pro',
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY'
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true })

    // 2. Create/update user record with company link
    const userRef = doc(db, COLLECTIONS.USERS, currentUser.uid)
    await setDoc(userRef, {
      email: currentUser.email,
      name: currentUser.displayName || 'Ernesto Lopez',
      companyId: companyId,
      role: 'owner',
      permissions: ['all'],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true })

    // 3. Verify the data was saved
    const userCheck = await getDoc(userRef)
    const userData = userCheck.data()
    
    console.log('[Immediate Fix] User data saved:', {
      companyId: userData?.companyId,
      role: userData?.role,
      email: userData?.email
    })

    return NextResponse.json({
      success: true,
      message: 'User and company records fixed!',
      data: {
        userId: currentUser.uid,
        email: currentUser.email,
        companyId: companyId,
        role: 'owner',
        verified: !!userData?.companyId
      }
    })

  } catch (error) {
    console.error('[Immediate Fix] Error:', error)
    return NextResponse.json({
      success: false,
      error: (error as Error).message
    }, { status: 500 })
  }
}
