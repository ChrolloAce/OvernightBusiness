'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Database, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Loader2,
  Users,
  Phone,
  CheckSquare
} from 'lucide-react'

export function MigrationTrigger() {
  const [migrationStatus, setMigrationStatus] = useState<any>(null)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResults, setMigrationResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Check if migration is needed
  useEffect(() => {
    checkLocalData()
  }, [])

  const checkLocalData = () => {
    try {
      const clientsData = localStorage.getItem('clients')
      const tasksData = localStorage.getItem('tasks')
      const phoneData = localStorage.getItem('twilio_phone_numbers')
      
      const clients = clientsData ? JSON.parse(clientsData) : []
      const tasks = tasksData ? JSON.parse(tasksData) : []
      const phones = phoneData ? JSON.parse(phoneData) : []
      
      const hasLocalData = clients.length > 0 || tasks.length > 0 || phones.length > 0
      
      setMigrationStatus({
        hasLocalData,
        localDataCount: {
          clients: Array.isArray(clients) ? clients.length : 0,
          tasks: Array.isArray(tasks) ? tasks.length : 0,
          phones: Array.isArray(phones) ? phones.length : 0
        }
      })
      
      console.log('[MigrationTrigger] Local data check:', {
        hasLocalData,
        clients: clients.length,
        tasks: tasks.length,
        phones: phones.length
      })
    } catch (error) {
      console.error('[MigrationTrigger] Error checking local data:', error)
    }
  }

  const performMigration = async () => {
    setIsMigrating(true)
    setError(null)
    setMigrationResults(null)
    
    try {
      console.log('[MigrationTrigger] Starting migration...')
      
      const response = await fetch('/api/migrate-to-firebase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ force: true })
      })
      
      const data = await response.json()
      console.log('[MigrationTrigger] Migration response:', data)
      
      if (data.success) {
        setMigrationResults(data.results)
        // Refresh the page after successful migration to reload with Firebase data
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setError(data.message || 'Migration failed')
        if (data.results) {
          setMigrationResults(data.results)
        }
      }
    } catch (err) {
      console.error('[MigrationTrigger] Migration error:', err)
      setError('Network error during migration')
    } finally {
      setIsMigrating(false)
    }
  }

  if (!migrationStatus) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
          <span className="text-sm text-gray-600">Checking for data to migrate...</span>
        </div>
      </Card>
    )
  }

  if (!migrationStatus.hasLocalData) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center py-4 text-center">
          <div>
            <Database className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-800">Ready for Firebase!</p>
            <p className="text-xs text-gray-600">No local data found to migrate</p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Migration Needed</h3>
          </div>
          <Badge variant="secondary">Local Data Found</Badge>
        </div>

        {/* Local Data Summary */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-blue-50 rounded">
            <Users className="h-4 w-4 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-800">{migrationStatus.localDataCount.clients}</p>
            <p className="text-xs text-blue-600">Clients</p>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <CheckSquare className="h-4 w-4 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-purple-800">{migrationStatus.localDataCount.tasks}</p>
            <p className="text-xs text-purple-600">Tasks</p>
          </div>
          <div className="text-center p-2 bg-orange-50 rounded">
            <Phone className="h-4 w-4 text-orange-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-orange-800">{migrationStatus.localDataCount.phones}</p>
            <p className="text-xs text-orange-600">Phone Numbers</p>
          </div>
        </div>

        {/* Migration Button */}
        <Button
          onClick={performMigration}
          disabled={isMigrating}
          className="w-full"
          size="sm"
        >
          {isMigrating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Migrating to Firebase...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Migrate to Firebase Database
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Migration Results */}
        {migrationResults && (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">
                Migration {migrationResults.success ? 'Completed' : 'Finished with Errors'}
              </span>
            </div>
            <div className="text-xs text-green-700 space-y-1">
              <p>• {migrationResults.migrated.clients} clients migrated</p>
              <p>• {migrationResults.migrated.tasks} tasks migrated</p>
              <p>• {migrationResults.migrated.phoneAssignments} phone numbers migrated</p>
              {migrationResults.success && (
                <p className="font-medium mt-2">🎉 Page will reload automatically!</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
