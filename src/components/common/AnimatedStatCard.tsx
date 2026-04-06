'use client'

import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedCounter } from './AnimatedCounter'

interface AnimatedStatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  borderColor: string
  bgClass?: string
  prefix?: string
  suffix?: string
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  className?: string
}

export function AnimatedStatCard({
  icon,
  label,
  value,
  borderColor,
  bgClass = 'bg-card',
  prefix = '',
  suffix = '',
  trend,
  className,
}: AnimatedStatCardProps) {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl border p-4 shadow-sm',
        borderColor,
        bgClass,
        className
      )}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <div className="text-2xl font-bold">
            <AnimatedCounter
              value={value}
              prefix={prefix}
              suffix={suffix}
            />
          </div>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend.direction === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              )}
            >
              {trend.direction === 'up' ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            bgClass === 'bg-card' ? 'bg-muted' : 'bg-white/20'
          )}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
