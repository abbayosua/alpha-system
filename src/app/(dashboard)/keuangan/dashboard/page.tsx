'use client';

import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/common/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, getPaymentStatusVariant } from '@/components/common/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Wallet,
  CreditCard,
  CheckCircle2,
  Clock,
  Users,
  DollarSign,
  ArrowRight,
  Eye,
  Check,
  X,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

const stats = {
  pendingPayments: 245,
  readyForPayment: 156,
  totalDisbursed: 989,
  totalAmount: 148350000,
};

const payments = [
  {
    id: '1',
    name: 'Ahmad Subekti',
    email: 'ahmad@email.com',
    tps: 'TPS 045',
    validationScore: 100,
    status: 'READY_FOR_PAYMENT',
    amount: 150000,
    method: 'Bank BCA',
    account: '****7890',
  },
  {
    id: '2',
    name: 'Siti Rahayu',
    email: 'siti@email.com',
    tps: 'TPS 046',
    validationScore: 100,
    status: 'APPROVED',
    amount: 150000,
    method: 'GoPay',
    account: '08123456789',
  },
  {
    id: '3',
    name: 'Budi Santoso',
    email: 'budi@email.com',
    tps: 'TPS 047',
    validationScore: 67,
    status: 'PENDING',
    amount: 150000,
    method: 'Bank Mandiri',
    account: '****1234',
  },
  {
    id: '4',
    name: 'Dewi Lestari',
    email: 'dewi@email.com',
    tps: 'TPS 048',
    validationScore: 100,
    status: 'DISBURSED',
    amount: 150000,
    method: 'DANA',
    account: '08123456788',
  },
  {
    id: '5',
    name: 'Eko Prasetyo',
    email: 'eko@email.com',
    tps: 'TPS 049',
    validationScore: 33,
    status: 'PENDING',
    amount: 150000,
    method: 'Bank BNI',
    account: '****5678',
  },
];

const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu',
  READY_FOR_PAYMENT: 'Siap Bayar',
  APPROVED: 'Disetujui',
  DISBURSED: 'Dibayar',
  FAILED: 'Gagal',
  CANCELLED: 'Dibatalkan',
};

export default function KeuanganDashboardPage() {
  return (
    <div className="space-y-6">
      <Header
        title="Dashboard Keuangan"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Menunggu Validasi"
          value={stats.pendingPayments}
          icon={Clock}
          description="Pembayaran pending"
        />
        <StatsCard
          title="Siap Dibayar"
          value={stats.readyForPayment}
          icon={CheckCircle2}
          description="Validasi 100%"
        />
        <StatsCard
          title="Total Dibayar"
          value={stats.totalDisbursed}
          icon={Users}
          description="Saksi telah dibayar"
        />
        <StatsCard
          title="Total Nominal"
          value={`Rp ${(stats.totalAmount / 1000000).toFixed(1)}jt`}
          icon={DollarSign}
          description="Total pembayaran"
        />
      </div>

      {/* Payment Status Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-800">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-200" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingPayments}</p>
                <p className="text-sm text-yellow-600 dark:text-yellow-200">Menunggu Validasi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800">
                <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-200" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.readyForPayment}</p>
                <p className="text-sm text-blue-600 dark:text-blue-200">Siap Dibayar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-800">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-200" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDisbursed}</p>
                <p className="text-sm text-green-600 dark:text-green-200">Sudah Dibayar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Wallet className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  Rp {(stats.totalAmount / 1000000).toFixed(1)}jt
                </p>
                <p className="text-sm text-muted-foreground">Total Pembayaran</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Pembayaran</CardTitle>
            <CardDescription>Kelola pembayaran saksi berdasarkan kinerja</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Filter
            </Button>
            <Button size="sm">
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>TPS</TableHead>
                <TableHead>Validasi</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payment.name}</p>
                      <p className="text-sm text-muted-foreground">{payment.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{payment.tps}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={payment.validationScore} className="w-16 h-2" />
                      <span className="text-sm">{payment.validationScore}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{payment.method}</p>
                      <p className="text-xs text-muted-foreground">{payment.account}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    Rp {payment.amount.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={getPaymentStatusVariant(payment.status)}>
                      {statusLabels[payment.status]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Lihat Detail
                        </DropdownMenuItem>
                        {payment.status === 'READY_FOR_PAYMENT' && (
                          <DropdownMenuItem>
                            <Check className="mr-2 h-4 w-4" />
                            Setujui Pembayaran
                          </DropdownMenuItem>
                        )}
                        {payment.status === 'APPROVED' && (
                          <DropdownMenuItem>
                            <Wallet className="mr-2 h-4 w-4" />
                            Proses Transfer
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Proses Pembayaran
            </CardTitle>
            <CardDescription>
              {stats.readyForPayment} pembayaran siap diproses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">
              Proses Semua Pembayaran
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Riwayat Pembayaran
            </CardTitle>
            <CardDescription>Lihat semua riwayat transaksi</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              Lihat Riwayat
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
