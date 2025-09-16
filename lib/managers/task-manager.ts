export interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignee: string
  clientId: string
  clientName: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  tags: string[]
  estimatedHours?: number
  actualHours?: number
}

export class TaskManager {
  private static instance: TaskManager
  private readonly STORAGE_KEY = 'overnight_biz_tasks'

  private constructor() {}

  public static getInstance(): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager()
    }
    return TaskManager.instance
  }

  // Task CRUD Operations
  public getAllTasks(): Task[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('[TaskManager] Failed to load tasks:', error)
      return []
    }
  }

  public getTask(id: string): Task | null {
    return this.getAllTasks().find(task => task.id === id) || null
  }

  public getTasksByClient(clientId: string): Task[] {
    return this.getAllTasks().filter(task => task.clientId === clientId)
  }

  public getTasksByAssignee(assignee: string): Task[] {
    return this.getAllTasks().filter(task => task.assignee === assignee)
  }

  public getTasksByStatus(status: Task['status']): Task[] {
    return this.getAllTasks().filter(task => task.status === status)
  }

  public createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const tasks = this.getAllTasks()
    tasks.push(newTask)
    this.saveTasks(tasks)

    console.log('[TaskManager] Task created:', newTask.title)
    return newTask
  }

  public updateTask(id: string, updates: Partial<Task>): Task | null {
    try {
      const tasks = this.getAllTasks()
      const index = tasks.findIndex(task => task.id === id)
      
      if (index >= 0) {
        tasks[index] = {
          ...tasks[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        this.saveTasks(tasks)
        return tasks[index]
      }
      return null
    } catch (error) {
      console.error('[TaskManager] Failed to update task:', error)
      return null
    }
  }

  public deleteTask(id: string): boolean {
    try {
      const tasks = this.getAllTasks()
      const filteredTasks = tasks.filter(task => task.id !== id)
      
      if (filteredTasks.length !== tasks.length) {
        this.saveTasks(filteredTasks)
        console.log('[TaskManager] Task deleted:', id)
        return true
      }
      return false
    } catch (error) {
      console.error('[TaskManager] Failed to delete task:', error)
      return false
    }
  }

  public getTaskStats(): {
    total: number
    todo: number
    inProgress: number
    completed: number
    overdue: number
  } {
    const tasks = this.getAllTasks()
    const now = new Date()
    
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => 
        t.dueDate && 
        new Date(t.dueDate) < now && 
        t.status !== 'completed'
      ).length
    }
  }

  public getClientTaskStats(clientId: string): {
    total: number
    todo: number
    inProgress: number
    completed: number
    overdue: number
  } {
    const tasks = this.getTasksByClient(clientId)
    const now = new Date()
    
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => 
        t.dueDate && 
        new Date(t.dueDate) < now && 
        t.status !== 'completed'
      ).length
    }
  }

  private saveTasks(tasks: Task[]): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks))
    } catch (error) {
      console.error('[TaskManager] Failed to save tasks:', error)
      throw new Error('Failed to save tasks to storage')
    }
  }

  public exportTasks(): string {
    return JSON.stringify(this.getAllTasks(), null, 2)
  }

  public importTasks(tasksJson: string): boolean {
    try {
      const tasks = JSON.parse(tasksJson)
      this.saveTasks(tasks)
      return true
    } catch (error) {
      console.error('[TaskManager] Failed to import tasks:', error)
      return false
    }
  }
}
