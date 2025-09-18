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
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientManager] = useState(() => firebaseClientManager)

  const loadClients = async () => {
    try {
      console.log('[ClientProvider] Loading clients from Firebase...')
      const loadedClients = await clientManager.getAllClients()
      setClients(loadedClients)
      console.log(`[ClientProvider] Loaded ${loadedClients.length} clients from Firebase`)
      
      // Auto-select first client if none selected and clients exist
      if (!selectedClient && loadedClients.length > 0) {
        setSelectedClient(loadedClients[0])
      }
    } catch (error) {
      console.error('[ClientProvider] Error loading clients:', error)
      setClients([])
    }
  }

  const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('[ClientProvider] Creating client in Firebase:', clientData.name)
      const newClient = await clientManager.createClient(clientData)
      console.log('[ClientProvider] Client created successfully:', newClient.id)
      await loadClients() // Refresh the list
      return newClient
    } catch (error) {
      console.error('[ClientProvider] Error creating client:', error)
      throw error
    }
  }

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      console.log('[ClientProvider] Updating client in Firebase:', id)
      const updated = await clientManager.updateClient(id, updates)
      if (updated) {
        await loadClients() // Refresh the list
        // Update selected client if it was the one being updated
        if (selectedClient?.id === id) {
          setSelectedClient(updated)
        }
      }
      return updated
    } catch (error) {
      console.error('[ClientProvider] Error updating client:', error)
      return null
    }
  }

  const deleteClient = async (id: string) => {
    try {
      console.log('[ClientProvider] Deleting client from Firebase:', id)
      const success = await clientManager.deleteClient(id)
      if (success) {
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
      console.log('[ClientProvider] Connecting Google Business Profile in Firebase:', { clientId, profileId })
      const success = await clientManager.connectGoogleBusinessProfile(clientId, profileId, undefined, autoAssignData)
      if (success) {
        await loadClients() // Refresh the list
      }
      return success
    } catch (error) {
      console.error('[ClientProvider] Error connecting Google Business Profile:', error)
      return false
    }
  }

  const getClientByGoogleBusinessProfileId = async (profileId: string) => {
    try {
      return await clientManager.getClientByGoogleBusinessProfileId(profileId)
    } catch (error) {
      console.error('[ClientProvider] Error finding client by Google profile:', error)
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
        getClientByGoogleBusinessProfileId
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
