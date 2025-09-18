// Firebase service for client management
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
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db, COLLECTIONS, FirebaseClient, convertFirestoreTimestamp } from '@/lib/firebase'

export class FirebaseClientService {
  private static instance: FirebaseClientService
  
  static getInstance(): FirebaseClientService {
    if (!FirebaseClientService.instance) {
      FirebaseClientService.instance = new FirebaseClientService()
    }
    return FirebaseClientService.instance
  }

  // Get all clients
  async getAllClients(): Promise<FirebaseClient[]> {
    try {
      console.log('[Firebase Client Service] Fetching all clients')
      
      const clientsRef = collection(db, COLLECTIONS.CLIENTS)
      const q = query(clientsRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      const clients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertFirestoreTimestamp(doc.data().createdAt),
        updatedAt: convertFirestoreTimestamp(doc.data().updatedAt)
      })) as FirebaseClient[]
      
      console.log(`[Firebase Client Service] Found ${clients.length} clients`)
      return clients
      
    } catch (error) {
      console.error('[Firebase Client Service] Error fetching clients:', error)
      throw error
    }
  }

  // Get client by ID
  async getClientById(clientId: string): Promise<FirebaseClient | null> {
    try {
      console.log('[Firebase Client Service] Fetching client:', clientId)
      
      const clientRef = doc(db, COLLECTIONS.CLIENTS, clientId)
      const snapshot = await getDoc(clientRef)
      
      if (!snapshot.exists()) {
        console.log('[Firebase Client Service] Client not found:', clientId)
        return null
      }
      
      const data = snapshot.data()
      const client = {
        id: snapshot.id,
        ...data,
        createdAt: convertFirestoreTimestamp(data.createdAt),
        updatedAt: convertFirestoreTimestamp(data.updatedAt)
      } as FirebaseClient
      
      console.log('[Firebase Client Service] Client found:', client.name)
      return client
      
    } catch (error) {
      console.error('[Firebase Client Service] Error fetching client:', error)
      throw error
    }
  }

  // Create new client
  async createClient(clientData: Omit<FirebaseClient, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirebaseClient> {
    try {
      console.log('[Firebase Client Service] Creating client:', clientData.name)
      
      const clientsRef = collection(db, COLLECTIONS.CLIENTS)
      const newClientRef = doc(clientsRef)
      
      const data = {
        ...clientData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      await setDoc(newClientRef, data)
      
      // Return the created client
      const createdSnapshot = await getDoc(newClientRef)
      const createdData = createdSnapshot.data()!
      
      const client = {
        id: createdSnapshot.id,
        ...createdData,
        createdAt: convertFirestoreTimestamp(createdData.createdAt),
        updatedAt: convertFirestoreTimestamp(createdData.updatedAt)
      } as FirebaseClient
      
      console.log('[Firebase Client Service] Client created:', client.id)
      return client
      
    } catch (error) {
      console.error('[Firebase Client Service] Error creating client:', error)
      throw error
    }
  }

  // Update client
  async updateClient(clientId: string, updates: Partial<FirebaseClient>): Promise<FirebaseClient> {
    try {
      console.log('[Firebase Client Service] Updating client:', clientId)
      
      const clientRef = doc(db, COLLECTIONS.CLIENTS, clientId)
      
      // Remove id, createdAt, updatedAt from updates
      const { id, createdAt, ...cleanUpdates } = updates
      
      const data = {
        ...cleanUpdates,
        updatedAt: serverTimestamp()
      }
      
      await updateDoc(clientRef, data)
      
      // Return the updated client
      const updatedSnapshot = await getDoc(clientRef)
      const updatedData = updatedSnapshot.data()!
      
      const client = {
        id: updatedSnapshot.id,
        ...updatedData,
        createdAt: convertFirestoreTimestamp(updatedData.createdAt),
        updatedAt: convertFirestoreTimestamp(updatedData.updatedAt)
      } as FirebaseClient
      
      console.log('[Firebase Client Service] Client updated:', client.id)
      return client
      
    } catch (error) {
      console.error('[Firebase Client Service] Error updating client:', error)
      throw error
    }
  }

  // Delete client
  async deleteClient(clientId: string): Promise<void> {
    try {
      console.log('[Firebase Client Service] Deleting client:', clientId)
      
      // Use batch to delete client and related data
      const batch = writeBatch(db)
      
      // Delete client
      const clientRef = doc(db, COLLECTIONS.CLIENTS, clientId)
      batch.delete(clientRef)
      
      // Delete related phone assignments
      const phoneAssignmentsRef = collection(db, COLLECTIONS.PHONE_ASSIGNMENTS)
      const phoneQuery = query(phoneAssignmentsRef, where('clientId', '==', clientId))
      const phoneSnapshot = await getDocs(phoneQuery)
      
      phoneSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })
      
      await batch.commit()
      
      console.log('[Firebase Client Service] Client and related data deleted:', clientId)
      
    } catch (error) {
      console.error('[Firebase Client Service] Error deleting client:', error)
      throw error
    }
  }

  // Get clients by status
  async getClientsByStatus(status: FirebaseClient['status']): Promise<FirebaseClient[]> {
    try {
      const clientsRef = collection(db, COLLECTIONS.CLIENTS)
      const q = query(clientsRef, where('status', '==', status), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertFirestoreTimestamp(doc.data().createdAt),
        updatedAt: convertFirestoreTimestamp(doc.data().updatedAt)
      })) as FirebaseClient[]
      
    } catch (error) {
      console.error('[Firebase Client Service] Error fetching clients by status:', error)
      throw error
    }
  }

  // Get clients with Google Business Profiles
  async getClientsWithGoogleBusinessProfiles(): Promise<FirebaseClient[]> {
    try {
      const clientsRef = collection(db, COLLECTIONS.CLIENTS)
      const q = query(clientsRef, where('googleBusinessProfileId', '!=', null))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertFirestoreTimestamp(doc.data().createdAt),
        updatedAt: convertFirestoreTimestamp(doc.data().updatedAt)
      })) as FirebaseClient[]
      
    } catch (error) {
      console.error('[Firebase Client Service] Error fetching clients with Google profiles:', error)
      throw error
    }
  }

  // Connect Google Business Profile to client
  async connectGoogleBusinessProfile(
    clientId: string, 
    profileId: string, 
    profileData?: any,
    autoAssignData: boolean = true
  ): Promise<FirebaseClient> {
    try {
      console.log('[Firebase Client Service] Connecting Google profile to client:', { clientId, profileId, autoAssignData })
      
      const updates: Partial<FirebaseClient> = {
        googleBusinessProfileId: profileId,
        googleBusinessProfile: profileData
      }
      
      // Auto-assign data from Google profile if requested
      if (autoAssignData && profileData) {
        const client = await this.getClientById(clientId)
        
        if (client) {
          // Extract phone number
          if (!client.phone && profileData.phone) {
            updates.phone = profileData.phone
            console.log('[Firebase Client Service] Auto-assigned phone:', profileData.phone)
          }
          
          // Extract website
          if (!client.website && profileData.website) {
            updates.website = profileData.website
            console.log('[Firebase Client Service] Auto-assigned website:', profileData.website)
          }
          
          // Extract and merge tags/categories
          if (profileData.categories && Array.isArray(profileData.categories)) {
            const newTags = profileData.categories
              .filter((cat: any) => cat && typeof cat === 'string')
              .slice(0, 3) // Limit to 3 categories
            
            if (newTags.length > 0) {
              updates.tags = [...(client.tags || []), ...newTags]
                .filter((tag, index, arr) => arr.indexOf(tag) === index) // Remove duplicates
              console.log('[Firebase Client Service] Auto-assigned tags:', updates.tags)
            }
          }
        }
      }
      
      return await this.updateClient(clientId, updates)
      
    } catch (error) {
      console.error('[Firebase Client Service] Error connecting Google profile:', error)
      throw error
    }
  }

  // Real-time listener for clients
  subscribeToClients(callback: (clients: FirebaseClient[]) => void): () => void {
    console.log('[Firebase Client Service] Setting up real-time listener')
    
    const clientsRef = collection(db, COLLECTIONS.CLIENTS)
    const q = query(clientsRef, orderBy('createdAt', 'desc'))
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const clients = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertFirestoreTimestamp(doc.data().createdAt),
        updatedAt: convertFirestoreTimestamp(doc.data().updatedAt)
      })) as FirebaseClient[]
      
      console.log(`[Firebase Client Service] Real-time update: ${clients.length} clients`)
      callback(clients)
    }, (error) => {
      console.error('[Firebase Client Service] Real-time listener error:', error)
    })
    
    return unsubscribe
  }

  // Client statistics
  async getClientStatistics(): Promise<{
    totalClients: number
    activeClients: number
    prospectClients: number
    googleConnectedClients: number
  }> {
    try {
      const clients = await this.getAllClients()
      
      return {
        totalClients: clients.length,
        activeClients: clients.filter(c => c.status === 'active').length,
        prospectClients: clients.filter(c => c.status === 'prospect').length,
        googleConnectedClients: clients.filter(c => c.googleBusinessProfileId).length
      }
      
    } catch (error) {
      console.error('[Firebase Client Service] Error calculating statistics:', error)
      return {
        totalClients: 0,
        activeClients: 0,
        prospectClients: 0,
        googleConnectedClients: 0
      }
    }
  }

  // Search clients by name, email, or phone
  async searchClients(searchTerm: string): Promise<FirebaseClient[]> {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - for production, consider using Algolia or similar
      const clients = await this.getAllClients()
      
      const term = searchTerm.toLowerCase()
      return clients.filter(client => 
        client.name.toLowerCase().includes(term) ||
        (client.email && client.email.toLowerCase().includes(term)) ||
        (client.phone && client.phone.includes(term))
      )
      
    } catch (error) {
      console.error('[Firebase Client Service] Error searching clients:', error)
      throw error
    }
  }
}

// Export singleton instance
export const firebaseClientService = FirebaseClientService.getInstance()
