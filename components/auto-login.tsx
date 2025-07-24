'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { GoogleAuthService } from '@/lib/google-auth'
import { SuperwallService } from '@/lib/superwall-service'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle, User, CreditCard } from 'lucide-react'

interface AutoLoginProps {
  children: React.ReactNode
}

export function AutoLogin({ children }: AutoLoginProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [status, setStatus] = useState<{
    googleAuth: boolean
    subscription: boolean
    autoLoginEligible: boolean
  }>({
    googleAuth: false,
    subscription: false,
    autoLoginEligible: false
  })

  useEffect(() => {
    checkAutoLoginEligibility()
  }, [])

  const checkAutoLoginEligibility = async () => {
    // Don't auto-login if user is already in the app or on specific pages
    if (pathname !== '/') {
      setIsChecking(false)
      return
    }

    try {
      console.log('[AutoLogin] Checking auto-login eligibility...')
      
      // Initialize services
      const googleAuth = GoogleAuthService.getInstance()
      const superwall = SuperwallService.getInstance()

      // Check Google authentication
      const isGoogleAuthenticated = googleAuth.isAuthenticated()
      console.log('[AutoLogin] Google authenticated:', isGoogleAuthenticated)

      // Check Superwall subscription
      let hasActiveSubscription = false
      if (isGoogleAuthenticated) {
        try {
          await superwall.initialize()
          hasActiveSubscription = superwall.hasActiveSubscription()
          console.log('[AutoLogin] Has active subscription:', hasActiveSubscription)
        } catch (error) {
          console.error('[AutoLogin] Error checking subscription:', error)
        }
      }

      // Update status for UI feedback
      setStatus({
        googleAuth: isGoogleAuthenticated,
        subscription: hasActiveSubscription,
        autoLoginEligible: isGoogleAuthenticated && hasActiveSubscription
      })

      // Auto-redirect if both conditions are met
      if (isGoogleAuthenticated && hasActiveSubscription) {
        console.log('[AutoLogin] Auto-login eligible - redirecting to app...')
        
        // Small delay for UI feedback, then redirect
        setTimeout(() => {
          router.push('/profiles')
        }, 1500)
      } else {
        console.log('[AutoLogin] Auto-login not eligible:', {
          googleAuth: isGoogleAuthenticated,
          subscription: hasActiveSubscription
        })
        setIsChecking(false)
      }
    } catch (error) {
      console.error('[AutoLogin] Error during auto-login check:', error)
      setIsChecking(false)
    }
  }

  // Show loading spinner while checking
  if (isChecking && pathname === '/') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 p-8"
        >
          {/* Logo */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-xl mx-auto">
            <span className="text-2xl font-bold text-white">OB</span>
          </div>

          {/* Status indicators */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
            <p className="text-gray-600">Checking your account status...</p>

            {/* Authentication Status */}
            <div className="space-y-3 max-w-sm mx-auto">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-700">Google Account</span>
                </div>
                {status.googleAuth ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-700">Active Subscription</span>
                </div>
                {status.subscription ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : status.googleAuth ? (
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
              </div>
            </div>

            {/* Auto-login message */}
            {status.autoLoginEligible && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center justify-center space-x-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Redirecting to your dashboard...</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Loading animation */}
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        </motion.div>
      </div>
    )
  }

  // Render children normally if not auto-logging in
  return <>{children}</>
} 