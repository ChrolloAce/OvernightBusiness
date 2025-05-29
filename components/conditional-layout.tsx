'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Show sidebar for dashboard and internal pages, but not for landing page
  const showSidebar = pathname !== '/'
  
  if (showSidebar) {
    return (
      <div className="flex min-h-screen">
        {/* Premium Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 w-72">
          <div className="h-full glass-card border-r border-white/20 dark:border-white/10">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5 dark:from-black/20 dark:to-black/10" />
            <div className="relative h-full">
              <Sidebar />
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 ml-72">
          <main className="min-h-screen">
            {children}
          </main>
        </div>
      </div>
    )
  }
  
  // Landing page layout without sidebar
  return (
    <main className="min-h-screen">
      {children}
    </main>
  )
} 