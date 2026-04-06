'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Camera,
  Upload,
  CheckCircle2,
  Loader2,
  PenLine,
  X,
  ImagePlus,
  BarChart3,
  Vote,
  Calculator,
  TrendingUp,
  PartyPopper,
  Clock,
  ShieldCheck,
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

const candidateColors = [
  {
    border: 'border-l-emerald-500',
    bg: 'from-emerald-50/50 to-white',
    badge: 'bg-emerald-100 text-emerald-700',
    inputRing: 'focus:ring-emerald-300',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  {
    border: 'border-l-teal-500',
    bg: 'from-teal-50/50 to-white',
    badge: 'bg-teal-100 text-teal-700',
    inputRing: 'focus:ring-teal-300',
    gradient: 'from-teal-500 to-teal-600',
  },
  {
    border: 'border-l-amber-500',
    bg: 'from-amber-50/50 to-white',
    badge: 'bg-amber-100 text-amber-700',
    inputRing: 'focus:ring-amber-300',
    gradient: 'from-amber-500 to-amber-600',
  },
]

export default function SaksiInputPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [c1File, setC1File] = useState<File | null>(null)
  const [c1Preview, setC1Preview] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [dragOver, setDragOver] = useState(false)
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Hanya file gambar yang diperbolehkan')
      return
    }
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
      let c1Path: string | undefined
      if (c1File) {
        const formData = new FormData()
        formData.append('file', c1File)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        const uploadData = await uploadRes.json()
        if (uploadData.success) c1Path = uploadData.data.path
        else toast.warning('Gagal upload foto C1, melanjutkan tanpa foto')
      }

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

  const hasAnyVote = totalAll > 0

  if (loading) {
    return (
      <div className="p-4 max-w-lg mx-auto space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    )
  }

  // Already submitted state
  if (result?.already) {
    return (
      <motion.div
        className="p-4 max-w-lg mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={itemVariants}
          className="relative rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-transparent p-6 sm:p-8 overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-emerald-100/60" />
          <div className="absolute bottom-0 left-1/3 w-20 h-20 rounded-full bg-teal-100/40" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-1">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/60 hover:bg-white/80 -ml-2"
                onClick={() => router.push('/saksi/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200">
                <PenLine className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold">Input Suara</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-11">Masukkan hasil perhitungan suara</p>
          </div>
        </motion.div>

        <motion.div variants={scaleVariants}>
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white overflow-hidden relative">
            {/* Confetti-like decorative elements */}
            <motion.div
              className="absolute top-4 right-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <div className="p-2 rounded-full bg-amber-100">
                <PartyPopper className="h-5 w-5 text-amber-600" />
              </div>
            </motion.div>
            <motion.div
              className="absolute top-16 right-16"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </motion.div>
            <motion.div
              className="absolute bottom-16 right-8"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
            >
              <div className="w-2 h-2 rounded-full bg-teal-400" />
            </motion.div>
            <motion.div
              className="absolute top-20 left-6"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            </motion.div>

            <CardContent className="p-6 sm:p-8 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-200"
              >
                <CheckCircle2 className="h-10 w-10 text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-bold text-emerald-900">Data Suara Sudah Diinput</h2>
                <p className="text-sm text-muted-foreground mt-1">Penghitungan suara Anda telah tersimpan</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/70 rounded-xl p-4 space-y-3 border border-emerald-100"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50/80 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Total Suara</p>
                    <p className="text-2xl font-bold text-emerald-700">{result.totalVotes}</p>
                  </div>
                  <div className="bg-teal-50/80 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Suara Sah</p>
                    <p className="text-2xl font-bold text-teal-700">{result.totalValidVotes}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{new Date(result.submittedAt).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</span>
                </div>
                {result.c1Photo && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                    <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                    Foto C1 Terlampir
                  </Badge>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200"
                  onClick={() => router.push('/saksi/dashboard')}
                >
                  Kembali ke Dashboard
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  // Just submitted success state
  if (result && !result.already) {
    return (
      <motion.div
        className="p-4 max-w-lg mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={itemVariants}
          className="relative rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-transparent p-6 sm:p-8 overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-emerald-100/60" />
          <div className="absolute bottom-0 left-1/3 w-20 h-20 rounded-full bg-teal-100/40" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-1">
              <Button
                variant="ghost"
                size="icon"
                className="bg-white/60 hover:bg-white/80 -ml-2"
                onClick={() => router.push('/saksi/dashboard')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200">
                <PenLine className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold">Input Suara</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-11">Masukkan hasil perhitungan suara</p>
          </div>
        </motion.div>

        <motion.div variants={scaleVariants}>
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white overflow-hidden relative">
            <motion.div
              className="absolute top-4 right-4"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            >
              <div className="p-2 rounded-full bg-emerald-100">
                <Vote className="h-5 w-5 text-emerald-600" />
              </div>
            </motion.div>
            <motion.div
              className="absolute top-14 right-14"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            >
              <div className="w-3 h-3 rounded-full bg-teal-400" />
            </motion.div>
            <motion.div
              className="absolute bottom-12 right-10"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-300" />
            </motion.div>

            <CardContent className="p-6 sm:p-8 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-200"
              >
                <CheckCircle2 className="h-10 w-10 text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-bold text-emerald-900">Data Suara Berhasil Disimpan!</h2>
                <p className="text-sm text-muted-foreground mt-1">Terima kasih atas kontribusi Anda</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/70 rounded-xl p-4 space-y-3 border border-emerald-100"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50/80 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Suara Sah</p>
                    <p className="text-2xl font-bold text-emerald-700">{result.totalValidVotes}</p>
                  </div>
                  <div className="bg-amber-50/80 rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Tidak Sah</p>
                    <p className="text-2xl font-bold text-amber-700">{result.totalInvalidVotes}</p>
                  </div>
                </div>
                <div className="bg-teal-50/80 rounded-lg p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Keseluruhan</p>
                  <p className="text-3xl font-bold text-teal-700">{result.totalVotes}</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200"
                  onClick={() => router.push('/saksi/dashboard')}
                >
                  Kembali ke Dashboard
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
        className="relative rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-transparent p-6 sm:p-8 overflow-hidden"
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-emerald-100/60" />
        <div className="absolute bottom-0 left-1/3 w-20 h-20 rounded-full bg-teal-100/40" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <Button
              variant="ghost"
              size="icon"
              className="bg-white/60 hover:bg-white/80 -ml-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200">
              <PenLine className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold">Input Suara</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-11">Masukkan hasil perhitungan suara dari TPS Anda</p>
        </div>
      </motion.div>

      {/* Vote Input Cards */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100">
                <BarChart3 className="h-4 w-4 text-emerald-700" />
              </div>
              Hasil Perhitungan Suara
            </CardTitle>
            <CardDescription>Masukkan jumlah suara untuk setiap kandidat</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {/* Candidate 1 */}
            <motion.div
              whileFocus={{ scale: 1.01 }}
              className={`border-l-4 ${candidateColors[0].border} bg-gradient-to-br ${candidateColors[0].bg} rounded-lg overflow-hidden`}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-emerald-700">1</span>
                  </div>
                  <Label className="text-sm font-medium text-emerald-800">Kandidat 1</Label>
                </div>
                <Input
                  id="candidate1Votes"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.candidate1Votes}
                  onChange={(e) => setForm({ ...form, candidate1Votes: e.target.value })}
                  className={`text-2xl font-bold text-center h-14 border-emerald-200 focus:border-emerald-400 ${candidateColors[0].inputRing} bg-white/80`}
                />
              </div>
            </motion.div>

            {/* Candidate 2 */}
            <motion.div
              whileFocus={{ scale: 1.01 }}
              className={`border-l-4 ${candidateColors[1].border} bg-gradient-to-br ${candidateColors[1].bg} rounded-lg overflow-hidden`}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-teal-700">2</span>
                  </div>
                  <Label className="text-sm font-medium text-teal-800">Kandidat 2</Label>
                </div>
                <Input
                  id="candidate2Votes"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.candidate2Votes}
                  onChange={(e) => setForm({ ...form, candidate2Votes: e.target.value })}
                  className={`text-2xl font-bold text-center h-14 border-teal-200 focus:border-teal-400 ${candidateColors[1].inputRing} bg-white/80`}
                />
              </div>
            </motion.div>

            {/* Candidate 3 */}
            <motion.div
              whileFocus={{ scale: 1.01 }}
              className={`border-l-4 ${candidateColors[2].border} bg-gradient-to-br ${candidateColors[2].bg} rounded-lg overflow-hidden`}
            >
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-amber-700">3</span>
                  </div>
                  <Label className="text-sm font-medium text-amber-800">Kandidat 3</Label>
                </div>
                <Input
                  id="candidate3Votes"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.candidate3Votes}
                  onChange={(e) => setForm({ ...form, candidate3Votes: e.target.value })}
                  className={`text-2xl font-bold text-center h-14 border-amber-200 focus:border-amber-400 ${candidateColors[2].inputRing} bg-white/80`}
                />
              </div>
            </motion.div>

            {/* Invalid votes */}
            <motion.div whileFocus={{ scale: 1.01 }}>
              <div className="border-l-4 border-l-rose-300 bg-gradient-to-br from-rose-50/30 to-white rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-rose-700">✕</span>
                  </div>
                  <Label className="text-sm font-medium text-rose-800">Suara Tidak Sah</Label>
                </div>
                <Input
                  id="totalInvalidVotes"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={form.totalInvalidVotes}
                  onChange={(e) => setForm({ ...form, totalInvalidVotes: e.target.value })}
                  className="text-2xl font-bold text-center h-14 border-rose-200 focus:border-rose-400 focus:ring-rose-300 bg-white/80"
                />
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Total Suara Sah - Animated Counter Preview */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden border-0 shadow-lg shadow-emerald-100">
          <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700 p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-white/20">
                <Calculator className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-medium text-white/80">Total Suara Sah</h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                <p className="text-xs text-white/60 mb-0.5">Kandidat 1</p>
                <motion.p
                  key={form.candidate1Votes || '0'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-xl font-bold"
                >
                  {form.candidate1Votes || '0'}
                </motion.p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                <p className="text-xs text-white/60 mb-0.5">Kandidat 2</p>
                <motion.p
                  key={form.candidate2Votes || '0'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-xl font-bold"
                >
                  {form.candidate2Votes || '0'}
                </motion.p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 text-center">
                <p className="text-xs text-white/60 mb-0.5">Kandidat 3</p>
                <motion.p
                  key={form.candidate3Votes || '0'}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-xl font-bold"
                >
                  {form.candidate3Votes || '0'}
                </motion.p>
              </div>
            </div>

            <Separator className="my-3 bg-white/20" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-white/70" />
                <span className="text-sm text-white/70">Total Keseluruhan</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={totalAll}
                  initial={{ scale: 0.8, opacity: 0, y: 5 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className={`text-3xl font-bold ${hasAnyVote ? 'text-yellow-200' : 'text-white/90'}`}
                >
                  {totalAll.toLocaleString('id-ID')}
                </motion.span>
              </AnimatePresence>
            </div>

            {hasAnyVote && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 flex items-center gap-1.5 text-xs text-white/60"
              >
                <span>• Sah: {totalValid}</span>
                <span>• Tidak Sah: {parseInt(form.totalInvalidVotes) || 0}</span>
              </motion.div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* C1 Photo Upload */}
      <motion.div variants={itemVariants}>
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50 pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-100">
                <Camera className="h-4 w-4 text-teal-700" />
              </div>
              Foto Formulir C1
            </CardTitle>
            <CardDescription>Upload foto formulir C1 sebagai bukti perhitungan</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {c1Preview ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group rounded-lg overflow-hidden border border-emerald-200"
              >
                <img
                  src={c1Preview}
                  alt="C1 Preview"
                  className="w-full max-h-64 object-contain bg-muted/50"
                />
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 hover:bg-white text-slate-800 flex-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus className="h-4 w-4 mr-1" />
                      Ganti
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="bg-rose-500/90 hover:bg-rose-600 flex-1"
                      onClick={() => { setC1File(null); setC1Preview(null) }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Hapus
                    </Button>
                  </div>
                </div>
                <Badge className="absolute top-2 right-2 bg-emerald-500/90 text-white border-0">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {c1File?.name || 'Preview'}
                </Badge>
              </motion.div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  dragOver
                    ? 'border-emerald-400 bg-emerald-50/80 scale-[1.02]'
                    : 'border-muted-foreground/25 hover:border-emerald-300 hover:bg-emerald-50/30'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <motion.div
                  className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-3"
                  animate={dragOver ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <Upload className="h-7 w-7 text-emerald-600" />
                </motion.div>
                <p className="text-sm font-medium text-slate-700">Klik atau seret foto ke sini</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, maks 10MB</p>
              </motion.div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Submit Button */}
      <motion.div variants={itemVariants}>
        <Button
          className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200 transition-all duration-200"
          size="lg"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Menyimpan Data Suara...
            </>
          ) : (
            <>
              <Vote className="h-5 w-5 mr-2" />
              Simpan Data Suara
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  )
}
