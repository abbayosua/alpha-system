'use client';

import { Header } from '@/components/layout/Header';
import { StatsCard } from '@/components/common/StatsCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { 
  MapPin, 
  Camera, 
  FileText, 
  AlertTriangle, 
  Wallet,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';
import Link from 'next/link';

export default function SaksiDashboardPage() {
  // Mock data - will be replaced with API data
  const stats = {
    tpsName: 'TPS 045 - Kelurahan Menteng',
    checkInStatus: 'pending', // pending, checked_in, completed
    voteInputStatus: false,
    finalCheckInStatus: false,
    paymentStatus: 'pending',
    paymentAmount: 150000,
  };

  const tasks = [
    {
      title: 'Check-in Pagi',
      description: 'Lakukan check-in pagi dengan selfie di TPS',
      href: '/saksi/check-in',
      status: stats.checkInStatus === 'pending' ? 'pending' : 'completed',
      icon: Camera,
    },
    {
      title: 'Input Hasil Suara',
      description: 'Input hasil perhitungan suara dan upload C1',
      href: '/saksi/input',
      status: stats.voteInputStatus ? 'completed' : 'pending',
      icon: FileText,
    },
    {
      title: 'Check-in Akhir',
      description: 'Check-in akhir setelah penghitungan selesai',
      href: '/saksi/final-check-in',
      status: stats.finalCheckInStatus ? 'completed' : 'pending',
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="space-y-6">
      <Header 
        title="Dashboard Saksi" 
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      {/* Welcome Card */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            TPS Anda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{stats.tpsName}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Jl. Menteng Raya No. 45, Menteng, Jakarta Pusat
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/saksi/tps">
              Lihat Detail TPS
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Task Checklist */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Tugas Hari Ini</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {tasks.map((task, index) => {
            const Icon = task.icon;
            const isCompleted = task.status === 'completed';
            return (
              <Card key={index} className={isCompleted ? 'border-green-500' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className={isCompleted ? 'text-green-500' : 'text-muted-foreground'} />
                    </div>
                    <StatusBadge variant={isCompleted ? 'success' : 'warning'}>
                      {isCompleted ? 'Selesai' : 'Belum'}
                    </StatusBadge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base">{task.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  {!isCompleted && (
                    <Button asChild size="sm" className="mt-3">
                      <Link href={task.href}>
                        Kerjakan
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Payment Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Status Pembayaran
          </CardTitle>
          <CardDescription>Status pembayaran berdasarkan kinerja Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <StatusBadge variant="warning">Menunggu Validasi</StatusBadge>
              </div>
              <p className="text-2xl font-bold">
                Rp {stats.paymentAmount.toLocaleString('id-ID')}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  {stats.checkInStatus !== 'pending' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  Check-in
                </span>
                <span className="flex items-center gap-1">
                  {stats.voteInputStatus ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  Input Suara
                </span>
                <span className="flex items-center gap-1">
                  {stats.finalCheckInStatus ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4" />
                  )}
                  Check-in Akhir
                </span>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link href="/saksi/payment">
                Lihat Detail
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Laporkan Pelanggaran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Menemukan kecurangan atau pelanggaran? Laporkan segera dengan bukti.
            </p>
            <Button asChild variant="destructive">
              <Link href="/saksi/lapor">
                Buat Laporan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Riwayat Aktivitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Check-in pagi</span>
                <span className="text-destructive">Belum dilakukan</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Input suara</span>
                <span className="text-destructive">Belum dilakukan</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Check-in akhir</span>
                <span className="text-destructive">Belum dilakukan</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
