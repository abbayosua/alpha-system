'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Search, Eye, Loader2 } from 'lucide-react'

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  VERIFIED: 'bg-green-100 text-green-700',
  DISMISSED: 'bg-gray-100 text-gray-700',
}

export default function AdminReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [detailReport, setDetailReport] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [updateStatus, setUpdateStatus] = useState('')
  const [updateNotes, setUpdateNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchReports = () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', '20')
    if (search) params.set('search', search)
    if (statusFilter !== 'ALL') params.set('status', statusFilter)

    fetch(`/api/reports?${params}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setReports(res.data.reports)
          setTotalPages(res.data.pagination.totalPages)
        }
      })
      .catch(() => toast.error('Gagal memuat laporan'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchReports()
  }, [page, statusFilter])

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchReports() }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const viewDetail = (reportId: string) => {
    setDetailLoading(true)
    setDetailReport(null)
    fetch(`/api/reports/${reportId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setDetailReport(res.data)
          setUpdateStatus(res.data.status)
          setUpdateNotes(res.data.reviewNotes || '')
        } else {
          toast.error(res.error)
        }
      })
      .catch(() => toast.error('Gagal memuat detail'))
      .finally(() => setDetailLoading(false))
  }

  const handleUpdateStatus = async () => {
    if (!detailReport) return
    setSaving(true)
    try {
      const res = await fetch(`/api/reports/${detailReport.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: updateStatus, reviewNotes: updateNotes }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Status laporan berhasil diperbarui')
        setDetailReport(data.data)
        fetchReports()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Laporan Kecurangan</h1>
          <p className="text-sm text-muted-foreground">Kelola laporan fraud dari saksi</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Cari laporan..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="VERIFIED">Verified</SelectItem>
            <SelectItem value="DISMISSED">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : reports.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">Tidak ada laporan ditemukan</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Judul</TableHead>
                    <TableHead>Pelapor</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.title}</TableCell>
                      <TableCell className="text-sm">{r.user?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{(r.category || '').replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={STATUS_STYLES[r.status] || ''}>
                          {r.status.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(r.createdAt).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => viewDetail(r.id)}>
                          <Eye className="h-4 w-4 mr-1" /> Detail
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</Button>
          <span className="text-sm text-muted-foreground">Hal {page} dari {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Selanjutnya</Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!detailReport} onOpenChange={(open) => !open && setDetailReport(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Laporan</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : detailReport ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{detailReport.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className={STATUS_STYLES[detailReport.status] || ''}>
                    {detailReport.status.replace(/_/g, ' ')}
                  </Badge>
                  <Badge variant="outline">{(detailReport.category || '').replace(/_/g, ' ')}</Badge>
                </div>
              </div>

              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Pelapor:</span> {detailReport.user?.name} ({detailReport.user?.email})</p>
                <p><span className="text-muted-foreground">Tanggal:</span> {new Date(detailReport.createdAt).toLocaleString('id-ID')}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Deskripsi:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded">{detailReport.description}</p>
              </div>

              {detailReport.videoPath && (
                <div>
                  <p className="text-sm font-medium mb-1">Video Bukti:</p>
                  <video src={detailReport.videoPath} controls className="w-full rounded border max-h-48" />
                </div>
              )}

              {detailReport.reviewNotes && (
                <div>
                  <p className="text-sm font-medium mb-1">Catatan Review:</p>
                  <p className="text-sm bg-muted p-3 rounded">{detailReport.reviewNotes}</p>
                </div>
              )}

              {/* Update Status */}
              <div className="pt-3 border-t space-y-3">
                <p className="text-sm font-semibold">Update Status:</p>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={updateStatus} onValueChange={setUpdateStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                      <SelectItem value="VERIFIED">Verified</SelectItem>
                      <SelectItem value="DISMISSED">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Catatan Review</Label>
                  <Textarea value={updateNotes} onChange={(e) => setUpdateNotes(e.target.value)} rows={3} placeholder="Catatan review..." />
                </div>
                <Button className="w-full" onClick={handleUpdateStatus} disabled={saving}>
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Menyimpan...</> : 'Update Status'}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
