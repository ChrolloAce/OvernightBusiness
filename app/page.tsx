'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Building2, 
  BarChart3, 
  DollarSign,
  Users,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  Calendar,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
// Inline components to avoid import issues during build
function KPICard({ title, value, change, trend, icon: Icon, subtitle, loading }: any) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getTrendBg = () => {
    switch (trend) {
      case 'up': return 'bg-green-50 border-green-200'
      case 'down': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : null

  return (
    <Card className="bg-white shadow-sm border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border ${getTrendBg()} ${getTrendColor()}`}>
            {TrendIcon && <TrendIcon className="h-3 w-3" />}
            <span className="text-xs font-semibold">
              {loading ? '...' : change}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function LineChart({ data }: any) {
  return (
    <div className="h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
      <div className="text-center space-y-2">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto" />
        <p className="text-gray-600 font-medium">Revenue Chart</p>
        <p className="text-xs text-gray-500">Interactive charts coming soon</p>
      </div>
    </div>
  )
}

function DonutChart({ data }: any) {
  return (
    <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
      <div className="text-center space-y-2">
        <CreditCard className="w-10 h-10 text-gray-400 mx-auto" />
        <p className="text-gray-600 font-medium">Invoice Statistics</p>
        <div className="flex space-x-4 text-xs">
          {data.map((item: any, index: number) => (
            <div key={index} className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}: {item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Mock data for demonstration
const mockKPIs = [
  {
    title: 'Active Clients',
    value: '24',
    change: '+12.5%',
    trend: 'up' as const,
    icon: Users,
    subtitle: 'Total active clients'
  },
  {
    title: 'Monthly Recurring Revenue',
    value: '$45,230',
    change: '+18.2%',
    trend: 'up' as const,
    icon: DollarSign,
    subtitle: 'MRR this month'
  },
  {
    title: 'Profit Margin',
    value: '68.5%',
    change: '+5.3%',
    trend: 'up' as const,
    icon: TrendingUp,
    subtitle: 'Gross profit margin'
  },
  {
    title: 'Outstanding Invoices',
    value: '8',
    change: '-15.2%',
    trend: 'down' as const,
    icon: CreditCard,
    subtitle: 'Pending payments'
  }
]

const mockRevenueData = [
  { month: 'Jan', revenue: 32000, expenses: 18000, profit: 14000 },
  { month: 'Feb', revenue: 35000, expenses: 19000, profit: 16000 },
  { month: 'Mar', revenue: 38000, expenses: 20000, profit: 18000 },
  { month: 'Apr', revenue: 42000, expenses: 22000, profit: 20000 },
  { month: 'May', revenue: 45000, expenses: 23000, profit: 22000 },
  { month: 'Jun', revenue: 48000, expenses: 24000, profit: 24000 }
]

const mockInvoiceStats = [
  { name: 'Paid', value: 65, color: '#10b981' },
  { name: 'Pending', value: 25, color: '#f59e0b' },
  { name: 'Overdue', value: 10, color: '#ef4444' }
]

const mockRecentInvoices = [
  {
    id: 'INV-001',
    client: 'BMW Company',
    amount: '$5,200',
    status: 'paid',
    dueDate: '2024-01-15',
    avatar: 'BC'
  },
  {
    id: 'INV-002',
    client: 'Samsung Company',
    amount: '$3,800',
    status: 'pending',
    dueDate: '2024-01-20',
    avatar: 'SC'
  },
  {
    id: 'INV-003',
    client: 'Tinder Company',
    amount: '$2,400',
    status: 'overdue',
    dueDate: '2024-01-10',
    avatar: 'TC'
  },
  {
    id: 'INV-004',
    client: 'Fed Ex Company',
    amount: '$4,600',
    status: 'paid',
    dueDate: '2024-01-18',
    avatar: 'FE'
  }
]

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load client data
      const { ClientManager } = await import('@/lib/managers/client-manager')
      const clientManager = ClientManager.getInstance()
      
      // Load existing Google Business Profile data
      const { BusinessProfilesStorage } = await import('@/lib/business-profiles-storage')
      const profiles = BusinessProfilesStorage.getAllProfiles()
      
      const clients = clientManager.getAllClients()
      const activeClients = clientManager.getActiveClientsCount()
      const connectedProfiles = clientManager.getGoogleBusinessConnectedCount()
      
      // Calculate KPIs
      const totalRevenue = clients.reduce((sum, client) => sum + (client.totalRevenue || 0), 0)
      const outstandingInvoices = clients.reduce((sum, client) => sum + (client.outstandingInvoices || 0), 0)
      
      setDashboardData({
        activeClients: activeClients || 0,
        totalRevenue: totalRevenue || 0,
        connectedProfiles: connectedProfiles || 0,
        outstandingInvoices: outstandingInvoices || 0,
        clients,
        profiles
      })

      console.log('[Dashboard] Loaded real data:', {
        clients: clients.length,
        activeClients,
        profiles: profiles.length,
        connectedProfiles
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      // Fallback to mock data
      setDashboardData({
        activeClients: 0,
        totalRevenue: 0,
        connectedProfiles: 0,
        outstandingInvoices: 0,
        clients: [],
        profiles: []
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Content */}
      <main className="p-4 lg:p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business.</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/clients">
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  View All Clients
                </Button>
              </Link>
              <Link href="/clients/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Client
              </Button>
              </Link>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {(dashboardData ? [
              {
                title: 'Active Clients',
                value: dashboardData.activeClients.toString(),
                change: '+12.5%',
                trend: 'up' as const,
                icon: Users,
                subtitle: 'Total active clients'
              },
              {
                title: 'Monthly Recurring Revenue',
                value: `$${dashboardData.totalRevenue.toLocaleString()}`,
                change: '+18.2%',
                trend: 'up' as const,
                icon: DollarSign,
                subtitle: 'MRR this month'
              },
              {
                title: 'Google Business Profiles',
                value: `${dashboardData.connectedProfiles}/${dashboardData.profiles.length}`,
                change: '+5.3%',
                trend: 'up' as const,
                icon: Building2,
                subtitle: 'Connected profiles'
              },
              {
                title: 'Outstanding Invoices',
                value: dashboardData.outstandingInvoices.toString(),
                change: '-15.2%',
                trend: 'down' as const,
                icon: CreditCard,
                subtitle: 'Pending payments'
              }
            ] : mockKPIs).map((kpi, index) => (
          <motion.div
                key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <KPICard {...kpi} loading={!dashboardData} />
            </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {/* Invoice Statistics Donut Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-white shadow-sm border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
                    Invoice Statistics
                  </CardTitle>
                  <CardDescription>
                    Current invoice status breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DonutChart data={mockInvoiceStats} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Monthly Revenue Line Chart */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white shadow-sm border-gray-200">
                  <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5 text-green-600" />
                    Monthly Revenue
                    </CardTitle>
                  <CardDescription>
                    Revenue, expenses, and profit over time
                  </CardDescription>
                  </CardHeader>
                  <CardContent>
                  <LineChart data={mockRevenueData} />
                  </CardContent>
                </Card>
              </motion.div>
          </div>

          {/* Recent Invoices Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                      <div>
                    <CardTitle className="text-lg font-semibold flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-purple-600" />
                      Recent Invoices
                    </CardTitle>
                    <CardDescription>
                      Latest invoice activity and payments
                    </CardDescription>
          </div>
                  <Link href="/invoices">
                    <Button variant="outline" size="sm">
                      View All
                </Button>
              </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Invoice</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Due Date</th>
                        <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockRecentInvoices.map((invoice, index) => (
                        <motion.tr
                          key={invoice.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {invoice.avatar}
              </div>
                              <span className="font-medium text-gray-900">{invoice.client}</span>
                </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm font-mono text-gray-600">{invoice.id}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-900">{invoice.amount}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getStatusColor(invoice.status)} variant="outline">
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">{invoice.dueDate}</span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
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
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
} 