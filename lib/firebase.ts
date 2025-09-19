// Firebase configuration and initialization
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { getStorage } from 'firebase/storage'

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCJa7uMmsXMurmeAAMWvFp0vaqeJHpndF8",
  authDomain: "overnightbiz-eb82e.firebaseapp.com",
  projectId: "overnightbiz-eb82e",
  storageBucket: "overnightbiz-eb82e.firebasestorage.app",
  messagingSenderId: "695967360735",
  appId: "1:695967360735:web:9b30c485375c64e597eb6a"
}

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase services
export const db = getFirestore(app)
export const auth = getAuth(app)
export const storage = getStorage(app)

// Connect to emulator in development (optional)
if (process.env.NODE_ENV === 'development' && !(globalThis as any).firestoreEmulatorConnected) {
  try {
    // Only connect to emulator if FIREBASE_EMULATOR_HOST is set
    if (process.env.FIREBASE_EMULATOR_HOST) {
      connectFirestoreEmulator(db, 'localhost', 8080)
      ;(globalThis as any).firestoreEmulatorConnected = true
      console.log('🔥 Connected to Firebase Emulator')
    }
  } catch (error) {
    // Emulator already connected or not available
    console.log('📱 Using Firebase Production')
  }
}

export default app

// Firebase Auth helpers
export const ensureFirebaseAuth = async (): Promise<boolean> => {
  try {
    const user = auth.currentUser
    if (!user) {
      console.log('🔐 No Firebase user found - ANONYMOUS AUTH DISABLED')
      // DISABLED: Don't automatically sign in anonymously
      // await signInAnonymously(auth)
      // console.log('✅ Firebase anonymous authentication successful')
      return false // Return false instead of signing in anonymously
    }
    console.log('✅ Firebase user already authenticated:', user.uid)
    return true
  } catch (error) {
    console.error('❌ Firebase authentication failed:', error)
    return false
  }
}

// Auto-authenticate when Firebase initializes - DISABLED
// This was causing auth loops during sign out
// if (typeof window !== 'undefined') {
//   // Only run in browser environment
//   onAuthStateChanged(auth, (user) => {
//     if (!user) {
//       // Automatically sign in anonymously if no user
//       signInAnonymously(auth).catch((error) => {
//         console.error('Auto Firebase auth failed:', error)
//       })
//     }
//   })
// }

// Data migration and cleanup utilities
export const clearAllLocalStorageData = (): void => {
  console.log('🧹 Clearing all localStorage data...')
  
  const keysToRemove = [
    'clients',
    'tasks', 
    'twilio_phone_numbers',
    'business_profiles',
    'deals',
    'projects',
    'user_settings',
    'app_state'
  ]
  
  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key)
      console.log(`✅ Removed localStorage key: ${key}`)
    } catch (error) {
      console.error(`❌ Failed to remove localStorage key ${key}:`, error)
    }
  })
  
  console.log('🎉 All localStorage data cleared!')
}

// Collection names (consistent across the app)
export const COLLECTIONS = {
  COMPANIES: 'companies',
  CLIENTS: 'clients',
  PHONE_ASSIGNMENTS: 'phoneAssignments',
  CALL_RECORDS: 'callRecords',
  BUSINESS_PROFILES: 'businessProfiles',
  TASKS: 'tasks',
  DEALS: 'deals',
  PROJECTS: 'projects',
  AUDIT_LOGS: 'auditLogs',
  USERS: 'users'
} as const

// Firebase Firestore type definitions
export interface FirebaseCompany {
  id: string
  name: string
  email?: string
  phone?: string
  website?: string
  logo?: string
  address?: string
  industry?: string
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  subscription?: 'free' | 'basic' | 'pro' | 'enterprise'
  settings?: any
  createdAt: Date
  updatedAt: Date
}

export interface FirebaseUser {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'owner' | 'admin' | 'manager' | 'user'
  companyId: string
  permissions?: string[]
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface FirebaseClient {
  id: string
  companyId: string // Links to company
  name: string
  email?: string
  phone?: string
  website?: string
  logo?: string
  status: 'active' | 'inactive' | 'prospect' | 'archived'
  tags: string[]
  notes?: string
  googleBusinessProfileId?: string
  googleBusinessProfile?: any
  assignedUserId?: string // Who manages this client
  createdAt: Date
  updatedAt: Date
  createdBy: string // User ID who created this client
}

export interface FirebaseTask {
  id: string
  companyId: string
  clientId?: string // Optional - can be company-wide tasks
  projectId?: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedUserId?: string
  dueDate?: Date
  completedAt?: Date
  tags: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface FirebaseProject {
  id: string
  companyId: string
  clientId?: string
  name: string
  description?: string
  status: 'active' | 'completed' | 'on_hold' | 'cancelled'
  startDate?: Date
  endDate?: Date
  budget?: number
  assignedUserIds: string[]
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface FirebasePhoneAssignment {
  id: string
  companyId: string
  twilioSid: string
  phoneNumber: string
  clientId?: string
  clientName?: string
  forwardToNumber?: string
  isActive: boolean
  webhookUrl?: string
  lastCallAt?: Date
  totalCalls: number
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface FirebaseCallRecord {
  id: string
  companyId: string
  twilioCallSid: string
  phoneAssignmentId: string
  clientId?: string
  fromNumber: string
  toNumber: string
  forwardedTo?: string
  duration?: number // seconds
  recordingUrl?: string
  status: string
  direction: 'inbound' | 'outbound'
  notes?: string
  createdAt: Date
}

export interface FirebaseAuditLog {
  id: string
  companyId: string
  userId: string
  action: 'create' | 'update' | 'delete' | 'view'
  entity: 'client' | 'task' | 'phone' | 'call' | 'project' | 'user'
  entityId: string
  changes?: any // What changed
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

// Helper function to convert Firebase timestamps to Date objects
export const convertFirestoreTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date()
  if (timestamp.toDate) return timestamp.toDate()
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000)
  return new Date(timestamp)
}

// Current company ID (in a real app, this would come from auth)
// For now, we'll use a default company ID
export const getCurrentCompanyId = (): string => {
  // TODO: Get from user authentication context
  return 'company_overnight_biz_main'
}

// Current user ID (in a real app, this would come from auth)
export const getCurrentUserId = (): string => {
  // TODO: Get from user authentication context  
  return 'user_admin_main'
}
