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
  Phone,
  Eye,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClients } from '@/contexts/client-context'
import { useProfile } from '@/contexts/profile-context'


export default function ClientsPage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [editingCell, setEditingCell] = useState<{clientId: string, field: string} | null>(null)
  const [editValue, setEditValue] = useState('')
  const { clients, loadClients, deleteClient, updateClient } = useClients()
  const { profiles } = useProfile()

  useEffect(() => {
    setMounted(true)
    loadClients()
  }, [])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleCellEdit = (clientId: string, field: string, currentValue: string) => {
    setEditingCell({ clientId, field })
    setEditValue(currentValue || '')
  }

  const handleCellSave = () => {
    if (editingCell) {
      updateClient(editingCell.clientId, { [editingCell.field]: editValue })
      setEditingCell(null)
      setEditValue('')
    }
  }

  const handleCellCancel = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave()
    } else if (e.key === 'Escape') {
      handleCellCancel()
    }
  }

  const handleDeleteClient = async (clientId: string, clientName: string) => {
    if (confirm(`Delete "${clientName}"?`)) {
      deleteClient(clientId)
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

  // Filter and sort clients
  const filteredAndSortedClients = clients
    .filter(client => {
      const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           client.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue = ''
      let bValue = ''
      
      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'email':
          aValue = a.email || ''
          bValue = b.email || ''
          break
        case 'created':
          aValue = a.createdAt
          bValue = b.createdAt
          break
        default:
          aValue = a.name
          bValue = b.name
      }
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
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
              {filteredClients.length === 0 ? (
                <div className="p-12 text-center">
                  <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {clients.length === 0 ? 'No clients yet' : 'No clients match your filters'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {clients.length === 0 
                      ? 'Get started by creating your first client'
                      : 'Try adjusting your search or filters'}
                  </p>
                  {clients.length === 0 && (
                    <Link href="/clients/new">
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Client
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
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
                        onClick={() => handleClientClick(client.id)}
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                              {client.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
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
                            <p className="text-sm text-gray-900">{client.email || 'No email'}</p>
                            <p className="text-sm text-gray-600">{client.phone || 'No phone'}</p>
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
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-sm font-medium text-gray-900">
                                  {client.googleBusinessProfile.name}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-xs text-gray-600">
                                  {client.googleBusinessProfile.rating || 'N/A'} ({client.googleBusinessProfile.reviewCount || 0} reviews)
                                </span>
                              </div>
                            </div>
                          ) : client.googleBusinessProfileId ? (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-500" />
                              <span className="text-sm text-gray-600">Profile ID: {client.googleBusinessProfileId}</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 rounded-full bg-gray-300" />
                              <span className="text-sm text-gray-500">Not connected</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm font-medium text-gray-900">{client.activeProjects || 0}</span>
                          <span className="text-xs text-gray-500 ml-1">active</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">
                            {client.lastActivity || new Date(client.updatedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleClientClick(client.id)
                              }}
                              title="View Client"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.location.href = `/clients/${client.id}?tab=overview`
                              }}
                              title="Edit Client"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteClient(client.id, client.name)
                              }}
                              title="Delete Client"
                              disabled={deletingClientId === client.id}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              {deletingClientId === client.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </CardContent>
          </Card>

        </motion.div>
      </main>
    </div>
  )
}
