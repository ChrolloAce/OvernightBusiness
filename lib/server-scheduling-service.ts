// Server-side scheduling service that syncs with client and runs independently

export class ServerSchedulingService {
  private static readonly API_ENDPOINT = '/api/scheduler/check-and-send'
  
  // Sync local storage posts to server
  static async syncPostsToServer(posts: any[]) {
    try {
      console.log('[ServerScheduling] Syncing posts to server...')
      
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scheduledPosts: posts })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('[ServerScheduling] Posts synced successfully:', result.message)
        return true
      } else {
        console.error('[ServerScheduling] Failed to sync posts:', response.status)
        return false
      }
    } catch (error) {
      console.error('[ServerScheduling] Error syncing posts:', error)
      return false
    }
  }
  
  // Trigger server-side check for due posts
  static async triggerServerCheck() {
    try {
      console.log('[ServerScheduling] Triggering server check...')
      
      const response = await fetch(this.API_ENDPOINT, {
        method: 'GET',
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('[ServerScheduling] Server check completed:', result.message)
        return result
      } else {
        console.error('[ServerScheduling] Server check failed:', response.status)
        return null
      }
    } catch (error) {
      console.error('[ServerScheduling] Error triggering server check:', error)
      return null
    }
  }
  
  // Set up periodic server sync (call this when posts are modified)
  static setupPeriodicSync(getPostsFunction: () => any[]) {
    // Sync posts to server every 5 minutes
    setInterval(async () => {
      if (typeof window !== 'undefined') {
        const posts = getPostsFunction()
        if (posts.length > 0) {
          await this.syncPostsToServer(posts)
        }
      }
    }, 5 * 60 * 1000) // 5 minutes
    
    // Initial sync
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        const posts = getPostsFunction()
        if (posts.length > 0) {
          this.syncPostsToServer(posts)
        }
      }, 2000) // Wait 2 seconds for posts to load
    }
  }
} 