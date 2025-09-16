'use client'

import { useEffect } from 'react'
import { useClients } from '@/contexts/client-context'
import { clearMockData } from '@/lib/clear-mock-data'

export function ClientDataInitializer() {
  const { loadClients } = useClients()

  useEffect(() => {
    // Clear any existing mock/demo data on startup
    clearMockData()
    
    // Load real clients from localStorage
    loadClients()
    
    console.log('[ClientDataInitializer] Initialized with real client data only')
  }, [])

  return null // This component doesn't render anything
}
