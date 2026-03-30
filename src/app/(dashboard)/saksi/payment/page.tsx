'use client';

import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, getPaymentStatusVariant } from '@/components/common/StatusBadge';
import { Progress } from '@/components/ui/progress';
import {
  Wallet,
  CheckCircle2,
  Clock,
  ArrowRight,
  Calendar,
  Building2,
  CreditCard,
} from 'lucide-react';

const payment = {
  amount: 150000,
  status: 'PENDING',
  validationScore: 67,
  validations: {
    c1Uploaded: true,
    gpsVerified: true,
    dataInputted: false,
  },
  method: 'Bank BCA',
  account: '****7890',
  accountName: 'Ahmad Subekti',
};

const history = [
  {
    id: '1',
    date: '2024-02-10',
    amount: 150000,
    status: 'DISBURSED',
    method: 'Bank BCA',
  },
  {
    id: '2',
    date: '2024-01-15',
    amount: 150000,
    status: 'DISBURSED',
    method: 'Bank BCA',
  },
];

const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu Validasi',
  READY_FOR_PAYMENT: 'Siap Dibayar',
  APPROVED: 'Disetujui',
  DISBURSED: 'Dibayar',
  FAILED: 'Gagal',
  CANCELLED: 'Dibatalkan',
};

export default function SaksiPaymentPage() {
  const validationItems = [
    { label: 'Check-in Pagi', completed: payment.validations.gpsVerified },
    { label: 'Upload C1', completed: payment.validations.c1Uploaded },
    { label: 'Input Suara', completed: payment.validations.dataInputted },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Pembayaran"
        breadcrumbs={[{ label: 'Dashboard', href: '/saksi/dashboard' }, { label: 'Pembayaran' }]}
      />

      {/* Current Payment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Status Pembayaran Saat Ini
          </CardTitle>
          <CardDescription>Pembayaran berdasarkan kinerja Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nominal Pembayaran</p>
                  <p className="text-3xl font-bold">
                    Rp {payment.amount.toLocaleString('id-ID')}
                  </p>
                </div>
                <StatusBadge variant={getPaymentStatusVariant(payment.status)}>
                  {statusLabels[payment.status]}
                </StatusBadge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress Validasi</span>
                  <span className="font-medium">{payment.validationScore}%</span>
                </div>
                <Progress value={payment.validationScore} />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Checklist Validasi:</p>
                <div className="space-y-2">
                  {validationItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {item.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-500" />
                      )}
                      <span className={item.completed ? '' : 'text-muted-foreground'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {!payment.validations.dataInputted && (
                <Button>
                  Lengkapi Data
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="p-4 rounded-lg bg-muted space-y-3">
              <p className="text-sm font-medium">Informasi Pembayaran</p>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{payment.method}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>{payment.account}</span>
              </div>
              <p className="text-sm text-muted-foreground">a.n. {payment.accountName}</p>
              <Button variant="outline" size="sm" className="w-full">
                Ubah Metode Pembayaran
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Ketentuan Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• Pembayaran diberikan kepada saksi yang telah memenuhi semua persyaratan</p>
            <p>• Validasi 100% diperlukan untuk pembayaran (check-in pagi, input suara, check-in akhir)</p>
            <p>• Pembayaran diproses dalam 3-5 hari kerja setelah validasi lengkap</p>
            <p>• Pastikan informasi rekening/e-wallet sudah benar</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pembayaran</CardTitle>
          <CardDescription>Histori pembayaran yang pernah diterima</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">
                      Rp {item.amount.toLocaleString('id-ID')}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {item.date}
                    </div>
                  </div>
                </div>
                <StatusBadge variant="success">{statusLabels[item.status]}</StatusBadge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
