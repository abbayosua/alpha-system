'use client';

import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, getPaymentStatusVariant } from '@/components/common/StatusBadge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreditCard, Eye, Check, MoreHorizontal, Filter } from 'lucide-react';

const payments = [
  { id: '1', name: 'Ahmad Subekti', email: 'ahmad@email.com', tps: 'TPS 045', validationScore: 100, status: 'READY_FOR_PAYMENT', amount: 150000, method: 'Bank BCA' },
  { id: '2', name: 'Siti Rahayu', email: 'siti@email.com', tps: 'TPS 046', validationScore: 100, status: 'READY_FOR_PAYMENT', amount: 150000, method: 'GoPay' },
  { id: '3', name: 'Eko Prasetyo', email: 'eko@email.com', tps: 'TPS 049', validationScore: 100, status: 'READY_FOR_PAYMENT', amount: 150000, method: 'Bank Mandiri' },
];

const statusLabels: Record<string, string> = {
  READY_FOR_PAYMENT: 'Siap Bayar',
};

export default function KeuanganPaymentsPage() {
  return (
    <div className="space-y-6">
      <Header
        title="Persetujuan Pembayaran"
        breadcrumbs={[{ label: 'Dashboard', href: '/keuangan/dashboard' }, { label: 'Pembayaran' }]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Pembayaran Siap Disetujui
          </CardTitle>
          <CardDescription>Daftar pembayaran yang validasi 100% dan siap disetujui</CardDescription>
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
                  <TableCell>{payment.method}</TableCell>
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
                        <DropdownMenuItem>
                          <Check className="mr-2 h-4 w-4" />
                          Setujui
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Tolak Semua</Button>
        <Button>Setujui Semua ({payments.length})</Button>
      </div>
    </div>
  );
}
