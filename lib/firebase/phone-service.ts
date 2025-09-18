// Firebase service for phone assignments and call records
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  increment
} from 'firebase/firestore'
import { db, COLLECTIONS, FirebasePhoneAssignment, FirebaseCallRecord, convertFirestoreTimestamp } from '@/lib/firebase'

// Phone Assignment Service
export class FirebasePhoneService {
  private static instance: FirebasePhoneService
  
  static getInstance(): FirebasePhoneService {
    if (!FirebasePhoneService.instance) {
      FirebasePhoneService.instance = new FirebasePhoneService()
    }
    return FirebasePhoneService.instance
  }

  // Get all phone assignments
  async getAllPhoneAssignments(): Promise<FirebasePhoneAssignment[]> {
    try {
      console.log('[Firebase Phone Service] Fetching all phone assignments')
      
      const assignmentsRef = collection(db, COLLECTIONS.PHONE_ASSIGNMENTS)
      const q = query(assignmentsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      const assignments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertFirestoreTimestamp(doc.data().createdAt),
        updatedAt: convertFirestoreTimestamp(doc.data().updatedAt),
        lastCallAt: doc.data().lastCallAt ? convertFirestoreTimestamp(doc.data().lastCallAt) : null
      })) as FirebasePhoneAssignment[]
      
      console.log(`[Firebase Phone Service] Found ${assignments.length} assignments`)
      return assignments
      
    } catch (error) {
      console.error('[Firebase Phone Service] Error fetching assignments:', error)
      throw error
    }
  }

  // Get phone assignment by Twilio SID
  async getPhoneAssignmentByTwilioSid(twilioSid: string): Promise<FirebasePhoneAssignment | null> {
    try {
      const assignmentRef = doc(db, COLLECTIONS.PHONE_ASSIGNMENTS, twilioSid)
      const snapshot = await getDoc(assignmentRef)
      
      if (!snapshot.exists()) {
        return null
      }
      
      const data = snapshot.data()
      return {
        id: snapshot.id,
        ...data,
        createdAt: convertFirestoreTimestamp(data.createdAt),
        updatedAt: convertFirestoreTimestamp(data.updatedAt),
        lastCallAt: data.lastCallAt ? convertFirestoreTimestamp(data.lastCallAt) : null
      } as FirebasePhoneAssignment
      
    } catch (error) {
      console.error('[Firebase Phone Service] Error fetching assignment:', error)
      throw error
    }
  }

  // Create or update phone assignment
  async upsertPhoneAssignment(assignment: Partial<FirebasePhoneAssignment> & { twilioSid: string }): Promise<FirebasePhoneAssignment> {
    try {
      console.log('[Firebase Phone Service] Upserting assignment:', assignment.twilioSid)
      
      const assignmentRef = doc(db, COLLECTIONS.PHONE_ASSIGNMENTS, assignment.twilioSid)
      const now = new Date()
      
      // Check if assignment exists
      const existingDoc = await getDoc(assignmentRef)
      const isUpdate = existingDoc.exists()
      
      const data = {
        ...assignment,
        updatedAt: serverTimestamp(),
        ...(isUpdate ? {} : { createdAt: serverTimestamp(), totalCalls: 0 })
      }
      
      await setDoc(assignmentRef, data, { merge: true })
      
      // Return the updated assignment
      const updatedSnapshot = await getDoc(assignmentRef)
      const updatedData = updatedSnapshot.data()!
      
      console.log(`[Firebase Phone Service] Assignment ${isUpdate ? 'updated' : 'created'}:`, assignment.twilioSid)
      
      return {
        id: updatedSnapshot.id,
        ...updatedData,
        createdAt: convertFirestoreTimestamp(updatedData.createdAt),
        updatedAt: convertFirestoreTimestamp(updatedData.updatedAt),
        lastCallAt: updatedData.lastCallAt ? convertFirestoreTimestamp(updatedData.lastCallAt) : null
      } as FirebasePhoneAssignment
      
    } catch (error) {
      console.error('[Firebase Phone Service] Error upserting assignment:', error)
      throw error
    }
  }

  // Delete phone assignment
  async deletePhoneAssignment(twilioSid: string): Promise<void> {
    try {
      console.log('[Firebase Phone Service] Deleting assignment:', twilioSid)
      
      const assignmentRef = doc(db, COLLECTIONS.PHONE_ASSIGNMENTS, twilioSid)
      await deleteDoc(assignmentRef)
      
      console.log('[Firebase Phone Service] Assignment deleted:', twilioSid)
      
    } catch (error) {
      console.error('[Firebase Phone Service] Error deleting assignment:', error)
      throw error
    }
  }

  // Get assignments for a specific client
  async getPhoneAssignmentsByClient(clientId: string): Promise<FirebasePhoneAssignment[]> {
    try {
      const assignmentsRef = collection(db, COLLECTIONS.PHONE_ASSIGNMENTS)
      const q = query(assignmentsRef, where('clientId', '==', clientId))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertFirestoreTimestamp(doc.data().createdAt),
        updatedAt: convertFirestoreTimestamp(doc.data().updatedAt),
        lastCallAt: doc.data().lastCallAt ? convertFirestoreTimestamp(doc.data().lastCallAt) : null
      })) as FirebasePhoneAssignment[]
      
    } catch (error) {
      console.error('[Firebase Phone Service] Error fetching client assignments:', error)
      throw error
    }
  }

  // Real-time listener for phone assignments
  subscribeToPhoneAssignments(callback: (assignments: FirebasePhoneAssignment[]) => void): () => void {
    console.log('[Firebase Phone Service] Setting up real-time listener')
    
    const assignmentsRef = collection(db, COLLECTIONS.PHONE_ASSIGNMENTS)
    const q = query(assignmentsRef, orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const assignments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertFirestoreTimestamp(doc.data().createdAt),
        updatedAt: convertFirestoreTimestamp(doc.data().updatedAt),
        lastCallAt: doc.data().lastCallAt ? convertFirestoreTimestamp(doc.data().lastCallAt) : null
      })) as FirebasePhoneAssignment[]
      
      console.log(`[Firebase Phone Service] Real-time update: ${assignments.length} assignments`)
      callback(assignments)
    }, (error) => {
      console.error('[Firebase Phone Service] Real-time listener error:', error)
    })
    
    return unsubscribe
  }
}

// Call Record Service
export class FirebaseCallRecordService {
  private static instance: FirebaseCallRecordService
  
  static getInstance(): FirebaseCallRecordService {
    if (!FirebaseCallRecordService.instance) {
      FirebaseCallRecordService.instance = new FirebaseCallRecordService()
    }
    return FirebaseCallRecordService.instance
  }

  // Create call record
  async createCallRecord(record: Omit<FirebaseCallRecord, 'id' | 'createdAt'>): Promise<FirebaseCallRecord> {
    try {
      console.log('[Firebase Call Service] Creating call record:', record.twilioCallSid)
      
      // Use Twilio Call SID as document ID for easy lookup
      const recordRef = doc(db, COLLECTIONS.CALL_RECORDS, record.twilioCallSid)
      
      const data = {
        ...record,
        createdAt: serverTimestamp()
      }
      
      await setDoc(recordRef, data)
      
      // Update phone assignment stats
      if (record.phoneAssignmentId) {
        const assignmentRef = doc(db, COLLECTIONS.PHONE_ASSIGNMENTS, record.phoneAssignmentId)
        await updateDoc(assignmentRef, {
          lastCallAt: serverTimestamp(),
          totalCalls: increment(1),
          updatedAt: serverTimestamp()
        })
      }
      
      // Return the created record
      const createdSnapshot = await getDoc(recordRef)
      const createdData = createdSnapshot.data()!
      
      console.log('[Firebase Call Service] Call record created:', record.twilioCallSid)
      
      return {
        id: createdSnapshot.id,
        ...createdData,
        createdAt: convertFirestoreTimestamp(createdData.createdAt)
      } as FirebaseCallRecord
      
    } catch (error) {
      console.error('[Firebase Call Service] Error creating call record:', error)
      throw error
    }
  }

  // Update call record (for duration, recording URL, etc.)
  async updateCallRecord(twilioCallSid: string, updates: Partial<FirebaseCallRecord>): Promise<void> {
    try {
      console.log('[Firebase Call Service] Updating call record:', twilioCallSid)
      
      const recordRef = doc(db, COLLECTIONS.CALL_RECORDS, twilioCallSid)
      await updateDoc(recordRef, updates)
      
      console.log('[Firebase Call Service] Call record updated:', twilioCallSid)
      
    } catch (error) {
      console.error('[Firebase Call Service] Error updating call record:', error)
      throw error
    }
  }

  // Get call records with filtering
  async getCallRecords(options: {
    phoneAssignmentId?: string
    clientId?: string
    limit?: number
  } = {}): Promise<FirebaseCallRecord[]> {
    try {
      const { phoneAssignmentId, limit: recordLimit = 50 } = options
      
      console.log('[Firebase Call Service] Fetching call records:', options)
      
      const recordsRef = collection(db, COLLECTIONS.CALL_RECORDS)
      let q = query(recordsRef, orderBy('createdAt', 'desc'))
      
      if (phoneAssignmentId) {
        q = query(recordsRef, where('phoneAssignmentId', '==', phoneAssignmentId), orderBy('createdAt', 'desc'))
      }
      
      if (recordLimit) {
        q = query(q, limit(recordLimit))
      }
      
      const snapshot = await getDocs(q)
      
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertFirestoreTimestamp(doc.data().createdAt)
      })) as FirebaseCallRecord[]
      
      console.log(`[Firebase Call Service] Found ${records.length} call records`)
      return records
      
    } catch (error) {
      console.error('[Firebase Call Service] Error fetching call records:', error)
      throw error
    }
  }

  // Get call statistics
  async getCallStatistics(phoneAssignmentId?: string): Promise<{
    totalCalls: number
    totalDuration: number
    averageDuration: number
    todaysCalls: number
  }> {
    try {
      const records = await this.getCallRecords({ phoneAssignmentId })
      
      const totalCalls = records.length
      const totalDuration = records.reduce((sum, record) => sum + (record.duration || 0), 0)
      const averageDuration = totalCalls > 0 ? Math.round(totalDuration / totalCalls) : 0
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todaysCalls = records.filter(record => 
        new Date(record.createdAt) >= today
      ).length
      
      return {
        totalCalls,
        totalDuration,
        averageDuration,
        todaysCalls
      }
      
    } catch (error) {
      console.error('[Firebase Call Service] Error calculating statistics:', error)
      return { totalCalls: 0, totalDuration: 0, averageDuration: 0, todaysCalls: 0 }
    }
  }

  // Real-time listener for call records
  subscribeToCallRecords(
    callback: (records: FirebaseCallRecord[]) => void,
    phoneAssignmentId?: string
  ): () => void {
    console.log('[Firebase Call Service] Setting up real-time listener')
    
    const recordsRef = collection(db, COLLECTIONS.CALL_RECORDS)
    let q = query(recordsRef, orderBy('createdAt', 'desc'), limit(100))
    
    if (phoneAssignmentId) {
      q = query(recordsRef, where('phoneAssignmentId', '==', phoneAssignmentId), orderBy('createdAt', 'desc'), limit(50))
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertFirestoreTimestamp(doc.data().createdAt)
      })) as FirebaseCallRecord[]
      
      console.log(`[Firebase Call Service] Real-time update: ${records.length} call records`)
      callback(records)
    }, (error) => {
      console.error('[Firebase Call Service] Real-time listener error:', error)
    })
    
    return unsubscribe
  }
}

// Export singleton instances
export const firebasePhoneService = FirebasePhoneService.getInstance()
export const firebaseCallRecordService = FirebaseCallRecordService.getInstance()
