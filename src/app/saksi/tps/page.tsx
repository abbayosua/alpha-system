'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Users, Clock, Navigation, ClipboardCheck, Camera, AlertTriangle } from 'lucide-react'
import dynamic from 'next/dynamic'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'

const SingleTPSMap = dynamic(() => import('@/components/maps/SingleTPSMap'), { ssr: false })

export default function SaksiTpsPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/assignments/my')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((res) => {
        if (res.success) setData(res.data)
        else if (!res.success && res.error) setError(res.error)
      })
      .catch((err) => setError(err.statusText || 'Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton variant="detail" />

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  if (!data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detail TPS</h1>
            <p className="text-sm text-muted-foreground">Informasi TPS penugasan Anda</p>
          </div>
        </div>
        <EmptyState
          icon={MapPin}
          title="Belum Ditugaskan"
          description="Anda belum ditugaskan ke TPS manapun. Menunggu plotting dari admin."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Detail TPS</h1>
          <p className="text-sm text-muted-foreground">Informasi TPS penugasan Anda</p>
        </div>
      </div>

      <Card className="shadow-sm border-l-4 border-l-emerald-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-600" />
              {data.tps.code} - {data.tps.name}
            </CardTitle>
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 gap-1.5">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {data.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 divide-y">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Alamat</p>
            <p className="text-sm">{data.tps.address}</p>
          </div>

          {(data.tps.kelurahan || data.tps.kecamatan || data.tps.kota || data.tps.province) && (
            <div className="pt-3">
              <p className="text-sm font-medium text-muted-foreground mb-1">Wilayah</p>
              <p className="text-sm">
                {[data.tps.kelurahan, data.tps.kecamatan, data.tps.kota, data.tps.province].filter(Boolean).join(', ')}
              </p>
            </div>
          )}

          <div className="pt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">DPT</p>
              <p className="text-lg font-semibold">{data.tps.totalDpt?.toLocaleString('id-ID') || 0} pemilih</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Koordinat GPS</p>
              <div className="flex items-center gap-1 text-sm">
                <Navigation className="h-4 w-4 text-muted-foreground" />
                <span>{data.tps.latitude.toFixed(6)}, {data.tps.longitude.toFixed(6)}</span>
              </div>
            </div>
          </div>

          {/* TPS Location Map */}
          <div className="pt-3">
            <p className="text-sm font-medium text-muted-foreground mb-2">Lokasi TPS</p>
            <SingleTPSMap
              latitude={data.tps.latitude}
              longitude={data.tps.longitude}
              name={data.tps.name}
              code={data.tps.code}
              address={data.tps.address}
              height="250px"
            />
          </div>

          <div className="pt-3">
            <p className="text-sm font-medium text-muted-foreground mb-1">Ditugaskan sejak</p>
            <p className="text-sm flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {new Date(data.assignedAt).toLocaleString('id-ID')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard
          title="Check-in Pagi"
          status={data.checkInStatus?.morning ? 'done' : 'pending'}
          detail={data.checkInStatus?.morning?.gpsVerified ? 'GPS ✓' : undefined}
        />
        <StatusCard
          title="Check-in Akhir"
          status={data.checkInStatus?.final ? 'done' : 'pending'}
        />
        <StatusCard
          title="Input Suara"
          status={data.voteInputStatus ? 'done' : 'pending'}
          detail={data.voteInputStatus?.c1Uploaded ? 'C1 ✓' : undefined}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => router.push('/saksi/check-in')}>
          <ClipboardCheck className="h-4 w-4 mr-2" />
          Check-in
        </Button>
        <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => router.push('/saksi/input')}>
          <Camera className="h-4 w-4 mr-2" />
          Input Suara
        </Button>
        <Button variant="outline" className="flex-1 min-w-[120px]" onClick={() => router.push('/saksi/lapor')}>
          <AlertTriangle className="h-4 w-4 mr-2" />
          Lapor
        </Button>
      </div>
    </div>
  )
}

function StatusCard({ title, status, detail }: { title: string; status: 'done' | 'pending'; detail?: string }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 text-center">
        <p className="text-sm text-muted-foreground mb-2">{title}</p>
        <Badge
          variant="secondary"
          className={status === 'done'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 gap-1.5'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 gap-1.5'
          }
        >
          <span className={`inline-flex h-1.5 w-1.5 rounded-full ${status === 'done' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {status === 'done' ? 'Selesai' : 'Belum'}
        </Badge>
        {detail && <p className="text-xs text-muted-foreground mt-1">{detail}</p>}
      </CardContent>
    </Card>
  )
}
