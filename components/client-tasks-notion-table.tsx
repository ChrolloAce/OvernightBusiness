'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Plus, 
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  ArrowUpDown,
  MoreHorizontal,
  Trash2,
  Edit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useTasks } from '@/contexts/task-context'
import { useClients } from '@/contexts/client-context'
import { ClientAvatar } from '@/components/client-avatar'

interface ClientTasksNotionTableProps {
  clientId: string
  clientName: string
}

export function ClientTasksNotionTable({ clientId, clientName }: ClientTasksNotionTableProps) {
  const [mounted, setMounted] = useState(false)
  const [sortBy, setSortBy] = useState('dueDate')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [editingCell, setEditingCell] = useState<{taskId: string, field: string} | null>(null)
  const [editValue, setEditValue] = useState('')
  
  const { tasks, createTask, updateTask, deleteTask } = useTasks()
  const { clients } = useClients()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter tasks for this specific client
  const clientTasks = tasks.filter(task => task.clientId === clientId)

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
    setEditValue(currentValue)
  }

  const handleCellSave = () => {
    if (!editingCell) return
    
    const task = tasks.find(t => t.id === editingCell.taskId)
    if (task) {
      updateTask(editingCell.taskId, {
        ...task,
        [editingCell.field]: editValue
      })
    }
    setEditingCell(null)
    setEditValue('')
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

  const handleCreateTask = () => {
    const newTask = {
      title: 'New Task',
      assignee: 'Unassigned',
      status: 'todo' as const,
      priority: 'medium' as const,
      clientId: clientId,
      clientName: clientName,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      tags: [] as string[]
    }
    createTask(newTask)
  }

  const handleStatusChange = (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      updateTask(taskId, { ...task, status: newStatus as any })
    }
  }

  const handlePriorityChange = (taskId: string, newPriority: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      updateTask(taskId, { ...task, priority: newPriority as any })
    }
  }

  const sortedTasks = [...clientTasks].sort((a, b) => {
    let aValue = a[sortBy as keyof typeof a] || ''
    let bValue = b[sortBy as keyof typeof b] || ''
    
    if (typeof aValue === 'string') aValue = aValue.toLowerCase()
    if (typeof bValue === 'string') bValue = bValue.toLowerCase()
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (!mounted) return null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Tasks for {clientName}</h2>
          <p className="text-gray-600">{clientTasks.length} tasks assigned to this client</p>
        </div>
        <Button 
          onClick={handleCreateTask}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Notion-style Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Header Row */}
            <div className="bg-gray-50 border-b border-gray-200 flex text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div 
                className="flex-1 min-w-[300px] px-4 py-3 cursor-pointer hover:bg-gray-100 flex items-center space-x-1 border-r border-gray-200"
                onClick={() => handleSort('title')}
              >
                <span>Task</span>
                <ArrowUpDown className="h-3 w-3" />
              </div>
              <div className="w-32 px-4 py-3 cursor-pointer hover:bg-gray-100 flex items-center space-x-1 border-r border-gray-200">
                <span>Status</span>
                <ArrowUpDown className="h-3 w-3" />
              </div>
              <div className="w-32 px-4 py-3 cursor-pointer hover:bg-gray-100 flex items-center space-x-1 border-r border-gray-200">
                <span>Priority</span>
                <ArrowUpDown className="h-3 w-3" />
              </div>
              <div 
                className="w-40 px-4 py-3 cursor-pointer hover:bg-gray-100 flex items-center space-x-1 border-r border-gray-200"
                onClick={() => handleSort('assignee')}
              >
                <span>Assignee</span>
                <ArrowUpDown className="h-3 w-3" />
              </div>
              <div 
                className="w-32 px-4 py-3 cursor-pointer hover:bg-gray-100 flex items-center space-x-1 border-r border-gray-200"
                onClick={() => handleSort('dueDate')}
              >
                <span>Due Date</span>
                <ArrowUpDown className="h-3 w-3" />
              </div>
              <div className="w-20 px-4 py-3">Actions</div>
            </div>

            {/* Task Rows */}
            <div className="divide-y divide-gray-200">
              {sortedTasks.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks yet</h3>
                  <p className="text-gray-600 mb-4">Create your first task for this client</p>
                  <Button 
                    onClick={handleCreateTask}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Task
                  </Button>
                </div>
              ) : (
                sortedTasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex hover:bg-gray-50/50 transition-colors group"
                  >
                    {/* Task Title */}
                    <div className="flex-1 min-w-[300px] px-4 py-3 border-r border-gray-200">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(task.status)}
                        <div className="min-w-0 flex-1">
                          {editingCell?.taskId === task.id && editingCell?.field === 'title' ? (
                            <Input
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyPress}
                              onBlur={handleCellSave}
                              autoFocus
                              className="h-8 text-sm border-blue-200 focus:border-blue-400 w-full"
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
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="w-32 px-4 py-3 border-r border-gray-200">
                      <Badge 
                        className={`${getStatusColor(task.status)} cursor-pointer hover:opacity-80 transition-opacity w-full justify-center`}
                        variant="outline"
                        onClick={() => handleStatusChange(task.id, task.status === 'completed' ? 'todo' : 'completed')}
                      >
                        {task.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Priority */}
                    <div className="w-32 px-4 py-3 border-r border-gray-200">
                      <Badge 
                        className={`${getPriorityColor(task.priority)} cursor-pointer hover:opacity-80 transition-opacity w-full justify-center`}
                        variant="outline"
                        onClick={() => {
                          const priorities = ['low', 'medium', 'high', 'urgent']
                          const currentIndex = priorities.indexOf(task.priority)
                          const nextPriority = priorities[(currentIndex + 1) % priorities.length]
                          handlePriorityChange(task.id, nextPriority)
                        }}
                      >
                        {task.priority}
                      </Badge>
                    </div>

                    {/* Assignee */}
                    <div className="w-40 px-4 py-3 border-r border-gray-200">
                      {editingCell?.taskId === task.id && editingCell?.field === 'assignee' ? (
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onBlur={handleCellSave}
                          autoFocus
                          className="h-8 text-sm border-blue-200 focus:border-blue-400 w-full"
                        />
                      ) : (
                        <div 
                          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer p-1 rounded hover:bg-gray-100 transition-colors w-full"
                          onClick={() => handleCellEdit(task.id, 'assignee', task.assignee)}
                          title={task.assignee}
                        >
                          <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className="truncate">{task.assignee}</span>
                        </div>
                      )}
                    </div>

                    {/* Due Date */}
                    <div className="w-32 px-4 py-3 border-r border-gray-200">
                      {editingCell?.taskId === task.id && editingCell?.field === 'dueDate' ? (
                        <Input
                          type="date"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onBlur={handleCellSave}
                          autoFocus
                          className="h-8 text-sm border-blue-200 focus:border-blue-400 w-full"
                        />
                      ) : (
                        <div 
                          className={`text-sm cursor-pointer p-1 rounded hover:bg-gray-100 transition-colors w-full truncate ${
                            task.dueDate && new Date(task.dueDate) < new Date() ? 'text-red-600 font-medium' : 'text-gray-600'
                          }`}
                          onClick={() => handleCellEdit(task.id, 'dueDate', task.dueDate || new Date().toISOString().split('T')[0])}
                          title={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Add date...'}
                        >
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Add date...'}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="w-20 px-4 py-3">
                      <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusChange(task.id, task.status === 'completed' ? 'todo' : 'completed')}
                          className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                          title={task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
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
                ))
              )}
            </div>

            {/* Add New Row */}
            <div 
              className="flex hover:bg-blue-50/50 transition-colors cursor-pointer border-t border-gray-100"
              onClick={handleCreateTask}
            >
              <div 
                className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 py-3 px-4"
                style={{ width: '100%' }}
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm">New task</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
