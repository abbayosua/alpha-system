'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { ArrowLeft, Users, MapPin, Link, Trash2, Loader2, GitBranch } from 'lucide-react'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

export default function AdminPlottingPage() {
  const router = useRouter()
  const [unassignedSaksi, setUnassignedSaksi] = useState<any[]>([])
  const [tpsList, setTpsList] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedSaksi, setSelectedSaksi] = useState<any>(null)
  const [selectedTps, setSelectedTps] = useState<string>('')
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchData = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/users?role=SAKSI&limit=100').then((r) => r.json()),
      fetch('/api/tps?limit=100').then((r) => r.json()),
      fetch('/api/assignments?status=ACTIVE&limit=100').then((r) => r.json()),
    ])
      .then(([usersRes, tpsRes, assignRes]) => {
        if (usersRes.success) {
          const assignedIds = new Set(assignRes.success ? assignRes.data.assignments.map((a: any) => a.userId) : [])
          setUnassignedSaksi(usersRes.data.users.filter((u: any) => !assignedIds.has(u.id)))
        }
        if (tpsRes.success) setTpsList(tpsRes.data)
        if (assignRes.success) setAssignments(assignRes.data.assignments)
      })
      .catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAssign = async () => {
    if (!selectedSaksi || !selectedTps) {
      toast.error('Pilih saksi dan TPS')
      return
    }
    setAssigning(true)
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedSaksi.id, tpsId: selectedTps }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`${selectedSaksi.name} berhasil ditugaskan ke TPS`)
        setShowAssignDialog(false)
        setSelectedSaksi(null)
        setSelectedTps('')
        fetchData()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setAssigning(false)
    }
  }

  const handleRemoveAssignment = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/assignments/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Penugasan berhasil dihapus')
        setDeleteTarget(null)
        fetchData()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Gagal menghapus penugasan')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (loading) return <DashboardSkeleton variant="dashboard" />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Plotting Saksi</h1>
          <p className="text-sm text-muted-foreground">Assign saksi ke TPS</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Unassigned Saksi */}
        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Saksi Belum Ditugaskan
              <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-700 rounded-full px-2">
                {unassignedSaksi.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {unassignedSaksi.length > 0 ? unassignedSaksi.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.email}</p>
                  </div>
                  <Button size="sm" onClick={() => { setSelectedSaksi(s); setShowAssignDialog(true) }}>
                    <Link className="h-3 w-3 mr-1" /> Assign
                  </Button>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">Semua saksi sudah ditugaskan</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* TPS */}
        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Daftar TPS
              <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-700 rounded-full px-2">
                {tpsList.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {tpsList.length > 0 ? tpsList.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm">
                  <div>
                    <p className="font-medium">{t.code} - {t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.address}</p>
                  </div>
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 gap-1.5">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {t.activeAssignmentCount} saksi
                  </Badge>
                </div>
              )) : (
                <EmptyState icon={MapPin} title="Belum Ada TPS" description="Tambahkan TPS terlebih dahulu" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Assignments */}
      <Card className="shadow-sm">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Penugasan Aktif
            <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-700 rounded-full px-2">
              {assignments.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Saksi</TableHead>
                  <TableHead>TPS</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.length > 0 ? assignments.map((a) => (
                  <TableRow key={a.id} className="hover:bg-muted/50">
                    <TableCell>
                      <p className="font-medium">{a.user?.name}</p>
                      <p className="text-xs text-muted-foreground">{a.user?.email}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{a.tps?.code}</p>
                      <p className="text-xs text-muted-foreground">{a.tps?.name}</p>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(a.assignedAt).toLocaleDateString('id-ID')}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(a)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <EmptyState icon={GitBranch} title="Belum Ada Penugasan" />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Saksi ke TPS</DialogTitle>
          </DialogHeader>
          {selectedSaksi && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-medium">{selectedSaksi.name}</p>
                <p className="text-sm text-muted-foreground">{selectedSaksi.email}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Pilih TPS</label>
                <select
                  className="w-full rounded-md border p-2 text-sm"
                  value={selectedTps}
                  onChange={(e) => setSelectedTps(e.target.value)}
                >
                  <option value="">-- Pilih TPS --</option>
                  {tpsList.map((t) => (
                    <option key={t.id} value={t.id}>{t.code} - {t.name} ({t.activeAssignmentCount} saksi)</option>
                  ))}
                </select>
              </div>
              <Button className="w-full" onClick={handleAssign} disabled={assigning || !selectedTps}>
                {assigning ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Memproses...</> : 'Assign Sekarang'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Assignment Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus Penugasan"
        description={`Apakah Anda yakin ingin menghapus penugasan ${deleteTarget?.user?.name} dari ${deleteTarget?.tps?.name}?`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleRemoveAssignment}
        loading={deleteLoading}
      />
    </div>
  )
}
