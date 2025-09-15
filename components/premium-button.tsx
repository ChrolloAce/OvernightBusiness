'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { SuperwallService } from '@/lib/superwall-service'
import { GoogleAuthService } from '@/lib/google-auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Crown, CheckCircle, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PremiumButtonProps {
  variant?: 'default' | 'landing' | 'upgrade'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function PremiumButton({ variant = 'default', size = 'default', className = '' }: PremiumButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error' | 'cancelled'>('idle')
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleUpgrade = async () => {
    setIsLoading(true)
    setStatus('processing')
    setMessage('Initializing payment...')

    try {
      // Check if user is authenticated with Google first
      const googleAuth = GoogleAuthService.getInstance()
      if (!googleAuth.isAuthenticated()) {
        // Redirect to Google auth first
        const authUrl = googleAuth.getAuthUrl()
        window.location.href = authUrl
        return
      }

      // Initialize Superwall
      const superwall = SuperwallService.getInstance()
      await superwall.initialize()

      // Check if user already has active subscription
      const currentSubscription = await superwall.checkSubscriptionStatus()
      if (currentSubscription.isActive && currentSubscription.status === 'active') {
        setStatus('success')
        setMessage('You already have an active subscription!')
        
        // Redirect to app after 2 seconds
        setTimeout(() => {
          router.push('/profiles')
        }, 2000)
        return
      }

      // Present paywall
      setMessage('Loading payment options...')
      const result = await superwall.presentPaywall('premium_upgrade')

      if (result.result === 'purchased') {
        setStatus('success')
        setMessage('Welcome to Premium! Redirecting to your dashboard...')
        
        // Redirect to app after successful purchase
        setTimeout(() => {
          router.push('/profiles')
        }, 2000)
      } else if (result.result === 'cancelled') {
        setStatus('cancelled')
        setMessage('Purchase cancelled')
        setTimeout(() => {
          setStatus('idle')
          setMessage('')
        }, 3000)
      } else {
        setStatus('error')
        setMessage(result.error || 'Payment failed. Please try again.')
        setTimeout(() => {
          setStatus('idle')
          setMessage('')
        }, 5000)
      }
    } catch (error) {
      console.error('[PremiumButton] Error during upgrade:', error)
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
      setTimeout(() => {
        setStatus('idle')
        setMessage('')
      }, 5000)
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonContent = () => {
    switch (status) {
      case 'processing':
        return (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        )
      case 'success':
        return (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Success!
          </>
        )
      case 'error':
        return (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Try Again
          </>
        )
      case 'cancelled':
        return (
          <>
            <AlertCircle className="w-4 h-4 mr-2" />
            Cancelled
          </>
        )
      default:
        if (variant === 'landing') {
          return (
            <>
              <Crown className="w-4 h-4 mr-2" />
              Get Premium Access
            </>
          )
        }
        return (
          <>
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </>
        )
    }
  }

  const getButtonVariant = () => {
    switch (status) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      case 'cancelled':
        return 'outline'
      default:
        return variant === 'landing' ? 'default' : 'outline'
    }
  }

  const baseClasses = variant === 'landing' 
    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg' 
    : ''

  return (
    <div className="relative">
      <Button
        onClick={handleUpgrade}
        disabled={isLoading}
        size={size}
        variant={getButtonVariant()}
        className={`${baseClasses} ${className} transition-all duration-300`}
      >
        {getButtonContent()}
      </Button>

      {/* Status message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-2 z-10"
        >
          <div className={`text-xs text-center p-2 rounded-lg shadow-lg ${
            status === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
            status === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
            status === 'cancelled' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
            'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            {message}
          </div>
        </motion.div>
      )}

      {/* Premium badge for variants */}
      {variant === 'landing' && (
        <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1">
          Premium
        </Badge>
      )}
    </div>
  )
} 