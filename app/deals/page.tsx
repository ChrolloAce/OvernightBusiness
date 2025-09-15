'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Star, 
  Plus, 
  DollarSign,
  Calendar,
  User,
  Building2,
  MoreHorizontal,
  TrendingUp,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// Mock deals data
const mockDeals = {
  lead: [
    {
      id: '1',
      title: 'BMW Digital Marketing Package',
      value: 15000,
      client: 'BMW Company',
      clientAvatar: 'BC',
      probability: 80,
      expectedCloseDate: '2024-02-15',
      owner: 'John Doe'
    },
    {
      id: '2',
      title: 'Samsung Website Redesign',
      value: 25000,
      client: 'Samsung Company',
      clientAvatar: 'SC',
      probability: 60,
      expectedCloseDate: '2024-03-01',
      owner: 'Jane Smith'
    }
  ],
  qualified: [
    {
      id: '3',
      title: 'Tinder App Store Optimization',
      value: 8000,
      client: 'Tinder Company',
      clientAvatar: 'TC',
      probability: 90,
      expectedCloseDate: '2024-02-28',
      owner: 'Mike Johnson'
    }
  ],
  proposal: [
    {
      id: '4',
      title: 'FedEx Logistics Platform',
      value: 45000,
      client: 'Fed Ex Company',
      clientAvatar: 'FE',
      probability: 75,
      expectedCloseDate: '2024-04-15',
      owner: 'Sarah Wilson'
    }
  ],
  negotiation: [],
  closed_won: [
    {
      id: '5',
      title: 'Tesla Social Media Management',
      value: 12000,
      client: 'Tesla Inc',
      clientAvatar: 'TI',
      probability: 100,
      expectedCloseDate: '2024-01-15',
      owner: 'John Doe'
    }
  ],
  closed_lost: []
}

const stageConfig = [
  { key: 'lead', title: 'Lead', color: 'bg-gray-100 border-gray-300', textColor: 'text-gray-700' },
  { key: 'qualified', title: 'Qualified', color: 'bg-blue-100 border-blue-300', textColor: 'text-blue-700' },
  { key: 'proposal', title: 'Proposal', color: 'bg-purple-100 border-purple-300', textColor: 'text-purple-700' },
  { key: 'negotiation', title: 'Negotiation', color: 'bg-orange-100 border-orange-300', textColor: 'text-orange-700' },
  { key: 'closed_won', title: 'Closed Won', color: 'bg-green-100 border-green-300', textColor: 'text-green-700' },
  { key: 'closed_lost', title: 'Closed Lost', color: 'bg-red-100 border-red-300', textColor: 'text-red-700' }
]

export default function DealsPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getTotalValue = (deals: any[]) => {
    return deals.reduce((sum, deal) => sum + deal.value, 0)
  }

  const getWeightedValue = (deals: any[]) => {
    return deals.reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0)
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
                <Star className="mr-3 h-8 w-8 text-blue-600" />
                Sales Pipeline
              </h1>
              <p className="text-gray-600 mt-1">Track deals and opportunities across all clients</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New Deal
            </Button>
          </div>

          {/* Pipeline Stats */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white shadow-sm border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Pipeline</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${Object.values(mockDeals).flat().reduce((sum: number, deal: any) => sum + deal.value, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Weighted Pipeline</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${Object.values(mockDeals).flat().reduce((sum: number, deal: any) => sum + (deal.value * deal.probability / 100), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${Math.round(Object.values(mockDeals).flat().reduce((sum: number, deal: any) => sum + deal.value, 0) / Object.values(mockDeals).flat().length).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${getTotalValue(mockDeals.closed_won).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kanban Board */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-6 overflow-x-auto">
            {stageConfig.map((stage) => {
              const stageDeals = (mockDeals as any)[stage.key] || []
              return (
                <motion.div
                  key={stage.key}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: stageConfig.indexOf(stage) * 0.1 }}
                  className="min-w-[280px]"
                >
                  <Card className={`${stage.color} border-2`}>
                    <CardHeader className="pb-3">
                      <CardTitle className={`text-sm font-semibold ${stage.textColor} flex items-center justify-between`}>
                        <span>{stage.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {stageDeals.length}
                        </Badge>
                      </CardTitle>
                      <p className="text-xs text-gray-600">
                        ${getTotalValue(stageDeals).toLocaleString()}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {stageDeals.map((deal: any) => (
                        <Card key={deal.id} className="bg-white shadow-sm border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                                  {deal.title}
                                </h4>
                                <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                  {deal.clientAvatar}
                                </div>
                                <span className="text-xs text-gray-600">{deal.client}</span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="font-bold text-green-600 text-sm">
                                  ${deal.value.toLocaleString()}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {deal.probability}%
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center space-x-1">
                                  <User className="h-3 w-3" />
                                  <span>{deal.owner}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {/* Add Deal Button */}
                      <Button 
                        variant="ghost" 
                        className="w-full border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Deal
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </main>
    </div>
  )
}
