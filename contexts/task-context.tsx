'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Task, TaskManager } from '@/lib/managers/task-manager'

interface TaskContextType {
  tasks: Task[]
  selectedTask: Task | null
  setSelectedTask: (task: Task | null) => void
  loadTasks: () => void
  createTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Task
  updateTask: (id: string, updates: Partial<Task>) => Task | null
  deleteTask: (id: string) => boolean
  getTasksByClient: (clientId: string) => Task[]
  getTasksByAssignee: (assignee: string) => Task[]
  getTasksByStatus: (status: Task['status']) => Task[]
  getTaskStats: () => {
    total: number
    todo: number
    inProgress: number
    completed: number
    overdue: number
  }
  getClientTaskStats: (clientId: string) => {
    total: number
    todo: number
    inProgress: number
    completed: number
    overdue: number
  }
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [taskManager] = useState(() => TaskManager.getInstance())

  const loadTasks = () => {
    const loadedTasks = taskManager.getAllTasks()
    setTasks(loadedTasks)
    
    // Auto-select first task if none selected and tasks exist
    if (!selectedTask && loadedTasks.length > 0) {
      setSelectedTask(loadedTasks[0])
    }
  }

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask = taskManager.createTask(taskData)
    loadTasks() // Refresh the list
    return newTask
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    const updated = taskManager.updateTask(id, updates)
    if (updated) {
      loadTasks() // Refresh the list
      // Update selected task if it was the one being updated
      if (selectedTask?.id === id) {
        setSelectedTask(updated)
      }
    }
    return updated
  }

  const deleteTask = (id: string) => {
    const success = taskManager.deleteTask(id)
    if (success) {
      loadTasks() // Refresh the list
      // Clear selected task if it was deleted
      if (selectedTask?.id === id) {
        setSelectedTask(null)
      }
    }
    return success
  }

  const getTasksByClient = (clientId: string) => {
    return taskManager.getTasksByClient(clientId)
  }

  const getTasksByAssignee = (assignee: string) => {
    return taskManager.getTasksByAssignee(assignee)
  }

  const getTasksByStatus = (status: Task['status']) => {
    return taskManager.getTasksByStatus(status)
  }

  const getTaskStats = () => {
    return taskManager.getTaskStats()
  }

  const getClientTaskStats = (clientId: string) => {
    return taskManager.getClientTaskStats(clientId)
  }

  useEffect(() => {
    loadTasks()
  }, [])

  return (
    <TaskContext.Provider 
      value={{ 
        tasks,
        selectedTask, 
        setSelectedTask, 
        loadTasks,
        createTask,
        updateTask,
        deleteTask,
        getTasksByClient,
        getTasksByAssignee,
        getTasksByStatus,
        getTaskStats,
        getClientTaskStats
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider')
  }
  return context
}
