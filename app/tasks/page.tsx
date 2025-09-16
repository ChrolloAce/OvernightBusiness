'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Building2,
  ArrowUpDown,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTasks } from '@/contexts/task-context'
import { useClients } from '@/contexts/client-context'

export default function TasksPage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [clientFilter, setClientFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [editingCell, setEditingCell] = useState<{taskId: string, field: string} | null>(null)
  const [editValue, setEditValue] = useState('')
  const { tasks, loadTasks, getTaskStats, deleteTask, updateTask, createTask } = useTasks()
  const { clients } = useClients()

  useEffect(() => {
    setMounted(true)
    loadTasks()
  }, [])

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleCellEdit = (taskId: string, field: string, currentValue: string) => {
    setEditingCell({ taskId, field })
    setEditValue(currentValue || '')
  }

  const handleCellSave = () => {
    if (editingCell) {
      updateTask(editingCell.taskId, { [editingCell.field]: editValue })
      setEditingCell(null)
      setEditValue('')
    }
  }

  const handleCreateTask = () => {
    if (clients.length === 0) {
      alert('Please create a client first before adding tasks')
      return
    }
    
    // Create a new task instantly with default values
    const newTask = createTask({
      title: 'Untitled Task',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: 'Unassigned',
      clientId: clients[0].id, // Default to first client
      clientName: clients[0].name,
      tags: []
    })
    
    // Immediately start editing the title
    setTimeout(() => {
      setEditingCell({ taskId: newTask.id, field: 'title' })
      setEditValue('Untitled Task')
    }, 100)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'todo': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />
      case 'todo': return <Calendar className="h-4 w-4 text-gray-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const isOverdue = (task: any) => {
    return task.dueDate && new Date(task.dueDate) < new Date() && !['completed', 'cancelled'].includes(task.status)
  }

  // Filter and sort tasks
  const filteredAndSortedTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (task.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.assignee.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
      const matchesClient = clientFilter === 'all' || task.clientId === clientFilter
      
      return matchesSearch && matchesStatus && matchesPriority && matchesClient
    })
    .sort((a, b) => {
      let aValue: any = ''
      let bValue: any = ''
      
      switch (sortBy) {
        case 'title':
          aValue = a.title
          bValue = b.title
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 }
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder]
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder]
          break
        case 'dueDate':
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : 0
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : 0
          break
        case 'client':
          aValue = a.clientName
          bValue = b.clientName
          break
        case 'assignee':
          aValue = a.assignee
          bValue = b.assignee
          break
        default:
          aValue = a.title
          bValue = b.title
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const taskStats = getTaskStats()

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
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
                <p className="text-sm text-gray-500">{filteredAndSortedTasks.length} tasks</p>
              </div>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 shadow-sm"
              onClick={handleCreateTask}
            >
              <Plus className="mr-2 h-4 w-4" />
              New
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              <span className="text-sm text-gray-600">{taskStats.todo} To Do</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">{taskStats.inProgress} In Progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">{taskStats.completed} Completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-gray-600">{taskStats.overdue} Overdue</span>
            </div>
          </div>
        </div>

        {/* Notion-like Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 border-0 bg-white shadow-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32 border-0 bg-white shadow-sm">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32 border-0 bg-white shadow-sm">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-40 border-0 bg-white shadow-sm">
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Notion-like Database Table */}
        <div className="px-6">
          {filteredAndSortedTasks.length === 0 ? (
            <div className="py-20 text-center">
              <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {tasks.length === 0 ? 'No tasks yet' : 'No tasks match your filters'}
              </h3>
              <p className="text-gray-500 mb-6">
                {tasks.length === 0 
                  ? 'Create your first task to get started'
                  : 'Try adjusting your search or filters'}
              </p>
              {tasks.length === 0 && (
                <Button 
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleCreateTask}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              )}
            </div>
          ) : (
            <div className="notion-table">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 py-3 px-4 border-b border-gray-100 bg-gray-50/30 sticky top-0">
                <button 
                  className="col-span-3 flex items-center space-x-1 text-left text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('title')}
                >
                  <span>Task</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
                <button 
                  className="col-span-1 flex items-center space-x-1 text-left text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <span>Status</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
                <button 
                  className="col-span-1 flex items-center space-x-1 text-left text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('priority')}
                >
                  <span>Priority</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
                <button 
                  className="col-span-2 flex items-center space-x-1 text-left text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('assignee')}
                >
                  <span>Assignee</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
                <button 
                  className="col-span-2 flex items-center space-x-1 text-left text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('client')}
                >
                  <span>Client</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
                <button 
                  className="col-span-2 flex items-center space-x-1 text-left text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => handleSort('dueDate')}
                >
                  <span>Due Date</span>
                  <ArrowUpDown className="h-3 w-3" />
                </button>
                <div className="col-span-1 text-sm font-medium text-gray-600 text-center">Actions</div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-100">
                {filteredAndSortedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="grid grid-cols-12 gap-4 py-3 px-4 hover:bg-gray-50/50 transition-colors group"
                  >
                    {/* Task Column */}
                    <div className="col-span-3 flex items-center space-x-2">
                      {getStatusIcon(task.status)}
                      <div className="min-w-0 flex-1">
                        {editingCell?.taskId === task.id && editingCell?.field === 'title' ? (
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
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 cursor-pointer p-1 rounded hover:bg-blue-50 transition-colors truncate"
                            onClick={() => handleCellEdit(task.id, 'title', task.title)}
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        )}
                        {task.description && (
                          <p className="text-xs text-gray-500 truncate mt-1" title={task.description}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Column - Dropdown */}
                    <div className="col-span-1 flex items-center">
                      {editingCell?.taskId === task.id && editingCell?.field === 'status' ? (
                        <Select 
                          value={editValue} 
                          onValueChange={(value) => {
                            updateTask(task.id, { status: value as any })
                            setEditingCell(null)
                          }}
                        >
                          <SelectTrigger className="h-8 text-sm border-blue-200 focus:border-blue-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge 
                          className={`${getStatusColor(task.status)} cursor-pointer hover:opacity-80 transition-opacity`}
                          variant="outline"
                          onClick={() => {
                            setEditingCell({ taskId: task.id, field: 'status' })
                            setEditValue(task.status)
                          }}
                        >
                          {task.status.replace('_', ' ')}
                        </Badge>
                      )}
                    </div>

                    {/* Priority Column - Dropdown */}
                    <div className="col-span-1 flex items-center">
                      {editingCell?.taskId === task.id && editingCell?.field === 'priority' ? (
                        <Select 
                          value={editValue} 
                          onValueChange={(value) => {
                            updateTask(task.id, { priority: value as any })
                            setEditingCell(null)
                          }}
                        >
                          <SelectTrigger className="h-8 text-sm border-blue-200 focus:border-blue-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge 
                          className={`${getPriorityColor(task.priority)} cursor-pointer hover:opacity-80 transition-opacity`}
                          variant="outline"
                          onClick={() => {
                            setEditingCell({ taskId: task.id, field: 'priority' })
                            setEditValue(task.priority)
                          }}
                        >
                          {task.priority}
                        </Badge>
                      )}
                    </div>

                    {/* Assignee Column - Inline Editable */}
                    <div className="col-span-2 flex items-center">
                      {editingCell?.taskId === task.id && editingCell?.field === 'assignee' ? (
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
                          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer p-1 rounded hover:bg-gray-100 transition-colors w-full"
                          onClick={() => handleCellEdit(task.id, 'assignee', task.assignee)}
                        >
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{task.assignee}</span>
                        </div>
                      )}
                    </div>

                    {/* Client Column - Dropdown */}
                    <div className="col-span-2 flex items-center">
                      {editingCell?.taskId === task.id && editingCell?.field === 'client' ? (
                        <Select 
                          value={editValue} 
                          onValueChange={(value) => {
                            const selectedClient = clients.find(c => c.id === value)
                            if (selectedClient) {
                              updateTask(task.id, { 
                                clientId: value, 
                                clientName: selectedClient.name 
                              })
                            }
                            setEditingCell(null)
                          }}
                        >
                          <SelectTrigger className="h-8 text-sm border-blue-200 focus:border-blue-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                <div className="flex items-center space-x-2">
                                  <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center text-white text-xs">
                                    {client.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                                  </div>
                                  <span>{client.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div 
                          className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-gray-100 transition-colors w-full"
                          onClick={() => {
                            setEditingCell({ taskId: task.id, field: 'client' })
                            setEditValue(task.clientId)
                          }}
                        >
                          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xs font-medium">
                            {task.clientName.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <span className="text-sm text-gray-700 truncate">{task.clientName}</span>
                        </div>
                      )}
                    </div>

                    {/* Due Date Column - Inline Editable */}
                    <div className="col-span-2 flex items-center">
                      {editingCell?.taskId === task.id && editingCell?.field === 'dueDate' ? (
                        <Input
                          type="date"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onBlur={handleCellSave}
                          autoFocus
                          className="h-8 text-sm border-blue-200 focus:border-blue-400"
                        />
                      ) : (
                        <div 
                          className={`text-sm cursor-pointer p-1 rounded hover:bg-gray-100 transition-colors w-full ${
                            isOverdue(task) ? 'text-red-600 font-medium' : 'text-gray-600'
                          }`}
                          onClick={() => handleCellEdit(task.id, 'dueDate', task.dueDate || '')}
                        >
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Add date...'}
                        </div>
                      )}
                    </div>

                    {/* Actions Column */}
                    <div className="col-span-1 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm(`Delete "${task.title}"?`)) {
                              deleteTask(task.id)
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
                onClick={handleCreateTask}
              >
                <div className="col-span-12 flex items-center space-x-2 text-gray-500 hover:text-blue-600">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm">New task</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
