'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { ArrowLeft, Search, Plus, Trash2, Loader2, Download, Eye, Users, MapPin, ClipboardCheck, FileText } from 'lucide-react'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { motion } from 'framer-motion'

// ─── User Avatar with Initials ─────────────────────────────────────────
function UserAvatar({ name, size = 'sm', showStatus = false, isOnline = false }: { name: string; size?: 'sm' | 'md' | 'lg'; showStatus?: boolean; isOnline?: boolean }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?'
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-base',
    lg: 'h-16 w-16 text-xl',
  }

  return (
    <div className="relative inline-flex flex-shrink-0">
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold shadow-sm`}
      >
        {initial}
      </div>
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white dark:ring-slate-700 ${
            isOnline ? 'h-2.5 w-2.5 bg-emerald-500' : 'h-2.5 w-2.5 bg-gray-400'
          }`}
        />
      )}
    </div>
  )
}

// ─── Stat Card with colored border ─────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  borderColor,
  bgColor,
  index,
}: {
  icon: React.ReactNode
  label: string
  value: number
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
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/70 dark:bg-slate-700/70 shadow-sm flex items-center justify-center text-muted-foreground">
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

export default function AdminSaksiPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [detailUser, setDetailUser] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchUsers = useCallback(() => {
    setLoading(true)
    fetch(`/api/users?role=SAKSI&search=${encodeURIComponent(debouncedSearch)}&page=${page}&limit=20`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((res) => {
        if (res.success) {
          setUsers(res.data.users)
          setTotalPages(res.data.pagination.totalPages)
        } else {
          toast.error(res.error)
        }
      })
      .catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Reset page on search change
  useEffect(() => {
    if (page !== 1) setPage(1)
  }, [debouncedSearch])

  const viewDetail = (userId: string) => {
    setDetailLoading(true)
    setDetailUser(null)
    fetch(`/api/users/${userId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((res) => {
        if (res.success) setDetailUser(res.data)
        else toast.error(res.error)
      })
      .catch(() => toast.error('Gagal memuat detail'))
      .finally(() => setDetailLoading(false))
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/users/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Saksi berhasil dihapus')
        setDeleteTarget(null)
        fetchUsers()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Gagal menghapus saksi')
    } finally {
      setDeleteLoading(false)
    }
  }

  const exportCSV = () => {
    const headers = ['Nama', 'Email', 'Telepon', 'KTP', 'Bank', 'No. Rekening', 'Terdaftar']
    const rows = users.map((u) => [
      u.name,
      u.email,
      u.phone || '-',
      u.ktpNumber || '-',
      u.bankName || '-',
      u.bankAccount || '-',
      new Date(u.createdAt).toLocaleDateString('id-ID'),
    ])
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `saksi_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Data berhasil diekspor ke CSV')
  }

  return (
    <div className="space-y-6">
      {/* ── Page Title Area ────────────────────────────────── */}
      <motion.div
        className="relative rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-transparent dark:from-slate-800 dark:via-emerald-950/20 dark:to-transparent border border-emerald-100/50 dark:border-emerald-800/50 px-6 py-5 overflow-hidden"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-100/30 dark:bg-emerald-900/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-1/2 w-24 h-24 bg-teal-100/20 dark:bg-teal-900/20 rounded-full translate-y-1/2" />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="-ml-2" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Kelola Saksi</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Daftar semua saksi terdaftar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV} disabled={users.length === 0} className="bg-white/80 dark:bg-slate-800/80">
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
            <Button onClick={() => router.push('/auth/register')}>
              <Plus className="h-4 w-4 mr-2" /> Tambah
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari nama, email, atau telepon..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        {debouncedSearch && search !== debouncedSearch && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </motion.div>

      {/* Table */}
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
            ) : users.length === 0 ? (
              <EmptyState
                icon={Users}
                title={debouncedSearch ? 'Tidak Ada Hasil' : 'Belum Ada Saksi'}
                description={debouncedSearch ? `Tidak ditemukan saksi untuk "${debouncedSearch}"` : 'Belum ada saksi yang terdaftar'}
              />
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table className="min-w-[640px]">
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>KTP</TableHead>
                      <TableHead>Terdaftar</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u, i) => (
                      <motion.tr
                        key={u.id}
                        className="hover:bg-muted/50 border-b transition-colors"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.05 * i }}
                        
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <UserAvatar name={u.name} size="sm" showStatus isOnline={Math.random() > 0.4} />
                            <span className="font-medium">{u.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{u.email}</TableCell>
                        <TableCell className="text-sm">{u.phone || '-'}</TableCell>
                        <TableCell className="text-sm">{u.ktpNumber || '-'}</TableCell>
                        <TableCell className="text-sm">{new Date(u.createdAt).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => viewDetail(u.id)}>
                              <Eye className="h-4 w-4 mr-1" /> Detail
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(u)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
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

      {/* Detail Dialog */}
      <Dialog open={!!detailUser} onOpenChange={(open) => !open && setDetailUser(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detail Saksi</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : detailUser ? (
            <div className="space-y-6">
              {/* ── User Avatar Section ──────────────────── */}
              <motion.div
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <UserAvatar name={detailUser.name} size="lg" showStatus isOnline={Math.random() > 0.4} />
                <h3 className="text-lg font-bold mt-1">{detailUser.name}</h3>
                <p className="text-sm text-muted-foreground">{detailUser.email}</p>
                <p className="text-xs text-muted-foreground">{detailUser.phone || '-'}</p>
              </motion.div>

              <Separator className="bg-gradient-to-r from-transparent via-emerald-200 dark:via-emerald-800 to-transparent" />

              {/* ── Info Section ─────────────────────────── */}
              <motion.div
                className="grid grid-cols-2 gap-4 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">KTP:</span>
                  <span className="font-medium">{detailUser.ktpNumber || '-'}</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Bank:</span>
                  <span className="font-medium">{detailUser.bankName || '-'}</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">No. Rek:</span>
                  <span className="font-medium">{detailUser.bankAccount || '-'}</span>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">E-Wallet:</span>
                  <span className="font-medium">{detailUser.eWalletType || '-'} {detailUser.eWalletNumber || ''}</span>
                </div>
                <div className="col-span-2 flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <span className="text-muted-foreground">Terdaftar:</span>
                  <span className="font-medium">{new Date(detailUser.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
              </motion.div>

              {/* ── Stat Cards ───────────────────────────── */}
              <motion.div
                className="grid grid-cols-3 gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <StatCard
                  icon={<ClipboardCheck className="h-5 w-5 text-emerald-600" />}
                  label="Check-in"
                  value={detailUser.checkIns?.length || 0}
                  borderColor="border-l-emerald-500"
                  bgColor="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30"
                  index={0}
                />
                <StatCard
                  icon={<FileText className="h-5 w-5 text-teal-600" />}
                  label="Input Suara"
                  value={detailUser.voteInputs?.length || 0}
                  borderColor="border-l-teal-500"
                  bgColor="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30"
                  index={1}
                />
                <StatCard
                  icon={<FileText className="h-5 w-5 text-amber-600" />}
                  label="Laporan"
                  value={detailUser.fraudReports?.length || 0}
                  borderColor="border-l-amber-500"
                  bgColor="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30"
                  index={2}
                />
              </motion.div>

              {/* ── Assignments ──────────────────────────── */}
              {detailUser.assignments?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">Penugasan ({detailUser.assignments.length})</h4>
                    <Badge
                      variant="outline"
                      className="cursor-pointer hover:bg-emerald-50 transition-colors text-emerald-700 border-emerald-200"
                      onClick={() => { setDetailUser(null); router.push('/admin/plotting') }}
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      Lihat Penugasan
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {detailUser.assignments.map((a: any) => (
                      <div key={a.id} className="flex items-center gap-2 text-sm p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 gap-1.5">
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {a.status}
                        </Badge>
                        <span>{a.tps?.code} - {a.tps?.name}</span>
                        <span className="text-muted-foreground ml-auto">{new Date(a.assignedAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Saksi"
        description={`Apakah Anda yakin ingin menghapus saksi "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
