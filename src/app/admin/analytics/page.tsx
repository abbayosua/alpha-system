'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import {
  Users, ClipboardCheck, Vote, Wallet, BarChart3,
  TrendingUp, MapPin, FileBarChart, AlertTriangle,
  RefreshCw, ChevronRight, ArrowLeft, Download,
  ArrowUp, ArrowDown, Trophy, Activity, Target,
  Clock, CheckCircle2, Flame,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

// ─── Types ──────────────────────────────────────────────────
interface AnalyticsData {
  summary: {
    totalSaksi: number
    avgCheckInRate: number
    totalVotes: number
    totalDisbursed: number
    totalCheckIns: number
    totalReports: number
    totalPayments: number
    dataCompleteness: number
  }
  registrationTrend: Array<{ date: string; count: number }>
  checkInTrend: Array<{ date: string; pagi: number; akhir: number; total: number }>
  voteDistribution: Array<{ name: string; votes: number; color: string }>
  totalVotesAll: number
  paymentStatus: Array<{ status: string; count: number; total: number }>
  paymentStatusColors: Record<string, string>
  reportCategories: Array<{ category: string; count: number }>
  reportCategoryColors: Record<string, string>
  tpsCoverage: Array<{
    id: string; code: string; name: string; totalDpt: number
    assignments: number; checkIns: number; rate: number
  }>
  topAreas: Array<{
    id: string; code: string; name: string; totalDpt: number
    assignments: number; checkIns: number; rate: number
  }>
  activityHeatmap: Array<{ day: number; hour: number; count: number }>
  saksiRankings: Array<{
    id: string; name: string; email: string; phone: string | null
    createdAt: string; assignments: number; checkIns: number
    voteInputs: number; reports: number; completionRate: number
  }>
}

// ─── Animation Variants ─────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

const rowVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { duration: 0.3, delay: i * 0.04, ease: 'easeOut' },
  }),
}

// ─── Animated Counter ──────────────────────────────────────
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

// ─── Progress Ring (inline SVG) ───────────────────────────
function ProgressRing({ percentage, size = 72, strokeWidth = 6 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const inView = useInView(svgRef, { once: true })
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const color = percentage > 70 ? '#10b981' : percentage >= 40 ? '#f59e0b' : '#f43f5e'

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg ref={svgRef} width={size} height={size} className="-rotate-90">
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
          className="text-lg font-bold"
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

// ─── Custom Tooltip ────────────────────────────────────────
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-border/50 rounded-lg px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-semibold text-foreground">{p.value.toLocaleString('id-ID')}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Format date for chart labels ──────────────────────────
function formatChartDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

// ─── Status label helper ───────────────────────────────────
function statusLabel(status: string) {
  const map: Record<string, string> = {
    PENDING: 'Pending',
    READY_FOR_PAYMENT: 'Siap Bayar',
    APPROVED: 'Disetujui',
    DISBURSED: 'Dicairkan',
    FAILED: 'Gagal',
    CANCELLED: 'Dibatalkan',
  }
  return map[status] || status.replace(/_/g, ' ')
}

// ─── Category label helper ─────────────────────────────────
function categoryLabel(cat: string) {
  const map: Record<string, string> = {
    KECURANGAN_SUARA: 'Kecurangan Suara',
    PENGAWAS_GANDA: 'Pengawas Ganda',
    PELANGGARAN_TPS: 'Pelanggaran TPS',
    INTIMIDASI: 'Intimidasi',
    MONEY_POLITICS: 'Money Politics',
    LAINNYA: 'Lainnya',
  }
  return map[cat] || cat.replace(/_/g, ' ')
}

// ─── Day names (Indonesian) ────────────────────────────────
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const DAY_FULL = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
const DISPLAY_DAYS = [1, 2, 3, 4, 5, 6, 0] // Mon-Sun order

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function AnalyticsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [refreshing, setRefreshing] = useState(false)
  const [fetchKey, setFetchKey] = useState(0)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const res = await fetch(`/api/analytics?days=${days}`)
        if (!cancelled) {
          if (res.ok) {
            const json = await res.json()
            if (json.success) setData(json.data)
            else setError(json.error)
          } else {
            setError(res.statusText || 'Gagal memuat data')
          }
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Gagal memuat data')
      } finally {
        if (!cancelled) { setLoading(false); setRefreshing(false) }
      }
    }

    setError(null)
    if (!data) setLoading(true)
    load()

    return () => { cancelled = true }
  }, [days, fetchKey])

  const handleRefresh = useCallback(() => {
    setRefreshing(true)
    setLoading(false)
    setFetchKey((k) => k + 1)
  }, [])

  // Build heatmap grid from flat data
  const heatmapGrid = useMemo(() => {
    const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
    if (!data?.activityHeatmap) return grid
    for (const h of data.activityHeatmap) {
      grid[h.day][h.hour] = h.count
    }
    return grid
  }, [data?.activityHeatmap])

  // Find max for heatmap intensity
  const heatmapMax = useMemo(() => {
    let max = 1
    for (const row of heatmapGrid) {
      for (const val of row) {
        if (val > max) max = val
      }
    }
    return max
  }, [heatmapGrid])

  // Peak hour
  const peakHour = useMemo(() => {
    let maxVal = 0
    let maxH = 7
    for (let h = 0; h < 24; h++) {
      let total = 0
      for (let d = 0; d < 7; d++) total += heatmapGrid[d][h]
      if (total > maxVal) { maxVal = total; maxH = h }
    }
    return { hour: maxH, count: maxVal }
  }, [heatmapGrid])

  // Peak day
  const peakDay = useMemo(() => {
    let maxVal = 0
    let maxD = 1
    for (let d = 0; d < 7; d++) {
      let total = 0
      for (let h = 0; h < 24; h++) total += heatmapGrid[d][h]
      if (total > maxVal) { maxVal = total; maxD = d }
    }
    return { day: maxD, count: maxVal }
  }, [heatmapGrid])

  // Export CSV
  const handleExportCSV = useCallback(async () => {
    if (!data) return
    setExporting(true)
    try {
      const lines: string[] = []

      // Summary
      lines.push('=== RINGKASAN ===')
      lines.push(`Total Saksi,${data.summary.totalSaksi}`)
      lines.push(`Check-in Rate,${data.summary.avgCheckInRate}%`)
      lines.push(`Total Suara,${data.summary.totalVotes}`)
      lines.push(`Total Pembayaran,${data.summary.totalPayments}`)
      lines.push(`Total Dicairkan,${data.summary.totalDisbursed}`)
      lines.push(`Kelengkapan Data,${data.summary.dataCompleteness}%`)
      lines.push(`Total Laporan,${data.summary.totalReports}`)
      lines.push('')

      // Registration Trend
      lines.push('=== TREN REGISTRASI ===')
      lines.push('Tanggal,Jumlah')
      for (const r of data.registrationTrend) {
        lines.push(`${r.date},${r.count}`)
      }
      lines.push('')

      // Check-in Trend
      lines.push('=== TREN CHECK-IN ===')
      lines.push('Tanggal,Pagi,Akhir,Total')
      for (const c of data.checkInTrend) {
        lines.push(`${c.date},${c.pagi},${c.akhir},${c.total}`)
      }
      lines.push('')

      // Vote Distribution
      lines.push('=== DISTRIBUSI SUARA ===')
      lines.push('Kandidat,Suara')
      for (const v of data.voteDistribution) {
        lines.push(`${v.name},${v.votes}`)
      }
      lines.push('')

      // Payment Status
      lines.push('=== STATUS PEMBAYARAN ===')
      lines.push('Status,Jumlah,Total')
      for (const p of data.paymentStatus) {
        lines.push(`${statusLabel(p.status)},${p.count},${p.total}`)
      }
      lines.push('')

      // TPS Coverage
      lines.push('=== CAKUPAN TPS ===')
      lines.push('Kode,Nama,DPT,Assignments,Check-ins,Rate')
      for (const t of data.tpsCoverage) {
        lines.push(`${t.code},${t.name},${t.totalDpt},${t.assignments},${t.checkIns},${t.rate}%`)
      }
      lines.push('')

      // Saksi Rankings
      lines.push('=== PERINGKAT SAKSI ===')
      lines.push('Nama,Email,Assignments,Check-ins,Input Suara,Laporan,Completion Rate')
      for (const s of data.saksiRankings) {
        lines.push(`${s.name},${s.email},${s.assignments},${s.checkIns},${s.voteInputs},${s.reports},${s.completionRate}%`)
      }

      const csv = lines.join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silent fail
    } finally {
      setExporting(false)
    }
  }, [data])

  if (loading && !data) return <DashboardSkeleton variant="dashboard" />
  if (error && !data) return <ErrorState message={error} onRetry={handleRefresh} />
  if (!data) return null

  const { summary, registrationTrend, checkInTrend, voteDistribution, totalVotesAll,
    paymentStatus, paymentStatusColors, reportCategories, reportCategoryColors,
    tpsCoverage, topAreas, saksiRankings } = data

  const reportColorArray = reportCategories.map((r) =>
    reportCategoryColors[r.category] || '#9ca3af'
  )

  // Payment stacked bar data
  const statusOrder = ['PENDING', 'READY_FOR_PAYMENT', 'APPROVED', 'DISBURSED', 'FAILED', 'CANCELLED']
  const paymentBarData = statusOrder
    .filter((s) => (paymentStatus.find((p) => p.status === s)?.count || 0) > 0)
    .map((s) => {
      const found = paymentStatus.find((p) => p.status === s)
      return {
        status: s,
        label: statusLabel(s),
        count: found?.count || 0,
        total: found?.total || 0,
        color: paymentStatusColors[s] || '#9ca3af',
      }
    })

  return (
    <div className="space-y-6">
      {/* ═══ PAGE TITLE AREA ══════════════════════════════════ */}
      <motion.div
        className="relative rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-transparent dark:from-slate-800 dark:via-emerald-950/20 dark:to-transparent border border-emerald-100/50 dark:border-emerald-800/50 px-6 py-5 overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100/30 dark:bg-emerald-900/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-teal-100/20 dark:bg-teal-900/20 rounded-full translate-y-1/2" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin/dashboard')} className="-ml-2 flex-shrink-0 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Analitik</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Statistik dan visualisasi data pemilu</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              disabled={exporting}
              className="bg-white/60 dark:bg-slate-700/60 hover:bg-white/80 dark:hover:bg-slate-700/80 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
            >
              <Download className={`h-4 w-4 mr-1.5 ${exporting ? 'animate-bounce' : ''}`} />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="bg-white/60 dark:bg-slate-700/60 hover:bg-white/80 dark:hover:bg-slate-700/80 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
            >
              <RefreshCw className={`h-4 w-4 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ═══ DATE RANGE SELECTOR ══════════════════════════════ */}
      <motion.div
        className="flex items-center gap-2 flex-wrap"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <span className="text-sm text-muted-foreground mr-1">Periode:</span>
        {[7, 30, 90, 0].map((d) => (
          <Button
            key={d}
            variant={days === d ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDays(d)}
            className={days === d
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm'
              : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-200 dark:hover:border-emerald-700'
            }
          >
            {d === 0 ? 'Semua' : `${d} Hari`}
          </Button>
        ))}
      </motion.div>

      {/* ═══ KEY METRICS CARDS ═════════════════════════════════ */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Total Saksi */}
        <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -2 }} className="cursor-default">
          <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 hover:shadow-md transition-shadow h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/70 dark:bg-slate-700/70 shadow-sm flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  <AnimatedCounter value={summary.totalSaksi} />
                </p>
                <p className="text-xs text-muted-foreground">Total Saksi</p>
              </div>
              <div className="flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40">
                <ArrowUp className="h-3 w-3" />
                Aktif
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Check-in Rate */}
        <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -2 }} className="cursor-default">
          <Card className="shadow-sm border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 hover:shadow-md transition-shadow h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-shrink-0">
                <ProgressRing percentage={summary.avgCheckInRate} size={56} strokeWidth={5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">Check-in Rate</p>
                <p className="text-[10px] text-muted-foreground leading-tight">Rata-rata kehadiran</p>
                <div className="flex gap-1.5 mt-1">
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[9px] font-medium">
                    <Clock className="h-2.5 w-2.5" /> Pagi
                  </span>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-[9px] font-medium">
                    <CheckCircle2 className="h-2.5 w-2.5" /> Akhir
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data Completeness */}
        <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -2 }} className="cursor-default">
          <Card className="shadow-sm border-l-4 border-l-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 hover:shadow-md transition-shadow h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/70 dark:bg-slate-700/70 shadow-sm flex items-center justify-center">
                <Target className="h-5 w-5 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">
                  <AnimatedCounter value={summary.dataCompleteness} />
                  <span className="text-lg">%</span>
                </p>
                <p className="text-xs text-muted-foreground">Kelengkapan Data</p>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                summary.dataCompleteness >= 70
                  ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/40'
                  : summary.dataCompleteness >= 40
                    ? 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40'
                    : 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/40'
              }`}>
                {summary.dataCompleteness >= 70 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {summary.dataCompleteness >= 70 ? 'Baik' : summary.dataCompleteness >= 40 ? 'Sedang' : 'Rendah'}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Pembayaran */}
        <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -2 }} className="cursor-default">
          <Card className="shadow-sm border-l-4 border-l-emerald-700 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 hover:shadow-md transition-shadow h-full">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/70 dark:bg-slate-700/70 shadow-sm flex items-center justify-center">
                <Wallet className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-lg font-bold text-emerald-900 dark:text-emerald-100 truncate">{formatCurrency(summary.totalPayments)}</p>
                <p className="text-xs text-muted-foreground">Total Pembayaran</p>
                <p className="text-[10px] text-muted-foreground">
                  Cair: {formatCurrency(summary.totalDisbursed)}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ═══ CHARTS ROW 1: Registration Trend + Check-in Activity ════════ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Registration Trend */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm h-full">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Tren Registrasi Saksi
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={registrationTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="regGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatChartDate}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Saksi Baru"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fill="url(#regGradient)"
                      dot={false}
                      activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Check-in Activity */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm h-full">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-teal-500" />
                Performa Check-in Harian
              </CardTitle>
              <div className="flex gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Pagi
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 text-[10px] font-medium">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  Akhir
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={checkInTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatChartDate}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={{ stroke: '#e2e8f0' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="pagi" name="Pagi" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} maxBarSize={32} />
                    <Bar dataKey="akhir" name="Akhir" stackId="a" fill="#14b8a6" radius={[4, 4, 0, 0]} maxBarSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ═══ CHARTS ROW 2: Vote Distribution + Payment Pipeline ═════════ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Vote Distribution */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm h-full">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="text-base flex items-center gap-2">
                <Vote className="h-4 w-4 text-amber-500" />
                Distribusi Suara
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="relative">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={voteDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="votes"
                        nameKey="name"
                        stroke="none"
                      >
                        {voteDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [value.toLocaleString('id-ID'), 'Suara']}
                        contentStyle={{
                          borderRadius: '8px', fontSize: '12px',
                          border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ marginTop: '-8px' }}>
                  <p className="text-2xl font-bold text-foreground">{totalVotesAll.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-muted-foreground">Total Suara</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2">
                {voteDistribution.map((v) => (
                  <div key={v.name} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                    <span className="text-muted-foreground">{v.name}</span>
                    <span className="font-semibold text-foreground">{v.votes.toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Pipeline (Stacked Bar) */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm h-full">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4 text-emerald-500" />
                Pipeline Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {paymentBarData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada data pembayaran</p>
              ) : (
                <>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[{ name: 'Pembayaran', ...Object.fromEntries(paymentBarData.map((p) => [p.status, p.count])) }]} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 11, fill: '#94a3b8' }}
                          axisLine={false}
                          tickLine={false}
                          width={90}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        {paymentBarData.map((p) => (
                          <Bar
                            key={p.status}
                            dataKey={p.status}
                            name={p.label}
                            stackId="a"
                            fill={p.color}
                            maxBarSize={28}
                            radius={0}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Payment legend */}
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
                    {paymentBarData.map((p) => (
                      <div key={p.status} className="flex items-center gap-1.5 text-xs">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-muted-foreground">{p.label}</span>
                        <span className="font-semibold text-foreground">{p.count}</span>
                        {p.total > 0 && (
                          <span className="text-[10px] text-muted-foreground">({formatCurrency(p.total)})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ═══ ACTIVITY HEATMAP ══════════════════════════════════ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-rose-500" />
                    Peta Aktivitas Check-in
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Intensitas check-in berdasarkan hari dan jam</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Flame className="h-3.5 w-3.5 text-amber-500" />
                    <span>Puncak: {DAY_FULL[peakDay.day]} {String(peakHour.hour).padStart(2, '0')}:00 ({peakHour.count})</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {/* Heatmap intensity legend */}
              <div className="flex items-center gap-1.5 mb-3">
                <span className="text-[10px] text-muted-foreground">Sedikit</span>
                {[0.05, 0.2, 0.4, 0.6, 0.8, 1.0].map((intensity) => (
                  <div
                    key={intensity}
                    className="w-4 h-4 rounded-sm"
                    style={{
                      backgroundColor: `rgba(16, 185, 129, ${intensity})`,
                    }}
                  />
                ))}
                <span className="text-[10px] text-muted-foreground">Banyak</span>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <div className="min-w-[640px]">
                  {/* Hour labels */}
                  <div className="flex items-center">
                    <div className="w-12 flex-shrink-0" />
                    {Array.from({ length: 16 }, (_, i) => i + 6).map((hour) => (
                      <div key={hour} className="flex-1 text-center text-[10px] text-muted-foreground font-medium pb-1">
                        {String(hour).padStart(2, '0')}
                      </div>
                    ))}
                  </div>

                  {/* Day rows */}
                  {DISPLAY_DAYS.map((dayIdx, rowI) => (
                    <motion.div
                      key={dayIdx}
                      className="flex items-center"
                      custom={rowI}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <div className="w-12 flex-shrink-0 text-xs font-medium text-muted-foreground text-right pr-2">
                        {DAY_NAMES[dayIdx]}
                      </div>
                      {Array.from({ length: 16 }, (_, i) => i + 6).map((hour) => {
                        const count = heatmapGrid[dayIdx]?.[hour] || 0
                        const intensity = count > 0 ? Math.max(count / heatmapMax, 0.05) : 0
                        return (
                          <motion.div
                            key={`${dayIdx}-${hour}`}
                            className="flex-1 mx-0.5 rounded-sm transition-all"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + rowI * 0.05 + (i => hour - 6) * 0.005, duration: 0.2 }}
                            style={{
                              height: '24px',
                              backgroundColor: count > 0
                                ? `rgba(16, 185, 129, ${intensity})`
                                : 'rgba(0,0,0,0.03)',
                            }}
                            whileHover={{
                              scale: 1.2,
                              zIndex: 10,
                              boxShadow: count > 0 ? '0 0 8px rgba(16,185,129,0.4)' : 'none',
                            }}
                            title={`${DAY_FULL[dayIdx]} ${String(hour).padStart(2, '0')}:00 — ${count} check-in`}
                          />
                        )
                      })}
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ═══ TPS COVERAGE + TOP AREAS ══════════════════════════ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* TPS Coverage Heatmap Grid */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm h-full">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4 text-rose-500" />
                Cakupan TPS
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {tpsCoverage.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada data TPS</p>
              ) : (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                    {tpsCoverage.map((tps) => {
                      const bgColor = tps.rate >= 70 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
                        : tps.rate >= 40 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-700'
                        : tps.assignments === 0 ? 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700'
                        : 'bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-700'
                      return (
                        <motion.div
                          key={tps.id}
                          className={`rounded-lg border p-2 text-center ${bgColor} transition-colors hover:opacity-80`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <p className="text-[10px] font-bold truncate">{tps.code}</p>
                          <p className="text-sm font-bold">{tps.rate}%</p>
                        </motion.div>
                      )
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />&ge;70%</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />40-69%</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" />&lt;40%</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300" />No data</div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Performing Areas */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm h-full">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-emerald-500" />
                Area Terbaik
              </CardTitle>
              <p className="text-xs text-muted-foreground">TPS dengan check-in rate tertinggi</p>
            </CardHeader>
            <CardContent className="pt-4">
              {topAreas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada data</p>
              ) : (
                <div className="space-y-3">
                  {topAreas.map((area, i) => (
                    <motion.div
                      key={area.id}
                      className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      custom={i}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-teal-500' : i === 2 ? 'bg-amber-500' : 'bg-gray-400'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{area.code} - {area.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {area.assignments} saksi &middot; {area.checkIns} check-in
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs font-bold ${
                          area.rate >= 70 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : area.rate >= 40 ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {area.rate}%
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ═══ REPORT CATEGORIES + REPORT BREAKDOWN ══════════════════════ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm h-full">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="text-base flex items-center gap-2">
                <FileBarChart className="h-4 w-4 text-rose-500" />
                Kategori Laporan
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {reportCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada laporan</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportCategories}
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={40}
                        paddingAngle={3}
                        dataKey="count"
                        nameKey="category"
                        stroke="none"
                      >
                        {reportCategories.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={reportColorArray[index]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, name: string) => [value.toLocaleString('id-ID'), categoryLabel(String(name))]}
                        contentStyle={{ borderRadius: '8px', fontSize: '12px', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        formatter={(value: string) => <span className="text-xs text-muted-foreground">{categoryLabel(value)}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-sm h-full">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Detail Laporan
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {reportCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada laporan</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                  {reportCategories
                    .sort((a, b) => b.count - a.count)
                    .map((rc, i) => {
                      const maxCount = Math.max(...reportCategories.map((r) => r.count), 1)
                      const color = reportCategoryColors[rc.category] || '#9ca3af'
                      return (
                        <motion.div
                          key={rc.category}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                          custom={i}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <div
                            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${color}15` }}
                          >
                            <BarChart3 className="h-4 w-4" style={{ color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium truncate">{categoryLabel(rc.category)}</p>
                              <span className="text-sm font-bold">{rc.count}</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ backgroundColor: color }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(rc.count / maxCount) * 100}%` }}
                                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ═══ SAKSI PERFORMANCE RANKINGS TABLE ═════════════════════════ */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" />
                    Peringkat Saksi
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">Performa saksi berdasarkan tingkat penyelesaian tugas</p>
                </div>
                <Badge variant="secondary" className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs">
                  {saksiRankings.length} saksi
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {saksiRankings.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Belum ada data saksi</p>
              ) : (
                <div className="overflow-x-auto custom-scrollbar">
                  <div className="min-w-[640px]">
                    {/* Table Header */}
                    <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted/50 rounded-t-lg text-xs font-semibold text-muted-foreground">
                      <div className="col-span-1 text-center">#</div>
                      <div className="col-span-3">Saksi</div>
                      <div className="col-span-1 text-center">TPS</div>
                      <div className="col-span-1 text-center">Check-in</div>
                      <div className="col-span-1 text-center">Suara</div>
                      <div className="col-span-1 text-center">Laporan</div>
                      <div className="col-span-2">Completion</div>
                      <div className="col-span-2">Terdaftar</div>
                    </div>

                    {/* Table Body */}
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {saksiRankings.map((saksi, i) => {
                        const rankColor = i === 0 ? 'text-emerald-600' : i === 1 ? 'text-teal-600' : i === 2 ? 'text-amber-600' : 'text-muted-foreground'
                        const rankBg = i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-teal-500' : i === 2 ? 'bg-amber-500' : 'bg-gray-400'
                        const completionColor = saksi.completionRate >= 70 ? 'text-emerald-700 dark:text-emerald-300' : saksi.completionRate >= 40 ? 'text-amber-700 dark:text-amber-300' : 'text-rose-700 dark:text-rose-300'
                        const barColor = saksi.completionRate >= 70 ? 'bg-emerald-500' : saksi.completionRate >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                        const rowBg = i % 2 === 1 ? 'bg-muted/20' : ''

                        return (
                          <motion.div
                            key={saksi.id}
                            className={`grid grid-cols-12 gap-2 px-3 py-2.5 items-center text-sm border-b border-border/30 hover:bg-muted/50 transition-colors ${rowBg}`}
                            custom={i}
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ x: 2 }}
                          >
                            {/* Rank */}
                            <div className="col-span-1 flex justify-center">
                              {i < 3 ? (
                                <div className={`w-6 h-6 rounded-full ${rankBg} text-white flex items-center justify-center text-xs font-bold shadow-sm`}>
                                  {i + 1}
                                </div>
                              ) : (
                                <span className={`text-xs font-bold ${rankColor}`}>{i + 1}</span>
                              )}
                            </div>

                            {/* Saksi Info */}
                            <div className="col-span-3 flex items-center gap-2 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 shadow-sm">
                                {saksi.name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{saksi.name}</p>
                                <p className="text-[10px] text-muted-foreground truncate">{saksi.email}</p>
                              </div>
                            </div>

                            {/* Assignments */}
                            <div className="col-span-1 text-center">
                              <span className="text-sm font-semibold">{saksi.assignments}</span>
                            </div>

                            {/* Check-ins */}
                            <div className="col-span-1 text-center">
                              <span className="text-sm font-semibold">{saksi.checkIns}</span>
                            </div>

                            {/* Vote Inputs */}
                            <div className="col-span-1 text-center">
                              <span className="text-sm font-semibold">{saksi.voteInputs}</span>
                            </div>

                            {/* Reports */}
                            <div className="col-span-1 text-center">
                              <span className="text-sm font-semibold">{saksi.reports}</span>
                            </div>

                            {/* Completion Rate */}
                            <div className="col-span-2">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <motion.div
                                    className={`h-full rounded-full ${barColor}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${saksi.completionRate}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 + i * 0.03 }}
                                  />
                                </div>
                                <span className={`text-xs font-bold ${completionColor} w-9 text-right`}>
                                  {saksi.completionRate}%
                                </span>
                              </div>
                            </div>

                            {/* Registration Date */}
                            <div className="col-span-2">
                              <span className="text-xs text-muted-foreground">
                                {new Date(saksi.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
