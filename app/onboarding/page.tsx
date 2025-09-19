'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Building2, 
  Users, 
  Globe,
  Phone,
  Mail,
  MapPin,
  Loader2,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { DebugAuth } from '@/components/debug-auth'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, completeOnboarding, signOut } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [companyData, setCompanyData] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    website: '',
    industry: 'Business Services',
    size: 'small'
  })

  const handleNextStep = () => {
    if (currentStep === 1 && (!companyData.name || !companyData.email)) {
      setError('Please fill in company name and email')
      return
    }
    
    setError(null)
    setCurrentStep(currentStep + 1)
  }

  const handleCompleteOnboarding = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('[Onboarding] Completing onboarding with company data:', companyData)
      
      const result = await completeOnboarding(companyData)
      
      console.log('[Onboarding] Onboarding completed:', {
        user: result.user.email,
        company: result.company.name
      })
      
      // Show success and redirect
      alert(`🎉 Welcome to OvernightBiz!\n\nYour company "${result.company.name}" has been created.\nYou are now the owner with full access.`)
      
      router.push('/dashboard')
    } catch (error: any) {
      console.error('[Onboarding] Error completing onboarding:', error)
      setError(error.message || 'Failed to complete onboarding')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      console.log('[Onboarding] Signing out user...')
      await signOut()
      
      // Clear all localStorage data
      localStorage.clear()
      
      // Force reload to clear all state
      window.location.href = '/'
    } catch (error) {
      console.error('Error signing out:', error)
      // Force reload even if signout fails
      localStorage.clear()
      window.location.href = '/'
    }
  }

  const steps = [
    { number: 1, title: 'Company Information', icon: Building2 },
    { number: 2, title: 'Contact Details', icon: Mail },
    { number: 3, title: 'Complete Setup', icon: CheckCircle }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.number 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {currentStep > step.number ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= step.number ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gray-300 mx-4" />
              )}
            </div>
          ))}
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center relative">
            {/* Sign Out Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Button>
            
            <CardTitle className="text-xl font-bold text-gray-900">
              {currentStep === 1 && 'Tell us about your company'}
              {currentStep === 2 && 'Contact information'}
              {currentStep === 3 && 'Ready to get started!'}
            </CardTitle>
            <p className="text-gray-600 mt-2">
              {currentStep === 1 && 'We\'ll create your company profile in our system'}
              {currentStep === 2 && 'How can clients and team members reach you?'}
              {currentStep === 3 && 'Your company is ready to be created'}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              </motion.div>
            )}

            {/* Step 1: Company Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <div className="relative mt-1">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="companyName"
                      value={companyData.name}
                      onChange={(e) => setCompanyData(prev => ({...prev, name: e.target.value}))}
                      className="pl-10 h-12"
                      placeholder="Enter your company name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="companyEmail">Company Email *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="companyEmail"
                      type="email"
                      value={companyData.email}
                      onChange={(e) => setCompanyData(prev => ({...prev, email: e.target.value}))}
                      className="pl-10 h-12"
                      placeholder="Enter company email"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry</Label>
                    <Select value={companyData.industry} onValueChange={(value) => setCompanyData(prev => ({...prev, industry: value}))}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Business Services">Business Services</SelectItem>
                        <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                        <SelectItem value="Construction">Construction</SelectItem>
                        <SelectItem value="Home Services">Home Services</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="size">Company Size</Label>
                    <Select value={companyData.size} onValueChange={(value) => setCompanyData(prev => ({...prev, size: value}))}>
                      <SelectTrigger className="h-12">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup (1-2 people)</SelectItem>
                        <SelectItem value="small">Small (3-10 people)</SelectItem>
                        <SelectItem value="medium">Medium (11-50 people)</SelectItem>
                        <SelectItem value="large">Large (51-200 people)</SelectItem>
                        <SelectItem value="enterprise">Enterprise (200+ people)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Contact Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="companyPhone"
                      value={companyData.phone}
                      onChange={(e) => setCompanyData(prev => ({...prev, phone: e.target.value}))}
                      className="pl-10 h-12"
                      placeholder="Enter company phone number"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="companyWebsite">Company Website</Label>
                  <div className="relative mt-1">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="companyWebsite"
                      value={companyData.website}
                      onChange={(e) => setCompanyData(prev => ({...prev, website: e.target.value}))}
                      className="pl-10 h-12"
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Complete Setup */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-4">Company Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Company:</span>
                      <span className="font-medium">{companyData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{companyData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Industry:</span>
                      <span className="font-medium">{companyData.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span className="font-medium">{companyData.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Your Role:</span>
                      <span className="font-medium text-blue-600">Owner (Full Access)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 text-sm font-medium">
                      Ready to create your company and start managing clients!
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
              
              <div className="flex-1" />
              
              {currentStep < 3 ? (
                <Button
                  onClick={handleNextStep}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleCompleteOnboarding}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Creating company...
                    </>
                  ) : (
                    <>
                      <Building2 className="mr-2 h-4 w-4" />
                      Create Company & Continue
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            You can always update this information later in your company settings
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Signed in as: <span className="font-medium">{user?.email}</span>
          </p>
        </div>
      </motion.div>
      
      {/* Debug Component */}
      <DebugAuth />
    </div>
  )
}
