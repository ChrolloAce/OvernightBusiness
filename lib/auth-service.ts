export class AuthService {
  async getValidAccessToken(): Promise<string> {
    // Get access token from session storage or API
    const session = sessionStorage.getItem('google_session')
    if (session) {
      const sessionData = JSON.parse(session)
      if (sessionData.accessToken && sessionData.expiresAt > Date.now()) {
        return sessionData.accessToken
      }
    }
    
    // If no valid token, throw error to trigger re-authentication
    throw new Error('No valid access token available')
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getValidAccessToken()
      return true
    } catch {
      return false
    }
  }

  async logout(): Promise<void> {
    sessionStorage.removeItem('google_session')
  }
} 