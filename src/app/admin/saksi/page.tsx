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
import { toast } from 'sonner'
import { ArrowLeft, Search, Plus, Trash2, Loader2, Download, Eye, Users } from 'lucide-react'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Kelola Saksi</h1>
          <p className="text-sm text-muted-foreground">Daftar semua saksi terdaftar</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV} disabled={users.length === 0}>
          <Download className="h-4 w-4 mr-2" /> Export CSV
        </Button>
        <Button onClick={() => router.push('/auth/register')}>
          <Plus className="h-4 w-4 mr-2" /> Tambah
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari nama, email, atau telepon..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        {debouncedSearch && search !== debouncedSearch && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Table */}
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
            <div className="overflow-x-auto">
              <Table>
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
                  {users.map((u) => (
                    <TableRow key={u.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{u.name}</TableCell>
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
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Nama:</span> <span className="font-medium">{detailUser.name}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{detailUser.email}</span></div>
                <div><span className="text-muted-foreground">Telepon:</span> <span className="font-medium">{detailUser.phone || '-'}</span></div>
                <div><span className="text-muted-foreground">KTP:</span> <span className="font-medium">{detailUser.ktpNumber || '-'}</span></div>
                <div><span className="text-muted-foreground">Bank:</span> <span className="font-medium">{detailUser.bankName || '-'}</span></div>
                <div><span className="text-muted-foreground">No. Rek:</span> <span className="font-medium">{detailUser.bankAccount || '-'}</span></div>
                <div><span className="text-muted-foreground">E-Wallet:</span> <span className="font-medium">{detailUser.eWalletType || '-'}</span> {detailUser.eWalletNumber || ''}</div>
                <div><span className="text-muted-foreground">Terdaftar:</span> <span className="font-medium">{new Date(detailUser.createdAt).toLocaleDateString('id-ID')}</span></div>
              </div>

              {/* Assignments */}
              {detailUser.assignments?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Penugasan ({detailUser.assignments.length})</h4>
                  <div className="space-y-2">
                    {detailUser.assignments.map((a: any) => (
                      <div key={a.id} className="flex items-center gap-2 text-sm p-3 bg-muted rounded-lg">
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 gap-1.5">
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {a.status}
                        </Badge>
                        <span>{a.tps?.code} - {a.tps?.name}</span>
                        <span className="text-muted-foreground ml-auto">{new Date(a.assignedAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-bold">{detailUser.checkIns?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Check-in</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-bold">{detailUser.voteInputs?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Input Suara</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="font-bold">{detailUser.fraudReports?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Laporan</p>
                </div>
              </div>
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
