'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

type ActionVariant = 'default' | 'emerald' | 'amber' | 'rose'

type QuickAction = {
  label: string
  icon: React.ReactNode
  href: string
  variant?: ActionVariant
}

type QuickActionsProps = {
  actions: QuickAction[]
  title?: string
}

const variantStyles: Record<ActionVariant, { bg: string; iconBg: string; iconColor: string }> = {
  default: {
    bg: 'bg-muted hover:bg-muted/80',
    iconBg: 'bg-muted-foreground/10',
    iconColor: 'text-muted-foreground',
  },
  emerald: {
    bg: 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    bg: 'bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/30 dark:hover:bg-amber-950/50',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  rose: {
    bg: 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/50',
    iconBg: 'bg-rose-100 dark:bg-rose-900/50',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

export default function QuickActions({ actions, title }: QuickActionsProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {title && (
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
          Aksi Cepat
        </h2>
      )}
      <div className="flex gap-3 overflow-x-auto lg:grid lg:grid-cols-4 lg:overflow-visible pb-2 lg:pb-0 custom-scrollbar">
        {actions.map((action) => {
          const variant = action.variant || 'default'
          const styles = variantStyles[variant]

          return (
            <motion.div key={action.href} variants={itemVariants} className="min-w-[100px]">
              <Link href={action.href}>
                <div
                  className={`flex flex-col items-center gap-2.5 p-4 rounded-xl transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-md ${styles.bg}`}
                >
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${styles.iconBg} ${styles.iconColor}`}
                  >
                    {action.icon}
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">
                    {action.label}
                  </span>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
