'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Users, MapPin, ClipboardCheck, FileText, Wallet,
  BarChart3, ArrowRight, TrendingUp, ShieldCheck,
  AlertTriangle, Clock, CheckCircle2, UserPlus,
  ChevronDown, Activity, MapPinned, Settings,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import QuickActions from '@/components/common/QuickActions'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'

// ─── Animated Counter ────────────────────────────────────────────────
function AnimatedCounter({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionVal = useMotionValue(0)
  const rounded = useTransform(motionVal, Math.round)

  useEffect(() => {
    const controls = animate(motionVal, value, { duration, ease: 'easeOut' })
    return controls.stop
  }, [motionVal, value, duration])

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      if (ref.current) ref.current.textContent = latest.toLocaleString('id-ID')
    })
    return unsubscribe
  }, [rounded])

  return <span ref={ref}>0</span>
}

// ─── Animated Stat Card ──────────────────────────────────────────────
function AnimatedStatCard({
  icon,
  label,
  value,
  borderColor,
  bgClass,
  index,
  trend,
  trendLabel,
}: {
  icon: React.ReactNode
  label: string
  value: number
  borderColor: string
  bgClass?: string
  index: number
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="cursor-default"
    >
      <Card className={`shadow-sm border-l-4 ${borderColor} ${bgClass || ''} transition-shadow hover:shadow-md`}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/70 dark:bg-slate-700/70 shadow-sm flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold leading-tight">
              <AnimatedCounter value={value} />
            </p>
            <p className="text-xs text-muted-foreground truncate">{label}</p>
          </div>
          {trend && trendLabel && (
            <div className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full ${
              trend === 'up' ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40' :
              trend === 'down' ? 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/40' :
              'text-muted-foreground bg-muted'
            }`}>
              {trend === 'up' && <TrendingUp className="h-3 w-3" />}
              {trend === 'down' && <ChevronDown className="h-3 w-3" />}
              {trendLabel}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Circular Progress Ring ──────────────────────────────────────────
function ProgressRing({ percentage, size = 120, strokeWidth = 8 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true })
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const color = percentage > 70 ? '#10b981' : percentage >= 40 ? '#f59e0b' : '#f43f5e'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg ref={ref} width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="currentColor" strokeWidth={strokeWidth}
          fill="none" className="text-muted/30"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth}
          fill="none" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={inView ? { strokeDashoffset: circumference - (percentage / 100) * circumference } : {}}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-3xl font-bold"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          {percentage}%
        </motion.span>
      </div>
    </div>
  )
}

// ─── Animated Progress Bar ───────────────────────────────────────────
function AnimatedProgressBar({ percentage, label, count, total }: { percentage: number; label: string; count: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-emerald-700">{percentage}%</span>
          <span className="text-xs text-muted-foreground">({count}/{total})</span>
        </div>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
          initial={{ width: 0 }}
          animate={inView ? { width: `${percentage}%` } : { width: 0 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  )
}

// ─── Payment Mini Bar Chart ──────────────────────────────────────────
function PaymentBarChart({ data }: { data: Record<string, { count: number; total: number }> }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  const colorMap: Record<string, string> = {
    PENDING: 'bg-amber-400',
    READY_FOR_PAYMENT: 'bg-teal-500',
    APPROVED: 'bg-emerald-500',
    DISBURSED: 'bg-emerald-700',
    FAILED: 'bg-rose-500',
    CANCELLED: 'bg-gray-400',
  }

  const entries = Object.entries(data)
  const maxCount = Math.max(...entries.map(([, v]) => v.count), 1)

  return (
    <div ref={ref} className="flex items-end justify-around gap-3 h-44 px-2">
      {entries.map(([status, info], i) => (
        <div key={status} className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 + i * 0.1 }}
          >
            <p className="text-xs font-bold">{info.count}</p>
            {info.total > 0 && (
              <p className="text-[10px] text-muted-foreground leading-tight">{formatCurrency(info.total)}</p>
            )}
          </motion.div>
          <motion.div
            className={`w-full max-w-[40px] rounded-t-md ${colorMap[status] || 'bg-gray-400'}`}
            initial={{ height: 0 }}
            animate={inView ? { height: `${Math.max((info.count / maxCount) * 100, 8)}%` } : { height: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 + i * 0.1 }}
          />
          <p className="text-[10px] text-muted-foreground text-center leading-tight min-h-[28px]">
            {status.replace(/_/g, ' ')}
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── Report Status Badge ─────────────────────────────────────────────
function ReportStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; dot: string }> = {
    PENDING: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', dot: 'bg-amber-500' },
    UNDER_REVIEW: { color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300', dot: 'bg-teal-500' },
    VERIFIED: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500' },
    DISMISSED: { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', dot: 'bg-gray-500' },
  }
  const c = config[status] || { color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400', dot: 'bg-gray-500' }
  return (
    <Badge variant="secondary" className={`${c.color} gap-1.5`}>
      <span className={`inline-flex h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}

// ─── Action Button ───────────────────────────────────────────────────
function ActionButton({ label, onClick, icon, index }: { label: string; onClick: () => void; icon: React.ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.07 }}
    >
      <Button variant="outline" className="h-auto py-4 flex-col gap-2 shadow-sm w-full hover:shadow-md transition-shadow" onClick={onClick}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </Button>
    </motion.div>
  )
}

// ─── Format Relative Time ────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  if (days < 7) return `${days} hari lalu`
  return new Date(dateStr).toLocaleDateString('id-ID')
}

// ─── Timeline Entry ──────────────────────────────────────────────────
function TimelineEntry({ item, index, isLast }: { item: { type: 'saksi' | 'report'; id: string; title: string; description: string; timestamp: string }; index: number; isLast: boolean }) {
  const isSaksi = item.type === 'saksi'
  const dotColor = isSaksi ? 'bg-emerald-500' : 'bg-amber-500'
  const lineColor = isSaksi ? 'border-emerald-300 dark:border-emerald-700' : 'border-amber-300 dark:border-amber-700'

  return (
    <motion.div
      className="flex gap-3"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 + index * 0.06 }}
    >
      <div className="flex flex-col items-center">
        <div className={`w-2.5 h-2.5 rounded-full ${dotColor} ring-4 ring-white dark:ring-slate-700 shadow-sm flex-shrink-0 mt-1`} />
        {!isLast && <div className={`w-px flex-1 border-l-2 ${lineColor} my-1`} />}
      </div>
      <div className={`pb-4 ${isLast ? 'pb-0' : ''} flex-1 min-w-0`}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight">{item.title}</p>
          <span className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0">{timeAgo(item.timestamp)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>
      </div>
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════
export default function AdminDashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(() => {
    fetch('/api/dashboard/admin')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((res) => {
        if (res.success) setData(res.data)
        else setError(res.error)
      })
      .catch((err) => setError(err.statusText || 'Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading) return <DashboardSkeleton variant="dashboard" />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />
  if (!data) return null

  const { overview, checkInBreakdown, paymentSummary, recentSaksi, recentReports } = data

  // Build combined timeline
  const timeline: Array<{ type: 'saksi' | 'report'; id: string; title: string; description: string; timestamp: string }> = []
  recentSaksi?.forEach((s: any) => {
    timeline.push({
      type: 'saksi',
      id: `saksi-${s.id}`,
      title: `Saksi baru: ${s.name}`,
      description: s.email,
      timestamp: s.createdAt,
    })
  })
  recentReports?.forEach((r: any) => {
    timeline.push({
      type: 'report',
      id: `report-${r.id}`,
      title: `Laporan: ${r.title}`,
      description: `Oleh ${r.user?.name || 'Unknown'} · ${r.status.replace(/_/g, ' ')}`,
      timestamp: r.createdAt,
    })
  })
  timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const displayTimeline = timeline.slice(0, 10)

  const checkInRateColor = overview.checkInRate > 70 ? 'text-emerald-600' : overview.checkInRate >= 40 ? 'text-amber-600' : 'text-rose-600'

  return (
    <div className="space-y-8">
      {/* ── Page Title Area ────────────────────────────────── */}
      <motion.div
        className="relative rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-transparent dark:from-slate-800 dark:via-emerald-950/20 dark:to-transparent border border-emerald-100/50 dark:border-emerald-800/50 px-6 py-5 overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100/30 dark:bg-emerald-900/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-teal-100/20 dark:bg-teal-900/20 rounded-full translate-y-1/2" />
        <div className="relative">
          <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Dashboard Admin</h1>
          <p className="text-muted-foreground mt-0.5">Selamat datang, {user?.name}</p>
        </div>
      </motion.div>

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatedStatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Saksi"
          value={overview.totalSaksi}
          borderColor="border-l-emerald-500"
          bgClass="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30"
          index={0}
          trend={overview.totalSaksi > 0 ? 'up' : 'neutral'}
          trendLabel={overview.totalSaksi > 0 ? 'Aktif' : '-'}
        />
        <AnimatedStatCard
          icon={<MapPin className="h-5 w-5" />}
          label="Total TPS"
          value={overview.totalTps}
          borderColor="border-l-amber-500"
          bgClass="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
          index={1}
          trend={overview.totalTps > 0 ? 'up' : 'neutral'}
          trendLabel={overview.totalTps > 0 ? 'Terdaftar' : '-'}
        />
        <AnimatedStatCard
          icon={<ClipboardCheck className="h-5 w-5" />}
          label="Penugasan Aktif"
          value={overview.activeAssignments}
          borderColor="border-l-teal-500"
          bgClass="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30"
          index={2}
          trend={overview.activeAssignments > 0 ? 'up' : 'neutral'}
          trendLabel={overview.activeAssignments > 0 ? 'Berjalan' : '-'}
        />
        <AnimatedStatCard
          icon={<FileText className="h-5 w-5" />}
          label="Laporan Fraud"
          value={overview.totalReports}
          borderColor={overview.totalReports > 0 ? 'border-l-rose-500' : 'border-l-gray-300'}
          bgClass={overview.totalReports > 0 ? 'bg-gradient-to-br from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30' : ''}
          index={3}
          trend={overview.totalReports > 0 ? 'down' : 'neutral'}
          trendLabel={overview.totalReports > 0 ? 'Perlu review' : 'Aman'}
        />
      </div>

      {/* ── Quick Actions ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <QuickActions
          actions={[
            { label: 'Tambah Saksi', icon: <UserPlus className="h-5 w-5" />, href: '/admin/saksi', variant: 'emerald' },
            { label: 'Tambah TPS', icon: <MapPin className="h-5 w-5" />, href: '/admin/tps', variant: 'amber' },
            { label: 'Lihat Laporan', icon: <FileText className="h-5 w-5" />, href: '/admin/reports', variant: 'rose' },
            { label: 'Plotting', icon: <MapPinned className="h-5 w-5" />, href: '/admin/plotting', variant: 'emerald' },
            { label: 'Pengaturan', icon: <Settings className="h-5 w-5" />, href: '/admin/settings', variant: 'default' },
          ]}
        />
      </motion.div>

      {/* ── Rates Section ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Check-in Rate with Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2 bg-muted/50 rounded-t-lg">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Check-in Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center py-4">
              <ProgressRing percentage={overview.checkInRate} />
              <div className="flex gap-2 mt-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs font-medium">
                  <Clock className="h-3 w-3" />
                  Pagi: {checkInBreakdown?.MORNING || 0}
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 dark:bg-teal-900/40 dark:text-teal-300 text-xs font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  Akhir: {checkInBreakdown?.FINAL || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Input Rate with Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2 bg-muted/50 rounded-t-lg">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-teal-500" />
                Data Input Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 pb-4 px-6">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-4xl font-bold ${checkInRateColor}`}>
                  <AnimatedCounter value={overview.dataInputRate} />
                  <span className="text-lg">%</span>
                </span>
                <div className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">{overview.totalVoteInputs}</span>
                  <br />dari {overview.activeAssignments} penugasan
                </div>
              </div>
              <AnimatedProgressBar
                percentage={overview.dataInputRate}
                label="Progress Input"
                count={overview.totalVoteInputs}
                total={overview.activeAssignments}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Check-ins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <Card className="shadow-sm h-full">
            <CardHeader className="pb-2 bg-muted/50 rounded-t-lg">
              <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4 text-amber-500" />
                Total Check-in
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <p className="text-5xl font-bold text-amber-600">
                <AnimatedCounter value={overview.totalCheckIns} />
              </p>
              <p className="text-xs text-muted-foreground mt-2">Pagi &amp; Akhir Check-in</p>
              <div className="flex gap-4 mt-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-emerald-600">{checkInBreakdown?.MORNING || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Pagi</p>
                </div>
                <div className="w-px bg-border" />
                <div className="text-center">
                  <p className="text-lg font-bold text-teal-600">{checkInBreakdown?.FINAL || 0}</p>
                  <p className="text-[10px] text-muted-foreground">Akhir</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Payment Summary ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-emerald-500" />
                Ringkasan Pembayaran
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push('/keuangan/dashboard')}>
                Lihat Detail <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 pb-2">
            {paymentSummary && Object.keys(paymentSummary).length > 0 ? (
              <PaymentBarChart data={paymentSummary} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada data pembayaran</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Quick Actions ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ActionButton label="Kelola Saksi" onClick={() => router.push('/admin/saksi')} icon={<Users className="h-5 w-5" />} index={0} />
        <ActionButton label="Kelola TPS" onClick={() => router.push('/admin/tps')} icon={<MapPin className="h-5 w-5" />} index={1} />
        <ActionButton label="Plotting" onClick={() => router.push('/admin/plotting')} icon={<BarChart3 className="h-5 w-5" />} index={2} />
        <ActionButton label="Laporan" onClick={() => router.push('/admin/reports')} icon={<FileText className="h-5 w-5" />} index={3} />
      </div>

      {/* ── Activity Timeline ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Aktivitas Terbaru
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayTimeline.length > 0 ? (
              <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                {displayTimeline.map((item, i) => (
                  <TimelineEntry
                    key={item.id}
                    item={item}
                    index={i}
                    isLast={i === displayTimeline.length - 1}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada aktivitas terbaru</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
