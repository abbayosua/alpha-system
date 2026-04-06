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
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, Loader2, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function KeuanganPaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [detailPayment, setDetailPayment] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [approveForm, setApproveForm] = useState({
    paymentMethod: '',
    accountNumber: '',
    accountName: '',
  })

  const fetchPayments = () => {
    setLoading(true)
    fetch(`/api/payments?status=READY_FOR_PAYMENT&page=${page}&limit=20`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setPayments(res.data.payments)
          setTotalPages(res.data.pagination.totalPages)
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
      .then((res) => res.json())
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
    if (!detailPayment || !confirm('Yakin ingin menolak pembayaran ini?')) return
    setRejecting(true)
    try {
      const res = await fetch(`/api/payments/${detailPayment.id}?action=reject`, { method: 'PUT' })
      const data = await res.json()
      if (data.success) {
        toast.success('Pembayaran ditolak')
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

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/keuangan/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Approval Pembayaran</h1>
          <p className="text-sm text-muted-foreground">Pembayaran siap disetujui</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              Tidak ada pembayaran yang menunggu approval
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Saksi</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Validasi</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <p className="font-medium">{p.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{p.user?.email}</p>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(p.amount)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant="secondary" className={p.gpsVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>GPS</Badge>
                          <Badge variant="secondary" className={p.dataInputted ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>Data</Badge>
                          <Badge variant="secondary" className={p.c1Uploaded ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>C1</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{p.validationScore}/3</p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {p.user?.phone || '-'}
                      </TableCell>
                      <TableCell className="text-sm">{new Date(p.createdAt).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => viewDetail(p.id)}>
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</Button>
          <span className="text-sm text-muted-foreground">Hal {page} dari {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Selanjutnya</Button>
        </div>
      )}

      {/* Detail/Approve Dialog */}
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{detailPayment.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{detailPayment.user?.email}</p>
                  <p className="text-sm text-muted-foreground">{detailPayment.user?.phone}</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(detailPayment.amount)}</p>
              </div>

              <div className="p-3 bg-muted rounded space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validasi GPS</span>
                  <Badge variant="secondary" className={detailPayment.gpsVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {detailPayment.gpsVerified ? '✓' : '✗'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data Suara</span>
                  <Badge variant="secondary" className={detailPayment.dataInputted ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {detailPayment.dataInputted ? '✓' : '✗'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Foto C1</span>
                  <Badge variant="secondary" className={detailPayment.c1Uploaded ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                    {detailPayment.c1Uploaded ? '✓' : '✗'}
                  </Badge>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Skor Validasi</span>
                  <span>{detailPayment.validationScore}/3</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-sm font-semibold">Metode Pembayaran</p>
                <div className="space-y-2">
                  <Label>Metode</Label>
                  <Input value={approveForm.paymentMethod} onChange={(e) => setApproveForm({ ...approveForm, paymentMethod: e.target.value })} placeholder="Transfer Bank / E-Wallet" />
                </div>
                <div className="space-y-2">
                  <Label>No. Rekening / E-Wallet</Label>
                  <Input value={approveForm.accountNumber} onChange={(e) => setApproveForm({ ...approveForm, accountNumber: e.target.value })} placeholder="Nomor rekening" />
                </div>
                <div className="space-y-2">
                  <Label>Nama Penerima</Label>
                  <Input value={approveForm.accountName} onChange={(e) => setApproveForm({ ...approveForm, accountName: e.target.value })} placeholder="Nama penerima" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="destructive" className="flex-1" onClick={handleReject} disabled={rejecting}>
                  {rejecting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Menolak...</> : 'Tolak'}
                </Button>
                <Button className="flex-1" onClick={handleApprove} disabled={approving}>
                  {approving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Menyetujui...</> : 'Setujui'}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
