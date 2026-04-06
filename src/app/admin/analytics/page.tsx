'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import {
  Users, ClipboardCheck, Vote, Wallet, BarChart3,
  TrendingUp, MapPin, FileBarChart, AlertTriangle,
  RefreshCw, ChevronRight,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { motion } from 'framer-motion'
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

// ═══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function AnalyticsPage() {
  const { user } = useAuthStore()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(30)
  const [refreshing, setRefreshing] = useState(false)
  const [fetchKey, setFetchKey] = useState(0)

  // Derive trigger: when days changes or fetchKey changes, re-fetch
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

  if (loading && !data) return <DashboardSkeleton variant="dashboard" />
  if (error && !data) return <ErrorState message={error} onRetry={handleRefresh} />
  if (!data) return null

  const { summary, registrationTrend, checkInTrend, voteDistribution, totalVotesAll,
    paymentStatus, paymentStatusColors, reportCategories, reportCategoryColors,
    tpsCoverage, topAreas } = data

  // Report colors array for pie chart
  const reportColorArray = reportCategories.map((r) =>
    reportCategoryColors[r.category] || '#9ca3af'
  )

  return (
    <div className="space-y-6">
      {/* ── Page Title Area ──────────────────────────────── */}
      <motion.div
        className="relative rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-transparent dark:from-slate-800 dark:via-emerald-950/20 dark:to-transparent border border-emerald-100/50 dark:border-emerald-800/50 px-6 py-5 overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100/30 dark:bg-emerald-900/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-teal-100/20 dark:bg-teal-900/20 rounded-full translate-y-1/2" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Analitik</h1>
            <p className="text-muted-foreground mt-0.5">Statistik dan visualisasi data pemilu</p>
          </div>
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
      </motion.div>

      {/* ── Date Range Selector ──────────────────────────── */}
      <motion.div
        className="flex items-center gap-2 flex-wrap"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <span className="text-sm text-muted-foreground mr-1">Periode:</span>
        {[7, 14, 30, 90].map((d) => (
          <Button
            key={d}
            variant={days === d ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDays(d)}
            className={days === d
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-200 dark:hover:border-emerald-700'
            }
          >
            {d} Hari
          </Button>
        ))}
      </motion.div>

      {/* ── Summary Cards ────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/70 dark:bg-slate-700/70 shadow-sm flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{summary.totalSaksi.toLocaleString('id-ID')}</p>
                <p className="text-xs text-muted-foreground">Total Saksi Terdaftar</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/70 dark:bg-slate-700/70 shadow-sm flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">{summary.avgCheckInRate}%</p>
                <p className="text-xs text-muted-foreground">Rata-rata Check-in Rate</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-l-4 border-l-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/70 dark:bg-slate-700/70 shadow-sm flex items-center justify-center">
                <Vote className="h-5 w-5 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-teal-900 dark:text-teal-100">{summary.totalVotes.toLocaleString('id-ID')}</p>
                <p className="text-xs text-muted-foreground">Total Suara Masuk</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-sm border-l-4 border-l-emerald-700 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/70 dark:bg-slate-700/70 shadow-sm flex items-center justify-center">
                <Wallet className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{formatCurrency(summary.totalDisbursed)}</p>
                <p className="text-xs text-muted-foreground">Total Pembayaran Cair</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── Registration Trend ───────────────────────────── */}
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

        {/* ── Check-in Performance ────────────────────────── */}
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

      {/* ── Vote Distribution + Payment Status ───────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* ── Vote Distribution (Donut) ─────────────────── */}
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
                          borderRadius: '8px',
                          fontSize: '12px',
                          border: '1px solid rgba(0,0,0,0.08)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ marginTop: '-8px' }}>
                  <p className="text-2xl font-bold text-foreground">{totalVotesAll.toLocaleString('id-ID')}</p>
                  <p className="text-[10px] text-muted-foreground">Total Suara</p>
                </div>
              </div>
              {/* Custom Legend */}
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

        {/* ── Payment Status Distribution ────────────────── */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm h-full">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="text-base flex items-center gap-2">
                <Wallet className="h-4 w-4 text-emerald-500" />
                Status Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {paymentStatus.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Belum ada data pembayaran</p>
                ) : (
                  paymentStatus.map((ps) => {
                    const maxCount = Math.max(...paymentStatus.map((p) => p.count), 1)
                    const color = paymentStatusColors[ps.status] || '#9ca3af'
                    return (
                      <motion.div
                        key={ps.status}
                        className="space-y-1"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                            <span className="text-sm text-muted-foreground">{statusLabel(ps.status)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{ps.count}</span>
                            {ps.total > 0 && (
                              <span className="text-[10px] text-muted-foreground">{formatCurrency(ps.total)}</span>
                            )}
                          </div>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(ps.count / maxCount) * 100}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                          />
                        </div>
                      </motion.div>
                    )
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── TPS Coverage + Top Areas ─────────────────────── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* ── TPS Coverage Heatmap Grid ──────────────────── */}
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
                  {/* Legend */}
                  <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      &ge;70%
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      40-69%
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      &lt;40%
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-gray-300" />
                      No data
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* ── Top Performing Areas ───────────────────────── */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm h-full">
            <CardHeader className="bg-muted/50 rounded-t-lg">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
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
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
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

      {/* ── Report Categories ────────────────────────────── */}
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
                        contentStyle={{
                          borderRadius: '8px',
                          fontSize: '12px',
                          border: '1px solid rgba(0,0,0,0.08)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        }}
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

        {/* ── Report Breakdown Table ─────────────────────── */}
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
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.05 }}
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
    </div>
  )
}
