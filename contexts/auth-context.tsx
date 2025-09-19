'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { firebaseAuthService, AuthUser } from '@/lib/firebase/auth-service'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  needsOnboarding: boolean
  signInWithEmail: (email: string, password: string) => Promise<AuthUser>
  signUpWithEmail: (email: string, password: string, name: string) => Promise<AuthUser>
  signInWithGoogle: () => Promise<AuthUser>
  signOut: () => Promise<void>
  completeOnboarding: (companyData: any) => Promise<{ user: AuthUser; company: any }>
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = firebaseAuthService.onAuthStateChange((authUser) => {
      console.log('[AuthProvider] Auth state changed:', authUser?.email || 'signed out')
      setUser(authUser)
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithEmail = async (email: string, password: string): Promise<AuthUser> => {
    try {
      const authUser = await firebaseAuthService.signInWithEmail(email, password)
      return authUser
    } catch (error) {
      console.error('[AuthProvider] Error signing in:', error)
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string, name: string): Promise<AuthUser> => {
    try {
      const authUser = await firebaseAuthService.signUpWithEmail(email, password, name)
      return authUser
    } catch (error) {
      console.error('[AuthProvider] Error signing up:', error)
      throw error
    }
  }

  const signInWithGoogle = async (): Promise<AuthUser> => {
    try {
      const authUser = await firebaseAuthService.signInWithGoogle()
      return authUser
    } catch (error) {
      console.error('[AuthProvider] Error signing in with Google:', error)
      throw error
    }
  }

  const signOut = async (): Promise<void> => {
    try {
      await firebaseAuthService.signOut()
    } catch (error) {
      console.error('[AuthProvider] Error signing out:', error)
      throw error
    }
  }

  const completeOnboarding = async (companyData: any): Promise<{ user: AuthUser; company: any }> => {
    try {
      const result = await firebaseAuthService.completeOnboarding(companyData)
      setUser(result.user) // Update context with new user data
      return result
    } catch (error) {
      console.error('[AuthProvider] Error completing onboarding:', error)
      throw error
    }
  }

  const hasPermission = (permission: string): boolean => {
    return firebaseAuthService.hasPermission(permission)
  }

  const isAuthenticated = user !== null
  const needsOnboarding = user !== null && !user.companyId

  return (
    <AuthContext.Provider 
      value={{
        user,
        isLoading,
        isAuthenticated,
        needsOnboarding,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        completeOnboarding,
        hasPermission
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
