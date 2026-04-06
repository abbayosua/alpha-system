'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Camera, MapPin, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'

const CheckInMap = dynamic(() => import('@/components/maps/CheckInMap'), { ssr: false })

export default function SaksiFinalCheckInPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [assignment, setAssignment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [result, setResult] = useState<any>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    fetch('/api/assignments/my')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) setAssignment(res.data)
        else toast.error('Anda belum memiliki penugasan aktif')
      })
      .catch(() => toast.error('Gagal memuat data penugasan'))
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

  if (loading) {
    return (
      <div className="p-4 max-w-lg mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (result) {
    return (
      <div className="p-4 max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/saksi/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Check-in Berhasil!</h1>
        </div>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-6 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
            <div>
              <p className="font-semibold text-lg">Check-in Akhir Berhasil</p>
              <p className="text-sm text-muted-foreground">
                {new Date(result.timestamp).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="space-y-2">
              {result.gpsVerified ? (
                <Badge className="bg-green-100 text-green-700 text-sm">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> GPS Terverifikasi
                </Badge>
              ) : (
                <Badge className="bg-yellow-100 text-yellow-700 text-sm">
                  <XCircle className="h-4 w-4 mr-1" /> GPS Tidak Terverifikasi ({Math.round(result.distance || 0)}m dari TPS)
                </Badge>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.push('/saksi/input')}>Input Suara</Button>
              <Button variant="outline" onClick={() => router.push('/saksi/dashboard')}>Dashboard</Button>
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
          <h1 className="text-2xl font-bold">Check-in Akhir</h1>
          <p className="text-sm text-muted-foreground">
            {assignment?.tps?.code} - {assignment?.tps?.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Foto Selfie
          </CardTitle>
          <CardDescription>Ambil foto selfie sebagai bukti kehadiran akhir</CardDescription>
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
          </div>
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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Verifikasi GPS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {gpsCoords ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">
                Lat: {gpsCoords.lat.toFixed(6)}, Lng: {gpsCoords.lng.toFixed(6)}
              </span>
            </div>
          ) : (
            <div>
              {gpsError && <p className="text-sm text-destructive mb-1">{gpsError}</p>}
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

      <Button
        className="w-full"
        size="lg"
        onClick={handleSubmit}
        disabled={submitting || !gpsCoords || !selfieBase64}
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Memproses...</>
        ) : (
          'Submit Check-in Akhir'
        )}
      </Button>
    </div>
  )
}
