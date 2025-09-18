// Firebase Authentication Service
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User as FirebaseAuthUser,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db, COLLECTIONS } from '@/lib/firebase'
import { firebaseUserService, firebaseCompanyService } from './company-service'

export interface AuthUser {
  uid: string
  email: string
  name: string
  avatar?: string
  companyId?: string
  role?: 'owner' | 'admin' | 'manager' | 'user'
  permissions?: string[]
}

export class FirebaseAuthService {
  private static instance: FirebaseAuthService
  private currentUser: AuthUser | null = null
  private authStateListeners: ((user: AuthUser | null) => void)[] = []

  static getInstance(): FirebaseAuthService {
    if (!FirebaseAuthService.instance) {
      FirebaseAuthService.instance = new FirebaseAuthService()
    }
    return FirebaseAuthService.instance
  }

  constructor() {
    this.initializeAuthListener()
  }

  // Initialize Firebase Auth state listener
  private initializeAuthListener() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const authUser = await this.loadUserData(firebaseUser)
        this.currentUser = authUser
        this.notifyAuthStateListeners(authUser)
      } else {
        // User is signed out
        this.currentUser = null
        this.notifyAuthStateListeners(null)
      }
    })
  }

  // Load user data from Firestore
  private async loadUserData(firebaseUser: FirebaseAuthUser): Promise<AuthUser> {
    try {
      // Check if user exists in our database
      const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid)
      const userSnapshot = await getDoc(userRef)
      
      if (userSnapshot.exists()) {
        // User exists, return their data
        const userData = userSnapshot.data()
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          name: userData.name || firebaseUser.displayName || 'User',
          avatar: firebaseUser.photoURL || undefined,
          companyId: userData.companyId,
          role: userData.role,
          permissions: userData.permissions
        }
      } else {
        // New user, create basic profile (company will be assigned during onboarding)
        const authUser: AuthUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || 'User',
          avatar: firebaseUser.photoURL || undefined
        }
        
        console.log('[Auth Service] New user detected, will need onboarding:', authUser.email)
        return authUser
      }
    } catch (error) {
      console.error('[Auth Service] Error loading user data:', error)
      // Return basic user data as fallback
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || 'User',
        avatar: firebaseUser.photoURL || undefined
      }
    }
  }

  // Email/Password Sign Up
  async signUpWithEmail(email: string, password: string, name: string): Promise<AuthUser> {
    try {
      console.log('[Auth Service] Creating account with email:', email)
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      
      // Update Firebase Auth profile
      await updateProfile(firebaseUser, {
        displayName: name
      })
      
      const authUser: AuthUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        name: name,
        avatar: firebaseUser.photoURL || undefined
      }
      
      console.log('[Auth Service] Account created successfully:', authUser.email)
      return authUser
      
    } catch (error) {
      console.error('[Auth Service] Error creating account:', error)
      throw error
    }
  }

  // Email/Password Sign In
  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    try {
      console.log('[Auth Service] Signing in with email:', email)
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const authUser = await this.loadUserData(userCredential.user)
      
      console.log('[Auth Service] Signed in successfully:', authUser.email)
      return authUser
      
    } catch (error) {
      console.error('[Auth Service] Error signing in:', error)
      throw error
    }
  }

  // Google Sign In
  async signInWithGoogle(): Promise<AuthUser> {
    try {
      console.log('[Auth Service] Signing in with Google...')
      
      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')
      
      const result = await signInWithPopup(auth, provider)
      const authUser = await this.loadUserData(result.user)
      
      console.log('[Auth Service] Google sign in successful:', authUser.email)
      return authUser
      
    } catch (error) {
      console.error('[Auth Service] Error signing in with Google:', error)
      throw error
    }
  }

  // Sign Out
  async signOut(): Promise<void> {
    try {
      await signOut(auth)
      this.currentUser = null
      console.log('[Auth Service] Signed out successfully')
    } catch (error) {
      console.error('[Auth Service] Error signing out:', error)
      throw error
    }
  }

  // Complete user onboarding (assign to company)
  async completeOnboarding(
    companyData: {
      name: string
      email: string
      phone?: string
      website?: string
      industry?: string
      size?: string
    },
    createNewCompany: boolean = true
  ): Promise<{ user: AuthUser; company: any }> {
    try {
      if (!this.currentUser) {
        throw new Error('No authenticated user')
      }

      console.log('[Auth Service] Completing onboarding for:', this.currentUser.email)

      let company: any
      
      if (createNewCompany) {
        // Create new company
        company = await firebaseCompanyService.createCompany({
          name: companyData.name,
          email: companyData.email,
          phone: companyData.phone,
          website: companyData.website,
          industry: companyData.industry || 'Business Services',
          size: (companyData.size as any) || 'small',
          subscription: 'pro',
          settings: {
            timezone: 'America/New_York',
            currency: 'USD',
            dateFormat: 'MM/DD/YYYY'
          }
        })
      } else {
        // TODO: Handle joining existing company
        throw new Error('Joining existing company not implemented yet')
      }

      // Create user in our database
      const user = await firebaseUserService.createUser({
        email: this.currentUser.email,
        name: this.currentUser.name,
        role: 'owner', // First user is always owner
        companyId: company.id,
        permissions: ['all']
      })

      // Update current user
      this.currentUser = {
        ...this.currentUser,
        companyId: company.id,
        role: 'owner',
        permissions: ['all']
      }

      console.log('[Auth Service] Onboarding completed:', {
        user: user.email,
        company: company.name
      })

      return { user: this.currentUser, company }
      
    } catch (error) {
      console.error('[Auth Service] Error completing onboarding:', error)
      throw error
    }
  }

  // Get current user
  getCurrentUser(): AuthUser | null {
    return this.currentUser
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  // Check if user needs onboarding (no company assigned)
  needsOnboarding(): boolean {
    return this.currentUser !== null && !this.currentUser.companyId
  }

  // Check if user has permission
  hasPermission(permission: string): boolean {
    if (!this.currentUser || !this.currentUser.permissions) return false
    if (this.currentUser.permissions.includes('all')) return true
    return this.currentUser.permissions.includes(permission)
  }

  // Auth state listeners
  onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
    this.authStateListeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      this.authStateListeners = this.authStateListeners.filter(listener => listener !== callback)
    }
  }

  private notifyAuthStateListeners(user: AuthUser | null) {
    this.authStateListeners.forEach(listener => listener(user))
  }

  // Update user profile
  async updateUserProfile(updates: { name?: string; avatar?: string }): Promise<void> {
    try {
      if (!auth.currentUser) throw new Error('No authenticated user')
      
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: updates.name,
        photoURL: updates.avatar
      })
      
      // Update our database
      if (this.currentUser?.companyId) {
        await firebaseUserService.updateUser(this.currentUser.uid, {
          name: updates.name || this.currentUser.name
        })
      }
      
      // Update current user
      if (this.currentUser) {
        this.currentUser = {
          ...this.currentUser,
          name: updates.name || this.currentUser.name,
          avatar: updates.avatar || this.currentUser.avatar
        }
      }
      
    } catch (error) {
      console.error('[Auth Service] Error updating profile:', error)
      throw error
    }
  }
}

// Export singleton instance
export const firebaseAuthService = FirebaseAuthService.getInstance()
