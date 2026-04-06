'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Camera, MapPin, CheckCircle2, Loader2, Map, Shield, Clock, ClipboardCheck, Vote, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'

const CheckInMap = dynamic(() => import('@/components/maps/CheckInMap'), { ssr: false })

/* ─── Animation Variants ─── */
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

/* ─── Animated Status Dot ─── */
function StatusDot({ color = 'amber' }: { color?: 'emerald' | 'amber' | 'rose' }) {
  const colorMap = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
  }
  const ringMap = {
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    rose: 'bg-rose-400',
  }
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className={`absolute inline-flex h-full w-full rounded-full ${ringMap[color]} opacity-75 animate-ping`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colorMap[color]}`} />
    </span>
  )
}

/* ─── Check-in Progress Timeline ─── */
function CheckInTimeline({ hasMorningCheckin }: { hasMorningCheckin: boolean }) {
  const timelineSteps = [
    { label: 'Check-in Pagi', icon: MapPin, route: '/saksi/check-in', status: hasMorningCheckin ? 'completed' as const : 'completed' as const },
    { label: 'Input Suara', icon: Vote, route: '/saksi/input', status: 'completed' as const },
    { label: 'Check-in Akhir', icon: Shield, route: '/saksi/final-check-in', status: 'current' as const },
  ]

  return (
    <div className="space-y-0">
      {timelineSteps.map((step, i) => {
        const StepIcon = step.icon
        const isLast = i === timelineSteps.length - 1

        return (
          <div key={step.label} className="flex gap-3">
            {/* Vertical line + dot */}
            <div className="flex flex-col items-center">
              {step.status === 'completed' ? (
                <motion.div
                  className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, delay: i * 0.15 }}
                >
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </motion.div>
              ) : step.status === 'current' ? (
                <motion.div
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-200"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <StepIcon className="h-4 w-4 text-white" />
                </motion.div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <StepIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              )}

              {/* Connector line */}
              {!isLast && (
                <motion.div
                  className={`w-0.5 flex-1 my-1 ${step.status === 'completed' ? 'bg-emerald-300' : 'bg-gray-200 dark:bg-gray-700'}`}
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  transition={{ duration: 0.3, delay: i * 0.15 }}
                />
              )}
            </div>

            {/* Content */}
            <motion.div
              className={`pb-4 ${step.status === 'pending' ? 'opacity-50' : ''}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: step.status === 'pending' ? 0.5 : 1, x: 0 }}
              transition={{ delay: i * 0.15 + 0.1 }}
            >
              <div className="flex items-center gap-2">
                <p className={`text-sm font-medium ${
                  step.status === 'completed' ? 'text-emerald-700' :
                  step.status === 'current' ? 'text-amber-700 font-semibold' :
                  'text-muted-foreground'
                }`}>
                  {step.label}
                </p>
                {step.status === 'completed' && (
                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">Selesai</Badge>
                )}
                {step.status === 'current' && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] flex items-center gap-1">
                    <StatusDot color="amber" />
                    Sekarang
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {step.status === 'completed' ? 'Terverifikasi dan disimpan' :
                 step.status === 'current' ? 'Lakukan check-in akhir sekarang' :
                 'Menunggu langkah sebelumnya'}
              </p>
            </motion.div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Step Indicator ─── */
function StepIndicator({ currentStep }: { currentStep: number }) {
  const steps = [
    { label: 'Ambil Foto Selfie', icon: Camera },
    { label: 'Aktifkan GPS', icon: MapPin },
    { label: 'Submit Check-in', icon: CheckCircle2 },
  ]

  return (
    <div className="flex items-center justify-center gap-0 py-2">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep
        const isCurrent = i === currentStep

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all ${
                  isCompleted
                    ? 'bg-amber-500 border-amber-500 text-white'
                    : isCurrent
                    ? 'bg-white border-amber-500 text-amber-600 dark:bg-slate-800 dark:border-amber-600 dark:text-amber-400 shadow-[0_0_0_3px_rgba(245,158,11,0.2)]'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
                initial={false}
                animate={isCurrent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ duration: 2, repeat: isCurrent ? Infinity : 0, ease: 'easeInOut' }}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <step.icon className="h-4 w-4" />}
              </motion.div>
              <span className={`text-[11px] mt-1.5 text-center max-w-[72px] leading-tight ${
                isCompleted ? 'text-amber-600 font-medium' : isCurrent ? 'text-amber-600 font-medium' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-12 sm:w-16 h-0.5 mx-1.5 mt-[-18px]">
                <div className={`h-full rounded-full transition-all ${isCompleted ? 'bg-amber-500' : 'bg-gray-200'}`} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ─── Confetti Particles ─── */
function ConfettiParticles() {
  const particles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 1.8 + Math.random() * 1.5,
    size: 4 + Math.random() * 6,
    color: ['#10b981', '#14b8a6', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'][i % 6],
    rotation: Math.random() * 360,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: '-5%',
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            rotate: p.rotation,
          }}
          initial={{ y: 0, opacity: 1, scale: 0.5 }}
          animate={{
            y: [0, 300 + Math.random() * 200],
            opacity: [1, 1, 0],
            x: [0, (Math.random() - 0.5) * 120],
            rotate: [p.rotation, p.rotation + 180 + Math.random() * 360],
            scale: [0.5, 1, 0.5],
          }}
          transition={{ duration: p.duration, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}

export default function SaksiFinalCheckInPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [assignment, setAssignment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [dragOver, setDragOver] = useState(false)
  const [hasMorningCheckin, setHasMorningCheckin] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)

  // Derive current step
  const currentStep = selfieBase64 && gpsCoords ? 2 : selfieBase64 || gpsCoords ? (gpsCoords ? 1 : 0) : 0

  useEffect(() => {
    Promise.all([
      fetch('/api/assignments/my').then((res) => (res.ok ? res.json() : Promise.reject(res))),
      fetch('/api/check-ins/my').then((res) => res.json()),
    ])
      .then(([assignRes, checkinRes]) => {
        if (assignRes.success && assignRes.data) setAssignment(assignRes.data)
        else setError('Anda belum memiliki penugasan aktif')

        // Check if morning check-in exists
        if (checkinRes.success && Array.isArray(checkinRes.data)) {
          setHasMorningCheckin(checkinRes.data.some((c: any) => c.type === 'MORNING'))
        }
      })
      .catch(() => setError('Gagal memuat data penugasan'))
      .finally(() => setLoading(false))

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
      setCameraActive(true)
    } catch {
      toast.error('Tidak dapat mengakses kamera')
    }
  }

  const captureSelfie = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0)
    const base64 = canvas.toDataURL('image/jpeg', 0.7)
    setSelfieBase64(base64)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
    }
    setCameraActive(false)
    toast.success('Foto berhasil diambil')
  }

  const getGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation tidak didukung browser')
      return
    }
    setGpsError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setGpsError(`GPS Error: ${err.message}`),
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  const handleSelfieDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Hanya file gambar yang diperbolehkan')
      return
    }
    const reader = new FileReader()
    reader.onloadend = () => setSelfieBase64(reader.result as string)
    reader.readAsDataURL(file)
    toast.success('Foto berhasil ditambahkan')
  }, [])

  const handleSubmit = async () => {
    if (!gpsCoords) {
      toast.error('Aktifkan GPS terlebih dahulu')
      return
    }
    if (!selfieBase64) {
      toast.error('Ambil selfie terlebih dahulu')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/check-ins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'FINAL',
          selfiePhoto: selfieBase64,
          latitude: gpsCoords.lat,
          longitude: gpsCoords.lng,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.data)
        toast.success('Check-in akhir berhasil!')
      } else {
        toast.error(data.error || 'Check-in gagal')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <DashboardSkeleton variant="detail" />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  // ─── Success State ───
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
          className="relative rounded-xl bg-gradient-to-br from-amber-50 via-orange-50/60 to-transparent p-6 sm:p-8 overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-amber-100/60" />
          <div className="absolute bottom-0 left-1/3 w-20 h-20 rounded-full bg-orange-100/40" />
          <div className="relative flex items-center gap-3">
            <Button variant="ghost" size="icon" className="bg-white/60 hover:bg-white/80 -ml-2" onClick={() => router.push('/saksi/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200">
              <Shield className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-amber-900">Check-in Berhasil!</h1>
          </div>
        </motion.div>

        <motion.div variants={scaleVariants}>
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 shadow-sm overflow-hidden relative">
            <ConfettiParticles />
            <CardContent className="p-6 text-center space-y-4 relative z-10">
              <motion.div
                className="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4, delay: 0.5 }}>
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </motion.div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <p className="font-semibold text-lg text-emerald-900">Check-in Akhir Berhasil</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(result.timestamp).toLocaleString('id-ID')}
                </p>
              </motion.div>

              <motion.div className="space-y-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                {result.gpsVerified ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-sm gap-1.5">
                    <StatusDot color="emerald" />
                    GPS Terverifikasi
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-sm gap-1.5">
                    <StatusDot color="amber" />
                    GPS Tidak Terverifikasi ({Math.round(result.distance || 0)}m dari TPS)
                  </Badge>
                )}
              </motion.div>

              <motion.div className="flex gap-3 justify-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                <Button onClick={() => router.push('/saksi/input')} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                  Input Suara
                </Button>
                <Button variant="outline" onClick={() => router.push('/saksi/dashboard')}>Dashboard</Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  // ─── No Assignment ───
  if (!assignment) {
    return (
      <motion.div
        className="p-4 max-w-lg mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={itemVariants}
          className="relative rounded-xl bg-gradient-to-br from-amber-50 via-orange-50/60 to-transparent p-6 sm:p-8 overflow-hidden"
        >
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-amber-100/60" />
          <div className="absolute bottom-0 left-1/3 w-20 h-20 rounded-full bg-orange-100/40" />
          <div className="relative flex items-center gap-3">
            <Button variant="ghost" size="icon" className="bg-white/60 hover:bg-white/80 -ml-2" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-amber-900">Check-in Akhir</h1>
              <p className="text-sm text-muted-foreground">Verifikasi kehadiran akhir di TPS</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={scaleVariants}>
          <Card className="shadow-sm">
            <CardContent className="p-8 text-center space-y-4">
              <motion.div
                className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-2 border-dashed border-amber-200 flex items-center justify-center"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Map className="h-10 w-10 text-amber-400" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Belum Ada Penugasan</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                  Anda belum ditugaskan ke TPS manapun. Silakan tunggu plotting dari admin atau hubungi koordinator Anda.
                </p>
              </div>
              <div className="pt-2">
                <Button variant="outline" onClick={() => router.push('/saksi/dashboard')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali ke Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    )
  }

  // ─── Main Check-in Flow ───
  return (
    <motion.div
      className="p-4 max-w-lg mx-auto space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Gradient Title Area with Urgency */}
      <motion.div
        variants={itemVariants}
        className="relative rounded-xl bg-gradient-to-br from-amber-50 via-orange-50/60 to-transparent p-6 sm:p-8 overflow-hidden"
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-amber-100/60" />
        <div className="absolute bottom-0 left-1/3 w-20 h-20 rounded-full bg-orange-100/40" />
        <div className="absolute top-12 right-20 w-10 h-10 rounded-full bg-rose-100/30" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-1">
            <Button variant="ghost" size="icon" className="bg-white/60 hover:bg-white/80 -ml-2" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-200">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-amber-900">Check-in Akhir</h1>
                <Badge className="bg-gradient-to-r from-rose-500 to-amber-500 text-white border-0 text-[10px] px-2 py-0.5 animate-pulse">
                  HARI H
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusDot color="amber" />
                <span className="text-sm text-muted-foreground">
                  {assignment?.tps?.code} - {assignment?.tps?.name}
                </span>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground ml-11">
            Verifikasi kehadiran akhir setelah penghitungan suara selesai
          </p>
        </div>
      </motion.div>

      {/* Info Banner with Urgency */}
      <motion.div variants={itemVariants}>
        <div className="rounded-xl bg-gradient-to-r from-amber-50 via-orange-50/80 to-rose-50/50 border border-amber-200/60 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-200/50">
              <AlertTriangle className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-amber-900">Tahap Akhir Pengawasan</span>
                <Badge className="bg-amber-500/15 text-amber-700 border-amber-300/50 text-[10px] px-1.5 py-0 hover:bg-amber-500/20">
                  {assignment?.tps?.code}
                </Badge>
              </div>
              <p className="text-xs text-amber-700/70 leading-relaxed">
                Pastikan seluruh proses penghitungan suara telah dilaksanakan dengan benar sebelum melakukan check-in akhir. Langkah ini bersifat wajib.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Check-in Progress Timeline */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm">
          <CardHeader className="bg-gradient-to-r from-amber-50/50 to-orange-50/30 pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100">
                <ClipboardCheck className="h-3.5 w-3.5 text-amber-700" />
              </div>
              Progres Check-in
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <CheckInTimeline hasMorningCheckin={hasMorningCheckin} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Step Indicator */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm py-4 px-2">
          <StepIndicator currentStep={currentStep} />
        </Card>
      </motion.div>

      {/* Camera Card */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Camera className="h-5 w-5" />
              Foto Selfie
              {selfieBase64 && (
                <Badge className="bg-white/20 text-white border-0 text-xs ml-auto">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Selesai
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-amber-100">
              Ambil foto selfie atau seret gambar sebagai bukti kehadiran akhir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <motion.div
              whileHover={{ scale: 1.005 }}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleSelfieDrop}
              className={`relative rounded-lg overflow-hidden bg-muted aspect-[4/3] flex items-center justify-center transition-all duration-300 ${
                dragOver ? 'ring-2 ring-amber-400 ring-offset-2 bg-amber-50/50' : ''
              }`}
            >
              {cameraActive ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : selfieBase64 ? (
                <AnimatePresence mode="wait">
                  <motion.img
                    key="selfie"
                    src={selfieBase64}
                    alt="Selfie"
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
              ) : (
                <motion.div
                  className={`text-center text-muted-foreground p-4 cursor-pointer transition-colors duration-200 ${
                    dragOver ? 'text-amber-500' : ''
                  }`}
                  animate={dragOver ? { scale: 1.02 } : { scale: 1 }}
                >
                  <motion.div
                    className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mb-3"
                    animate={dragOver ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Camera className="h-7 w-7 text-amber-500" />
                  </motion.div>
                  <p className="text-sm font-medium">
                    {dragOver ? 'Lepaskan gambar di sini' : 'Seret gambar ke sini atau ambil foto'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG - Maks 5MB</p>
                </motion.div>
              )}
              {selfieBase64 && !cameraActive && (
                <motion.div
                  className="absolute top-3 right-3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge className="bg-amber-500 text-white text-xs gap-1 shadow-sm">
                    <CheckCircle2 className="h-3 w-3" />
                    Foto Diambil
                  </Badge>
                </motion.div>
              )}
            </motion.div>
            <div className="flex gap-2">
              {!cameraActive && !selfieBase64 && (
                <Button onClick={startCamera} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" /> Mulai Kamera
                </Button>
              )}
              {cameraActive && (
                <Button onClick={captureSelfie} className="flex-1">Ambil Foto</Button>
              )}
              {selfieBase64 && !cameraActive && (
                <Button onClick={startCamera} variant="outline" className="flex-1">Ambil Ulang</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* GPS Card */}
      <motion.div variants={itemVariants}>
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <MapPin className="h-5 w-5" />
              Verifikasi GPS
              {gpsCoords && (
                <Badge className="bg-white/20 text-white border-0 text-xs ml-auto">
                  <StatusDot color="emerald" />
                  Aktif
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-orange-100">
              Aktifkan GPS untuk verifikasi lokasi di TPS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {gpsCoords ? (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <motion.div
                    className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <StatusDot color="emerald" />
                  </motion.div>
                  <div>
                    <span className="text-sm font-medium text-emerald-800 block">GPS Aktif</span>
                    <span className="text-xs text-emerald-600 font-mono">
                      {gpsCoords.lat.toFixed(6)}, {gpsCoords.lng.toFixed(6)}
                    </span>
                  </div>
                </div>
                {assignment?.tps && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                    <MapPin className="h-3.5 w-3.5 text-orange-500" />
                    <span>TPS: {assignment.tps.latitude}, {assignment.tps.longitude}</span>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="space-y-2">
                {gpsError && (
                  <motion.p
                    className="text-sm text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    {gpsError}
                  </motion.p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-1">
                  <span className="inline-flex h-2 w-2 rounded-full bg-gray-300" />
                  <span>GPS belum aktif</span>
                </div>
              </div>
            )}
            <Button
              onClick={getGPS}
              variant="outline"
              className={`w-full ${gpsCoords ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50' : ''}`}
            >
              <motion.div className="flex items-center gap-2" whileTap={{ scale: 0.95 }}>
                <MapPin className="h-4 w-4" />
                {gpsCoords ? 'Perbarui Lokasi' : 'Aktifkan GPS'}
              </motion.div>
            </Button>

            {/* GPS Map */}
            {assignment?.tps && (
              <div className="pt-2">
                <CheckInMap
                  tpsLatitude={assignment.tps.latitude}
                  tpsLongitude={assignment.tps.longitude}
                  tpsName={assignment.tps.name}
                  tpsCode={assignment.tps.code}
                  userLatitude={gpsCoords?.lat}
                  userLongitude={gpsCoords?.lng}
                  radiusMeters={100}
                  height="250px"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Submit */}
      <motion.div variants={itemVariants}>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button
            className="w-full h-12 text-base bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg shadow-amber-200 transition-all duration-200"
            size="lg"
            onClick={handleSubmit}
            disabled={submitting || !gpsCoords || !selfieBase64}
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Memproses...</>
            ) : (
              <><Shield className="h-4 w-4 mr-2" />Submit Check-in Akhir</>
            )}
          </Button>
        </motion.div>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Tindakan ini tidak dapat dibatalkan. Pastikan semua data sudah benar.
        </p>
      </motion.div>
    </motion.div>
  )
}
