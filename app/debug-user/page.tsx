'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useCompany } from '@/contexts/company-context'

export default function DebugUserPage() {
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [forceLinking, setForceLinking] = useState(false)
  const { user } = useAuth()
  const { currentCompany } = useCompany()

  const fetchDebugData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug-user')
      const data = await response.json()
      setDebugData(data)
    } catch (error) {
      console.error('Error fetching debug data:', error)
    } finally {
      setLoading(false)
    }
  }

  const forceLinkToCompany = async () => {
    if (!user) return
    
    setForceLinking(true)
    try {
      const response = await fetch('/api/force-link-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          name: user.name
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('✅ Successfully linked to company! Refresh the page to see changes.')
        fetchDebugData() // Refresh debug data
        // Force page reload to refresh auth context
        setTimeout(() => window.location.reload(), 1000)
      } else {
        alert('❌ Failed to link to company: ' + result.error)
      }
    } catch (error) {
      console.error('Error force linking:', error)
      alert('❌ Error linking to company')
    } finally {
      setForceLinking(false)
    }
  }

  useEffect(() => {
    fetchDebugData()
  }, [])

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">User Debug Information</h1>
          <p className="text-gray-600 mt-2">Debug your user and company data</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Auth Context Data */}
          <Card>
            <CardHeader>
              <CardTitle>Auth Context Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Company Context Data */}
          <Card>
            <CardHeader>
              <CardTitle>Company Context Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(currentCompany, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Firebase Debug Data */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Firebase Debug Data
                <Button onClick={fetchDebugData} disabled={loading}>
                  {loading ? 'Loading...' : 'Refresh'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-sm bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {debugData ? JSON.stringify(debugData, null, 2) : 'Loading...'}
              </pre>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-x-4">
          <Button 
            onClick={forceLinkToCompany}
            disabled={forceLinking}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {forceLinking ? 'Linking...' : '🔗 Force Link to Company'}
          </Button>
          <Button 
            onClick={() => window.location.href = '/settings'}
            variant="outline"
          >
            Back to Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
