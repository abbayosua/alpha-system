'use client';

import { Header } from '@/components/layout/Header';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GitBranch, ArrowRightLeft, CheckCircle2 } from 'lucide-react';

const saksiList = [
  { id: '1', name: 'Ahmad Subekti', status: 'assigned', tps: 'TPS 045' },
  { id: '2', name: 'Siti Rahayu', status: 'assigned', tps: 'TPS 046' },
  { id: '3', name: 'Budi Santoso', status: 'unassigned', tps: null },
  { id: '4', name: 'Dewi Lestari', status: 'unassigned', tps: null },
  { id: '5', name: 'Eko Prasetyo', status: 'assigned', tps: 'TPS 049' },
];

const tpsList = [
  { id: '1', code: 'TPS 045', name: 'TPS 045 Menteng', hasSaksi: true },
  { id: '2', code: 'TPS 046', name: 'TPS 046 Menteng', hasSaksi: true },
  { id: '3', code: 'TPS 047', name: 'TPS 047 Menteng', hasSaksi: false },
  { id: '4', code: 'TPS 048', name: 'TPS 048 Menteng', hasSaksi: false },
  { id: '5', code: 'TPS 049', name: 'TPS 049 Menteng', hasSaksi: true },
];

export default function AdminPlottingPage() {
  return (
    <div className="space-y-6">
      <Header
        title="Plotting Saksi"
        breadcrumbs={[{ label: 'Dashboard', href: '/admin/dashboard' }, { label: 'Plotting' }]}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Unassigned Saksi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Saksi Belum Ditugaskan
            </CardTitle>
            <CardDescription>Pilih saksi untuk ditugaskan ke TPS</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[150px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {saksiList.filter(s => s.status === 'unassigned').map((saksi) => (
                  <TableRow key={saksi.id}>
                    <TableCell className="font-medium">{saksi.name}</TableCell>
                    <TableCell>
                      <StatusBadge variant="warning">Belum ditugaskan</StatusBadge>
                    </TableCell>
                    <TableCell>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih TPS" />
                        </SelectTrigger>
                        <SelectContent>
                          {tpsList.filter(t => !t.hasSaksi).map((tps) => (
                            <SelectItem key={tps.id} value={tps.id}>
                              {tps.code}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* TPS without Saksi */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5" />
              TPS Tanpa Saksi
            </CardTitle>
            <CardDescription>TPS yang memerlukan penugasan saksi</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>TPS</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[150px]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tpsList.filter(t => !t.hasSaksi).map((tps) => (
                  <TableRow key={tps.id}>
                    <TableCell className="font-medium">{tps.code}</TableCell>
                    <TableCell>
                      <StatusBadge variant="danger">Tanpa saksi</StatusBadge>
                    </TableCell>
                    <TableCell>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih Saksi" />
                        </SelectTrigger>
                        <SelectContent>
                          {saksiList.filter(s => s.status === 'unassigned').map((saksi) => (
                            <SelectItem key={saksi.id} value={saksi.id}>
                              {saksi.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Current Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Penugasan Saat Ini
          </CardTitle>
          <CardDescription>Daftar penugasan saksi ke TPS</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Saksi</TableHead>
                <TableHead>TPS</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saksiList.filter(s => s.status === 'assigned').map((saksi) => (
                <TableRow key={saksi.id}>
                  <TableCell className="font-medium">{saksi.name}</TableCell>
                  <TableCell>{saksi.tps}</TableCell>
                  <TableCell>
                    <StatusBadge variant="success">Aktif</StatusBadge>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Batalkan
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">Reset Semua</Button>
        <Button>Simpan Perubahan</Button>
      </div>
    </div>
  );
}
