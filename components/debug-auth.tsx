'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

export function DebugAuth() {
  const { user, isAuthenticated, needsOnboarding, signOut } = useAuth()
  
  const handleForceSignOut = async () => {
    try {
      console.log('[Debug] Force signing out...')
      await signOut()
      
      // Clear all localStorage
      localStorage.clear()
      
      // Clear any Firebase persistence
      if (typeof window !== 'undefined') {
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
        })
        
        // Clear all storage
        localStorage.clear()
        sessionStorage.clear()
      }
      
      // Force reload
      window.location.href = '/'
    } catch (error) {
      console.error('[Debug] Error force signing out:', error)
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = '/'
    }
  }

  const handleSkipOnboarding = () => {
    try {
      console.log('[Debug] Skipping onboarding...')
      // Force redirect to dashboard
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('[Debug] Error skipping onboarding:', error)
    }
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-red-100 border border-red-300 rounded-lg p-4 text-sm max-w-sm">
      <h3 className="font-bold text-red-800 mb-2">Debug Auth State</h3>
      <div className="space-y-1 text-red-700">
        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
        <p>Needs Onboarding: {needsOnboarding ? 'Yes' : 'No'}</p>
        <p>User Email: {user?.email || 'None'}</p>
        <p>Company ID: {user?.companyId || 'None'}</p>
      </div>
      <div className="space-y-2 mt-3">
        <Button 
          onClick={handleSkipOnboarding}
          size="sm" 
          className="bg-green-600 hover:bg-green-700 text-white w-full"
        >
          Skip to Dashboard
        </Button>
        <Button 
          onClick={handleForceSignOut}
          size="sm" 
          className="bg-red-600 hover:bg-red-700 text-white w-full"
        >
          Force Sign Out & Clear All
        </Button>
      </div>
    </div>
  )
}
