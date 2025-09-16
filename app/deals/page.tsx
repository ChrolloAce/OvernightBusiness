'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  DollarSign,
  Calendar,
  User,
  Building2,
  MoreHorizontal,
  GripVertical,
  Settings,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useClients } from '@/contexts/client-context'
import { ClientAvatar } from '@/components/client-avatar'
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
  clientId: string
  clientName: string
  probability: number
  expectedCloseDate: string
  owner: string
  stage: string
  pipelineId: string
}

// Pipeline interface
interface Pipeline {
  id: string
  name: string
  stages: PipelineStage[]
  isDefault: boolean
}

// Pipeline Stage interface
interface PipelineStage {
  id: string
  name: string
  color: string
  order: number
}

// Empty deals - start with clean slate
const initialDeals: Record<string, Deal[]> = {
  lead: [],
  qualified: [],
  proposal: [],
  negotiation: [],
  closed_won: [],
  closed_lost: []
}


// Sortable Deal Card Component with Inline Editing
function SortableDealCard({ deal, isDragging, clients, onUpdateDeal }: { 
  deal: Deal; 
  isDragging?: boolean;
  clients: any[];
  onUpdateDeal: (dealId: string, updates: Partial<Deal>) => void;
}) {
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  
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

  const handleFieldEdit = (field: string, currentValue: string | number) => {
    setEditingField(field)
    setEditValue(String(currentValue))
  }

  const handleFieldSave = () => {
    if (editingField && editValue !== undefined) {
      let value: any = editValue
      
      // Convert value based on field type
      if (editingField === 'value' || editingField === 'probability') {
        value = parseFloat(editValue) || 0
      }
      
      onUpdateDeal(deal.id, { [editingField]: value })
      setEditingField(null)
      setEditValue('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFieldSave()
    } else if (e.key === 'Escape') {
      setEditingField(null)
      setEditValue('')
    }
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
      className="shadow-sm hover:shadow-md transition-shadow"
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Deal Title - Editable */}
          <div className="flex items-start justify-between">
            {editingField === 'title' ? (
              <Input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleFieldSave}
                autoFocus
                className="h-7 text-sm font-semibold border-blue-200 focus:border-blue-400"
              />
            ) : (
              <h4 
                className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1 cursor-pointer hover:text-blue-600 p-1 rounded hover:bg-blue-50 transition-colors"
                onClick={() => handleFieldEdit('title', deal.title)}
              >
                {deal.title}
              </h4>
            )}
            <div className="flex items-center space-x-1 ml-2">
              <div
                {...listeners}
                {...attributes}
                className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Client Assignment - Dropdown */}
          <div className="flex items-center space-x-2">
            {editingField === 'client' ? (
              <Select 
                value={deal.clientId} 
                onValueChange={(value) => {
                  const selectedClient = clients.find(c => c.id === value)
                  if (selectedClient) {
                    onUpdateDeal(deal.id, { 
                      clientId: value, 
                      clientName: selectedClient.name 
                    })
                  }
                  setEditingField(null)
                }}
                open={true}
              >
                <SelectTrigger className="h-6 text-xs border-blue-200 focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      <div className="flex items-center space-x-2">
                        <ClientAvatar 
                          clientName={client.name}
                          googleBusinessProfile={client.googleBusinessProfile}
                          size="sm"
                        />
                        <span>{client.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors w-full"
                onClick={() => setEditingField('client')}
              >
                <ClientAvatar 
                  clientName={deal.clientName}
                  googleBusinessProfile={clients.find(c => c.id === deal.clientId)?.googleBusinessProfile}
                  size="sm"
                />
                <span className="text-xs text-gray-600 truncate">{deal.clientName}</span>
              </div>
            )}
          </div>

          {/* Value and Probability */}
          <div className="flex items-center justify-between">
            {editingField === 'value' ? (
              <Input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleFieldSave}
                autoFocus
                className="h-6 text-sm font-bold text-green-600 border-blue-200 focus:border-blue-400 w-20"
              />
            ) : (
              <span 
                className="font-bold text-green-600 text-sm cursor-pointer hover:bg-green-50 p-1 rounded transition-colors"
                onClick={() => handleFieldEdit('value', deal.value)}
              >
                ${deal.value.toLocaleString()}
              </span>
            )}
            
            {editingField === 'probability' ? (
              <Input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleFieldSave}
                autoFocus
                className="h-6 text-xs border-blue-200 focus:border-blue-400 w-16"
                min="0"
                max="100"
              />
            ) : (
              <Badge 
                variant="outline" 
                className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handleFieldEdit('probability', deal.probability)}
              >
                {deal.probability}%
              </Badge>
            )}
          </div>

          {/* Owner and Date */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              {editingField === 'owner' ? (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleFieldSave}
                  autoFocus
                  className="h-5 text-xs border-blue-200 focus:border-blue-400 w-20"
                />
              ) : (
                <span 
                  className="truncate cursor-pointer hover:text-gray-700 transition-colors"
                  onClick={() => handleFieldEdit('owner', deal.owner)}
                >
                  {deal.owner}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              {editingField === 'expectedCloseDate' ? (
                <Input
                  type="date"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleFieldSave}
                  autoFocus
                  className="h-5 text-xs border-blue-200 focus:border-blue-400 w-24"
                />
              ) : (
                <span 
                  className="cursor-pointer hover:text-gray-700 transition-colors"
                  onClick={() => handleFieldEdit('expectedCloseDate', deal.expectedCloseDate)}
                >
                  {new Date(deal.expectedCloseDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Drag Overlay Component
function DealCardOverlay({ deal }: { deal: Deal }) {
  const { clients } = useClients()
  
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
              <ClientAvatar 
                clientName={deal.clientName}
                googleBusinessProfile={clients.find(c => c.id === deal.clientId)?.googleBusinessProfile}
                size="sm"
              />
              <span className="text-xs text-gray-600 truncate">{deal.clientName}</span>
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
  const [pipelines, setPipelines] = useState<Pipeline[]>([
    {
      id: 'default',
      name: 'Sales Pipeline',
      isDefault: true,
      stages: [
        { id: 'lead', name: 'Lead', color: 'bg-gray-50 border-gray-200', order: 1 },
        { id: 'qualified', name: 'Qualified', color: 'bg-blue-50 border-blue-200', order: 2 },
        { id: 'proposal', name: 'Proposal', color: 'bg-purple-50 border-purple-200', order: 3 },
        { id: 'negotiation', name: 'Negotiation', color: 'bg-orange-50 border-orange-200', order: 4 },
        { id: 'closed_won', name: 'Closed Won', color: 'bg-green-50 border-green-200', order: 5 },
        { id: 'closed_lost', name: 'Closed Lost', color: 'bg-red-50 border-red-200', order: 6 }
      ]
    }
  ])
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline>(pipelines[0])
  const [showPipelineSettings, setShowPipelineSettings] = useState(false)
  const { clients } = useClients()

  // Use stages from selected pipeline
  const stageConfig = selectedPipeline.stages.map(stage => ({
    key: stage.id,
    title: stage.name,
    color: stage.color,
    textColor: stage.color.includes('gray') ? 'text-gray-700' :
              stage.color.includes('blue') ? 'text-blue-700' :
              stage.color.includes('purple') ? 'text-purple-700' :
              stage.color.includes('orange') ? 'text-orange-700' :
              stage.color.includes('green') ? 'text-green-700' :
              stage.color.includes('red') ? 'text-red-700' : 'text-gray-700'
  }))

  const handleCreateDeal = (stageId?: string) => {
    if (clients.length === 0) {
      alert('Please create a client first before adding deals')
      return
    }

    const targetStage = stageId || selectedPipeline.stages[0].id

    const newDeal: Deal = {
      id: `deal_${Date.now()}`,
      title: 'Untitled Deal',
      value: 0,
      clientId: clients[0].id,
      clientName: clients[0].name,
      probability: 50,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      owner: 'Unassigned',
      stage: targetStage,
      pipelineId: selectedPipeline.id
    }

    setDeals(prev => ({
      ...prev,
      [targetStage]: [...(prev[targetStage] || []), newDeal]
    }))

    console.log('Deal created in stage:', targetStage)
  }

  const handleCreatePipeline = () => {
    const newPipeline: Pipeline = {
      id: `pipeline_${Date.now()}`,
      name: 'New Pipeline',
      isDefault: false,
      stages: [
        { id: 'stage1', name: 'Stage 1', color: 'bg-gray-50 border-gray-200', order: 1 },
        { id: 'stage2', name: 'Stage 2', color: 'bg-blue-50 border-blue-200', order: 2 },
        { id: 'stage3', name: 'Stage 3', color: 'bg-green-50 border-green-200', order: 3 }
      ]
    }

    setPipelines(prev => [...prev, newPipeline])
    setSelectedPipeline(newPipeline)
    console.log('Pipeline created:', newPipeline.name)
  }

  const handleUpdateDeal = (dealId: string, updates: Partial<Deal>) => {
    setDeals(prev => {
      const newDeals = { ...prev }
      
      // Find the deal in all stages
      for (const stageKey in newDeals) {
        const dealIndex = newDeals[stageKey].findIndex(d => d.id === dealId)
        if (dealIndex >= 0) {
          newDeals[stageKey][dealIndex] = { ...newDeals[stageKey][dealIndex], ...updates }
          break
        }
      }
      
      return newDeals
    })
  }

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
                <Building2 className="mr-3 h-8 w-8 text-blue-600" />
                Deals & Pipelines
              </h1>
              <p className="text-gray-600 mt-1">Manage sales pipelines and track deals across all clients</p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleCreateDeal()}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Deal
            </Button>
          </div>

          {/* Pipeline Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={selectedPipeline.id} onValueChange={(value) => {
                const pipeline = pipelines.find(p => p.id === value)
                if (pipeline) setSelectedPipeline(pipeline)
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pipelines.map((pipeline) => (
                    <SelectItem key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPipelineSettings(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Manage Pipelines
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCreatePipeline}
              >
                <Plus className="mr-2 h-4 w-4" />
                New Pipeline
              </Button>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => handleCreateDeal()}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Deal
            </Button>
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
                                  clients={clients}
                                  onUpdateDeal={handleUpdateDeal}
                                />
                              ))}
                            </div>
                          </SortableContext>

                          <div 
                            className="w-full mt-4 p-2 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer text-center"
                            onClick={() => handleCreateDeal(stage.key)}
                          >
                            <div className="flex items-center justify-center space-x-2 text-gray-500 hover:text-blue-600">
                              <Plus className="h-4 w-4" />
                              <span className="text-sm">Add deal</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </article>
                  )
                })}
              </div>

              {/* Drag Overlay Portal */}
              <DragOverlay>
                {activeId && activeDeal ? (
                  <div className="pointer-events-none">
                    <SortableDealCard 
                      deal={activeDeal} 
                      isDragging={true}
                      clients={clients}
                      onUpdateDeal={() => {}} // No-op during drag
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </section>
        </motion.div>
      </main>
    </div>
  )
}