'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Users, Plus, Eye, Edit, Trash2, MoreHorizontal, Search, Filter } from 'lucide-react';

const saksiList = [
  { id: '1', name: 'Ahmad Subekti', email: 'ahmad@email.com', phone: '081234567890', tps: 'TPS 045', status: 'ACTIVE', ktpNumber: '3171234567890001' },
  { id: '2', name: 'Siti Rahayu', email: 'siti@email.com', phone: '081234567891', tps: 'TPS 046', status: 'ACTIVE', ktpNumber: '3171234567890002' },
  { id: '3', name: 'Budi Santoso', email: 'budi@email.com', phone: '081234567892', tps: 'TPS 047', status: 'ACTIVE', ktpNumber: '3171234567890003' },
  { id: '4', name: 'Dewi Lestari', email: 'dewi@email.com', phone: '081234567893', tps: 'Belum ditugaskan', status: 'PENDING', ktpNumber: '3171234567890004' },
  { id: '5', name: 'Eko Prasetyo', email: 'eko@email.com', phone: '081234567894', tps: 'TPS 049', status: 'ACTIVE', ktpNumber: '3171234567890005' },
];

export default function AdminSaksiPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSaksi = saksiList.filter((saksi) =>
    saksi.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    saksi.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Header
        title="Kelola Saksi"
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Saksi' }]}
      />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari saksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Saksi
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Saksi Baru</DialogTitle>
              <DialogDescription>
                Isi form di bawah untuk menambahkan saksi baru
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input placeholder="Nama Lengkap" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Nomor Telepon" />
              <Input placeholder="NIK" maxLength={16} />
              <Button className="w-full">Simpan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>NIK</TableHead>
                <TableHead>TPS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSaksi.map((saksi) => (
                <TableRow key={saksi.id}>
                  <TableCell className="font-medium">{saksi.name}</TableCell>
                  <TableCell>{saksi.email}</TableCell>
                  <TableCell>{saksi.phone}</TableCell>
                  <TableCell>{saksi.ktpNumber}</TableCell>
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

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{saksiList.length}</div>
            <p className="text-sm text-muted-foreground">Total Saksi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {saksiList.filter((s) => s.status === 'ACTIVE').length}
            </div>
            <p className="text-sm text-muted-foreground">Saksi Aktif</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {saksiList.filter((s) => s.tps === 'Belum ditugaskan').length}
            </div>
            <p className="text-sm text-muted-foreground">Belum Ditugaskan</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
