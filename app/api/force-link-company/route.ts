import { NextRequest, NextResponse } from 'next/server'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db, COLLECTIONS } from '@/lib/firebase'
import { firebaseCompanyService } from '@/lib/firebase/company-service'

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

    console.log('[Force Link] Starting force link for user:', { userId, email })
    
    // 1. Ensure default company exists or create one
    let defaultCompany: any
    
    // Try to find existing company first
    try {
      const companies = await firebaseCompanyService.getAllCompanies()
      defaultCompany = companies.find(c => c.name === 'OvernightBiz Main Company')
      
      if (defaultCompany) {
        console.log('[Force Link] Found existing company:', defaultCompany.id)
      }
    } catch (error) {
      console.log('[Force Link] Error finding companies:', error)
    }
    
    if (!defaultCompany) {
      console.log('[Force Link] Creating default company...')
      defaultCompany = await firebaseCompanyService.createCompany({
        name: 'OvernightBiz Main Company',
        email: 'admin@overnightbiz.com',
        phone: '+17862903664',
        website: 'https://www.overnightbiz.com',
        industry: 'Digital Marketing',
        size: 'small',
        subscription: 'pro',
        settings: {
          timezone: 'America/New_York',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY'
        }
      })
      console.log('[Force Link] Default company created:', defaultCompany.id)
    }
    
    // 2. Force update user record with company ID
    const userRef = doc(db, COLLECTIONS.USERS, userId)
    
    const userData = {
      email,
      name: name || 'User',
      role: 'owner',
      companyId: defaultCompany.id,
      permissions: ['all'],
      updatedAt: serverTimestamp()
    }
    
    // Use setDoc with merge: true to ensure it saves
    await setDoc(userRef, userData, { merge: true })
    
    console.log('[Force Link] User record force updated')
    
    // 3. Verify the data was saved
    const verifySnapshot = await getDoc(userRef)
    const savedData = verifySnapshot.data()
    
    console.log('[Force Link] Verification - Saved data:', {
      exists: verifySnapshot.exists(),
      companyId: savedData?.companyId,
      role: savedData?.role,
      email: savedData?.email
    })
    
    if (!savedData?.companyId) {
      throw new Error('Failed to save companyId to user record')
    }
    
    return NextResponse.json({
      success: true,
      message: 'User successfully linked to company',
      data: {
        userId,
        email,
        companyId: savedData.companyId,
        role: savedData.role,
        companyName: defaultCompany.name,
        verified: true
      }
    })
    
  } catch (error) {
    console.error('[Force Link] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to link user to company'
    }, { status: 500 })
  }
}
