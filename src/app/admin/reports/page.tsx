'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
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
import { motion } from 'framer-motion'
import {
  ArrowLeft, Search, Eye, Loader2, FileBarChart, AlertTriangle,
  CheckCircle2, XCircle, User, Calendar, Tag, MessageSquare,
  ShieldCheck, ClipboardList, FileText, Inbox,
} from 'lucide-react'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'

const STATUS_CONFIG: Record<string, { color: string; dot: string; border: string; iconColor: string }> = {
  PENDING: { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', border: 'border-l-amber-400', iconColor: 'text-amber-500' },
  UNDER_REVIEW: { color: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500', border: 'border-l-teal-400', iconColor: 'text-teal-500' },
  VERIFIED: { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', border: 'border-l-emerald-400', iconColor: 'text-emerald-500' },
  DISMISSED: { color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', border: 'border-l-gray-300', iconColor: 'text-gray-400' },
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  UNDER_REVIEW: 'Under Review',
  VERIFIED: 'Verified',
  DISMISSED: 'Dismissed',
}

// ─── Container Animation Variants ────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

// ─── Status Summary Card ─────────────────────────────────────────────
function StatusSummaryCard({
  icon,
  label,
  count,
  colorClass,
  index,
}: {
  icon: React.ReactNode
  label: string
  count: number
  colorClass: string
  index: number
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="cursor-default"
    >
      <Card className={`shadow-sm border-l-4 ${colorClass} transition-shadow hover:shadow-md`}>
        <CardContent className="p-3 sm:p-4 flex items-center gap-3">
          <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/70 shadow-sm flex items-center justify-center">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl sm:text-2xl font-bold leading-tight">{count}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── User Avatar ─────────────────────────────────────────────────────
function UserAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initial = (name || '?')[0]?.toUpperCase() || '?'
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-xl',
  }
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold flex items-center justify-center flex-shrink-0 shadow-sm`}>
      {initial}
    </div>
  )
}

// ─── Report Status Badge ─────────────────────────────────────────────
function ReportStatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] || { color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500', border: '', iconColor: '' }
  return (
    <Badge variant="secondary" className={`${c.color} gap-1.5`}>
      <span className={`inline-flex h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {STATUS_LABELS[status] || status.replace(/_/g, ' ')}
    </Badge>
  )
}

// ─── Category Badge ──────────────────────────────────────────────────
function CategoryBadge({ category }: { category: string }) {
  const catColors: Record<string, string> = {
    MONEY_POLITICS: 'bg-rose-100 text-rose-700 border-rose-200',
    BALLOT_STUFFING: 'bg-amber-100 text-amber-700 border-amber-200',
    VOTER_INTIMIDATION: 'bg-orange-100 text-orange-700 border-orange-200',
    PROCEDURAL_VIOLATION: 'bg-teal-100 text-teal-700 border-teal-200',
    OTHER: 'bg-gray-100 text-gray-600 border-gray-200',
  }
  const cls = catColors[category] || 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <Badge variant="outline" className={`${cls} border`}>
      <Tag className="h-3 w-3 mr-1" />
      {category.replace(/_/g, ' ')}
    </Badge>
  )
}

// ─── Empty State Illustration ────────────────────────────────────────
function ReportsEmptyState({ isFiltered }: { isFiltered: boolean }) {
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
          {isFiltered ? (
            <Search className="h-10 w-10 text-emerald-600" />
          ) : (
            <Inbox className="h-10 w-10 text-emerald-600" />
          )}
        </div>
        {/* Decorative dots */}
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400/60" />
        <div className="absolute -bottom-2 left-1 w-2 h-2 rounded-full bg-teal-400/60" />
        <div className="absolute top-3 -left-2 w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {isFiltered ? 'Tidak Ada Hasil' : 'Belum Ada Laporan'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
        {isFiltered
          ? 'Tidak ditemukan laporan yang sesuai dengan filter saat ini. Coba ubah kata kunci atau filter.'
          : 'Laporan kecurangan dari saksi akan muncul di sini setelah mereka mengirimkan laporan.'}
      </p>
      {!isFiltered && (
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Semua laporan akan direview oleh admin</span>
        </div>
      )}
    </motion.div>
  )
}

// ═════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════
export default function AdminReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [detailReport, setDetailReport] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [updateStatus, setUpdateStatus] = useState('')
  const [updateNotes, setUpdateNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchReports = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', '20')
    if (debouncedSearch) params.set('search', debouncedSearch)
    if (statusFilter !== 'ALL') params.set('status', statusFilter)

    fetch(`/api/reports?${params}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((res) => {
        if (res.success) {
          setReports(res.data.reports)
          setTotalPages(res.data.pagination.totalPages)
        } else {
          toast.error(res.error)
        }
      })
      .catch(() => toast.error('Gagal memuat laporan'))
      .finally(() => setLoading(false))
  }, [page, statusFilter, debouncedSearch])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  useEffect(() => {
    if (page !== 1) setPage(1)
  }, [debouncedSearch, statusFilter])

  // Status counts (derive from current page reports + a simple count)
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      total: reports.length,
      PENDING: 0,
      UNDER_REVIEW: 0,
      VERIFIED: 0,
      DISMISSED: 0,
    }
    reports.forEach((r) => {
      if (counts[r.status] !== undefined) counts[r.status]++
    })
    return counts
  }, [reports])

  const viewDetail = (reportId: string) => {
    setDetailLoading(true)
    setDetailReport(null)
    fetch(`/api/reports/${reportId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
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
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/dashboard')} className="-ml-2 flex-shrink-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm flex-shrink-0">
              <FileBarChart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">Laporan Kecurangan</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Kelola laporan fraud dari saksi</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Status Summary Cards ────────────────────────────── */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <StatusSummaryCard
          icon={<ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />}
          label="Total Laporan"
          count={statusCounts.total}
          colorClass="border-l-gray-400"
          index={0}
        />
        <StatusSummaryCard
          icon={<AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />}
          label="Pending"
          count={statusCounts.PENDING}
          colorClass="border-l-amber-400 bg-gradient-to-br from-amber-50 to-orange-50/50"
          index={1}
        />
        <StatusSummaryCard
          icon={<Eye className="h-4 w-4 sm:h-5 sm:w-5 text-teal-500" />}
          label="Under Review"
          count={statusCounts.UNDER_REVIEW}
          colorClass="border-l-teal-400 bg-gradient-to-br from-teal-50 to-cyan-50/50"
          index={2}
        />
        <StatusSummaryCard
          icon={<CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />}
          label="Verified"
          count={statusCounts.VERIFIED}
          colorClass="border-l-emerald-400 bg-gradient-to-br from-emerald-50 to-teal-50/50"
          index={3}
        />
        <StatusSummaryCard
          icon={<XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-rose-400" />}
          label="Dismissed"
          count={statusCounts.DISMISSED}
          colorClass="border-l-rose-300 bg-gradient-to-br from-rose-50 to-red-50/50"
          index={4}
        />
      </motion.div>

      {/* ── Filters ─────────────────────────────────────────── */}
      <motion.div
        className="flex flex-col sm:flex-row gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35, ease: 'easeOut' }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari laporan..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {debouncedSearch && search !== debouncedSearch && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
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
      </motion.div>

      {/* ── Table ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: 'easeOut' }}
      >
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : reports.length === 0 ? (
              <ReportsEmptyState isFiltered={!!(debouncedSearch || statusFilter !== 'ALL')} />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Judul</TableHead>
                      <TableHead>Pelapor</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((r) => {
                      const config = STATUS_CONFIG[r.status] || STATUS_CONFIG.DISMISSED
                      return (
                        <TableRow
                          key={r.id}
                          className={`hover:bg-muted/50 transition-colors border-l-4 ${config.border}`}
                        >
                          <TableCell className="font-medium max-w-[200px] truncate">{r.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <UserAvatar name={r.user?.name} />
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{r.user?.name || '-'}</p>
                                <p className="text-xs text-muted-foreground truncate">{r.user?.email || ''}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <CategoryBadge category={r.category || 'OTHER'} />
                          </TableCell>
                          <TableCell>
                            <ReportStatusBadge status={r.status} />
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(r.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => viewDetail(r.id)} className="hover:bg-emerald-50 hover:text-emerald-700">
                              <Eye className="h-4 w-4 mr-1" /> Detail
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Pagination ──────────────────────────────────────── */}
      {totalPages > 1 && (
        <motion.div
          className="flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground">
            Hal {page} dari {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Selanjutnya
          </Button>
        </motion.div>
      )}

      {/* ── Detail Dialog ───────────────────────────────────── */}
      <Dialog open={!!detailReport} onOpenChange={(open) => !open && setDetailReport(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-emerald-600" />
              Detail Laporan
            </DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : detailReport ? (
            <div className="space-y-5">
              {/* Header with avatar */}
              <div className="flex items-start gap-3">
                <UserAvatar name={detailReport.user?.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg leading-tight">{detailReport.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{detailReport.user?.name} ({detailReport.user?.email})</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <ReportStatusBadge status={detailReport.status} />
                    <CategoryBadge category={detailReport.category || 'OTHER'} />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Report Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Tanggal:</span>
                  <span className="font-medium">
                    {new Date(detailReport.createdAt).toLocaleString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm font-semibold text-foreground">Deskripsi</p>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3.5 rounded-lg border leading-relaxed">
                  {detailReport.description}
                </p>
              </div>

              {/* Video Evidence */}
              {detailReport.videoPath && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-teal-600" />
                    <p className="text-sm font-semibold text-foreground">Video Bukti</p>
                  </div>
                  <video
                    src={detailReport.videoPath}
                    controls
                    className="w-full rounded-lg border max-h-48"
                  />
                </div>
              )}

              {/* Review Notes */}
              {detailReport.reviewNotes && (
                <>
                  <Separator />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ClipboardList className="h-4 w-4 text-amber-600" />
                      <p className="text-sm font-semibold text-foreground">Catatan Review</p>
                    </div>
                    <p className="text-sm bg-amber-50/50 text-muted-foreground p-3.5 rounded-lg border border-amber-100/50 leading-relaxed">
                      {detailReport.reviewNotes}
                    </p>
                  </div>
                </>
              )}

              <Separator />

              {/* Update Status Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm font-semibold text-foreground">Update Status</p>
                </div>

                <div className="space-y-2.5 p-4 rounded-lg bg-muted/30 border">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-medium">Status</Label>
                    <Select value={updateStatus} onValueChange={setUpdateStatus}>
                      <SelectTrigger className="w-full">
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
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-medium">Catatan Review</Label>
                    <Textarea
                      value={updateNotes}
                      onChange={(e) => setUpdateNotes(e.target.value)}
                      rows={3}
                      placeholder="Tambahkan catatan review..."
                      className="resize-none"
                    />
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm"
                  onClick={handleUpdateStatus}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
