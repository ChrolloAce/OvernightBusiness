'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
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
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { useClients } from '@/contexts/client-context'
import { useTasks } from '@/contexts/task-context'
import { ClientAnalytics } from '@/components/client-analytics'
import { SavedBusinessProfile } from '@/lib/business-profiles-storage'
import { ClientAvatar } from '@/components/client-avatar'
import { ClientTasksNotionTable } from '@/components/client-tasks-notion-table'
import { WebsiteScreenshot } from '@/components/website-screenshot'
import { ClientNotes } from '@/components/client-notes'
import { ClientPhoneTracking } from '@/components/client-phone-tracking'
import { ClientCallAnalytics } from '@/components/client-call-analytics'

// Client data interface
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
  googleBusinessProfile?: SavedBusinessProfile
  // Phone tracking properties
  trackingPhoneNumber?: string
  trackingPhoneSid?: string
  customWebhookUrl?: string
}

// No mock client data - will show empty state if no real client found

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
  const router = useRouter()
  const { clients, loadClients, updateClient } = useClients()
  const { getTasksByClient, getClientTaskStats, createTask } = useTasks()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [client, setClient] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    setMounted(true)
    setLoading(true)
    
    // Ensure clients are loaded
    loadClients()
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    // Load real client data if available
    const clientId = params.id as string
    console.log('[ClientDetail] Looking for client with ID:', clientId)
    console.log('[ClientDetail] Available clients:', clients.length)
    
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
        createdAt: realClient.createdAt.toISOString(),
        // Phone tracking properties (will be loaded from Firebase phone assignments)
        trackingPhoneNumber: undefined, // TODO: Load from Firebase phone assignments
        trackingPhoneSid: undefined,    // TODO: Load from Firebase phone assignments  
        customWebhookUrl: undefined     // TODO: Load from Firebase phone assignments
      }
      
      if (realClient.googleBusinessProfile) {
        newClientData.googleBusinessProfile = realClient.googleBusinessProfile
      }
      
      setClient(newClientData)
      setLoading(false)
      
      console.log('[ClientDetail] Loaded real client data:', realClient.name)
    } else if (clients.length > 0) {
      // Only redirect if we have loaded clients and still can't find the client
      console.log('[ClientDetail] No client found with ID:', clientId)
      console.log('[ClientDetail] Redirecting to clients list')
      router.push('/clients')
    } else {
      // Still loading clients, wait a bit more
      console.log('[ClientDetail] Still loading clients...')
      setTimeout(() => setLoading(false), 2000)
    }
  }, [params.id, clients, mounted])

  const handleCreateClientTask = () => {
    if (!client) return
    
    // Create a new task instantly for this client
    const newTask = createTask({
      title: 'Untitled Task',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: 'Unassigned',
      clientId: client.id,
      clientName: client.name,
      tags: []
    })
    
    console.log('Task created for client:', client.name)
  }

  const handleFieldEdit = (field: string, currentValue: string) => {
    setEditingField(field)
    setEditValue(currentValue || '')
  }

  const handleFieldSave = () => {
    if (editingField && client && editValue !== undefined) {
      // Update client data using context
      updateClient(client.id, { [editingField]: editValue })
      
      // Update local state immediately for UI responsiveness
      setClient({
        ...client,
        [editingField]: editValue
      })
      
      setEditingField(null)
      setEditValue('')
      console.log(`Updated ${editingField} to:`, editValue)
    }
  }

  const handleFieldCancel = () => {
    setEditingField(null)
    setEditValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFieldSave()
    } else if (e.key === 'Escape') {
      handleFieldCancel()
    }
  }

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

  if (!mounted || loading || !client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client...</p>
          <p className="text-xs text-gray-500 mt-2">
            {clients.length === 0 ? 'Loading clients...' : `Searching for client...`}
          </p>
        </div>
      </div>
    )
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
                  <ClientAvatar 
                    clientName={client.name}
                    googleBusinessProfile={client.googleBusinessProfile}
                    size="xl"
                  />
                  <div className="flex-1">
                    {/* Editable Client Name */}
                    {editingField === 'name' ? (
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        onBlur={handleFieldSave}
                        autoFocus
                        className="text-2xl font-bold border-blue-200 focus:border-blue-400 bg-white"
                      />
                    ) : (
                      <h1 
                        className="text-2xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                        onClick={() => handleFieldEdit('name', client.name)}
                      >
                        {client.name}
                      </h1>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className={getStatusColor(client.status)} variant="outline">
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </Badge>
                      {client.googleBusinessProfile && (
                        <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                          <Building2 className="mr-1 h-3 w-3" />
                          {client.googleBusinessProfile.name}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      {/* Editable Email */}
                      <div className="flex items-center">
                        <Mail className="mr-1 h-4 w-4" />
                        {editingField === 'email' ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            onBlur={handleFieldSave}
                            autoFocus
                            className="h-6 text-sm border-blue-200 focus:border-blue-400 bg-white ml-1"
                          />
                        ) : (
                          <span 
                            className="hover:text-blue-600 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                            onClick={() => handleFieldEdit('email', client.email)}
                          >
                            {client.email || 'Add email...'}
                          </span>
                        )}
                      </div>
                      
                      {/* Editable Phone */}
                      <div className="flex items-center">
                        <Phone className="mr-1 h-4 w-4" />
                        {editingField === 'phone' ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            onBlur={handleFieldSave}
                            autoFocus
                            className="h-6 text-sm border-blue-200 focus:border-blue-400 bg-white ml-1"
                          />
                        ) : (
                          <span 
                            className="hover:text-blue-600 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                            onClick={() => handleFieldEdit('phone', client.phone)}
                          >
                            {client.phone || 'Add phone...'}
                          </span>
                        )}
                      </div>
                      
                      {/* Editable Website */}
                      <div className="flex items-center">
                        <Globe className="mr-1 h-4 w-4" />
                        {editingField === 'website' ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            onBlur={handleFieldSave}
                            autoFocus
                            className="h-6 text-sm border-blue-200 focus:border-blue-400 bg-white ml-1"
                          />
                        ) : (
                          <span 
                            className="hover:text-blue-600 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                            onClick={() => handleFieldEdit('website', client.website || 'example.com')}
                          >
                            {client.website || 'Add website...'}
                          </span>
                        )}
                      </div>
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
            <TabsList className="grid w-full grid-cols-7 bg-white border border-gray-200 rounded-lg">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="access">Access</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                {/* Website Screenshot */}
                <Card className="bg-white shadow-sm border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <Globe className="mr-2 h-5 w-5 text-blue-600" />
                      Website Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WebsiteScreenshot 
                      website={client.website || ''}
                      clientName={client.name}
                      className="w-full h-64"
                    />
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Website URL:</span>
                        {editingField === 'website' ? (
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            onBlur={handleFieldSave}
                            autoFocus
                            className="h-8 text-sm border-blue-200 focus:border-blue-400 flex-1 ml-2"
                            placeholder="Enter website URL"
                          />
                        ) : (
                          <div 
                            className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer hover:underline flex-1 ml-2 text-right"
                            onClick={() => handleFieldEdit('website', client.website || '')}
                          >
                            {client.website || 'No website set'}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <a
                          href={client.website ? (client.website.startsWith('http') ? client.website : `https://${client.website}`) : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <ExternalLink className="mr-1 h-4 w-4" />
                          Visit Website
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Force reload the screenshot by updating the key
                            const screenshotComponent = document.querySelector('[data-screenshot-key]')
                            if (screenshotComponent) {
                              screenshotComponent.setAttribute('data-screenshot-key', Date.now().toString())
                            }
                            router.refresh() // Simple refresh for now
                          }}
                          className="h-6 text-sm text-gray-600 hover:text-blue-600"
                        >
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Reload
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Client Information */}
                <Card className="bg-white shadow-sm border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Client Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Contact Details */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Email:</span>
                          {editingField === 'email' ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyPress}
                              onBlur={handleFieldSave}
                              autoFocus
                              className="h-8 text-sm border-blue-200 focus:border-blue-400 flex-1 ml-2"
                              placeholder="client@example.com"
                            />
                          ) : (
                            <div 
                              className="text-sm text-gray-900 cursor-pointer hover:text-blue-600 flex-1 ml-2 text-right"
                              onClick={() => handleFieldEdit('email', client.email || '')}
                            >
                              {client.email || 'Add email...'}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Phone:</span>
                          {editingField === 'phone' ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyPress}
                              onBlur={handleFieldSave}
                              autoFocus
                              className="h-8 text-sm border-blue-200 focus:border-blue-400 flex-1 ml-2"
                              placeholder="+1 (555) 123-4567"
                            />
                          ) : (
                            <div 
                              className="text-sm text-gray-900 cursor-pointer hover:text-blue-600 flex-1 ml-2 text-right"
                              onClick={() => handleFieldEdit('phone', client.phone || '')}
                            >
                              {client.phone || 'Add phone...'}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status and Tags */}
                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Status:</span>
                          <Badge className={getStatusColor(client.status)} variant="outline">
                            {client.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Tags:</span>
                          <div className="flex flex-wrap gap-1">
                            {client.tags && client.tags.length > 0 ? (
                              client.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">No tags</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <ClientAnalytics 
                clientId={client.id}
                clientName={client.name}
                googleBusinessProfile={client.googleBusinessProfile || null}
              />
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

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="space-y-6">
              <ClientTasksNotionTable clientId={client.id} clientName={client.name} />
            </TabsContent>

            {/* Phone Tab */}
            <TabsContent value="phone" className="space-y-6">
              {/* Phone Configuration */}
              <ClientPhoneTracking 
                clientId={client.id}
                clientName={client.name}
                clientPhone={client.phone}
                trackingNumber={client.trackingPhoneNumber}
                trackingPhoneSid={client.trackingPhoneSid}
              />
              
              {/* Call Analytics - Full Width */}
              <ClientCallAnalytics 
                clientId={client.id}
                clientName={client.name}
                trackingNumber={client.trackingPhoneNumber}
              />
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-6">
              <ClientNotes clientId={client.id} clientName={client.name} />
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

          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}
