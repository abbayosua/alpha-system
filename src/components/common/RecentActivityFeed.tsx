'use client'

import Link from 'next/link'
import { Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

type Activity = {
  id: string
  title: string
  description: string
  time: string
  icon: React.ReactNode
  color?: string
}

type RecentActivityFeedProps = {
  activities: Activity[]
  title?: string
  onViewAll?: string
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
}

function EmptyFeed() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
        <Clock className="h-7 w-7 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground font-medium">Belum ada aktivitas</p>
      <p className="text-xs text-muted-foreground mt-0.5">
        Aktivitas terbaru akan muncul di sini
      </p>
    </motion.div>
  )
}

export default function RecentActivityFeed({
  activities,
  title = 'Aktivitas Terbaru',
  onViewAll,
}: RecentActivityFeedProps) {
  const displayActivities = activities.slice(0, 5)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card className="shadow-sm">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayActivities.length > 0 ? (
            <>
              <motion.div
                className="divide-y"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {displayActivities.map((activity) => (
                  <motion.div
                    key={activity.id}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                    variants={itemVariants}
                  >
                    {/* Icon with colored circle */}
                    <div
                      className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: activity.color
                          ? `${activity.color}15`
                          : undefined,
                        color: activity.color || undefined,
                      }}
                    >
                      {activity.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
                      <div className="min-w-0 border-l-2 pl-3"
                        style={{
                          borderColor: activity.color
                            ? `${activity.color}40`
                            : 'hsl(var(--border))',
                        }}
                      >
                        <p className="text-sm font-medium leading-tight truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {activity.description}
                        </p>
                      </div>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0 pt-0.5">
                        {activity.time}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* View All Link */}
              {onViewAll && (
                <div className="mt-4 pt-3 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground hover:text-foreground"
                    asChild
                  >
                    <Link href={onViewAll}>
                      Lihat Semua
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyFeed />
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
