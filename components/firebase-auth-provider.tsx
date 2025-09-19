'use client'

import { useEffect, useState } from 'react'
import { auth, ensureFirebaseAuth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

interface FirebaseAuthProviderProps {
  children: React.ReactNode
}

export function FirebaseAuthProvider({ children }: FirebaseAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log('🔐 Firebase user authenticated:', user.uid)
        setIsAuthenticated(true)
        setIsLoading(false)
      } else {
        console.log('🔐 No Firebase user found')
        // DISABLED: Don't automatically sign in anonymously
        // const success = await ensureFirebaseAuth()
        setIsAuthenticated(false)
        setIsLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Initializing Firebase Auth...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Firebase authentication failed</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
