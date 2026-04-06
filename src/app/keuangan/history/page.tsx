'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Wallet, Download, History } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { toast } from 'sonner'

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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/keuangan/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Riwayat Pembayaran</h1>
          <p className="text-sm text-muted-foreground">Pembayaran yang sudah dicairkan</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={payments.length === 0}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
      </div>

      {/* Summary */}
      <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Dicairkan (Halaman Ini)</p>
            <p className="text-2xl font-bold text-emerald-700">{formatCurrency(totalAmount)}</p>
          </div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-sm gap-1.5 rounded-full px-3">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {payments.length} transaksi
          </Badge>
        </CardContent>
      </Card>

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
                  {payments.map((p) => (
                    <TableRow key={p.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm">
                        {p.disbursedAt ? new Date(p.disbursedAt).toLocaleString('id-ID') : '-'}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{p.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{p.user?.email}</p>
                      </TableCell>
                      <TableCell className="font-medium text-emerald-600">{formatCurrency(p.amount)}</TableCell>
                      <TableCell className="text-sm">{p.paymentMethod || '-'}</TableCell>
                      <TableCell className="text-sm">{p.accountNumber || '-'}</TableCell>
                      <TableCell className="text-sm">{p.accountName || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <ValidationBadge label="GPS" done={p.gpsVerified} />
                          <ValidationBadge label="Data" done={p.dataInputted} />
                          <ValidationBadge label="C1" done={p.c1Uploaded} />
                        </div>
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
