'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Phone, PhoneForwarded, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface PhoneStatusIndicatorProps {
  isActive: boolean
  isForwarding?: boolean
  hasError?: boolean
  lastCallAt?: Date | string | null
  totalCalls?: number
  className?: string
}

export function PhoneStatusIndicator({
  isActive,
  isForwarding = false,
  hasError = false,
  lastCallAt,
  totalCalls = 0,
  className
}: PhoneStatusIndicatorProps) {
  // Determine status color and icon
  const getStatusInfo = () => {
    if (hasError) {
      return {
        color: 'bg-red-500',
        pulseColor: 'bg-red-400',
        icon: AlertCircle,
        text: 'Error',
        textColor: 'text-red-600'
      }
    }
    
    if (isForwarding && isActive) {
      return {
        color: 'bg-green-500',
        pulseColor: 'bg-green-400',
        icon: PhoneForwarded,
        text: 'Forwarding Active',
        textColor: 'text-green-600'
      }
    }
    
    if (isActive) {
      return {
        color: 'bg-blue-500',
        pulseColor: 'bg-blue-400',
        icon: CheckCircle,
        text: 'Active',
        textColor: 'text-blue-600'
      }
    }
    
    return {
      color: 'bg-gray-400',
      pulseColor: 'bg-gray-300',
      icon: Phone,
      text: 'Inactive',
      textColor: 'text-gray-500'
    }
  }
  
  const status = getStatusInfo()
  const Icon = status.icon
  
  // Format last call time
  const formatLastCall = (date: Date | string | null | undefined) => {
    if (!date) return 'No calls yet'
    
    const callDate = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const diffMs = now.getTime() - callDate.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    
    return callDate.toLocaleDateString()
  }
  
  return (
    <div className={cn('flex items-center space-x-3', className)}>
      {/* Animated Status Indicator */}
      <div className="relative">
        <div className="relative flex h-3 w-3">
          {isActive && !hasError && (
            <span className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              status.pulseColor
            )} />
          )}
          <span className={cn(
            'relative inline-flex rounded-full h-3 w-3',
            status.color
          )} />
        </div>
      </div>
      
      {/* Status Text and Info */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <Icon className={cn('h-4 w-4', status.textColor)} />
          <span className={cn('text-sm font-medium', status.textColor)}>
            {status.text}
          </span>
          {totalCalls > 0 && (
            <span className="text-xs text-gray-500">
              ({totalCalls} call{totalCalls !== 1 ? 's' : ''})
            </span>
          )}
        </div>
        
        {lastCallAt && (
          <div className="flex items-center space-x-1 mt-1">
            <Clock className="h-3 w-3 text-gray-400" />
            <span className="text-xs text-gray-500">
              Last call: {formatLastCall(lastCallAt)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// Mini version for compact displays
export function PhoneStatusDot({
  isActive,
  hasError = false,
  className
}: {
  isActive: boolean
  hasError?: boolean
  className?: string
}) {
  const color = hasError 
    ? 'bg-red-500' 
    : isActive 
      ? 'bg-green-500' 
      : 'bg-gray-400'
  
  const pulseColor = hasError
    ? 'bg-red-400'
    : isActive
      ? 'bg-green-400'
      : ''
  
  return (
    <div className={cn('relative', className)}>
      <div className="relative flex h-2 w-2">
        {isActive && !hasError && (
          <span className={cn(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            pulseColor
          )} />
        )}
        <span className={cn(
          'relative inline-flex rounded-full h-2 w-2',
          color
        )} />
      </div>
    </div>
  )
}
