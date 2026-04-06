'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function KeuanganHistoryPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
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
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPayments()
  }, [loadPayments, page])

  const totalAmount = payments.reduce((sum: number, p: any) => sum + p.amount, 0)

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/keuangan/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Riwayat Pembayaran</h1>
          <p className="text-sm text-muted-foreground">Pembayaran yang sudah dicairkan</p>
        </div>
      </div>

      {/* Summary */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Dicairkan (Halaman Ini)</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(totalAmount)}</p>
          </div>
          <Badge className="bg-green-100 text-green-700 text-sm">
            {payments.length} transaksi
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
              Belum ada riwayat pencairan
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
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
                    <TableRow key={p.id}>
                      <TableCell className="text-sm">
                        {p.disbursedAt ? new Date(p.disbursedAt).toLocaleString('id-ID') : '-'}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{p.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{p.user?.email}</p>
                      </TableCell>
                      <TableCell className="font-medium">{formatCurrency(p.amount)}</TableCell>
                      <TableCell className="text-sm">{p.paymentMethod || '-'}</TableCell>
                      <TableCell className="text-sm">{p.accountNumber || '-'}</TableCell>
                      <TableCell className="text-sm">{p.accountName || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant="secondary" className={p.gpsVerified ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>GPS</Badge>
                          <Badge variant="secondary" className={p.dataInputted ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>Data</Badge>
                          <Badge variant="secondary" className={p.c1Uploaded ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>C1</Badge>
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
