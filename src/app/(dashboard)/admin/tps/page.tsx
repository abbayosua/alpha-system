'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
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
import { Building2, Plus, Eye, Edit, Trash2, MoreHorizontal, Search, MapPin } from 'lucide-react';

const tpsList = [
  { id: '1', code: 'TPS 045', name: 'TPS 045 Menteng', address: 'Jl. Menteng Raya No. 45', kelurahan: 'Menteng', kecamatan: 'Menteng', saksiCount: 1 },
  { id: '2', code: 'TPS 046', name: 'TPS 046 Menteng', address: 'Jl. Menteng Raya No. 46', kelurahan: 'Menteng', kecamatan: 'Menteng', saksiCount: 1 },
  { id: '3', code: 'TPS 047', name: 'TPS 047 Menteng', address: 'Jl. Menteng Raya No. 47', kelurahan: 'Menteng', kecamatan: 'Menteng', saksiCount: 1 },
  { id: '4', code: 'TPS 048', name: 'TPS 048 Menteng', address: 'Jl. Menteng Raya No. 48', kelurahan: 'Menteng', kecamatan: 'Menteng', saksiCount: 0 },
  { id: '5', code: 'TPS 049', name: 'TPS 049 Menteng', address: 'Jl. Menteng Raya No. 49', kelurahan: 'Menteng', kecamatan: 'Menteng', saksiCount: 1 },
];

export default function AdminTPSPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTPS = tpsList.filter((tps) =>
    tps.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tps.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tps.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Header
        title="Kelola TPS"
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'TPS' }]}
      />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari TPS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah TPS
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah TPS Baru</DialogTitle>
              <DialogDescription>
                Isi form di bawah untuk menambahkan TPS baru
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Input placeholder="Kode TPS (contoh: TPS 001)" />
              <Input placeholder="Nama TPS" />
              <Input placeholder="Alamat Lengkap" />
              <Input placeholder="Kelurahan" />
              <Input placeholder="Kecamatan" />
              <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Latitude" type="number" step="any" />
                <Input placeholder="Longitude" type="number" step="any" />
              </div>
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
                <TableHead>Kode</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Kelurahan</TableHead>
                <TableHead>Kecamatan</TableHead>
                <TableHead>Jumlah Saksi</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTPS.map((tps) => (
                <TableRow key={tps.id}>
                  <TableCell className="font-medium">{tps.code}</TableCell>
                  <TableCell>{tps.name}</TableCell>
                  <TableCell>{tps.address}</TableCell>
                  <TableCell>{tps.kelurahan}</TableCell>
                  <TableCell>{tps.kecamatan}</TableCell>
                  <TableCell>
                    <StatusBadge variant={tps.saksiCount > 0 ? 'success' : 'warning'}>
                      {tps.saksiCount} saksi
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
                          <MapPin className="mr-2 h-4 w-4" />
                          Lihat di Peta
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
            <div className="text-2xl font-bold">{tpsList.length}</div>
            <p className="text-sm text-muted-foreground">Total TPS</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {tpsList.filter((t) => t.saksiCount > 0).length}
            </div>
            <p className="text-sm text-muted-foreground">TPS dengan Saksi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {tpsList.filter((t) => t.saksiCount === 0).length}
            </div>
            <p className="text-sm text-muted-foreground">TPS Tanpa Saksi</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
