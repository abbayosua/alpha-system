'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, Users, Clock, Navigation } from 'lucide-react'
import dynamic from 'next/dynamic'

const SingleTPSMap = dynamic(() => import('@/components/maps/SingleTPSMap'), { ssr: false })

export default function SaksiTpsPage() {
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/assignments/my')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data)
        else if (!res.success && res.error) setError(res.error)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Detail TPS</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Anda belum ditugaskan ke TPS manapun.</p>
            <p className="text-sm mt-1">Menunggu plotting dari admin.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Detail TPS</h1>
          <p className="text-sm text-muted-foreground">Informasi TPS penugasan Anda</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              {data.tps.code} - {data.tps.name}
            </CardTitle>
            <Badge variant="default">{data.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Alamat</p>
            <p>{data.tps.address}</p>
          </div>

          {(data.tps.kelurahan || data.tps.kecamatan || data.tps.kota || data.tps.province) && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Wilayah</p>
              <p className="text-sm">
                {[data.tps.kelurahan, data.tps.kecamatan, data.tps.kota, data.tps.province].filter(Boolean).join(', ')}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">DPT</p>
              <p className="text-lg font-semibold">{data.tps.totalDpt?.toLocaleString('id-ID') || 0} pemilih</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Koordinat GPS</p>
              <div className="flex items-center gap-1 text-sm">
                <Navigation className="h-4 w-4" />
                <span>{data.tps.latitude.toFixed(6)}, {data.tps.longitude.toFixed(6)}</span>
              </div>
            </div>
          </div>

          {/* TPS Location Map */}
          <div className="pt-2">
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

          <div className="pt-3 border-t">
            <p className="text-sm font-medium text-muted-foreground mb-1">Ditugaskan sejak</p>
            <p className="text-sm flex items-center gap-1">
              <Clock className="h-4 w-4" />
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
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => router.push('/saksi/check-in')}>
          Check-in
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => router.push('/saksi/input')}>
          Input Suara
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => router.push('/saksi/lapor')}>
          Lapor
        </Button>
      </div>
    </div>
  )
}

function StatusCard({ title, status, detail }: { title: string; status: 'done' | 'pending'; detail?: string }) {
  return (
    <Card>
      <CardContent className="p-4 text-center">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <Badge variant={status === 'done' ? 'default' : 'secondary'} className={status === 'done' ? 'bg-green-100 text-green-700' : ''}>
          {status === 'done' ? 'Selesai' : 'Belum'}
        </Badge>
        {detail && <p className="text-xs text-muted-foreground mt-1">{detail}</p>}
      </CardContent>
    </Card>
  )
}
