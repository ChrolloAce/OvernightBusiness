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
  Target,
  GripVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Deal interface
interface Deal {
  id: string
  title: string
  value: number
  client: string
  clientAvatar: string
  probability: number
  expectedCloseDate: string
  owner: string
  stage: string
}

// Mock deals data organized by stage
const initialDeals: Record<string, Deal[]> = {
  lead: [
    {
      id: '1',
      title: 'BMW Digital Marketing Package',
      value: 15000,
      client: 'BMW Company',
      clientAvatar: 'BC',
      probability: 80,
      expectedCloseDate: '2024-02-15',
      owner: 'John Doe',
      stage: 'lead'
    },
    {
      id: '2',
      title: 'Samsung Website Redesign',
      value: 25000,
      client: 'Samsung Company',
      clientAvatar: 'SC',
      probability: 60,
      expectedCloseDate: '2024-03-01',
      owner: 'Jane Smith',
      stage: 'lead'
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
      owner: 'Mike Johnson',
      stage: 'qualified'
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
      owner: 'Sarah Wilson',
      stage: 'proposal'
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
      owner: 'John Doe',
      stage: 'closed_won'
    }
  ],
  closed_lost: []
}

const stageConfig = [
  { key: 'lead', title: 'Lead', color: 'bg-gray-50 border-gray-200', textColor: 'text-gray-700' },
  { key: 'qualified', title: 'Qualified', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700' },
  { key: 'proposal', title: 'Proposal', color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700' },
  { key: 'negotiation', title: 'Negotiation', color: 'bg-orange-50 border-orange-200', textColor: 'text-orange-700' },
  { key: 'closed_won', title: 'Closed Won', color: 'bg-green-50 border-green-200', textColor: 'text-green-700' },
  { key: 'closed_lost', title: 'Closed Lost', color: 'bg-red-50 border-red-200', textColor: 'text-red-700' }
]

// Sortable Deal Card Component
function SortableDealCard({ deal, isDragging }: { deal: Deal; isDragging?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging
  } = useSortable({ id: deal.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1
  }

  if (isDragging) {
    return (
      <div className="h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg" />
    )
  }

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      {...attributes}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
              {deal.title}
            </h4>
            <div className="flex items-center space-x-1 ml-2">
              <div
                {...listeners}
                className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-3 w-3 text-gray-400" />
              </div>
              <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {deal.clientAvatar}
            </div>
            <span className="text-xs text-gray-600 truncate">{deal.client}</span>
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
              <span className="truncate">{deal.owner}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Drag Overlay Component
function DealCardOverlay({ deal }: { deal: Deal }) {
  return (
    <div className="pointer-events-none">
      <Card className="shadow-xl ring-1 ring-black/5 scale-[1.02] origin-center w-[320px]">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1">
                {deal.title}
              </h4>
              <div className="flex items-center space-x-1 ml-2">
                <GripVertical className="h-3 w-3 text-gray-400" />
                <MoreHorizontal className="h-3 w-3 text-gray-400" />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {deal.clientAvatar}
              </div>
              <span className="text-xs text-gray-600 truncate">{deal.client}</span>
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
                <span className="truncate">{deal.owner}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(deal.expectedCloseDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DealsPage() {
  const [mounted, setMounted] = useState(false)
  const [deals, setDeals] = useState(initialDeals)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  const getTotalValue = (stageDeals: Deal[]) => {
    return stageDeals.reduce((sum, deal) => sum + deal.value, 0)
  }

  const getAllDeals = (): Deal[] => {
    return Object.values(deals).flat()
  }

  const findDealById = (id: string): Deal | null => {
    const allDeals = getAllDeals()
    return allDeals.find(deal => deal.id === id) || null
  }

  const findStageByDealId = (id: string): string | null => {
    for (const [stage, stageDeals] of Object.entries(deals)) {
      if (stageDeals.find(deal => deal.id === id)) {
        return stage
      }
    }
    return null
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const deal = findDealById(active.id as string)
    
    setActiveId(active.id as string)
    setActiveDeal(deal)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the stages
    const activeStage = findStageByDealId(activeId)
    const overStage = stageConfig.find(stage => stage.key === overId)?.key || findStageByDealId(overId)

    if (!activeStage || !overStage || activeStage === overStage) return

    setDeals(prev => {
      const activeDeals = [...prev[activeStage]]
      const overDeals = [...prev[overStage]]

      // Find the active deal
      const activeDealIndex = activeDeals.findIndex(deal => deal.id === activeId)
      const activeDeal = activeDeals[activeDealIndex]

      if (!activeDeal) return prev

      // Remove from active stage
      activeDeals.splice(activeDealIndex, 1)

      // Add to over stage
      const updatedDeal = { ...activeDeal, stage: overStage }
      overDeals.push(updatedDeal)

      return {
        ...prev,
        [activeStage]: activeDeals,
        [overStage]: overDeals
      }
    })
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    setActiveDeal(null)
  }

  if (!mounted) {
    return <div className="min-h-screen bg-gray-50" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="p-4 lg:p-6 max-w-7xl mx-auto overflow-y-visible">
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

          {/* Metrics Row - 5 tiles with responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-white shadow-sm border-gray-200 h-full">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Pipeline</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${getAllDeals().reduce((sum, deal) => sum + deal.value, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-gray-200 h-full">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Weighted Pipeline</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${getAllDeals().reduce((sum, deal) => sum + (deal.value * deal.probability / 100), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-gray-200 h-full">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${Math.round(getAllDeals().reduce((sum, deal) => sum + deal.value, 0) / getAllDeals().length).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-gray-200 h-full">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${getTotalValue(deals.closed_won).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm border-gray-200 h-full">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-50 rounded-lg">
                    <Building2 className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Win Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round((deals.closed_won.length / getAllDeals().length) * 100)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Kanban Board */}
          <section className="relative" aria-label="Sales Pipeline">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="flex gap-6 overflow-x-auto overflow-y-visible pb-6" role="list">
                {stageConfig.map((stage) => {
                  const stageDeals = deals[stage.key] || []
                  return (
                    <article
                      key={stage.key}
                      role="listitem"
                      className="min-w-[320px] max-w-[360px] flex-shrink-0"
                    >
                      <Card className={`h-full ${stage.color} border-2`}>
                        <CardHeader className="sticky top-0 z-10 bg-white/80 backdrop-blur p-4 border-b">
                          <CardTitle className={`text-sm font-semibold ${stage.textColor} flex items-center justify-between`}>
                            <span>{stage.title}</span>
                            <Badge variant="secondary" className="text-xs">
                              {stageDeals.length}
                            </Badge>
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            ${getTotalValue(stageDeals).toLocaleString()}
                          </p>
                        </CardHeader>

                        <CardContent className="p-4">
                          <SortableContext items={stageDeals.map(deal => deal.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-3">
                              {stageDeals.map((deal) => (
                                <SortableDealCard
                                  key={deal.id}
                                  deal={deal}
                                  isDragging={activeId === deal.id}
                                />
                              ))}
                            </div>
                          </SortableContext>

                          <Button 
                            variant="outline" 
                            className="w-full mt-4 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Deal
                          </Button>
                        </CardContent>
                      </Card>
                    </article>
                  )
                })}
              </div>

              {/* Drag Overlay Portal */}
              <DragOverlay>
                {activeId && activeDeal ? (
                  <DealCardOverlay deal={activeDeal} />
                ) : null}
              </DragOverlay>
            </DndContext>
          </section>
        </motion.div>
      </main>
    </div>
  )
}