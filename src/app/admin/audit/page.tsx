'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Shield, ScrollText, ClipboardCheck, PenLine, Users, MapPin, Vote, Image } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'

// ─── Animation Variants ───────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
}

const tabContentVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

// ─── Stat Card ────────────────────────────────────────────────────────
function AuditStatCard({
  icon,
  label,
  value,
  borderColor,
  bgColor,
  iconBg,
}: {
  icon: React.ReactNode
  label: string
  value: number
  borderColor: string
  bgColor: string
  iconBg: string
}) {
  return (
    <motion.div variants={itemVariants} className="cursor-default">
      <Card
        className={`shadow-sm border-l-4 ${borderColor} ${bgColor} transition-shadow hover:shadow-md`}
      >
        <CardContent className="p-4 flex items-center gap-3">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold leading-tight">{value}</p>
            <p className="text-xs text-muted-foreground truncate">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── User Avatar ──────────────────────────────────────────────────────
function UserAvatar({ name }: { name: string }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?'
  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
      {initial}
    </div>
  )
}

// ─── Check-in Empty State ─────────────────────────────────────────────
function CheckinEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="py-16 px-6 text-center"
    >
      <div className="relative mx-auto w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-200/50 to-teal-200/50 animate-pulse" />
        <div className="relative inset-0 flex items-center justify-center">
          <ClipboardCheck className="h-10 w-10 text-emerald-600" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400/60" />
        <div className="absolute -bottom-2 left-1 w-2 h-2 rounded-full bg-teal-400/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        Belum Ada Data Check-in
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
        Data check-in dari saksi akan muncul di sini setelah mereka melakukan check-in di TPS.
      </p>
    </motion.div>
  )
}

// ─── Votes Empty State ────────────────────────────────────────────────
function VotesEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="py-16 px-6 text-center"
    >
      <div className="relative mx-auto w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-100 to-orange-100" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-200/50 to-orange-200/50 animate-pulse" />
        <div className="relative inset-0 flex items-center justify-center">
          <PenLine className="h-10 w-10 text-amber-600" />
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-teal-400/60" />
        <div className="absolute -bottom-2 left-1 w-2 h-2 rounded-full bg-emerald-400/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        Belum Ada Data Input Suara
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
        Data suara dari saksi akan muncul di sini setelah mereka menginput hasil penghitungan suara.
      </p>
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════
export default function AdminAuditPage() {
  const router = useRouter()
  const [checkIns, setCheckIns] = useState<any[]>([])
  const [votes, setVotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'checkins' | 'votes'>('checkins')

  useEffect(() => {
    Promise.all([
      fetch('/api/check-ins?limit=50').then((r) =>
        r.ok ? r.json() : Promise.reject(r),
      ),
      fetch('/api/votes?limit=50').then((r) =>
        r.ok ? r.json() : Promise.reject(r),
      ),
    ])
      .then(([ciRes, vRes]) => {
        if (ciRes.success) setCheckIns(ciRes.data.checkIns)
        if (vRes.success) setVotes(vRes.data.votes)
      })
      .catch(() => {
        setError('Gagal memuat data audit')
        toast.error('Gagal memuat data audit')
      })
      .finally(() => setLoading(false))
  }, [])

  // ── Derived Stats ────────────────────────────────────────
  const stats = useMemo(() => {
    const totalCheckins = checkIns.length
    const gpsValid = checkIns.filter((c) => c.gpsVerified).length
    const pagi = checkIns.filter((c) => c.type === 'MORNING').length
    const akhir = checkIns.filter((c) => c.type === 'FINAL').length
    return { totalCheckins, gpsValid, pagi, akhir }
  }, [checkIns])

  if (loading) return <DashboardSkeleton variant="table" />
  if (error)
    return (
      <EmptyState
        icon={ScrollText}
        title={error}
        description="Coba muat ulang halaman"
        action={
          <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
        }
      />
    )

  return (
    <div className="space-y-6">
      {/* ── Page Title Area ────────────────────────────────── */}
      <motion.div
        className="relative rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-transparent border border-emerald-100/50 px-6 py-5 overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100/30 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-teal-100/20 rounded-full translate-y-1/2" />
        <div className="relative flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 flex-shrink-0"
            onClick={() => router.push('/admin/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">Audit Log</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Log aktivitas check-in dan input suara
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Summary Cards ──────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <AuditStatCard
          icon={<ClipboardCheck className="h-5 w-5 text-emerald-600" />}
          label="Total Check-in"
          value={stats.totalCheckins}
          borderColor="border-l-emerald-500"
          bgColor="bg-gradient-to-br from-emerald-50/50 to-white"
          iconBg="bg-emerald-100"
        />
        <AuditStatCard
          icon={<MapPin className="h-5 w-5 text-teal-600" />}
          label="GPS Valid"
          value={stats.gpsValid}
          borderColor="border-l-teal-500"
          bgColor="bg-gradient-to-br from-teal-50/50 to-white"
          iconBg="bg-teal-100"
        />
        <AuditStatCard
          icon={<Shield className="h-5 w-5 text-amber-600" />}
          label="Check-in Pagi"
          value={stats.pagi}
          borderColor="border-l-amber-500"
          bgColor="bg-gradient-to-br from-amber-50/50 to-white"
          iconBg="bg-amber-100"
        />
        <AuditStatCard
          icon={<Shield className="h-5 w-5 text-rose-600" />}
          label="Check-in Akhir"
          value={stats.akhir}
          borderColor="border-l-rose-500"
          bgColor="bg-gradient-to-br from-rose-50/50 to-white"
          iconBg="bg-rose-100"
        />
      </motion.div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <motion.div
        className="flex gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Button
          variant={activeTab === 'checkins' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('checkins')}
          className="gap-2"
        >
          <ClipboardCheck className="h-4 w-4" />
          Check-ins
          <Badge
            variant="secondary"
            className="rounded-full px-2 bg-background/20 text-foreground"
          >
            {checkIns.length}
          </Badge>
        </Button>
        <Button
          variant={activeTab === 'votes' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('votes')}
          className="gap-2"
        >
          <PenLine className="h-4 w-4" />
          Input Suara
          <Badge
            variant="secondary"
            className="rounded-full px-2 bg-background/20 text-foreground"
          >
            {votes.length}
          </Badge>
        </Button>
      </motion.div>

      {/* ── Tab Content (Animated) ─────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === 'checkins' ? (
          <motion.div
            key="checkins-tab"
            variants={tabContentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="shadow-sm">
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Log Check-in
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Saksi</TableHead>
                        <TableHead>TPS</TableHead>
                        <TableHead>GPS</TableHead>
                        <TableHead>Jarak</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {checkIns.length > 0 ? (
                        checkIns.map((c, i) => {
                          const isMorning = c.type === 'MORNING'
                          return (
                            <motion.tr
                              key={c.id}
                              className={`hover:bg-muted/50 border-b transition-colors border-l-4 ${
                                isMorning
                                  ? 'border-l-emerald-400'
                                  : 'border-l-amber-400'
                              }`}
                              variants={rowVariants}
                              initial="hidden"
                              animate="visible"
                              transition={{ delay: i * 0.04 }}
                              whileHover={{
                                backgroundColor: 'rgba(241, 245, 249, 0.8)',
                              }}
                            >
                              <TableCell className="text-sm">
                                {new Date(c.timestamp).toLocaleString('id-ID')}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={
                                    isMorning
                                      ? 'bg-emerald-100 text-emerald-700 gap-1.5'
                                      : 'bg-amber-100 text-amber-700 gap-1.5'
                                  }
                                >
                                  <span
                                    className={`inline-flex h-1.5 w-1.5 rounded-full ${
                                      isMorning
                                        ? 'bg-emerald-500'
                                        : 'bg-amber-500'
                                    }`}
                                  />
                                  {isMorning ? 'Pagi' : 'Akhir'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2.5">
                                  <UserAvatar name={c.user?.name} />
                                  <div className="min-w-0">
                                    <p className="font-medium text-sm truncate">
                                      {c.user?.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {c.user?.email}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                {c.tps?.code} - {c.tps?.name}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={
                                    c.gpsVerified
                                      ? 'bg-emerald-100 text-emerald-700 gap-1.5'
                                      : 'bg-rose-100 text-rose-700 gap-1.5'
                                  }
                                >
                                  <span
                                    className={`inline-flex h-1.5 w-1.5 rounded-full ${
                                      c.gpsVerified
                                        ? 'bg-emerald-500'
                                        : 'bg-rose-500'
                                    }`}
                                  />
                                  {c.gpsVerified ? 'Valid' : 'Invalid'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {c.distance
                                  ? `${Math.round(c.distance)}m`
                                  : '-'}
                              </TableCell>
                            </motion.tr>
                          )
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <CheckinEmptyState />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="votes-tab"
            variants={tabContentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="shadow-sm">
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PenLine className="h-5 w-5" />
                  Log Input Suara
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Tanggal</TableHead>
                        <TableHead>Saksi</TableHead>
                        <TableHead>TPS</TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                            Kandidat 1
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
                            Kandidat 2
                          </div>
                        </TableHead>
                        <TableHead>
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block w-2 h-2 rounded-full bg-teal-500" />
                            Kandidat 3
                          </div>
                        </TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>C1</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {votes.length > 0 ? (
                        votes.map((v, i) => (
                          <motion.tr
                            key={v.id}
                            className="hover:bg-muted/50 border-b transition-colors border-l-4 border-l-teal-400"
                            variants={rowVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: i * 0.04 }}
                            whileHover={{
                              backgroundColor: 'rgba(241, 245, 249, 0.8)',
                            }}
                          >
                            <TableCell className="text-sm">
                              {new Date(v.submittedAt).toLocaleString('id-ID')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2.5">
                                <UserAvatar name={v.user?.name} />
                                <p className="font-medium text-sm">
                                  {v.user?.name}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">
                              {v.tps?.code} - {v.tps?.name}
                            </TableCell>
                            <TableCell className="text-sm text-center">
                              <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium">
                                {v.candidate1Votes}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-center">
                              <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium">
                                {v.candidate2Votes}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-center">
                              <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 font-medium">
                                {v.candidate3Votes}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm font-semibold text-center">
                              <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold">
                                {v.totalVotes}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={
                                  v.c1Photo
                                    ? 'bg-emerald-100 text-emerald-700 gap-1.5'
                                    : 'bg-gray-100 text-gray-600 gap-1.5'
                                }
                              >
                                <span
                                  className={`inline-flex h-1.5 w-1.5 rounded-full ${
                                    v.c1Photo
                                      ? 'bg-emerald-500'
                                      : 'bg-gray-400'
                                  }`}
                                />
                                {v.c1Photo ? 'Ada' : 'Tidak'}
                              </Badge>
                            </TableCell>
                          </motion.tr>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8}>
                            <VotesEmptyState />
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
