'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Upload, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react'

const CATEGORIES = [
  { value: 'SUARA_SILUMAN', label: 'Suara Siluman' },
  { value: 'PENGHITUNGAN_ULANG', label: 'Penghitungan Ulang' },
  { value: 'DOKUMEN_PALSU', label: 'Dokumen Palsu' },
  { value: 'INTIMIDASI', label: 'Intimidasi' },
  { value: 'MONEY_POLITICS', label: 'Politik Uang' },
  { value: 'PELANGGARAN_PROTOKOL', label: 'Pelanggaran Protokol' },
  { value: 'LAINNYA', label: 'Lainnya' },
]

export default function SaksiLaporPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'LAINNYA',
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Ukuran video maksimal 50MB')
      return
    }
    if (!file.type.startsWith('video/')) {
      toast.error('Hanya file video yang diperbolehkan')
      return
    }
    setVideoFile(file)
    toast.success('Video dipilih')
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      toast.error('Judul laporan harus diisi')
      return
    }
    if (!form.description.trim()) {
      toast.error('Deskripsi laporan harus diisi')
      return
    }

    setSubmitting(true)
    try {
      let videoPath: string | undefined
      if (videoFile) {
        const formData = new FormData()
        formData.append('file', videoFile)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        const uploadData = await uploadRes.json()
        if (uploadData.success) videoPath = uploadData.data.path
        else toast.warning('Gagal upload video, melanjutkan tanpa video')
      }

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          category: form.category,
          videoPath,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.data)
        toast.success('Laporan berhasil dikirim!')
      } else {
        toast.error(data.error || 'Gagal mengirim laporan')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="p-4 max-w-lg mx-auto space-y-6">
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
            <p className="font-semibold text-lg">Laporan Terkirim!</p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>{result.title}</p>
              <p className="flex items-center justify-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Status: {result.status.replace(/_/g, ' ')}
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => { setResult(null); setForm({ title: '', description: '', category: 'LAINNYA' }); setVideoFile(null) }}>
                Buat Laporan Lagi
              </Button>
              <Button variant="outline" onClick={() => router.push('/saksi/dashboard')}>
                Dashboard
              </Button>
            </div>
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
          <h1 className="text-2xl font-bold">Lapor Kecurangan</h1>
          <p className="text-sm text-muted-foreground">Laporkan dugaan kecurangan pemilu</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detail Laporan</CardTitle>
          <CardDescription>Isi informasi kecurangan yang Anda temui</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Judul *</Label>
            <Input id="title" placeholder="Judul singkat kecurangan" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi *</Label>
            <Textarea
              id="description"
              placeholder="Jelaskan detail kecurangan yang Anda temui..."
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Video Bukti (Opsional)
          </CardTitle>
          <CardDescription>Upload video sebagai bukti kecurangan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {videoFile ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="secondary">{videoFile.name}</Badge>
                <span className="text-muted-foreground">{(videoFile.size / 1024 / 1024).toFixed(1)}MB</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setVideoFile(null)}>Ganti Video</Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Klik untuk upload video</p>
              <p className="text-xs text-muted-foreground">MP4, WebM, maks 50MB</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting}>
        {submitting ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Mengirim...</>
        ) : (
          'Kirim Laporan'
        )}
      </Button>
    </div>
  )
}
