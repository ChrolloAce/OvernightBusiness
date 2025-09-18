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
  Trash2,
  RefreshCw,
  Users,
  Phone,
  CheckSquare,
  Building2
} from 'lucide-react'

interface MigrationStatus {
  needed: boolean
  hasLocalData: boolean
  hasFirebaseData: boolean
  localDataCount: {
    clients: number
    tasks: number
    phoneAssignments: number
  }
}

interface MigrationResults {
  success: boolean
  migrated: {
    company: boolean
    clients: number
    tasks: number
    phoneAssignments: number
  }
  errors: string[]
}

export function FirebaseMigration() {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null)
  const [migrationResults, setMigrationResults] = useState<MigrationResults | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check migration status on component mount
  useEffect(() => {
    checkMigrationStatus()
  }, [])

  const checkMigrationStatus = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/migrate-to-firebase')
      const data = await response.json()
      
      if (data.success) {
        setMigrationStatus(data.migrationCheck)
      } else {
        setError(data.error || 'Failed to check migration status')
      }
    } catch (err) {
      setError('Network error while checking migration status')
      console.error('Migration status check error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const performMigration = async (force = false) => {
    setIsMigrating(true)
    setError(null)
    setMigrationResults(null)
    
    try {
      const response = await fetch('/api/migrate-to-firebase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ force })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMigrationResults(data.results)
        // Refresh migration status after successful migration
        setTimeout(() => {
          checkMigrationStatus()
        }, 1000)
      } else {
        setError(data.message || 'Migration failed')
        if (data.results) {
          setMigrationResults(data.results)
        }
      }
    } catch (err) {
      setError('Network error during migration')
      console.error('Migration error:', err)
    } finally {
      setIsMigrating(false)
    }
  }

  const clearLocalData = () => {
    if (confirm('Are you sure you want to clear all local data? This cannot be undone!')) {
      try {
        const keysToRemove = ['clients', 'tasks', 'twilio_phone_numbers', 'business_profiles']
        keysToRemove.forEach(key => localStorage.removeItem(key))
        
        // Refresh status
        checkMigrationStatus()
        alert('Local data cleared successfully!')
      } catch (err) {
        setError('Failed to clear local data')
      }
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Checking migration status...</span>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Migration Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold">Firebase Migration Status</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={checkMigrationStatus}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {migrationStatus && (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`h-3 w-3 rounded-full ${
                  migrationStatus.hasFirebaseData 
                    ? 'bg-green-500' 
                    : migrationStatus.hasLocalData 
                      ? 'bg-yellow-500' 
                      : 'bg-gray-400'
                }`} />
                <span className="font-medium">
                  {migrationStatus.hasFirebaseData 
                    ? 'Using Firebase Database' 
                    : migrationStatus.hasLocalData 
                      ? 'Using Local Storage' 
                      : 'No Data Found'
                  }
                </span>
              </div>
              <Badge variant={
                migrationStatus.hasFirebaseData 
                  ? 'default' 
                  : migrationStatus.hasLocalData 
                    ? 'secondary' 
                    : 'outline'
              }>
                {migrationStatus.hasFirebaseData ? 'Firebase' : migrationStatus.hasLocalData ? 'Local' : 'Empty'}
              </Badge>
            </div>

            {/* Local Data Summary */}
            {migrationStatus.hasLocalData && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Company</p>
                    <p className="font-semibold">1</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Clients</p>
                    <p className="font-semibold">{migrationStatus.localDataCount.clients}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                  <CheckSquare className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Tasks</p>
                    <p className="font-semibold">{migrationStatus.localDataCount.tasks}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg">
                  <Phone className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Phone Numbers</p>
                    <p className="font-semibold">{migrationStatus.localDataCount.phoneAssignments}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Migration Recommendation */}
            <div className={`p-4 rounded-lg ${
              migrationStatus.needed 
                ? 'bg-yellow-50 border border-yellow-200' 
                : migrationStatus.hasFirebaseData 
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="flex items-start space-x-3">
                {migrationStatus.needed ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                ) : migrationStatus.hasFirebaseData ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <Database className="h-5 w-5 text-gray-600 mt-0.5" />
                )}
                <div>
                  <p className="font-medium mb-1">
                    {migrationStatus.needed 
                      ? 'Migration Recommended' 
                      : migrationStatus.hasFirebaseData 
                        ? 'Already Using Firebase'
                        : 'No Data to Migrate'
                    }
                  </p>
                  <p className="text-sm text-gray-600">
                    {migrationStatus.needed 
                      ? 'You have local data that should be migrated to Firebase for better reliability and real-time updates.' 
                      : migrationStatus.hasFirebaseData 
                        ? 'Your data is already stored in Firebase. You can safely clear any remaining local data.'
                        : 'No data found in either local storage or Firebase.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Migration Actions */}
      {migrationStatus && (
        <Card className="p-6">
          <h4 className="text-lg font-semibold mb-4">Migration Actions</h4>
          
          <div className="space-y-3">
            {/* Migrate Button */}
            {migrationStatus.hasLocalData && (
              <Button
                onClick={() => performMigration(false)}
                disabled={isMigrating}
                className="w-full"
                size="lg"
              >
                {isMigrating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Migrating Data to Firebase...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Migrate All Data to Firebase
                  </>
                )}
              </Button>
            )}

            {/* Force Migrate Button (if Firebase data exists) */}
            {migrationStatus.hasLocalData && migrationStatus.hasFirebaseData && (
              <Button
                onClick={() => performMigration(true)}
                disabled={isMigrating}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Upload className="h-5 w-5 mr-2" />
                Force Migrate (Overwrite Firebase Data)
              </Button>
            )}

            {/* Clear Local Data Button */}
            {migrationStatus.hasLocalData && (
              <Button
                onClick={clearLocalData}
                disabled={isMigrating}
                variant="destructive"
                className="w-full"
                size="lg"
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Clear All Local Data
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Migration Results */}
      {migrationResults && (
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            {migrationResults.success ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-red-600" />
            )}
            <h4 className="text-lg font-semibold">
              Migration {migrationResults.success ? 'Completed' : 'Failed'}
            </h4>
          </div>

          <div className="space-y-4">
            {/* Migration Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-3 rounded-lg ${migrationResults.migrated.company ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Company</span>
                  {migrationResults.migrated.company ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {migrationResults.migrated.company ? 'Migrated' : 'Failed'}
                </p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Clients</span>
                  <span className="text-lg font-bold text-green-600">
                    {migrationResults.migrated.clients}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Migrated</p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Tasks</span>
                  <span className="text-lg font-bold text-green-600">
                    {migrationResults.migrated.tasks}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Migrated</p>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Phone Numbers</span>
                  <span className="text-lg font-bold text-green-600">
                    {migrationResults.migrated.phoneAssignments}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">Migrated</p>
              </div>
            </div>

            {/* Errors */}
            {migrationResults.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h5 className="font-medium text-red-800 mb-2">Migration Errors:</h5>
                <ul className="text-sm text-red-700 space-y-1">
                  {migrationResults.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
