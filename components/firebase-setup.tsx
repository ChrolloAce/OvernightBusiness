'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  CheckCircle, 
  Loader2, 
  AlertCircle,
  Plus,
  Users,
  Phone
} from 'lucide-react'

export function FirebaseSetup() {
  const router = useRouter()
  const [isSetup, setIsSetup] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [companyData, setCompanyData] = useState({
    name: 'OvernightBiz',
    email: 'admin@overnightbiz.com',
    phone: '+17862903664',
    website: 'https://www.overnightbiz.com'
  })
  const [testResults, setTestResults] = useState<{
    company: boolean
    client: boolean
    phone: boolean
  } | null>(null)

  const setupFirebase = async () => {
    setIsLoading(true)
    setError(null)
    setTestResults(null)
    
    try {
      console.log('🚀 Setting up Firebase with company data...')
      
      // Step 1: Create company
      const companyResponse = await fetch('/api/setup-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData)
      })
      
      if (!companyResponse.ok) {
        throw new Error('Failed to create company')
      }
      
      console.log('✅ Company created')
      
      // Step 2: Test client creation
      const clientResponse = await fetch('/api/test-firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'client' })
      })
      
      const clientResult = await clientResponse.json()
      
      // Step 3: Test phone assignment
      const phoneResponse = await fetch('/api/test-firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'phone' })
      })
      
      const phoneResult = await phoneResponse.json()
      
      setTestResults({
        company: true,
        client: clientResult.success,
        phone: phoneResult.success
      })
      
      setIsSetup(true)
      console.log('🎉 Firebase setup completed!')
      
    } catch (err) {
      console.error('❌ Firebase setup failed:', err)
      setError(err instanceof Error ? err.message : 'Setup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const createTestClient = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Client',
          email: 'test@example.com',
          phone: '+1234567890',
          status: 'active'
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('✅ Test client created successfully in Firebase!')
        console.log('Test client created:', result.client)
      } else {
        alert('❌ Failed to create test client: ' + result.error)
      }
    } catch (error) {
      console.error('Error creating test client:', error)
      alert('❌ Error creating test client')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Firebase Setup Card */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Building2 className="h-6 w-6 text-blue-600" />
          <h3 className="text-lg font-semibold">Firebase Database Setup</h3>
          {isSetup && <Badge className="bg-green-100 text-green-800">Ready</Badge>}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Company Information */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyData.name}
              onChange={(e) => setCompanyData(prev => ({...prev, name: e.target.value}))}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="companyEmail">Company Email</Label>
            <Input
              id="companyEmail"
              type="email"
              value={companyData.email}
              onChange={(e) => setCompanyData(prev => ({...prev, email: e.target.value}))}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="companyPhone">Company Phone</Label>
            <Input
              id="companyPhone"
              value={companyData.phone}
              onChange={(e) => setCompanyData(prev => ({...prev, phone: e.target.value}))}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="companyWebsite">Company Website</Label>
            <Input
              id="companyWebsite"
              value={companyData.website}
              onChange={(e) => setCompanyData(prev => ({...prev, website: e.target.value}))}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Setup Button */}
        <Button
          onClick={setupFirebase}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Setting up Firebase...
            </>
          ) : (
            <>
              <Building2 className="h-5 w-5 mr-2" />
              Setup Firebase Database
            </>
          )}
        </Button>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Setup Results</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Company Creation</span>
              {testResults.company ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Client System</span>
              {testResults.client ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Phone System</span>
              {testResults.phone ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      {isSetup && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Quick Tests</h4>
          <div className="space-y-3">
            <Button
              onClick={createTestClient}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              <Users className="h-4 w-4 mr-2" />
              Create Test Client in Firebase
            </Button>
            <Button
              onClick={() => router.push('/clients/new')}
              variant="outline"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Go to Create Client Page
            </Button>
            <Button
              onClick={() => router.push('/phone-numbers')}
              variant="outline"
              className="w-full"
            >
              <Phone className="h-4 w-4 mr-2" />
              Go to Phone Numbers Page
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}
