'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilesPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to content page since that's where Google Business Profiles are managed
    router.replace('/content')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Redirecting to Content Hub...</h2>
        <p className="text-gray-600">Google Business Profiles are managed in the Content Hub</p>
      </div>
    </div>
  )
}
