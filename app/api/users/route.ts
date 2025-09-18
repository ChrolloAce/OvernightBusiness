import { NextRequest, NextResponse } from 'next/server'
import { firebaseUserService } from '@/lib/firebase/company-service'

// GET users (filtered by company)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    
    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Missing companyId parameter'
      }, { status: 400 })
    }
    
    console.log('[Users API] Fetching users for company:', companyId)
    
    const users = await firebaseUserService.getUsersByCompany(companyId)
    
    console.log(`[Users API] Found ${users.length} users`)
    
    return NextResponse.json({
      success: true,
      users
    })
    
  } catch (error) {
    console.error('[Users API] Error fetching users:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch users'
    }, { status: 500 })
  }
}

// POST create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, role, companyId, permissions } = body
    
    console.log('[Users API] Creating user:', email)
    
    // Validate required fields
    if (!email || !name || !role || !companyId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: email, name, role, companyId'
      }, { status: 400 })
    }
    
    // Create user
    const user = await firebaseUserService.createUser({
      email,
      name,
      role,
      companyId,
      permissions: permissions || firebaseUserService.getDefaultPermissions(role)
    })
    
    console.log('[Users API] User created successfully:', user.id)
    
    return NextResponse.json({
      success: true,
      user,
      message: 'User created successfully'
    })
    
  } catch (error) {
    console.error('[Users API] Error creating user:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user'
    }, { status: 500 })
  }
}

// PUT update user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing user ID'
      }, { status: 400 })
    }
    
    console.log('[Users API] Updating user:', id)
    
    const user = await firebaseUserService.updateUser(id, updates)
    
    return NextResponse.json({
      success: true,
      user,
      message: 'User updated successfully'
    })
    
  } catch (error) {
    console.error('[Users API] Error updating user:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update user'
    }, { status: 500 })
  }
}

// DELETE user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing user ID'
      }, { status: 400 })
    }
    
    console.log('[Users API] Deleting user:', userId)
    
    await firebaseUserService.deleteUser(userId)
    
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
    
  } catch (error) {
    console.error('[Users API] Error deleting user:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete user'
    }, { status: 500 })
  }
}
