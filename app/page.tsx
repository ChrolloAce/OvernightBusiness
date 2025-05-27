'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  BarChart3, 
  FileText, 
  Settings, 
  Moon,
  Sun,
  Search,
  Bell,
  Plus,
  TrendingUp,
  Calendar,
  MessageSquare,
  Star,
  Eye,
  DollarSign,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'

export default function Dashboard() {
  const { theme, setTheme } = useTheme()

  const stats = [
    { 
      title: 'Total Revenue', 
      value: '$45,231.89', 
      change: '+20.1%', 
      trend: 'up',
      icon: DollarSign,
      description: 'from last month'
    },
    { 
      title: 'Business Profiles', 
      value: '12', 
      change: '+2.5%', 
      trend: 'up',
      icon: Building2,
      description: 'active locations'
    },
    { 
      title: 'Monthly Views', 
      value: '45.2K', 
      change: '+12.3%', 
      trend: 'up',
      icon: Eye,
      description: 'profile views'
    },
    { 
      title: 'Avg Rating', 
      value: '4.8', 
      change: '+0.2', 
      trend: 'up',
      icon: Star,
      description: 'customer rating'
    },
  ]

  const recentActivity = [
    { action: 'New blog post published', profile: 'Downtown Cafe', time: '2 hours ago', status: 'success' },
    { action: 'Profile updated', profile: 'Tech Solutions Inc', time: '4 hours ago', status: 'info' },
    { action: 'Review responded', profile: 'Fitness Center Pro', time: '6 hours ago', status: 'success' },
    { action: 'Hours updated', profile: 'Local Bakery', time: '1 day ago', status: 'info' },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-40 border-b bg-white/80 dark:bg-black/80 backdrop-blur-xl border-white/20 dark:border-white/10"
      >
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search businesses, posts, reviews..."
                className="pl-10 h-10 w-[400px] rounded-xl border border-white/30 dark:border-white/20 bg-white/50 dark:bg-black/20 backdrop-blur-sm px-4 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="relative bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300">
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg border-2 border-white/30 dark:border-white/20">
              <span className="text-sm font-bold text-white">JD</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Page Content */}
      <main className="p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Page Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-2xl" />
            <div className="relative bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                        Dashboard
                      </h1>
                      <p className="text-base text-gray-600 dark:text-gray-300 font-medium">
                        Welcome back! Here's what's happening with your business empire.
                      </p>
                    </div>
                  </div>
                </div>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Plus className="mr-2 h-4 w-4 relative z-10" />
                  <span className="relative z-10">Quick Action</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative h-full">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500" />
                  <Card className="relative h-full bg-white/60 dark:bg-black/30 backdrop-blur-xl border border-white/30 dark:border-white/20 shadow-lg hover:shadow-xl transition-all duration-500 group-hover:scale-[1.02] group-hover:border-white/50 dark:group-hover:border-white/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {stat.title}
                      </CardTitle>
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-lg flex items-center justify-center group-hover:from-blue-100 group-hover:to-purple-100 dark:group-hover:from-blue-900/30 dark:group-hover:to-purple-900/30 transition-all duration-300">
                        <stat.icon className="h-4 w-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                      <div className="flex items-center text-xs">
                        {stat.trend === 'up' ? (
                          <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                        ) : (
                          <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                        )}
                        <span className={`font-semibold ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                          {stat.change}
                        </span>
                        <span className="ml-1 text-gray-600 dark:text-gray-400">{stat.description}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts and Activity */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <div className="col-span-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl" />
                <Card className="relative bg-white/60 dark:bg-black/30 backdrop-blur-xl border border-white/30 dark:border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Performance Overview</CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                      Your business metrics at a glance
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[250px] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl flex items-center justify-center border border-white/30 dark:border-white/10">
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto shadow-lg">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 font-medium text-sm">Advanced Analytics Coming Soon</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Interactive charts and detailed insights</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="col-span-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl blur-xl" />
                <Card className="relative bg-white/60 dark:bg-black/30 backdrop-blur-xl border border-white/30 dark:border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</CardTitle>
                    <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                      Latest updates from your business profiles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3 p-2 bg-white/50 dark:bg-black/20 rounded-lg border border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                          } shadow-sm`}>
                            <div className={`absolute w-2 h-2 rounded-full animate-ping ${
                              activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                            } opacity-30`} />
                          </div>
                          <div className="flex-1 space-y-0">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white">
                              {activity.action}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {activity.profile} • {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 rounded-2xl blur-xl" />
            <Card className="relative bg-white/60 dark:bg-black/30 backdrop-blur-xl border border-white/30 dark:border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Quick Actions</CardTitle>
                <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
                  Common tasks to manage your business profiles efficiently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  <Button variant="outline" className="h-20 flex-col bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300 hover:scale-105 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-2 group-hover:shadow-lg transition-all duration-300">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-sm">Generate Blog Post</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300 hover:scale-105 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center mb-2 group-hover:shadow-lg transition-all duration-300">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-sm">Update Business Hours</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300 hover:scale-105 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-2 group-hover:shadow-lg transition-all duration-300">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-semibold text-sm">Respond to Reviews</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  )
} 