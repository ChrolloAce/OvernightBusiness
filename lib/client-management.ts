// Client Management System for Email Reports

export interface ClientInfo {
  id: string
  businessProfileId: string
  name: string
  email: string
  company?: string
  phone?: string
  reportFrequency: 'weekly' | 'monthly'
  reportDay: number // 0-6 for weekly (0=Sunday), 1-31 for monthly
  isActive: boolean
  createdAt: string
  lastReportSent?: string
  preferences: {
    includePhotos: boolean
    includeUpdates: boolean
    includeReviews: boolean
    includeAnalytics: boolean
    includeQA: boolean
  }
}

export interface ReportSchedule {
  id: string
  clientId: string
  businessProfileId: string
  frequency: 'weekly' | 'monthly'
  nextSendDate: string
  isActive: boolean
  lastSent?: string
}

class ClientManagementStorage {
  private static STORAGE_KEY = 'overnight_biz_clients'
  private static SCHEDULES_KEY = 'overnight_biz_schedules'

  // Client Management
  static getClients(): ClientInfo[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading clients:', error)
      return []
    }
  }

  static saveClients(clients: ClientInfo[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(clients))
    } catch (error) {
      console.error('Error saving clients:', error)
    }
  }

  static addClient(client: Omit<ClientInfo, 'id' | 'createdAt'>): ClientInfo {
    const newClient: ClientInfo = {
      ...client,
      id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }

    const clients = this.getClients()
    clients.push(newClient)
    this.saveClients(clients)

    // Create schedule
    this.createSchedule(newClient)

    return newClient
  }

  static updateClient(clientId: string, updates: Partial<ClientInfo>): ClientInfo | null {
    const clients = this.getClients()
    const index = clients.findIndex(c => c.id === clientId)
    
    if (index === -1) return null

    clients[index] = { ...clients[index], ...updates }
    this.saveClients(clients)

    // Update schedule if frequency changed
    if (updates.reportFrequency || updates.reportDay) {
      this.updateSchedule(clientId, clients[index])
    }

    return clients[index]
  }

  static deleteClient(clientId: string): boolean {
    const clients = this.getClients()
    const filteredClients = clients.filter(c => c.id !== clientId)
    
    if (filteredClients.length === clients.length) return false

    this.saveClients(filteredClients)
    this.deleteSchedule(clientId)
    return true
  }

  static getClientsByBusinessProfile(businessProfileId: string): ClientInfo[] {
    return this.getClients().filter(c => c.businessProfileId === businessProfileId)
  }

  // Schedule Management
  static getSchedules(): ReportSchedule[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(this.SCHEDULES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading schedules:', error)
      return []
    }
  }

  static saveSchedules(schedules: ReportSchedule[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(this.SCHEDULES_KEY, JSON.stringify(schedules))
    } catch (error) {
      console.error('Error saving schedules:', error)
    }
  }

  static createSchedule(client: ClientInfo): ReportSchedule {
    const schedule: ReportSchedule = {
      id: `schedule_${client.id}`,
      clientId: client.id,
      businessProfileId: client.businessProfileId,
      frequency: client.reportFrequency,
      nextSendDate: this.calculateNextSendDate(client.reportFrequency, client.reportDay),
      isActive: client.isActive
    }

    const schedules = this.getSchedules()
    schedules.push(schedule)
    this.saveSchedules(schedules)

    return schedule
  }

  static updateSchedule(clientId: string, client: ClientInfo): void {
    const schedules = this.getSchedules()
    const index = schedules.findIndex(s => s.clientId === clientId)
    
    if (index !== -1) {
      schedules[index] = {
        ...schedules[index],
        frequency: client.reportFrequency,
        nextSendDate: this.calculateNextSendDate(client.reportFrequency, client.reportDay),
        isActive: client.isActive
      }
      this.saveSchedules(schedules)
    }
  }

  static deleteSchedule(clientId: string): void {
    const schedules = this.getSchedules()
    const filteredSchedules = schedules.filter(s => s.clientId !== clientId)
    this.saveSchedules(filteredSchedules)
  }

  static markReportSent(clientId: string): void {
    const schedules = this.getSchedules()
    const clients = this.getClients()
    
    // Update schedule
    const scheduleIndex = schedules.findIndex(s => s.clientId === clientId)
    if (scheduleIndex !== -1) {
      const schedule = schedules[scheduleIndex]
      const client = clients.find(c => c.id === clientId)
      
      if (client) {
        schedule.lastSent = new Date().toISOString()
        schedule.nextSendDate = this.calculateNextSendDate(client.reportFrequency, client.reportDay)
        this.saveSchedules(schedules)
      }
    }

    // Update client
    const clientIndex = clients.findIndex(c => c.id === clientId)
    if (clientIndex !== -1) {
      clients[clientIndex].lastReportSent = new Date().toISOString()
      this.saveClients(clients)
    }
  }

  static getDueReports(): { client: ClientInfo; schedule: ReportSchedule }[] {
    const clients = this.getClients()
    const schedules = this.getSchedules()
    const now = new Date()
    
    return schedules
      .filter(schedule => {
        if (!schedule.isActive) return false
        const nextSend = new Date(schedule.nextSendDate)
        return nextSend <= now
      })
      .map(schedule => {
        const client = clients.find(c => c.id === schedule.clientId)
        return { client: client!, schedule }
      })
      .filter(item => item.client) // Remove items where client wasn't found
  }

  private static calculateNextSendDate(frequency: 'weekly' | 'monthly', day: number): string {
    const now = new Date()
    let nextDate = new Date()

    if (frequency === 'weekly') {
      // day is 0-6 (Sunday-Saturday)
      const currentDay = now.getDay()
      const daysUntilNext = (day - currentDay + 7) % 7
      nextDate.setDate(now.getDate() + (daysUntilNext === 0 ? 7 : daysUntilNext))
    } else {
      // monthly - day is 1-31
      nextDate.setMonth(now.getMonth() + 1)
      nextDate.setDate(Math.min(day, new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()))
      
      // If the target day has already passed this month, schedule for next month
      if (now.getDate() >= day) {
        nextDate.setMonth(nextDate.getMonth() + 1)
      } else {
        nextDate.setMonth(now.getMonth())
      }
      nextDate.setDate(Math.min(day, new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()))
    }

    // Set time to 9 AM
    nextDate.setHours(9, 0, 0, 0)
    
    return nextDate.toISOString()
  }
}

export { ClientManagementStorage } 