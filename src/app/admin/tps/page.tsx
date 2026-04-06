'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { ArrowLeft, Search, Plus, Trash2, Edit, Loader2, MapPin } from 'lucide-react'
import dynamic from 'next/dynamic'

const SingleTPSMap = dynamic(() => import('@/components/maps/SingleTPSMap'), { ssr: false })
const TPSMapView = dynamic(() => import('@/components/maps/TPSMapView'), { ssr: false })

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

export default function AdminTpsPage() {
  const router = useRouter()
  const [tpsList, setTpsList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingTps, setEditingTps] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
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

  const fetchTps = () => {
    setLoading(true)
    fetch(`/api/tps?search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setTpsList(res.data)
      })
      .catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTps()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => fetchTps(), 500)
    return () => clearTimeout(timer)
  }, [search])

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

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus TPS ini?')) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/tps/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('TPS berhasil dihapus')
        fetchTps()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Gagal menghapus TPS')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Kelola TPS</h1>
          <p className="text-sm text-muted-foreground">Daftar Tempat Pemungutan Suara</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddDialog(true) }}>
          <Plus className="h-4 w-4 mr-2" /> Tambah TPS
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Cari kode, nama, atau alamat TPS..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* TPS Map Overview */}
      {tpsList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Peta Sebaran TPS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TPSInlineMap tpsList={tpsList} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : tpsList.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">Tidak ada TPS ditemukan</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
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
                  {tpsList.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.code}</TableCell>
                      <TableCell>{t.name}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{t.address}</TableCell>
                      <TableCell className="text-sm">
                        {[t.kelurahan, t.kecamatan].filter(Boolean).join(', ')}
                      </TableCell>
                      <TableCell>{t.totalDpt?.toLocaleString('id-ID')}</TableCell>
                      <TableCell>
                        <Badge variant={t.activeAssignmentCount > 0 ? 'default' : 'secondary'}>
                          {t.activeAssignmentCount}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)} disabled={deleting === t.id}>
                            {deleting === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
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

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => { setShowAddDialog(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTps ? 'Edit TPS' : 'Tambah TPS Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kode TPS *</Label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="TPS-001" />
              </div>
              <div className="space-y-2">
                <Label>Nama TPS *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama TPS" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Alamat *</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Alamat lengkap" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Latitude *</Label>
                <Input type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="-6.200000" />
              </div>
              <div className="space-y-2">
                <Label>Longitude *</Label>
                <Input type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="106.800000" />
              </div>
            </div>

            {/* Map Preview */}
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
                <Label>Kelurahan</Label>
                <Input value={form.kelurahan} onChange={(e) => setForm({ ...form, kelurahan: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Kecamatan</Label>
                <Input value={form.kecamatan} onChange={(e) => setForm({ ...form, kecamatan: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kota/Kabupaten</Label>
                <Input value={form.kota} onChange={(e) => setForm({ ...form, kota: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Provinsi</Label>
                <Input value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Total DPT</Label>
              <Input type="number" value={form.totalDpt} onChange={(e) => setForm({ ...form, totalDpt: e.target.value })} placeholder="0" />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Menyimpan...</> : editingTps ? 'Simpan Perubahan' : 'Tambah TPS'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
