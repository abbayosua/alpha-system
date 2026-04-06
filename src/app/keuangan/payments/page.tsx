'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, Loader2, Wallet, Eye, Receipt, MapPin, ShieldCheck, Upload, Clock, FileCheck } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { motion } from 'framer-motion'

// ─── User Avatar with Initials ─────────────────────────────────────────
function UserAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?'
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-xl',
  }

  return (
    <div className="relative inline-flex flex-shrink-0">
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center text-white font-bold shadow-sm`}
      >
        {initial}
      </div>
    </div>
  )
}

// ─── Payment Summary Stat Card ─────────────────────────────────────────
function PaymentStatCard({
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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
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

// ─── Validation Checklist Item ─────────────────────────────────────────
function ValidationChecklistItem({
  icon,
  label,
  done,
}: {
  icon: React.ReactNode
  label: string
  done: boolean
}) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
      done ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
    }`}>
      <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
        done ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500'
      }`}>
        {done ? <CheckCircle2 className="h-5 w-5" /> : icon}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${done ? 'text-emerald-800' : 'text-rose-700'}`}>{label}</p>
        <p className={`text-xs ${done ? 'text-emerald-600' : 'text-rose-500'}`}>
          {done ? 'Terverifikasi' : 'Belum lengkap'}
        </p>
      </div>
      <Badge variant="secondary" className={`${done ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'} gap-1.5`}>
        <span className={`inline-flex h-1.5 w-1.5 rounded-full ${done ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        {done ? '✓' : '✗'}
      </Badge>
    </div>
  )
}

export default function KeuanganPaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [detailPayment, setDetailPayment] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [approving, setApproving] = useState(false)
  const [rejectTarget, setRejectTarget] = useState<any>(null)
  const [rejecting, setRejecting] = useState(false)
  const [approveForm, setApproveForm] = useState({
    paymentMethod: '',
    accountNumber: '',
    accountName: '',
  })

  const fetchPayments = () => {
    setLoading(true)
    fetch(`/api/payments?status=READY_FOR_PAYMENT&page=${page}&limit=20`)
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

  const viewDetail = (paymentId: string) => {
    setDetailLoading(true)
    setDetailPayment(null)
    fetch(`/api/payments/${paymentId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((res) => {
        if (res.success) {
          setDetailPayment(res.data)
          setApproveForm({
            paymentMethod: res.data.paymentMethod || '',
            accountNumber: res.data.accountNumber || '',
            accountName: res.data.accountName || '',
          })
        } else {
          toast.error(res.error)
        }
      })
      .catch(() => toast.error('Gagal memuat detail'))
      .finally(() => setDetailLoading(false))
  }

  const handleApprove = async () => {
    if (!detailPayment) return
    setApproving(true)
    try {
      const res = await fetch(`/api/payments/${detailPayment.id}?action=approve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approveForm),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Pembayaran berhasil disetujui')
        setDetailPayment(data.data)
        fetchPayments()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectTarget) return
    setRejecting(true)
    try {
      const res = await fetch(`/api/payments/${rejectTarget.id}?action=reject`, { method: 'PUT' })
      const data = await res.json()
      if (data.success) {
        toast.success('Pembayaran ditolak')
        setRejectTarget(null)
        setDetailPayment(null)
        fetchPayments()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setRejecting(false)
    }
  }

  // Computed summary stats
  const totalSiapBayar = payments.length
  const totalSiapBayarAmount = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)
  const menungguReview = payments.filter((p: any) => p.validationScore < 3).length

  return (
    <div className="space-y-6">
      {/* ── Page Title Area ────────────────────────────────── */}
      <motion.div
        className="relative rounded-xl bg-gradient-to-br from-amber-50 via-orange-50/60 to-transparent border border-amber-100/50 px-6 py-5 overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-amber-100/30 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-orange-100/20 rounded-full translate-y-1/2" />
        <div className="relative flex items-center gap-3">
          <Button variant="ghost" size="icon" className="-ml-2" onClick={() => router.push('/keuangan/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-amber-900">Approval Pembayaran</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Pembayaran siap disetujui</p>
          </div>
        </div>
      </motion.div>

      {/* ── Payment Summary Stats ─────────────────────────── */}
      {!loading && payments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PaymentStatCard
            icon={<Wallet className="h-5 w-5 text-emerald-600" />}
            label="Total Siap Bayar"
            value={totalSiapBayar}
            subValue={formatCurrency(totalSiapBayarAmount)}
            borderColor="border-l-emerald-500"
            bgColor="bg-gradient-to-br from-emerald-50 to-teal-50"
            index={0}
          />
          <PaymentStatCard
            icon={<Clock className="h-5 w-5 text-amber-600" />}
            label="Menunggu Review"
            value={menungguReview}
            borderColor="border-l-amber-500"
            bgColor="bg-gradient-to-br from-amber-50 to-orange-50"
            index={1}
          />
          <PaymentStatCard
            icon={<FileCheck className="h-5 w-5 text-teal-600" />}
            label="Tervalidasi (3/3)"
            value={totalSiapBayar - menungguReview}
            borderColor="border-l-teal-500"
            bgColor="bg-gradient-to-br from-teal-50 to-cyan-50"
            index={2}
          />
        </div>
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
                icon={Receipt}
                title="Tidak Ada Pembayaran"
                description="Tidak ada pembayaran yang menunggu approval"
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Saksi</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Validasi</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p, i) => (
                      <motion.tr
                        key={p.id}
                        className="hover:bg-muted/50 border-b transition-colors"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 * i }}
                        whileHover={{ backgroundColor: 'rgba(241, 245, 249, 0.8)' }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <UserAvatar name={p.user?.name || '?'} size="sm" />
                            <div>
                              <p className="font-medium">{p.user?.name}</p>
                              <p className="text-xs text-muted-foreground">{p.user?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-emerald-600">{formatCurrency(p.amount)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <ValidationBadge label="GPS" done={p.gpsVerified} />
                            <ValidationBadge label="Data" done={p.dataInputted} />
                            <ValidationBadge label="C1" done={p.c1Uploaded} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{p.validationScore}/3</p>
                        </TableCell>
                        <TableCell className="text-sm">{p.user?.phone || '-'}</TableCell>
                        <TableCell className="text-sm">{new Date(p.createdAt).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => viewDetail(p.id)}>
                            <Eye className="h-4 w-4 mr-1" /> Review
                          </Button>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</Button>
          <span className="text-sm text-muted-foreground">Hal {page} dari {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Selanjutnya</Button>
        </motion.div>
      )}

      {/* ── Detail/Approve Dialog ─────────────────────────── */}
      <Dialog open={!!detailPayment} onOpenChange={(open) => !open && setDetailPayment(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Pembayaran</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : detailPayment ? (
            <div className="space-y-5">
              {/* ── User Avatar & Info ──────────────────── */}
              <motion.div
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <UserAvatar name={detailPayment.user?.name || '?'} size="lg" />
                <h3 className="text-lg font-bold mt-1">{detailPayment.user?.name}</h3>
                <p className="text-sm text-muted-foreground">{detailPayment.user?.email}</p>
                <p className="text-xs text-muted-foreground">{detailPayment.user?.phone}</p>
              </motion.div>

              <Separator className="bg-gradient-to-r from-transparent via-amber-200 to-transparent" />

              {/* ── Ringkasan Pembayaran ────────────────── */}
              <motion.div
                className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Ringkasan Pembayaran</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">{formatCurrency(detailPayment.amount)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Skor Validasi: {detailPayment.validationScore}/3
                </p>
              </motion.div>

              {/* ── Validation Checklist ────────────────── */}
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Checklist Validasi</h4>
                <ValidationChecklistItem
                  icon={<MapPin className="h-5 w-5" />}
                  label="Validasi GPS"
                  done={detailPayment.gpsVerified}
                />
                <ValidationChecklistItem
                  icon={<ShieldCheck className="h-5 w-5" />}
                  label="Data Suara"
                  done={detailPayment.dataInputted}
                />
                <ValidationChecklistItem
                  icon={<Upload className="h-5 w-5" />}
                  label="Foto C1"
                  done={detailPayment.c1Uploaded}
                />
              </motion.div>

              <Separator className="bg-gradient-to-r from-transparent via-muted to-transparent" />

              {/* ── Payment Form Section ────────────────── */}
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Metode Pembayaran</h4>
                <div className="space-y-3 p-4 rounded-lg bg-muted/50 border">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Metode</Label>
                    <Input value={approveForm.paymentMethod} onChange={(e) => setApproveForm({ ...approveForm, paymentMethod: e.target.value })} placeholder="Transfer Bank / E-Wallet" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">No. Rekening / E-Wallet</Label>
                    <Input value={approveForm.accountNumber} onChange={(e) => setApproveForm({ ...approveForm, accountNumber: e.target.value })} placeholder="Nomor rekening" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Nama Penerima</Label>
                    <Input value={approveForm.accountName} onChange={(e) => setApproveForm({ ...approveForm, accountName: e.target.value })} placeholder="Nama penerima" />
                  </div>
                </div>
              </motion.div>

              {/* ── Action Buttons ──────────────────────── */}
              <motion.div
                className="flex gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setRejectTarget(detailPayment)}
                >
                  Tolak
                </Button>
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={handleApprove} disabled={approving}>
                  {approving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Menyetujui...</> : 'Setujui'}
                </Button>
              </motion.div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Reject Confirmation */}
      <ConfirmDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="Tolak Pembayaran"
        description={`Apakah Anda yakin ingin menolak pembayaran sebesar ${formatCurrency(rejectTarget?.amount || 0)} untuk ${rejectTarget?.user?.name}?`}
        confirmLabel="Ya, Tolak"
        onConfirm={handleReject}
        loading={rejecting}
      />
    </div>
  )
}

function ValidationBadge({ label, done }: { label: string; done: boolean }) {
  return (
    <Badge variant="secondary" className={done ? 'bg-emerald-100 text-emerald-700 gap-1.5' : 'bg-gray-100 text-gray-600 gap-1.5'}>
      <span className={`inline-flex h-1.5 w-1.5 rounded-full ${done ? 'bg-emerald-500' : 'bg-gray-400'}`} />
      {label}
    </Badge>
  )
}
