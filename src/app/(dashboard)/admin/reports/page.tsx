'use client';

import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge, getReportStatusVariant } from '@/components/common/StatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useState } from 'react';

const reports = [
  {
    id: '1',
    title: 'Kotak suara tidak disegel saat pembukaan',
    reporter: 'Ahmad Subekti',
    tps: 'TPS 045',
    category: 'Administrasi',
    status: 'PENDING',
    date: '2024-02-14 08:30',
    description: 'Kotak suara ditemukan dalam keadaan tidak disegel saat pembukaan TPS pagi hari.',
  },
  {
    id: '2',
    title: 'Terjadi perekayasaan suara',
    reporter: 'Siti Rahayu',
    tps: 'TPS 046',
    category: 'Penggelembungan',
    status: 'UNDER_REVIEW',
    date: '2024-02-14 12:00',
    description: 'Diduga terjadi perekayasaan suara oleh saksi dari salah satu paslon.',
  },
  {
    id: '3',
    title: 'Intimidasi pemilih',
    reporter: 'Budi Santoso',
    tps: 'TPS 047',
    category: 'Intimidasi',
    status: 'VERIFIED',
    date: '2024-02-14 10:15',
    description: 'Terdapat oknum yang melakukan intimidasi terhadap pemilih di sekitar TPS.',
  },
  {
    id: '4',
    title: 'Laporan palsu',
    reporter: 'Dewi Lestari',
    tps: 'TPS 048',
    category: 'Lainnya',
    status: 'DISMISSED',
    date: '2024-02-14 14:00',
    description: 'Laporan ini ditolak karena tidak ditemukan bukti pendukung.',
  },
];

const statusLabels: Record<string, string> = {
  PENDING: 'Menunggu',
  UNDER_REVIEW: 'Ditinjau',
  VERIFIED: 'Terverifikasi',
  DISMISSED: 'Ditolak',
};

export default function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState<typeof reports[0] | null>(null);

  return (
    <div className="space-y-6">
      <Header
        title="Laporan Pelanggaran"
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Laporan' }]}
      />

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-200" />
              <div>
                <p className="text-2xl font-bold">
                  {reports.filter((r) => r.status === 'PENDING').length}
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-200">Menunggu</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-blue-600 dark:text-blue-200" />
              <div>
                <p className="text-2xl font-bold">
                  {reports.filter((r) => r.status === 'UNDER_REVIEW').length}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-200">Ditinjau</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-200" />
              <div>
                <p className="text-2xl font-bold">
                  {reports.filter((r) => r.status === 'VERIFIED').length}
                </p>
                <p className="text-sm text-green-600 dark:text-green-200">Terverifikasi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-200" />
              <div>
                <p className="text-2xl font-bold">
                  {reports.filter((r) => r.status === 'DISMISSED').length}
                </p>
                <p className="text-sm text-red-600 dark:text-red-200">Ditolak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Daftar Laporan
          </CardTitle>
          <CardDescription>Semua laporan pelanggaran dari saksi</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Pelapor</TableHead>
                <TableHead>TPS</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>{report.reporter}</TableCell>
                  <TableCell>{report.tps}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{report.category}</Badge>
                  </TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>
                    <StatusBadge variant={getReportStatusVariant(report.status)}>
                      {statusLabels[report.status]}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedReport?.title}</DialogTitle>
            <DialogDescription>
              {selectedReport?.tps} • {selectedReport?.date}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pelapor</p>
              <p>{selectedReport?.reporter}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Kategori</p>
              <Badge variant="secondary">{selectedReport?.category}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Deskripsi</p>
              <p>{selectedReport?.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <StatusBadge variant={getReportStatusVariant(selectedReport?.status || '')}>
                {statusLabels[selectedReport?.status || '']}
              </StatusBadge>
            </div>
            <div className="flex gap-2 pt-4">
              {selectedReport?.status === 'PENDING' && (
                <>
                  <Button variant="outline" className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    Mulai Tinjau
                  </Button>
                </>
              )}
              {selectedReport?.status === 'UNDER_REVIEW' && (
                <>
                  <Button variant="default" className="flex-1">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Verifikasi
                  </Button>
                  <Button variant="destructive" className="flex-1">
                    <XCircle className="mr-2 h-4 w-4" />
                    Tolak
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
