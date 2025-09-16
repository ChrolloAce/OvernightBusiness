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
          key.includes('FedEx')) {
        localStorage.removeItem(key)
        console.log(`[ClearMockData] Removed: ${key}`)
      }
    })
    
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
