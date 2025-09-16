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
  const { clients, getClientById } = useClients()

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
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
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
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200'
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
                className="w-60 px-4 py-3 cursor-pointer hover:bg-gray-100 flex items-center space-x-1 border-r border-gray-200"
                onClick={() => handleSort('title')}
              >
                <span>Task</span>
                <ArrowUpDown className="h-3 w-3" />
              </div>
              <div className="w-32 px-4 py-3 border-r border-gray-200">Status</div>
              <div className="w-32 px-4 py-3 border-r border-gray-200">Priority</div>
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
                    <div className="w-60 px-4 py-3 border-r border-gray-200">
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
                          className="cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors"
                          onClick={() => handleCellEdit(task.id, 'title', task.title)}
                        >
                          <span className="text-sm font-medium text-gray-900">{task.title}</span>
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="w-32 px-4 py-3 border-r border-gray-200">
                      <Select value={task.status} onValueChange={(value) => handleStatusChange(task.id, value)}>
                        <SelectTrigger className="h-8 text-sm border-none shadow-none hover:bg-gray-100">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(task.status)}
                            <SelectValue />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="h-4 w-4 text-gray-400" />
                              <span>To Do</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="in_progress">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span>In Progress</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="completed">
                            <div className="flex items-center space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Completed</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority */}
                    <div className="w-32 px-4 py-3 border-r border-gray-200">
                      <Select value={task.priority} onValueChange={(value) => handlePriorityChange(task.id, value)}>
                        <SelectTrigger className="h-8 text-sm border-none shadow-none hover:bg-gray-100">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">
                            <Badge className="bg-green-100 text-green-800 border-green-200" variant="outline">
                              Low
                            </Badge>
                          </SelectItem>
                          <SelectItem value="medium">
                            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200" variant="outline">
                              Medium
                            </Badge>
                          </SelectItem>
                          <SelectItem value="high">
                            <Badge className="bg-red-100 text-red-800 border-red-200" variant="outline">
                              High
                            </Badge>
                          </SelectItem>
                        </SelectContent>
                      </Select>
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
                          className="h-8 text-sm border-blue-200 focus:border-blue-400"
                        />
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors flex items-center space-x-2"
                          onClick={() => handleCellEdit(task.id, 'assignee', task.assignee)}
                        >
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{task.assignee}</span>
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
                          className="h-8 text-sm border-blue-200 focus:border-blue-400"
                        />
                      ) : (
                        <div 
                          className="cursor-pointer hover:bg-gray-100 p-1 rounded transition-colors flex items-center space-x-2"
                          onClick={() => handleCellEdit(task.id, 'dueDate', task.dueDate)}
                        >
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="w-20 px-4 py-3">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Add Task Row */}
            <div className="border-t-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors">
              <div 
                className="flex items-center px-4 py-3 text-gray-500 hover:text-gray-700 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={handleCreateTask}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="text-sm">New task</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
