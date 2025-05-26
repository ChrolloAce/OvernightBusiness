'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GoogleAuthService } from '@/lib/google-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        setMessage(`Authentication failed: ${error}`)
        return
      }

      if (!code) {
        setStatus('error')
        setMessage('No authorization code received')
        return
      }

      try {
        const authService = GoogleAuthService.getInstance()
        await authService.exchangeCodeForTokens(code)
        
        setStatus('success')
        setMessage('Successfully connected to Google Business Profile!')
        
        // Redirect to profiles page after 2 seconds
        setTimeout(() => {
          router.push('/?tab=profiles')
        }, 2000)
      } catch (error) {
        setStatus('error')
        setMessage(`Failed to authenticate: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            {status === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
            <span>
              {status === 'loading' && 'Connecting...'}
              {status === 'success' && 'Connected!'}
              {status === 'error' && 'Connection Failed'}
            </span>
          </CardTitle>
          <CardDescription>
            {status === 'loading' && 'Please wait while we connect your Google account...'}
            {status === 'success' && 'Redirecting you to the dashboard...'}
            {status === 'error' && 'There was an issue connecting your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground mb-4">{message}</p>
          {status === 'error' && (
            <Button onClick={() => router.push('/')} className="w-full">
              Return to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 