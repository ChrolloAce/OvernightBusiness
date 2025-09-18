import { NextRequest, NextResponse } from 'next/server'
import { 
  collection,
  doc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { db, COLLECTIONS, getCurrentCompanyId, getCurrentUserId } from '@/lib/firebase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, website } = body
    
    console.log('[Setup Company] Creating company:', name)
    
    // Create company document
    const companyId = getCurrentCompanyId()
    const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId)
    
    const companyData = {
      id: companyId,
      name: name || 'OvernightBiz',
      email: email || 'admin@overnightbiz.com',
      phone: phone || '+17862903664',
      website: website || 'https://www.overnightbiz.com',
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
    }
    
    await setDoc(companyRef, companyData)
    
    // Create default user
    const userId = getCurrentUserId()
    const userRef = doc(db, COLLECTIONS.USERS, userId)
    
    const userData = {
      id: userId,
      email: email || 'admin@overnightbiz.com',
      name: 'Admin User',
      role: 'owner',
      companyId: companyId,
      permissions: ['all'],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    await setDoc(userRef, userData)
    
    console.log('[Setup Company] Company and user created successfully')
    
    return NextResponse.json({
      success: true,
      company: {
        id: companyId,
        name: companyData.name,
        email: companyData.email
      },
      user: {
        id: userId,
        email: userData.email,
        role: userData.role
      },
      message: 'Company and user created successfully'
    })
    
  } catch (error) {
    console.error('[Setup Company] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to setup company'
    }, { status: 500 })
  }
}
