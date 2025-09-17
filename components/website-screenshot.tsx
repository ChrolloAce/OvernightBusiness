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

      // Use ScreenshotOne API (free tier available)
      // Format: https://api.screenshotone.com/take?url=ENCODED_URL&viewport_width=1200&viewport_height=800&device_scale_factor=1&format=png&block_ads=true&block_cookie_banners=true&delay=2
      const params = new URLSearchParams({
        url: cleanUrl,
        viewport_width: '1200',
        viewport_height: '800',
        device_scale_factor: '1',
        format: 'png',
        block_ads: 'true',
        block_cookie_banners: 'true',
        delay: '2',
        full_page: 'false',
        fresh: 'true' // Always get fresh screenshot when manually refreshing
      })

      const screenshotApiUrl = `https://api.screenshotone.com/take?${params.toString()}`
      setScreenshotUrl(screenshotApiUrl)
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
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-medium">{clientName}</p>
          <p className="text-xs text-gray-500 mt-1">
            {website ? 'Screenshot unavailable' : 'No website'}
          </p>
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
