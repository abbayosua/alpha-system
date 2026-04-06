'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Camera, Upload, CheckCircle2, Loader2 } from 'lucide-react'

export default function SaksiInputPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [c1File, setC1File] = useState<File | null>(null)
  const [c1Preview, setC1Preview] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [form, setForm] = useState({
    candidate1Votes: '',
    candidate2Votes: '',
    candidate3Votes: '',
    totalInvalidVotes: '',
  })

  useEffect(() => {
    fetch('/api/votes/my')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          toast.info('Anda sudah menginput suara sebelumnya')
          setResult({ ...res.data, already: true })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 10MB')
      return
    }
    setC1File(file)
    const reader = new FileReader()
    reader.onloadend = () => setC1Preview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    const c1 = parseInt(form.candidate1Votes)
    const c2 = parseInt(form.candidate2Votes)
    const c3 = parseInt(form.candidate3Votes)
    const invalid = parseInt(form.totalInvalidVotes)

    if (isNaN(c1) || isNaN(c2) || isNaN(c3) || isNaN(invalid)) {
      toast.error('Semua kolom suara harus diisi dengan angka')
      return
    }

    if (c1 < 0 || c2 < 0 || c3 < 0 || invalid < 0) {
      toast.error('Jumlah suara tidak boleh negatif')
      return
    }

    setSubmitting(true)
    try {
      // Upload C1 photo if provided
      let c1Path: string | undefined
      if (c1File) {
        const formData = new FormData()
        formData.append('file', c1File)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        const uploadData = await uploadRes.json()
        if (uploadData.success) c1Path = uploadData.data.path
        else toast.warning('Gagal upload foto C1, melanjutkan tanpa foto')
      }

      // Submit vote data
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate1Votes: c1,
          candidate2Votes: c2,
          candidate3Votes: c3,
          totalInvalidVotes: invalid,
          c1Photo: c1Path,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.data)
        toast.success('Data suara berhasil disimpan!')
      } else {
        toast.error(data.error || 'Gagal menyimpan data suara')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  const totalValid = (parseInt(form.candidate1Votes) || 0) + (parseInt(form.candidate2Votes) || 0) + (parseInt(form.candidate3Votes) || 0)
  const totalAll = totalValid + (parseInt(form.totalInvalidVotes) || 0)

  if (loading) {
    return (
      <div className="p-4 max-w-lg mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (result?.already) {
    return (
      <div className="p-4 max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/saksi/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Input Suara</h1>
        </div>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <p className="font-semibold">Data Suara Sudah Diinput</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Total Suara: {result.totalVotes}</p>
              <p>Waktu: {new Date(result.submittedAt).toLocaleString('id-ID')}</p>
              {result.c1Photo && <Badge variant="secondary" className="bg-green-100 text-green-700">Foto C1 ✓</Badge>}
            </div>
            <Button onClick={() => router.push('/saksi/dashboard')}>Kembali ke Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (result && !result.already) {
    return (
      <div className="p-4 max-w-lg mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <p className="font-semibold text-lg">Data Suara Berhasil Disimpan!</p>
            <div className="text-sm space-y-1">
              <p>Sah: {result.totalValidVotes} | Tidak Sah: {result.totalInvalidVotes}</p>
              <p>Total: {result.totalVotes} suara</p>
            </div>
            <Button onClick={() => router.push('/saksi/dashboard')}>Kembali ke Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Input Suara</h1>
          <p className="text-sm text-muted-foreground">Masukkan hasil perhitungan suara</p>
        </div>
      </div>

      {/* Vote Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hasil Perhitungan Suara</CardTitle>
          <CardDescription>Masukkan jumlah suara untuk setiap kandidat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="candidate1Votes">Kandidat 1 - Suara</Label>
            <Input id="candidate1Votes" type="number" min="0" placeholder="0" value={form.candidate1Votes} onChange={(e) => setForm({ ...form, candidate1Votes: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="candidate2Votes">Kandidat 2 - Suara</Label>
            <Input id="candidate2Votes" type="number" min="0" placeholder="0" value={form.candidate2Votes} onChange={(e) => setForm({ ...form, candidate2Votes: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="candidate3Votes">Kandidat 3 - Suara</Label>
            <Input id="candidate3Votes" type="number" min="0" placeholder="0" value={form.candidate3Votes} onChange={(e) => setForm({ ...form, candidate3Votes: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="totalInvalidVotes">Suara Tidak Sah</Label>
            <Input id="totalInvalidVotes" type="number" min="0" placeholder="0" value={form.totalInvalidVotes} onChange={(e) => setForm({ ...form, totalInvalidVotes: e.target.value })} />
          </div>

          <div className="pt-3 border-t space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Suara Sah</span>
              <span className="font-medium">{totalValid}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Keseluruhan</span>
              <span className="font-bold">{totalAll}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* C1 Photo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Foto C1
          </CardTitle>
          <CardDescription>Upload foto formulir C1 sebagai bukti</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {c1Preview ? (
            <div className="space-y-2">
              <img src={c1Preview} alt="C1 Preview" className="w-full rounded-lg border max-h-48 object-contain bg-muted" />
              <Button variant="outline" size="sm" onClick={() => { setC1File(null); setC1Preview(null) }}>
                Ganti Foto
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Klik untuk upload foto C1</p>
              <p className="text-xs text-muted-foreground">JPG, PNG, maks 10MB</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Menyimpan...
          </>
        ) : (
          'Simpan Data Suara'
        )}
      </Button>
    </div>
  )
}
