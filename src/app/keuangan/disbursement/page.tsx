'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { ArrowLeft, Send, Loader2, Wallet, Clock, Calculator, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
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

// ─── Stat Card ────────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  subValue,
  borderColor,
  bgColor,
  index,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  subValue?: string
  borderColor: string
  bgColor: string
  index: number
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      className="cursor-default"
    >
      <Card className={`shadow-sm border-l-4 ${borderColor} ${bgColor} transition-shadow hover:shadow-md`}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/70 shadow-sm flex items-center justify-center text-muted-foreground">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold leading-tight">{value}</p>
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            {subValue && <p className="text-xs font-medium text-amber-700 mt-0.5">{subValue}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function KeuanganDisbursementPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [disburseTarget, setDisburseTarget] = useState<any>(null)
  const [disbursing, setDisbursing] = useState(false)

  const fetchPayments = () => {
    setLoading(true)
    fetch(`/api/payments?status=APPROVED&page=${page}&limit=20`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((res) => {
        if (res.success) {
          setPayments(res.data.payments)
          setTotalPages(res.data.pagination.totalPages)
        } else {
          toast.error(res.error)
        }
      })
      .catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPayments()
  }, [page])

  const handleDisburse = async () => {
    if (!disburseTarget) return
    setDisbursing(true)
    try {
      const res = await fetch(`/api/payments/${disburseTarget.id}?action=disburse`, { method: 'PUT' })
      const data = await res.json()
      if (data.success) {
        toast.success(`Dana berhasil dicairkan untuk ${disburseTarget.user?.name}!`)
        setDisburseTarget(null)
        fetchPayments()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setDisbursing(false)
    }
  }

  // Computed stats
  const totalSiapCair = payments.length
  const totalDana = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
  const rataRata = totalSiapCair > 0 ? Math.round(totalDana / totalSiapCair) : 0

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
              <Send className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-amber-900">Pencairan Dana</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-11">Pembayaran yang sudah disetujui, siap dicairkan</p>
        </div>
      </motion.div>

      {/* ── Summary Stat Cards ─────────────────────────────── */}
      {!loading && payments.length > 0 && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
        >
          <StatCard
            icon={<Send className="h-5 w-5 text-emerald-600" />}
            label="Total Siap Cair"
            value={totalSiapCair}
            subValue={`${totalSiapCair} transaksi menunggu`}
            borderColor="border-l-emerald-500"
            bgColor="bg-gradient-to-br from-emerald-50 to-teal-50"
            index={0}
          />
          <StatCard
            icon={<Wallet className="h-5 w-5 text-amber-600" />}
            label="Total Dana"
            value={formatCurrency(totalDana)}
            borderColor="border-l-amber-500"
            bgColor="bg-gradient-to-br from-amber-50/50 to-white"
            index={1}
          />
          <StatCard
            icon={<Calculator className="h-5 w-5 text-teal-600" />}
            label="Rata-rata Per Transaksi"
            value={formatCurrency(rataRata)}
            borderColor="border-l-teal-500"
            bgColor="bg-gradient-to-br from-teal-50 to-cyan-50"
            index={2}
          />
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
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : payments.length === 0 ? (
              <EmptyState
                icon={Send}
                title="Tidak Ada Dana untuk Dicairkan"
                description="Semua pembayaran yang disetujui sudah dicairkan"
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Saksi</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>No. Rekening</TableHead>
                      <TableHead>Nama Penerima</TableHead>
                      <TableHead>Disetujui</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p, i) => (
                      <motion.tr
                        key={p.id}
                        className="hover:bg-muted/50 border-b border-l-4 border-l-amber-400 transition-colors"
                        variants={rowVariants}
                        initial="hidden"
                        animate="show"
                        transition={{ delay: 0.05 * i }}
                        whileHover={{ backgroundColor: 'rgba(241, 245, 249, 0.8)' }}
                      >
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
                        <TableCell className="text-sm">
                          {p.approvedAt ? new Date(p.approvedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              size="sm"
                              onClick={() => setDisburseTarget(p)}
                              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm shadow-emerald-200"
                            >
                              <Send className="h-4 w-4 mr-1" /> Cairkan
                            </Button>
                          </motion.div>
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

      {/* ── Pagination ─────────────────────────────────────── */}
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

      {/* ── Disburse Confirmation ──────────────────────────── */}
      <ConfirmDialog
        open={!!disburseTarget}
        onOpenChange={(open) => !open && setDisburseTarget(null)}
        title="Konfirmasi Pencairan Dana"
        description={`Apakah Anda yakin ingin mencairkan dana sebesar ${formatCurrency(disburseTarget?.amount || 0)} untuk ${disburseTarget?.user?.name}? Pastikan dana sudah ditransfer.`}
        confirmLabel="Ya, Cairkan"
        onConfirm={handleDisburse}
        loading={disbursing}
        variant="default"
      />
    </div>
  )
}
