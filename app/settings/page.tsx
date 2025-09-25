'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Key,
  Save,
  RefreshCw,
  Moon,
  Sun,
  Monitor,
  LogOut,
  Building2,
  Mail,
  Phone,
  Calendar,
  MapPin
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/contexts/auth-context'
import { useCompany } from '@/contexts/company-context'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false)
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    marketing: true
  })
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, signOut } = useAuth()
  const { currentCompany } = useCompany()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      setIsLoggingOut(false)
    }
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen">
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
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                        Settings
                      </h1>
                      <p className="text-base text-gray-600 dark:text-gray-300 font-medium">
                        Manage your account preferences and application settings
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <LogOut className="w-4 h-4 mr-2 relative z-10" />
                    <span className="relative z-10">{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Save className="w-4 h-4 mr-2 relative z-10" />
                    <span className="relative z-10">Save Changes</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* User Profile */}
            <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <div className="flex items-center space-x-2 p-3 bg-white/30 dark:bg-black/20 rounded-lg">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{user?.name || 'Not provided'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="flex items-center space-x-2 p-3 bg-white/30 dark:bg-black/20 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{user?.email || 'Not provided'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>User Role</Label>
                  <div className="flex items-center space-x-2 p-3 bg-white/30 dark:bg-black/20 rounded-lg">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium capitalize">{user?.role || 'User'}</span>
                    <Badge variant="outline" className="ml-auto">
                      {user?.role === 'owner' ? 'Owner' : user?.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Account Created</Label>
                  <div className="flex items-center space-x-2 p-3 bg-white/30 dark:bg-black/20 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">
                      {user?.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <div className="flex items-center space-x-2 p-3 bg-white/30 dark:bg-black/20 rounded-lg">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{currentCompany?.name || 'Not provided'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Company Email</Label>
                  <div className="flex items-center space-x-2 p-3 bg-white/30 dark:bg-black/20 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{currentCompany?.email || 'Not provided'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <div className="flex items-center space-x-2 p-3 bg-white/30 dark:bg-black/20 rounded-lg">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">{currentCompany?.phone || 'Not provided'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <div className="flex items-center space-x-2 p-3 bg-white/30 dark:bg-black/20 rounded-lg">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium capitalize">{currentCompany?.industry || 'Not specified'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subscription</Label>
                  <div className="flex items-center space-x-2 p-3 bg-white/30 dark:bg-black/20 rounded-lg">
                    <Key className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium capitalize">{currentCompany?.subscription || 'Free'}</span>
                    <Badge 
                      variant="outline" 
                      className={`ml-auto ${
                        currentCompany?.subscription === 'pro' 
                          ? 'text-green-600 border-green-600' 
                          : 'text-blue-600 border-blue-600'
                      }`}
                    >
                      {currentCompany?.subscription === 'pro' ? 'Pro' : 'Free'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('light')}
                      className="flex items-center gap-2"
                    >
                      <Sun className="w-4 h-4" />
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('dark')}
                      className="flex items-center gap-2"
                    >
                      <Moon className="w-4 h-4" />
                      Dark
                    </Button>
                    <Button
                      variant={theme === 'system' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('system')}
                      className="flex items-center gap-2"
                    >
                      <Monitor className="w-4 h-4" />
                      System
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Language</Label>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">English (US)</span>
                    <Badge variant="outline" className="ml-auto">Default</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked: boolean) => handleNotificationChange('email', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive push notifications in browser
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked: boolean) => handleNotificationChange('push', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive notifications via SMS
                    </p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked: boolean) => handleNotificationChange('sms', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Marketing Emails</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive marketing and promotional emails
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketing}
                    onCheckedChange={(checked: boolean) => handleNotificationChange('marketing', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security & Session */}
            <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & Session
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Authentication Method</Label>
                  <div className="flex items-center space-x-2 p-3 bg-white/30 dark:bg-black/20 rounded-lg">
                    <Key className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Firebase Authentication</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 ml-auto">
                      Active
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Current Session</Label>
                  <div className="flex items-center space-x-2 p-3 bg-white/30 dark:bg-black/20 rounded-lg">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium">Web Browser Session</span>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 ml-auto">
                      Active
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>User ID</Label>
                  <div className="flex items-center space-x-2 p-3 bg-white/30 dark:bg-black/20 rounded-lg">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                      {user?.uid ? `${user.uid.substring(0, 8)}...${user.uid.substring(user.uid.length - 8)}` : 'Not available'}
                    </span>
                  </div>
                </div>
                <div className="pt-2">
                  <Button 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    variant="outline" 
                    size="sm" 
                    className="w-full text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isLoggingOut ? 'Signing Out...' : 'Sign Out of All Sessions'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Settings */}
          <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Google OAuth Client ID</Label>
                  <Input
                    type="password"
                    value="55793913121-qsee57rottvnttdkm06itimem6h7gccg.apps.googleusercontent.com"
                    readOnly
                    className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label>OpenAI API Key</Label>
                  <Input
                    type="password"
                    value="sk-proj-3jDRE9tADfsmI-0RF_VwewjONl01TP3R..."
                    readOnly
                    className="bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100">API Status</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">All APIs are configured and working properly</p>
                </div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                  Connected
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
} 