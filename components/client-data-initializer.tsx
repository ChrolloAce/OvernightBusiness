'use client'

import { useEffect } from 'react'
import { useClients } from '@/contexts/client-context'
import { useProfile } from '@/contexts/profile-context'

export function ClientDataInitializer() {
  const { clients, loadClients, createClient } = useClients()
  const { profiles } = useProfile()

  useEffect(() => {
    // Initialize demo data if no clients exist
    if (clients.length === 0) {
      initializeDemoData()
    }
  }, [clients.length])

  const initializeDemoData = async () => {
    try {
      console.log('[ClientDataInitializer] Initializing demo client data...')
      
      // Wait a bit to ensure profiles are loaded
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Create demo clients with Google Business Profile integration
      const demoClients = [
        {
          name: 'BMW Company',
          email: 'contact@bmw.com',
          phone: '(840) 574-8039',
          website: 'https://bmw.com',
          status: 'active' as const,
          tags: ['automotive', 'premium'],
          notes: 'Premium automotive client with multiple locations',
          googleBusinessProfileId: profiles.length > 0 ? profiles[0].id : undefined,
          activeProjects: 3,
          lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          totalRevenue: 45000,
          outstandingInvoices: 2
        },
        {
          name: 'Samsung Company',
          email: 'hello@samsung.com',
          phone: '(840) 574-8039',
          website: 'https://samsung.com',
          status: 'active' as const,
          tags: ['technology', 'electronics'],
          notes: 'Technology client focusing on retail locations',
          googleBusinessProfileId: profiles.length > 1 ? profiles[1].id : undefined,
          activeProjects: 2,
          lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          totalRevenue: 32000,
          outstandingInvoices: 1
        },
        {
          name: 'Tinder Company',
          email: 'support@tinder.com',
          phone: '(840) 574-8039',
          website: 'https://tinder.com',
          status: 'prospect' as const,
          tags: ['social', 'app'],
          notes: 'Social media app looking for digital marketing services',
          activeProjects: 1,
          lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          totalRevenue: 8000,
          outstandingInvoices: 0
        }
      ]

      // Create each demo client
      for (const clientData of demoClients) {
        createClient(clientData)
      }

      console.log('[ClientDataInitializer] Demo data initialized successfully')
    } catch (error) {
      console.error('[ClientDataInitializer] Failed to initialize demo data:', error)
    }
  }

  return null // This component doesn't render anything
}
