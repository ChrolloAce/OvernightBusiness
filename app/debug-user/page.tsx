'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useCompany } from '@/contexts/company-context'

export default function DebugUserPage() {
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
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

        <div className="text-center">
          <Button onClick={() => window.location.href = '/settings'}>
            Back to Settings
          </Button>
        </div>
      </div>
    </div>
  )
}
