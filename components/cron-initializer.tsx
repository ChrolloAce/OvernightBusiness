'use client'

import { useEffect } from 'react'
import { CronScheduler } from '@/lib/cron-scheduler'

export function CronInitializer() {
  useEffect(() => {
    console.log('[CronInitializer] Initializing cron scheduler...')
    
    // Initialize the cron scheduler
    CronScheduler.initialize()
    
    // Cleanup on unmount
    return () => {
      CronScheduler.stopScheduler()
    }
  }, [])

  return null // This component doesn't render anything
}
