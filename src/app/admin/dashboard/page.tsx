'use client';

import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/common/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Users,
  Building2,
  Camera,
  FileText,
  AlertTriangle,
  Wallet,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

// Mock data
const stats = {
  totalSaksi: 1234,
  totalTPS: 567,
  checkInRate: 89,
  dataInputRate: 76,
};

const recentSaksi = [
  { id: '1', name: 'Ahmad Subekti', email: 'ahmad@email.com', phone: '081234567890', tps: 'TPS 045', status: 'ACTIVE' },
  { id: '2', name: 'Siti Rahayu', email: 'siti@email.com', phone: '081234567891', tps: 'TPS 046', status: 'ACTIVE' },
  { id: '3', name: 'Budi Santoso', email: 'budi@email.com', phone: '081234567892', tps: 'TPS 047', status: 'ACTIVE' },
  { id: '4', name: 'Dewi Lestari', email: 'dewi@email.com', phone: '081234567893', tps: 'TPS 048', status: 'PENDING' },
  { id: '5', name: 'Eko Prasetyo', email: 'eko@email.com', phone: '081234567894', tps: 'TPS 049', status: 'ACTIVE' },
];

const recentReports = [
  { id: '1', title: 'Kotak suara tidak disegel', status: 'PENDING', reporter: 'Ahmad Subekti', date: '2024-02-14' },
  { id: '2', title: 'Terjadi perekayasaan suara', status: 'UNDER_REVIEW', reporter: 'Siti Rahayu', date: '2024-02-14' },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <Header
        title="Dashboard Admin"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Saksi"
          value={stats.totalSaksi.toLocaleString()}
          icon={Users}
          description="Saksi terdaftar"
        />
        <StatsCard
          title="Total TPS"
          value={stats.totalTPS.toLocaleString()}
          icon={Building2}
          description="TPS aktif"
        />
        <StatsCard
          title="Check-in Rate"
          value={`${stats.checkInRate}%`}
          icon={Camera}
          description="Saksi sudah check-in"
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatsCard
          title="Data Input Rate"
          value={`${stats.dataInputRate}%`}
          icon={FileText}
          description="Data suara terinput"
          trend={{ value: 12.3, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Saksi
        </Button>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Tambah TPS
        </Button>
        <Button variant="outline">
          <Users className="mr-2 h-4 w-4" />
          Plotting Saksi
        </Button>
      </div>

      {/* Recent Saksi */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Saksi Terbaru</CardTitle>
            <CardDescription>Daftar saksi yang baru terdaftar</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Lihat Semua
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>TPS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSaksi.map((saksi) => (
                <TableRow key={saksi.id}>
                  <TableCell className="font-medium">{saksi.name}</TableCell>
                  <TableCell>{saksi.email}</TableCell>
                  <TableCell>{saksi.phone}</TableCell>
                  <TableCell>{saksi.tps}</TableCell>
                  <TableCell>
                    <StatusBadge variant={saksi.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {saksi.status === 'ACTIVE' ? 'Aktif' : 'Pending'}
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
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
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

      {/* Recent Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Laporan Terbaru
            </CardTitle>
            <CardDescription>Laporan pelanggaran dari saksi</CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Lihat Semua
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Pelapor</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>{report.reporter}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>
                    <StatusBadge variant={report.status === 'PENDING' ? 'warning' : 'info'}>
                      {report.status === 'PENDING' ? 'Menunggu' : 'Ditinjau'}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Menunggu Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">245</p>
            <p className="text-sm text-muted-foreground">Saksi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Pembayaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rp 36.750.000</p>
            <p className="text-sm text-muted-foreground">245 x Rp 150.000</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sudah Dibayar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">989</p>
            <p className="text-sm text-muted-foreground">Saksi</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
