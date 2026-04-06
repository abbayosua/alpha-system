'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Users, MapPin, Link, Trash2, Loader2, GitBranch,
  UserPlus, BarChart3, CheckCircle2, Clock
} from 'lucide-react'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

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

  // Compute stats
  const stats = {
    activeAssignments: assignments.length,
    unassignedCount: unassignedSaksi.length,
    tpsCount: tpsList.length,
    occupiedTps: tpsList.filter((t) => (t.activeAssignmentCount || 0) > 0).length,
  }

  // Find selected TPS data for info card
  const selectedTpsData = tpsList.find((t) => t.id === selectedTps)

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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) return <DashboardSkeleton variant="dashboard" />

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Page Title Area */}
      <motion.div
        className="relative rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 dark:from-slate-800 dark:to-slate-900 p-6 sm:p-8 overflow-hidden"
        variants={itemVariants}
      >
        {/* Decorative circle */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-emerald-100/60" />
        <div className="absolute bottom-0 left-1/3 w-20 h-20 rounded-full bg-teal-100/40" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <Button variant="ghost" size="icon" className="bg-white/60 dark:bg-slate-700/60 hover:bg-white/80 dark:hover:bg-slate-600/80 dark:bg-slate-800/80 -ml-2" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Plotting Saksi</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-11">Assign saksi ke TPS dan kelola penugasan aktif</p>
        </div>
      </motion.div>

      {/* Stats Summary */}
      <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3" variants={itemVariants}>
        <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.activeAssignments}</p>
              <p className="text-xs text-muted-foreground">Penugasan Aktif</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.unassignedCount}</p>
              <p className="text-xs text-muted-foreground">Belum Ditugaskan</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-teal-500 bg-gradient-to-br from-teal-50/50 to-white dark:from-teal-950/20 dark:to-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.tpsCount}</p>
              <p className="text-xs text-muted-foreground">Total TPS</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-800">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.occupiedTps}</p>
              <p className="text-xs text-muted-foreground">TPS Terisi</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Unassigned Saksi */}
        <motion.div variants={itemVariants}>
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
                {unassignedSaksi.length > 0 ? unassignedSaksi.map((s, i) => (
                  <motion.div
                    key={s.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm hover:bg-muted/80 transition-colors"
                    variants={rowVariants}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: i * 0.05 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {getInitials(s.name)}
                      </div>
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => { setSelectedSaksi(s); setShowAssignDialog(true) }}>
                      <Link className="h-3 w-3 mr-1" /> Assign
                    </Button>
                  </motion.div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Semua saksi sudah ditugaskan</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* TPS */}
        <motion.div variants={itemVariants}>
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
                {tpsList.length > 0 ? tpsList.map((t, i) => (
                  <motion.div
                    key={t.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg text-sm"
                    variants={rowVariants}
                    initial="hidden"
                    animate="show"
                    transition={{ delay: i * 0.05 }}
                  >
                    <div>
                      <p className="font-medium">{t.code} - {t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.address}</p>
                    </div>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 gap-1.5 shrink-0">
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {t.activeAssignmentCount} saksi
                    </Badge>
                  </motion.div>
                )) : (
                  <EmptyState icon={MapPin} title="Belum Ada TPS" description="Tambahkan TPS terlebih dahulu" />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Current Assignments */}
      <motion.div variants={itemVariants}>
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
                  {assignments.length > 0 ? assignments.map((a, i) => (
                    <motion.tr
                      key={a.id}
                      className="hover:bg-muted/50 border-b transition-colors"
                      variants={rowVariants}
                      initial="hidden"
                      animate="show"
                      transition={{ delay: i * 0.04 }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {getInitials(a.user?.name || '?')}
                          </div>
                          <div>
                            <p className="font-medium">{a.user?.name}</p>
                            <p className="text-xs text-muted-foreground">{a.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 text-emerald-700 border-emerald-200 text-xs font-medium">
                          <MapPin className="h-3 w-3 mr-1" />
                          {a.tps?.code} — {a.tps?.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(a.assignedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(a)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </motion.tr>
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
      </motion.div>

      {/* Assign Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-600" />
              Assign Saksi ke TPS
            </DialogTitle>
          </DialogHeader>
          {selectedSaksi && (
            <div className="space-y-4">
              {/* Selected Saksi Info */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                  {getInitials(selectedSaksi.name)}
                </div>
                <div>
                  <p className="font-medium">{selectedSaksi.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedSaksi.email}</p>
                </div>
              </div>

              {/* TPS Select */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Pilih TPS</label>
                <Select value={selectedTps} onValueChange={(val) => setSelectedTps(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Pilih TPS --" />
                  </SelectTrigger>
                  <SelectContent>
                    {tpsList.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.code} - {t.name} ({t.activeAssignmentCount} saksi)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* TPS Info Card */}
              {selectedTpsData && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 overflow-hidden">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 mt-0.5">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">
                            {selectedTpsData.code} — {selectedTpsData.name}
                          </p>
                          {selectedTpsData.address && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {selectedTpsData.address}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-muted-foreground">Saksi saat ini:</span>
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0">
                            {selectedTpsData.activeAssignmentCount} orang
                          </Badge>
                        </div>
                      </div>
                      {/* Mini map placeholder */}
                      <div className="h-16 rounded-md bg-gradient-to-br from-emerald-100/50 to-teal-100/50 border border-dashed border-emerald-200 flex items-center justify-center">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">
                            {selectedTpsData.latitude?.toFixed(4)}, {selectedTpsData.longitude?.toFixed(4)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

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
    </motion.div>
  )
}
