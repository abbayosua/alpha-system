'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Check, CheckCircle2, Info, AlertTriangle, XCircle,
  Wallet, LogIn, MapPin, Smartphone, Banknote, Clock, Receipt, Send,
  UserPlus, TrendingDown, GitBranch, MapPinned, ScrollText, FileBarChart,
  Inbox, Search, ShieldCheck, ChevronDown, RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { LucideIcon } from 'lucide-react'

/* ─── Types ─── */
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

type FilterTab = 'all' | 'unread' | 'info' | 'success' | 'warning' | 'error'

interface NotificationCenterProps {
  /** The role-specific back path, e.g. '/saksi/dashboard' */
  backHref?: string
}

/* ─── Icon Map ─── */
const iconMap: Record<string, LucideIcon> = {
  LogIn, Wallet, MapPin, CheckCircle2, Banknote, Smartphone,
  AlertTriangle, Info, XCircle, Clock, Receipt, Send,
  UserPlus, TrendingDown, GitBranch, MapPinned, ScrollText, FileBarChart,
}

/* ─── Type Config ─── */
const typeConfig: Record<NotificationType, {
  border: string
  iconBg: string
  iconText: string
  label: string
  dotColor: string
  statBg: string
  statBorder: string
  statIconText: string
}> = {
  info: {
    border: 'border-l-slate-400',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-600',
    label: 'Info',
    dotColor: 'bg-slate-400',
    statBg: 'bg-gradient-to-br from-slate-50 to-slate-100/50',
    statBorder: 'border-l-slate-400',
    statIconText: 'text-slate-600',
  },
  success: {
    border: 'border-l-emerald-500',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    label: 'Sukses',
    dotColor: 'bg-emerald-500',
    statBg: 'bg-gradient-to-br from-emerald-50 to-emerald-100/50',
    statBorder: 'border-l-emerald-500',
    statIconText: 'text-emerald-600',
  },
  warning: {
    border: 'border-l-amber-500',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    label: 'Peringatan',
    dotColor: 'bg-amber-500',
    statBg: 'bg-gradient-to-br from-amber-50 to-amber-100/50',
    statBorder: 'border-l-amber-500',
    statIconText: 'text-amber-600',
  },
  error: {
    border: 'border-l-rose-500',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-600',
    label: 'Error',
    dotColor: 'bg-rose-500',
    statBg: 'bg-gradient-to-br from-rose-50 to-rose-100/50',
    statBorder: 'border-l-rose-500',
    statIconText: 'text-rose-600',
  },
}

/* ─── Helpers ─── */
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
  if (diffDay < 7) return `${diffDay} hari lalu`
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/* ─── Animation Variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20, y: 4 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
}

const statContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const statItemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

const tabContentVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15 } },
}

/* ─── Summary Stats Component ─── */
function SummaryStats({
  notifications,
  unreadCount,
}: {
  notifications: Notification[]
  unreadCount: number
}) {
  const infoCount = notifications.filter((n) => n.type === 'info').length
  const successCount = notifications.filter((n) => n.type === 'success').length
  const warningCount = notifications.filter((n) => n.type === 'warning').length
  const errorCount = notifications.filter((n) => n.type === 'error').length

  const stats: { label: string; count: number; icon: LucideIcon; type: NotificationType }[] = [
    { label: 'Total', count: notifications.length, icon: Bell, type: 'info' },
    { label: 'Belum Dibaca', count: unreadCount, icon: CheckCircle2, type: 'warning' },
    { label: 'Info', count: infoCount, icon: Info, type: 'info' },
    { label: 'Sukses', count: successCount, icon: CheckCircle2, type: 'success' },
    { label: 'Peringatan', count: warningCount, icon: AlertTriangle, type: 'warning' },
    { label: 'Error', count: errorCount, icon: XCircle, type: 'error' },
  ]

  return (
    <motion.div
      variants={statContainerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
    >
      {stats.map((stat) => {
        const config = typeConfig[stat.type]
        const Icon = stat.icon
        return (
          <motion.div
            key={stat.label}
            variants={statItemVariants}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
            className={`rounded-xl border border-l-4 ${config.statBorder} ${config.statBg} p-3 transition-shadow hover:shadow-md`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${config.iconBg}`}>
                <Icon className={`h-4 w-4 ${config.statIconText}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground leading-tight">{stat.count}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

/* ─── Empty State Component ─── */
function NotificationEmptyState({ filter, searchQuery }: { filter: FilterTab; searchQuery: string }) {
  const isFiltered = filter !== 'all' || searchQuery.length > 0
  const Icon = isFiltered ? Search : Inbox

  let gradientColor = 'from-slate-100 to-slate-50'
  if (filter === 'error') gradientColor = 'from-rose-100 to-rose-50'
  else if (filter === 'warning') gradientColor = 'from-amber-100 to-amber-50'
  else if (filter === 'success') gradientColor = 'from-emerald-100 to-emerald-50'

  let ringColor = 'border-slate-200'
  if (filter === 'error') ringColor = 'border-rose-200'
  else if (filter === 'warning') ringColor = 'border-amber-200'
  else if (filter === 'success') ringColor = 'border-emerald-200'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="relative mb-6">
        <motion.div
          className={`h-24 w-24 rounded-full bg-gradient-to-br ${gradientColor} flex items-center justify-center`}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon className="h-10 w-10 text-muted-foreground/60" />
        </motion.div>
        <motion.div
          className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-amber-400/40"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-1 -left-3 h-2.5 w-2.5 rounded-full bg-emerald-400/40"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        />
        <motion.div
          className="absolute top-2 -left-4 h-2 w-2 rounded-full bg-teal-400/40"
          animate={{ x: [0, 4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className={`absolute inset-0 rounded-full border-2 border-dashed ${ringColor}`}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-muted-foreground">
          {searchQuery.length > 0 ? 'Tidak Ada Hasil' : isFiltered ? 'Tidak Ada Notifikasi' : 'Tidak Ada Notifikasi'}
        </h3>
        <p className="text-sm text-muted-foreground/70 max-w-sm">
          {searchQuery.length > 0
            ? `Tidak ada notifikasi yang cocok dengan "${searchQuery}". Coba kata kunci lain.`
            : isFiltered
              ? 'Tidak ada notifikasi dengan filter ini. Coba pilih tab lain.'
              : 'Semua pemberitahuan akan muncul di sini. Anda belum memiliki notifikasi.'}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground/50">
        <ShieldCheck className="h-3.5 w-3.5" />
        <span>Notifikasi penting akan selalu ditampilkan</span>
      </div>
    </motion.div>
  )
}

/* ─── Notification Card ─── */
function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
}) {
  const IconComponent = iconMap[notification.iconName] || Info
  const config = typeConfig[notification.type]

  const cardClass = [
    'relative flex gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all cursor-pointer group',
    `border-l-4 ${config.border}`,
    notification.read
      ? 'opacity-70 hover:opacity-100'
      : 'ring-1 ring-emerald-100',
  ].join(' ')

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -1, transition: { duration: 0.15 } }}
      className={cardClass}
      onClick={() => {
        if (!notification.read) onMarkRead(notification.id)
      }}
    >
      {/* Icon */}
      <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${config.iconBg} ${config.iconText} transition-transform group-hover:scale-105`}>
        <IconComponent className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className={`text-sm leading-snug ${!notification.read ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
              {notification.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
              {notification.description}
            </p>
          </div>
          <AnimatePresence>
            {!notification.read && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="shrink-0 mt-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-200"
              />
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 mt-2.5">
          <span className="text-[11px] text-muted-foreground/60 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(notification.createdAt)}
          </span>
          <Badge variant="outline" className="h-5 text-[10px] px-1.5 font-normal border-current/10 text-muted-foreground/60">
            {config.label}
          </Badge>
          {!notification.read && (
            <span className="text-[11px] text-emerald-600 font-medium ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
              Klik untuk dibaca
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Main NotificationCenter Component ─── */
export function NotificationCenter({ backHref }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(10)
  const [showMarkAllDialog, setShowMarkAllDialog] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const ITEMS_PER_LOAD = 10

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ─── Debounced search ─── */
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery)
      setVisibleCount(ITEMS_PER_LOAD)
    }, 300)
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [searchQuery])

  /* ─── Fetch ─── */
  const fetchNotifications = useCallback(async (showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true)
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const json = await res.json()
        if (json.success) {
          setNotifications(json.data.notifications)
          setUnreadCount(json.data.unreadCount)
          setLastRefresh(new Date())
        }
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(() => fetchNotifications(), 30000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  /* ─── Computed ─── */
  const filteredNotifications = useMemo(() => {
    let result = notifications

    // Filter by tab
    switch (activeTab) {
      case 'unread':
        result = result.filter((n) => !n.read)
        break
      case 'info':
      case 'success':
      case 'warning':
      case 'error':
        result = result.filter((n) => n.type === activeTab)
        break
    }

    // Filter by search
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase().trim()
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(query) ||
          n.description.toLowerCase().includes(query) ||
          n.type.toLowerCase().includes(query)
      )
    }

    return result
  }, [notifications, activeTab, debouncedQuery])

  const tabCounts = useMemo(() => ({
    all: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    info: notifications.filter((n) => n.type === 'info').length,
    success: notifications.filter((n) => n.type === 'success').length,
    warning: notifications.filter((n) => n.type === 'warning').length,
    error: notifications.filter((n) => n.type === 'error').length,
  }), [notifications])

  const visibleNotifications = filteredNotifications.slice(0, visibleCount)
  const hasMore = visibleCount < filteredNotifications.length

  /* ─── Handlers ─── */
  const handleMarkRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    setShowMarkAllDialog(false)
  }, [])

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + ITEMS_PER_LOAD)
  }, [])

  // Reset visible count on filter/search change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_LOAD)
  }, [activeTab, debouncedQuery])

  /* ─── Tabs config ─── */
  const tabs: { value: FilterTab; label: string; count: number }[] = [
    { value: 'all', label: 'Semua', count: tabCounts.all },
    { value: 'unread', label: 'Belum Dibaca', count: tabCounts.unread },
    { value: 'info', label: 'Info', count: tabCounts.info },
    { value: 'success', label: 'Sukses', count: tabCounts.success },
    { value: 'warning', label: 'Peringatan', count: tabCounts.warning },
    { value: 'error', label: 'Error', count: tabCounts.error },
  ]

  const formatLastRefresh = () => {
    return lastRefresh.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="space-y-6">
      {/* ─── Gradient Title Area ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-transparent border border-emerald-100/50"
      >
        {/* Decorative elements */}
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-emerald-100/30 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-teal-100/20 blur-2xl pointer-events-none" />
        <div className="absolute top-4 left-1/4 h-20 w-20 rounded-full bg-amber-100/15 blur-xl pointer-events-none" />

        <div className="relative px-4 py-6 md:px-8 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200/50">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-foreground">Notifikasi</h1>
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-rose-500 px-2 text-[11px] font-bold text-white shadow-sm"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {unreadCount > 0
                    ? `${unreadCount} notifikasi belum dibaca`
                    : 'Semua notifikasi sudah dibaca'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Last refresh */}
              <span className="text-[11px] text-muted-foreground/60 hidden sm:flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatLastRefresh()}
              </span>

              {/* Refresh button */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs gap-1.5 bg-white/60 hover:bg-white/80 border-emerald-200 text-emerald-700 shadow-sm"
                onClick={() => fetchNotifications(true)}
                disabled={isRefreshing}
              >
                <motion.div
                  animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
                  transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                </motion.div>
                Refresh
              </Button>

              {/* Mark all read */}
              {unreadCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 bg-white/60 hover:bg-white/80 border-emerald-200 text-emerald-700 shadow-sm"
                    onClick={() => setShowMarkAllDialog(true)}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Tandai Semua Dibaca
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Summary Stats ─── */}
      {!loading && notifications.length > 0 && (
        <SummaryStats notifications={notifications} unreadCount={unreadCount} />
      )}

      {/* ─── Search & Filters ─── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-4"
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Cari notifikasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 h-10 bg-muted/30 border-border/50 focus:bg-background transition-colors"
          />
          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <ScrollArea className="w-full -mb-2">
          <div className="flex gap-1 bg-muted/50 p-1.5 w-full sm:w-fit rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`h-8 px-3 text-xs gap-1.5 rounded-lg transition-all duration-200 flex items-center ${
                  activeTab === tab.value
                    ? 'bg-background shadow-sm text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <Badge
                    variant={activeTab === tab.value ? 'default' : 'secondary'}
                    className={
                      activeTab === tab.value
                        ? 'h-4 min-w-[16px] px-1 text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'h-4 min-w-[16px] px-1 text-[10px] font-bold'
                    }
                  >
                    {tab.count}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </motion.div>

      {/* ─── Notification List ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${debouncedQuery}-${filteredNotifications.length}`}
          variants={tabContentVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              <p className="text-sm text-muted-foreground mt-3">Memuat notifikasi...</p>
            </div>
          ) : visibleNotifications.length === 0 ? (
            <NotificationEmptyState filter={activeTab} searchQuery={debouncedQuery} />
          ) : (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={`list-${activeTab}-${debouncedQuery}`}
                className="space-y-3"
              >
                {visibleNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                  />
                ))}
              </motion.div>

              {/* Load More */}
              {hasMore && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 text-center"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-9 px-5 text-sm border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                    onClick={handleLoadMore}
                  >
                    <ChevronDown className="h-4 w-4" />
                    Muat Lebih Banyak
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-bold">
                      {filteredNotifications.length - visibleCount} tersisa
                    </Badge>
                  </Button>
                </motion.div>
              )}

              {/* Showing count */}
              {filteredNotifications.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-4 text-center text-xs text-muted-foreground/50"
                >
                  Menampilkan {visibleNotifications.length} dari {filteredNotifications.length} notifikasi
                </motion.p>
              )}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ─── Mark All Read Confirmation Dialog ─── */}
      <AlertDialog open={showMarkAllDialog} onOpenChange={setShowMarkAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              Tandai Semua Dibaca
            </AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda ingin menandai semua <strong>{unreadCount}</strong> notifikasi sebagai sudah dibaca?
              {' '}Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMarkAllRead}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Check className="h-4 w-4 mr-1.5" />
              Ya, Tandai Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
