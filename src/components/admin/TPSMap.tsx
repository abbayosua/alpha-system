'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Users, AlertTriangle, CheckCircle2 } from 'lucide-react'
import TPSMapView, { type TPSMapItem } from '@/components/maps/TPSMapView'

export default function AdminTPSMap() {
  const [tpsList, setTpsList] = useState<TPSMapItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/tps')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setTpsList(res.data || [])
        } else {
          setError(res.error || 'Gagal memuat data TPS')
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const stats = {
    total: tpsList.length,
    withSaksi: tpsList.filter((t) => t.activeAssignmentCount && t.activeAssignmentCount > 0).length,
    withoutSaksi: tpsList.filter((t) => !t.activeAssignmentCount || t.activeAssignmentCount === 0).length,
    totalAssignments: tpsList.reduce((sum, t) => sum + (t.activeAssignmentCount || 0), 0),
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center text-destructive">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<MapPin className="h-4 w-4" />}
          label="Total TPS"
          value={stats.total}
          variant="default"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Dengan Saksi"
          value={stats.withSaksi}
          variant="success"
        />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Tanpa Saksi"
          value={stats.withoutSaksi}
          variant="warning"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Total Saksi"
          value={stats.totalAssignments}
          variant="default"
        />
      </div>

      {/* Map */}
      {loading ? (
        <Skeleton className="w-full h-[400px] rounded-lg" />
      ) : (
        <TPSMapView tpsData={tpsList} height="400px" />
      )}

      {/* TPS List */}
      {!loading && tpsList.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Daftar TPS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {tpsList.map((tps) => (
                <div
                  key={tps.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                      (tps.activeAssignmentCount && tps.activeAssignmentCount > 0)
                        ? 'bg-green-500'
                        : 'bg-yellow-500'
                    }`} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{tps.code} - {tps.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{tps.address}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="flex-shrink-0 text-xs">
                    {tps.activeAssignmentCount || 0} saksi
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && tpsList.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada data TPS</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  variant,
}: {
  icon: React.ReactNode
  label: string
  value: number
  variant: 'default' | 'success' | 'warning'
}) {
  const variantClasses = {
    default: 'text-primary',
    success: 'text-green-600',
    warning: 'text-yellow-600',
  }

  return (
    <Card>
      <CardContent className="p-3 flex items-center gap-2.5">
        <div className={variantClasses[variant]}>{icon}</div>
        <div>
          <p className="text-lg font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}
