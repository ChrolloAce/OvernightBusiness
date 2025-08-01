'use client'

import { useEffect } from 'react'
import { schedulingService } from '@/lib/scheduling-service'

export function ClientInitializer() {
  useEffect(() => {
    // Initialize the scheduling service to ensure it starts running
    console.log('[ClientInitializer] Initializing scheduling service...')
    const _ = schedulingService // This ensures the singleton is created and starts running
    console.log('[ClientInitializer] Scheduling service initialized')
  }, [])

  return null // This component doesn't render anything
} 