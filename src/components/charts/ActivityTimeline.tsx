'use client'

import { motion } from 'framer-motion'

interface TimelineItem {
  id: string
  title: string
  description: string
  time: string
  icon: React.ReactNode
  color: string
}

interface ActivityTimelineProps {
  items: TimelineItem[]
  className?: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export function ActivityTimeline({ items, className }: ActivityTimelineProps) {
  if (!items || items.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className ?? ''}`}>
        <p className="text-sm text-muted-foreground">Belum ada aktivitas</p>
      </div>
    )
  }

  return (
    <motion.div
      className={`relative ${className ?? ''}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {/* Vertical line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border md:left-1/2 md:-translate-x-px" />

      <div className="space-y-6">
        {items.map((item, index) => {
          const isLeft = index % 2 === 0
          return (
            <motion.div
              key={item.id}
              variants={itemVariants}
              className="relative flex items-start"
            >
              {/* Mobile layout - all left */}
              <div className="flex w-full items-start gap-4 md:hidden">
                {/* Icon dot */}
                <div
                  className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-background shadow-sm"
                  style={{ backgroundColor: item.color }}
                >
                  <span className="text-white">{item.icon}</span>
                </div>
                {/* Content */}
                <div className="flex-1 rounded-lg border bg-card p-4 shadow-sm">
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.description}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground/70">{item.time}</p>
                </div>
              </div>

              {/* Desktop layout - alternating left/right */}
              <div className="hidden w-full md:flex md:items-start">
                {/* Left side content */}
                <div
                  className={`w-1/2 pr-8 ${isLeft ? 'text-right' : ''}`}
                >
                  {isLeft && (
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground/70">
                        {item.time}
                      </p>
                    </div>
                  )}
                </div>

                {/* Center icon */}
                <div className="relative z-10 flex shrink-0 -translate-x-1/2 items-center justify-center">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-background shadow-sm"
                    style={{ backgroundColor: item.color }}
                  >
                    <span className="text-white">{item.icon}</span>
                  </div>
                </div>

                {/* Right side content */}
                <div
                  className={`w-1/2 pl-8 ${!isLeft ? '' : ''}`}
                >
                  {!isLeft && (
                    <div className="rounded-lg border bg-card p-4 shadow-sm">
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.description}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground/70">
                        {item.time}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
