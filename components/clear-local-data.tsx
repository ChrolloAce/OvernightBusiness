'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Trash2, AlertTriangle } from 'lucide-react'
import { clearAllLocalStorageData } from '@/lib/firebase'

export function ClearLocalData() {
  const handleClearData = () => {
    if (confirm('Are you sure you want to clear ALL local data? This cannot be undone!')) {
      try {
        clearAllLocalStorageData()
        
        // Also clear any other potential localStorage keys
        const additionalKeys = [
          'selectedClient',
          'selectedProfile', 
          'user_settings',
          'app_state',
          'automation_settings'
        ]
        
        additionalKeys.forEach(key => {
          try {
            localStorage.removeItem(key)
            console.log(`✅ Removed: ${key}`)
          } catch (error) {
            console.error(`❌ Failed to remove ${key}:`, error)
          }
        })
        
        alert('✅ All local data cleared! Please refresh the page.')
        
        // Force page refresh to reset all state
        window.location.reload()
        
      } catch (error) {
        console.error('Error clearing data:', error)
        alert('❌ Failed to clear some data. Check console.')
      }
    }
  }

  return (
    <Card className="p-6 border-red-200 bg-red-50">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Clear All Local Data
          </h3>
          <p className="text-sm text-red-700 mb-4">
            This will permanently delete all data stored in your browser's localStorage, 
            including clients, tasks, phone assignments, and settings. Use this to start 
            fresh with Firebase-only data storage.
          </p>
          <Button
            onClick={handleClearData}
            variant="destructive"
            size="lg"
            className="w-full"
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Clear All Local Data & Refresh
          </Button>
        </div>
      </div>
    </Card>
  )
}
