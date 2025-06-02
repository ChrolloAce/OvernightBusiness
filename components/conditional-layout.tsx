'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import FloatingProfileSelector from '@/components/floating-profile-selector'
import { useProfile } from '@/contexts/profile-context'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { selectedProfile, setSelectedProfile } = useProfile()
  
  // Show sidebar for dashboard and internal pages, but not for landing page
  const showSidebar = pathname !== '/'
  
  if (showSidebar) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-white/20 dark:border-white/10">
          <div className="flex items-center justify-between h-full px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="relative bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/20"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xs font-bold text-white">OB</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                OvernightBiz
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block fixed inset-y-0 left-0 z-50 w-72">
          <div className="h-full glass-card border-r border-white/20 dark:border-white/10">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5 dark:from-black/20 dark:to-black/10" />
            <div className="relative h-full">
              <Sidebar />
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
                onClick={() => setSidebarOpen(false)}
              />
              
              {/* Mobile Sidebar */}
              <motion.div
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="lg:hidden fixed inset-y-0 left-0 z-50 w-80 max-w-[90vw]"
              >
                <div className="h-full glass-card border-r border-white/20 dark:border-white/10 shadow-2xl">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/95 to-white/90 dark:from-black/95 dark:to-black/90" />
                  <div className="relative h-full">
                    <Sidebar onItemClick={() => setSidebarOpen(false)} />
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        {/* Main Content Area */}
        <div className="flex-1 lg:ml-72">
          <main className="min-h-screen pt-16 lg:pt-0">
            {children}
          </main>
        </div>

        {/* Floating Profile Selector */}
        <FloatingProfileSelector 
          selectedProfile={selectedProfile}
          onProfileSelect={setSelectedProfile}
        />
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