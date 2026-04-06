'use client'

import { useState, useCallback } from 'react'
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
} from 'lucide-react'
import { motion } from 'framer-motion'

// ─── Animation Variants ──────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

// ─── Settings Types ──────────────────────────────────────────────────
interface AppSettings {
  emailNotifications: boolean
  autoRefresh: boolean
  showMap: boolean
  autoDarkMode: boolean
}

interface PaymentConfig {
  nominal: string
  methods: { bank: boolean; ewallet: boolean }
}

const defaultAppSettings: AppSettings = {
  emailNotifications: true,
  autoRefresh: true,
  showMap: true,
  autoDarkMode: false,
}

const defaultPaymentConfig: PaymentConfig = {
  nominal: '150000',
  methods: { bank: true, ewallet: true },
}

const defaultGpsRadius = 100

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

// ═════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════
export default function AdminSettingsPage() {
  const { user } = useAuthStore()

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

  // ─── UI State ───────────────────────────────────────────────────
  const [showResetDialog, setShowResetDialog] = useState(false)
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
    // Create a demo CSV export
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
    setAppSettings(defaultAppSettings)
    setPaymentConfig(defaultPaymentConfig)
    setGpsRadius(defaultGpsRadius)
    setShowResetDialog(false)
  }, [])

  const handleClearCache = useCallback(() => {
    // Clear app-specific localStorage items
    const keysToKeep = ['saksi-app-settings', 'saksi-payment-config', 'saksi-gps-radius']
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && !keysToKeep.includes(key)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key))
    setClearedCache(true)
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

      {/* ══ Application Settings Section ════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-5 w-5 text-teal-500" />
              Pengaturan Aplikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-0 divide-y divide-border">
            {/* Email Notifications */}
            <div className="flex items-center justify-between gap-4 pb-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mt-0.5">
                  <Bell className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Notifikasi Email</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Terima email saat ada laporan baru atau pembaruan status pembayaran
                  </p>
                </div>
              </div>
              <Switch
                checked={appSettings.emailNotifications}
                onCheckedChange={(checked) => updateAppSettings('emailNotifications', checked)}
              />
            </div>

            {/* Auto Refresh Dashboard */}
            <div className="flex items-center justify-between gap-4 py-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center mt-0.5">
                  <RefreshCw className="h-4 w-4 text-teal-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Auto-refresh Dashboard</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Perbarui data dashboard secara otomatis setiap 30 detik
                  </p>
                </div>
              </div>
              <Switch
                checked={appSettings.autoRefresh}
                onCheckedChange={(checked) => updateAppSettings('autoRefresh', checked)}
              />
            </div>

            {/* Show Map */}
            <div className="flex items-center justify-between gap-4 py-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mt-0.5">
                  <MapPin className="h-4 w-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Tampilkan Peta</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Tampilkan peta interaktif pada halaman TPS dan check-in
                  </p>
                </div>
              </div>
              <Switch
                checked={appSettings.showMap}
                onCheckedChange={(checked) => updateAppSettings('showMap', checked)}
              />
            </div>

            {/* Auto Dark Mode */}
            <div className="flex items-center justify-between gap-4 pt-5">
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
            {/* Nominal Pembayaran */}
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

            {/* Metode Pembayaran */}
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

            {/* Save Button */}
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

      {/* ══ Data Management Section ══════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-amber-500" />
              Manajemen Data
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-0 divide-y divide-border">
            {/* Export Data */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center mt-0.5">
                  <Download className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Ekspor Data Semua</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Unduh semua data dalam format CSV untuk keperluan laporan
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

            {/* Reset Demo Data */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center mt-0.5">
                  <Trash2 className="h-4 w-4 text-rose-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Reset Data Demo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Hapus semua pengaturan kustom dan kembalikan ke default
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

            {/* Clear Cache */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5">
              <div className="flex items-start gap-3 min-w-0">
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mt-0.5">
                  <HardDrive className="h-4 w-4 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Kosongkan Cache</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Bersihkan cache lokal browser tanpa menghapus pengaturan
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
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
          </CardContent>
        </Card>
      </motion.div>

      <Separator />

      {/* ══ About Section ════════════════════════════════════════ */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50 rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-slate-500" />
              Tentang Aplikasi
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 flex items-center justify-center">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">SAKSI APP</h3>
                <Badge variant="outline" className="mt-1 text-xs border-emerald-200 text-emerald-600">
                  v1.0.0
                </Badge>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Sistem manajemen saksi pemilu terintegrasi untuk monitoring, check-in GPS, 
                  penghitungan suara real-time, dan transparansi pembayaran honor saksi.
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
                  Next.js
                </Badge>
                <Badge variant="secondary" className="gap-1.5 bg-teal-50 text-teal-700 border-0 px-3 py-1">
                  <Globe className="h-3 w-3" />
                  Supabase
                </Badge>
                <Badge variant="secondary" className="gap-1.5 bg-amber-50 text-amber-700 border-0 px-3 py-1">
                  <Map className="h-3 w-3" />
                  Leaflet
                </Badge>
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

      {/* ══ Reset Confirm Dialog ════════════════════════════════ */}
      <ConfirmDialog
        open={showResetDialog}
        onOpenChange={setShowResetDialog}
        title="Reset Data Demo?"
        description="Semua pengaturan kustom akan dihapus dan dikembalikan ke nilai default. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Ya, Reset"
        cancelLabel="Batal"
        onConfirm={handleResetData}
        variant="destructive"
      />
    </motion.div>
  )
}
