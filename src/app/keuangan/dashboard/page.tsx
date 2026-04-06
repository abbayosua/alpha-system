'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRight, Wallet, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function KeuanganDashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/keuangan')
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

  const { summary, statusBreakdown, recentDisbursements } = data

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Keuangan</h1>
          <p className="text-muted-foreground">Selamat datang, {user?.name}</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock className="h-5 w-5 text-yellow-500" />}
          label="Menunggu Validasi"
          value={summary.pendingCount}
          detail="PENDING"
        />
        <StatCard
          icon={<Wallet className="h-5 w-5 text-blue-500" />}
          label="Siap Dibayar"
          value={summary.readyForPaymentCount}
          detail={formatCurrency(summary.readyForPaymentAmount)}
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-purple-500" />}
          label="Disetujui"
          value={summary.approvedCount}
          detail="Menunggu pencairan"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
          label="Dicairkan"
          value={summary.disbursedCount}
          detail={formatCurrency(summary.disbursedTotalAmount)}
        />
      </div>

      {/* Total Disbursed */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Dana Dicairkan</p>
          <p className="text-4xl font-bold text-green-700">{formatCurrency(summary.disbursedTotalAmount)}</p>
          <p className="text-sm text-muted-foreground mt-1">{summary.disbursedCount} transaksi berhasil</p>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statusBreakdown && Object.entries(statusBreakdown).map(([status, info]: [string, any]) => (
              <div key={status} className="text-center p-3 bg-muted rounded">
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ActionButton label="Approval" onClick={() => router.push('/keuangan/payments')} sublabel={`${summary.readyForPaymentCount} menunggu`} />
        <ActionButton label="Pencairan" onClick={() => router.push('/keuangan/disbursement')} sublabel={`${summary.approvedCount} siap cair`} />
        <ActionButton label="Riwayat" onClick={() => router.push('/keuangan/history')} sublabel={`${summary.disbursedCount} transaksi`} />
      </div>

      {/* Recent Disbursements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Pencairan Terbaru</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/keuangan/history')}>
              Lihat Semua <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {recentDisbursements?.length > 0 ? recentDisbursements.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="font-medium text-sm">{d.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{d.user?.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatCurrency(d.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.disbursedAt ? new Date(d.disbursedAt).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada pencairan</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: number; detail: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">{icon}</div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{detail}</p>
      </CardContent>
    </Card>
  )
}

function ActionButton({ label, onClick, sublabel }: { label: string; onClick: () => void; sublabel: string }) {
  return (
    <Button variant="outline" className="h-auto py-4 flex-col gap-1" onClick={onClick}>
      <span className="font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{sublabel}</span>
    </Button>
  )
}
