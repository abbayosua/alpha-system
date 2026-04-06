'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Wallet, Download, History, Shield, FileText, Camera, Calendar, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

// ─── Animation Variants ──────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

// ─── User Avatar ──────────────────────────────────────────────────────────
function UserAvatar({ name }: { name: string }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?'
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-400 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
      {initial}
    </div>
  )
}

// ─── Enhanced Validation Badge ────────────────────────────────────────────
function ValidationBadge({ label, done, icon: Icon }: { label: string; done: boolean; icon: React.ElementType }) {
  return (
    <Badge
      variant="secondary"
      className={`gap-1.5 px-2 py-0.5 ${
        done
          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
          : 'bg-gray-100 text-gray-500 border border-gray-200'
      }`}
    >
      <Icon className={`h-3 w-3 ${done ? 'text-emerald-500' : 'text-gray-400'}`} />
      <motion.span
        className="inline-flex h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: done ? '#10b981' : '#9ca3af' }}
        animate={done ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      {label}
    </Badge>
  )
}

export default function KeuanganHistoryPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageRef = useRef(page)
  pageRef.current = page

  const loadPayments = useCallback(async () => {
    try {
      const res = await fetch(`/api/payments?status=DISBURSED&page=${pageRef.current}&limit=20`)
      const data = await res.json()
      if (data.success) {
        setPayments(data.data.payments)
        setTotalPages(data.data.pagination.totalPages)
      } else {
        setError(data.error)
      }
    } catch {
      setError('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPayments()
  }, [loadPayments, page])

  const totalAmount = payments.reduce((sum: number, p: any) => sum + p.amount, 0)

  // Date range info
  const dates = payments
    .map((p: any) => p.disbursedAt)
    .filter(Boolean)
    .sort()
  const earliestDate = dates[0]
  const latestDate = dates[dates.length - 1]

  const exportCSV = () => {
    const headers = ['Tanggal Cair', 'Saksi', 'Email', 'Jumlah', 'Metode', 'No. Rek', 'Nama Penerima', 'GPS', 'Data Suara', 'Foto C1']
    const rows = payments.map((p) => [
      p.disbursedAt ? new Date(p.disbursedAt).toLocaleString('id-ID') : '-',
      p.user?.name || '-',
      p.user?.email || '-',
      p.amount,
      p.paymentMethod || '-',
      p.accountNumber || '-',
      p.accountName || '-',
      p.gpsVerified ? 'Ya' : 'Tidak',
      p.dataInputted ? 'Ya' : 'Tidak',
      p.c1Uploaded ? 'Ya' : 'Tidak',
    ])
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `riwayat_pembayaran_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data berhasil diekspor ke CSV')
  }

  if (loading) return <DashboardSkeleton variant="table" />
  if (error) return <EmptyState icon={History} title={error} description="Coba muat ulang halaman" action={<Button onClick={() => window.location.reload()}>Coba Lagi</Button>} />

  return (
    <div className="space-y-6">
      {/* ── Page Title Area ────────────────────────────────── */}
      <motion.div
        className="relative rounded-xl bg-gradient-to-br from-amber-50 via-orange-50/60 to-transparent border border-amber-100/50 px-6 py-5 sm:p-8 overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-amber-100/60" />
        <div className="absolute bottom-0 left-1/3 w-20 h-20 rounded-full bg-orange-100/40" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/60 hover:bg-white/80 -ml-2"
              onClick={() => router.push('/keuangan/dashboard')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200">
              <History className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-amber-900">Riwayat Pembayaran</h1>
            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                disabled={payments.length === 0}
                className="bg-white/60 hover:bg-white/80 border-amber-200 text-amber-700"
              >
                <Download className="h-4 w-4 mr-2" /> Export CSV
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground ml-11">Pembayaran yang sudah dicairkan</p>
        </div>
      </motion.div>

      {/* ── Enhanced Summary Card ──────────────────────────── */}
      {!loading && payments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white overflow-hidden relative">
            {/* Decorative background circle */}
            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-emerald-100/40" />
            <CardContent className="p-5 relative">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wallet className="h-4 w-4 text-emerald-500" />
                    <span>Total Dicairkan (Halaman Ini)</span>
                  </div>
                  <motion.p
                    className="text-3xl font-bold text-emerald-700"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {formatCurrency(totalAmount)}
                  </motion.p>
                  {earliestDate && latestDate && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(earliestDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' — '}
                        {new Date(latestDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-sm gap-1.5 rounded-full px-3">
                    <motion.span
                      className="inline-flex h-2 w-2 rounded-full bg-emerald-500"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    {payments.length} transaksi
                  </Badge>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs gap-1 rounded-full px-2.5">
                    <TrendingUp className="h-3 w-3" />
                    Halaman {page}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Table ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="Belum Ada Riwayat Pencairan"
                description="Riwayat pencairan dana akan muncul di sini"
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Tanggal Cair</TableHead>
                      <TableHead>Saksi</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>No. Rek</TableHead>
                      <TableHead>Nama Penerima</TableHead>
                      <TableHead>Validasi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p, i) => (
                      <motion.tr
                        key={p.id}
                        className={`hover:bg-muted/50 border-b border-l-4 border-l-amber-300 transition-colors ${i % 2 === 1 ? 'bg-muted/30' : ''}`}
                        variants={rowVariants}
                        initial="hidden"
                        animate="show"
                        transition={{ delay: 0.05 * i }}
                        whileHover={{ backgroundColor: 'rgba(241, 245, 249, 0.8)' }}
                      >
                        <TableCell className="text-sm">
                          {p.disbursedAt ? (
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              {new Date(p.disbursedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <UserAvatar name={p.user?.name || '?'} />
                            <div>
                              <p className="font-medium">{p.user?.name}</p>
                              <p className="text-xs text-muted-foreground">{p.user?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-lg font-semibold text-emerald-600">
                            {formatCurrency(p.amount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">{p.paymentMethod || '-'}</TableCell>
                        <TableCell className="text-sm font-mono">{p.accountNumber || '-'}</TableCell>
                        <TableCell className="text-sm">{p.accountName || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            <ValidationBadge label="GPS" done={p.gpsVerified} icon={Shield} />
                            <ValidationBadge label="Data" done={p.dataInputted} icon={FileText} />
                            <ValidationBadge label="C1" done={p.c1Uploaded} icon={Camera} />
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Enhanced Pagination ────────────────────────────── */}
      {totalPages > 1 && (
        <motion.div
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Sebelumnya
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? 'default' : 'outline'}
                size="sm"
                className={p === page ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm' : 'w-9'}
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Selanjutnya
          </Button>
        </motion.div>
      )}
    </div>
  )
}
