'use client'

import { useEffect } from 'react'
import { useClients } from '@/contexts/client-context'

export function ClientDataInitializer() {
  const { loadClients } = useClients()

  useEffect(() => {
    // Just load existing clients, don't create demo data
    loadClients()
  }, [])

  return null // This component doesn't render anything
}
