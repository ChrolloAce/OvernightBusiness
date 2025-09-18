'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Client, firebaseClientManager } from '@/lib/managers/firebase-client-manager'
import { SavedBusinessProfile } from '@/lib/business-profiles-storage'

interface ClientContextType {
  clients: Client[]
  selectedClient: Client | null
  setSelectedClient: (client: Client | null) => void
  loadClients: () => Promise<void>
  createClient: (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>
  updateClient: (id: string, updates: Partial<Client>) => Promise<Client | null>
  deleteClient: (id: string) => Promise<boolean>
  connectGoogleBusinessProfile: (clientId: string, profileId: string, autoAssignData?: boolean) => Promise<boolean>
  getClientByGoogleBusinessProfileId: (profileId: string) => Promise<Client | null>
  isLoading: boolean
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadClients = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    try {
      console.log('[ClientProvider] Loading clients from Firebase...')
      const loadedClients = await firebaseClientManager.getAllClients()
      console.log(`[ClientProvider] Loaded ${loadedClients.length} clients`)
      setClients(loadedClients)
      
      // Auto-select first client if none selected and clients exist
      if (!selectedClient && loadedClients.length > 0) {
        setSelectedClient(loadedClients[0])
      }
    } catch (error) {
      console.error('[ClientProvider] Error loading clients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('[ClientProvider] Creating client:', clientData.name)
      const newClient = await firebaseClientManager.createClient(clientData)
      console.log('[ClientProvider] Client created:', newClient.id)
      await loadClients() // Refresh the list
      return newClient
    } catch (error) {
      console.error('[ClientProvider] Error creating client:', error)
      throw error
    }
  }

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      console.log('[ClientProvider] Updating client:', id)
      const updated = await firebaseClientManager.updateClient(id, updates)
      console.log('[ClientProvider] Client updated:', updated.id)
      await loadClients() // Refresh the list
      // Update selected client if it was the one being updated
      if (selectedClient?.id === id) {
        setSelectedClient(updated)
      }
      return updated
    } catch (error) {
      console.error('[ClientProvider] Error updating client:', error)
      return null
    }
  }

  const deleteClient = async (id: string) => {
    try {
      console.log('[ClientProvider] Deleting client:', id)
      const success = await firebaseClientManager.deleteClient(id)
      if (success) {
        console.log('[ClientProvider] Client deleted:', id)
        await loadClients() // Refresh the list
        // Clear selected client if it was deleted
        if (selectedClient?.id === id) {
          setSelectedClient(null)
        }
      }
      return success
    } catch (error) {
      console.error('[ClientProvider] Error deleting client:', error)
      return false
    }
  }

  const connectGoogleBusinessProfile = async (clientId: string, profileId: string, autoAssignData: boolean = true) => {
    try {
      console.log('[ClientProvider] Connecting Google profile:', { clientId, profileId })
      const success = await firebaseClientManager.connectGoogleBusinessProfile(clientId, profileId, undefined, autoAssignData)
      if (success) {
        console.log('[ClientProvider] Google profile connected')
        await loadClients() // Refresh the list
      }
      return success
    } catch (error) {
      console.error('[ClientProvider] Error connecting Google profile:', error)
      return false
    }
  }

  const getClientByGoogleBusinessProfileId = async (profileId: string) => {
    try {
      return await firebaseClientManager.getClientByGoogleBusinessProfileId(profileId)
    } catch (error) {
      console.error('[ClientProvider] Error getting client by Google profile:', error)
      return null
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  return (
    <ClientContext.Provider 
      value={{ 
        clients,
        selectedClient, 
        setSelectedClient, 
        loadClients,
        createClient,
        updateClient,
        deleteClient,
        connectGoogleBusinessProfile,
        getClientByGoogleBusinessProfileId,
        isLoading
      }}
    >
      {children}
    </ClientContext.Provider>
  )
}

export function useClients() {
  const context = useContext(ClientContext)
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientProvider')
  }
  return context
}
