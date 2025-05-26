// Google OAuth configuration for Business Profile API
export const GOOGLE_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback',
  scopes: [
    'https://www.googleapis.com/auth/business.manage',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ]
}

export interface GoogleTokens {
  access_token: string
  refresh_token?: string
  expires_in: number
  expires_at: number // Absolute timestamp when token expires
  token_type: string
  scope: string
}

export interface AuthSession {
  tokens: GoogleTokens
  user_info?: {
    email: string
    name: string
    picture?: string
  }
  created_at: number
  last_refreshed: number
}

export class GoogleAuthService {
  private static instance: GoogleAuthService
  private session: AuthSession | null = null
  private refreshPromise: Promise<GoogleTokens> | null = null

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService()
    }
    return GoogleAuthService.instance
  }

  // Generate a secure random state parameter for CSRF protection
  private generateState(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  // Generate OAuth URL for user authorization with state parameter
  getAuthUrl(): string {
    // Always clear existing session when starting new auth flow
    this.logout()
    
    const state = this.generateState()
    
    // Store state in sessionStorage for verification
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('oauth_state', state)
    }

    const params = new URLSearchParams({
      client_id: GOOGLE_CONFIG.clientId,
      redirect_uri: GOOGLE_CONFIG.redirectUri,
      scope: GOOGLE_CONFIG.scopes.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent', // Always prompt for consent to ensure fresh refresh token
      state: state,
      include_granted_scopes: 'true'
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  // Verify state parameter to prevent CSRF attacks
  private verifyState(receivedState: string): boolean {
    if (typeof window === 'undefined') return false
    
    const storedState = sessionStorage.getItem('oauth_state')
    sessionStorage.removeItem('oauth_state') // Remove after use
    
    return storedState === receivedState
  }

  // Exchange authorization code for tokens using server-side API
  async exchangeCodeForTokens(code: string, state?: string): Promise<GoogleTokens> {
    try {
      // Verify state parameter if provided
      if (state && !this.verifyState(state)) {
        throw new Error('Invalid state parameter. Possible CSRF attack.')
      }

      // Clear any existing session before new authentication
      this.logout()

      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to exchange code for tokens')
      }

      const data = await response.json()
      const tokens = data.tokens

      // Calculate absolute expiry time
      const expiresAt = Date.now() + (tokens.expires_in * 1000)
      const processedTokens: GoogleTokens = {
        ...tokens,
        expires_at: expiresAt
      }

      // Create new session
      this.session = {
        tokens: processedTokens,
        created_at: Date.now(),
        last_refreshed: Date.now()
      }

      this.saveSession(this.session)
      
      // Fetch user info for session
      try {
        const userInfo = await this.fetchUserInfo(processedTokens.access_token)
        this.session.user_info = userInfo
        this.saveSession(this.session)
      } catch (error) {
        console.warn('Failed to fetch user info:', error)
      }

      return processedTokens
    } catch (error) {
      console.error('Token exchange error:', error)
      this.logout() // Clear any partial state
      throw new Error(`Failed to exchange code for tokens: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Fetch user information from Google
  private async fetchUserInfo(accessToken: string): Promise<{ email: string; name: string; picture?: string }> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user info')
    }

    return await response.json()
  }

  // Refresh access token using refresh token
  async refreshAccessToken(): Promise<GoogleTokens> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    if (!this.session?.tokens?.refresh_token) {
      this.logout()
      throw new Error('No refresh token available. Please re-authenticate.')
    }

    this.refreshPromise = this.performTokenRefresh()
    
    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh(): Promise<GoogleTokens> {
    if (!this.session?.tokens?.refresh_token) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch('/api/auth/google/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token: this.session.tokens.refresh_token
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Refresh token failed:', errorData)
        
        // If refresh fails, clear session and require re-authentication
        this.logout()
        throw new Error('Failed to refresh access token. Please reconnect your Google account.')
      }

      const newTokens = await response.json()
      
      // Calculate new expiry time
      const expiresAt = Date.now() + (newTokens.expires_in * 1000)
      
      // Update session with new tokens
      const updatedTokens: GoogleTokens = {
        ...this.session.tokens,
        ...newTokens,
        expires_at: expiresAt
      }

      this.session = {
        ...this.session,
        tokens: updatedTokens,
        last_refreshed: Date.now()
      }
      
      this.saveSession(this.session)
      return updatedTokens
    } catch (error) {
      this.logout()
      throw error
    }
  }

  // Get valid access token (refresh if needed)
  async getValidAccessToken(): Promise<string> {
    if (!this.session) {
      this.loadSession()
    }

    if (!this.session?.tokens) {
      throw new Error('No tokens available. Please authenticate first.')
    }

    // Check if token is expired (with 5 minute buffer)
    const now = Date.now()
    const buffer = 5 * 60 * 1000 // 5 minutes
    const isExpired = now >= (this.session.tokens.expires_at - buffer)

    if (isExpired && this.session.tokens.refresh_token) {
      console.log('Access token expired, refreshing...')
      await this.refreshAccessToken()
    } else if (isExpired && !this.session.tokens.refresh_token) {
      console.log('Access token expired and no refresh token available')
      this.logout()
      throw new Error('Access token expired and no refresh token available. Please re-authenticate.')
    }

    if (!this.session?.tokens?.access_token) {
      throw new Error('Failed to get valid access token')
    }

    return this.session.tokens.access_token
  }

  // Save session to localStorage (client-side only)
  private saveSession(session: AuthSession): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem('google_auth_session', JSON.stringify(session))
      } catch (error) {
        console.warn('Failed to save session to localStorage:', error)
      }
    }
  }

  // Load session from localStorage (client-side only)
  private loadSession(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem('google_auth_session')
        if (stored) {
          const session = JSON.parse(stored)
          
          // Validate session structure and expiry
          if (this.isValidSession(session)) {
            this.session = session
          } else {
            console.log('Invalid or expired session found, clearing...')
            this.logout()
          }
        }
      } catch (error) {
        console.warn('Failed to load session from localStorage:', error)
        this.logout()
      }
    }
  }

  // Validate session structure and check if it's not too old
  private isValidSession(session: any): session is AuthSession {
    if (!session || typeof session !== 'object') return false
    if (!session.tokens || !session.created_at) return false
    if (!session.tokens.access_token) return false
    
    // Check if session is not older than 7 days (even with refresh token)
    const maxAge = 7 * 24 * 60 * 60 * 1000 // 7 days
    const age = Date.now() - session.created_at
    
    return age < maxAge
  }

  // Check if user is authenticated (client-side only)
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') {
      return false // Always return false during SSR
    }
    
    this.loadSession()
    return !!this.session?.tokens?.access_token
  }

  // Get current user info
  getUserInfo(): { email: string; name: string; picture?: string } | null {
    if (typeof window === 'undefined') return null
    
    this.loadSession()
    return this.session?.user_info || null
  }

  // Get session info for debugging
  getSessionInfo(): { created_at: number; last_refreshed: number; expires_at: number } | null {
    if (!this.session) return null
    
    return {
      created_at: this.session.created_at,
      last_refreshed: this.session.last_refreshed,
      expires_at: this.session.tokens.expires_at
    }
  }

  // Clear session (logout)
  logout(): void {
    this.session = null
    this.refreshPromise = null
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('google_auth_session')
        sessionStorage.removeItem('oauth_state')
      } catch (error) {
        console.warn('Failed to clear session storage:', error)
      }
    }
  }

  // Force a fresh authentication (revoke and re-authenticate)
  async forceReauth(): Promise<void> {
    // Revoke current tokens if available
    if (this.session?.tokens?.access_token) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${this.session.tokens.access_token}`, {
          method: 'POST'
        })
      } catch (error) {
        console.warn('Failed to revoke token:', error)
      }
    }
    
    this.logout()
  }
} 