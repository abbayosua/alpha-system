'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Video,
  X,
  Users,
  RefreshCw,
  FileX,
  ShieldAlert,
  Banknote,
  AlertOctagon,
  HelpCircle,
  Send,
  Clock,
  Tag,
  Eye,
  XCircle,
  Inbox,
  History,
  FileBarChart,
} from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

const scaleVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

const CATEGORIES = [
  { value: 'SUARA_SILUMAN', label: 'Suara Siluman', icon: Users, color: 'bg-rose-100 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  { value: 'PENGHITUNGAN_ULANG', label: 'Penghitungan Ulang', icon: RefreshCw, color: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800', dot: 'bg-amber-500' },
  { value: 'DOKUMEN_PALSU', label: 'Dokumen Palsu', icon: FileX, color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  { value: 'INTIMIDASI', label: 'Intimidasi', icon: ShieldAlert, color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
  { value: 'MONEY_POLITICS', label: 'Politik Uang', icon: Banknote, color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800', dot: 'bg-emerald-500' },
  { value: 'PELANGGARAN_PROTOKOL', label: 'Pelanggaran Protokol', icon: AlertOctagon, color: 'bg-amber-100 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800', dot: 'bg-amber-600' },
  { value: 'LAINNYA', label: 'Lainnya', icon: HelpCircle, color: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-500' },
]

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Menunggu', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  UNDER_REVIEW: { label: 'Ditinjau', color: 'bg-teal-100 text-teal-700 border-teal-200', icon: Eye },
  VERIFIED: { label: 'Terverifikasi', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  DISMISSED: { label: 'Ditolak', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: XCircle },
}

export default function SaksiLaporPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [submitting, setSubmitting] = useState(false)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [result, setResult] = useState<any>(null)
  const [dragOver, setDragOver] = useState(false)
  const [previousReports, setPreviousReports] = useState<any[]>([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'LAINNYA',
  })

  useEffect(() => {
    fetch('/api/reports/my')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) setPreviousReports(Array.isArray(res.data) ? res.data : [])
      })
      .catch(() => {})
      .finally(() => setReportsLoading(false))
  }, [])

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      toast.error('Hanya file video yang diperbolehkan')
      return
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Ukuran video maksimal 50MB')
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

  const selectedCategory = CATEGORIES.find((c) => c.value === form.category)

  // Success state
  if (result) {
    return (
      <motion.div
        className="p-4 max-w-lg mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={itemVariants}
          className="relative rounded-xl bg-gradient-to-br from-rose-50 via-amber-50/60 to-transparent p-6 sm:p-8 overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-rose-100/60" />
          <div className="absolute bottom-0 left-1/3 w-20 h-20 rounded-full bg-amber-100/40" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-1">
              <Button variant="ghost" size="icon" className="bg-white/60 hover:bg-white/80 -ml-2" onClick={() => router.push('/saksi/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 text-white shadow-lg shadow-rose-200">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold text-rose-900">Lapor Kecurangan</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-11">Laporkan dugaan kecurangan pemilu</p>
          </div>
        </motion.div>

        <motion.div variants={scaleVariants}>
          <Card className="border-rose-200 bg-gradient-to-br from-rose-50/80 via-amber-50/40 to-white overflow-hidden relative">
            <motion.div className="absolute top-4 right-4" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}>
              <div className="p-2 rounded-full bg-rose-100"><Send className="h-5 w-5 text-rose-600" /></div>
            </motion.div>
            <motion.div className="absolute top-14 right-14" initial={{ scale: 0, rotate: 180 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}>
              <div className="w-3 h-3 rounded-full bg-amber-400" />
            </motion.div>
            <motion.div className="absolute bottom-12 right-10" initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}>
              <div className="w-2 h-2 rounded-full bg-rose-400" />
            </motion.div>

            <CardContent className="p-6 sm:p-8 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-200 dark:shadow-emerald-900/20"
              >
                <CheckCircle2 className="h-10 w-10 text-white" />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h2 className="text-xl font-bold text-rose-900">Laporan Terkirim!</h2>
                <p className="text-sm text-muted-foreground mt-1">Laporan Anda akan segera ditinjau oleh admin</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white/70 dark:bg-slate-700/70 rounded-xl p-4 space-y-3 border border-rose-100">
                <div className="bg-rose-50/80 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Judul Laporan</p>
                  <p className="font-semibold text-rose-900">{result.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-amber-50/80 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50">
                      <Clock className="h-3 w-3 mr-1" />
                      {result.status.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div className="bg-slate-50/80 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground mb-1">Kategori</p>
                    <Badge variant="secondary">
                      <Tag className="h-3 w-3 mr-1" />
                      {result.category.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex gap-3">
                <Button
                  className="flex-1 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white shadow-lg shadow-rose-200"
                  onClick={() => {
                    setResult(null)
                    setForm({ title: '', description: '', category: 'LAINNYA' })
                    setVideoFile(null)
                  }}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Buat Laporan Lagi
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => router.push('/saksi/dashboard')}>
                  Dashboard
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  // Main form
  return (
    <motion.div
      className="p-4 max-w-lg mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Gradient Title Area */}
      <motion.div
        variants={itemVariants}
        className="relative rounded-xl bg-gradient-to-br from-rose-50 via-amber-50/60 to-transparent p-6 sm:p-8 overflow-hidden"
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-rose-100/60" />
        <div className="absolute bottom-0 left-1/3 w-20 h-20 rounded-full bg-amber-100/40" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <Button variant="ghost" size="icon" className="bg-white/60 hover:bg-white/80 -ml-2" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-amber-600 text-white shadow-lg shadow-rose-200">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-rose-900">Lapor Kecurangan</h1>
              <p className="text-sm text-muted-foreground">Laporkan dugaan kecurangan pemilu yang Anda temui</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Previous Reports Summary */}
      {previousReports.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden border-l-4 border-l-amber-400">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50/50 pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-100">
                  <History className="h-4 w-4 text-amber-700" />
                </div>
                Riwayat Laporan
                <Badge className="bg-amber-500 text-white border-0 text-xs ml-auto">
                  {previousReports.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {previousReports.map((report: any, index: number) => {
                  const status = statusConfig[report.status] || statusConfig.PENDING
                  const StatusIcon = status.icon
                  const cat = CATEGORIES.find(c => c.value === report.category)
                  return (
                    <motion.div
                      key={report.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        toast.info(`Laporan: ${report.title}`)
                      }}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cat?.color?.split(' ').slice(0, 2).join(' ') || 'bg-slate-100'}`}>
                        {cat ? <cat.icon className="h-3.5 w-3.5" /> : <FileBarChart className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{report.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(report.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <Badge className={`${status.color} text-[10px] border flex items-center gap-1 flex-shrink-0`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Detail Laporan Card */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-100">
                <AlertTriangle className="h-4 w-4 text-rose-700" />
              </div>
              Detail Laporan
            </CardTitle>
            <CardDescription>Isi informasi kecurangan yang Anda temui</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-5">
            {/* Category Selection - Visual Cards */}
            <div className="space-y-2.5">
              <Label htmlFor="category" className="text-sm font-medium flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                Kategori Pelanggaran
              </Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="border-rose-200 focus:ring-rose-300 focus:border-rose-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <div className="flex items-center gap-2">
                        <c.icon className="h-4 w-4 text-muted-foreground" />
                        {c.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Visual Category Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  const isSelected = form.category === cat.value
                  return (
                    <motion.button
                      key={cat.value}
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setForm({ ...form, category: cat.value })}
                      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? cat.color + ' shadow-sm'
                          : 'border-transparent bg-muted/50 hover:bg-muted/80'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </motion.div>
                      )}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-current/10' : 'bg-muted'
                      }`}>
                        <Icon className={`h-4 w-4 ${isSelected ? 'currentColor' : 'text-muted-foreground'}`} />
                      </div>
                      <span className={`text-[10px] font-medium text-center leading-tight ${isSelected ? 'text-current' : 'text-muted-foreground'}`}>
                        {cat.label}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>

            <Separator />

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium flex items-center gap-1.5">
                Judul Laporan <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Judul singkat kecurangan yang ditemui"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border-rose-200 focus:ring-rose-300 focus:border-rose-400 h-11"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium flex items-center gap-1.5">
                Deskripsi Laporan <span className="text-rose-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Jelaskan secara detail kecurangan yang Anda temui, termasuk waktu, tempat, dan pihak terkait..."
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="border-rose-200 focus:ring-rose-300 focus:border-rose-400 resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {form.description.length} karakter
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Video Upload */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <Video className="h-4 w-4 text-amber-700" />
              </div>
              Video Bukti
              <Badge variant="secondary" className="ml-auto text-xs">Opsional</Badge>
            </CardTitle>
            <CardDescription>Upload video sebagai bukti kecurangan</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {videoFile ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-amber-50/50 to-white rounded-xl p-4 border border-amber-200 dark:border-amber-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{videoFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(videoFile.size / 1024 / 1024).toFixed(1)}MB
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50" onClick={() => setVideoFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Video siap upload
                  </Badge>
                </div>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  dragOver
                    ? 'border-amber-400 bg-amber-50/80 scale-[1.02]'
                    : 'border-muted-foreground/25 hover:border-amber-300 hover:bg-amber-50/30'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <motion.div
                  className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-3"
                  animate={dragOver ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Video className="h-7 w-7 text-amber-600" />
                </motion.div>
                <p className="text-sm font-medium text-slate-700">{dragOver ? 'Lepaskan video di sini' : 'Klik atau seret video ke sini'}</p>
                <p className="text-xs text-muted-foreground mt-1">MP4, WebM, maks 50MB</p>
              </motion.div>
            )}
            <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Selected Category Summary */}
      {selectedCategory && (
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/60 border border-rose-100"
        >
          <div className={`p-2 rounded-lg ${selectedCategory.color.split(' ').slice(0, 2).join(' ')}`}>
            <selectedCategory.icon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Kategori Terpilih</p>
            <p className="text-sm font-medium">{selectedCategory.label}</p>
          </div>
          <Badge className="bg-rose-100 text-rose-700 border-0 text-[10px]">
            Terpilih
          </Badge>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.div variants={itemVariants}>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="w-full h-12 text-base bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white shadow-lg shadow-rose-200 transition-all duration-200"
            size="lg"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Mengirim Laporan...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Kirim Laporan
              </>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
