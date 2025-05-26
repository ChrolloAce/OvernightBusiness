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
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
}

export class GoogleAuthService {
  private static instance: GoogleAuthService
  private tokens: GoogleTokens | null = null

  static getInstance(): GoogleAuthService {
    if (!GoogleAuthService.instance) {
      GoogleAuthService.instance = new GoogleAuthService()
    }
    return GoogleAuthService.instance
  }

  // Generate OAuth URL for user authorization
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: GOOGLE_CONFIG.clientId,
      redirect_uri: GOOGLE_CONFIG.redirectUri,
      scope: GOOGLE_CONFIG.scopes.join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CONFIG.clientId,
        client_secret: GOOGLE_CONFIG.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: GOOGLE_CONFIG.redirectUri,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens')
    }

    const tokens = await response.json()
    this.tokens = tokens
    this.saveTokens(tokens)
    return tokens
  }

  // Refresh access token using refresh token
  async refreshAccessToken(): Promise<GoogleTokens> {
    if (!this.tokens?.refresh_token) {
      throw new Error('No refresh token available')
    }

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CONFIG.clientId,
        client_secret: GOOGLE_CONFIG.clientSecret,
        refresh_token: this.tokens.refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to refresh access token')
    }

    const newTokens = await response.json()
    this.tokens = { ...this.tokens, ...newTokens }
    
    // Type assertion since we know tokens is not null at this point
    if (this.tokens) {
      this.saveTokens(this.tokens)
      return this.tokens
    }
    
    throw new Error('Failed to update tokens')
  }

  // Get valid access token (refresh if needed)
  async getValidAccessToken(): Promise<string> {
    if (!this.tokens) {
      this.loadTokens()
    }

    if (!this.tokens) {
      throw new Error('No tokens available. Please authenticate first.')
    }

    // Check if token is expired (with 5 minute buffer)
    const expiryTime = this.tokens.expires_in * 1000
    const now = Date.now()
    const buffer = 5 * 60 * 1000 // 5 minutes

    if (now >= expiryTime - buffer) {
      await this.refreshAccessToken()
    }

    // Type assertion since we know tokens is not null at this point
    if (!this.tokens) {
      throw new Error('Failed to get valid access token')
    }

    return this.tokens.access_token
  }

  // Save tokens to localStorage
  private saveTokens(tokens: GoogleTokens): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('google_tokens', JSON.stringify({
        ...tokens,
        expires_at: Date.now() + (tokens.expires_in * 1000)
      }))
    }
  }

  // Load tokens from localStorage
  private loadTokens(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('google_tokens')
      if (stored) {
        this.tokens = JSON.parse(stored)
      }
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    this.loadTokens()
    return !!this.tokens?.access_token
  }

  // Clear tokens (logout)
  logout(): void {
    this.tokens = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('google_tokens')
    }
  }
} 