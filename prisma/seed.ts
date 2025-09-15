// Seed script for demo data

const mockClients = [
  {
    id: 'client-1',
    name: 'BMW Company',
    email: 'contact@bmw.com',
    phone: '(840) 574-8039',
    website: 'https://bmw.com',
    status: 'active' as const,
    tags: ['automotive', 'premium'],
    notes: 'Premium automotive client with multiple locations',
    googleBusinessProfileId: 'bmw-downtown',
    activeProjects: 3,
    lastActivity: '2 hours ago',
    totalRevenue: 45000,
    outstandingInvoices: 2
  },
  {
    id: 'client-2',
    name: 'Samsung Company',
    email: 'hello@samsung.com',
    phone: '(840) 574-8039',
    website: 'https://samsung.com',
    status: 'active' as const,
    tags: ['technology', 'electronics'],
    notes: 'Technology client focusing on retail locations',
    googleBusinessProfileId: 'samsung-store',
    activeProjects: 2,
    lastActivity: '1 day ago',
    totalRevenue: 32000,
    outstandingInvoices: 1
  },
  {
    id: 'client-3',
    name: 'Tinder Company',
    email: 'support@tinder.com',
    phone: '(840) 574-8039',
    website: 'https://tinder.com',
    status: 'prospect' as const,
    tags: ['social', 'app'],
    notes: 'Social media app looking for digital marketing services',
    activeProjects: 1,
    lastActivity: '3 days ago',
    totalRevenue: 8000,
    outstandingInvoices: 0
  }
]

const mockTasks = [
  {
    id: 'task-1',
    title: 'Update BMW website content',
    description: 'Update the homepage with new vehicle models',
    status: 'in_progress' as const,
    priority: 'high' as const,
    dueDate: '2024-01-25',
    clientId: 'client-1',
    assignee: 'John Doe'
  },
  {
    id: 'task-2',
    title: 'Respond to Samsung reviews',
    description: 'Reply to recent Google Business Profile reviews',
    status: 'todo' as const,
    priority: 'medium' as const,
    dueDate: '2024-01-28',
    clientId: 'client-2',
    assignee: 'Jane Smith'
  }
]

const mockInvoices = [
  {
    id: 'invoice-1',
    invoiceNumber: 'INV-001',
    title: 'Digital Marketing Services',
    amount: 5200,
    status: 'sent' as const,
    dueDate: '2024-01-25',
    clientId: 'client-1'
  },
  {
    id: 'invoice-2',
    invoiceNumber: 'INV-002',
    title: 'Website Development',
    amount: 3800,
    status: 'paid' as const,
    dueDate: '2024-01-20',
    paidDate: '2024-01-18',
    clientId: 'client-2'
  }
]

const mockTransactions = [
  {
    id: 'txn-1',
    description: 'Invoice payment - BMW Company',
    amount: 5200,
    type: 'income' as const,
    category: 'client_payment',
    date: '2024-01-18',
    clientId: 'client-1'
  },
  {
    id: 'txn-2',
    description: 'Office rent',
    amount: -2500,
    type: 'expense' as const,
    category: 'office',
    date: '2024-01-01'
  }
]

// Export seed data for use in the application
export const seedData = {
  clients: mockClients,
  tasks: mockTasks,
  invoices: mockInvoices,
  transactions: mockTransactions
}

// In a real Prisma setup, this would seed the database
// For now, we'll use localStorage-based storage
export async function seedLocalStorage() {
  if (typeof window === 'undefined') return

  try {
    // Seed clients
    localStorage.setItem('overnight_biz_clients', JSON.stringify(mockClients))
    
    // Seed tasks
    localStorage.setItem('overnight_biz_tasks', JSON.stringify(mockTasks))
    
    // Seed invoices
    localStorage.setItem('overnight_biz_invoices', JSON.stringify(mockInvoices))
    
    // Seed transactions
    localStorage.setItem('overnight_biz_transactions', JSON.stringify(mockTransactions))
    
    console.log('[Seed] Demo data seeded successfully')
    return true
  } catch (error) {
    console.error('[Seed] Failed to seed demo data:', error)
    return false
  }
}

export default seedData
