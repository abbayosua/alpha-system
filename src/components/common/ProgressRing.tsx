'use client'

import { motion } from 'framer-motion'

interface ProgressRingProps {
  value: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  className?: string
}

export function ProgressRing({
  value,
  size = 80,
  strokeWidth = 8,
  color = 'stroke-emerald-500',
  label,
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clampedValue = Math.max(0, Math.min(100, value))
  const offset = circumference - (clampedValue / 100) * circumference
  const center = size / 2

  return (
    <div className={`flex flex-col items-center gap-1 ${className ?? ''}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={color}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      {/* Center percentage */}
      <div
        className="absolute flex items-center justify-center text-sm font-bold"
        style={{ width: size, height: size }}
      >
        {clampedValue}%
      </div>
      {/* Label */}
      {label && (
        <span className="text-xs text-muted-foreground mt-1">{label}</span>
      )}
    </div>
  )
}
