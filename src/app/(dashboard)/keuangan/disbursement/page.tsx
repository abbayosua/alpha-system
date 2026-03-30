'use client';

import { Header } from '@/components/layout/Header';
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
import { Wallet, Send, CheckCircle2, Eye } from 'lucide-react';

const approvedPayments = [
  { id: '1', name: 'Ahmad Subekti', email: 'ahmad@email.com', method: 'Bank BCA', account: '****7890', amount: 150000, status: 'APPROVED' },
  { id: '2', name: 'Siti Rahayu', email: 'siti@email.com', method: 'GoPay', account: '08123456789', amount: 150000, status: 'APPROVED' },
  { id: '3', name: 'Eko Prasetyo', email: 'eko@email.com', method: 'Bank Mandiri', account: '****1234', amount: 150000, status: 'APPROVED' },
];

export default function KeuanganDisbursementPage() {
  return (
    <div className="space-y-6">
      <Header
        title="Disbursement"
        breadcrumbs={[{ label: 'Dashboard', href: '/keuangan/dashboard' }, { label: 'Disbursement' }]}
      />

      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                {approvedPayments.length} Pembayaran Siap Transfer
              </h3>
              <p className="text-sm text-green-600 dark:text-green-300">
                Total: Rp {(approvedPayments.length * 150000).toLocaleString('id-ID')}
              </p>
            </div>
            <Button className="bg-green-600 hover:bg-green-700">
              <Send className="mr-2 h-4 w-4" />
              Proses Semua
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Pembayaran Disetujui
          </CardTitle>
          <CardDescription>Daftar pembayaran yang siap untuk ditransfer</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Tujuan</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvedPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{payment.name}</p>
                      <p className="text-sm text-muted-foreground">{payment.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell className="font-mono">{payment.account}</TableCell>
                  <TableCell className="font-medium">
                    Rp {payment.amount.toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={getPaymentStatusVariant(payment.status)}>
                      Disetujui
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Transfer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
