'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Settings,
  User,
  Mail,
  Shield,
  Bell,
  RefreshCw,
  MapPin,
  Moon,
  Wallet,
  Building2,
  Smartphone,
  Navigation,
  Database,
  Trash2,
  Download,
  HardDrive,
  Info,
  Globe,
  Map,
  Code2,
  Heart,
  Lock,
  Save,
  CheckCircle2,
  Activity,
  Wifi,
  Clock,
  Timer,
  KeyRound,
  Monitor,
  Volume2,
  VolumeX,
  Type,
  LayoutGrid,
  ArrowLeftRight,
  ShieldCheck,
  Fingerprint,
  History,
  Server,
  ArrowRight,
  FileDown,
  Archive,
  RotateCcw,
  Zap,
  Eye,
  Globe2,
  SmartphoneNfc,
} from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Animation Variants ──────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

const miniCardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
}

const timelineVariants = {
  hidden: { opacity: 0, x: -12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
}

// ─── Settings Types ──────────────────────────────────────────────────
interface AppSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  soundAlerts: boolean
  autoRefresh: boolean
  showMap: boolean
  autoDarkMode: boolean
  compactMode: boolean
}

interface PaymentConfig {
  nominal: string
  methods: { bank: boolean; ewallet: boolean }
}

interface NotificationSettings {
  autoRefreshInterval: string
}

interface SecuritySettings {
  sessionTimeout: string
  twoFactorEnabled: boolean
}

interface AppearanceSettings {
  fontSize: string
  compactMode: boolean
  sidebarPosition: string
}

const defaultAppSettings: AppSettings = {
  emailNotifications: true,
  pushNotifications: true,
  soundAlerts: false,
  autoRefresh: true,
  showMap: true,
  autoDarkMode: false,
  compactMode: false,
}

const defaultPaymentConfig: PaymentConfig = {
  nominal: '150000',
  methods: { bank: true, ewallet: true },
}

const defaultGpsRadius = 100

// ─── Mock Activity Data ──────────────────────────────────────────────
const mockActivities = [
  {
    id: 1,
    action: 'create',
    text: 'Saksi baru terdaftar',
    user: 'Ahmad Rizki',
    time: '5 menit lalu',
    icon: User,
  },
  {
    id: 2,
    action: 'update',
    text: 'Status pembayaran diperbarui',
    user: 'Admin',
    time: '12 menit lalu',
    icon: Wallet,
  },
  {
    id: 3,
    action: 'create',
    text: 'Laporan baru diajukan',
    user: 'Siti Nurhaliza',
    time: '25 menit lalu',
    icon: FileDown,
  },
  {
    id: 4,
    action: 'delete',
    text: 'TPS tidak aktif dihapus',
    user: 'Admin',
    time: '1 jam lalu',
    icon: Trash2,
  },
  {
    id: 5,
    action: 'update',
    text: 'Koordinat GPS TPS diperbarui',
    user: 'Admin',
    time: '1 jam lalu',
    icon: MapPin,
  },
  {
    id: 6,
    action: 'create',
    text: 'Check-in pagi berhasil',
    user: 'Budi Santoso',
    time: '2 jam lalu',
    icon: CheckCircle2,
  },
  {
    id: 7,
    action: 'update',
    text: 'Pembayaran berhasil dicairkan',
    user: 'Keuangan',
    time: '3 jam lalu',
    icon: Archive,
  },
  {
    id: 8,
    action: 'create',
    text: 'Input suara TPS-003 selesai',
    user: 'Dewi Lestari',
    time: '3 jam lalu',
    icon: Database,
  },
  {
    id: 9,
    action: 'delete',
    text: 'Laporan ditolak & diarsipkan',
    user: 'Admin',
    time: '4 jam lalu',
    icon: Eye,
  },
  {
    id: 10,
    action: 'update',
    text: 'Profil saksi diperbarui',
    user: 'Ahmad Rizki',
    time: '5 jam lalu',
    icon: Settings,
  },
]

// ─── Mock Login History ──────────────────────────────────────────────
const mockLoginHistory = [
  { id: 1, ip: '192.168.1.42', device: 'Chrome / Windows 11', time: 'Hari ini, 08:30', current: true },
  { id: 2, ip: '192.168.1.42', device: 'Chrome / Windows 11', time: 'Kemarin, 17:45', current: false },
  { id: 3, ip: '10.0.0.15', device: 'Safari / macOS', time: '2 hari lalu, 09:12', current: false },
  { id: 4, ip: '192.168.1.100', device: 'Firefox / Ubuntu', time: '3 hari lalu, 14:20', current: false },
  { id: 5, ip: '172.16.0.8', device: 'Mobile Safari / iOS', time: '5 hari lalu, 11:55', current: false },
]

// ─── localStorage helpers (SSR-safe) ──────────────────────────────
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

// ─── System Health hook ──────────────────────────────────────────────
function useSystemHealth() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error'>('checking')

  useEffect(() => {
    // Simulate health checks with timeouts
    const apiTimer = setTimeout(() => setApiStatus('online'), 800)
    const dbTimer = setTimeout(() => setDbStatus('connected'), 1200)
    return () => {
      clearTimeout(apiTimer)
      clearTimeout(dbTimer)
    }
  }, [])

  return { apiStatus, dbStatus }
}

// ─── Activity color helper ──────────────────────────────────────────
function getActionColor(action: string) {
  switch (action) {
    case 'create':
      return 'bg-emerald-100 text-emerald-600 border-emerald-200'
    case 'update':
      return 'bg-amber-100 text-amber-600 border-amber-200'
    case 'delete':
      return 'bg-rose-100 text-rose-600 border-rose-200'
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200'
  }
}

function getActionDotColor(action: string) {
  switch (action) {
    case 'create':
      return 'bg-emerald-500'
    case 'update':
      return 'bg-amber-500'
    case 'delete':
      return 'bg-rose-500'
    default:
      return 'bg-slate-500'
  }
}

function getActionBgColor(action: string) {
  switch (action) {
    case 'create':
      return 'bg-emerald-50'
    case 'update':
      return 'bg-amber-50'
    case 'delete':
      return 'bg-rose-50'
    default:
      return 'bg-slate-50'
  }
}

// ═════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════
export default function AdminSettingsPage() {
  const { user } = useAuthStore()
  const { apiStatus, dbStatus } = useSystemHealth()

  // ─── App Settings State (lazy init from localStorage) ──────────
  const [appSettings, setAppSettings] = useState<AppSettings>(() =>
    loadFromStorage<AppSettings>('saksi-app-settings', defaultAppSettings),
  )
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(() =>
    loadFromStorage<PaymentConfig>('saksi-payment-config', defaultPaymentConfig),
  )
  const [gpsRadius, setGpsRadius] = useState<number>(() =>
    loadFromStorage<number>('saksi-gps-radius', defaultGpsRadius),
  )

  // ─── Notification Settings ────────────────────────────────────
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(() =>
    loadFromStorage<NotificationSettings>('saksi-notif-settings', {
      autoRefreshInterval: '30',
    }),
  )

  // ─── Security Settings ────────────────────────────────────────
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>(() =>
    loadFromStorage<SecuritySettings>('saksi-security-settings', {
      sessionTimeout: '30',
      twoFactorEnabled: false,
    }),
  )

  // ─── Appearance Settings ──────────────────────────────────────
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>(() =>
    loadFromStorage<AppearanceSettings>('saksi-appearance-settings', {
      fontSize: 'medium',
      compactMode: false,
      sidebarPosition: 'left',
    }),
  )

  // ─── UI State ─────────────────────────────────────────────────
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showClearCacheDialog, setShowClearCacheDialog] = useState(false)
  const [savedPayment, setSavedPayment] = useState(false)
  const [clearedCache, setClearedCache] = useState(false)
  const [exported, setExported] = useState(false)

  // ─── Persist settings to localStorage ──────────────────────────
  const updateAppSettings = useCallback(
    (key: keyof AppSettings, value: boolean) => {
      const updated = { ...appSettings, [key]: value }
      setAppSettings(updated)
      localStorage.setItem('saksi-app-settings', JSON.stringify(updated))
    },
    [appSettings],
  )

  const handleSavePayment = useCallback(() => {
    localStorage.setItem('saksi-payment-config', JSON.stringify(paymentConfig))
    setSavedPayment(true)
    setTimeout(() => setSavedPayment(false), 2000)
  }, [paymentConfig])

  const handleGpsChange = useCallback((value: number[]) => {
    const radius = value[0]
    setGpsRadius(radius)
    localStorage.setItem('saksi-gps-radius', String(radius))
  }, [])

  const handleExportData = useCallback(() => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Jenis,Tanggal,Jumlah\n' +
      `Saksi Terdaftar,${new Date().toLocaleDateString('id-ID')},3\n` +
      `TPS Aktif,${new Date().toLocaleDateString('id-ID')},5\n` +
      `Check-in Selesai,${new Date().toLocaleDateString('id-ID')},5\n` +
      `Pembayaran Dicairkan,${new Date().toLocaleDateString('id-ID')},1\n`

    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csvContent))
    link.setAttribute('download', `saksi-app-export-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setExported(true)
    setTimeout(() => setExported(false), 2000)
  }, [])

  const handleResetData = useCallback(() => {
    localStorage.removeItem('saksi-app-settings')
    localStorage.removeItem('saksi-payment-config')
    localStorage.removeItem('saksi-gps-radius')
    localStorage.removeItem('saksi-notif-settings')
    localStorage.removeItem('saksi-security-settings')
    localStorage.removeItem('saksi-appearance-settings')
    setAppSettings(defaultAppSettings)
    setPaymentConfig(defaultPaymentConfig)
    setGpsRadius(defaultGpsRadius)
    setNotifSettings({ autoRefreshInterval: '30' })
    setSecuritySettings({ sessionTimeout: '30', twoFactorEnabled: false })
    setAppearanceSettings({ fontSize: 'medium', compactMode: false, sidebarPosition: 'left' })
    setShowResetDialog(false)
    setShowResetConfirm(false)
  }, [])

  const handleClearCache = useCallback(() => {
    const keysToKeep = [
      'saksi-app-settings',
      'saksi-payment-config',
      'saksi-gps-radius',
      'saksi-notif-settings',
      'saksi-security-settings',
      'saksi-appearance-settings',
    ]
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && !keysToKeep.includes(key)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
    setClearedCache(true)
    setShowClearCacheDialog(false)
    setTimeout(() => setClearedCache(false), 2000)
  }, [])

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'AD'

  // ─── Computed: last backup date (mock) ────────────────────────
  const lastBackupDate = '15 Jan 2025, 03:00'

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* ══ Gradient Title Area ══════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="relative rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-transparent border border-emerald-100/50 px-6 py-5 overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100/30 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-teal-100/20 rounded-full translate-y-1/2" />
        <div className="relative flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 flex items-center justify-center">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-emerald-900">Pengaturan</h1>
            <p className="text-muted-foreground mt-0.5">Kelola pengaturan aplikasi dan preferensi</p>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: SYSTEM HEALTH DASHBOARD
          ═══════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-lg border-0">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
              {/* API Status */}
              <motion.div
                variants={miniCardVariants}
                className="relative rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-4 text-white overflow-hidden"
              >
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Wifi className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-emerald-100">API Status</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {apiStatus === 'checking' ? (
                        <>
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                          <span className="text-sm font-semibold">Checking...</span>
                        </>
                      ) : apiStatus === 'online' ? (
                        <>
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-200 shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
                          <span className="text-sm font-semibold">Online</span>
                        </>
                      ) : (
                        <>
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                          <span className="text-sm font-semibold">Offline</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Database */}
              <motion.div
                variants={miniCardVariants}
                className="relative rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 p-4 text-white overflow-hidden"
              >
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-teal-100">Database</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {dbStatus === 'checking' ? (
                        <>
                          <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-pulse" />
                          <span className="text-sm font-semibold">Connecting...</span>
                        </>
                      ) : dbStatus === 'connected' ? (
                        <>
                          <span className="h-2.5 w-2.5 rounded-full bg-emerald-200 shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
                          <span className="text-sm font-semibold">Connected</span>
                        </>
                      ) : (
                        <>
                          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                          <span className="text-sm font-semibold">Error</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Uptime */}
              <motion.div
                variants={miniCardVariants}
                className="relative rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 p-4 text-white overflow-hidden"
              >
                <div className="absolute -top-2 -right-6 w-16 h-16 bg-white/10 rounded-full" />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Timer className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-emerald-100">Uptime</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-200 shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
                      <span className="text-sm font-semibold">99.9%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: ACTIVITY LOG
          ═══════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5 text-teal-500" />
                Log Aktivitas
              </CardTitle>
              <Link href="/admin/audit">
                <Button variant="ghost" size="sm" className="text-teal-600 hover:text-teal-700 gap-1.5">
                  Lihat Semua
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-2">
            <div className="space-y-0 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
              {mockActivities.map((activity, index) => {
                const IconComp = activity.icon
                return (
                  <motion.div
                    key={activity.id}
                    variants={timelineVariants}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: index * 0.04 }}
                    className="flex items-start gap-3 py-3 relative"
                  >
                    {/* Timeline connector */}
                    {index < mockActivities.length - 1 && (
                      <div className="absolute left-[17px] top-[42px] bottom-0 w-px bg-border" />
                    )}
                    {/* Dot indicator */}
                    <div
                      className={`relative z-10 flex-shrink-0 w-[34px] h-[34px] rounded-full border-2 flex items-center justify-center ${getActionColor(activity.action)}`}
                    >
                      <IconComp className="h-3.5 w-3.5" />
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{activity.text}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        oleh <span className="font-medium text-foreground/70">{activity.user}</span>
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ══ Profile Section ══════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-500" />
              Profil Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <Avatar className="h-20 w-20 ring-4 ring-emerald-200 shadow-lg">
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-emerald-500 to-teal-400 text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{user?.name || 'Admin Demo'}</h3>
                  <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                    <Mail className="h-3.5 w-3.5" />
                    {user?.email || 'admin@demo.com'}
                  </p>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 gap-1">
                    <Shield className="h-3 w-3" />
                    Administrator
                  </Badge>
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
                    Aktif
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    Ubah Profil
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Lock className="h-4 w-4" />
                    Ubah Password
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: NOTIFICATION SETTINGS
          ═══════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              Pengaturan Notifikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-0 divide-y divide-border">
            {/* Email Notifications */}
            <div className="flex items-center justify-between gap-4 pb-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mt-0.5">
                  <Mail className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Notifikasi Email</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Terima email saat ada laporan baru atau pembaruan status
                  </p>
                </div>
              </div>
              <Switch
                checked={appSettings.emailNotifications}
                onCheckedChange={(checked) => updateAppSettings('emailNotifications', checked)}
              />
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between gap-4 py-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center mt-0.5">
                  <SmartphoneNfc className="h-4 w-4 text-teal-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Notifikasi Push</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Terima notifikasi push browser untuk update real-time
                  </p>
                </div>
              </div>
              <Switch
                checked={appSettings.pushNotifications}
                onCheckedChange={(checked) => updateAppSettings('pushNotifications', checked)}
              />
            </div>

            {/* Sound Alerts */}
            <div className="flex items-center justify-between gap-4 py-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mt-0.5">
                  {appSettings.soundAlerts ? (
                    <Volume2 className="h-4 w-4 text-amber-600" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-amber-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Suara Notifikasi</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Mainkan suara saat menerima notifikasi baru
                  </p>
                </div>
              </div>
              <Switch
                checked={appSettings.soundAlerts}
                onCheckedChange={(checked) => updateAppSettings('soundAlerts', checked)}
              />
            </div>

            {/* Auto Refresh Interval */}
            <div className="flex items-center justify-between gap-4 pt-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center mt-0.5">
                  <RefreshCw className="h-4 w-4 text-teal-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Interval Auto-refresh</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Atur seberapa sering dashboard diperbarui otomatis
                  </p>
                </div>
              </div>
              <Select
                value={notifSettings.autoRefreshInterval}
                onValueChange={(val) => {
                  const updated = { ...notifSettings, autoRefreshInterval: val }
                  setNotifSettings(updated)
                  localStorage.setItem('saksi-notif-settings', JSON.stringify(updated))
                }}
              >
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 detik</SelectItem>
                  <SelectItem value="30">30 detik</SelectItem>
                  <SelectItem value="60">60 detik</SelectItem>
                  <SelectItem value="off">Off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: SECURITY
          ═══════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-500" />
              Keamanan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-0 divide-y divide-border">
            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between gap-4 pb-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mt-0.5">
                  <Fingerprint className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">Autentikasi Dua Faktor</p>
                    <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px] px-1.5 py-0">
                      Segera Hadir
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tambahkan lapisan keamanan ekstra untuk akun Anda
                  </p>
                </div>
              </div>
              <Switch checked={securitySettings.twoFactorEnabled} disabled />
            </div>

            {/* Session Timeout */}
            <div className="flex items-center justify-between gap-4 py-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center mt-0.5">
                  <Timer className="h-4 w-4 text-teal-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Timeout Sesi</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Durasi sebelum sesi otomatis berakhir jika tidak aktif
                  </p>
                </div>
              </div>
              <Select
                value={securitySettings.sessionTimeout}
                onValueChange={(val) => {
                  const updated = { ...securitySettings, sessionTimeout: val }
                  setSecuritySettings(updated)
                  localStorage.setItem('saksi-security-settings', JSON.stringify(updated))
                }}
              >
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 menit</SelectItem>
                  <SelectItem value="30">30 menit</SelectItem>
                  <SelectItem value="60">1 jam</SelectItem>
                  <SelectItem value="240">4 jam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Login History */}
            <div className="pt-5">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mt-0.5">
                  <History className="h-4 w-4 text-slate-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Riwayat Login</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    5 login terakhir dari berbagai perangkat
                  </p>
                </div>
              </div>
              <div className="ml-12 space-y-2 max-h-[260px] overflow-y-auto pr-2 custom-scrollbar">
                {mockLoginHistory.map((login) => (
                  <motion.div
                    key={login.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      login.current
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-border bg-muted/30'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                        login.current ? 'bg-emerald-100' : 'bg-muted'
                      }`}
                    >
                      {login.device.toLowerCase().includes('mobile') ? (
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Monitor className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{login.device}</p>
                        {login.current && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] px-1.5 py-0">
                            Sesi Ini
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground font-mono">{login.ip}</span>
                        <span className="text-xs text-muted-foreground">{login.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 6: APPEARANCE
          ═══════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-teal-500" />
              Tampilan
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-0 divide-y divide-border">
            {/* Theme Toggle (existing) */}
            <div className="flex items-center justify-between gap-4 pb-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mt-0.5">
                  <Moon className="h-4 w-4 text-slate-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Mode Gelap Otomatis</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Aktifkan mode gelap sesuai pengaturan sistem perangkat
                  </p>
                </div>
              </div>
              <Switch
                checked={appSettings.autoDarkMode}
                onCheckedChange={(checked) => updateAppSettings('autoDarkMode', checked)}
              />
            </div>

            {/* Font Size */}
            <div className="flex items-center justify-between gap-4 py-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mt-0.5">
                  <Type className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Ukuran Font</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sesuaikan ukuran teks di seluruh aplikasi
                  </p>
                </div>
              </div>
              <Select
                value={appearanceSettings.fontSize}
                onValueChange={(val) => {
                  const updated = { ...appearanceSettings, fontSize: val }
                  setAppearanceSettings(updated)
                  localStorage.setItem('saksi-appearance-settings', JSON.stringify(updated))
                }}
              >
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Kecil</SelectItem>
                  <SelectItem value="medium">Sedang</SelectItem>
                  <SelectItem value="large">Besar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Compact Mode */}
            <div className="flex items-center justify-between gap-4 py-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center mt-0.5">
                  <LayoutGrid className="h-4 w-4 text-teal-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Mode Kompak</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Kurangi jarak dan ukuran elemen untuk tampilan lebih padat
                  </p>
                </div>
              </div>
              <Switch
                checked={appearanceSettings.compactMode}
                onCheckedChange={(checked) => {
                  const updated = { ...appearanceSettings, compactMode: checked }
                  setAppearanceSettings(updated)
                  localStorage.setItem('saksi-appearance-settings', JSON.stringify(updated))
                }}
              />
            </div>

            {/* Sidebar Position */}
            <div className="flex items-center justify-between gap-4 pt-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mt-0.5">
                  <ArrowLeftRight className="h-4 w-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Posisi Sidebar</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pilih posisi sidebar navigasi (Kiri / Kanan)
                  </p>
                </div>
              </div>
              <Select
                value={appearanceSettings.sidebarPosition}
                onValueChange={(val) => {
                  const updated = { ...appearanceSettings, sidebarPosition: val }
                  setAppearanceSettings(updated)
                  localStorage.setItem('saksi-appearance-settings', JSON.stringify(updated))
                }}
              >
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Kiri</SelectItem>
                  <SelectItem value="right">Kanan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: DATA MANAGEMENT (Enhanced)
          ═══════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-amber-500" />
              Manajemen Data
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-0 divide-y divide-border">
            {/* Export All Data */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mt-0.5">
                  <FileDown className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Ekspor Semua Data</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Unduh semua data sistem dalam format CSV untuk keperluan laporan
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="gap-2 shrink-0"
              >
                {exported ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600">Terekspor!</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export CSV
                  </>
                )}
              </Button>
            </div>

            {/* Clear Cache (with confirmation dialog) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mt-0.5">
                  <HardDrive className="h-4 w-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Kosongkan Cache</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Bersihkan cache lokal browser tanpa menghapus pengaturan tersimpan
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowClearCacheDialog(true)}
                className="gap-2 shrink-0"
              >
                {clearedCache ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-emerald-600">Dibersihkan!</span>
                  </>
                ) : (
                  <>
                    <HardDrive className="h-4 w-4" />
                    Kosongkan
                  </>
                )}
              </Button>
            </div>

            {/* Database Backup Info */}
            <div className="py-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center mt-0.5">
                  <Archive className="h-4 w-4 text-teal-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Backup Database</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Status dan informasi backup otomatis database
                  </p>
                </div>
              </div>
              <div className="ml-12 rounded-lg border border-teal-200 bg-gradient-to-r from-teal-50 to-emerald-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
                    <Server className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-teal-800">Backup Terakhir</p>
                      <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px] px-1.5 py-0">
                        Otomatis
                      </Badge>
                    </div>
                    <p className="text-xs text-teal-600 mt-0.5">{lastBackupDate} WIB</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-teal-700">Berhasil</p>
                    <p className="text-xs text-teal-500">Setiap 6 jam</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Reset Demo Data (double confirmation) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center mt-0.5">
                  <RotateCcw className="h-4 w-4 text-rose-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Reset Data Demo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Hapus semua pengaturan kustom dan kembalikan ke default. Memerlukan konfirmasi ganda.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetDialog(true)}
                className="gap-2 shrink-0 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 className="h-4 w-4" />
                Reset Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* ══ Payment Configuration Section ════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5 text-emerald-500" />
              Konfigurasi Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="nominal" className="text-sm font-medium flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50">
                  <span className="text-xs font-bold text-emerald-600">Rp</span>
                </span>
                Nominal Pembayaran
              </Label>
              <Input
                id="nominal"
                type="text"
                value={paymentConfig.nominal}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '')
                  setPaymentConfig((prev) => ({ ...prev, nominal: val }))
                }}
                placeholder="Contoh: 150000"
                className="max-w-xs font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Nominal: Rp {Number(paymentConfig.nominal || 0).toLocaleString('id-ID')}
              </p>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-medium">Metode Pembayaran Aktif</Label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    paymentConfig.methods.bank
                      ? 'border-emerald-300 bg-emerald-50/50'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                  onClick={() =>
                    setPaymentConfig((prev) => ({
                      ...prev,
                      methods: { ...prev.methods, bank: !prev.methods.bank },
                    }))
                  }
                >
                  <Checkbox
                    checked={paymentConfig.methods.bank}
                    onCheckedChange={(checked) =>
                      setPaymentConfig((prev) => ({
                        ...prev,
                        methods: { ...prev.methods, bank: !!checked },
                      }))
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium">Transfer Bank</span>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                    paymentConfig.methods.ewallet
                      ? 'border-teal-300 bg-teal-50/50'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                  onClick={() =>
                    setPaymentConfig((prev) => ({
                      ...prev,
                      methods: { ...prev.methods, ewallet: !prev.methods.ewallet },
                    }))
                  }
                >
                  <Checkbox
                    checked={paymentConfig.methods.ewallet}
                    onCheckedChange={(checked) =>
                      setPaymentConfig((prev) => ({
                        ...prev,
                        methods: { ...prev.methods, ewallet: !!checked },
                      }))
                    }
                  />
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-medium">E-Wallet</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSavePayment}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-sm gap-2"
            >
              {savedPayment ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Tersimpan!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Simpan Konfigurasi
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* ══ GPS Configuration Section ════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <Navigation className="h-5 w-5 text-teal-500" />
              Konfigurasi GPS
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Atur radius toleransi GPS untuk verifikasi check-in saksi di lokasi TPS.
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Radius Toleransi GPS</Label>
                <Badge variant="outline" className="font-mono text-sm px-3 py-1 border-teal-200 text-teal-700">
                  {gpsRadius}m
                </Badge>
              </div>
              <Slider
                value={[gpsRadius]}
                onValueChange={handleGpsChange}
                min={50}
                max={500}
                step={10}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  50m (Ketat)
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  500m (Longgar)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* ═══════════════════════════════════════════════════════════
          SECTION 7: ENHANCED BRAND / ABOUT CARD
          ═══════════════════════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-slate-500" />
              Tentang Aplikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            {/* Brand Card */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-emerald-200 ring-2 ring-emerald-100">
                <Image
                  src="/logo.png"
                  alt="Alpha System v5"
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-foreground">Alpha System v5</h3>
                  <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-600 px-1.5 py-0">
                    v5.0.0
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                  <Zap className="h-3 w-3 text-emerald-500" />
                  Built with Next.js 16 + Supabase
                </p>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Sistem manajemen terintegrasi untuk monitoring, operasi GPS,
                  penghitungan data real-time, dan transparansi pembayaran.
                </p>
              </div>
            </div>

            <Separator />

            {/* Tech Stack Badges */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Teknologi
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1.5 bg-emerald-50 text-emerald-700 border-0 px-3 py-1">
                  <Code2 className="h-3 w-3" />
                  Next.js 16
                </Badge>
                <Badge variant="secondary" className="gap-1.5 bg-teal-50 text-teal-700 border-0 px-3 py-1">
                  <Globe className="h-3 w-3" />
                  Supabase
                </Badge>
                <Badge variant="secondary" className="gap-1.5 bg-amber-50 text-amber-700 border-0 px-3 py-1">
                  <Map className="h-3 w-3" />
                  Leaflet
                </Badge>
                <Badge variant="secondary" className="gap-1.5 bg-rose-50 text-rose-700 border-0 px-3 py-1">
                  <Type className="h-3 w-3" />
                  TypeScript
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Build Info */}
            <div className="rounded-lg bg-muted/30 border p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Informasi Build
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Versi</span>
                  <p className="font-medium text-foreground mt-0.5">v5.0.0</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Framework</span>
                  <p className="font-medium text-foreground mt-0.5">Next.js 16</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Database</span>
                  <p className="font-medium text-foreground mt-0.5">Supabase PG</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Runtime</span>
                  <p className="font-medium text-foreground mt-0.5">Node.js</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Environment</span>
                  <p className="font-medium text-foreground mt-0.5">Production</p>
                </div>
                <div>
                  <span className="text-muted-foreground">License</span>
                  <p className="font-medium text-foreground mt-0.5">MIT</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Tagline */}
            <div className="flex items-center justify-center gap-2 py-2">
              <Heart className="h-4 w-4 text-rose-500" />
              <p className="text-sm font-medium text-muted-foreground">
                Dibuat untuk Pemilu Indonesia
              </p>
              <Heart className="h-4 w-4 text-rose-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════
          CONFIRMATION DIALOGS
          ═══════════════════════════════════════════════════════════ */}

      {/* First confirmation: Clear Cache */}
      <ConfirmDialog
        open={showClearCacheDialog}
        onOpenChange={setShowClearCacheDialog}
        title="Kosongkan Cache?"
        description="Semua data cache lokal akan dihapus. Pengaturan tersimpan tidak akan terpengaruh."
        confirmLabel="Ya, Kosongkan"
        cancelLabel="Batal"
        onConfirm={handleClearCache}
        variant="destructive"
      />

      {/* First confirmation: Reset (step 1) */}
      <AnimatePresence>
        {showResetDialog && !showResetConfirm && (
          <ConfirmDialog
            open={showResetDialog}
            onOpenChange={(open) => {
              if (!open) setShowResetDialog(false)
            }}
            title="Reset Data Demo?"
            description="Semua pengaturan kustom akan dihapus dan dikembalikan ke nilai default. Anda akan diminta konfirmasi sekali lagi."
            confirmLabel="Lanjutkan"
            cancelLabel="Batal"
            onConfirm={() => {
              setShowResetDialog(false)
              setShowResetConfirm(true)
            }}
            variant="destructive"
          />
        )}
      </AnimatePresence>

      {/* Second confirmation: Reset (step 2) */}
      <AnimatePresence>
        {showResetConfirm && (
          <ConfirmDialog
            open={showResetConfirm}
            onOpenChange={setShowResetConfirm}
            title="Konfirmasi Terakhir"
            description="Apakah Anda benar-benar yakin ingin mereset semua data? Tindakan ini TIDAK DAPAT dibatalkan."
            confirmLabel="Ya, Reset Sekarang"
            cancelLabel="Batal"
            onConfirm={handleResetData}
            variant="destructive"
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
