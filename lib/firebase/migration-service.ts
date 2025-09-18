// Firebase Data Migration Service
// Migrates all localStorage data to Firebase with company structure

import { 
  collection, 
  doc, 
  setDoc, 
  writeBatch,
  serverTimestamp,
  getDocs,
  query,
  where
} from 'firebase/firestore'
import { 
  db, 
  COLLECTIONS, 
  clearAllLocalStorageData,
  getCurrentCompanyId,
  getCurrentUserId,
  FirebaseCompany,
  FirebaseClient,
  FirebaseTask,
  FirebasePhoneAssignment,
  FirebaseAuditLog
} from '@/lib/firebase'

export class FirebaseMigrationService {
  private static instance: FirebaseMigrationService
  private companyId = getCurrentCompanyId()
  private userId = getCurrentUserId()

  static getInstance(): FirebaseMigrationService {
    if (!FirebaseMigrationService.instance) {
      FirebaseMigrationService.instance = new FirebaseMigrationService()
    }
    return FirebaseMigrationService.instance
  }

  // Main migration function - migrates all data
  async migrateAllDataToFirebase(): Promise<{
    success: boolean
    migrated: {
      company: boolean
      clients: number
      tasks: number
      phoneAssignments: number
    }
    errors: string[]
  }> {
    console.log('🚀 Starting complete data migration to Firebase...')
    
    const results = {
      success: true,
      migrated: {
        company: false,
        clients: 0,
        tasks: 0,
        phoneAssignments: 0
      },
      errors: [] as string[]
    }

    try {
      // Step 1: Create/update company
      await this.migrateCompany()
      results.migrated.company = true
      console.log('✅ Company migrated')

      // Step 2: Migrate clients
      const clientsCount = await this.migrateClients()
      results.migrated.clients = clientsCount
      console.log(`✅ ${clientsCount} clients migrated`)

      // Step 3: Migrate tasks
      const tasksCount = await this.migrateTasks()
      results.migrated.tasks = tasksCount
      console.log(`✅ ${tasksCount} tasks migrated`)

      // Step 4: Migrate phone assignments
      const phoneCount = await this.migratePhoneAssignments()
      results.migrated.phoneAssignments = phoneCount
      console.log(`✅ ${phoneCount} phone assignments migrated`)

      // Step 5: Clear all localStorage data
      clearAllLocalStorageData()
      console.log('✅ All localStorage data cleared')

      // Step 6: Log migration completion
      await this.logAuditEvent('migration', 'system', 'complete_migration', {
        migrated: results.migrated
      })

      console.log('🎉 Migration completed successfully!')
      
    } catch (error) {
      console.error('❌ Migration failed:', error)
      results.success = false
      results.errors.push(error instanceof Error ? error.message : 'Unknown error')
    }

    return results
  }

  // Migrate company data
  private async migrateCompany(): Promise<void> {
    const companyData: FirebaseCompany = {
      id: this.companyId,
      name: 'OvernightBiz',
      email: 'admin@overnightbiz.com',
      phone: '+17862903664',
      website: 'https://www.overnightbiz.com',
      industry: 'Digital Marketing',
      size: 'small',
      subscription: 'pro',
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const companyRef = doc(db, COLLECTIONS.COMPANIES, this.companyId)
    await setDoc(companyRef, {
      ...companyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true })
  }

  // Migrate clients from localStorage
  private async migrateClients(): Promise<number> {
    try {
      const clientsData = localStorage.getItem('clients')
      if (!clientsData) {
        console.log('No clients found in localStorage')
        return 0
      }

      const clients = JSON.parse(clientsData)
      if (!Array.isArray(clients) || clients.length === 0) {
        return 0
      }

      console.log(`Found ${clients.length} clients in localStorage`)

      // Use batch for efficient writes
      const batch = writeBatch(db)
      let count = 0

      for (const client of clients) {
        try {
          const clientId = client.id || `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          const firebaseClient: Omit<FirebaseClient, 'createdAt' | 'updatedAt'> = {
            id: clientId,
            companyId: this.companyId,
            name: client.name || 'Unknown Client',
            email: client.email || undefined,
            phone: client.phone || undefined,
            website: client.website || undefined,
            logo: client.logo || undefined,
            status: client.status || 'active',
            tags: Array.isArray(client.tags) ? client.tags : [],
            notes: client.notes || undefined,
            googleBusinessProfileId: client.googleBusinessProfileId || undefined,
            googleBusinessProfile: client.googleBusinessProfile || undefined,
            assignedUserId: this.userId,
            createdBy: this.userId
          }

          const clientRef = doc(db, COLLECTIONS.CLIENTS, clientId)
          batch.set(clientRef, {
            ...firebaseClient,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })

          count++
          
        } catch (clientError) {
          console.error('Error processing client:', client, clientError)
        }
      }

      if (count > 0) {
        await batch.commit()
        console.log(`✅ Batch committed: ${count} clients`)
      }

      return count

    } catch (error) {
      console.error('Error migrating clients:', error)
      throw error
    }
  }

  // Migrate tasks from localStorage
  private async migrateTasks(): Promise<number> {
    try {
      const tasksData = localStorage.getItem('tasks')
      if (!tasksData) {
        console.log('No tasks found in localStorage')
        return 0
      }

      const tasks = JSON.parse(tasksData)
      if (!Array.isArray(tasks) || tasks.length === 0) {
        return 0
      }

      console.log(`Found ${tasks.length} tasks in localStorage`)

      const batch = writeBatch(db)
      let count = 0

      for (const task of tasks) {
        try {
          const taskId = task.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          const firebaseTask: Omit<FirebaseTask, 'createdAt' | 'updatedAt'> = {
            id: taskId,
            companyId: this.companyId,
            clientId: task.clientId || undefined,
            projectId: task.projectId || undefined,
            title: task.title || task.name || 'Untitled Task',
            description: task.description || undefined,
            status: this.mapTaskStatus(task.status),
            priority: this.mapTaskPriority(task.priority),
            assignedUserId: task.assignedUserId || this.userId,
            dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
            tags: Array.isArray(task.tags) ? task.tags : [],
            createdBy: this.userId
          }

          const taskRef = doc(db, COLLECTIONS.TASKS, taskId)
          batch.set(taskRef, {
            ...firebaseTask,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })

          count++
          
        } catch (taskError) {
          console.error('Error processing task:', task, taskError)
        }
      }

      if (count > 0) {
        await batch.commit()
        console.log(`✅ Batch committed: ${count} tasks`)
      }

      return count

    } catch (error) {
      console.error('Error migrating tasks:', error)
      throw error
    }
  }

  // Migrate phone assignments from localStorage
  private async migratePhoneAssignments(): Promise<number> {
    try {
      const phoneData = localStorage.getItem('twilio_phone_numbers')
      if (!phoneData) {
        console.log('No phone assignments found in localStorage')
        return 0
      }

      const phoneNumbers = JSON.parse(phoneData)
      if (!Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
        return 0
      }

      console.log(`Found ${phoneNumbers.length} phone assignments in localStorage`)

      const batch = writeBatch(db)
      let count = 0

      for (const phone of phoneNumbers) {
        try {
          const assignmentId = phone.sid || phone.twilioSid || `phone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          const firebaseAssignment: Omit<FirebasePhoneAssignment, 'createdAt' | 'updatedAt'> = {
            id: assignmentId,
            companyId: this.companyId,
            twilioSid: phone.sid || phone.twilioSid || assignmentId,
            phoneNumber: phone.phoneNumber || phone.phone_number || '',
            clientId: phone.assignedClientId || undefined,
            clientName: phone.assignedClientName || undefined,
            forwardToNumber: phone.forwardToNumber || phone.forwardTo || undefined,
            isActive: phone.isActive !== false,
            webhookUrl: phone.webhookUrl || undefined,
            lastCallAt: phone.lastCallAt ? new Date(phone.lastCallAt) : undefined,
            totalCalls: phone.totalCalls || 0,
            createdBy: this.userId
          }

          const assignmentRef = doc(db, COLLECTIONS.PHONE_ASSIGNMENTS, assignmentId)
          batch.set(assignmentRef, {
            ...firebaseAssignment,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          })

          count++
          
        } catch (phoneError) {
          console.error('Error processing phone assignment:', phone, phoneError)
        }
      }

      if (count > 0) {
        await batch.commit()
        console.log(`✅ Batch committed: ${count} phone assignments`)
      }

      return count

    } catch (error) {
      console.error('Error migrating phone assignments:', error)
      throw error
    }
  }

  // Helper function to map task status
  private mapTaskStatus(status: any): FirebaseTask['status'] {
    const statusMap: Record<string, FirebaseTask['status']> = {
      'todo': 'todo',
      'in-progress': 'in_progress',
      'in_progress': 'in_progress',
      'completed': 'completed',
      'done': 'completed',
      'cancelled': 'cancelled',
      'canceled': 'cancelled'
    }
    
    return statusMap[status?.toLowerCase()] || 'todo'
  }

  // Helper function to map task priority
  private mapTaskPriority(priority: any): FirebaseTask['priority'] {
    const priorityMap: Record<string, FirebaseTask['priority']> = {
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
      'urgent': 'urgent',
      'critical': 'urgent'
    }
    
    return priorityMap[priority?.toLowerCase()] || 'medium'
  }

  // Log audit events
  private async logAuditEvent(
    action: FirebaseAuditLog['action'],
    entity: FirebaseAuditLog['entity'], 
    entityId: string,
    changes?: any
  ): Promise<void> {
    try {
      const auditLog: Omit<FirebaseAuditLog, 'createdAt'> = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        companyId: this.companyId,
        userId: this.userId,
        action,
        entity,
        entityId,
        changes,
        ipAddress: 'migration',
        userAgent: 'Firebase Migration Service'
      }

      const auditRef = doc(db, COLLECTIONS.AUDIT_LOGS, auditLog.id)
      await setDoc(auditRef, {
        ...auditLog,
        createdAt: serverTimestamp()
      })

    } catch (error) {
      console.error('Error logging audit event:', error)
      // Don't throw - audit logging shouldn't break migration
    }
  }

  // Check if migration is needed
  async isMigrationNeeded(): Promise<{
    needed: boolean
    hasLocalData: boolean
    hasFirebaseData: boolean
    localDataCount: {
      clients: number
      tasks: number
      phoneAssignments: number
    }
  }> {
    // Check localStorage data
    const clientsData = localStorage.getItem('clients')
    const tasksData = localStorage.getItem('tasks')
    const phoneData = localStorage.getItem('twilio_phone_numbers')
    
    const localClients = clientsData ? JSON.parse(clientsData) : []
    const localTasks = tasksData ? JSON.parse(tasksData) : []
    const localPhone = phoneData ? JSON.parse(phoneData) : []
    
    const hasLocalData = localClients.length > 0 || localTasks.length > 0 || localPhone.length > 0
    
    // Check Firebase data
    const clientsSnapshot = await getDocs(
      query(collection(db, COLLECTIONS.CLIENTS), where('companyId', '==', this.companyId))
    )
    const hasFirebaseData = !clientsSnapshot.empty
    
    return {
      needed: hasLocalData && !hasFirebaseData,
      hasLocalData,
      hasFirebaseData,
      localDataCount: {
        clients: Array.isArray(localClients) ? localClients.length : 0,
        tasks: Array.isArray(localTasks) ? localTasks.length : 0,
        phoneAssignments: Array.isArray(localPhone) ? localPhone.length : 0
      }
    }
  }
}

// Export singleton instance
export const firebaseMigrationService = FirebaseMigrationService.getInstance()
