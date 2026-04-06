'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Users, MapPin, ClipboardCheck, FileText, Wallet, BarChart3, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/admin')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data)
        else setError(res.error)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-4 max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <Card className="border-destructive">
          <CardContent className="p-6 text-center text-destructive">{error}</CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  const { overview, checkInBreakdown, paymentSummary, recentSaksi, recentReports } = data

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground">Selamat datang, {user?.name}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Saksi" value={overview.totalSaksi} />
        <StatCard icon={<MapPin className="h-5 w-5" />} label="Total TPS" value={overview.totalTps} />
        <StatCard icon={<ClipboardCheck className="h-5 w-5" />} label="Penugasan Aktif" value={overview.activeAssignments} />
        <StatCard icon={<FileText className="h-5 w-5" />} label="Laporan Fraud" value={overview.totalReports} />
      </div>

      {/* Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Check-in Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overview.checkInRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              Pagi: {checkInBreakdown?.MORNING || 0} | Akhir: {checkInBreakdown?.FINAL || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Data Input Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overview.dataInputRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">{overview.totalVoteInputs} dari {overview.activeAssignments} penugasan</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overview.totalCheckIns}</p>
            <p className="text-xs text-muted-foreground mt-1">Pagi & Akhir</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Ringkasan Pembayaran
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/reports')}>
              Lihat Semua <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {paymentSummary && Object.entries(paymentSummary).map(([status, info]: [string, any]) => (
              <div key={status} className="text-center">
                <p className="text-2xl font-bold">{info.count}</p>
                <p className="text-xs text-muted-foreground mb-1">{status.replace(/_/g, ' ')}</p>
                {info.total > 0 && (
                  <p className="text-xs font-medium">{formatCurrency(info.total)}</p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ActionButton label="Kelola Saksi" onClick={() => router.push('/admin/saksi')} icon={<Users className="h-5 w-5" />} />
        <ActionButton label="Kelola TPS" onClick={() => router.push('/admin/tps')} icon={<MapPin className="h-5 w-5" />} />
        <ActionButton label="Plotting" onClick={() => router.push('/admin/plotting')} icon={<BarChart3 className="h-5 w-5" />} />
        <ActionButton label="Laporan" onClick={() => router.push('/admin/reports')} icon={<FileText className="h-5 w-5" />} />
      </div>

      {/* Recent Saksi */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Saksi Terbaru</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/saksi')}>
              Lihat Semua <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentSaksi?.length > 0 ? recentSaksi.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.email}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(s.createdAt).toLocaleDateString('id-ID')}
                </p>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada saksi terdaftar</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Laporan Fraud Terbaru</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/admin/reports')}>
              Lihat Semua <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentReports?.length > 0 ? recentReports.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.user?.name || 'Unknown'}</p>
                </div>
                <Badge variant="secondary" className={r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : r.status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>
                  {r.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada laporan</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function ActionButton({ label, onClick, icon }: { label: string; onClick: () => void; icon: React.ReactNode }) {
  return (
    <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={onClick}>
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  )
}
