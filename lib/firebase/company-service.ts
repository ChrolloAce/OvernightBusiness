// Firebase service for company and user management
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db, COLLECTIONS, FirebaseCompany, FirebaseUser, convertFirestoreTimestamp } from '@/lib/firebase'

export class FirebaseCompanyService {
  private static instance: FirebaseCompanyService
  
  static getInstance(): FirebaseCompanyService {
    if (!FirebaseCompanyService.instance) {
      FirebaseCompanyService.instance = new FirebaseCompanyService()
    }
    return FirebaseCompanyService.instance
  }

  // Company Management
  async createCompany(companyData: Omit<FirebaseCompany, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirebaseCompany> {
    try {
      console.log('[Firebase Company Service] Creating company:', companyData.name)
      
      const companiesRef = collection(db, COLLECTIONS.COMPANIES)
      const newCompanyRef = doc(companiesRef)
      
      const data = {
        ...companyData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      await setDoc(newCompanyRef, data)
      
      // Return the created company
      const createdSnapshot = await getDoc(newCompanyRef)
      const createdData = createdSnapshot.data()!
      
      const company = {
        id: createdSnapshot.id,
        ...createdData,
        createdAt: convertFirestoreTimestamp(createdData.createdAt),
        updatedAt: convertFirestoreTimestamp(createdData.updatedAt)
      } as FirebaseCompany
      
      console.log('[Firebase Company Service] Company created:', company.id)
      return company
      
    } catch (error) {
      console.error('[Firebase Company Service] Error creating company:', error)
      throw error
    }
  }

  async getCompanyById(companyId: string): Promise<FirebaseCompany | null> {
    try {
      const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId)
      const snapshot = await getDoc(companyRef)
      
      if (!snapshot.exists()) {
        return null
      }
      
      const data = snapshot.data()
      return {
        id: snapshot.id,
        ...data,
        createdAt: convertFirestoreTimestamp(data.createdAt),
        updatedAt: convertFirestoreTimestamp(data.updatedAt)
      } as FirebaseCompany
      
    } catch (error) {
      console.error('[Firebase Company Service] Error fetching company:', error)
      throw error
    }
  }

  async getAllCompanies(): Promise<FirebaseCompany[]> {
    try {
      const companiesRef = collection(db, COLLECTIONS.COMPANIES)
      const q = query(companiesRef, orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertFirestoreTimestamp(doc.data().createdAt),
        updatedAt: convertFirestoreTimestamp(doc.data().updatedAt)
      })) as FirebaseCompany[]
      
    } catch (error) {
      console.error('[Firebase Company Service] Error fetching companies:', error)
      throw error
    }
  }

  async updateCompany(companyId: string, updates: Partial<FirebaseCompany>): Promise<FirebaseCompany> {
    try {
      const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId)
      
      const { id, createdAt, ...cleanUpdates } = updates
      const data = {
        ...cleanUpdates,
        updatedAt: serverTimestamp()
      }
      
      await updateDoc(companyRef, data)
      
      // Return updated company
      const updatedSnapshot = await getDoc(companyRef)
      const updatedData = updatedSnapshot.data()!
      
      return {
        id: updatedSnapshot.id,
        ...updatedData,
        createdAt: convertFirestoreTimestamp(updatedData.createdAt),
        updatedAt: convertFirestoreTimestamp(updatedData.updatedAt)
      } as FirebaseCompany
      
    } catch (error) {
      console.error('[Firebase Company Service] Error updating company:', error)
      throw error
    }
  }

  async deleteCompany(companyId: string): Promise<void> {
    try {
      console.log('[Firebase Company Service] Deleting company:', companyId)
      
      // Use batch to delete company and all related data
      const batch = writeBatch(db)
      
      // Delete company
      const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId)
      batch.delete(companyRef)
      
      // Delete all users in this company
      const usersQuery = query(collection(db, COLLECTIONS.USERS), where('companyId', '==', companyId))
      const usersSnapshot = await getDocs(usersQuery)
      usersSnapshot.docs.forEach(doc => batch.delete(doc.ref))
      
      // Delete all clients in this company
      const clientsQuery = query(collection(db, COLLECTIONS.CLIENTS), where('companyId', '==', companyId))
      const clientsSnapshot = await getDocs(clientsQuery)
      clientsSnapshot.docs.forEach(doc => batch.delete(doc.ref))
      
      // Delete all phone assignments in this company
      const phoneQuery = query(collection(db, COLLECTIONS.PHONE_ASSIGNMENTS), where('companyId', '==', companyId))
      const phoneSnapshot = await getDocs(phoneQuery)
      phoneSnapshot.docs.forEach(doc => batch.delete(doc.ref))
      
      await batch.commit()
      
      console.log('[Firebase Company Service] Company and all related data deleted')
      
    } catch (error) {
      console.error('[Firebase Company Service] Error deleting company:', error)
      throw error
    }
  }
}

export class FirebaseUserService {
  private static instance: FirebaseUserService
  
  static getInstance(): FirebaseUserService {
    if (!FirebaseUserService.instance) {
      FirebaseUserService.instance = new FirebaseUserService()
    }
    return FirebaseUserService.instance
  }

  // User Management
  async createUser(userData: Omit<FirebaseUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirebaseUser> {
    try {
      console.log('[Firebase User Service] Creating user:', userData.email)
      
      const usersRef = collection(db, COLLECTIONS.USERS)
      const newUserRef = doc(usersRef)
      
      const data = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
      
      await setDoc(newUserRef, data)
      
      // Return the created user
      const createdSnapshot = await getDoc(newUserRef)
      const createdData = createdSnapshot.data()!
      
      const user = {
        id: createdSnapshot.id,
        ...createdData,
        createdAt: convertFirestoreTimestamp(createdData.createdAt),
        updatedAt: convertFirestoreTimestamp(createdData.updatedAt),
        lastLoginAt: createdData.lastLoginAt ? convertFirestoreTimestamp(createdData.lastLoginAt) : undefined
      } as FirebaseUser
      
      console.log('[Firebase User Service] User created:', user.id)
      return user
      
    } catch (error) {
      console.error('[Firebase User Service] Error creating user:', error)
      throw error
    }
  }

  async getUserById(userId: string): Promise<FirebaseUser | null> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      const snapshot = await getDoc(userRef)
      
      if (!snapshot.exists()) {
        return null
      }
      
      const data = snapshot.data()
      return {
        id: snapshot.id,
        ...data,
        createdAt: convertFirestoreTimestamp(data.createdAt),
        updatedAt: convertFirestoreTimestamp(data.updatedAt),
        lastLoginAt: data.lastLoginAt ? convertFirestoreTimestamp(data.lastLoginAt) : undefined
      } as FirebaseUser
      
    } catch (error) {
      console.error('[Firebase User Service] Error fetching user:', error)
      throw error
    }
  }

  async getUsersByCompany(companyId: string): Promise<FirebaseUser[]> {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS)
      const q = query(usersRef, where('companyId', '==', companyId), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertFirestoreTimestamp(doc.data().createdAt),
        updatedAt: convertFirestoreTimestamp(doc.data().updatedAt),
        lastLoginAt: doc.data().lastLoginAt ? convertFirestoreTimestamp(doc.data().lastLoginAt) : undefined
      })) as FirebaseUser[]
      
    } catch (error) {
      console.error('[Firebase User Service] Error fetching company users:', error)
      throw error
    }
  }

  async updateUser(userId: string, updates: Partial<FirebaseUser>): Promise<FirebaseUser> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      
      const { id, createdAt, ...cleanUpdates } = updates
      const data = {
        ...cleanUpdates,
        updatedAt: serverTimestamp()
      }
      
      await updateDoc(userRef, data)
      
      // Return updated user
      const updatedSnapshot = await getDoc(userRef)
      const updatedData = updatedSnapshot.data()!
      
      return {
        id: updatedSnapshot.id,
        ...updatedData,
        createdAt: convertFirestoreTimestamp(updatedData.createdAt),
        updatedAt: convertFirestoreTimestamp(updatedData.updatedAt),
        lastLoginAt: updatedData.lastLoginAt ? convertFirestoreTimestamp(updatedData.lastLoginAt) : undefined
      } as FirebaseUser
      
    } catch (error) {
      console.error('[Firebase User Service] Error updating user:', error)
      throw error
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      await deleteDoc(userRef)
      console.log('[Firebase User Service] User deleted:', userId)
      
    } catch (error) {
      console.error('[Firebase User Service] Error deleting user:', error)
      throw error
    }
  }

  // User role and permission management
  async updateUserRole(userId: string, role: FirebaseUser['role'], permissions?: string[]): Promise<void> {
    try {
      await this.updateUser(userId, { 
        role, 
        permissions: permissions || this.getDefaultPermissions(role)
      })
      
    } catch (error) {
      console.error('[Firebase User Service] Error updating user role:', error)
      throw error
    }
  }

  private getDefaultPermissions(role: FirebaseUser['role']): string[] {
    const permissionSets = {
      owner: ['all'],
      admin: ['clients.read', 'clients.write', 'users.read', 'users.write', 'company.read', 'company.write', 'phone.read', 'phone.write'],
      manager: ['clients.read', 'clients.write', 'users.read', 'phone.read', 'phone.write'],
      user: ['clients.read', 'phone.read']
    }
    
    return permissionSets[role] || permissionSets.user
  }

  // Check if user has permission
  hasPermission(user: FirebaseUser, permission: string): boolean {
    if (!user.permissions) return false
    if (user.permissions.includes('all')) return true
    return user.permissions.includes(permission)
  }

  // Real-time listeners
  subscribeToCompanyUsers(companyId: string, callback: (users: FirebaseUser[]) => void): () => void {
    const usersRef = collection(db, COLLECTIONS.USERS)
    const q = query(usersRef, where('companyId', '==', companyId), orderBy('createdAt', 'desc'))
    
    return onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertFirestoreTimestamp(doc.data().createdAt),
        updatedAt: convertFirestoreTimestamp(doc.data().updatedAt),
        lastLoginAt: doc.data().lastLoginAt ? convertFirestoreTimestamp(doc.data().lastLoginAt) : undefined
      })) as FirebaseUser[]
      
      callback(users)
    })
  }

  subscribeToAllCompanies(callback: (companies: FirebaseCompany[]) => void): () => void {
    const companiesRef = collection(db, COLLECTIONS.COMPANIES)
    const q = query(companiesRef, orderBy('createdAt', 'desc'))
    
    return onSnapshot(q, (snapshot) => {
      const companies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: convertFirestoreTimestamp(doc.data().createdAt),
        updatedAt: convertFirestoreTimestamp(doc.data().updatedAt)
      })) as FirebaseCompany[]
      
      callback(companies)
    })
  }
}

// Export singleton instances
export const firebaseCompanyService = FirebaseCompanyService.getInstance()
export const firebaseUserService = FirebaseUserService.getInstance()
