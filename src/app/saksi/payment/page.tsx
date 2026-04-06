'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Wallet, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  READY_FOR_PAYMENT: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-purple-100 text-purple-700',
  DISBURSED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  FAILED: 'bg-red-100 text-red-700',
}

export default function SaksiPaymentPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/payments/my')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setPayments(res.data)
        else setError(res.error)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
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
          <h1 className="text-2xl font-bold">Pembayaran</h1>
          <p className="text-sm text-muted-foreground">Status pembayaran honor saksi</p>
        </div>
      </div>

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-center text-destructive text-sm">{error}</CardContent>
        </Card>
      )}

      {payments.length === 0 && !error ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada data pembayaran.</p>
            <p className="text-sm mt-1">Lakukan check-in terlebih dahulu.</p>
          </CardContent>
        </Card>
      ) : (
        payments.map((p) => (
          <Card key={p.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  {formatCurrency(p.amount)}
                </CardTitle>
                <Badge variant="secondary" className={STATUS_STYLES[p.status] || ''}>
                  {p.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Validation Checklist */}
              <div className="pt-2 border-t space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Checklist Validasi ({p.validationScore}/3)</p>
                <div className="grid grid-cols-3 gap-2">
                  <CheckItem label="GPS ✓" done={p.gpsVerified} />
                  <CheckItem label="Data Suara" done={p.dataInputted} />
                  <CheckItem label="Foto C1" done={p.c1Uploaded} />
                </div>
              </div>

              {/* Payment Details */}
              {p.paymentMethod && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Metode: </span>
                  <span>{p.paymentMethod}</span>
                  {p.accountNumber && <span> - {p.accountNumber}</span>}
                  {p.accountName && <span> a.n. {p.accountName}</span>}
                </div>
              )}

              {p.approvedAt && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Disetujui: {new Date(p.approvedAt).toLocaleString('id-ID')}
                </p>
              )}

              {p.disbursedAt && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Dicairkan: {new Date(p.disbursedAt).toLocaleString('id-ID')}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Dibuat: {new Date(p.createdAt).toLocaleString('id-ID')}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

function CheckItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-1 text-sm">
      {done ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-gray-300 shrink-0" />
      )}
      <span className={done ? '' : 'text-muted-foreground'}>{label}</span>
    </div>
  )
}
