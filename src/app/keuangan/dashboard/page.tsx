'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight, Wallet, CheckCircle2, Clock, Send,
  History, TrendingUp, ChevronRight, CircleDollarSign,
  Banknote, ArrowDownUp, AlertCircle, XCircle,
  RefreshCw,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion'

// ─── Animated Counter ────────────────────────────────────────────────
function AnimatedCounter({ value, duration = 1.2, prefix = '', suffix = '' }: { value: number; duration?: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionVal = useMotionValue(0)
  const rounded = useTransform(motionVal, Math.round)

  useEffect(() => {
    const controls = animate(motionVal, value, { duration, ease: 'easeOut' })
    return controls.stop
  }, [motionVal, value, duration])

  useEffect(() => {
    const unsubscribe = rounded.on('change', (latest) => {
      if (ref.current) ref.current.textContent = `${prefix}${latest.toLocaleString('id-ID')}${suffix}`
    })
    return unsubscribe
  }, [rounded, prefix, suffix])

  return <span ref={ref}>{prefix}0{suffix}</span>
}

// ─── Animated Currency Counter ───────────────────────────────────────
function AnimatedCurrency({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const motionVal = useMotionValue(0)

  useEffect(() => {
    const controls = animate(motionVal, value, { duration: 1.5, ease: 'easeOut' })
    return controls.stop
  }, [motionVal, value])

  useEffect(() => {
    const unsubscribe = motionVal.on('change', (latest) => {
      if (ref.current) ref.current.textContent = formatCurrency(Math.round(latest))
    })
    return unsubscribe
  }, [motionVal])

  return <span ref={ref}>{formatCurrency(0)}</span>
}

// ─── Animated Stat Card ──────────────────────────────────────────────
function AnimatedStatCard({
  icon,
  label,
  value,
  detail,
  borderColor,
  bgClass,
  index,
  iconColor,
}: {
  icon: React.ReactNode
  label: string
  value: number
  detail: string
  borderColor: string
  bgClass: string
  index: number
  iconColor?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="cursor-default"
    >
      <Card className={`shadow-sm border-l-4 ${borderColor} ${bgClass} transition-shadow hover:shadow-md`}>
        <CardContent className="p-4">
          <div className={`flex items-center gap-2 mb-2 ${iconColor || 'text-muted-foreground'}`}>{icon}</div>
          <p className="text-2xl font-bold leading-tight">
            <AnimatedCounter value={value} />
          </p>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-1 truncate">{detail}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Stacked Bar (Payment Status) ────────────────────────────────────
function PaymentStackedBar({ breakdown }: { breakdown: Record<string, { count: number; total: number }> }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  const colorMap: Record<string, { bg: string; label: string }> = {
    PENDING: { bg: 'bg-amber-400', label: 'Menunggu' },
    READY_FOR_PAYMENT: { bg: 'bg-teal-500', label: 'Siap Bayar' },
    APPROVED: { bg: 'bg-emerald-500', label: 'Disetujui' },
    DISBURSED: { bg: 'bg-emerald-700', label: 'Dicairkan' },
    FAILED: { bg: 'bg-rose-500', label: 'Gagal' },
    CANCELLED: { bg: 'bg-gray-400', label: 'Dibatalkan' },
  }

  const entries = Object.entries(breakdown)
  const totalAll = entries.reduce((sum, [, info]) => sum + info.count, 0) || 1
  const totalAmount = entries.reduce((sum, [, info]) => sum + info.total, 0)

  return (
    <div ref={ref}>
      {/* Total Amount */}
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">Total Nilai Pembayaran</p>
        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
          <AnimatedCurrency value={totalAmount} />
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{totalAll} transaksi</p>
      </div>

      {/* Stacked Bar */}
      <div className="h-6 bg-muted rounded-full overflow-hidden flex">
        {entries.map(([status, info], i) => {
          const pct = (info.count / totalAll) * 100
          if (pct === 0) return null
          return (
            <motion.div
              key={status}
              className={`${colorMap[status]?.bg || 'bg-gray-400'} relative group`}
              initial={{ width: 0 }}
              animate={inView ? { width: `${pct}%` } : { width: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.1 }}
              title={`${status.replace(/_/g, ' ')}: ${info.count} (${pct.toFixed(1)}%)`}
            >
              {pct > 8 && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-sm">
                  {info.count}
                </span>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 justify-center">
        {entries.map(([status, info]) => {
          const config = colorMap[status] || { bg: 'bg-gray-400', label: status }
          return (
            <div key={status} className="flex items-center gap-1.5 text-xs">
              <span className={`w-2.5 h-2.5 rounded-sm ${config.bg}`} />
              <span className="text-muted-foreground">{config.label}</span>
              <span className="font-semibold">{info.count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Fund Flow ───────────────────────────────────────────────────────
function FundFlow({
  readyCount,
  readyAmount,
  approvedCount,
  approvedAmount,
  disbursedCount,
  disbursedAmount,
}: {
  readyCount: number
  readyAmount: number
  approvedCount: number
  approvedAmount: number
  disbursedCount: number
  disbursedAmount: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const totalBudget = readyAmount + approvedAmount + disbursedAmount

  const steps = [
    { label: 'Siap Bayar', count: readyCount, amount: readyAmount, color: 'text-teal-600', bg: 'bg-teal-50 border-teal-200 dark:bg-teal-950/30 dark:border-teal-800', icon: <Clock className="h-5 w-5" />, ring: 'ring-teal-100 dark:ring-teal-800' },
    { label: 'Disetujui', count: approvedCount, amount: approvedAmount, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800', icon: <CheckCircle2 className="h-5 w-5" />, ring: 'ring-emerald-100 dark:ring-emerald-800' },
    { label: 'Dicairkan', count: disbursedCount, amount: disbursedAmount, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-100 border-emerald-300 dark:bg-emerald-900/40 dark:border-emerald-800', icon: <Banknote className="h-5 w-5" />, ring: 'ring-emerald-200 dark:ring-emerald-800' },
  ]

  return (
    <div ref={ref} className="space-y-4">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Total Alokasi Dana</p>
        <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
          <AnimatedCurrency value={totalBudget} />
        </p>
      </div>

      <div className="flex items-stretch gap-0">
        {steps.map((step, i) => (
          <div key={step.label} className="flex items-stretch flex-1">
            {/* Step Card */}
            <motion.div
              className={`flex-1 rounded-xl border ${step.bg} p-4 text-center`}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.15 }}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-white ring-2 dark:bg-slate-800 dark:ring-slate-600 ${step.ring} ${step.color} mb-2 shadow-sm`}>
                {step.icon}
              </div>
              <p className="text-xs text-muted-foreground mb-1">{step.label}</p>
              <p className={`text-lg font-bold ${step.color}`}>
                <AnimatedCounter value={step.count} />
              </p>
              <p className="text-xs text-muted-foreground">
                <AnimatedCurrency value={step.amount} />
              </p>
            </motion.div>

            {/* Arrow between steps */}
            {i < steps.length - 1 && (
              <motion.div
                className="flex items-center px-1 text-muted-foreground"
                initial={{ opacity: 0 }}
                animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.5 + i * 0.15 }}
              >
                <ChevronRight className="h-5 w-5 flex-shrink-0" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Disbursement Status Badge ───────────────────────────────────────
function DisbursementStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
    PENDING: { color: 'bg-amber-100 text-amber-700', icon: <Clock className="h-3 w-3" />, label: 'Menunggu' },
    READY_FOR_PAYMENT: { color: 'bg-teal-100 text-teal-700', icon: <Wallet className="h-3 w-3" />, label: 'Siap Bayar' },
    APPROVED: { color: 'bg-emerald-100 text-emerald-700 dark:text-emerald-400', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Disetujui' },
    DISBURSED: { color: 'bg-emerald-200 text-emerald-800', icon: <Banknote className="h-3 w-3" />, label: 'Dicairkan' },
    FAILED: { color: 'bg-rose-100 text-rose-700', icon: <AlertCircle className="h-3 w-3" />, label: 'Gagal' },
    CANCELLED: { color: 'bg-gray-100 text-gray-600', icon: <XCircle className="h-3 w-3" />, label: 'Dibatalkan' },
  }
  const c = configs[status] || { color: 'bg-gray-100 text-gray-600', icon: <AlertCircle className="h-3 w-3" />, label: status }
  return (
    <Badge variant="secondary" className={`${c.color} gap-1`}>
      {c.icon}
      {c.label}
    </Badge>
  )
}

// ─── Action Button ───────────────────────────────────────────────────
function ActionButton({ label, onClick, sublabel, icon, index }: { label: string; onClick: () => void; sublabel: string; icon: React.ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 + index * 0.07 }}
    >
      <Button variant="outline" className="h-auto py-4 flex-col gap-2 shadow-sm w-full hover:shadow-md transition-shadow" onClick={onClick}>
        {icon}
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{sublabel}</span>
      </Button>
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════
export default function KeuanganDashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const fetchData = useCallback(() => {
    fetch('/api/dashboard/keuangan')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((res) => {
        if (res.success) {
          setData(res.data)
          setLastRefresh(new Date())
        }
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

  const { summary, statusBreakdown, recentDisbursements } = data

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
        <div className="absolute bottom-0 left-1/3 w-24 h-24 bg-teal-100/20 dark:bg-teal-900/20 rounded-full translate-y-1/2" />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Dashboard Keuangan</h1>
            <p className="text-muted-foreground mt-0.5">Selamat datang, {user?.name}</p>
          </div>
          {lastRefresh && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3" />
              <span>Diperbarui {lastRefresh.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Summary Stats ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AnimatedStatCard
          icon={<Clock className="h-5 w-5" />}
          label="Menunggu Validasi"
          value={summary.pendingCount}
          detail="PENDING"
          borderColor="border-l-amber-500"
          bgClass="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
          index={0}
          iconColor="text-amber-500"
        />
        <AnimatedStatCard
          icon={<Wallet className="h-5 w-5" />}
          label="Siap Dibayar"
          value={summary.readyForPaymentCount}
          detail={formatCurrency(summary.readyForPaymentAmount)}
          borderColor="border-l-teal-500"
          bgClass="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30"
          index={1}
          iconColor="text-teal-500"
        />
        <AnimatedStatCard
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Disetujui"
          value={summary.approvedCount}
          detail="Menunggu pencairan"
          borderColor="border-l-emerald-500"
          bgClass="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30"
          index={2}
          iconColor="text-emerald-500"
        />
        <AnimatedStatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Dicairkan"
          value={summary.disbursedCount}
          detail={formatCurrency(summary.disbursedTotalAmount)}
          borderColor="border-l-emerald-600"
          bgClass="bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950/40 dark:to-emerald-950/30"
          index={3}
          iconColor="text-emerald-600"
        />
      </div>

      {/* ── Total Disbursed ────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/30 dark:bg-emerald-900/20 rounded-full -translate-y-1/2 translate-x-1/2" />
          <CardContent className="p-6 text-center relative">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 mb-2">
              <CircleDollarSign className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Total Dana Dicairkan</p>
            <p className="text-4xl font-bold text-emerald-700 dark:text-emerald-400">
              <AnimatedCurrency value={summary.disbursedTotalAmount} />
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-semibold text-emerald-600">{summary.disbursedCount}</span> transaksi berhasil
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Payment Status Visualization ───────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowDownUp className="h-5 w-5 text-teal-500" />
              Distribusi Status Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            {statusBreakdown && Object.keys(statusBreakdown).length > 0 ? (
              <PaymentStackedBar breakdown={statusBreakdown} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada data pembayaran</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Fund Flow ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Alur Dana
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <FundFlow
              readyCount={summary.readyForPaymentCount}
              readyAmount={summary.readyForPaymentAmount}
              approvedCount={summary.approvedCount}
              approvedAmount={0}
              disbursedCount={summary.disbursedCount}
              disbursedAmount={summary.disbursedTotalAmount}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Quick Actions ──────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ActionButton label="Approval" onClick={() => router.push('/keuangan/payments')} sublabel={`${summary.readyForPaymentCount} menunggu`} icon={<Wallet className="h-5 w-5" />} index={0} />
        <ActionButton label="Pencairan" onClick={() => router.push('/keuangan/disbursement')} sublabel={`${summary.approvedCount} siap cair`} icon={<Send className="h-5 w-5" />} index={1} />
        <ActionButton label="Riwayat" onClick={() => router.push('/keuangan/history')} sublabel={`${summary.disbursedCount} transaksi`} icon={<History className="h-5 w-5" />} index={2} />
      </div>

      {/* ── Recent Disbursements ───────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Banknote className="h-5 w-5 text-emerald-500" />
                Pencairan Terbaru
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push('/keuangan/history')}>
                Lihat Semua <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {recentDisbursements?.length > 0 ? (
                <div className="divide-y">
                  {recentDisbursements.map((d: any, i: number) => (
                    <motion.div
                      key={d.id}
                      className={`flex items-center justify-between py-3 px-2 rounded-lg transition-colors ${
                        i % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'
                      } hover:bg-muted/50`}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.75 + i * 0.04 }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            {(d.user?.name || '?').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{d.user?.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{d.user?.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        <div className="text-right">
                          <p className="font-semibold text-sm text-emerald-600">{formatCurrency(d.amount)}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {d.disbursedAt ? new Date(d.disbursedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:text-emerald-400 text-[10px] whitespace-nowrap">
                          <Banknote className="h-3 w-3 mr-1" />
                          Cair
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-4">
                  <EmptyState icon={Wallet} title="Belum Ada Pencairan" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
