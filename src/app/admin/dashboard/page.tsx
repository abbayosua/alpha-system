'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, MapPin, ClipboardCheck, FileText, Wallet, BarChart3, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'

export default function AdminDashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/admin')
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

  const { overview, checkInBreakdown, paymentSummary, recentSaksi, recentReports } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <p className="text-muted-foreground">Selamat datang, {user?.name}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total Saksi" value={overview.totalSaksi} borderColor="border-l-emerald-500" bgClass="bg-gradient-to-br from-emerald-50 to-teal-50" />
        <StatCard icon={<MapPin className="h-5 w-5" />} label="Total TPS" value={overview.totalTps} borderColor="border-l-amber-500" bgClass="bg-gradient-to-br from-amber-50 to-orange-50" />
        <StatCard icon={<ClipboardCheck className="h-5 w-5" />} label="Penugasan Aktif" value={overview.activeAssignments} borderColor="border-l-teal-500" bgClass="bg-gradient-to-br from-teal-50 to-cyan-50" />
        <StatCard icon={<FileText className="h-5 w-5" />} label="Laporan Fraud" value={overview.totalReports} borderColor={overview.totalReports > 0 ? 'border-l-rose-500' : 'border-l-gray-300'} bgClass={overview.totalReports > 0 ? 'bg-gradient-to-br from-rose-50 to-red-50' : ''} />
      </div>

      {/* Rates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2 bg-muted/50">
            <CardTitle className="text-sm text-muted-foreground">Check-in Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overview.checkInRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">
              Pagi: {checkInBreakdown?.MORNING || 0} | Akhir: {checkInBreakdown?.FINAL || 0}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardHeader className="pb-2 bg-muted/50">
            <CardTitle className="text-sm text-muted-foreground">Data Input Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overview.dataInputRate}%</p>
            <p className="text-xs text-muted-foreground mt-1">{overview.totalVoteInputs} dari {overview.activeAssignments} penugasan</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-teal-500">
          <CardHeader className="pb-2 bg-muted/50">
            <CardTitle className="text-sm text-muted-foreground">Total Check-in</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{overview.totalCheckIns}</p>
            <p className="text-xs text-muted-foreground mt-1">Pagi & Akhir</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Summary */}
      <Card className="shadow-sm">
        <CardHeader className="bg-muted/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Ringkasan Pembayaran
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/keuangan/dashboard')}>
              Lihat Detail <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-y-0 md:divide-y-0">
            {paymentSummary && Object.entries(paymentSummary).map(([status, info]: [string, any]) => (
              <div key={status} className="text-center px-2 py-3">
                <p className="text-2xl font-bold">{info.count}</p>
                <p className="text-xs text-muted-foreground mb-1">{status.replace(/_/g, ' ')}</p>
                {info.total > 0 && (
                  <p className="text-xs font-medium text-emerald-600">{formatCurrency(info.total)}</p>
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

      {/* Recent Saksi & Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Saksi Terbaru</CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push('/admin/saksi')}>
                Semua <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-64 overflow-y-auto divide-y">
              {recentSaksi?.length > 0 ? recentSaksi.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
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

        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Laporan Fraud Terbaru</CardTitle>
              <Button variant="outline" size="sm" onClick={() => router.push('/admin/reports')}>
                Semua <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-64 overflow-y-auto divide-y">
              {recentReports?.length > 0 ? recentReports.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{r.title}</p>
                    <p className="text-xs text-muted-foreground">{r.user?.name || 'Unknown'}</p>
                  </div>
                  <ReportStatusBadge status={r.status} />
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada laporan</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, borderColor, bgClass }: { icon: React.ReactNode; label: string; value: number; borderColor: string; bgClass?: string }) {
  return (
    <Card className={`shadow-sm border-l-4 ${borderColor} ${bgClass || ''}`}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
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
    <Button variant="outline" className="h-auto py-4 flex-col gap-2 shadow-sm" onClick={onClick}>
      {icon}
      <span className="text-xs">{label}</span>
    </Button>
  )
}

function ReportStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; dot: string }> = {
    PENDING: { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    UNDER_REVIEW: { color: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500' },
    VERIFIED: { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    DISMISSED: { color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' },
  }
  const c = config[status] || { color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' }
  return (
    <Badge variant="secondary" className={`${c.color} gap-1.5`}>
      <span className={`inline-flex h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}
