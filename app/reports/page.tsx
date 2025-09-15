'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  AlertCircle,
  FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LineChart } from '@/components/Charts/LineChart'
import { DonutChart } from '@/components/Charts/DonutChart'

// Mock report data
const mockFinanceData = [
  { month: 'Jan', revenue: 32000, expenses: 18000, profit: 14000 },
  { month: 'Feb', revenue: 35000, expenses: 19000, profit: 16000 },
  { month: 'Mar', revenue: 38000, expenses: 20000, profit: 18000 },
  { month: 'Apr', revenue: 42000, expenses: 22000, profit: 20000 },
  { month: 'May', revenue: 45000, expenses: 23000, profit: 22000 },
  { month: 'Jun', revenue: 48000, expenses: 24000, profit: 24000 }
]

const mockClientRevenue = [
  { name: 'BMW Company', value: 35, color: '#3b82f6' },
  { name: 'Samsung Company', value: 25, color: '#10b981' },
  { name: 'Fed Ex Company', value: 20, color: '#f59e0b' },
  { name: 'Tesla Inc', value: 15, color: '#ef4444' },
  { name: 'Others', value: 5, color: '#8b5cf6' }
]

const mockUnpaidInvoices = [
  { id: 'INV-001', client: 'BMW Company', amount: 5200, dueDate: '2024-01-25', daysOverdue: 0 },
  { id: 'INV-002', client: 'Samsung Company', amount: 3800, dueDate: '2024-01-20', daysOverdue: 5 },
  { id: 'INV-003', client: 'Tinder Company', amount: 2400, dueDate: '2024-01-15', daysOverdue: 10 }
]

export default function ReportsPage() {
  const [mounted, setMounted] = useState(false)
  const [timeRange, setTimeRange] = useState('6m')
  const [reportType, setReportType] = useState('financial')

  useEffect(() => {
    setMounted(true)
  }, [])

  const exportReport = () => {
    const reportData = {
      type: reportType,
      timeRange,
      generatedAt: new Date().toISOString(),
      data: {
        financial: mockFinanceData,
        clientRevenue: mockClientRevenue,
        unpaidInvoices: mockUnpaidInvoices
      }
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportType}-report-${timeRange}.json`
    a.click()
    URL.revokeObjectURL(url)
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
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="mr-3 h-8 w-8 text-blue-600" />
                Reports
              </h1>
              <p className="text-gray-600 mt-1">Financial reports and business insights</p>
            </div>
            <div className="flex space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">Last Month</SelectItem>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                  <SelectItem value="6m">Last 6 Months</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportReport} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Financial Overview */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            {/* Revenue Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="bg-white shadow-sm border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                    Financial Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LineChart data={mockFinanceData} height={300} />
                </CardContent>
              </Card>
            </motion.div>

            {/* Revenue by Client */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white shadow-sm border-gray-200">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Users className="mr-2 h-5 w-5 text-blue-600" />
                    Revenue by Client
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DonutChart data={mockClientRevenue} height={250} />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Unpaid Invoices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <AlertCircle className="mr-2 h-5 w-5 text-red-600" />
                    Unpaid Invoices
                  </CardTitle>
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    ${mockUnpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()} Outstanding
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Invoice</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Client</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Due Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUnpaidInvoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <span className="font-mono text-sm text-gray-900">{invoice.id}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-900">{invoice.client}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-gray-900">${invoice.amount.toLocaleString()}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600">{invoice.dueDate}</span>
                          </td>
                          <td className="py-3 px-4">
                            {invoice.daysOverdue > 0 ? (
                              <Badge className="bg-red-100 text-red-800 border-red-200" variant="outline">
                                {invoice.daysOverdue} days overdue
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200" variant="outline">
                                Due soon
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Report Cards */}
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Google Business Setup</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Connected Profiles</span>
                    <span className="font-semibold text-gray-900">3/4</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                  <p className="text-xs text-gray-500">75% completion rate</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Ad Setup Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Pixels Installed</span>
                    <span className="font-semibold text-gray-900">2/4</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '50%' }} />
                  </div>
                  <p className="text-xs text-gray-500">50% completion rate</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Task Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="font-semibold text-gray-900">18/24</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '75%' }} />
                  </div>
                  <p className="text-xs text-gray-500">75% completion rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
