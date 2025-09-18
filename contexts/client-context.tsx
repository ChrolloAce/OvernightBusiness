'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Client, firebaseClientManager } from '@/lib/managers/firebase-client-manager'
import { SavedBusinessProfile } from '@/lib/business-profiles-storage'

interface ClientContextType {
  clients: Client[]
  selectedClient: Client | null
  setSelectedClient: (client: Client | null) => void
  loadClients: () => void
  createClient: (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Client
  updateClient: (id: string, updates: Partial<Client>) => Client | null
  deleteClient: (id: string) => boolean
  connectGoogleBusinessProfile: (clientId: string, profileId: string, autoAssignData?: boolean) => boolean
  getClientByGoogleBusinessProfileId: (profileId: string) => Client | null
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

  const deleteClient = (id: string) => {
    const success = clientManager.deleteClient(id)
    if (success) {
      loadClients() // Refresh the list
      // Clear selected client if it was deleted
      if (selectedClient?.id === id) {
        setSelectedClient(null)
      }
    }
    return success
  }

  const connectGoogleBusinessProfile = (clientId: string, profileId: string, autoAssignData: boolean = true) => {
    const success = clientManager.connectGoogleBusinessProfile(clientId, profileId, autoAssignData)
    if (success) {
      loadClients() // Refresh the list
    }
    return success
  }

  const getClientByGoogleBusinessProfileId = (profileId: string) => {
    return clientManager.getClientByGoogleBusinessProfileId(profileId)
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
