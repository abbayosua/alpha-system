'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge, getPaymentStatusVariant } from '@/components/common/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { History, Search, Calendar, Download } from 'lucide-react';

const history = [
  { id: '1', date: '2024-02-14', name: 'Ahmad Subekti', method: 'Bank BCA', amount: 150000, status: 'DISBURSED' },
  { id: '2', date: '2024-02-14', name: 'Siti Rahayu', method: 'GoPay', amount: 150000, status: 'DISBURSED' },
  { id: '3', date: '2024-02-13', name: 'Budi Santoso', method: 'Bank Mandiri', amount: 150000, status: 'DISBURSED' },
  { id: '4', date: '2024-02-13', name: 'Dewi Lestari', method: 'DANA', amount: 150000, status: 'FAILED' },
  { id: '5', date: '2024-02-12', name: 'Eko Prasetyo', method: 'Bank BNI', amount: 150000, status: 'DISBURSED' },
];

export default function KeuanganHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter((h) =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDisbursed = history
    .filter((h) => h.status === 'DISBURSED')
    .reduce((acc, h) => acc + h.amount, 0);

  return (
    <div className="space-y-6">
      <Header
        title="Riwayat Pembayaran"
        breadcrumbs={[{ label: 'Dashboard', href: '/keuangan/dashboard' }, { label: 'Riwayat' }]}
      />

      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Dibayar</p>
            <p className="text-2xl font-bold text-green-600">
              Rp {totalDisbursed.toLocaleString('id-ID')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Transaksi</p>
            <p className="text-2xl font-bold">{history.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Gagal</p>
            <p className="text-2xl font-bold text-red-600">
              {history.filter((h) => h.status === 'FAILED').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">
          <Calendar className="mr-2 h-4 w-4" />
          Filter Tanggal
        </Button>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Semua Transaksi
          </CardTitle>
          <CardDescription>Riwayat semua pembayaran yang telah diproses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tanggal</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Metode</TableHead>
                <TableHead>Nominal</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.date}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.method}</TableCell>
                  <TableCell>Rp {item.amount.toLocaleString('id-ID')}</TableCell>
                  <TableCell>
                    <StatusBadge variant={getPaymentStatusVariant(item.status)}>
                      {item.status === 'DISBURSED' ? 'Berhasil' : 'Gagal'}
                    </StatusBadge>
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
