'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MapPin, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

// Mock TPS data with progress
const tpsData = [
  { id: '1', code: 'TPS 001', name: 'TPS 001 Menteng', lat: -6.1944, lng: 106.8374, saksiName: 'Ahmad Subekti', progress: 100, status: 'completed', checkInTime: '07:15' },
  { id: '2', code: 'TPS 002', name: 'TPS 002 Menteng', lat: -6.1950, lng: 106.8380, saksiName: 'Siti Rahayu', progress: 67, status: 'in_progress', checkInTime: '07:30' },
  { id: '3', code: 'TPS 003', name: 'TPS 003 Menteng', lat: -6.1960, lng: 106.8390, saksiName: 'Budi Santoso', progress: 33, status: 'in_progress', checkInTime: '07:45' },
  { id: '4', code: 'TPS 004', name: 'TPS 004 Menteng', lat: -6.1940, lng: 106.8400, saksiName: 'Dewi Lestari', progress: 100, status: 'completed', checkInTime: '07:20' },
  { id: '5', code: 'TPS 005', name: 'TPS 005 Menteng', lat: -6.1930, lng: 106.8360, saksiName: null, progress: 0, status: 'no_saksi', checkInTime: null },
  { id: '6', code: 'TPS 006', name: 'TPS 006 Menteng', lat: -6.1920, lng: 106.8385, saksiName: 'Eko Prasetyo', progress: 100, status: 'completed', checkInTime: '07:10' },
  { id: '7', code: 'TPS 007', name: 'TPS 007 Menteng', lat: -6.1955, lng: 106.8355, saksiName: 'Rina Wati', progress: 0, status: 'pending', checkInTime: null },
  { id: '8', code: 'TPS 008', name: 'TPS 008 Menteng', lat: -6.1965, lng: 106.8370, saksiName: 'Agus Setiawan', progress: 67, status: 'in_progress', checkInTime: '08:00' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed': return '#22c55e';
    case 'in_progress': return '#f59e0b';
    case 'pending': return '#6b7280';
    case 'no_saksi': return '#ef4444';
    default: return '#6b7280';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'completed': return 'Selesai';
    case 'in_progress': return 'Dalam Proses';
    case 'pending': return 'Menunggu';
    case 'no_saksi': return 'Tidak Ada Saksi';
    default: return 'Unknown';
  }
};

interface TPSMapProps {
  className?: string;
}

export function TPSMap({ className }: TPSMapProps) {
  // Calculate stats using useMemo
  const stats = useMemo(() => ({
    total: tpsData.length,
    completed: tpsData.filter(t => t.status === 'completed').length,
    inProgress: tpsData.filter(t => t.status === 'in_progress').length,
    pending: tpsData.filter(t => t.status === 'pending').length,
    noSaksi: tpsData.filter(t => t.status === 'no_saksi').length,
  }), []);

  const completionRate = Math.round((stats.completed / stats.total) * 100);

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-muted/50">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total TPS</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 dark:text-green-300">Selesai</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-700 dark:text-yellow-300">Proses</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-yellow-600">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Menunggu</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-gray-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700 dark:text-red-300">No Saksi</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-red-600">{stats.noSaksi}</p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress Keseluruhan</span>
            <span className="text-sm font-bold">{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-3" />
        </CardContent>
      </Card>

      {/* Map Placeholder - Will show interactive map */}
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Peta Progress TPS
          </CardTitle>
          <CardDescription>
            Visualisasi lokasi dan progress TPS
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative h-[500px] rounded-b-lg overflow-hidden bg-muted flex items-center justify-center">
            <div className="text-center p-8">
              <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Peta TPS</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Fitur peta interaktif memerlukan konfigurasi tambahan.
                Hubungi administrator untuk mengaktifkan fitur ini.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {tpsData.slice(0, 4).map((tps) => (
                  <div key={tps.id} className="p-3 bg-background rounded-lg border text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getStatusColor(tps.status) }}
                      />
                      <span className="text-sm font-medium">{tps.code}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{tps.saksiName || 'Tidak ada saksi'}</p>
                    <div className="mt-2">
                      <Progress value={tps.progress} className="h-1" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TPS List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar TPS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 max-h-60 overflow-y-auto">
            {tpsData.map((tps) => (
              <div key={tps.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getStatusColor(tps.status) }}
                  />
                  <div>
                    <p className="font-medium text-sm">{tps.code}</p>
                    <p className="text-xs text-muted-foreground">{tps.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm">{tps.saksiName || '-'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={tps.progress} className="w-16 h-1" />
                      <span className="text-xs text-muted-foreground">{tps.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium">Keterangan:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>Selesai (100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
              <span>Dalam Proses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-500"></div>
              <span>Menunggu</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span>Tidak Ada Saksi</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
