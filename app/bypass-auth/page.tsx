'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getCurrentCompanyId, getCurrentUserId } from '@/lib/firebase'

export default function BypassAuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleBypassAuth = async () => {
    setIsLoading(true)
    
    try {
      // Set the user as authenticated in localStorage
      const companyId = getCurrentCompanyId()
      const userId = getCurrentUserId()
      
      localStorage.setItem('currentCompanyId', companyId)
      localStorage.setItem('currentUserId', userId)
      localStorage.setItem('auth_bypass', 'true')
      
      console.log('Auth bypass activated:', { companyId, userId })
      
      alert('✅ Authentication bypassed! Redirecting to dashboard...')
      
      // Force refresh to reset auth state
      window.location.href = '/dashboard'
      
    } catch (error) {
      console.error('Error bypassing auth:', error)
      alert('❌ Error bypassing auth')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearAndLogin = () => {
    // Clear all auth state and go to login
    localStorage.removeItem('currentCompanyId')
    localStorage.removeItem('currentUserId')
    localStorage.removeItem('auth_bypass')
    
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full">
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Authentication Bypass
          </h1>
          
          <p className="text-gray-600">
            Since you already have Firebase data, you can bypass the authentication flow temporarily.
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={handleBypassAuth}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isLoading ? 'Bypassing...' : 'Bypass Auth & Go to Dashboard'}
            </Button>
            
            <Button
              onClick={handleClearAndLogin}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Clear Data & Go to Login
            </Button>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> This is a temporary bypass. For production, you should complete the proper authentication flow.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
