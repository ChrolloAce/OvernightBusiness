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
  public connectGoogleBusinessProfile(clientId: string, profileId: string, autoAssignData: boolean = true): boolean {
    try {
      // Get the Google Business Profile from storage
      const { BusinessProfilesStorage } = require('../business-profiles-storage')
      const profile = BusinessProfilesStorage.getProfile(profileId)
      
      if (!profile) {
        console.error('[ClientManager] Google Business Profile not found:', profileId)
        return false
      }

      // Get current client data
      const currentClient = this.getClient(clientId)
      if (!currentClient) {
        console.error('[ClientManager] Client not found:', clientId)
        return false
      }

      // Prepare update data
      const updateData: Partial<Client> = {
        googleBusinessProfileId: profileId,
        googleBusinessProfile: profile
      }

      // Auto-assign data from Google Business Profile if requested
      if (autoAssignData) {
        const autoAssignedData = this.extractDataFromGoogleProfile(profile, currentClient)
        Object.assign(updateData, autoAssignedData)
      }

      const updated = this.updateClient(clientId, updateData)

      if (updated) {
        console.log('[ClientManager] Successfully connected Google Business Profile and auto-assigned data:', {
          clientId,
          profileId,
          autoAssigned: autoAssignData ? Object.keys(updateData).filter(key => key !== 'googleBusinessProfileId' && key !== 'googleBusinessProfile') : []
        })
      }

      return !!updated
    } catch (error) {
      console.error('[ClientManager] Failed to connect Google Business Profile:', error)
      return false
    }
  }

  // Extract relevant data from Google Business Profile for auto-assignment
  private extractDataFromGoogleProfile(profile: SavedBusinessProfile, currentClient: Client): Partial<Client> {
    const extractedData: Partial<Client> = {}

    // Phone number - use primary phone from Google profile if client doesn't have one
    // Try multiple possible locations for phone number
    if (!currentClient.phone) {
      const possiblePhones = [
        profile.phone,
        profile.googleData?.phoneNumbers?.primaryPhone,
        profile.googleData?.adWordsLocationExtensions?.adPhone
      ].filter(Boolean)
      
      if (possiblePhones.length > 0) {
        extractedData.phone = possiblePhones[0]
        console.log('[ClientManager] Extracted phone:', possiblePhones[0])
      }
    }

    // Website - use website from Google profile if client doesn't have one
    if (!currentClient.website && profile.website) {
      extractedData.website = profile.website
      console.log('[ClientManager] Extracted website:', profile.website)
    }

    // Note: We intentionally skip email as per user request

    // Update client name if it's generic and we have a better name from Google
    if ((!currentClient.name || currentClient.name.toLowerCase().includes('untitled') || currentClient.name.toLowerCase().includes('new client')) && profile.name) {
      extractedData.name = profile.name
    } else if ((!currentClient.name || currentClient.name.toLowerCase().includes('untitled') || currentClient.name.toLowerCase().includes('new client')) && profile.googleData?.title) {
      extractedData.name = profile.googleData.title
    }

    // Add business category as a tag if not already present
    if (profile.category && !currentClient.tags.includes(profile.category)) {
      extractedData.tags = [...currentClient.tags, profile.category]
    }

    // Add additional categories as tags
    if (profile.googleData?.allCategories) {
      const newTags = profile.googleData.allCategories.filter(cat => 
        cat && !currentClient.tags.includes(cat) && cat !== profile.category
      )
      if (newTags.length > 0) {
        extractedData.tags = [...(extractedData.tags || currentClient.tags), ...newTags]
      }
    }

    // Add business address information to notes if not already present
    if (profile.address && (!currentClient.notes || !currentClient.notes.includes(profile.address))) {
      const addressInfo = `\n\nBusiness Address: ${profile.address}`
      extractedData.notes = (currentClient.notes || '') + addressInfo
    }

    // Add business hours to notes if available
    if (profile.googleData?.businessHours && profile.googleData.businessHours.length > 0) {
      const hoursInfo = `\n\nBusiness Hours:\n${profile.googleData.businessHours.join('\n')}`
      extractedData.notes = (extractedData.notes || currentClient.notes || '') + hoursInfo
    }

    return extractedData
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
