import { NextRequest, NextResponse } from 'next/server'
import { firebaseCompanyService } from '@/lib/firebase/company-service'

// GET all companies
export async function GET(request: NextRequest) {
  try {
    console.log('[Companies API] Fetching all companies')
    
    const companies = await firebaseCompanyService.getAllCompanies()
    
    console.log(`[Companies API] Found ${companies.length} companies`)
    
    return NextResponse.json({
      success: true,
      companies
    })
    
  } catch (error) {
    console.error('[Companies API] Error fetching companies:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch companies'
    }, { status: 500 })
  }
}

// POST create new company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, website, industry, size, subscription } = body
    
    console.log('[Companies API] Creating company:', name)
    
    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: name and email'
      }, { status: 400 })
    }
    
    // Create company
    const company = await firebaseCompanyService.createCompany({
      name,
      email,
      phone: phone || undefined,
      website: website || undefined,
      industry: industry || 'Business Services',
      size: size || 'small',
      subscription: subscription || 'free',
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        allowUserInvitations: true,
        maxUsers: size === 'enterprise' ? 100 : size === 'large' ? 50 : size === 'medium' ? 20 : 10
      }
    })
    
    console.log('[Companies API] Company created successfully:', company.id)
    
    return NextResponse.json({
      success: true,
      company,
      message: 'Company created successfully'
    })
    
  } catch (error) {
    console.error('[Companies API] Error creating company:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create company'
    }, { status: 500 })
  }
}

// PUT update company
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body
    
    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing company ID'
      }, { status: 400 })
    }
    
    console.log('[Companies API] Updating company:', id)
    
    const company = await firebaseCompanyService.updateCompany(id, updates)
    
    return NextResponse.json({
      success: true,
      company,
      message: 'Company updated successfully'
    })
    
  } catch (error) {
    console.error('[Companies API] Error updating company:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update company'
    }, { status: 500 })
  }
}

// DELETE company
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('id')
    
    if (!companyId) {
      return NextResponse.json({
        success: false,
        error: 'Missing company ID'
      }, { status: 400 })
    }
    
    console.log('[Companies API] Deleting company:', companyId)
    
    await firebaseCompanyService.deleteCompany(companyId)
    
    return NextResponse.json({
      success: true,
      message: 'Company deleted successfully'
    })
    
  } catch (error) {
    console.error('[Companies API] Error deleting company:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete company'
    }, { status: 500 })
  }
}
