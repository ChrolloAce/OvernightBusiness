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
  Building2,
  Star,
  Phone,
  Mail,
  ArrowUpDown,
  ChevronDown,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  const { clients, loadClients, deleteClient, updateClient, createClient } = useClients()
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

  const handleCreateClient = () => {
    // Create a new client instantly with default values
    const newClient = createClient({
      name: 'Untitled Client',
      email: undefined,
      phone: undefined,
      website: undefined,
      status: 'prospect',
      tags: [],
      notes: undefined,
      googleBusinessProfileId: undefined,
      activeProjects: 0,
      lastActivity: new Date().toISOString(),
      totalRevenue: 0,
      outstandingInvoices: 0
    })
    
    // Immediately start editing the name
    setTimeout(() => {
      setEditingCell({ clientId: newClient.id, field: 'name' })
      setEditValue('Untitled Client')
    }, 100)
    
    console.log('Client created instantly:', newClient.name)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'prospect': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'archived': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
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
    return <div className="min-h-screen bg-white" />
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Notion-like Header */}
        <div className="px-6 py-8 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
                <p className="text-sm text-gray-500">{filteredAndSortedClients.length} clients</p>
              </div>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 shadow-sm"
              onClick={handleCreateClient}
            >
              <Plus className="mr-2 h-4 w-4" />
              New
            </Button>
          </div>
        </div>

        {/* Notion-like Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 border-0 bg-white shadow-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 border-0 bg-white shadow-sm">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notion-like Database Table */}
        <div className="px-6">
          {filteredAndSortedClients.length === 0 ? (
            <div className="py-20 text-center">
              <Users className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {clients.length === 0 ? 'No clients yet' : 'No clients match your filters'}
              </h3>
              <p className="text-gray-500 mb-6">
                {clients.length === 0 
                  ? 'Create your first client to get started'
                  : 'Try adjusting your search or filters'}
              </p>
               {clients.length === 0 && (
                 <Button 
                   className="bg-blue-600 hover:bg-blue-700"
                   onClick={handleCreateClient}
                 >
                   <Plus className="mr-2 h-4 w-4" />
                   New Client
                 </Button>
               )}
            </div>
          ) : (
            <div className="notion-table">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 py-3 px-4 border-b border-gray-100 bg-gray-50/30 sticky top-0">
                <button 
                  className="col-span-3 flex items-center space-x-1 text-left text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <span>Name</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
                <button 
                  className="col-span-2 flex items-center space-x-1 text-left text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('email')}
                >
                  <span>Email</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
                <button 
                  className="col-span-1 flex items-center space-x-1 text-left text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <span>Status</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
                <div className="col-span-2 text-sm font-medium text-gray-600">Phone</div>
                <div className="col-span-2 text-sm font-medium text-gray-600">Google Business</div>
                <div className="col-span-1 text-sm font-medium text-gray-600 text-center">Projects</div>
                <div className="col-span-1 text-sm font-medium text-gray-600 text-center">Actions</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {filteredAndSortedClients.map((client, index) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="grid grid-cols-12 gap-4 py-3 px-4 hover:bg-gray-50/50 transition-colors group"
                  >
                     {/* Name Column */}
                     <div className="col-span-3 flex items-center space-x-3">
                       <div className="flex items-center space-x-3 w-full">
                         <Link href={`/clients/${client.id}`}>
                           <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-medium hover:opacity-80 transition-opacity">
                             {client.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                           </div>
                         </Link>
                         <div className="flex-1 min-w-0">
                           {editingCell?.clientId === client.id && editingCell?.field === 'name' ? (
                             <Input
                               value={editValue}
                               onChange={(e) => setEditValue(e.target.value)}
                               onKeyDown={handleKeyPress}
                               onBlur={handleCellSave}
                               autoFocus
                               className="h-8 text-sm border-blue-200 focus:border-blue-400 font-medium"
                             />
                           ) : (
                             <div 
                               className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors"
                               onClick={() => handleCellEdit(client.id, 'name', client.name)}
                             >
                               {client.name}
                             </div>
                           )}
                           <div className="flex flex-wrap gap-1 mt-1">
                             {client.tags.slice(0, 2).map((tag) => (
                               <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">
                                 {tag}
                               </Badge>
                             ))}
                             {client.tags.length > 2 && (
                               <Badge variant="outline" className="text-xs px-2 py-0.5">
                                 +{client.tags.length - 2}
                               </Badge>
                             )}
                           </div>
                         </div>
                       </div>
                     </div>

                    {/* Email Column - Inline Editable */}
                    <div className="col-span-2 flex items-center">
                      {editingCell?.clientId === client.id && editingCell?.field === 'email' ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onBlur={handleCellSave}
                          autoFocus
                          className="h-8 text-sm border-blue-200 focus:border-blue-400"
                        />
                      ) : (
                        <div 
                          className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer p-1 rounded hover:bg-gray-100 transition-colors w-full"
                          onClick={() => handleCellEdit(client.id, 'email', client.email || '')}
                        >
                          {client.email || 'Add email...'}
                        </div>
                      )}
                    </div>

                     {/* Status Column - Dropdown */}
                     <div className="col-span-1 flex items-center">
                       {editingCell?.clientId === client.id && editingCell?.field === 'status' ? (
                         <Select 
                           value={editValue} 
                           onValueChange={(value) => {
                             updateClient(client.id, { status: value as any })
                             setEditingCell(null)
                           }}
                         >
                           <SelectTrigger className="h-8 text-sm border-blue-200 focus:border-blue-400">
                             <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="prospect">Prospect</SelectItem>
                             <SelectItem value="active">Active</SelectItem>
                             <SelectItem value="inactive">Inactive</SelectItem>
                             <SelectItem value="archived">Archived</SelectItem>
                           </SelectContent>
                         </Select>
                       ) : (
                         <Badge 
                           className={`${getStatusColor(client.status)} cursor-pointer hover:opacity-80 transition-opacity`}
                           variant="outline"
                           onClick={() => {
                             setEditingCell({ clientId: client.id, field: 'status' })
                             setEditValue(client.status)
                           }}
                         >
                           {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                         </Badge>
                       )}
                     </div>

                    {/* Phone Column - Inline Editable */}
                    <div className="col-span-2 flex items-center">
                      {editingCell?.clientId === client.id && editingCell?.field === 'phone' ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onBlur={handleCellSave}
                          autoFocus
                          className="h-8 text-sm border-blue-200 focus:border-blue-400"
                        />
                      ) : (
                        <div 
                          className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer p-1 rounded hover:bg-gray-100 transition-colors w-full"
                          onClick={() => handleCellEdit(client.id, 'phone', client.phone || '')}
                        >
                          {client.phone || 'Add phone...'}
                        </div>
                      )}
                    </div>

                    {/* Google Business Column */}
                    <div className="col-span-2 flex items-center">
                      {client.googleBusinessProfile ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm text-gray-700 truncate">
                            {client.googleBusinessProfile.name}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                          <span className="text-sm text-gray-400">Not connected</span>
                        </div>
                      )}
                    </div>

                    {/* Projects Column */}
                    <div className="col-span-1 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {client.activeProjects || 0}
                      </span>
                    </div>

                    {/* Actions Column */}
                    <div className="col-span-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.location.href = `/clients/${client.id}`}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm(`Delete "${client.name}"?`)) {
                              deleteClient(client.id)
                            }
                          }}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

               {/* Add New Row */}
               <div 
                 className="grid grid-cols-12 gap-4 py-3 px-4 hover:bg-blue-50/50 transition-colors cursor-pointer border-t border-gray-100"
                 onClick={handleCreateClient}
               >
                 <div className="col-span-12 flex items-center space-x-2 text-gray-500 hover:text-blue-600">
                   <Plus className="h-4 w-4" />
                   <span className="text-sm">New client</span>
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
