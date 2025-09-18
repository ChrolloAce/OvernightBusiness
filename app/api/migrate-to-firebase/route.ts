import { NextRequest, NextResponse } from 'next/server'
import { firebaseMigrationService } from '@/lib/firebase/migration-service'

// POST - Migrate all localStorage data to Firebase
export async function POST(request: NextRequest) {
  try {
    console.log('[Migration API] Starting data migration to Firebase...')
    
    // Check if migration is needed
    const migrationCheck = await firebaseMigrationService.isMigrationNeeded()
    
    console.log('[Migration API] Migration check:', migrationCheck)
    
    if (!migrationCheck.hasLocalData) {
      return NextResponse.json({
        success: false,
        message: 'No local data found to migrate',
        migrationCheck
      })
    }
    
    if (migrationCheck.hasFirebaseData && !migrationCheck.needed) {
      return NextResponse.json({
        success: false,
        message: 'Firebase data already exists. Migration may overwrite existing data.',
        migrationCheck,
        warning: 'Use force=true to proceed anyway'
      })
    }
    
    // Get force parameter
    const body = await request.json().catch(() => ({}))
    const force = body.force === true
    
    if (migrationCheck.hasFirebaseData && !force) {
      return NextResponse.json({
        success: false,
        message: 'Firebase data already exists. Use force=true to overwrite.',
        migrationCheck
      })
    }
    
    // Perform migration
    const migrationResults = await firebaseMigrationService.migrateAllDataToFirebase()
    
    console.log('[Migration API] Migration completed:', migrationResults)
    
    return NextResponse.json({
      success: migrationResults.success,
      message: migrationResults.success 
        ? 'All data successfully migrated to Firebase!' 
        : 'Migration completed with errors',
      results: migrationResults,
      migrationCheck
    })
    
  } catch (error) {
    console.error('[Migration API] Migration failed:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Migration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET - Check migration status
export async function GET(request: NextRequest) {
  try {
    console.log('[Migration API] Checking migration status...')
    
    const migrationCheck = await firebaseMigrationService.isMigrationNeeded()
    
    return NextResponse.json({
      success: true,
      migrationCheck,
      recommendation: migrationCheck.needed 
        ? 'Migration recommended - local data found without Firebase data'
        : migrationCheck.hasLocalData && migrationCheck.hasFirebaseData
          ? 'Both local and Firebase data exist - consider cleanup'
          : migrationCheck.hasFirebaseData
            ? 'Already using Firebase - no migration needed'
            : 'No data found in either location'
    })
    
  } catch (error) {
    console.error('[Migration API] Error checking migration status:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
