'use client'

import { useState, useEffect } from 'react'
import { Globe, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WebsiteScreenshotProps {
  website: string
  clientName: string
  className?: string
}

export function WebsiteScreenshot({ website, clientName, className = '' }: WebsiteScreenshotProps) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!website) {
      setIsLoading(false)
      setHasError(true)
      return
    }

    generateScreenshot()
  }, [website])

  const generateScreenshot = async () => {
    setIsLoading(true)
    setHasError(false)

    try {
      // Clean up the website URL
      let cleanUrl = website.trim()
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        cleanUrl = `https://${cleanUrl}`
      }

      console.log(`[WebsiteScreenshot] Creating preview for: ${cleanUrl}`)

      // Instead of using external screenshot APIs (which have CORS issues),
      // we'll create a beautiful preview card with the website favicon
      const domain = cleanUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
      
      // Use Google's favicon service (this usually works without CORS issues)
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
      
      // Test if the favicon loads
      const img = new Image()
      img.onload = () => {
        setScreenshotUrl(faviconUrl)
        setIsLoading(false)
      }
      img.onerror = () => {
        // If favicon fails, show the beautiful fallback card
        setHasError(true)
        setIsLoading(false)
      }
      img.src = faviconUrl

      // Timeout after 3 seconds
      setTimeout(() => {
        if (isLoading) {
          setHasError(true)
          setIsLoading(false)
        }
      }, 3000)

    } catch (error) {
      console.error(`[WebsiteScreenshot] Error generating preview for ${clientName}:`, error)
      setHasError(true)
      setIsLoading(false)
    }
  }

  const handleImageError = () => {
    console.log(`[WebsiteScreenshot] Screenshot failed to load for ${clientName}`)
    setHasError(true)
    setIsLoading(false)
  }

  const handleImageLoad = () => {
    console.log(`[WebsiteScreenshot] Screenshot loaded successfully for ${clientName}`)
    setIsLoading(false)
    setHasError(false)
  }

  if (isLoading) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
          <p className="text-sm text-gray-500">Loading screenshot...</p>
        </div>
      </div>
    )
  }

  if (hasError || !screenshotUrl) {
    // Create a beautiful website preview card
    const domain = website ? website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] : null
    
    return (
      <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-blue-200 ${className}`}>
        <div className="p-6 h-full flex flex-col justify-center items-center text-center">
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Globe className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{clientName}</h3>
          {domain && (
            <p className="text-sm text-blue-600 font-medium mb-2">{domain}</p>
          )}
          <p className="text-xs text-gray-500 mb-4">
            {website ? 'Live website preview' : 'No website configured'}
          </p>
          {website && (
            <a
              href={website.startsWith('http') ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Visit Website
            </a>
          )}
        </div>
      </div>
    )
  }

  // If we have a favicon URL, show a favicon-based preview
  const domain = website ? website.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0] : null
  
  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-blue-200 ${className}`}>
      <div className="p-6 h-full flex flex-col justify-center items-center text-center">
        {screenshotUrl ? (
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-gray-200">
            <img
              src={screenshotUrl}
              alt={`${clientName} favicon`}
              className="w-12 h-12 rounded-xl"
              onError={handleImageError}
            />
          </div>
        ) : (
          <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Globe className="h-8 w-8 text-white" />
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{clientName}</h3>
        {domain && (
          <p className="text-sm text-blue-600 font-medium mb-2">{domain}</p>
        )}
        <p className="text-xs text-gray-500 mb-4">
          {website ? 'Live website preview' : 'No website configured'}
        </p>
        {website && (
          <a
            href={website.startsWith('http') ? website : `https://${website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Visit Website
          </a>
        )}
      </div>
    </div>
  )
}
