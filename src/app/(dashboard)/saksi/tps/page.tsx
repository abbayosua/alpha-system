'use client';

import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/StatusBadge';
import { MapPin, Calendar, Users, Navigation, Phone, Clock } from 'lucide-react';

export default function SaksiTPSPage() {
  const tps = {
    code: 'TPS 045',
    name: 'TPS 045 - Kelurahan Menteng',
    address: 'Jl. Menteng Raya No. 45, RT 003/RW 002',
    kelurahan: 'Menteng',
    kecamatan: 'Menteng',
    kota: 'Jakarta Pusat',
    province: 'DKI Jakarta',
    latitude: -6.1944,
    longitude: 106.8374,
    status: 'ACTIVE',
    assignedAt: '2024-02-10',
    totalVoters: 850,
  };

  const openMaps = () => {
    const url = `https://www.google.com/maps?q=${tps.latitude},${tps.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <Header
        title="TPS Saya"
        breadcrumbs={[{ label: 'Dashboard', href: '/saksi/dashboard' }, { label: 'TPS' }]}
      />

      {/* TPS Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                {tps.code}
              </CardTitle>
              <CardDescription>{tps.name}</CardDescription>
            </div>
            <StatusBadge variant="success">Aktif</StatusBadge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Address */}
          <div>
            <h3 className="font-medium mb-2">Alamat</h3>
            <p className="text-muted-foreground">{tps.address}</p>
            <p className="text-muted-foreground">
              Kelurahan {tps.kelurahan}, Kecamatan {tps.kecamatan}
            </p>
            <p className="text-muted-foreground">
              {tps.kota}, {tps.province}
            </p>
          </div>

          {/* Location */}
          <div>
            <h3 className="font-medium mb-2">Koordinat Lokasi</h3>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>Lat: {tps.latitude}</span>
              <span>•</span>
              <span>Long: {tps.longitude}</span>
            </div>
            <Button onClick={openMaps} variant="outline" className="mt-2">
              <Navigation className="mr-2 h-4 w-4" />
              Buka di Google Maps
            </Button>
          </div>

          {/* Assignment Info */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Tanggal Plotting</span>
              </div>
              <p className="font-medium">{tps.assignedAt}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                <span className="text-sm">Jumlah Pemilih</span>
              </div>
              <p className="font-medium">{tps.totalVoters} orang</p>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Status</span>
              </div>
              <p className="font-medium">Aktif</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Lokasi TPS</CardTitle>
          <CardDescription>Pastikan Anda berada di lokasi TPS saat check-in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Peta lokasi TPS akan ditampilkan di sini
              </p>
              <Button onClick={openMaps}>
                <Navigation className="mr-2 h-4 w-4" />
                Buka di Google Maps
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Check-in Reminder */}
      <Card className="border-primary">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Sudah Check-in Hari Ini?</h3>
              <p className="text-sm text-muted-foreground">
                Lakukan check-in di TPS untuk validasi kehadiran
              </p>
            </div>
            <Button>Lakukan Check-in</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
