/**
 * Utility to clear mock/demo data from localStorage
 * This ensures a clean slate for real client data
 */
export function clearMockData() {
  try {
    // Clear any existing demo/mock client data
    const keys = Object.keys(localStorage)
    
    keys.forEach(key => {
      // Remove any keys that might contain mock data
      if (key.includes('demo') || 
          key.includes('mock') || 
          key.includes('test') ||
          key.includes('BMW') ||
          key.includes('Samsung') ||
          key.includes('Tinder') ||
          key.includes('FedEx') ||
          key.includes('Tesla') ||
          key.includes('client-1') ||
          key.includes('client-2') ||
          key.includes('client-3') ||
          key.includes('client-4')) {
        localStorage.removeItem(key)
        console.log(`[ClearMockData] Removed: ${key}`)
      }
    })
    
    // Force clear the main client storage if it contains mock data
    const clientData = localStorage.getItem('overnight_biz_clients')
    if (clientData) {
      try {
        const clients = JSON.parse(clientData)
        const hasMockData = clients.some((client: any) => 
          client.name?.includes('BMW') ||
          client.name?.includes('Samsung') ||
          client.name?.includes('Tinder') ||
          client.name?.includes('FedEx') ||
          client.name?.includes('Tesla')
        )
        
        if (hasMockData) {
          localStorage.removeItem('overnight_biz_clients')
          console.log('[ClearMockData] Removed mock clients from main storage')
        }
      } catch (e) {
        // If parsing fails, just clear it
        localStorage.removeItem('overnight_biz_clients')
        console.log('[ClearMockData] Cleared corrupted client data')
      }
    }
    
    console.log('[ClearMockData] Mock data cleared successfully')
    return true
  } catch (error) {
    console.error('[ClearMockData] Error clearing mock data:', error)
    return false
  }
}

/**
 * Clear all client data (use with caution)
 */
export function clearAllClientData() {
  try {
    const keys = Object.keys(localStorage)
    
    keys.forEach(key => {
      if (key.startsWith('clients') || key.includes('client')) {
        localStorage.removeItem(key)
        console.log(`[ClearMockData] Removed client data: ${key}`)
      }
    })
    
    console.log('[ClearMockData] All client data cleared')
    return true
  } catch (error) {
    console.error('[ClearMockData] Error clearing client data:', error)
    return false
  }
}
