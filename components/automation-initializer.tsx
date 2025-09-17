'use client'

import { useEffect } from 'react'

export function AutomationInitializer() {
  useEffect(() => {
    // Initialize the automation service
    console.log('[AutomationInitializer] Starting automation service...')
    
    const initializeAutomations = async () => {
      try {
        const { AutomationService } = await import('@/lib/automation-service')
        const automationService = AutomationService.getInstance()
        console.log('[AutomationInitializer] Automation service initialized and running')
      } catch (error) {
        console.error('[AutomationInitializer] Error initializing automation service:', error)
      }
    }
    
    initializeAutomations()
  }, [])

  return null // This component doesn't render anything
}
