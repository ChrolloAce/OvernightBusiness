'use client'

import { useState, useEffect } from 'react'
import { Globe, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GoogleAuthService } from '@/lib/google-auth'

interface GoogleAuthButtonProps {
  onAuthChange?: (isAuthenticated: boolean) => void
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function GoogleAuthButton({ 
  onAuthChange, 
  variant = 'default', 
  size = 'md',
  className = '' 
}: GoogleAuthButtonProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const googleAuth = GoogleAuthService.getInstance()
      const authenticated = googleAuth.isAuthenticated()
      setIsAuthenticated(authenticated)
      onAuthChange?.(authenticated)
      
      console.log('[GoogleAuthButton] Authentication status:', authenticated)
    } catch (error) {
      console.error('[GoogleAuthButton] Error checking auth status:', error)
      setIsAuthenticated(false)
      onAuthChange?.(false)
    }
  }

  const handleAuth = async () => {
    if (isAuthenticated) {
      // If already authenticated, just refresh status
      await checkAuthStatus()
      return
    }

    setIsLoading(true)
    try {
      console.log('[GoogleAuthButton] Starting Google authentication...')
      
      const googleAuth = GoogleAuthService.getInstance()
      const authUrl = googleAuth.getAuthUrl()
      
      console.log('[GoogleAuthButton] Redirecting to Google OAuth:', authUrl)
      
      // Redirect to Google OAuth
      window.location.href = authUrl
    } catch (error) {
      console.error('[GoogleAuthButton] Error starting authentication:', error)
      setIsLoading(false)
      alert('Error starting Google authentication. Please try again.')
    }
  }

  if (!mounted) return null

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAuth}
      disabled={isLoading}
      className={`${className} ${isAuthenticated ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
    >
      {isLoading ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : isAuthenticated ? (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Google Connected
        </>
      ) : (
        <>
          <Globe className="mr-2 h-4 w-4" />
          Connect Google
        </>
      )}
    </Button>
  )
}
