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
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Mock tasks data
const mockTasks = [
  {
    id: '1',
    title: 'Update BMW website content',
    description: 'Update the homepage with new vehicle models',
    status: 'in_progress',
    priority: 'high',
    dueDate: '2024-01-25',
    assignee: 'John Doe',
    client: 'BMW Company',
    clientAvatar: 'BC',
    createdAt: '2024-01-20'
  },
  {
    id: '2',
    title: 'Respond to Samsung reviews',
    description: 'Reply to recent Google Business Profile reviews',
    status: 'todo',
    priority: 'medium',
    dueDate: '2024-01-28',
    assignee: 'Jane Smith',
    client: 'Samsung Company',
    clientAvatar: 'SC',
    createdAt: '2024-01-22'
  },
  {
    id: '3',
    title: 'Create social media posts for Tinder',
    description: 'Generate AI content for social media campaign',
    status: 'completed',
    priority: 'low',
    dueDate: '2024-01-20',
    assignee: 'Mike Johnson',
    client: 'Tinder Company',
    clientAvatar: 'TC',
    createdAt: '2024-01-18'
  },
  {
    id: '4',
    title: 'Set up FedEx ad tracking',
    description: 'Configure conversion tracking for Google Ads',
    status: 'todo',
    priority: 'urgent',
    dueDate: '2024-01-24',
    assignee: 'Sarah Wilson',
    client: 'Fed Ex Company',
    clientAvatar: 'FE',
    createdAt: '2024-01-23'
  }
]

export default function TasksPage() {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [tasks, setTasks] = useState(mockTasks)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.client.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && !['completed', 'cancelled'].includes(mockTasks.find(t => t.dueDate === dueDate)?.status || '')
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
                <Calendar className="mr-3 h-8 w-8 text-blue-600" />
                Tasks
              </h1>
              <p className="text-gray-600 mt-1">Manage tasks and assignments across all clients</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>

          {/* Filters */}
          <Card className="bg-white shadow-sm border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Grid */}
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white shadow-sm border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Task Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(task.status)}
                          <Badge className={getPriorityColor(task.priority)} variant="outline">
                            {task.priority}
                          </Badge>
                        </div>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Task Content */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
                      </div>

                      {/* Client Info */}
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {task.clientAvatar}
                        </div>
                        <span className="text-sm text-gray-600">{task.client}</span>
                      </div>

                      {/* Task Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{task.assignee}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className={`text-xs ${isOverdue(task.dueDate) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <Badge className={getStatusColor(task.status)} variant="outline">
                        {task.status.replace('_', ' ').charAt(0).toUpperCase() + task.status.replace('_', ' ').slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredTasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Card className="bg-white shadow-sm border-gray-200">
                <CardContent className="py-12">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No tasks found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                      ? 'Try adjusting your search or filters'
                      : 'Create your first task to get started'
                    }
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Task
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  )
}
