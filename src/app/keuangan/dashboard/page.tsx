'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight, Wallet, CheckCircle2, Clock, Send, History, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'

export default function KeuanganDashboardPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/keuangan')
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

  const { summary, statusBreakdown, recentDisbursements } = data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Keuangan</h1>
          <p className="text-muted-foreground">Selamat datang, {user?.name}</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Clock className="h-5 w-5 text-amber-500" />}
          label="Menunggu Validasi"
          value={summary.pendingCount}
          detail="PENDING"
          borderColor="border-l-amber-500"
          bgClass="bg-gradient-to-br from-amber-50 to-orange-50"
        />
        <StatCard
          icon={<Wallet className="h-5 w-5 text-emerald-500" />}
          label="Siap Dibayar"
          value={summary.readyForPaymentCount}
          detail={formatCurrency(summary.readyForPaymentAmount)}
          borderColor="border-l-emerald-500"
          bgClass="bg-gradient-to-br from-emerald-50 to-teal-50"
        />
        <StatCard
          icon={<CheckCircle2 className="h-5 w-5 text-teal-500" />}
          label="Disetujui"
          value={summary.approvedCount}
          detail="Menunggu pencairan"
          borderColor="border-l-teal-500"
          bgClass="bg-gradient-to-br from-teal-50 to-cyan-50"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5 text-emerald-600" />}
          label="Dicairkan"
          value={summary.disbursedCount}
          detail={formatCurrency(summary.disbursedTotalAmount)}
          borderColor="border-l-emerald-500"
          bgClass="bg-gradient-to-br from-emerald-50 to-teal-50"
        />
      </div>

      {/* Total Disbursed */}
      <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Dana Dicairkan</p>
          <p className="text-4xl font-bold text-emerald-700">{formatCurrency(summary.disbursedTotalAmount)}</p>
          <p className="text-sm text-muted-foreground mt-1">{summary.disbursedCount} transaksi berhasil</p>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <Card className="shadow-sm">
        <CardHeader className="bg-muted/50">
          <CardTitle className="text-lg">Status Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statusBreakdown && Object.entries(statusBreakdown).map(([status, info]: [string, any]) => (
              <div key={status} className="text-center p-3 bg-muted rounded-lg">
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ActionButton label="Approval" onClick={() => router.push('/keuangan/payments')} sublabel={`${summary.readyForPaymentCount} menunggu`} icon={<Wallet className="h-5 w-5" />} />
        <ActionButton label="Pencairan" onClick={() => router.push('/keuangan/disbursement')} sublabel={`${summary.approvedCount} siap cair`} icon={<Send className="h-5 w-5" />} />
        <ActionButton label="Riwayat" onClick={() => router.push('/keuangan/history')} sublabel={`${summary.disbursedCount} transaksi`} icon={<History className="h-5 w-5" />} />
      </div>

      {/* Recent Disbursements */}
      <Card className="shadow-sm">
        <CardHeader className="bg-muted/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Pencairan Terbaru</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/keuangan/history')}>
              Lihat Semua <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 max-h-64 overflow-y-auto divide-y">
            {recentDisbursements?.length > 0 ? recentDisbursements.map((d: any) => (
              <div key={d.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div>
                  <p className="font-medium text-sm">{d.user?.name}</p>
                  <p className="text-xs text-muted-foreground">{d.user?.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm text-emerald-600">{formatCurrency(d.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.disbursedAt ? new Date(d.disbursedAt).toLocaleDateString('id-ID') : '-'}
                  </p>
                </div>
              </div>
            )) : (
              <div className="py-4">
                <EmptyState icon={Wallet} title="Belum Ada Pencairan" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon, label, value, detail, borderColor, bgClass }: { icon: React.ReactNode; label: string; value: number; detail: string; borderColor: string; bgClass: string }) {
  return (
    <Card className={`shadow-sm border-l-4 ${borderColor} ${bgClass}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">{icon}</div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{detail}</p>
      </CardContent>
    </Card>
  )
}

function ActionButton({ label, onClick, sublabel, icon }: { label: string; onClick: () => void; sublabel: string; icon: React.ReactNode }) {
  return (
    <Button variant="outline" className="h-auto py-4 flex-col gap-2 shadow-sm" onClick={onClick}>
      {icon}
      <span className="font-medium">{label}</span>
      <span className="text-xs text-muted-foreground">{sublabel}</span>
    </Button>
  )
}
