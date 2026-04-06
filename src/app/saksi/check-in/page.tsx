'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Camera, MapPin, CheckCircle2, XCircle, Loader2, Map } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'

const CheckInMap = dynamic(() => import('@/components/maps/CheckInMap'), { ssr: false })

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
        const isFuture = i > currentStep

        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isCurrent
                    ? 'bg-white border-emerald-500 text-emerald-600 dark:bg-slate-800 dark:border-emerald-600 dark:text-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
                initial={false}
                animate={isCurrent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ duration: 2, repeat: isCurrent ? Infinity : 0, ease: 'easeInOut' }}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
              </motion.div>
              <span
                className={`text-[11px] mt-1.5 text-center max-w-[72px] leading-tight ${
                  isCompleted ? 'text-emerald-600 font-medium' : isCurrent ? 'text-emerald-600 font-medium' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-12 sm:w-16 h-0.5 mx-1.5 mt-[-18px]">
                <div className={`h-full rounded-full transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-gray-200'}`} />
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
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
    </div>
  )
}

export default function SaksiCheckInPage() {
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
  const streamRef = useRef<MediaStream | null>(null)

  // Derive current step
  const currentStep = selfieBase64 && gpsCoords ? 2 : selfieBase64 || gpsCoords ? (gpsCoords ? 1 : 0) : 0

  useEffect(() => {
    fetch('/api/assignments/my')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((res) => {
        if (res.success && res.data) setAssignment(res.data)
        else setError('Anda belum memiliki penugasan aktif')
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
          type: 'MORNING',
          selfiePhoto: selfieBase64,
          latitude: gpsCoords.lat,
          longitude: gpsCoords.lng,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setResult(data.data)
        toast.success('Check-in pagi berhasil!')
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
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/saksi/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Check-in Berhasil!</h1>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 shadow-sm overflow-hidden relative">
            {/* Confetti */}
            <ConfettiParticles />

            <CardContent className="p-6 text-center space-y-4 relative z-10">
              {/* Animated checkmark */}
              <motion.div
                className="mx-auto w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <p className="font-semibold text-lg">Check-in Pagi Berhasil</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(result.timestamp).toLocaleString('id-ID')}
                </p>
              </motion.div>

              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {result.gpsVerified ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 text-sm gap-1.5">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    GPS Terverifikasi
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-sm gap-1.5">
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                    GPS Tidak Terverifikasi ({Math.round(result.distance || 0)}m dari TPS)
                  </Badge>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Button onClick={() => router.push('/saksi/dashboard')} className="mt-2">
                  Kembali ke Dashboard
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // ─── No Assignment ───
  if (!assignment) {
    return (
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Check-in Pagi</h1>
            <p className="text-sm text-muted-foreground">Verifikasi kehadiran di TPS</p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="shadow-sm">
            <CardContent className="p-8 text-center space-y-4">
              <motion.div
                className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-2 border-dashed border-emerald-200 flex items-center justify-center"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Map className="h-10 w-10 text-emerald-400" />
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
      </div>
    )
  }

  // ─── Main Check-in Flow ───
  return (
    <div className="space-y-6 max-w-lg mx-auto">
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Check-in Pagi</h1>
          <p className="text-sm text-muted-foreground">
            {assignment?.tps?.code} - {assignment?.tps?.name}
          </p>
        </div>
      </motion.div>

      {/* Step Indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="shadow-sm py-4 px-2">
          <StepIndicator currentStep={currentStep} />
        </Card>
      </motion.div>

      {/* Camera Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Camera className="h-5 w-5" />
              Foto Selfie
            </CardTitle>
            <CardDescription className="text-emerald-100">
              Ambil foto selfie sebagai bukti kehadiran
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative rounded-lg overflow-hidden bg-muted aspect-[4/3] flex items-center justify-center">
              {cameraActive ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : selfieBase64 ? (
                <img src={selfieBase64} alt="Selfie" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-muted-foreground p-4">
                  <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Klik tombol untuk mulai kamera</p>
                </div>
              )}
              {selfieBase64 && !cameraActive && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-emerald-500 text-white text-xs gap-1 shadow-sm">
                    <CheckCircle2 className="h-3 w-3" />
                    Foto Diambil
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {!cameraActive && !selfieBase64 && (
                <Button onClick={startCamera} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" /> Mulai Kamera
                </Button>
              )}
              {cameraActive && (
                <Button onClick={captureSelfie} className="flex-1">
                  Ambil Foto
                </Button>
              )}
              {selfieBase64 && !cameraActive && (
                <Button onClick={startCamera} variant="outline" className="flex-1">
                  Ambil Ulang
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* GPS Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <MapPin className="h-5 w-5" />
              Verifikasi GPS
            </CardTitle>
            <CardDescription className="text-teal-100">
              Aktifkan GPS untuk verifikasi lokasi di TPS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {gpsCoords ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium">GPS Aktif</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Lat: {gpsCoords.lat.toFixed(6)}, Lng: {gpsCoords.lng.toFixed(6)}
                </p>
                {assignment?.tps && (
                  <p className="text-xs text-muted-foreground">
                    TPS: {assignment.tps.latitude}, {assignment.tps.longitude}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {gpsError && (
                  <p className="text-sm text-destructive">{gpsError}</p>
                )}
                <p className="text-sm text-muted-foreground">GPS belum aktif</p>
              </div>
            )}
            <Button onClick={getGPS} variant="outline" className="w-full">
              <MapPin className="h-4 w-4 mr-2" />
              {gpsCoords ? 'Perbarui Lokasi' : 'Aktifkan GPS'}
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={submitting || !gpsCoords || !selfieBase64}
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Memproses...
            </>
          ) : (
            'Submit Check-in Pagi'
          )}
        </Button>
      </motion.div>
    </div>
  )
}
