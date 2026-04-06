'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Check, CheckCircle2, AlertTriangle, Info, XCircle, Wallet, LogIn, MapPin, Smartphone, Banknote, Clock, Receipt, Send, UserPlus, TrendingDown, GitBranch, MapPinned, ScrollText, FileBarChart } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

type NotificationType = 'info' | 'success' | 'warning' | 'error'

interface Notification {
  id: string
  title: string
  description: string
  type: NotificationType
  read: boolean
  createdAt: string
  iconName: string
}

const iconMap: Record<string, LucideIcon> = {
  LogIn,
  Wallet,
  MapPin,
  CheckCircle2,
  Banknote,
  Smartphone,
  AlertTriangle,
  Info,
  XCircle,
  Clock,
  Receipt,
  Send,
  UserPlus,
  TrendingDown,
  GitBranch,
  MapPinned,
  ScrollText,
  FileBarChart,
}

const typeStyles: Record<NotificationType, { bg: string; text: string; iconBg: string }> = {
  info: {
    bg: 'bg-slate-50 dark:bg-slate-900/30',
    text: 'text-slate-600 dark:text-slate-400',
    iconBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  },
  success: {
    bg: 'bg-emerald-50/60 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    iconBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
  },
  warning: {
    bg: 'bg-amber-50/60 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    iconBg: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  },
  error: {
    bg: 'bg-rose-50/60 dark:bg-rose-900/20',
    text: 'text-rose-700 dark:text-rose-400',
    iconBg: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
  },
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 1) return 'Baru saja'
  if (diffMin < 60) return `${diffMin} menit lalu`
  if (diffHour < 24) return `${diffHour} jam lalu`
  return `${diffDay} hari lalu`
}

export function NotificationBell() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          setNotifications(json.data.notifications)
          setUnreadCount(json.data.unreadCount)
        }
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg relative"
          title="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-80 sm:w-96 p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Notifikasi</h3>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20 px-2"
              onClick={handleMarkAllRead}
            >
              <Check className="h-3 w-3 mr-1" />
              Tandai Semua Dibaca
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-80">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <p className="text-xs mt-2">Memuat notifikasi...</p>
              </div>
            ) : notifications.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center py-12 px-4 text-center"
              >
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tidak ada notifikasi
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Semua pemberitahuan akan muncul di sini
                </p>
              </motion.div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification, index) => {
                  const IconComponent = iconMap[notification.iconName] || Info
                  const style = typeStyles[notification.type]

                  return (
                    <motion.div
                      key={notification.id}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                      className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50 ${style.bg} ${!notification.read ? '' : 'opacity-75'}`}
                      onClick={() => {
                        if (!notification.read) {
                          setNotifications((prev) =>
                            prev.map((n) =>
                              n.id === notification.id ? { ...n, read: true } : n
                            )
                          )
                          setUnreadCount((prev) => Math.max(0, prev - 1))
                        }
                      }}
                    >
                      {/* Icon */}
                      <div className={`shrink-0 mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center ${style.iconBg}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-sm font-medium leading-tight ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <span className="shrink-0 mt-1 h-2 w-2 rounded-full bg-rose-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                          {notification.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-2.5 text-center">
              <button
                className="text-xs font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                onClick={() => {
                  setOpen(false)
                  router.push('/notifications')
                }}
              >
                Lihat Semua Notifikasi
              </button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}
