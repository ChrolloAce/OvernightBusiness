import { SavedBusinessProfile } from '../business-profiles-storage'

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  website?: string
  status: 'active' | 'inactive' | 'prospect' | 'archived'
  tags: string[]
  notes?: string
  createdAt: string
  updatedAt: string
  
  // Google Business Profile Integration
  googleBusinessProfileId?: string
  googleBusinessProfile?: SavedBusinessProfile
  
  // Phone Tracking Integration
  trackingPhoneNumber?: string // Twilio number assigned for tracking
  trackingPhoneSid?: string // Twilio phone number SID
  customWebhookUrl?: string // Custom webhook endpoint for this client
  
  // Computed fields
  activeProjects?: number
  lastActivity?: string
  totalRevenue?: number
  outstandingInvoices?: number
}

export interface ClientSummary {
  id: string
  name: string
  status: string
  activeProjects: number
  totalRevenue: number
  lastActivity: string
  googleBusinessConnected: boolean
}

export class ClientManager {
  private static instance: ClientManager
  private readonly STORAGE_KEY = 'overnight_biz_clients'

  private constructor() {}

  public static getInstance(): ClientManager {
    if (!ClientManager.instance) {
      ClientManager.instance = new ClientManager()
    }
    return ClientManager.instance
  }

  // Client CRUD Operations
  public getAllClients(): Client[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('[ClientManager] Failed to load clients:', error)
      return []
    }
  }

  public getClient(id: string): Client | null {
    return this.getAllClients().find(client => client.id === id) || null
  }

  public createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Client {
    const newClient: Client = {
      ...clientData,
      id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const clients = this.getAllClients()
    clients.push(newClient)
    this.saveClients(clients)

    console.log('[ClientManager] Client created:', newClient.name)
    return newClient
  }

  public updateClient(id: string, updates: Partial<Client>): Client | null {
    try {
      const clients = this.getAllClients()
      const index = clients.findIndex(client => client.id === id)
      
      if (index >= 0) {
        clients[index] = {
          ...clients[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        this.saveClients(clients)
        return clients[index]
      }
      return null
    } catch (error) {
      console.error('[ClientManager] Failed to update client:', error)
      return null
    }
  }

  public deleteClient(id: string): boolean {
    try {
      const clients = this.getAllClients()
      const filteredClients = clients.filter(client => client.id !== id)
      
      if (filteredClients.length !== clients.length) {
        this.saveClients(filteredClients)
        return true
      }
      return false
    } catch (error) {
      console.error('[ClientManager] Failed to delete client:', error)
      return false
    }
  }

  // Google Business Profile Integration
  public connectGoogleBusinessProfile(clientId: string, profileId: string): boolean {
    try {
      // Get the Google Business Profile from storage
      const { BusinessProfilesStorage } = require('../business-profiles-storage')
      const profile = BusinessProfilesStorage.getProfile(profileId)
      
      if (!profile) {
        console.error('[ClientManager] Google Business Profile not found:', profileId)
        return false
      }

      const updated = this.updateClient(clientId, {
        googleBusinessProfileId: profileId,
        googleBusinessProfile: profile
      })

      return !!updated
    } catch (error) {
      console.error('[ClientManager] Failed to connect Google Business Profile:', error)
      return false
    }
  }

  public disconnectGoogleBusinessProfile(clientId: string): boolean {
    const updated = this.updateClient(clientId, {
      googleBusinessProfileId: undefined,
      googleBusinessProfile: undefined
    })

    return !!updated
  }

  public getClientsWithGoogleBusinessProfiles(): Client[] {
    return this.getAllClients().filter(client => client.googleBusinessProfileId)
  }

  public getClientByGoogleBusinessProfileId(profileId: string): Client | null {
    return this.getAllClients().find(client => client.googleBusinessProfileId === profileId) || null
  }

  // Client Filtering and Search
  public searchClients(query: string): Client[] {
    const lowercaseQuery = query.toLowerCase().trim()
    
    if (!lowercaseQuery) {
      return this.getAllClients()
    }

    return this.getAllClients().filter(client => 
      client.name.toLowerCase().includes(lowercaseQuery) ||
      client.email?.toLowerCase().includes(lowercaseQuery) ||
      client.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
      client.notes?.toLowerCase().includes(lowercaseQuery)
    )
  }

  public getClientsByStatus(status: string): Client[] {
    return this.getAllClients().filter(client => client.status === status)
  }

  public getClientsByTag(tag: string): Client[] {
    return this.getAllClients().filter(client => 
      client.tags.some(clientTag => clientTag.toLowerCase() === tag.toLowerCase())
    )
  }

  // Client Statistics
  public getClientSummaries(): ClientSummary[] {
    return this.getAllClients().map(client => ({
      id: client.id,
      name: client.name,
      status: client.status,
      activeProjects: client.activeProjects || 0,
      totalRevenue: client.totalRevenue || 0,
      lastActivity: client.lastActivity || 'Never',
      googleBusinessConnected: !!client.googleBusinessProfileId
    }))
  }

  public getClientsCount(): number {
    return this.getAllClients().length
  }

  public getActiveClientsCount(): number {
    return this.getClientsByStatus('active').length
  }

  public getProspectClientsCount(): number {
    return this.getClientsByStatus('prospect').length
  }

  public getGoogleBusinessConnectedCount(): number {
    return this.getClientsWithGoogleBusinessProfiles().length
  }

  public getTotalRevenue(): number {
    return this.getAllClients().reduce((sum, client) => sum + (client.totalRevenue || 0), 0)
  }

  // Validation
  public validateClient(clientData: Partial<Client>): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!clientData.name?.trim()) {
      errors.push('Company name is required')
    }

    if (clientData.email && !this.isValidEmail(clientData.email)) {
      errors.push('Invalid email address')
    }

    if (clientData.website && !this.isValidUrl(clientData.website)) {
      errors.push('Invalid website URL')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  // Utility Methods
  public getClientDisplayName(client: Client): string {
    return client.name || 'Unknown Client'
  }

  public getClientInitials(client: Client): string {
    const name = this.getClientDisplayName(client)
    const words = name.split(' ')
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  public getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'prospect': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'archived': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  public formatLastActivity(client: Client): string {
    if (!client.lastActivity) return 'Never'
    
    try {
      const date = new Date(client.lastActivity)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffHours / 24)

      if (diffHours < 1) return 'Just now'
      if (diffHours < 24) return `${diffHours} hours ago`
      if (diffDays < 7) return `${diffDays} days ago`
      return date.toLocaleDateString()
    } catch {
      return 'Unknown'
    }
  }

  // Data Management
  private saveClients(clients: Client[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clients))
    } catch (error) {
      console.error('[ClientManager] Failed to save clients:', error)
      throw new Error('Failed to save clients to storage')
    }
  }

  public exportClients(): string {
    return JSON.stringify(this.getAllClients(), null, 2)
  }

  public importClients(jsonData: string): boolean {
    try {
      const clients = JSON.parse(jsonData) as Client[]
      
      if (!Array.isArray(clients)) {
        throw new Error('Invalid data format')
      }

      this.saveClients(clients)
      return true
    } catch (error) {
      console.error('[ClientManager] Failed to import clients:', error)
      return false
    }
  }

  public clearAllClients(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.error('[ClientManager] Failed to clear clients:', error)
    }
  }
}
