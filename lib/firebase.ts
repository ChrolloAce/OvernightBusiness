// Firebase configuration and initialization
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
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
if (process.env.NODE_ENV === 'development' && !globalThis.firestoreEmulatorConnected) {
  try {
    // Only connect to emulator if FIREBASE_EMULATOR_HOST is set
    if (process.env.FIREBASE_EMULATOR_HOST) {
      connectFirestoreEmulator(db, 'localhost', 8080)
      globalThis.firestoreEmulatorConnected = true
      console.log('🔥 Connected to Firebase Emulator')
    }
  } catch (error) {
    // Emulator already connected or not available
    console.log('📱 Using Firebase Production')
  }
}

export default app

// Collection names (consistent across the app)
export const COLLECTIONS = {
  CLIENTS: 'clients',
  PHONE_ASSIGNMENTS: 'phoneAssignments',
  CALL_RECORDS: 'callRecords',
  BUSINESS_PROFILES: 'businessProfiles',
  TASKS: 'tasks',
  DEALS: 'deals',
  AUDIT_LOGS: 'auditLogs'
} as const

// Firebase Firestore type definitions
export interface FirebaseClient {
  id: string
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
  createdAt: Date
  updatedAt: Date
}

export interface FirebasePhoneAssignment {
  id: string
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
}

export interface FirebaseCallRecord {
  id: string
  twilioCallSid: string
  phoneAssignmentId: string
  fromNumber: string
  toNumber: string
  forwardedTo?: string
  duration?: number // seconds
  recordingUrl?: string
  status: string
  direction: 'inbound' | 'outbound'
  createdAt: Date
}

// Helper function to convert Firebase timestamps to Date objects
export const convertFirestoreTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date()
  if (timestamp.toDate) return timestamp.toDate()
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000)
  return new Date(timestamp)
}
