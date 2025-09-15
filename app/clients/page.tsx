'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Users, 
  Plus, 
  Search, 
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Upload,
  Calendar,
  CreditCard,
  Building2,
  Star,
  MapPin,
  Globe,
  Phone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// Temporarily comment out to avoid build issues
// import { useClients } from '@/contexts/client-context'
// import { useProfile } from '@/contexts/profile-context'

// Mock client data for fallback
const mockClients = [
  {
    id: '1',
    name: 'BMW Company',
    email: 'contact@bmw.com',
    phone: '(840) 574-8039',
    website: 'https://bmw.com',
    status: 'active',
    tags: ['automotive', 'premium'],
    activeProjects: 3,
    lastActivity: '2 hours ago',
    avatar: 'BC',
    googleBusinessProfile: {
      id: 'bmw-downtown',
      name: 'BMW Downtown',
      rating: 4.8,
      reviewCount: 127,
      isConnected: true
    }
  },
  {
    id: '2',
    name: 'Samsung Company',
    email: 'hello@samsung.com',
    phone: '(840) 574-8039',
    website: 'https://samsung.com',
    status: 'active',
    tags: ['technology', 'electronics'],
    activeProjects: 2,
    lastActivity: '1 day ago',
    avatar: 'SC',
    googleBusinessProfile: {
      id: 'samsung-store',
      name: 'Samsung Store',
      rating: 4.6,
      reviewCount: 89,
      isConnected: true
    }
  },
  {
    id: '3',
    name: 'Tinder Company',
    email: 'support@tinder.com',
    phone: '(840) 574-8039',
    website: 'https://tinder.com',
    status: 'prospect',
    tags: ['social', 'app'],
    activeProjects: 1,
    lastActivity: '3 days ago',
    avatar: 'TC',
    googleBusinessProfile: null
  },
  {
    id: '4',
    name: 'Fed Ex Company',
    email: 'info@fedex.com',
    phone: '(840) 574-8039',
    website: 'https://fedex.com',
    status: 'active',
    tags: ['logistics', 'shipping'],
    activeProjects: 4,
    lastActivity: '5 hours ago',
    avatar: 'FE',
    googleBusinessProfile: {
      id: 'fedex-center',
      name: 'FedEx Center',
      rating: 4.2,
      reviewCount: 203,
      isConnected: false
    }
  }
]

export default function ClientsPage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  // Temporarily use mock data to avoid build issues
  // const { clients, loadClients } = useClients()
  // const { profiles } = useProfile()

  useEffect(() => {
    setMounted(true)
    // loadClients()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'prospect': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'archived': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Use mock data for now
  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

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
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Users className="mr-3 h-8 w-8 text-blue-600" />
                Clients
              </h1>
              <p className="text-gray-600 mt-1">Manage your client relationships and Google Business Profiles</p>
            </div>
            <Link href="/clients/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Add New Client
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="prospect">Prospect</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Clients Table */}
          <Card className="bg-white shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {filteredClients.length} Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Contact</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Google Business</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Projects</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Last Activity</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClients.map((client, index) => (
                      <motion.tr
                        key={client.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/clients/${client.id}`}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                              {client.avatar}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{client.name}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {client.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-900">{client.email}</p>
                            <p className="text-sm text-gray-600">{client.phone}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <Badge className={getStatusColor(client.status)} variant="outline">
                            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-4 px-4">
                          {client.googleBusinessProfile ? (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${client.googleBusinessProfile.isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                <span className="text-sm font-medium text-gray-900">
                                  {client.googleBusinessProfile.name}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-600">
                                  {client.googleBusinessProfile.rating} ({client.googleBusinessProfile.reviewCount} reviews)
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-gray-300" />
                              <span className="text-sm text-gray-500">Not connected</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-gray-900">{client.activeProjects}</span>
                          <span className="text-xs text-gray-500 ml-1">active</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">{client.lastActivity}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Handle upload action
                              }}
                              title="Upload Files"
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Handle new task action
                              }}
                              title="New Task"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Handle new invoice action
                              }}
                              title="New Invoice"
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                // Handle more actions
                              }}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Empty State */}
          {filteredClients.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Card className="bg-white shadow-sm border-gray-200">
                <CardContent className="py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No clients found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Get started by adding your first client'
                    }
                  </p>
                  <Link href="/clients/new">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Client
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
