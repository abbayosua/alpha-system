'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Search, Plus, Trash2, Edit, Loader2, MapPin, MapPinned,
  Users, Map, Vote,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

const SingleTPSMap = dynamic(() => import('@/components/maps/SingleTPSMap'), { ssr: false })
const TPSMapView = dynamic(() => import('@/components/maps/TPSMapView'), { ssr: false })

// ─── Animation Variants ───────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
}

// ─── Stat Card ────────────────────────────────────────────────────────
function TpsStatCard({
  icon,
  label,
  value,
  borderColor,
  bgColor,
  iconBg,
  index,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  borderColor: string
  bgColor: string
  iconBg: string
  index: number
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="cursor-default"
    >
      <Card
        className={`shadow-sm border-l-4 ${borderColor} ${bgColor} transition-shadow hover:shadow-md`}
      >
        <CardContent className="p-4 flex items-center gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
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

// ─── TPS Map Inline ──────────────────────────────────────────────────
function TPSInlineMap({ tpsList }: { tpsList: any[] }) {
  const mapData = tpsList.map((t) => ({
    id: t.id,
    name: t.name,
    code: t.code,
    latitude: t.latitude,
    longitude: t.longitude,
    address: t.address,
    activeAssignmentCount: t.activeAssignmentCount || 0,
    status: (t.activeAssignmentCount && t.activeAssignmentCount > 0) ? 'active' as const : 'inactive' as const,
  }))
  return <TPSMapView tpsData={mapData} height="350px" />
}

// ═════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════
export default function AdminTpsPage() {
  const router = useRouter()
  const [tpsList, setTpsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTps, setEditingTps] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [form, setForm] = useState({
    code: '',
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    kelurahan: '',
    kecamatan: '',
    kota: '',
    province: '',
    totalDpt: '',
  })

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  const fetchTps = useCallback(() => {
    setLoading(true)
    fetch(`/api/tps?search=${encodeURIComponent(debouncedSearch)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((res) => {
        if (res.success) setTpsList(res.data)
        else toast.error(res.error)
      })
      .catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [debouncedSearch])

  useEffect(() => {
    fetchTps()
  }, [fetchTps])

  // ── Derived Stats ────────────────────────────────────────
  const stats = useMemo(() => {
    const total = tpsList.length
    const aktif = tpsList.filter((t) => (t.activeAssignmentCount ?? 0) > 0).length
    const totalDpt = tpsList.reduce((sum, t) => sum + (t.totalDpt || 0), 0)
    return { total, aktif, totalDpt }
  }, [tpsList])

  const resetForm = () => {
    setForm({ code: '', name: '', address: '', latitude: '', longitude: '', kelurahan: '', kecamatan: '', kota: '', province: '', totalDpt: '' })
    setEditingTps(null)
  }

  const openEdit = (tps: any) => {
    setForm({
      code: tps.code,
      name: tps.name,
      address: tps.address,
      latitude: String(tps.latitude),
      longitude: String(tps.longitude),
      kelurahan: tps.kelurahan || '',
      kecamatan: tps.kecamatan || '',
      kota: tps.kota || '',
      province: tps.province || '',
      totalDpt: String(tps.totalDpt),
    })
    setEditingTps(tps)
    setShowAddDialog(true)
  }

  const handleSave = async () => {
    if (!form.code || !form.name || !form.address || !form.latitude || !form.longitude) {
      toast.error('Kode, nama, alamat, latitude, dan longitude wajib diisi')
      return
    }
    setSaving(true)
    try {
      const url = editingTps ? `/api/tps/${editingTps.id}` : '/api/tps'
      const method = editingTps ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(editingTps ? 'TPS berhasil diperbarui' : 'TPS berhasil ditambahkan')
        setShowAddDialog(false)
        resetForm()
        fetchTps()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/tps/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('TPS berhasil dihapus')
        setDeleteTarget(null)
        fetchTps()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Gagal menghapus TPS')
    } finally {
      setDeleteLoading(false)
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
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="-ml-2" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">Kelola TPS</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Daftar Tempat Pemungutan Suara</p>
            </div>
          </div>
          <Button onClick={() => { resetForm(); setShowAddDialog(true) }}>
            <Plus className="h-4 w-4 mr-2" /> Tambah TPS
          </Button>
        </div>
      </motion.div>

      {/* ── Stat Cards ─────────────────────────────────────── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.1 }}
      >
        <TpsStatCard
          icon={<Map className="h-5 w-5 text-emerald-600" />}
          label="Total TPS"
          value={stats.total}
          borderColor="border-l-emerald-500"
          bgColor="bg-gradient-to-br from-emerald-50/50 to-white"
          iconBg="bg-emerald-100"
          index={0}
        />
        <TpsStatCard
          icon={<Users className="h-5 w-5 text-teal-600" />}
          label="TPS Aktif (dengan Saksi)"
          value={stats.aktif}
          borderColor="border-l-teal-500"
          bgColor="bg-gradient-to-br from-teal-50/50 to-white"
          iconBg="bg-teal-100"
          index={1}
        />
        <TpsStatCard
          icon={<Vote className="h-5 w-5 text-amber-600" />}
          label="Total DPT"
          value={stats.totalDpt.toLocaleString('id-ID')}
          borderColor="border-l-amber-500"
          bgColor="bg-gradient-to-br from-amber-50/50 to-white"
          iconBg="bg-amber-100"
          index={2}
        />
      </motion.div>

      {/* ── Search ─────────────────────────────────────────── */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari kode, nama, atau alamat TPS..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        {debouncedSearch && search !== debouncedSearch && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </motion.div>

      {/* ── TPS Map Overview ───────────────────────────────── */}
      {!loading && tpsList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Peta Sebaran TPS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TPSInlineMap tpsList={tpsList} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── TPS Table ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="shadow-sm">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : tpsList.length === 0 ? (
              <EmptyState
                icon={MapPinned}
                title={debouncedSearch ? 'Tidak Ada Hasil' : 'Belum Ada TPS'}
                description={debouncedSearch ? `Tidak ditemukan TPS untuk "${debouncedSearch}"` : 'Tambahkan TPS baru untuk memulai plotting'}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Kode</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Alamat</TableHead>
                      <TableHead>Wilayah</TableHead>
                      <TableHead>DPT</TableHead>
                      <TableHead>Saksi</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tpsList.map((t, i) => {
                      const isActive = (t.activeAssignmentCount ?? 0) > 0
                      return (
                        <motion.tr
                          key={t.id}
                          className={`hover:bg-muted/50 border-b transition-colors border-l-4 ${
                            isActive ? 'border-l-emerald-400' : 'border-l-gray-300'
                          }`}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{ delay: i * 0.04 }}
                          whileHover={{ backgroundColor: 'rgba(241, 245, 249, 0.8)' }}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {t.code?.charAt(0) || 'T'}
                              </div>
                              <span className="font-medium">{t.code}</span>
                            </div>
                          </TableCell>
                          <TableCell>{t.name}</TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">{t.address}</TableCell>
                          <TableCell className="text-sm">
                            {[t.kelurahan, t.kecamatan].filter(Boolean).join(', ')}
                          </TableCell>
                          <TableCell>{t.totalDpt?.toLocaleString('id-ID')}</TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={
                                isActive
                                  ? 'bg-emerald-100 text-emerald-700 gap-1.5'
                                  : 'bg-gray-100 text-gray-600'
                              }
                            >
                              <span
                                className={`inline-flex h-1.5 w-1.5 rounded-full ${
                                  isActive ? 'bg-emerald-500' : 'bg-gray-400'
                                }`}
                              />
                              {t.activeAssignmentCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                                <Edit className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(t)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Add/Edit Dialog ────────────────────────────────── */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTps ? 'Edit TPS' : 'Tambah TPS Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium">Kode TPS *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="TPS-001" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium">Nama TPS *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama TPS" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-medium">Alamat *</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Alamat lengkap" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium">Latitude *</Label>
                <Input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-6.200000" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium">Longitude *</Label>
                <Input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="106.800000" />
              </div>
            </div>

            {form.latitude && form.longitude && !isNaN(Number(form.latitude)) && !isNaN(Number(form.longitude)) && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Pratinjau Lokasi</Label>
                <SingleTPSMap
                  latitude={Number(form.latitude)}
                  longitude={Number(form.longitude)}
                  name={form.name || 'TPS Baru'}
                  code={form.code}
                  height="200px"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium">Kelurahan</Label>
                <Input value={form.kelurahan} onChange={(e) => setForm({ ...form, kelurahan: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium">Kecamatan</Label>
                <Input value={form.kecamatan} onChange={(e) => setForm({ ...form, kecamatan: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium">Kota/Kabupaten</Label>
                <Input value={form.kota} onChange={(e) => setForm({ ...form, kota: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-medium">Provinsi</Label>
                <Input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground font-medium">Total DPT</Label>
              <Input type="number" value={form.totalDpt} onChange={(e) => setForm({ ...form, totalDpt: e.target.value })} placeholder="0" />
            </div>
            <Button
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : editingTps ? (
                'Simpan Perubahan'
              ) : (
                'Tambah TPS'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation ────────────────────────────── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Hapus TPS"
        description={`Apakah Anda yakin ingin menghapus TPS "${deleteTarget?.code} - ${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleDelete}
        loading={deleteLoading}
      />
    </div>
  )
}
