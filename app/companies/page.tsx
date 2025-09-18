'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Building2, 
  Plus, 
  Users, 
  Settings, 
  Edit,
  Trash2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Crown,
  Shield,
  UserCheck,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Company {
  id: string
  name: string
  email?: string
  phone?: string
  website?: string
  industry?: string
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  subscription?: 'free' | 'basic' | 'pro' | 'enterprise'
  settings?: any
  createdAt: Date
  updatedAt: Date
}

interface User {
  id: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'manager' | 'user'
  companyId: string
  permissions?: string[]
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export default function CompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [companyUsers, setCompanyUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    industry: 'Business Services',
    size: 'small' as const,
    subscription: 'pro' as const
  })
  const [userFormData, setUserFormData] = useState({
    email: '',
    name: '',
    role: 'user' as const
  })

  useEffect(() => {
    loadCompanies()
  }, [])

  useEffect(() => {
    if (selectedCompany) {
      loadCompanyUsers(selectedCompany.id)
    }
  }, [selectedCompany])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/companies')
      const data = await response.json()
      
      if (data.success) {
        setCompanies(data.companies)
        if (data.companies.length > 0 && !selectedCompany) {
          setSelectedCompany(data.companies[0])
        }
      }
    } catch (error) {
      console.error('Error loading companies:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCompanyUsers = async (companyId: string) => {
    try {
      const response = await fetch(`/api/users?companyId=${companyId}`)
      const data = await response.json()
      
      if (data.success) {
        setCompanyUsers(data.users)
      }
    } catch (error) {
      console.error('Error loading company users:', error)
    }
  }

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`✅ Company "${data.company.name}" created successfully!`)
        setFormData({
          name: '',
          email: '',
          phone: '',
          website: '',
          industry: 'Business Services',
          size: 'small',
          subscription: 'pro'
        })
        loadCompanies()
      } else {
        alert(`❌ Failed to create company: ${data.error}`)
      }
    } catch (error) {
      console.error('Error creating company:', error)
      alert('❌ Error creating company')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCompany) return
    
    setIsCreatingUser(true)
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userFormData,
          companyId: selectedCompany.id
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        alert(`✅ User "${data.user.name}" added to ${selectedCompany.name}!`)
        setUserFormData({
          email: '',
          name: '',
          role: 'user'
        })
        loadCompanyUsers(selectedCompany.id)
      } else {
        alert(`❌ Failed to create user: ${data.error}`)
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('❌ Error creating user')
    } finally {
      setIsCreatingUser(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="h-4 w-4 text-yellow-600" />
      case 'admin': return <Shield className="h-4 w-4 text-red-600" />
      case 'manager': return <UserCheck className="h-4 w-4 text-blue-600" />
      default: return <Users className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'admin': return 'bg-red-100 text-red-800 border-red-200'
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'startup': return 'bg-purple-100 text-purple-800'
      case 'small': return 'bg-blue-100 text-blue-800'
      case 'medium': return 'bg-green-100 text-green-800'
      case 'large': return 'bg-orange-100 text-orange-800'
      case 'enterprise': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 text-gray-400 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading companies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Building2 className="mr-3 h-8 w-8 text-blue-600" />
              Company Management
            </h1>
            <p className="text-gray-600 mt-1">Manage companies and users</p>
          </div>
          <Button 
            onClick={() => setIsCreating(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Company
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Companies List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Companies ({companies.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {companies.map((company) => (
                  <motion.div
                    key={company.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedCompany?.id === company.id 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedCompany(company)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{company.name}</h3>
                        <p className="text-sm text-gray-600">{company.email || 'No email set'}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getSizeColor(company.size || 'small')} variant="outline">
                            {company.size || 'small'}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {company.subscription || 'free'}
                          </Badge>
                        </div>
                      </div>
                      {selectedCompany?.id === company.id && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {companies.length === 0 && (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No companies found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Company Details and Users */}
          <div className="lg:col-span-2 space-y-6">
            {selectedCompany ? (
              <>
                {/* Company Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{selectedCompany.name}</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/clients?company=${selectedCompany.id}`)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          View Clients
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedCompany.email || 'No email set'}</span>
                      </div>
                      {selectedCompany.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{selectedCompany.phone}</span>
                        </div>
                      )}
                      {selectedCompany.website && (
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <a 
                            href={selectedCompany.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {selectedCompany.website}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{selectedCompany.industry || 'Business Services'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Company Users */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Team Members ({companyUsers.length})</span>
                      <Button 
                        onClick={() => setIsCreatingUser(true)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add User
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {companyUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              {getRoleIcon(user.role)}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{user.name}</h4>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getRoleColor(user.role)} variant="outline">
                              {user.role}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {companyUsers.length === 0 && (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No users found</p>
                          <Button 
                            onClick={() => setIsCreatingUser(true)}
                            className="mt-4"
                            size="sm"
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Add First User
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a company to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Create Company Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Create New Company</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateCompany} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Company Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({...prev, website: e.target.value}))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="size">Company Size</Label>
                      <Select value={formData.size} onValueChange={(value: any) => setFormData(prev => ({...prev, size: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="startup">Startup</SelectItem>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="subscription">Subscription</Label>
                      <Select value={formData.subscription} onValueChange={(value: any) => setFormData(prev => ({...prev, subscription: value}))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="pro">Pro</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2 pt-4">
                    <Button 
                      type="button"
                      variant="ghost" 
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isCreating}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isCreating ? 'Creating...' : 'Create Company'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create User Modal */}
        {isCreatingUser && selectedCompany && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add User to {selectedCompany.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div>
                    <Label htmlFor="userName">Full Name *</Label>
                    <Input
                      id="userName"
                      value={userFormData.name}
                      onChange={(e) => setUserFormData(prev => ({...prev, name: e.target.value}))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="userEmail">Email *</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData(prev => ({...prev, email: e.target.value}))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="userRole">Role</Label>
                    <Select value={userFormData.role} onValueChange={(value: any) => setUserFormData(prev => ({...prev, role: value}))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2 pt-4">
                    <Button 
                      type="button"
                      variant="ghost" 
                      onClick={() => setIsCreatingUser(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit"
                      disabled={isCreatingUser}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isCreatingUser ? 'Adding...' : 'Add User'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
