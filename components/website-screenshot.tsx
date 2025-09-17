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

      console.log(`[WebsiteScreenshot] Generating screenshot for: ${cleanUrl}`)

      // Try multiple free screenshot services
      const services = [
        // Free service that doesn't require API key
        `https://api.urlbox.io/v1/ca482d7e-9417-4569-90fe-80f7c5e1c781/png?url=${encodeURIComponent(cleanUrl)}&width=1200&height=800&delay=2000`,
        // Alternative free service
        `https://htmlcsstoimage.com/demo_images/image.png`, // Demo image as fallback
        // Another alternative (may work without key)
        `https://api.screenshotmachine.com/?key=demo&url=${encodeURIComponent(cleanUrl)}&dimension=1200x800&format=png&delay=2000`
      ]

      // Try the first service
      try {
        const response = await fetch(services[0])
        if (response.ok) {
          setScreenshotUrl(services[0])
          setIsLoading(false)
          return
        }
      } catch (e) {
        console.log(`[WebsiteScreenshot] First service failed for ${clientName}`)
      }

      // If services fail, create a custom website preview card
      setHasError(true)
      setIsLoading(false)
    } catch (error) {
      console.error(`[WebsiteScreenshot] Error generating screenshot for ${clientName}:`, error)
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

  return (
    <div className={`relative group overflow-hidden rounded-lg border border-gray-200 bg-white ${className}`}>
      <img
        src={screenshotUrl}
        alt={`${clientName} website screenshot`}
        className="w-full h-full object-cover"
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      
      {/* Overlay with website info */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300">
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm font-medium truncate">{clientName}</p>
              <p className="text-xs opacity-80 truncate">{website}</p>
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  generateScreenshot()
                }}
                className="h-6 w-6 p-0 hover:bg-white/20 text-white"
                title="Reload screenshot"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <a
                href={website.startsWith('http') ? website : `https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-white/20 rounded transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
