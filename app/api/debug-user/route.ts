import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/firebase'
import { firebaseUserService } from '@/lib/firebase/company-service'

export async function GET(request: NextRequest) {
  try {
    // Get current Firebase Auth user
    const currentUser = auth.currentUser
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('[Debug User API] Current Firebase Auth user:', {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName
    })

    // Get user data from Firestore
    const firestoreUser = await firebaseUserService.getUserById(currentUser.uid)
    
    console.log('[Debug User API] Firestore user data:', firestoreUser)

    return NextResponse.json({
      success: true,
      authUser: {
        uid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL
      },
      firestoreUser: firestoreUser,
      hasFirestoreRecord: !!firestoreUser,
      companyId: firestoreUser?.companyId || null
    })

  } catch (error) {
    console.error('[Debug User API] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 })
  }
}
