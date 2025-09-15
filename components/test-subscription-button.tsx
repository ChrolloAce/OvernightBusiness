'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SuperwallService } from '@/lib/superwall-service'
import { GoogleAuthService } from '@/lib/google-auth'
import { Badge } from '@/components/ui/badge'
import { TestTube, CheckCircle, XCircle } from 'lucide-react'

interface TestSubscriptionButtonProps {
  className?: string
}

export function TestSubscriptionButton({ className = '' }: TestSubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const activateTestSubscription = async () => {
    setIsLoading(true)
    setMessage('Activating test subscription...')

    try {
      // Check if user is authenticated with Google first
      const googleAuth = GoogleAuthService.getInstance()
      if (!googleAuth.isAuthenticated()) {
        setMessage('Please authenticate with Google first')
        setTimeout(() => setMessage(''), 3000)
        setIsLoading(false)
        return
      }

      const userInfo = googleAuth.getUserInfo()
      if (!userInfo?.email) {
        setMessage('No user email found')
        setTimeout(() => setMessage(''), 3000)
        setIsLoading(false)
        return
      }

      // Create test subscription
      const testSubscription = {
        isActive: true,
        status: 'active' as const,
        productId: 'test_premium',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        userId: userInfo.email
      }

      // Save directly to localStorage for testing
      const key = `superwall_subscription_${userInfo.email}`
      localStorage.setItem(key, JSON.stringify(testSubscription))

      // Initialize Superwall service to pick up the new subscription
      const superwall = SuperwallService.getInstance()
      await superwall.initialize()

      setMessage('✅ Test subscription activated! Try refreshing the page.')
      setTimeout(() => setMessage(''), 5000)
    } catch (error) {
      console.error('Error activating test subscription:', error)
      setMessage('❌ Failed to activate test subscription')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const deactivateTestSubscription = async () => {
    setIsLoading(true)
    setMessage('Deactivating test subscription...')

    try {
      const googleAuth = GoogleAuthService.getInstance()
      const userInfo = googleAuth.getUserInfo()

      if (userInfo?.email) {
        const key = `superwall_subscription_${userInfo.email}`
        localStorage.removeItem(key)
      }

      // Clear Superwall service
      const superwall = SuperwallService.getInstance()
      superwall.clearSubscription()

      setMessage('✅ Test subscription deactivated!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error deactivating test subscription:', error)
      setMessage('❌ Failed to deactivate test subscription')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
          <TestTube className="w-3 h-3 mr-1" />
          Test Mode
        </Badge>
      </div>
      
      <div className="flex space-x-2">
        <Button
          onClick={activateTestSubscription}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="text-green-600 border-green-300 hover:bg-green-50"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Activate Test Sub
        </Button>
        
        <Button
          onClick={deactivateTestSubscription}
          disabled={isLoading}
          size="sm"
          variant="outline"
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Deactivate Test Sub
        </Button>
      </div>

      {message && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded border">
          {message}
        </div>
      )}
    </div>
  )
} 