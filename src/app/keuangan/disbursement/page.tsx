'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { ArrowLeft, Send, Loader2, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/keuangan/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Pencairan Dana</h1>
          <p className="text-sm text-muted-foreground">Pembayaran yang sudah disetujui, siap dicairkan</p>
        </div>
      </div>

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
                  {payments.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/50">
                      <TableCell>
                        <p className="font-medium">{p.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{p.user?.email}</p>
                      </TableCell>
                      <TableCell className="font-medium text-emerald-600">{formatCurrency(p.amount)}</TableCell>
                      <TableCell className="text-sm">{p.paymentMethod || '-'}</TableCell>
                      <TableCell className="text-sm">{p.accountNumber || '-'}</TableCell>
                      <TableCell className="text-sm">{p.accountName || '-'}</TableCell>
                      <TableCell className="text-sm">
                        {p.approvedAt ? new Date(p.approvedAt).toLocaleDateString('id-ID') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => setDisburseTarget(p)}>
                          <Send className="h-4 w-4 mr-1" /> Cairkan
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

      {/* Disburse Confirmation */}
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
