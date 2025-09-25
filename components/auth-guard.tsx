'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Loader2, Building2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, isAuthenticated, needsOnboarding } = useAuth()

  // Check for auth bypass
  const authBypass = typeof window !== 'undefined' ? localStorage.getItem('auth_bypass') === 'true' : false

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/', '/bypass-auth']
  const isPublicRoute = publicRoutes.includes(pathname)

  useEffect(() => {
    if (isLoading) return // Wait for auth state to load

    console.log('[AuthGuard] Checking auth state:', {
      pathname,
      isAuthenticated,
      needsOnboarding,
      userEmail: user?.email
    })

    // Allow bypass for development/existing users
    if (authBypass && !isPublicRoute) {
      console.log('[AuthGuard] Auth bypass active - allowing access')
      return
    }

    // Redirect unauthenticated users to login (except on public routes)
    if (!isAuthenticated && !isPublicRoute) {
      console.log('[AuthGuard] Redirecting to login - not authenticated')
      router.push('/login')
      return
    }

    // DISABLED: Don't redirect to onboarding automatically
    // Allow authenticated users to access any page
    // if (isAuthenticated && needsOnboarding && pathname !== '/onboarding' && pathname !== '/dashboard') {
    //   console.log('[AuthGuard] Redirecting to onboarding - user needs company setup')
    //   router.push('/onboarding')
    //   return
    // }

    // Redirect authenticated users away from auth pages
    if (isAuthenticated && !needsOnboarding && (pathname === '/login' || pathname === '/signup' || pathname === '/onboarding')) {
      console.log('[AuthGuard] Redirecting to dashboard - user already authenticated')
      router.push('/dashboard')
      return
    }

    // Redirect to dashboard if on root and authenticated
    if (isAuthenticated && !needsOnboarding && pathname === '/') {
      console.log('[AuthGuard] Redirecting to dashboard from root')
      router.push('/dashboard')
      return
    }

  }, [isLoading, isAuthenticated, needsOnboarding, pathname, router, user])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading OvernightBiz</h2>
          <p className="text-gray-600">Checking your authentication...</p>
        </div>
      </div>
    )
  }

  // DISABLED: Don't show onboarding loading screen
  // Allow users to access pages even without company setup
  // if (isAuthenticated && needsOnboarding && pathname !== '/onboarding') {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
  //           <Building2 className="h-8 w-8 text-white" />
  //         </div>
  //         <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
  //         <h2 className="text-xl font-semibold text-gray-900 mb-2">Setting up your account</h2>
  //         <p className="text-gray-600">Redirecting to company setup...</p>
  //       </div>
  //     </div>
  //   )
  // }

  // Show login loading if not authenticated and not on public route
  if (!isAuthenticated && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Please sign in</h2>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Render children for authenticated users or public routes
  return <>{children}</>
}

// Higher-order component for protecting specific pages
export function withAuth<T extends object>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    return (
      <AuthGuard>
        <Component {...props} />
      </AuthGuard>
    )
  }
}
