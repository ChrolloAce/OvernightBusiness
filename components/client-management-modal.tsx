'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  X, 
  Mail, 
  User, 
  Building2, 
  Phone, 
  Calendar, 
  Settings,
  Check,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { ClientInfo, ClientManagementStorage } from '@/lib/client-management'
import { SavedBusinessProfile } from '@/lib/business-profiles-storage'

const clientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
  phone: z.string().optional(),
  reportFrequency: z.enum(['weekly', 'monthly']),
  reportDay: z.number().min(0).max(31),
  isActive: z.boolean(),
  preferences: z.object({
    includePhotos: z.boolean(),
    includeUpdates: z.boolean(),
    includeReviews: z.boolean(),
    includeAnalytics: z.boolean(),
    includeQA: z.boolean()
  })
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientManagementModalProps {
  isOpen: boolean
  onClose: () => void
  businessProfile: SavedBusinessProfile
  client?: ClientInfo
  onSave: (client: ClientInfo) => void
}

export function ClientManagementModal({
  isOpen,
  onClose,
  businessProfile,
  client,
  onSave
}: ClientManagementModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      phone: '',
      reportFrequency: 'weekly',
      reportDay: 1,
      isActive: true,
      preferences: {
        includePhotos: true,
        includeUpdates: true,
        includeReviews: true,
        includeAnalytics: true,
        includeQA: true
      }
    }
  })

  const reportFrequency = watch('reportFrequency')

  // Load client data when editing
  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        email: client.email,
        company: client.company || '',
        phone: client.phone || '',
        reportFrequency: client.reportFrequency,
        reportDay: client.reportDay,
        isActive: client.isActive,
        preferences: client.preferences
      })
    } else {
      reset({
        name: '',
        email: '',
        company: '',
        phone: '',
        reportFrequency: 'weekly',
        reportDay: 1,
        isActive: true,
        preferences: {
          includePhotos: true,
          includeUpdates: true,
          includeReviews: true,
          includeAnalytics: true,
          includeQA: true
        }
      })
    }
  }, [client, reset])

  const onSubmit = async (data: ClientFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      let savedClient: ClientInfo

      if (client) {
        // Update existing client
        savedClient = ClientManagementStorage.updateClient(client.id, {
          ...data,
          businessProfileId: businessProfile.id
        })!
      } else {
        // Create new client
        savedClient = ClientManagementStorage.addClient({
          ...data,
          businessProfileId: businessProfile.id
        })
      }

      onSave(savedClient)
      onClose()
    } catch (err) {
      setError('Failed to save client information')
      console.error('Error saving client:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getDayOptions = () => {
    if (reportFrequency === 'weekly') {
      return [
        { value: 0, label: 'Sunday' },
        { value: 1, label: 'Monday' },
        { value: 2, label: 'Tuesday' },
        { value: 3, label: 'Wednesday' },
        { value: 4, label: 'Thursday' },
        { value: 5, label: 'Friday' },
        { value: 6, label: 'Saturday' }
      ]
    } else {
      return Array.from({ length: 31 }, (_, i) => ({
        value: i + 1,
        label: `${i + 1}${getOrdinalSuffix(i + 1)}`
      }))
    }
  }

  const getOrdinalSuffix = (num: number) => {
    const j = num % 10
    const k = num % 100
    if (j === 1 && k !== 11) return 'st'
    if (j === 2 && k !== 12) return 'nd'
    if (j === 3 && k !== 13) return 'rd'
    return 'th'
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">
                  {client ? 'Edit Client' : 'Add New Client'}
                </h2>
                <p className="text-blue-100 mt-1">
                  {businessProfile.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Client Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="John Smith"
                      className="mt-1"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder="john@example.com"
                      className="mt-1"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="company">Company (Optional)</Label>
                    <Input
                      id="company"
                      {...register('company')}
                      placeholder="ABC Corporation"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      {...register('phone')}
                      placeholder="+1 (555) 123-4567"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Report Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Report Schedule
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={reportFrequency}
                      onValueChange={(value: 'weekly' | 'monthly') => setValue('reportFrequency', value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="day">
                      {reportFrequency === 'weekly' ? 'Day of Week' : 'Day of Month'}
                    </Label>
                    <Select
                      value={watch('reportDay').toString()}
                      onValueChange={(value) => setValue('reportDay', parseInt(value))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getDayOptions().map(option => (
                          <SelectItem key={option.value} value={option.value.toString()}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={watch('isActive')}
                    onCheckedChange={(checked) => setValue('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Enable automatic reports</Label>
                </div>
              </div>

              {/* Report Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Report Content
                </h3>

                <div className="space-y-3">
                  {[
                    { key: 'includeAnalytics', label: 'Performance Analytics', desc: 'Views, searches, and customer actions' },
                    { key: 'includeReviews', label: 'Customer Reviews', desc: 'New reviews and rating analysis' },
                    { key: 'includePhotos', label: 'Business Photos', desc: 'New photos and visual content' },
                    { key: 'includeUpdates', label: 'Business Updates', desc: 'Posts, offers, and announcements' },
                    { key: 'includeQA', label: 'Questions & Answers', desc: 'Customer questions and responses' }
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <div className="font-medium">{label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{desc}</div>
                      </div>
                      <Switch
                        checked={watch(`preferences.${key as keyof ClientFormData['preferences']}`)}
                        onCheckedChange={(checked) => 
                          setValue(`preferences.${key as keyof ClientFormData['preferences']}`, checked)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      {client ? 'Update Client' : 'Add Client'}
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
} 