'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, ArrowLeft, Check, CheckCircle2, Info,
  Wallet, LogIn, MapPin, Smartphone, Banknote, Clock, Receipt, Send,
  UserPlus, TrendingDown, GitBranch, MapPinned, ScrollText, FileBarChart,
  Inbox, Search, ShieldCheck, CircleDot,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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

/* ─── Icon Map ─── */
const iconMap: Record<string, LucideIcon> = {
  LogIn, Wallet, MapPin, CheckCircle2, Banknote, Smartphone,
  Info, Clock, Receipt, Send, UserPlus, TrendingDown, GitBranch,
  MapPinned, ScrollText, FileBarChart,
}

/* ─── Type Styles ─── */
const typeConfig: Record<NotificationType, {
  border: string
  iconBg: string
  iconText: string
  label: string
}> = {
  info: {
    border: 'border-l-slate-400',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconText: 'text-slate-600 dark:text-slate-400',
    label: 'Info',
  },
  success: {
    border: 'border-l-emerald-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    label: 'Sukses',
  },
  warning: {
    border: 'border-l-amber-500',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconText: 'text-amber-600 dark:text-amber-400',
    label: 'Peringatan',
  },
  error: {
    border: 'border-l-rose-500',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40',
    iconText: 'text-rose-600 dark:text-rose-400',
    label: 'Error',
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
    transition: { staggerChildren: 0.04 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
}

const tabContentVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.15 } },
}

/* ─── Empty State Component ─── */
function NotificationEmptyState({ filter }: { filter: FilterTab }) {
  const isFiltered = filter !== 'all'
  const Icon = isFiltered ? Search : Inbox

  let gradientColor = 'from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900'
  if (filter === 'error') gradientColor = 'from-rose-100 to-rose-50 dark:from-rose-900/30 dark:to-rose-950/20'
  else if (filter === 'warning') gradientColor = 'from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-950/20'
  else if (filter === 'success') gradientColor = 'from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-950/20'

  let ringColor = 'border-slate-200 dark:border-slate-700'
  if (filter === 'error') ringColor = 'border-rose-200 dark:border-rose-800/30'
  else if (filter === 'warning') ringColor = 'border-amber-200 dark:border-amber-800/30'
  else if (filter === 'success') ringColor = 'border-emerald-200 dark:border-emerald-800/30'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
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
          {isFiltered ? 'Tidak Ada Hasil' : 'Tidak Ada Notifikasi'}
        </h3>
        <p className="text-sm text-muted-foreground/70 max-w-sm">
          {isFiltered
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
    'relative flex gap-4 rounded-xl border bg-card p-4 shadow-sm transition-all cursor-pointer',
    `border-l-4 ${config.border}`,
    notification.read ? 'opacity-75 hover:opacity-100' : 'ring-1 ring-emerald-100 dark:ring-emerald-900/30',
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
      <div className={`shrink-0 h-10 w-10 rounded-xl flex items-center justify-center ${config.iconBg} ${config.iconText}`}>
        <IconComponent className="h-5 w-5" />
      </div>

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
                className="shrink-0 mt-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-200 dark:shadow-rose-900/40"
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
        </div>
      </div>
    </motion.div>
  )
}

/* ─── Main Page ─── */
export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [showMarkAllDialog, setShowMarkAllDialog] = useState(false)
  const ITEMS_PER_PAGE = 20

  /* ─── Fetch ─── */
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

  /* ─── Computed ─── */
  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter((n) => !n.read)
      case 'info':
        return notifications.filter((n) => n.type === 'info')
      case 'success':
        return notifications.filter((n) => n.type === 'success')
      case 'warning':
        return notifications.filter((n) => n.type === 'warning')
      case 'error':
        return notifications.filter((n) => n.type === 'error')
      default:
        return notifications
    }
  }, [notifications, activeTab])

  const tabCounts = useMemo(() => ({
    all: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    info: notifications.filter((n) => n.type === 'info').length,
    success: notifications.filter((n) => n.type === 'success').length,
    warning: notifications.filter((n) => n.type === 'warning').length,
    error: notifications.filter((n) => n.type === 'error').length,
  }), [notifications])

  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE)
  const paginatedNotifications = filteredNotifications.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

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

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  /* ─── Tabs config ─── */
  const tabs: { value: FilterTab; label: string; count: number }[] = [
    { value: 'all', label: 'Semua', count: tabCounts.all },
    { value: 'unread', label: 'Belum Dibaca', count: tabCounts.unread },
    { value: 'info', label: 'Info', count: tabCounts.info },
    { value: 'success', label: 'Sukses', count: tabCounts.success },
    { value: 'warning', label: 'Peringatan', count: tabCounts.warning },
    { value: 'error', label: 'Error', count: tabCounts.error },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Gradient Title Area ─── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-emerald-50/30 to-transparent dark:from-slate-900 dark:via-emerald-950/10 dark:to-transparent"
      >
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-emerald-100/30 dark:bg-emerald-900/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-teal-100/20 dark:bg-teal-900/10 blur-2xl pointer-events-none" />

        <div className="relative px-4 py-6 md:px-8 md:py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg bg-white/60 hover:bg-white/80 dark:bg-slate-800/60 dark:hover:bg-slate-800/80 backdrop-blur-sm border border-border/50 shadow-sm"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Kembali</span>
                </Button>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h1 className="text-xl font-bold text-foreground">Notifikasi</h1>
                      {unreadCount > 0 && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white shadow-sm"
                        >
                          {unreadCount}
                        </motion.span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {unreadCount > 0
                        ? `${unreadCount} notifikasi belum dibaca`
                        : 'Semua notifikasi sudah dibaca'}
                    </p>
                  </div>
                </div>
              </div>

              {unreadCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5 bg-white/60 hover:bg-white/80 dark:bg-slate-800/60 dark:hover:bg-slate-800/80 backdrop-blur-sm border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 shadow-sm"
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

      {/* ─── Content ─── */}
      <div className="px-4 md:px-8 pb-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6"
          >
            <Tabs
              value={activeTab}
              onValueChange={(v) => setActiveTab(v as FilterTab)}
              className="w-full"
            >
              <ScrollArea className="w-full -mb-2">
                <TabsList className="h-auto flex-wrap gap-1 bg-muted/50 p-1.5 w-full sm:w-fit">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="h-8 px-3 text-xs gap-1.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm"
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <Badge
                          variant={activeTab === tab.value ? 'default' : 'secondary'}
                          className={activeTab === tab.value ? 'h-4 min-w-[16px] px-1 text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700' : 'h-4 min-w-[16px] px-1 text-[10px] font-bold'}
                        >
                          {tab.count}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>

              {tabs.map((tab) => (
                <TabsContent key={tab.value} value={tab.value}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${tab.value}-${filteredNotifications.length}`}
                      variants={tabContentVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      className="mt-5"
                    >
                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                          <p className="text-sm text-muted-foreground mt-3">Memuat notifikasi...</p>
                        </div>
                      ) : paginatedNotifications.length === 0 ? (
                        <NotificationEmptyState filter={tab.value} />
                      ) : (
                        <>
                          <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            key={`list-${tab.value}`}
                            className="space-y-3"
                          >
                            {paginatedNotifications.map((notification) => (
                              <NotificationCard
                                key={notification.id}
                                notification={notification}
                                onMarkRead={handleMarkRead}
                              />
                            ))}
                          </motion.div>

                          {totalPages > 1 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 }}
                              className="mt-6 flex items-center justify-between"
                            >
                              <p className="text-xs text-muted-foreground">
                                Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                                {'-'}
                                {Math.min(currentPage * ITEMS_PER_PAGE, filteredNotifications.length)} dari {filteredNotifications.length}
                              </p>

                              <div className="flex items-center gap-1.5">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs disabled:opacity-40"
                                  disabled={currentPage === 1}
                                  onClick={() => setCurrentPage((p) => p - 1)}
                                >
                                  Sebelumnya
                                </Button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                  <Button
                                    key={page}
                                    variant={currentPage === page ? 'default' : 'outline'}
                                    size="sm"
                                    className={currentPage === page ? 'h-8 w-8 text-xs p-0 bg-emerald-600 hover:bg-emerald-700 text-white' : 'h-8 w-8 text-xs p-0'}
                                    onClick={() => setCurrentPage(page)}
                                  >
                                    {page}
                                  </Button>
                                ))}

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs disabled:opacity-40"
                                  disabled={currentPage === totalPages}
                                  onClick={() => setCurrentPage((p) => p + 1)}
                                >
                                  Berikutnya
                                </Button>
                              </div>
                            </motion.div>
                          )}

                          {totalPages > 1 && filteredNotifications.length > ITEMS_PER_PAGE && currentPage < totalPages && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.4 }}
                              className="mt-4 text-center"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                                onClick={() => setCurrentPage((p) => p + 1)}
                              >
                                <CircleDot className="h-3.5 w-3.5 mr-1.5" />
                                Muat Lebih
                              </Button>
                            </motion.div>
                          )}
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* ─── Mark All Read Confirmation Dialog ─── */}
      <AlertDialog open={showMarkAllDialog} onOpenChange={setShowMarkAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
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
