'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  MapPin, ClipboardCheck, Camera, FileText, Wallet,
  Clock, ArrowRight, CheckCircle2, XCircle, AlertTriangle,
  User, Phone, CreditCard, Landmark, Map,
  Upload, ChevronRight, RefreshCw, Vote
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import QuickActions from '@/components/common/QuickActions'
import { motion, AnimatePresence } from 'framer-motion'

type DashboardData = {
  profile: any
  assignment: any
  checkInStatus: {
    morning: { completed: boolean; gpsVerified?: boolean; distance?: number; timestamp?: string } | null
    final: { completed: boolean; gpsVerified?: boolean; distance?: number; timestamp?: string } | null
  }
  voteInputStatus: { submitted: boolean; c1Uploaded?: boolean; totalVotes?: number; submittedAt?: string } | null
  payment: any
  recentReports: any[]
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'Selamat Pagi'
  if (hour < 15) return 'Selamat Siang'
  if (hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

function getGreetingIcon(): string {
  const hour = new Date().getHours()
  if (hour < 11) return '🌅'
  if (hour < 15) return '☀️'
  if (hour < 18) return '🌆'
  return '🌙'
}

export default function SaksiDashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    let cancelled = false
    const fetchData = () => {
      setRefreshing(true)
      fetch('/api/dashboard/saksi')
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((res) => {
          if (!cancelled) {
            if (res.success) setData(res.data)
            else setError(res.error)
          }
        })
        .catch((err) => {
          if (!cancelled) setError(err.statusText || 'Gagal memuat data')
        })
        .finally(() => {
          if (!cancelled) {
            setLoading(false)
            setRefreshing(false)
            setLastRefresh(new Date())
          }
        })
    }
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  // Profile completion calculation
  const profileCompletion = useMemo(() => {
    if (!data?.profile) return { percentage: 0, missing: ['Profil belum dibuat'] }
    const checks = [
      { key: 'Nama', filled: !!data.profile.name },
      { key: 'No. HP', filled: !!data.profile.phone },
      { key: 'No. KTP', filled: !!data.profile.ktpNumber },
      { key: 'Info Bank', filled: !!data.profile.bankName && !!data.profile.bankAccount },
    ]
    const filled = checks.filter((c) => c.filled).length
    const missing = checks.filter((c) => !c.filled).map((c) => c.key)
    return { percentage: Math.round((filled / checks.length) * 100), missing }
  }, [data?.profile])

  // Task steps
  const taskSteps = useMemo(() => {
    if (!data) return []
    const morningDone = !!data.checkInStatus?.morning?.completed
    const voteSubmitted = !!data.voteInputStatus?.submitted
    const c1Uploaded = !!data.voteInputStatus?.c1Uploaded
    const finalDone = !!data.checkInStatus?.final?.completed
    const reportDone = (data.recentReports?.length ?? 0) > 0

    const steps = [
      {
        id: 'checkin-pagi',
        label: 'Check-in Pagi',
        icon: ClipboardCheck,
        status: morningDone ? 'completed' : 'next',
        route: '/saksi/check-in',
        detail: morningDone && data.checkInStatus.morning?.timestamp
          ? new Date(data.checkInStatus.morning.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : undefined,
      },
      {
        id: 'input-suara',
        label: 'Input Suara',
        icon: FileText,
        status: voteSubmitted ? 'completed' : morningDone ? 'next' : 'pending',
        route: '/saksi/input',
        detail: voteSubmitted && data.voteInputStatus?.totalVotes
          ? `${data.voteInputStatus.totalVotes} suara`
          : undefined,
      },
      {
        id: 'upload-c1',
        label: 'Upload Foto C1',
        icon: Camera,
        status: c1Uploaded ? 'completed' : voteSubmitted ? 'next' : 'pending',
        route: '/saksi/input',
        detail: c1Uploaded ? 'Diupload' : undefined,
      },
      {
        id: 'checkin-akhir',
        label: 'Check-in Akhir',
        icon: ClipboardCheck,
        status: finalDone ? 'completed' : c1Uploaded ? 'next' : 'pending',
        route: '/saksi/final-check-in',
        detail: finalDone && data.checkInStatus.final?.timestamp
          ? new Date(data.checkInStatus.final.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : undefined,
      },
      {
        id: 'laporan',
        label: 'Laporan',
        icon: AlertTriangle,
        status: reportDone ? 'completed' : finalDone ? 'next' : 'pending',
        route: '/saksi/lapor',
        optional: true,
        detail: reportDone ? `${data.recentReports.length} laporan` : undefined,
      },
    ]
    return steps
  }, [data])

  // Payment steps
  const paymentSteps = useMemo(() => {
    if (!data?.payment) return []
    const statusOrder = ['PENDING', 'VALIDATED', 'READY_FOR_PAYMENT', 'DISBURSED']
    const currentIndex = statusOrder.indexOf(data.payment.status)
    const labels = ['Pending', 'Validasi', 'Siap Bayar', 'Dicairkan']
    return labels.map((label, i) => ({
      label,
      status: i < currentIndex ? 'completed' : i === currentIndex ? 'active' : 'pending',
    }))
  }, [data])

  if (loading) return <DashboardSkeleton variant="dashboard" />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />
  if (!data) return null

  const hasAssignment = !!data.assignment

  // Profile completion color
  const completionColor = profileCompletion.percentage === 100
    ? 'emerald'
    : profileCompletion.percentage >= 50
      ? 'amber'
      : 'rose'

  return (
    <div className="space-y-6">
      {/* Header with greeting */}
      <motion.div
        className="flex items-center justify-between"
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
      >
        <div>
          <h1 className="text-2xl font-bold">
            {getGreetingIcon()} {getGreeting()}
          </h1>
          <p className="text-muted-foreground">
            Selamat datang, {data.profile?.name || user?.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            {lastRefresh.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => router.push('/saksi/profile')}>
            Profil
          </Button>
        </div>
      </motion.div>

      {/* Profile Completion */}
      <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
        <Card className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${completionColor === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-900/40' : completionColor === 'amber' ? 'bg-amber-100 dark:bg-amber-900/40' : 'bg-rose-100 dark:bg-rose-900/40'}`}>
                  <User className={`h-4 w-4 ${completionColor === 'emerald' ? 'text-emerald-600' : completionColor === 'amber' ? 'text-amber-600' : 'text-rose-600'}`} />
                </div>
                <span className="font-medium text-sm">Kelengkapan Profil</span>
              </div>
              <span className={`text-sm font-bold ${completionColor === 'emerald' ? 'text-emerald-600' : completionColor === 'amber' ? 'text-amber-600' : 'text-rose-600'}`}>
                {profileCompletion.percentage}%
              </span>
            </div>
            <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full ${
                  completionColor === 'emerald'
                    ? 'bg-emerald-500'
                    : completionColor === 'amber'
                      ? 'bg-amber-500'
                      : 'bg-rose-50 dark:bg-rose-950/500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletion.percentage}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              />
            </div>
            {profileCompletion.missing.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profileCompletion.missing.map((item) => (
                  <Badge
                    key={item}
                    variant="outline"
                    className={`text-xs ${
                      completionColor === 'emerald'
                        ? 'border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400'
                        : completionColor === 'amber'
                          ? 'border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-400'
                          : 'border-rose-200 text-rose-600 dark:border-rose-800 dark:text-rose-400'
                    }`}
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
        <QuickActions
          actions={[
            { label: 'Check-in', icon: <ClipboardCheck className="h-5 w-5" />, href: '/saksi/check-in', variant: 'emerald' },
            { label: 'Input Suara', icon: <Vote className="h-5 w-5" />, href: '/saksi/input', variant: 'emerald' },
            { label: 'Lapor', icon: <AlertTriangle className="h-5 w-5" />, href: '/saksi/lapor', variant: 'rose' },
            { label: 'Pembayaran', icon: <Wallet className="h-5 w-5" />, href: '/saksi/payment', variant: 'amber' },
            { label: 'Profil', icon: <User className="h-5 w-5" />, href: '/saksi/profile', variant: 'default' },
          ]}
        />
      </motion.div>

      {/* Enhanced Assignment Card */}
      <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible">
        <Card
          className={`overflow-hidden ${
            hasAssignment
              ? 'border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/20 dark:to-teal-950/20'
              : 'border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/20 dark:to-orange-950/20'
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Status Penugasan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasAssignment ? (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  {/* Mini map preview placeholder */}
                  <div className="shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                    <div className="relative">
                      <Map className="h-8 w-8 text-emerald-600" />
                      <MapPin className="h-4 w-4 text-rose-500 absolute -bottom-1 -right-1 fill-rose-500" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700">
                        Aktif
                      </Badge>
                      <Badge variant="outline" className="text-rose-600 border-rose-200 dark:text-rose-400 dark:border-rose-800 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/50 dark:bg-rose-950/50">
                        🗳️ Hari H Pemilu
                      </Badge>
                    </div>
                    <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                      {data.assignment.tps.code}
                    </h3>
                    <p className="text-sm text-emerald-700 font-medium">
                      {data.assignment.tps.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {data.assignment.tps.address}
                    </p>
                    {data.assignment.tps.kelurahan && (
                      <p className="text-xs text-muted-foreground">
                        Kel. {data.assignment.tps.kelurahan}, Kec. {data.assignment.tps.kecamatan}
                        {data.assignment.tps.kota ? `, ${data.assignment.tps.kota}` : ''}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={() => router.push('/saksi/tps')}
                >
                  Lihat Detail TPS <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-amber-600">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                  <Clock className="h-5 w-5" />
                </div>
                <span>Belum ditugaskan ke TPS. Menunggu plotting dari admin.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Task Progress Tracker */}
      {hasAssignment && (
        <motion.div custom={4} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="pb-3 bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5" />
                Progress Tugas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="flex flex-col gap-0">
                {taskSteps.map((step, index) => (
                  <div key={step.id}>
                    <div
                      className={`flex items-center gap-3 py-3 cursor-pointer group transition-colors rounded-lg px-3 -mx-3 ${
                        step.status === 'next'
                          ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 dark:bg-emerald-900/40'
                          : step.status === 'completed'
                            ? 'hover:bg-muted/50'
                            : 'opacity-60'
                      }`}
                      onClick={() => step.status !== 'completed' && router.push(step.route)}
                    >
                      {/* Step circle */}
                      <div className="relative shrink-0">
                        <motion.div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step.status === 'completed'
                              ? 'bg-emerald-500 text-white'
                              : step.status === 'next'
                                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 ring-4 ring-emerald-100'
                                : 'bg-muted text-muted-foreground'
                          }`}
                          animate={
                            step.status === 'next'
                              ? { boxShadow: ['0 0 0 0 rgba(16,185,129,0.4)', '0 0 0 8px rgba(16,185,129,0)'] }
                              : {}
                          }
                          transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
                        >
                          {step.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <step.icon className="h-5 w-5" />
                          )}
                        </motion.div>
                        {step.optional && step.status === 'pending' && (
                          <Badge className="absolute -top-1 -right-1 text-[10px] px-1 py-0 bg-muted text-muted-foreground">
                            Opsional
                          </Badge>
                        )}
                      </div>

                      {/* Label & detail */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium text-sm ${step.status === 'completed' ? 'text-emerald-700' : ''}`}>
                            {step.label}
                          </span>
                          {step.status === 'completed' && (
                            <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 text-[10px] px-1.5 py-0">
                              Selesai
                            </Badge>
                          )}
                          {step.status === 'next' && (
                            <Badge className="bg-emerald-500 text-white text-[10px] px-1.5 py-0">
                              Selanjutnya
                            </Badge>
                          )}
                        </div>
                        {step.detail && (
                          <p className="text-xs text-muted-foreground mt-0.5">{step.detail}</p>
                        )}
                      </div>

                      {/* Arrow for next step */}
                      {step.status === 'next' && (
                        <ChevronRight className="h-4 w-4 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>

                    {/* Connection line */}
                    {index < taskSteps.length - 1 && (
                      <div className="ml-[26px] h-5 flex items-start">
                        <motion.div
                          className={`w-0.5 flex-1 ${
                            step.status === 'completed' ? 'bg-emerald-500' : 'bg-muted'
                          }`}
                          initial={{ height: 0 }}
                          animate={{ height: '100%' }}
                          transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Enhanced Payment Card */}
      {hasAssignment && (
        <motion.div custom={5} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="overflow-hidden shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Status Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.payment ? (
                <div className="space-y-5">
                  {/* Amount with gradient */}
                  <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 p-5 text-white">
                    <p className="text-sm text-emerald-100 mb-1">Jumlah Honor</p>
                    <p className="text-2xl font-bold tracking-tight">{formatCurrency(data.payment.amount)}</p>
                    <div className="mt-2">
                      <PaymentStatusBadge status={data.payment.status} />
                    </div>
                  </div>

                  {/* Payment stepper */}
                  {paymentSteps.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Progres Pembayaran
                      </p>
                      <div className="flex items-center gap-0 w-full">
                        {paymentSteps.map((step, i) => (
                          <div key={step.label} className="flex items-center flex-1 last:flex-initial">
                            <div className="flex flex-col items-center gap-1">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                                  step.status === 'completed'
                                    ? 'bg-emerald-500 text-white'
                                    : step.status === 'active'
                                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 ring-4 ring-emerald-100'
                                      : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {step.status === 'completed' ? (
                                  <CheckCircle2 className="h-4 w-4" />
                                ) : (
                                  i + 1
                                )}
                              </div>
                              <span
                                className={`text-[10px] text-center leading-tight max-w-[60px] ${
                                  step.status === 'active'
                                    ? 'text-emerald-700 font-semibold'
                                    : step.status === 'completed'
                                      ? 'text-emerald-600'
                                      : 'text-muted-foreground'
                                }`}
                              >
                                {step.label}
                              </span>
                            </div>
                            {i < paymentSteps.length - 1 && (
                              <div className="flex-1 h-0.5 mx-1">
                                <motion.div
                                  className={`h-full rounded-full ${
                                    step.status === 'completed' ? 'bg-emerald-500' : 'bg-muted'
                                  }`}
                                  initial={{ scaleX: 0 }}
                                  animate={{ scaleX: 1 }}
                                  transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
                                  style={{ transformOrigin: 'left' }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Validation Checklist */}
                  {data.payment.validationChecklist && (
                    <div className="pt-4 border-t">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Checklist Validasi ({data.payment.validationScore}/3)
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <CheckItem
                          icon={<ClipboardCheck className="h-3.5 w-3.5" />}
                          label="Check-in Pagi"
                          done={data.payment.validationChecklist.morningCheckIn}
                        />
                        <CheckItem
                          icon={<ClipboardCheck className="h-3.5 w-3.5" />}
                          label="Check-in Akhir"
                          done={data.payment.validationChecklist.finalCheckIn}
                        />
                        <CheckItem
                          icon={<MapPin className="h-3.5 w-3.5" />}
                          label="GPS Terverifikasi"
                          done={data.payment.validationChecklist.gpsVerified}
                        />
                        <CheckItem
                          icon={<FileText className="h-3.5 w-3.5" />}
                          label="Data Suara Diinput"
                          done={data.payment.validationChecklist.voteDataInputted}
                        />
                        <CheckItem
                          icon={<Camera className="h-3.5 w-3.5" />}
                          label="Foto C1 Diupload"
                          done={data.payment.validationChecklist.c1Uploaded}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => router.push('/saksi/payment')}
                  >
                    Detail Pembayaran <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-muted-foreground py-2">
                  <div className="p-2 rounded-lg bg-muted">
                    <Clock className="h-5 w-5" />
                  </div>
                  <span>Belum ada data pembayaran. Lakukan check-in terlebih dahulu.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; dot: string }> = {
    PENDING: { color: 'bg-white/20 text-white', dot: 'bg-amber-300' },
    READY_FOR_PAYMENT: { color: 'bg-white/20 text-white', dot: 'bg-emerald-300' },
    APPROVED: { color: 'bg-white/20 text-white', dot: 'bg-teal-300' },
    DISBURSED: { color: 'bg-white/20 text-white', dot: 'bg-emerald-300' },
    CANCELLED: { color: 'bg-white/20 text-white', dot: 'bg-rose-300' },
    FAILED: { color: 'bg-white/20 text-white', dot: 'bg-rose-300' },
    VALIDATED: { color: 'bg-white/20 text-white', dot: 'bg-teal-300' },
  }
  const c = config[status] || { color: 'bg-white/20 text-white', dot: 'bg-gray-300' }
  const labels: Record<string, string> = {
    PENDING: 'Menunggu',
    READY_FOR_PAYMENT: 'Siap Bayar',
    APPROVED: 'Disetujui',
    DISBURSED: 'Dicairkan',
    CANCELLED: 'Dibatalkan',
    FAILED: 'Gagal',
    VALIDATED: 'Tervalidasi',
  }
  return (
    <Badge className={`${c.color} gap-1.5 text-xs border-0`}>
      <span className={`inline-flex h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {labels[status] || status.replace(/_/g, ' ')}
    </Badge>
  )
}

function CheckItem({ icon, label, done }: { icon: React.ReactNode; label: string; done: boolean }) {
  return (
    <div className={`flex items-center gap-2.5 text-sm py-2 px-3 rounded-lg ${done ? 'bg-emerald-50/50' : ''}`}>
      {done ? (
        <div className="h-6 w-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0 text-emerald-600">
          {icon}
        </div>
      ) : (
        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
          {icon}
        </div>
      )}
      <span className={done ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </div>
  )
}
