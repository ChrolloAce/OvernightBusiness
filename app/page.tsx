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
import ProfilesPage from './profiles/page'
import ContentHubPage from './content/page'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
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

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'profiles', label: 'Business Profiles', icon: Building2 },
    { id: 'content', label: 'Content Hub', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'calendar', label: 'Scheduler', icon: Calendar },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 border-r bg-card/50 backdrop-blur-sm"
      >
        <div className="p-6">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">Overnight Biz</h1>
          </div>
        </div>
        
        <nav className="px-4 space-y-2">
          {sidebarItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        >
          <div className="flex h-16 items-center px-6">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 h-9 w-[300px] rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </Button>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">JD</span>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Page Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                  <p className="text-muted-foreground">
                    Welcome back! Here's what's happening with your business.
                  </p>
                </div>
                <Button onClick={() => setActiveTab('profiles')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Profile
                </Button>
              </div>

              {/* Stats Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          {stat.title}
                        </CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          {stat.trend === 'up' ? (
                            <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                          ) : (
                            <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                          )}
                          <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
                            {stat.change}
                          </span>
                          <span className="ml-1">{stat.description}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Charts and Activity */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[300px] bg-muted/20 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Chart will be implemented here</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Latest updates from your business profiles
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.status === 'success' ? 'bg-green-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {activity.action}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {activity.profile} • {activity.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Common tasks to manage your business profiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button variant="outline" className="h-20 flex-col">
                      <FileText className="h-6 w-6 mb-2" />
                      Generate Blog Post
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <Calendar className="h-6 w-6 mb-2" />
                      Update Business Hours
                    </Button>
                    <Button variant="outline" className="h-20 flex-col">
                      <MessageSquare className="h-6 w-6 mb-2" />
                      Respond to Reviews
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Business Profiles Page */}
          {activeTab === 'profiles' && <ProfilesPage />}

          {/* Content Hub Page */}
          {activeTab === 'content' && <ContentHubPage />}

          {/* Other tab content */}
          {activeTab !== 'dashboard' && activeTab !== 'profiles' && activeTab !== 'content' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center h-[400px]"
            >
              <Card className="w-full max-w-md text-center">
                <CardHeader>
                  <CardTitle className="capitalize">{activeTab}</CardTitle>
                  <CardDescription>
                    This section is under development
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Coming soon! This feature will be available in the next update.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
} 