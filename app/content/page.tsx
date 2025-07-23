'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2, 
  Sparkles, 
  FileText, 
  MessageSquare,
  Globe,
  Phone,
  MapPin,
  Star,
  Calendar,
  Users,
  Camera,
  Tag,
  Zap,
  TrendingUp,
  Shield,
  Award,
  RefreshCw,
  Loader2,
  Eye,
  Settings,
  Target,
  BarChart3,
  Info,
  Plus,
  ExternalLink,
  Share,
  Navigation,
  BookOpen,
  Edit3,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Download,
  Copy,
  Send,
  PenTool,
  Image as ImageIcon,
  CalendarPlus,
  Wand2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BusinessProfilesStorage, SavedBusinessProfile } from '@/lib/business-profiles-storage'
import { GoogleBusinessAPI, MediaItem, BusinessMedia, BusinessReview } from '@/lib/google-business-api'
import { CentralizedDataLoader, BusinessQuestion, LocalPost } from '@/lib/centralized-data-loader'
import { GoogleAuthService } from '@/lib/google-auth'
import { schedulingService } from '@/lib/scheduling-service'
import { useProfile } from '@/contexts/profile-context'

// Business Logo Component
interface BusinessLogoProps {
  businessName: string
  website?: string
  className?: string
}

function BusinessLogo({ businessName, website, className = "w-16 h-16" }: BusinessLogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const loadLogo = async () => {
      if (!website && !businessName) {
        setIsLoading(false)
        setHasError(true)
        return
      }

      try {
        let domain = ''
        if (website) {
          try {
            domain = new URL(website).hostname.replace('www.', '')
          } catch {
            domain = website.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0]
          }
        }

        // Use a simple approach without CORS issues
        if (domain) {
          // Use Google's favicon service directly without testing
          setLogoUrl(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`)
          setIsLoading(false)
        } else {
          setHasError(true)
          setIsLoading(false)
        }
      } catch (error) {
        setHasError(true)
        setIsLoading(false)
      }
    }

    loadLogo()
  }, [businessName, website])

  if (isLoading) {
    return (
      <div className={`${className} bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-2xl flex items-center justify-center`}>
        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-gray-400 animate-spin" />
      </div>
    )
  }

  if (hasError || !logoUrl) {
    // Clean professional fallback with business initial
    const businessInitial = businessName ? businessName.charAt(0).toUpperCase() : 'B'
    return (
      <div className={`${className} bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 rounded-2xl flex flex-col items-center justify-center shadow-lg border border-blue-500/20`}>
        <div className="text-white font-bold text-lg sm:text-xl md:text-2xl">
          {businessInitial}
        </div>
        <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-200 mt-1 opacity-60" />
      </div>
    )
  }

  return (
    <div className={`${className} rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200/50 dark:border-gray-700/50`}>
      <Image
        src={logoUrl}
        alt={`${businessName} logo`}
        width={64}
        height={64}
        className="w-full h-full object-contain p-1 sm:p-2"
        onError={() => {
          setHasError(true)
          setLogoUrl(null)
        }}
        onLoad={() => setHasError(false)}
        unoptimized
      />
    </div>
  )
}

// Image Gallery Modal Component
interface ImageGalleryModalProps {
  images: MediaItem[]
  isOpen: boolean
  onClose: () => void
  selectedImageIndex?: number
}

function ImageGalleryModal({ images, isOpen, onClose, selectedImageIndex = 0 }: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(selectedImageIndex)

  useEffect(() => {
    setCurrentIndex(selectedImageIndex)
  }, [selectedImageIndex])

  if (!isOpen) return null

  const currentImage = images[currentIndex]

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const downloadImage = () => {
    if (currentImage) {
      const link = document.createElement('a')
      link.href = GoogleBusinessAPI.getBestImageUrl(currentImage) || ''
      link.download = `business-image-${currentIndex + 1}.jpg`
      link.click()
    }
  }

  const copyImageUrl = async () => {
    if (currentImage) {
      const imageUrl = GoogleBusinessAPI.getBestImageUrl(currentImage) || ''
      await navigator.clipboard.writeText(imageUrl)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-6xl h-full max-h-[90vh] bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-3xl border border-white/30 dark:border-white/20 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h3 className="text-xl font-bold">Business Photos</h3>
                <p className="text-sm opacity-75">{currentIndex + 1} of {images.length}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadImage}
                  className="text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyImageUrl}
                  className="text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div className="relative w-full h-full flex items-center justify-center">
            {currentImage && (
              <Image
                src={GoogleBusinessAPI.getBestImageUrl(currentImage) || ''}
                alt={`Business photo ${currentIndex + 1}`}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
                unoptimized
              />
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 backdrop-blur-sm rounded-full"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 backdrop-blur-sm rounded-full"
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}
          </div>

          {/* Thumbnail Grid */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6">
            <div className="flex space-x-2 overflow-x-auto">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    index === currentIndex ? 'border-white' : 'border-white/30 hover:border-white/60'
                  }`}
                >
                  <Image
                    src={GoogleBusinessAPI.getBestImageUrl(image) || ''}
                    alt={`Thumbnail ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// Image Grid Component
interface ImageGridProps {
  images: MediaItem[]
  maxDisplay?: number
  className?: string
}

function ImageGrid({ images, maxDisplay = 6, className = "" }: ImageGridProps) {
  const [showModal, setShowModal] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className={`${className} bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center`}>
        <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No photos available</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Add photos to showcase your business</p>
      </div>
    )
  }

  const displayImages = images.slice(0, maxDisplay)
  const remainingCount = Math.max(0, images.length - maxDisplay)

  const openModal = (index: number) => {
    setSelectedIndex(index)
    setShowModal(true)
  }

  return (
    <>
      <div className={`${className} grid grid-cols-2 md:grid-cols-3 gap-2 lg:gap-4`}>
        {displayImages.map((image, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="relative group cursor-pointer"
            onClick={() => openModal(index)}
          >
            <div className="aspect-square relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <Image
                src={GoogleBusinessAPI.getBestImageUrl(image) || ''}
                alt={`Business photo ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" />
              </div>
            </div>
          </motion.div>
        ))}
        
        {remainingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: displayImages.length * 0.1 }}
            className="relative group cursor-pointer"
            onClick={() => openModal(maxDisplay)}
          >
            <div className="aspect-square relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-2 border-dashed border-blue-300 dark:border-blue-600 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 flex items-center justify-center">
              <div className="text-center">
                <Plus className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  +{remainingCount} more
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <ImageGalleryModal
        images={images}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedImageIndex={selectedIndex}
      />
    </>
  )
}

// Business Updates Slider Component
interface BusinessUpdatesSliderProps {
  posts: LocalPost[]
  selectedProfile: SavedBusinessProfile
  formatPostDate: (dateString: string) => string
  getPostTypeIcon: (topicType: string) => any
  getPostTypeLabel: (topicType: string) => string
  getPostStateColor: (state: string) => string
  getActionTypeLabel: (actionType: string) => string
}

function BusinessUpdatesSlider({ 
  posts, 
  selectedProfile, 
  formatPostDate, 
  getPostTypeIcon, 
  getPostTypeLabel, 
  getPostStateColor, 
  getActionTypeLabel 
}: BusinessUpdatesSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const itemsPerView = 1 // Show one update at a time for better mobile experience
  const maxIndex = Math.max(0, posts.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No business updates available</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">Create posts to engage with your customers</p>
        <Button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Create Update
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Slider Navigation */}
      {posts.length > 1 && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {posts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={posts.length <= 1}
              className="w-8 h-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={posts.length <= 1}
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Updates Slider */}
      <div className="overflow-hidden rounded-xl">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {posts.map((post, index) => {
            const PostIcon = getPostTypeIcon(post.topicType)
            
            return (
              <div
                key={index}
                className="w-full flex-shrink-0 px-1"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 lg:p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm"
                >
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <PostIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {getPostTypeLabel(post.topicType)}
                          </Badge>
                          <Badge className={`text-xs ${getPostStateColor(post.state)}`}>
                            {post.state.replace('_', ' ').toLowerCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {formatPostDate(post.createTime)}
                        </p>
                      </div>
                    </div>
                    
                    {post.searchUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(post.searchUrl, '_blank')}
                        className="text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="space-y-4">
                    {/* Event Title */}
                    {post.event?.title && (
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {post.event.title}
                      </h3>
                    )}

                    {/* Post Summary */}
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                      {post.summary}
                    </p>

                    {/* Event Schedule */}
                    {post.event?.schedule && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          {new Date(post.event.schedule.startDate.year, post.event.schedule.startDate.month - 1, post.event.schedule.startDate.day).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          {post.event.schedule.startTime && (
                            ` at ${post.event.schedule.startTime.hours.toString().padStart(2, '0')}:${post.event.schedule.startTime.minutes.toString().padStart(2, '0')}`
                          )}
                        </span>
                      </div>
                    )}

                    {/* Offer Details */}
                    {post.offer && (
                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        {post.offer.couponCode && (
                          <div className="flex items-center gap-2 mb-2">
                            <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
                            <span className="font-mono text-sm font-bold text-green-700 dark:text-green-300">
                              {post.offer.couponCode}
                            </span>
                          </div>
                        )}
                        {post.offer.termsConditions && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                            {post.offer.termsConditions}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Post Media */}
                    {post.media && post.media.length > 0 && (
                      <div className="mt-4">
                        <ImageGrid 
                          images={post.media} 
                          maxDisplay={3}
                          className="w-full"
                        />
                      </div>
                    )}

                    {/* Call to Action */}
                    {post.callToAction && (
                      <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {post.callToAction.actionType === 'CALL' ? (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => window.open(`tel:${selectedProfile?.phone}`, '_self')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            {getActionTypeLabel(post.callToAction.actionType)}
                          </Button>
                        ) : post.callToAction.url ? (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => window.open(post.callToAction!.url, '_blank')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            {getActionTypeLabel(post.callToAction.actionType)}
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-sm">
                            {getActionTypeLabel(post.callToAction.actionType)}
                          </Badge>
                        )}
                        
                        {post.offer?.redeemOnlineUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(post.offer!.redeemOnlineUrl, '_blank')}
                            className="ml-2"
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            Redeem Online
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Products Slider Component
interface Product {
  id: string
  name: string
  description?: string
  price?: string
  image?: string
  category?: string
  availability?: 'available' | 'out_of_stock' | 'discontinued'
}

interface ProductsSliderProps {
  products: Product[]
  onAddProduct?: () => void
  onEditProduct?: (product: Product) => void
}

function ProductsSlider({ products, onAddProduct, onEditProduct }: ProductsSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(1)

  // Handle responsive breakpoints
  useEffect(() => {
    const updateItemsPerView = () => {
      if (typeof window !== 'undefined') {
        setItemsPerView(window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1)
      }
    }

    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  const maxIndex = Math.max(0, products.length - itemsPerView)

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">No products added yet</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Showcase your products and services to customers</p>
        <Button 
          onClick={onAddProduct}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Slider Navigation */}
      {products.length > itemsPerView && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {currentIndex + 1} - {Math.min(currentIndex + itemsPerView, products.length)} of {products.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={currentIndex === 0}
              className="w-8 h-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={currentIndex >= maxIndex}
              className="w-8 h-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={onAddProduct}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Products Slider */}
      <div className="overflow-hidden rounded-xl">
        <div 
          className="flex transition-transform duration-500 ease-in-out gap-4"
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              className="flex-shrink-0"
              style={{ width: `${100 / itemsPerView}%` }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border border-white/30 dark:border-white/20 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                onClick={() => onEditProduct?.(product)}
              >
                {/* Product Image */}
                <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Tag className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Availability Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge 
                      className={`text-xs ${
                        product.availability === 'available' 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : product.availability === 'out_of_stock'
                          ? 'bg-orange-100 text-orange-800 border-orange-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}
                    >
                      {product.availability === 'available' ? 'Available' : 
                       product.availability === 'out_of_stock' ? 'Out of Stock' : 'Discontinued'}
                    </Badge>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                      {product.name}
                    </h3>
                    {product.price && (
                      <span className="text-sm font-bold text-green-600 dark:text-green-400 ml-2">
                        {product.price}
                      </span>
                    )}
                  </div>
                  
                  {product.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                      {product.description}
                    </p>
                  )}
                  
                  {product.category && (
                    <Badge variant="secondary" className="text-xs">
                      {product.category}
                    </Badge>
                  )}
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Content Creation Modal Component
interface ContentCreationModalProps {
  isOpen: boolean
  onClose: () => void
  selectedProfile: SavedBusinessProfile | null
  onContentCreated: () => void
}

function ContentCreationModal({ isOpen, onClose, selectedProfile, onContentCreated }: ContentCreationModalProps) {
  const [contentPrompt, setContentPrompt] = useState('')
  const [postType, setPostType] = useState<'update' | 'offer' | 'event' | 'product'>('update')
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [callToActionText, setCallToActionText] = useState('')
  const [callToActionUrl, setCallToActionUrl] = useState('')
  const [activeTab, setActiveTab] = useState('create')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const resetForm = () => {
    setContentPrompt('')
    setGeneratedContent('')
    setScheduledDate('')
    setScheduledTime('')
    setCallToActionText('')
    setCallToActionUrl('')
    setSelectedImage(null)
    setImagePreview(null)
    setActiveTab('create')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const generateContent = async () => {
    if (!contentPrompt || !selectedProfile) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: contentPrompt,
          businessName: selectedProfile.name,
          businessType: selectedProfile.category,
          businessDescription: selectedProfile.googleData?.businessDescription || '',
          postType
        })
      })

      const data = await response.json()
      if (data.content) {
        setGeneratedContent(data.content)
        setActiveTab('preview')
      } else {
        throw new Error('No content generated')
      }
    } catch (error) {
      console.error('Error generating content:', error)
      alert('Failed to generate content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const postNow = async () => {
    if (!generatedContent || !selectedProfile) return

    setIsPosting(true)
    try {
      // Get the access token for authentication
      const googleAuth = GoogleAuthService.getInstance()
      const accessToken = await googleAuth.getValidAccessToken()

      let mediaUrl: string | undefined = undefined
      let enhancedContent = generatedContent

      // Handle image if selected
      if (selectedImage) {
        // For now, add a note about the image since direct media upload is complex
        enhancedContent = `${generatedContent}\n\n📸 [Image attached: ${selectedImage.name}]`
        
        // Try to upload image for future use
        try {
          const formData = new FormData()
          formData.append('image', selectedImage)
          formData.append('locationName', selectedProfile.googleBusinessId)

          const uploadResponse = await fetch('/api/google-business/upload-media', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            },
            body: formData
          })

          if (uploadResponse.ok) {
            const uploadData = await uploadResponse.json()
            mediaUrl = uploadData.mediaUrl || uploadData.googleUrl
            console.log('Image upload successful, but not included in post due to API limitations')
          }
        } catch (error) {
          console.warn('Image upload failed:', error)
        }
      }

      // Post immediately to Google Business Profile
      const response = await fetch('/api/google-business/local-posts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          businessProfileId: selectedProfile.googleBusinessId,
          content: enhancedContent,
          postType,
          mediaUrl,
          callToAction: callToActionText && callToActionUrl ? {
            text: callToActionText,
            url: callToActionUrl
          } : undefined
        })
      })

      if (response.ok) {
        alert('Post published successfully!')
        onContentCreated()
        handleClose()
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Failed to publish post'
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error posting content:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish post. Please try again.'
      
      if (errorMessage.includes('authenticate')) {
        alert('Authentication required. Please connect your Google Business Profile first.')
      } else {
        alert(errorMessage)
      }
    } finally {
      setIsPosting(false)
    }
  }

  const schedulePost = async () => {
    if (!generatedContent || !selectedProfile || !scheduledDate || !scheduledTime) {
      alert('Please fill in all required fields for scheduling')
      return
    }

    setIsPosting(true)
    try {
      // Validate authentication before scheduling
      const googleAuth = GoogleAuthService.getInstance()
      await googleAuth.getValidAccessToken() // This will throw if not authenticated

      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
      
      // Prepare content with image reference if needed
      let contentForScheduling = generatedContent
      if (selectedImage) {
        contentForScheduling = `${generatedContent}\n\n📸 [Image attached: ${selectedImage.name}]`
      }
      
      // Use the scheduling service to schedule the post
      schedulingService.schedulePost({
        businessProfileId: selectedProfile.googleBusinessId, // Use googleBusinessId for API calls
        businessName: selectedProfile.name,
        content: contentForScheduling,
        postType,
        status: 'scheduled',
        scheduledDate: scheduledDateTime.toISOString(),
        callToAction: callToActionText && callToActionUrl ? {
          text: callToActionText,
          url: callToActionUrl
        } : undefined
      })

      alert(`Post scheduled for ${scheduledDateTime.toLocaleString()}!`)
      onContentCreated()
      handleClose()
    } catch (error) {
      console.error('Error scheduling post:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to schedule post. Please try again.'
      
      if (errorMessage.includes('authenticate')) {
        alert('Authentication required. Please connect your Google Business Profile first.')
      } else {
        alert(errorMessage)
      }
    } finally {
      setIsPosting(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image size should be less than 10MB')
        return
      }
      
      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 30) // Minimum 30 minutes from now
    return now.toISOString().slice(0, 16)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white/95 dark:bg-black/95 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/20 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Content</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedProfile?.name}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full p-1 m-6 mb-0 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger value="create" className="flex-1">
                  <Wand2 className="w-4 h-4 mr-2" />
                  Create
                </TabsTrigger>
                <TabsTrigger value="preview" disabled={!generatedContent} className="flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="schedule" disabled={!generatedContent} className="flex-1">
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Schedule
                </TabsTrigger>
              </TabsList>

              {/* Create Tab */}
              <TabsContent value="create" className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="postType">Post Type</Label>
                    <Select value={postType} onValueChange={(value: 'update' | 'offer' | 'event' | 'product') => setPostType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="update">Business Update</SelectItem>
                        <SelectItem value="offer">Special Offer</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="product">Product/Service</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="prompt">Content Prompt</Label>
                    <textarea
                      id="prompt"
                      value={contentPrompt}
                      onChange={(e) => setContentPrompt(e.target.value)}
                      placeholder="Describe what you want to post about..."
                      className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Example: "Announce our new summer menu with fresh local ingredients" or "Promote our weekend special discount"
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="image">Add Image (Optional)</Label>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 mb-2">
                      💡 Images will be referenced in your post text. Direct image embedding is coming soon!
                    </p>
                    <div className="mt-2">
                      {!imagePreview ? (
                        <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <ImageIcon className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">Click to upload</span> an image
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG up to 10MB</p>
                          </div>
                          <input 
                            id="image" 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                        </label>
                      ) : (
                        <div className="relative">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {selectedImage?.name}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button 
                    onClick={generateContent}
                    disabled={!contentPrompt || isGenerating}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Content...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate Content with AI
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label>Generated Content</Label>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 min-h-32">
                      {imagePreview && (
                        <div className="mb-4">
                          <img 
                            src={imagePreview} 
                            alt="Post preview" 
                            className="w-full max-w-md h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      )}
                      <p className="whitespace-pre-wrap text-gray-900 dark:text-white">
                        {generatedContent}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ctaText">Call to Action Text (Optional)</Label>
                      <Input
                        id="ctaText"
                        value={callToActionText}
                        onChange={(e) => setCallToActionText(e.target.value)}
                        placeholder="Learn More, Book Now, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="ctaUrl">Call to Action URL (Optional)</Label>
                      <Input
                        id="ctaUrl"
                        type="url"
                        value={callToActionUrl}
                        onChange={(e) => setCallToActionUrl(e.target.value)}
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      onClick={postNow}
                      disabled={isPosting}
                      className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                    >
                      {isPosting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Post Now
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('schedule')}
                      variant="outline"
                      className="flex-1"
                    >
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      Schedule for Later
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Schedule Tab */}
              <TabsContent value="schedule" className="p-6">
                <div className="space-y-6">
                  <div>
                    <Label>Content to Schedule</Label>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-48 overflow-y-auto">
                      {imagePreview && (
                        <div className="mb-3">
                          <img 
                            src={imagePreview} 
                            alt="Post preview" 
                            className="w-full max-w-xs h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                        </div>
                      )}
                      <p className="whitespace-pre-wrap text-gray-900 dark:text-white text-sm">
                        {generatedContent}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduleDate">Schedule Date</Label>
                      <Input
                        id="scheduleDate"
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="scheduleTime">Schedule Time</Label>
                      <Input
                        id="scheduleTime"
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Scheduling Info</span>
                    </div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Posts can be scheduled at least 30 minutes in advance. Scheduled posts will be automatically published to your Google Business Profile at the specified time.
                    </p>
                  </div>

                  <Button 
                    onClick={schedulePost}
                    disabled={!scheduledDate || !scheduledTime || isPosting}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {isPosting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        Schedule Post
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default function ContentHubPage() {
  const { selectedProfile } = useProfile()
  const [businessMedia, setBusinessMedia] = useState<BusinessMedia | null>(null)
  const [reviews, setReviews] = useState<BusinessReview[]>([])
  const [reviewsSummary, setReviewsSummary] = useState<any>(null)
  const [questions, setQuestions] = useState<BusinessQuestion[]>([])
  const [localPosts, setLocalPosts] = useState<LocalPost[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [loadingQA, setLoadingQA] = useState(false)
  const [loadingPosts, setLoadingPosts] = useState(false)
  const [qaError, setQAError] = useState<string | null>(null)
  const [qaDebugInfo, setQaDebugInfo] = useState<any>(null)
  const [showQADebug, setShowQADebug] = useState(false)
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Products state
  const [products, setProducts] = useState<Product[]>([
    // Sample products for demonstration
    {
      id: '1',
      name: 'Premium Outdoor Kitchen Design',
      description: 'Custom outdoor kitchen with premium materials and professional installation',
      price: 'Starting at $15,000',
      category: 'Outdoor Kitchens',
      availability: 'available',
      image: '/api/placeholder/400/400'
    },
    {
      id: '2',
      name: 'Garden Landscape Design',
      description: 'Beautiful landscape design with native plants and modern aesthetics',
      price: '$5,000 - $12,000',
      category: 'Landscaping',
      availability: 'available',
      image: '/api/placeholder/400/400'
    },
    {
      id: '3',
      name: 'Patio Construction',
      description: 'Professional patio construction with various material options',
      price: 'Starting at $8,000',
      category: 'Construction',
      availability: 'available',
      image: '/api/placeholder/400/400'
    }
  ])

  // Auto-load data when profile changes
  useEffect(() => {
    if (selectedProfile) {
      loadAllProfileData(selectedProfile)
    }
  }, [selectedProfile])

  const loadAllProfileData = async (profile: SavedBusinessProfile) => {
    setLoading(true)
    setLoadingMedia(true)
    setLoadingReviews(true)
    setLoadingQA(true)
    setLoadingPosts(true)
    setQAError(null)

    try {
      // Load all data for the profile including Q&A and Local Posts
      const result = await CentralizedDataLoader.loadAllProfileData(profile, {
        includeReviews: true,
        includeAnalytics: false, // We don't need analytics in content hub
        includeMedia: true,
        includeQA: true,
        includePosts: true
      })

      if (result.success) {
        if (result.media) {
          setBusinessMedia(result.media)
        }
        if (result.reviews && result.reviewsSummary) {
          setReviews(result.reviews)
          setReviewsSummary(result.reviewsSummary)
        }
        if (result.questions) {
          setQuestions(result.questions)
          console.log('[ContentHub] Loaded Q&A:', result.questions.length, 'questions')
        }
        if (result.posts) {
          setLocalPosts(result.posts)
          console.log('[ContentHub] Loaded Local Posts:', result.posts.length, 'posts')
        }
        
        // Check for specific Q&A errors
        if (result.errors && result.errors.length > 0) {
          const qaErrors = result.errors.filter(error => error.includes('qa:'))
          if (qaErrors.length > 0) {
            setQAError(qaErrors.join('; '))
          }
        }
      } else {
        console.error('[ContentHub] Failed to load profile data:', result.errors)
        if (result.errors) {
          const qaErrors = result.errors.filter(error => error.includes('qa:'))
          if (qaErrors.length > 0) {
            setQAError(qaErrors.join('; '))
          }
        }
      }
    } catch (error) {
      console.error('Failed to load profile data:', error)
      setQAError(`Failed to load Q&A: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
      setLoadingMedia(false)
      setLoadingReviews(false)
      setLoadingQA(false)
      setLoadingPosts(false)
    }
  }

  const refreshData = () => {
    if (selectedProfile) {
      loadAllProfileData(selectedProfile)
    }
  }

  // Action button handlers
  const handleWebsiteClick = () => {
    if (selectedProfile?.website) {
      window.open(selectedProfile.website, '_blank')
    }
  }

  const handleDirectionsClick = () => {
    if (selectedProfile?.address) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selectedProfile.address)}`
      window.open(mapsUrl, '_blank')
    }
  }

  const handleReviewsClick = () => {
    if (selectedProfile?.googleBusinessId) {
      // Try to construct Google Business reviews URL
      const locationId = selectedProfile.googleBusinessId.split('/').pop()
      const reviewsUrl = `https://business.google.com/dashboard/l/${locationId}/reviews`
      window.open(reviewsUrl, '_blank')
    }
  }

  const handleShareClick = async () => {
    if (selectedProfile) {
      const shareData = {
        title: selectedProfile.name,
        text: `Check out ${selectedProfile.name} - ${selectedProfile.category}`,
        url: selectedProfile.website || window.location.href
      }

      try {
        if (navigator.share) {
          await navigator.share(shareData)
        } else {
          // Fallback: copy to clipboard
          await navigator.clipboard.writeText(shareData.url)
          alert('Link copied to clipboard!')
        }
      } catch (error) {
        console.error('Error sharing:', error)
      }
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatBusinessHours = (profile: SavedBusinessProfile) => {
    const hours = profile.googleData?.businessHours
    if (!hours || hours.length === 0) {
      return ['Hours not available']
    }

    // Group hours by time to show ranges like "Mon-Fri: 9:00 AM - 5:00 PM"
    const groupedHours: { [key: string]: string[] } = {}
    
    hours.forEach(hour => {
      const [day, time] = hour.split(': ')
      if (!groupedHours[time]) {
        groupedHours[time] = []
      }
      groupedHours[time].push(day)
    })

    return Object.entries(groupedHours).map(([time, days]) => {
      let dayRange = ''
      if (days.length === 1) {
        dayRange = days[0]
      } else if (days.length === 5 && days.includes('Monday') && days.includes('Friday')) {
        dayRange = 'Mon-Fri'
      } else if (days.length === 2 && days.includes('Saturday') && days.includes('Sunday')) {
        dayRange = 'Weekends'
      } else if (days.length === 7) {
        dayRange = 'Every day'
      } else {
        dayRange = days.join(', ')
      }
      
      return `${dayRange}: ${time}`
    })
  }

  const getBusinessCategories = (profile: SavedBusinessProfile) => {
    return profile.googleData?.allCategories || [profile.category]
  }

  const getBusinessServices = (profile: SavedBusinessProfile) => {
    return profile.googleData?.serviceTypes?.map(service => service.displayName) || []
  }

  // Helper function to format question date
  const formatQuestionDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Unknown date'
    }
  }

  // Helper functions for Local Posts
  const formatPostDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Unknown date'
    }
  }

  const getPostTypeIcon = (topicType: string) => {
    switch (topicType) {
      case 'EVENT':
        return Calendar
      case 'OFFER':
        return Tag
      case 'ALERT':
        return AlertTriangle
      default:
        return FileText
    }
  }

  const getPostTypeLabel = (topicType: string) => {
    switch (topicType) {
      case 'EVENT':
        return 'Event'
      case 'OFFER':
        return 'Offer'
      case 'ALERT':
        return 'Alert'
      case 'STANDARD':
        return 'Update'
      default:
        return 'Post'
    }
  }

  const getPostStateColor = (state: string) => {
    switch (state) {
      case 'LIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'PROCESSING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getActionTypeLabel = (actionType: string) => {
    switch (actionType) {
      case 'BOOK':
        return 'Book Now'
      case 'ORDER_ONLINE':
        return 'Order Online'
      case 'BUY':
        return 'Buy Now'
      case 'LEARN_MORE':
        return 'Learn More'
      case 'SIGN_UP':
        return 'Sign Up'
      case 'CALL':
        return 'Call Now'
      default:
        return actionType.replace('_', ' ').toLowerCase()
    }
  }

  // Product management functions
  const handleAddProduct = () => {
    // TODO: Open product creation modal
    console.log('Add product clicked')
  }

  const handleEditProduct = (product: Product) => {
    // TODO: Open product edit modal
    console.log('Edit product:', product)
  }

  return (
    <div className="min-h-screen">
      {/* Page Content */}
      <main className="p-4 lg:p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 lg:space-y-6"
        >
          {/* Page Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-red-500/10 rounded-xl lg:rounded-2xl blur-xl lg:blur-2xl" />
            <div className="relative bg-white/40 dark:bg-black/20 backdrop-blur-xl rounded-xl lg:rounded-2xl border border-white/20 dark:border-white/10 p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
                        Content Hub
                      </h1>
                      <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 font-medium">
                        Manage your business profile content and media
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    disabled={!selectedProfile}
                    className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <Plus className="w-4 h-4 mr-2 relative z-10" />
                    <span className="relative z-10">Create Content</span>
                  </Button>
                  <Button 
                    onClick={refreshData} 
                    disabled={loading || !selectedProfile}
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <RefreshCw className={`w-4 h-4 mr-2 relative z-10 ${loading ? 'animate-spin' : ''}`} />
                    <span className="relative z-10">Refresh Content</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {selectedProfile && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Business Overview */}
              <div className="lg:col-span-1 space-y-6">
                {/* Business Info Card */}
                <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4">
                      <BusinessLogo 
                        businessName={selectedProfile.name} 
                        website={selectedProfile.website}
                        className="w-16 h-16 lg:w-20 lg:h-20"
                      />
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                          {selectedProfile.name}
                        </h2>
                        <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400 truncate">
                          {selectedProfile.category}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {renderStars(reviewsSummary?.averageRating || selectedProfile.rating)}
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {(reviewsSummary?.averageRating || selectedProfile.rating).toFixed(1)} • {reviewsSummary?.totalReviews || selectedProfile.reviewCount || 0} Google reviews
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      {selectedProfile.website && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleWebsiteClick}
                          className="flex items-center justify-center gap-2 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300"
                        >
                          <Globe className="w-4 h-4" />
                          <span className="hidden sm:inline">Website</span>
                        </Button>
                      )}
                      {selectedProfile.address && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleDirectionsClick}
                          className="flex items-center justify-center gap-2 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300"
                        >
                          <Navigation className="w-4 h-4" />
                          <span className="hidden sm:inline">Directions</span>
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleReviewsClick}
                        className="flex items-center justify-center gap-2 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="hidden sm:inline">Reviews</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleShareClick}
                        className="flex items-center justify-center gap-2 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-white/30 dark:border-white/20 hover:bg-white/70 dark:hover:bg-black/30 transition-all duration-300"
                      >
                        <Share className="w-4 h-4" />
                        <span className="hidden sm:inline">Share</span>
                      </Button>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Contact Information</h3>
                      
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {selectedProfile.address}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {selectedProfile.phone}
                          </p>
                        </div>
                        
                        {selectedProfile.website && (
                          <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <a 
                              href={selectedProfile.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline transition-colors duration-300 truncate"
                            >
                              {selectedProfile.website.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Business Hours */}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Business Hours
                      </h3>
                      <div className="space-y-1">
                        {formatBusinessHours(selectedProfile).slice(0, 4).map((hour, index) => (
                          <div key={index} className="flex justify-between items-center py-1 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                              {hour.split(': ')[0]}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {hour.split(': ')[1]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Categories */}
                    {getBusinessCategories(selectedProfile).length > 0 && (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">Categories</h3>
                        <div className="flex flex-wrap gap-2">
                          {getBusinessCategories(selectedProfile).map((category, index) => (
                            <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Services */}
                {getBusinessServices(selectedProfile).length > 0 && (
                  <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        Services
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {getBusinessServices(selectedProfile).map((service, index) => (
                          <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Content Management */}
              <div className="lg:col-span-2 space-y-6">
                {/* Business Photos */}
                <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Business Photos
                      </div>
                      {businessMedia && businessMedia.allPhotos.length > 0 && (
                        <Badge variant="secondary">
                          {businessMedia.allPhotos.length} photos
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingMedia ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                          <p className="text-lg font-medium">Loading photos...</p>
                        </div>
                      </div>
                    ) : (
                      <ImageGrid 
                        images={businessMedia?.allPhotos || []} 
                        maxDisplay={6}
                        className="w-full"
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Photo Categories */}
                {businessMedia && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      { title: 'Exterior Photos', photos: businessMedia.exteriorPhotos, icon: Building2 },
                      { title: 'Interior Photos', photos: businessMedia.interiorPhotos, icon: Building2 },
                      { title: 'Product Photos', photos: businessMedia.productPhotos, icon: Tag },
                      { title: 'Team Photos', photos: businessMedia.teamPhotos, icon: Users }
                    ].map(({ title, photos, icon: Icon }) => 
                      photos.length > 0 && (
                        <Card key={title} className="bg-white/40 dark:bg-black/20 backdrop-blur-xl border-white/30 dark:border-white/20">
                          <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                              <Icon className="w-4 h-4" />
                              {title}
                              <Badge variant="secondary" className="ml-auto">
                                {photos.length}
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ImageGrid 
                              images={photos} 
                              maxDisplay={4}
                              className="w-full"
                            />
                          </CardContent>
                        </Card>
                      )
                    )}
                  </div>
                )}

                {/* Questions & Answers Section */}
                <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="w-5 h-5" />
                        Questions & Answers
                      </div>
                      <div className="flex items-center gap-2">
                        {questions.length > 0 && (
                          <Badge variant="secondary">
                            {questions.length} questions
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingQA ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                          <p className="text-lg font-medium">Loading Q&A...</p>
                        </div>
                      </div>
                    ) : qaError ? (
                      <div className="text-center py-12">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                        <p className="text-orange-600 dark:text-orange-400 font-medium mb-2">Q&A Loading Error</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{qaError}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          This could be due to API permissions or the business not having Q&A enabled.
                          <br />
                          Profile ID: {selectedProfile?.googleBusinessId}
                        </p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => loadAllProfileData(selectedProfile!)}
                          className="mt-4"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                      </div>
                    ) : questions.length > 0 ? (
                      <div className="space-y-6">
                        {/* Debug Info */}
                        {qaDebugInfo && (
                          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900 dark:text-white">Q&A API Debug Information</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setQaDebugInfo(null)}
                                className="w-6 h-6 p-0"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className={`w-3 h-3 rounded-full ${qaDebugInfo.success ? 'bg-green-500' : 'bg-red-500'}`} />
                                <span className="font-medium">
                                  API Test {qaDebugInfo.success ? 'Passed' : 'Failed'}
                                </span>
                              </div>
                              
                              {qaDebugInfo.details && (
                                <div className="mt-3">
                                  <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded border overflow-x-auto">
                                    {JSON.stringify(qaDebugInfo.details, null, 2)}
                                  </pre>
                                </div>
                              )}
                              
                              {qaDebugInfo.error && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                                  <p className="text-red-700 dark:text-red-400 font-medium">Error:</p>
                                  <p className="text-red-600 dark:text-red-300">{qaDebugInfo.error}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {questions.map((question, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 lg:p-6 bg-white/50 dark:bg-black/20 backdrop-blur-sm"
                          >
                            {/* Question */}
                            <div className="mb-4">
                              <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                                  <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                                    {question.text}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    <span>{question.author.displayName}</span>
                                    <span>•</span>
                                    <span>{formatQuestionDate(question.createTime)}</span>
                                    {question.upvoteCount && question.upvoteCount > 0 && (
                                      <>
                                        <span>•</span>
                                        <span>{question.upvoteCount} upvotes</span>
                                      </>
                                    )}
                                    {question.totalAnswerCount > 0 && (
                                      <>
                                        <span>•</span>
                                        <span>{question.totalAnswerCount} {question.totalAnswerCount === 1 ? 'answer' : 'answers'}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Answers */}
                            {question.topAnswers && question.topAnswers.length > 0 && (
                              <div className="space-y-3 ml-8 lg:ml-11">
                                {question.topAnswers.map((answer, answerIndex) => (
                                  <div key={answerIndex} className="border-l-2 border-green-200 dark:border-green-800 pl-4">
                                    <div className="flex items-start gap-3">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        answer.author.type === 'MERCHANT' 
                                          ? 'bg-green-100 dark:bg-green-900/30' 
                                          : 'bg-gray-100 dark:bg-gray-800'
                                      }`}>
                                        {answer.author.type === 'MERCHANT' ? (
                                          <Building2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                                        ) : (
                                          <Users className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                                          {answer.text}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                                          <span className={answer.author.type === 'MERCHANT' ? 'font-medium text-green-600 dark:text-green-400' : ''}>
                                            {answer.author.displayName}
                                          </span>
                                          {answer.author.type === 'MERCHANT' && (
                                            <>
                                              <span>•</span>
                                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                                                Business Owner
                                              </Badge>
                                            </>
                                          )}
                                          {answer.author.type === 'LOCAL_GUIDE' && (
                                            <>
                                              <span>•</span>
                                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800">
                                                Local Guide
                                              </Badge>
                                            </>
                                          )}
                                          <span>•</span>
                                          <span>{formatQuestionDate(answer.createTime)}</span>
                                          {answer.upvoteCount && answer.upvoteCount > 0 && (
                                            <>
                                              <span>•</span>
                                              <span>{answer.upvoteCount} upvotes</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* No answers state */}
                            {(!question.topAnswers || question.topAnswers.length === 0) && (
                              <div className="ml-8 lg:ml-11 text-sm text-gray-500 dark:text-gray-400 italic">
                                No answers yet
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No questions & answers available</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Customers can ask questions about your business on Google</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Local Posts Section */}
                <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Business Updates
                      </div>
                      <div className="flex items-center gap-2">
                        {localPosts.length > 0 && (
                          <Badge variant="secondary">
                            {localPosts.length} posts
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingPosts ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                          <p className="text-lg font-medium">Loading posts...</p>
                        </div>
                      </div>
                    ) : localPosts.length > 0 ? (
                      <BusinessUpdatesSlider
                        posts={localPosts}
                        selectedProfile={selectedProfile}
                        formatPostDate={formatPostDate}
                        getPostTypeIcon={getPostTypeIcon}
                        getPostTypeLabel={getPostTypeLabel}
                        getPostStateColor={getPostStateColor}
                        getActionTypeLabel={getActionTypeLabel}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No business updates available</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Create posts to engage with your customers</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Products Section */}
                <Card className="bg-white/60 dark:bg-black/30 backdrop-blur-xl border-white/30 dark:border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        Products
                      </div>
                      <div className="flex items-center gap-2">
                        {products.length > 0 && (
                          <Badge variant="secondary">
                            {products.length} products
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                          <p className="text-lg font-medium">Loading products...</p>
                        </div>
                      </div>
                    ) : products.length > 0 ? (
                      <ProductsSlider
                        products={products}
                        onAddProduct={handleAddProduct}
                        onEditProduct={handleEditProduct}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <Tag className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">No products added yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">Showcase your products and services to customers</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Content Creation Modal */}
      <ContentCreationModal 
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        selectedProfile={selectedProfile}
        onContentCreated={refreshData}
      />
    </div>
  )
} 