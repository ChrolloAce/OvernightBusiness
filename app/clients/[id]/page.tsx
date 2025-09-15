'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams } from 'next/navigation'
import { 
  Building2, 
  ArrowLeft,
  Plus, 
  Upload,
  Calendar,
  Key,
  Globe,
  Image,
  BarChart3,
  CreditCard,
  DollarSign,
  Star,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Edit,
  MoreHorizontal,
  CheckCircle,
  Clock,
  AlertCircle,
  PhoneCall
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { ClientPhoneManager } from '@/components/client-phone-manager'
import { useClients } from '@/contexts/client-context'

// Mock client data
interface ClientData {
  id: string
  name: string
  email: string
  phone: string
  website: string
  status: string
  tags: string[]
  notes: string
  avatar: string
  createdAt: string
  googleBusinessProfile?: {
    id: string
    name: string
    rating: number
    reviewCount: number
    isConnected: boolean
    address: string
    category: string
  }
}

const mockClient: ClientData = {
  id: '1',
  name: 'BMW Company',
  email: 'contact@bmw.com',
  phone: '(840) 574-8039',
  website: 'https://bmw.com',
  status: 'active',
  tags: ['automotive', 'premium'],
  notes: 'Premium automotive client with multiple locations',
  avatar: 'BC',
  createdAt: '2024-01-01',
  googleBusinessProfile: {
    id: 'bmw-downtown',
    name: 'BMW Downtown',
    rating: 4.8,
    reviewCount: 127,
    isConnected: true,
    address: '123 Main St, Downtown, NY 10001',
    category: 'Car Dealer'
  }
}

const mockRecentActivity = [
  { action: 'Invoice INV-001 sent', time: '2 hours ago', type: 'invoice' },
  { action: 'New task created: Website update', time: '4 hours ago', type: 'task' },
  { action: 'Google Business Profile synced', time: '1 day ago', type: 'sync' },
  { action: 'File uploaded: Brand guidelines', time: '2 days ago', type: 'file' }
]

const mockTasks = [
  { id: '1', title: 'Update website content', status: 'in_progress', dueDate: '2024-01-25' },
  { id: '2', title: 'Respond to reviews', status: 'todo', dueDate: '2024-01-28' },
  { id: '3', title: 'Create social media posts', status: 'completed', dueDate: '2024-01-20' }
]

const mockAccessItems = [
  {
    id: '1',
    type: 'Google Business Profile',
    label: 'BMW Downtown Location',
    username: 'bmw@business.google.com',
    verified: true,
    icon: Building2,
    color: 'bg-blue-500'
  },
  {
    id: '2',
    type: 'Website',
    label: 'BMW Website Admin',
    username: 'admin@bmw.com',
    verified: true,
    icon: Globe,
    color: 'bg-green-500'
  },
  {
    id: '3',
    type: 'Domain',
    label: 'bmw.com Domain',
    username: 'domains@bmw.com',
    verified: false,
    icon: Globe,
    color: 'bg-purple-500'
  }
]

export default function ClientDetailPage() {
  const params = useParams()
  const { clients } = useClients()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [client, setClient] = useState<ClientData>(mockClient)

  useEffect(() => {
    setMounted(true)
    
    // Load real client data if available
    const clientId = params.id as string
    const realClient = clients.find(c => c.id === clientId)
    
    if (realClient) {
      const newClientData: ClientData = {
        id: realClient.id,
        name: realClient.name,
        email: realClient.email || '',
        phone: realClient.phone || '',
        website: realClient.website || '',
        status: realClient.status,
        tags: realClient.tags,
        notes: realClient.notes || '',
        avatar: realClient.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2),
        createdAt: realClient.createdAt
      }
      
      if (realClient.googleBusinessProfile) {
        newClientData.googleBusinessProfile = {
          id: realClient.googleBusinessProfile.id,
          name: realClient.googleBusinessProfile.name,
          rating: realClient.googleBusinessProfile.rating || 0,
          reviewCount: realClient.googleBusinessProfile.reviewCount || 0,
          isConnected: !!realClient.googleBusinessProfileId,
          address: realClient.googleBusinessProfile.address || '',
          category: realClient.googleBusinessProfile.category || ''
        }
      }
      
      setClient(newClientData)
      
      console.log('[ClientDetail] Loaded real client data:', realClient.name)
    } else {
      console.log('[ClientDetail] Using mock data for client:', clientId)
    }
  }, [params.id, clients])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'prospect': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'archived': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'todo': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 lg:p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Back Button */}
          <Link href="/clients">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clients
            </Button>
          </Link>

          {/* Client Header */}
          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                    {mockClient.avatar}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className={getStatusColor(client.status)} variant="outline">
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </Badge>
                      {client.googleBusinessProfile?.isConnected && (
                        <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                          <Building2 className="mr-1 h-3 w-3" />
                          Google Business Connected
                        </Badge>
                      )}
                    </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="mr-1 h-4 w-4" />
                          {client.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="mr-1 h-4 w-4" />
                          {client.phone}
                        </div>
                        {client.website && (
                        <a 
                          href={client.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <Globe className="mr-1 h-4 w-4" />
                          Website
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                  <Button variant="outline">
                    <Calendar className="mr-2 h-4 w-4" />
                    New Task
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Key className="mr-2 h-4 w-4" />
                    Request Access
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-8 bg-white border border-gray-200 rounded-lg">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
              <TabsTrigger value="access">Access</TabsTrigger>
              <TabsTrigger value="website">Website</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="ads">Ads</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="finance">Finance</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Recent Activity */}
                <Card className="bg-white shadow-sm border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mockRecentActivity.map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{activity.action}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tasks List */}
                <Card className="bg-white shadow-sm border-gray-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold">Active Tasks</CardTitle>
                      <Button size="sm" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        New Task
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mockTasks.map((task) => (
                        <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{task.title}</p>
                            <p className="text-xs text-gray-500">Due: {task.dueDate}</p>
                          </div>
                          <Badge className={getTaskStatusColor(task.status)} variant="outline">
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Google Business Profile Integration */}
              {client.googleBusinessProfile && (
                <Card className="bg-white shadow-sm border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <Building2 className="mr-2 h-5 w-5 text-blue-600" />
                      Google Business Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{client.googleBusinessProfile.name}</p>
                          <p className="text-sm text-gray-600">{client.googleBusinessProfile.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Star className="h-5 w-5 text-yellow-400 fill-current" />
                        <div>
                          <p className="font-semibold text-gray-900">{client.googleBusinessProfile.rating}</p>
                          <p className="text-sm text-gray-600">{client.googleBusinessProfile.reviewCount} reviews</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${client.googleBusinessProfile.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {client.googleBusinessProfile.isConnected ? 'Connected' : 'Disconnected'}
                          </p>
                          <p className="text-sm text-gray-600">Sync status</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex space-x-3">
                        <Link href={`/analytics?profile=${client.googleBusinessProfile.id}`}>
                          <Button variant="outline" size="sm">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            View Analytics
                          </Button>
                        </Link>
                        <Link href={`/reviews?profile=${client.googleBusinessProfile.id}`}>
                          <Button variant="outline" size="sm">
                            <Star className="mr-2 h-4 w-4" />
                            Manage Reviews
                          </Button>
                        </Link>
                        <Link href={`/content?profile=${client.googleBusinessProfile.id}`}>
                          <Button variant="outline" size="sm">
                            <Calendar className="mr-2 h-4 w-4" />
                            Create Content
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Phone Tab */}
            <TabsContent value="phone" className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <PhoneCall className="mr-2 h-5 w-5 text-blue-600" />
                  Phone Number & Call Management
                </h2>
                <p className="text-gray-600">Manage Twilio phone numbers and track call analytics for this client</p>
              </div>
              <ClientPhoneManager clientId={client.id} clientName={client.name} />
            </TabsContent>

            {/* Access Tab */}
            <TabsContent value="access" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Access Credentials</h2>
                  <p className="text-gray-600">Manage client access credentials and integrations</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Access
                </Button>
              </div>

              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {mockAccessItems.map((item) => (
                  <Card key={item.id} className="bg-white shadow-sm border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center`}>
                            <item.icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.label}</p>
                            <p className="text-sm text-gray-600">{item.type}</p>
                            <p className="text-xs text-gray-500 mt-1">{item.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.verified ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-500" />
                          )}
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Website Tab */}
            <TabsContent value="website" className="space-y-6">
              <Card className="bg-white shadow-sm border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Website Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Domain</label>
                      <p className="text-gray-900 mt-1">bmw.com</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Status</label>
                      <Badge className="bg-green-100 text-green-800 border-green-200 mt-1" variant="outline">
                        Live
                      </Badge>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Tech Stack</label>
                      <p className="text-gray-900 mt-1">Next.js, React, TypeScript</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">DNS Status</label>
                      <div className="flex items-center space-x-2 mt-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-900">DNS OK</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <Button variant="outline">
                      <Globe className="mr-2 h-4 w-4" />
                      Check DNS
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Files & Assets</h2>
                  <p className="text-gray-600">Client files, images, and documents</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Files
                </Button>
              </div>

              <Card className="bg-white shadow-sm border-gray-200">
                <CardContent className="p-6">
                  <div className="text-center py-12">
                    <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No files uploaded</h3>
                    <p className="text-gray-600 mb-4">
                      Upload client files, images, and documents here
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload First File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Ads Tab */}
            <TabsContent value="ads" className="space-y-6">
              <Card className="bg-white shadow-sm border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Ad Accounts & Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No ad accounts configured</h3>
                    <p className="text-gray-600 mb-4">
                      Set up Meta, Google, or TikTok ad accounts for this client
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Ad Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Invoices</h2>
                  <p className="text-gray-600">Client billing and payment history</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Invoice
                </Button>
              </div>

              <Card className="bg-white shadow-sm border-gray-200">
                <CardContent className="p-6">
                  <div className="text-center py-8">
                    <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No invoices yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create and send invoices to this client
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Create First Invoice
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Finance Tab */}
            <TabsContent value="finance" className="space-y-6">
              <Card className="bg-white shadow-sm border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <DollarSign className="mx-auto h-8 w-8 text-green-600 mb-2" />
                      <p className="text-2xl font-bold text-gray-900">$12,400</p>
                      <p className="text-sm text-gray-600">Total Paid</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <Clock className="mx-auto h-8 w-8 text-yellow-600 mb-2" />
                      <p className="text-2xl font-bold text-gray-900">$3,200</p>
                      <p className="text-sm text-gray-600">Outstanding</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <BarChart3 className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                      <p className="text-2xl font-bold text-gray-900">$2,100</p>
                      <p className="text-sm text-gray-600">Monthly Average</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}
