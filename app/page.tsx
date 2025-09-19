'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Building2, 
  Users,
  BarChart3,
  Phone,
  Globe,
  ArrowRight,
  CheckCircle,
  Chrome
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DebugAuth } from '@/components/debug-auth'
export default function LandingPage() {
  const features = [
    {
      icon: Users,
      title: 'Client Management',
      description: 'Organize and manage all your clients in one centralized dashboard'
    },
    {
      icon: Phone,
      title: 'Phone System',
      description: 'Track calls and manage phone numbers with Twilio integration'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Get insights into your business performance with detailed analytics'
    },
    {
      icon: Building2,
      title: 'Google Business Profiles',
      description: 'Manage multiple Google Business Profiles and automate content'
    },
    {
      icon: Globe,
      title: 'Multi-Company Support',
      description: 'Manage multiple companies and teams from one platform'
    },
    {
      icon: CheckCircle,
      title: 'Task Management',
      description: 'Keep track of tasks, deals, and important business activities'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <img 
                src="/innercircle.png" 
                alt="OvernightBiz" 
                className="w-16 h-16 rounded-2xl"
              />
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                OvernightBiz
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The complete business management platform for modern companies. 
              Manage clients, track calls, automate content, and grow your business overnight.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-4">
                  <Chrome className="mr-2 h-5 w-5" />
                  Sign In
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500">
              No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything you need to run your business
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From client management to automated marketing, OvernightBiz has all the tools 
            you need to scale your business efficiently.
          </p>
        </motion.div>

        <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 * index }}
            >
              <Card className="h-full bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/20"
        >
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to transform your business?
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of businesses already using OvernightBiz to streamline their operations.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-4">
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-4">
                Sign In to Existing Account
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-white/20">
        <div className="text-center text-gray-600">
          <p>&copy; 2024 OvernightBiz. All rights reserved.</p>
          <p className="text-sm mt-2">Premium Business Suite for Modern Companies</p>
        </div>
      </footer>
      
      {/* Debug Component */}
      <DebugAuth />
    </div>
  )
} 