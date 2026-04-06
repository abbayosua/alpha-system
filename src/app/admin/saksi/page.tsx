'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { ArrowLeft, Search, Plus, Trash2, Loader2 } from 'lucide-react'

export default function AdminSaksiPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [detailUser, setDetailUser] = useState<any>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  const fetchUsers = () => {
    setLoading(true)
    fetch(`/api/users?role=SAKSI&search=${encodeURIComponent(search)}&page=${page}&limit=20`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setUsers(res.data.users)
          setTotalPages(res.data.pagination.totalPages)
        }
      })
      .catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [page])

  useEffect(() => {
    const timer = setTimeout(() => { setPage(1); fetchUsers() }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const viewDetail = (userId: string) => {
    setDetailLoading(true)
    setDetailUser(null)
    fetch(`/api/users/${userId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setDetailUser(res.data)
        else toast.error(res.error)
      })
      .catch(() => toast.error('Gagal memuat detail'))
      .finally(() => setDetailLoading(false))
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Yakin ingin menghapus saksi ini?')) return
    setDeleteLoading(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Saksi berhasil dihapus')
        fetchUsers()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Gagal menghapus saksi')
    } finally {
      setDeleteLoading(null)
    }
  }

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Kelola Saksi</h1>
          <p className="text-sm text-muted-foreground">Daftar semua saksi terdaftar</p>
        </div>
        <Button onClick={() => router.push('/auth/register')}>
          <Plus className="h-4 w-4 mr-2" /> Tambah
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari nama, email, atau telepon..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">Tidak ada saksi ditemukan</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
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
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-sm">{u.email}</TableCell>
                      <TableCell className="text-sm">{u.phone || '-'}</TableCell>
                      <TableCell className="text-sm">{u.ktpNumber || '-'}</TableCell>
                      <TableCell className="text-sm">{new Date(u.createdAt).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => viewDetail(u.id)}>Detail</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(u.id)} disabled={deleteLoading === u.id}>
                            {deleteLoading === u.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
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
                <div><span className="text-muted-foreground">Nama:</span> {detailUser.name}</div>
                <div><span className="text-muted-foreground">Email:</span> {detailUser.email}</div>
                <div><span className="text-muted-foreground">Telepon:</span> {detailUser.phone || '-'}</div>
                <div><span className="text-muted-foreground">KTP:</span> {detailUser.ktpNumber || '-'}</div>
                <div><span className="text-muted-foreground">Bank:</span> {detailUser.bankName || '-'}</div>
                <div><span className="text-muted-foreground">No. Rek:</span> {detailUser.bankAccount || '-'}</div>
                <div><span className="text-muted-foreground">E-Wallet:</span> {detailUser.eWalletType || '-'} {detailUser.eWalletNumber || ''}</div>
                <div><span className="text-muted-foreground">Terdaftar:</span> {new Date(detailUser.createdAt).toLocaleDateString('id-ID')}</div>
              </div>

              {/* Assignments */}
              {detailUser.assignments?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-2">Penugasan ({detailUser.assignments.length})</h4>
                  <div className="space-y-2">
                    {detailUser.assignments.map((a: any) => (
                      <div key={a.id} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                        <Badge variant="secondary" className={a.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : ''}>{a.status}</Badge>
                        <span>{a.tps?.code} - {a.tps?.name}</span>
                        <span className="text-muted-foreground ml-auto">{new Date(a.assignedAt).toLocaleDateString('id-ID')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="p-2 bg-muted rounded">
                  <p className="font-bold">{detailUser.checkIns?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Check-in</p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <p className="font-bold">{detailUser.voteInputs?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Input Suara</p>
                </div>
                <div className="p-2 bg-muted rounded">
                  <p className="font-bold">{detailUser.fraudReports?.length || 0}</p>
                  <p className="text-xs text-muted-foreground">Laporan</p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
