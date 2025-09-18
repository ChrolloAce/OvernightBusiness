'use client'

import { useEffect } from 'react'

export default function ClearDataPage() {
  useEffect(() => {
    console.log('🧹 CLEARING ALL LOCALSTORAGE DATA...')
    
    // Clear all localStorage
    try {
      localStorage.clear()
      console.log('✅ localStorage.clear() completed')
    } catch (error) {
      console.error('❌ localStorage.clear() failed:', error)
    }
    
    // Also manually remove specific keys
    const keysToRemove = [
      'clients',
      'tasks', 
      'twilio_phone_numbers',
      'business_profiles',
      'deals',
      'projects',
      'user_settings',
      'app_state',
      'selectedClient',
      'selectedProfile',
      'automation_settings'
    ]
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key)
        console.log(`✅ Removed: ${key}`)
      } catch (error) {
        console.error(`❌ Failed to remove ${key}:`, error)
      }
    })
    
    console.log('🎉 ALL LOCAL DATA CLEARED!')
    
    // Show alert and redirect
    alert('✅ All localStorage data has been cleared! Redirecting to dashboard...')
    
    // Redirect to dashboard after clearing
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 1000)
    
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Clearing Local Data</h1>
        <p className="text-gray-600">Removing all localStorage data and redirecting...</p>
      </div>
    </div>
  )
}
