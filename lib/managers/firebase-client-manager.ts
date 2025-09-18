// Firebase-based Client Manager (replaces localStorage-based ClientManager)
import { firebaseClientService } from '@/lib/firebase/client-service'
import { FirebaseClient, getCurrentCompanyId, getCurrentUserId } from '@/lib/firebase'

export interface Client {
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

export interface ClientSummary {
  id: string
  name: string
  status: string
  phone?: string
  email?: string
  website?: string
  googleBusinessProfileId?: string
  lastUpdated: Date
}

export class FirebaseClientManager {
  private static instance: FirebaseClientManager
  private clientsCache: Client[] = []
  private lastCacheUpdate: Date | null = null
  private cacheTimeout = 5 * 60 * 1000 // 5 minutes

  static getInstance(): FirebaseClientManager {
    if (!FirebaseClientManager.instance) {
      FirebaseClientManager.instance = new FirebaseClientManager()
    }
    return FirebaseClientManager.instance
  }

  // Convert Firebase client to local Client interface
  private convertFirebaseClient(fbClient: FirebaseClient): Client {
    return {
      id: fbClient.id,
      name: fbClient.name,
      email: fbClient.email,
      phone: fbClient.phone,
      website: fbClient.website,
      logo: fbClient.logo,
      status: fbClient.status,
      tags: fbClient.tags || [],
      notes: fbClient.notes,
      googleBusinessProfileId: fbClient.googleBusinessProfileId,
      googleBusinessProfile: fbClient.googleBusinessProfile,
      createdAt: fbClient.createdAt,
      updatedAt: fbClient.updatedAt
    }
  }

  // Check if cache is valid
  private isCacheValid(): boolean {
    if (!this.lastCacheUpdate) return false
    return (Date.now() - this.lastCacheUpdate.getTime()) < this.cacheTimeout
  }

  // Get all clients with caching
  public async getAllClients(): Promise<Client[]> {
    try {
      // Use cache if valid
      if (this.isCacheValid() && this.clientsCache.length > 0) {
        console.log('[Firebase Client Manager] Using cached clients')
        return this.clientsCache
      }

      console.log('[Firebase Client Manager] Fetching clients from Firebase')
      const firebaseClients = await firebaseClientService.getAllClients()
      
      this.clientsCache = firebaseClients.map(this.convertFirebaseClient)
      this.lastCacheUpdate = new Date()
      
      console.log(`[Firebase Client Manager] Cached ${this.clientsCache.length} clients`)
      return this.clientsCache
      
    } catch (error) {
      console.error('[Firebase Client Manager] Error fetching clients:', error)
      // Return cache if available, otherwise empty array
      return this.clientsCache.length > 0 ? this.clientsCache : []
    }
  }

  // Get client by ID
  public async getClient(id: string): Promise<Client | null> {
    try {
      // Try cache first
      const cachedClient = this.clientsCache.find(client => client.id === id)
      if (cachedClient && this.isCacheValid()) {
        return cachedClient
      }

      // Fetch from Firebase
      const firebaseClient = await firebaseClientService.getClientById(id)
      if (!firebaseClient) return null
      
      const client = this.convertFirebaseClient(firebaseClient)
      
      // Update cache
      const index = this.clientsCache.findIndex(c => c.id === id)
      if (index >= 0) {
        this.clientsCache[index] = client
      } else {
        this.clientsCache.push(client)
      }
      
      return client
      
    } catch (error) {
      console.error('[Firebase Client Manager] Error fetching client:', error)
      return null
    }
  }

  // Create new client
  public async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> {
    try {
      console.log('[Firebase Client Manager] Creating client:', clientData.name)
      
      const firebaseClient = await firebaseClientService.createClient({
        companyId: getCurrentCompanyId(),
        name: clientData.name,
        email: clientData.email,
        phone: clientData.phone,
        website: clientData.website,
        logo: clientData.logo,
        status: clientData.status,
        tags: clientData.tags || [],
        notes: clientData.notes,
        googleBusinessProfileId: clientData.googleBusinessProfileId,
        googleBusinessProfile: clientData.googleBusinessProfile,
        assignedUserId: getCurrentUserId(),
        createdBy: getCurrentUserId()
      })
      
      const client = this.convertFirebaseClient(firebaseClient)
      
      // Add to cache
      this.clientsCache.unshift(client)
      
      console.log('[Firebase Client Manager] Client created:', client.id)
      return client
      
    } catch (error) {
      console.error('[Firebase Client Manager] Error creating client:', error)
      throw error
    }
  }

  // Update client
  public async updateClient(clientId: string, updates: Partial<Client>): Promise<Client> {
    try {
      console.log('[Firebase Client Manager] Updating client:', clientId)
      
      const firebaseClient = await firebaseClientService.updateClient(clientId, updates)
      const client = this.convertFirebaseClient(firebaseClient)
      
      // Update cache
      const index = this.clientsCache.findIndex(c => c.id === clientId)
      if (index >= 0) {
        this.clientsCache[index] = client
      }
      
      console.log('[Firebase Client Manager] Client updated:', client.id)
      return client
      
    } catch (error) {
      console.error('[Firebase Client Manager] Error updating client:', error)
      throw error
    }
  }

  // Delete client
  public async deleteClient(clientId: string): Promise<boolean> {
    try {
      console.log('[Firebase Client Manager] Deleting client:', clientId)
      
      await firebaseClientService.deleteClient(clientId)
      
      // Remove from cache
      this.clientsCache = this.clientsCache.filter(c => c.id !== clientId)
      
      console.log('[Firebase Client Manager] Client deleted:', clientId)
      return true
      
    } catch (error) {
      console.error('[Firebase Client Manager] Error deleting client:', error)
      return false
    }
  }

  // Connect Google Business Profile
  public async connectGoogleBusinessProfile(
    clientId: string, 
    profileId: string, 
    profileData?: any,
    autoAssignData: boolean = true
  ): Promise<boolean> {
    try {
      console.log('[Firebase Client Manager] Connecting Google profile:', { clientId, profileId, autoAssignData })
      
      await firebaseClientService.connectGoogleBusinessProfile(
        clientId, 
        profileId, 
        profileData,
        autoAssignData
      )
      
      // Invalidate cache to force refresh
      this.lastCacheUpdate = null
      
      console.log('[Firebase Client Manager] Google profile connected successfully')
      return true
      
    } catch (error) {
      console.error('[Firebase Client Manager] Error connecting Google profile:', error)
      return false
    }
  }

  // Get clients by status
  public async getClientsByStatus(status: Client['status']): Promise<Client[]> {
    try {
      const firebaseClients = await firebaseClientService.getClientsByStatus(status)
      return firebaseClients.map(this.convertFirebaseClient)
      
    } catch (error) {
      console.error('[Firebase Client Manager] Error fetching clients by status:', error)
      return []
    }
  }

  // Get clients with Google Business Profiles
  public async getClientsWithGoogleBusinessProfiles(): Promise<Client[]> {
    try {
      const firebaseClients = await firebaseClientService.getClientsWithGoogleBusinessProfiles()
      return firebaseClients.map(this.convertFirebaseClient)
      
    } catch (error) {
      console.error('[Firebase Client Manager] Error fetching clients with Google profiles:', error)
      return []
    }
  }

  // Get client by Google Business Profile ID
  public async getClientByGoogleBusinessProfileId(profileId: string): Promise<Client | null> {
    try {
      const clients = await this.getAllClients()
      return clients.find(client => client.googleBusinessProfileId === profileId) || null
      
    } catch (error) {
      console.error('[Firebase Client Manager] Error finding client by Google profile:', error)
      return null
    }
  }

  // Search clients
  public async searchClients(searchTerm: string): Promise<Client[]> {
    try {
      const firebaseClients = await firebaseClientService.searchClients(searchTerm)
      return firebaseClients.map(this.convertFirebaseClient)
      
    } catch (error) {
      console.error('[Firebase Client Manager] Error searching clients:', error)
      return []
    }
  }

  // Get client statistics
  public async getClientStatistics(): Promise<{
    totalClients: number
    activeClients: number
    prospectClients: number
    googleConnectedClients: number
  }> {
    try {
      return await firebaseClientService.getClientStatistics()
      
    } catch (error) {
      console.error('[Firebase Client Manager] Error getting statistics:', error)
      return {
        totalClients: 0,
        activeClients: 0,
        prospectClients: 0,
        googleConnectedClients: 0
      }
    }
  }

  // Get client summaries
  public async getClientSummaries(): Promise<ClientSummary[]> {
    try {
      const clients = await this.getAllClients()
      return clients.map(client => ({
        id: client.id,
        name: client.name,
        status: client.status,
        phone: client.phone,
        email: client.email,
        website: client.website,
        googleBusinessProfileId: client.googleBusinessProfileId,
        lastUpdated: client.updatedAt
      }))
      
    } catch (error) {
      console.error('[Firebase Client Manager] Error getting client summaries:', error)
      return []
    }
  }

  // Utility methods
  public getClientDisplayName(client: Client): string {
    return client.name || 'Unknown Client'
  }

  public getClientInitials(client: Client): string {
    const name = this.getClientDisplayName(client)
    const words = name.split(' ')
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Clear cache (useful for testing or forced refresh)
  public clearCache(): void {
    console.log('[Firebase Client Manager] Clearing cache')
    this.clientsCache = []
    this.lastCacheUpdate = null
  }

  // Set up real-time listener
  public subscribeToClients(callback: (clients: Client[]) => void): () => void {
    console.log('[Firebase Client Manager] Setting up real-time listener')
    
    return firebaseClientService.subscribeToClients((firebaseClients) => {
      this.clientsCache = firebaseClients.map(this.convertFirebaseClient)
      this.lastCacheUpdate = new Date()
      callback(this.clientsCache)
    })
  }
}

// Export singleton instance
export const firebaseClientManager = FirebaseClientManager.getInstance()
