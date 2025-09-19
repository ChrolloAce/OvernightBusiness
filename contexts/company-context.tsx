'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { firebaseCompanyService, firebaseUserService } from '@/lib/firebase/company-service'
import { useAuth } from '@/contexts/auth-context'

interface Company {
  id: string
  name: string
  email?: string
  phone?: string
  website?: string
  industry?: string
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise'
  subscription?: 'free' | 'basic' | 'pro' | 'enterprise'
  settings?: any
  createdAt: Date
  updatedAt: Date
}

interface User {
  id: string
  email: string
  name: string
  role: 'owner' | 'admin' | 'manager' | 'user'
  companyId: string
  permissions?: string[]
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

interface CompanyContextType {
  currentCompany: Company | null
  currentUser: User | null
  companies: Company[]
  users: User[]
  setCurrentCompany: (company: Company | null) => void
  setCurrentUser: (user: User | null) => void
  loadCompanies: () => Promise<void>
  loadUsers: (companyId: string) => Promise<void>
  createCompany: (companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Company>
  updateCompany: (companyId: string, updates: Partial<Company>) => Promise<Company>
  deleteCompany: (companyId: string) => Promise<void>
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<User>
  updateUser: (userId: string, updates: Partial<User>) => Promise<User>
  deleteUser: (userId: string) => Promise<void>
  hasPermission: (permission: string) => boolean
  switchCompany: (companyId: string) => Promise<void>
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, needsOnboarding } = useAuth()
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [users, setUsers] = useState<User[]>([])

  // Initialize with default company and user
  useEffect(() => {
    // Only initialize if user is authenticated and has completed onboarding
    if (isAuthenticated && !needsOnboarding && user?.companyId) {
      initializeCompanyContext()
    }
  }, [isAuthenticated, needsOnboarding, user?.companyId])

  const initializeCompanyContext = async () => {
    try {
      console.log('[CompanyProvider] Initializing company context for user:', user?.email)
      
      // Use the user's companyId if available
      const companyId = user?.companyId || localStorage.getItem('currentCompanyId')
      const savedUserId = localStorage.getItem('currentUserId')
      
      if (companyId) {
        console.log('[CompanyProvider] Loading company:', companyId)
        const company = await firebaseCompanyService.getCompanyById(companyId)
        if (company) {
          setCurrentCompany(company)
          localStorage.setItem('currentCompanyId', companyId)
        }
      }
      
      if (savedUserId) {
        const userDoc = await firebaseUserService.getUserById(savedUserId)
        if (userDoc) {
          setCurrentUser(userDoc)
        }
      }
      
      // If no saved data, try to load companies
      if (!companyId) {
        console.log('[CompanyProvider] No company ID found, loading all companies')
        await loadCompanies()
      }
      
    } catch (error) {
      console.error('[CompanyProvider] Error initializing:', error)
    }
  }

  const loadCompanies = async () => {
    try {
      console.log('[CompanyProvider] Loading companies from Firebase...')
      const loadedCompanies = await firebaseCompanyService.getAllCompanies()
      setCompanies(loadedCompanies)
      
      // Auto-select first company if none selected
      if (!currentCompany && loadedCompanies.length > 0) {
        setCurrentCompany(loadedCompanies[0])
        localStorage.setItem('currentCompanyId', loadedCompanies[0].id)
      }
      
      console.log(`[CompanyProvider] Loaded ${loadedCompanies.length} companies`)
    } catch (error) {
      console.error('[CompanyProvider] Error loading companies:', error)
    }
  }

  const loadUsers = async (companyId: string) => {
    try {
      console.log('[CompanyProvider] Loading users for company:', companyId)
      const loadedUsers = await firebaseUserService.getUsersByCompany(companyId)
      setUsers(loadedUsers)
      
      // Auto-select current user if in this company
      if (!currentUser && loadedUsers.length > 0) {
        const defaultUser = loadedUsers.find(u => u.role === 'owner') || loadedUsers[0]
        setCurrentUser(defaultUser)
        localStorage.setItem('currentUserId', defaultUser.id)
      }
      
      console.log(`[CompanyProvider] Loaded ${loadedUsers.length} users`)
    } catch (error) {
      console.error('[CompanyProvider] Error loading users:', error)
    }
  }

  const createCompany = async (companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const company = await firebaseCompanyService.createCompany(companyData)
      await loadCompanies()
      return company
    } catch (error) {
      console.error('[CompanyProvider] Error creating company:', error)
      throw error
    }
  }

  const updateCompany = async (companyId: string, updates: Partial<Company>) => {
    try {
      const company = await firebaseCompanyService.updateCompany(companyId, updates)
      await loadCompanies()
      
      // Update current company if it was updated
      if (currentCompany?.id === companyId) {
        setCurrentCompany(company)
      }
      
      return company
    } catch (error) {
      console.error('[CompanyProvider] Error updating company:', error)
      throw error
    }
  }

  const deleteCompany = async (companyId: string) => {
    try {
      await firebaseCompanyService.deleteCompany(companyId)
      await loadCompanies()
      
      // Clear current company if it was deleted
      if (currentCompany?.id === companyId) {
        setCurrentCompany(null)
        localStorage.removeItem('currentCompanyId')
      }
    } catch (error) {
      console.error('[CompanyProvider] Error deleting company:', error)
      throw error
    }
  }

  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const user = await firebaseUserService.createUser(userData)
      if (currentCompany) {
        await loadUsers(currentCompany.id)
      }
      return user
    } catch (error) {
      console.error('[CompanyProvider] Error creating user:', error)
      throw error
    }
  }

  const updateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const user = await firebaseUserService.updateUser(userId, updates)
      if (currentCompany) {
        await loadUsers(currentCompany.id)
      }
      
      // Update current user if it was updated
      if (currentUser?.id === userId) {
        setCurrentUser(user)
      }
      
      return user
    } catch (error) {
      console.error('[CompanyProvider] Error updating user:', error)
      throw error
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      await firebaseUserService.deleteUser(userId)
      if (currentCompany) {
        await loadUsers(currentCompany.id)
      }
      
      // Clear current user if it was deleted
      if (currentUser?.id === userId) {
        setCurrentUser(null)
        localStorage.removeItem('currentUserId')
      }
    } catch (error) {
      console.error('[CompanyProvider] Error deleting user:', error)
      throw error
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false
    return firebaseUserService.hasPermission(currentUser, permission)
  }

  const switchCompany = async (companyId: string) => {
    try {
      const company = await firebaseCompanyService.getCompanyById(companyId)
      if (company) {
        setCurrentCompany(company)
        localStorage.setItem('currentCompanyId', companyId)
        
        // Load users for new company
        await loadUsers(companyId)
      }
    } catch (error) {
      console.error('[CompanyProvider] Error switching company:', error)
      throw error
    }
  }

  return (
    <CompanyContext.Provider 
      value={{ 
        currentCompany,
        currentUser,
        companies,
        users,
        setCurrentCompany,
        setCurrentUser,
        loadCompanies,
        loadUsers,
        createCompany,
        updateCompany,
        deleteCompany,
        createUser,
        updateUser,
        deleteUser,
        hasPermission,
        switchCompany
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
}
