'use client'

import React from 'react'
import { ClearLocalData } from '@/components/clear-local-data'
import { FirebaseSetup } from '@/components/firebase-setup'

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Firebase Database Setup
          </h1>
          <p className="text-lg text-gray-600">
            Set up your Firebase database and clear local storage data
          </p>
        </div>

        <div className="space-y-8">
          {/* Step 1: Clear Local Data */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Step 1: Clear Local Data
            </h2>
            <ClearLocalData />
          </div>

          {/* Step 2: Setup Firebase */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Step 2: Setup Firebase Database
            </h2>
            <FirebaseSetup />
          </div>
        </div>
      </div>
    </div>
  )
}
