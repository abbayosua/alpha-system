'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Wallet, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'

const STATUS_CONFIG: Record<string, { color: string; dot: string }> = {
  PENDING: { color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  READY_FOR_PAYMENT: { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  APPROVED: { color: 'bg-teal-100 text-teal-700', dot: 'bg-teal-500' },
  DISBURSED: { color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  CANCELLED: { color: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
  FAILED: { color: 'bg-rose-100 text-rose-700', dot: 'bg-rose-500' },
}

export default function SaksiPaymentPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/payments/my')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((res) => {
        if (res.success) setPayments(res.data)
        else setError(res.error)
      })
      .catch((err) => setError(err.statusText || 'Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton variant="list" />

  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Pembayaran</h1>
          <p className="text-sm text-muted-foreground">Status pembayaran honor saksi</p>
        </div>
      </div>

      {payments.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="Belum Ada Data Pembayaran"
          description="Lakukan check-in terlebih dahulu untuk mengaktifkan pembayaran."
        />
      ) : (
        payments.map((p) => (
          <Card key={p.id} className="shadow-sm">
            <CardHeader className="pb-3 bg-muted/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  {formatCurrency(p.amount)}
                </CardTitle>
                <PaymentStatusBadge status={p.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 divide-y">
              {/* Validation Checklist */}
              <div className="pt-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Checklist Validasi ({p.validationScore}/3)</p>
                <div className="grid grid-cols-3 gap-2">
                  <CheckItem label="GPS" done={p.gpsVerified} />
                  <CheckItem label="Data Suara" done={p.dataInputted} />
                  <CheckItem label="Foto C1" done={p.c1Uploaded} />
                </div>
              </div>

              {/* Payment Details */}
              <div className="pt-3 space-y-2">
                {p.paymentMethod && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Metode: </span>
                    <span className="font-medium">{p.paymentMethod}</span>
                    {p.accountNumber && <span> - {p.accountNumber}</span>}
                    {p.accountName && <span> a.n. {p.accountName}</span>}
                  </div>
                )}

                {p.approvedAt && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Disetujui: {new Date(p.approvedAt).toLocaleString('id-ID')}
                  </p>
                )}

                {p.disbursedAt && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="h-3 w-3" /> Dicairkan: {new Date(p.disbursedAt).toLocaleString('id-ID')}
                  </p>
                )}

                <p className="text-xs text-muted-foreground">
                  Dibuat: {new Date(p.createdAt).toLocaleString('id-ID')}
                </p>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

function PaymentStatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] || { color: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500' }
  return (
    <Badge variant="secondary" className={`${c.color} gap-1.5`}>
      <span className={`inline-flex h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {status.replace(/_/g, ' ')}
    </Badge>
  )
}

function CheckItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-1 text-sm">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-gray-300 shrink-0" />
      )}
      <span className={done ? 'font-medium' : 'text-muted-foreground'}>{label}</span>
    </div>
  )
}
