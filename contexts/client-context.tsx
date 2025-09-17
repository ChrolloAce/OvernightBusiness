'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Client, ClientManager } from '@/lib/managers/client-manager'
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
  const [clientManager] = useState(() => ClientManager.getInstance())

  const loadClients = () => {
    const loadedClients = clientManager.getAllClients()
    setClients(loadedClients)
    
    // Auto-select first client if none selected and clients exist
    if (!selectedClient && loadedClients.length > 0) {
      setSelectedClient(loadedClients[0])
    }
  }

  const createClient = (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient = clientManager.createClient(clientData)
    loadClients() // Refresh the list
    return newClient
  }

  const updateClient = (id: string, updates: Partial<Client>) => {
    const updated = clientManager.updateClient(id, updates)
    if (updated) {
      loadClients() // Refresh the list
      // Update selected client if it was the one being updated
      if (selectedClient?.id === id) {
        setSelectedClient(updated)
      }
    }
    return updated
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
