'use client'

import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface KPICardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  subtitle?: string
  loading?: boolean
}

export function KPICard({ title, value, change, trend, icon: Icon, subtitle, loading }: KPICardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getTrendBg = () => {
    switch (trend) {
      case 'up': return 'bg-green-50 border-green-200'
      case 'down': return 'bg-red-50 border-red-200'
      default: return 'bg-gray-50 border-gray-200'
    }
  }

  const TrendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : null

  return (
    <Card className="bg-white shadow-sm border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900">{loading ? '...' : value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border ${getTrendBg()} ${getTrendColor()}`}>
            {TrendIcon && <TrendIcon className="h-3 w-3" />}
            <span className="text-xs font-semibold">
              {loading ? '...' : change}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
