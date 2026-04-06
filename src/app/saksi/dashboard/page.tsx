'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, ClipboardCheck, Camera, FileText, Wallet, AlertTriangle, CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'

type DashboardData = {
  profile: any
  assignment: any
  checkInStatus: {
    morning: { completed: boolean; gpsVerified?: boolean; distance?: number; timestamp?: string } | null
    final: { completed: boolean; gpsVerified?: boolean; distance?: number; timestamp?: string } | null
  }
  voteInputStatus: { submitted: boolean; c1Uploaded?: boolean; totalVotes?: number; submittedAt?: string } | null
  payment: any
  recentReports: any[]
}

export default function SaksiDashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/saksi')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((res) => {
        if (res.success) setData(res.data)
        else setError(res.error)
      })
      .catch((err) => setError(err.statusText || 'Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton variant="dashboard" />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />
  if (!data) return null

  const hasAssignment = !!data.assignment

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Saksi</h1>
          <p className="text-muted-foreground">Selamat datang, {data.profile?.name || user?.name}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push('/saksi/profile')}>
          Profil
        </Button>
      </div>

      {/* Assignment Status */}
      <Card className={hasAssignment ? 'border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50' : 'border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-orange-50'}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Status Penugasan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasAssignment ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Aktif</Badge>
                <span className="font-medium">{data.assignment.tps.code} - {data.assignment.tps.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">{data.assignment.tps.address}</p>
              {data.assignment.tps.kelurahan && (
                <p className="text-sm text-muted-foreground">
                  Kel. {data.assignment.tps.kelurahan}, Kec. {data.assignment.tps.kecamatan}
                  {data.assignment.tps.kota ? `, ${data.assignment.tps.kota}` : ''}
                </p>
              )}
              <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push('/saksi/tps')}>
                Lihat Detail TPS <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600">
              <Clock className="h-5 w-5" />
              <span>Belum ditugaskan ke TPS. Menunggu plotting dari admin.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Cards */}
      {hasAssignment && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Morning Check-in */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 bg-muted/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Check-in Pagi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.checkInStatus.morning?.completed ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-emerald-600 font-medium">Sudah Check-in</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      {data.checkInStatus.morning.gpsVerified ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">GPS Terverifikasi</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">GPS Belum Terverifikasi</Badge>
                      )}
                    </div>
                    {data.checkInStatus.morning.timestamp && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(data.checkInStatus.morning.timestamp).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Lakukan check-in pagi di TPS Anda</p>
                    <Button size="sm" onClick={() => router.push('/saksi/check-in')}>
                      Check-in Sekarang <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Final Check-in */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 bg-muted/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Check-in Akhir
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.checkInStatus.final?.completed ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-emerald-600 font-medium">Sudah Check-in</span>
                    </div>
                    {data.checkInStatus.final.timestamp && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(data.checkInStatus.final.timestamp).toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Lakukan check-in akhir setelah penghitungan suara</p>
                    <Button size="sm" onClick={() => router.push('/saksi/final-check-in')}>
                      Check-in Akhir <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vote Input */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 bg-muted/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Input Suara
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.voteInputStatus?.submitted ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-emerald-600 font-medium">Sudah Diinput</span>
                    </div>
                    <p className="text-sm">Total: {data.voteInputStatus.totalVotes} suara</p>
                    {data.voteInputStatus.c1Uploaded && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">Foto C1 Diupload</Badge>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">Input hasil perhitungan suara dan upload foto C1</p>
                    <Button size="sm" onClick={() => router.push('/saksi/input')}>
                      Input Suara <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Report */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 bg-muted/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Lapor Kecurangan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {data.recentReports.length > 0
                      ? `${data.recentReports.length} laporan terkirim`
                      : 'Laporkan jika menemukan kecurangan'}
                  </p>
                  <Button size="sm" variant="destructive" onClick={() => router.push('/saksi/lapor')}>
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Buat Laporan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Status */}
          <Card className="shadow-sm border-l-4 border-l-emerald-500">
            <CardHeader className="pb-3 bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Status Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.payment ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Jumlah</span>
                    <span className="font-bold text-lg">{formatCurrency(data.payment.amount)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <PaymentStatusBadge status={data.payment.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Validasi</span>
                    <span className="text-sm font-medium">{data.payment.validationScore}/3 checklist</span>
                  </div>

                  {/* Validation Checklist */}
                  {data.payment.validationChecklist && (
                    <div className="mt-3 pt-3 border-t divide-y space-y-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase pb-2">Checklist Validasi:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x sm:gap-0">
                        <CheckItem label="Check-in Pagi" done={data.payment.validationChecklist.morningCheckIn} />
                        <CheckItem label="Check-in Akhir" done={data.payment.validationChecklist.finalCheckIn} />
                        <CheckItem label="GPS Terverifikasi" done={data.payment.validationChecklist.gpsVerified} />
                        <CheckItem label="Data Suara Diinput" done={data.payment.validationChecklist.voteDataInputted} />
                        <CheckItem label="Foto C1 Diupload" done={data.payment.validationChecklist.c1Uploaded} />
                      </div>
                    </div>
                  )}

                  <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push('/saksi/payment')}>
                    Detail Pembayaran <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>Belum ada data pembayaran. Lakukan check-in terlebih dahulu.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; dot: string }> = {
    PENDING: { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    READY_FOR_PAYMENT: { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    APPROVED: { color: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500' },
    DISBURSED: { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    CANCELLED: { color: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
    FAILED: { color: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
  }
  const c = config[status] || { color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' }
  return (
    <Badge variant="secondary" className={`${c.color} gap-1.5`}>
      <span className={`inline-flex h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}

function CheckItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-2 text-sm py-2 px-2">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-gray-300 shrink-0" />
      )}
      <span className={done ? 'text-foreground' : 'text-muted-foreground'}>{label}</span>
    </div>
  )
}
