'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GoogleAuthService } from '@/lib/google-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'warning'>('loading')
  const [message, setMessage] = useState('')
  const [details, setDetails] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      // Handle OAuth errors from Google
      if (error) {
        setStatus('error')
        setMessage(`Authentication failed: ${error}`)
        setDetails(errorDescription || 'No additional details provided')
        return
      }

      // Check for authorization code
      if (!code) {
        setStatus('error')
        setMessage('No authorization code received from Google')
        setDetails('This usually indicates an issue with the OAuth flow or user cancellation')
        return
      }

      // Check for state parameter (CSRF protection)
      if (!state) {
        setStatus('warning')
        setMessage('Missing state parameter - proceeding with caution')
        setDetails('This may indicate a security issue, but attempting to continue')
      }

      try {
        console.log('Processing OAuth callback with code and state')
        const authService = GoogleAuthService.getInstance()
        
        // Exchange code for tokens (with state verification if present)
        await authService.exchangeCodeForTokens(code, state || undefined)
        
        setStatus('success')
        setMessage('Successfully connected to Google Business Profile!')
        setDetails('You will be redirected to your dashboard shortly')
        
        // Redirect to profiles page after 2 seconds
        setTimeout(() => {
          router.push('/?tab=profiles')
        }, 2000)
      } catch (error) {
        console.error('OAuth callback error:', error)
        setStatus('error')
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setMessage('Failed to complete authentication')
        setDetails(errorMessage)
        
        // If it's a state verification error, provide specific guidance
        if (errorMessage.includes('state parameter')) {
          setDetails('Security verification failed. Please try connecting again from the dashboard.')
        }
      }
    }

    handleCallback()
  }, [searchParams, router])

  const handleRetry = () => {
    router.push('/?tab=profiles')
  }

  const handleForceReauth = async () => {
    try {
      const authService = GoogleAuthService.getInstance()
      await authService.forceReauth()
      router.push('/?tab=profiles')
    } catch (error) {
      console.error('Force reauth error:', error)
      router.push('/?tab=profiles')
    }
  }

  const getIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-16 w-16 text-yellow-500" />
      default:
        return <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className={`w-full max-w-md ${getStatusColor()}`}>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <CardTitle className="text-xl">
            {status === 'loading' && 'Connecting to Google...'}
            {status === 'success' && 'Connection Successful!'}
            {status === 'error' && 'Connection Failed'}
            {status === 'warning' && 'Connection Warning'}
          </CardTitle>
          <CardDescription className="text-sm">
            {message}
          </CardDescription>
        </CardHeader>
        
        {details && (
          <CardContent>
            <div className="text-sm text-gray-600 bg-white p-3 rounded border">
              <strong>Details:</strong> {details}
            </div>
            
            {status === 'error' && (
              <div className="mt-4 space-y-2">
                <Button 
                  onClick={handleRetry} 
                  variant="outline" 
                  className="w-full"
                >
                  Return to Dashboard
                </Button>
                <Button 
                  onClick={handleForceReauth} 
                  variant="destructive" 
                  className="w-full"
                >
                  Clear Session & Try Again
                </Button>
              </div>
            )}
            
            {status === 'warning' && (
              <div className="mt-4">
                <Button 
                  onClick={handleRetry} 
                  variant="outline" 
                  className="w-full"
                >
                  Continue to Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        )}
        
        {status === 'loading' && (
          <CardContent>
            <div className="text-center text-sm text-gray-500">
              Please wait while we securely connect your Google account...
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
} 