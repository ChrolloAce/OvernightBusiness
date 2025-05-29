'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Building2, 
  PenTool, 
  BarChart3, 
  Calendar, 
  Star,
  Settings,
  Moon,
  Sun,
  Sparkles,
  Zap,
  ChevronRight
} from 'lucide-react'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    gradient: 'from-blue-500 to-cyan-500',
    description: 'Overview & Analytics'
  },
  {
    name: 'Business Profiles',
    href: '/profiles',
    icon: Building2,
    gradient: 'from-purple-500 to-pink-500',
    description: 'Manage Locations'
  },
  {
    name: 'Content Hub',
    href: '/content',
    icon: PenTool,
    gradient: 'from-green-500 to-emerald-500',
    description: 'AI Content Creation'
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    gradient: 'from-orange-500 to-red-500',
    description: 'Performance Insights'
  },
  {
    name: 'Scheduler',
    href: '/scheduler',
    icon: Calendar,
    gradient: 'from-indigo-500 to-purple-500',
    description: 'Post Scheduling'
  },
  {
    name: 'Reviews',
    href: '/reviews',
    icon: Star,
    gradient: 'from-yellow-500 to-orange-500',
    description: 'Review Management'
  }
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <div className="h-full flex flex-col">
      {/* Premium Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Overnight Biz
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Premium Business Suite
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 p-6">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Navigation</h3>
          {navigation.map((item, index) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onHoverStart={() => setHoveredItem(item.name)}
                onHoverEnd={() => setHoveredItem(null)}
              >
                <Link href={item.href}>
                  <div className={`
                    group relative flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 cursor-pointer
                    ${isActive 
                      ? 'bg-white/80 dark:bg-black/40 shadow-lg border border-white/30 dark:border-white/20' 
                      : 'hover:bg-white/50 dark:hover:bg-black/20 border border-transparent hover:border-white/20 dark:hover:border-white/10'
                    }
                  `}>
                    {/* Active Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    
                    {/* Icon with Gradient Background */}
                    <div className={`
                      relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                      ${isActive 
                        ? `bg-gradient-to-br ${item.gradient} shadow-lg` 
                        : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gray-200 dark:group-hover:bg-gray-700'
                      }
                    `}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
                      
                      {/* Glow Effect */}
                      {isActive && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-xl blur-lg opacity-30 -z-10`} />
                      )}
                    </div>
                    
                    {/* Text Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`
                        text-sm font-semibold transition-colors duration-300
                        ${isActive 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                        }
                      `}>
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.description}
                      </p>
                    </div>
                    
                    {/* Arrow Indicator */}
                    <ChevronRight className={`
                      w-4 h-4 transition-all duration-300
                      ${isActive 
                        ? 'text-gray-600 dark:text-gray-400 opacity-100' 
                        : 'text-gray-400 dark:text-gray-600 opacity-0 group-hover:opacity-100'
                      }
                    `} />
                    
                    {/* Hover Effect */}
                    <AnimatePresence>
                      {hoveredItem === item.name && !isActive && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 dark:from-white/10 dark:to-white/5 rounded-2xl"
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Premium Footer */}
      <div className="p-6 border-t border-white/10">
        <div className="space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme('light')}
                className={`w-8 h-8 rounded-lg ${theme === 'light' ? 'bg-white shadow-sm' : ''}`}
              >
                <Sun className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTheme('dark')}
                className={`w-8 h-8 rounded-lg ${theme === 'dark' ? 'bg-gray-700 shadow-sm' : ''}`}
              >
                <Moon className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Settings Link */}
          <Link href="/settings">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-white/50 dark:hover:bg-black/20 transition-all duration-300 group">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors duration-300">
                <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-300">
                  Settings
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Preferences & Config
                </p>
              </div>
            </div>
          </Link>

          {/* Premium Badge */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-white" />
              <span className="text-white font-bold text-sm">Premium Plan</span>
            </div>
            <p className="text-white/80 text-xs mb-3">
              Unlimited access to all features
            </p>
            <Button size="sm" className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
              Manage Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 