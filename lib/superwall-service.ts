// Superwall Subscription Service
import { GoogleAuthService } from './google-auth'

export interface SuperwallSubscription {
  isActive: boolean
  productId?: string
  expiresAt?: string
  status: 'active' | 'expired' | 'cancelled' | 'trial' | 'none'
  userId?: string
}

export class SuperwallService {
  private static instance: SuperwallService
  private subscription: SuperwallSubscription | null = null
  private isInitialized = false

  private constructor() {}

  static getInstance(): SuperwallService {
    if (!SuperwallService.instance) {
      SuperwallService.instance = new SuperwallService()
    }
    return SuperwallService.instance
  }

  // Initialize Superwall SDK
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      console.log('[Superwall] Initializing Superwall SDK...')
      
      // Initialize Superwall SDK here
      // This would typically be: Superwall.configure(apiKey)
      // For now, we'll simulate the initialization
      
      await this.checkSubscriptionStatus()
      this.isInitialized = true
      
      console.log('[Superwall] Superwall initialized successfully')
    } catch (error) {
      console.error('[Superwall] Failed to initialize Superwall:', error)
      throw error
    }
  }

  // Check current subscription status
  async checkSubscriptionStatus(): Promise<SuperwallSubscription> {
    try {
      console.log('[Superwall] Checking subscription status...')
      
      // Get user info from Google auth for user identification
      const googleAuth = GoogleAuthService.getInstance()
      const userInfo = googleAuth.getUserInfo()
      
      if (!userInfo?.email) {
        this.subscription = {
          isActive: false,
          status: 'none'
        }
        return this.subscription
      }

      // For now, we'll simulate checking subscription status
      // In a real implementation, this would call Superwall APIs
      const subscriptionData = await this.fetchSubscriptionFromStorage(userInfo.email)
      
      this.subscription = subscriptionData
      console.log('[Superwall] Subscription status:', this.subscription)
      
      return this.subscription
    } catch (error) {
      console.error('[Superwall] Error checking subscription status:', error)
      this.subscription = {
        isActive: false,
        status: 'none'
      }
      return this.subscription
    }
  }

  // Get current subscription info
  getSubscription(): SuperwallSubscription | null {
    return this.subscription
  }

  // Check if user has active subscription
  hasActiveSubscription(): boolean {
    return this.subscription?.isActive === true && this.subscription?.status === 'active'
  }

  // Present paywall
  async presentPaywall(paywallId?: string): Promise<{ result: 'purchased' | 'cancelled' | 'error', error?: string }> {
    try {
      console.log('[Superwall] Presenting paywall:', paywallId || 'default')
      
      // This would typically call Superwall's present() method
      // For now, we'll simulate the paywall presentation
      
      return new Promise((resolve) => {
        // Simulate paywall interaction
        setTimeout(() => {
          // For demo purposes, randomly simulate purchase or cancellation
          const purchased = Math.random() > 0.5
          
          if (purchased) {
            // Update subscription status
            this.subscription = {
              isActive: true,
              status: 'active',
              productId: 'premium_monthly',
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
            }
            this.saveSubscriptionToStorage()
            resolve({ result: 'purchased' })
          } else {
            resolve({ result: 'cancelled' })
          }
        }, 2000) // Simulate 2 second paywall interaction
      })
    } catch (error) {
      console.error('[Superwall] Error presenting paywall:', error)
      return { result: 'error', error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Restore purchases
  async restorePurchases(): Promise<{ success: boolean, error?: string }> {
    try {
      console.log('[Superwall] Restoring purchases...')
      
      // This would typically call Superwall's restorePurchases() method
      await this.checkSubscriptionStatus()
      
      return { success: true }
    } catch (error) {
      console.error('[Superwall] Error restoring purchases:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  // Private method to fetch subscription from local storage (simulating server check)
  private async fetchSubscriptionFromStorage(email: string): Promise<SuperwallSubscription> {
    try {
      const key = `superwall_subscription_${email}`
      const stored = localStorage.getItem(key)
      
      if (stored) {
        const subscription = JSON.parse(stored) as SuperwallSubscription
        
        // Check if subscription is still valid
        if (subscription.expiresAt && new Date(subscription.expiresAt) > new Date()) {
          return {
            ...subscription,
            isActive: true,
            status: 'active'
          }
        } else if (subscription.expiresAt) {
          return {
            ...subscription,
            isActive: false,
            status: 'expired'
          }
        }
        
        return subscription
      }
      
      // No subscription found
      return {
        isActive: false,
        status: 'none',
        userId: email
      }
    } catch (error) {
      console.error('[Superwall] Error fetching subscription from storage:', error)
      return {
        isActive: false,
        status: 'none'
      }
    }
  }

  // Private method to save subscription to local storage
  private saveSubscriptionToStorage(): void {
    try {
      const googleAuth = GoogleAuthService.getInstance()
      const userInfo = googleAuth.getUserInfo()
      
      if (userInfo?.email && this.subscription) {
        const key = `superwall_subscription_${userInfo.email}`
        localStorage.setItem(key, JSON.stringify(this.subscription))
      }
    } catch (error) {
      console.error('[Superwall] Error saving subscription to storage:', error)
    }
  }

  // Clear subscription data (for logout)
  clearSubscription(): void {
    this.subscription = null
    
    try {
      const googleAuth = GoogleAuthService.getInstance()
      const userInfo = googleAuth.getUserInfo()
      
      if (userInfo?.email) {
        const key = `superwall_subscription_${userInfo.email}`
        localStorage.removeItem(key)
      }
    } catch (error) {
      console.error('[Superwall] Error clearing subscription:', error)
    }
  }

  // Check if user should be auto-logged in
  async shouldAutoLogin(): Promise<boolean> {
    try {
      // Check if Google auth is valid
      const googleAuth = GoogleAuthService.getInstance()
      if (!googleAuth.isAuthenticated()) {
        return false
      }

      // Initialize if not already done
      if (!this.isInitialized) {
        await this.initialize()
      }

      // Check if subscription is active
      const subscription = await this.checkSubscriptionStatus()
      return subscription.isActive && subscription.status === 'active'
    } catch (error) {
      console.error('[Superwall] Error checking auto-login eligibility:', error)
      return false
    }
  }
} 