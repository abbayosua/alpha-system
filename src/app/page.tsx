'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Footer } from '@/components/layout/Footer';
import { 
  ClipboardList, 
  Users, 
  MapPin, 
  Camera, 
  Shield, 
  Wallet,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const features = [
  {
    icon: MapPin,
    title: 'GPS Verification',
    description: 'Verifikasi lokasi real-time untuk memastikan kehadiran di TPS yang tepat',
  },
  {
    icon: Camera,
    title: 'Selfie Check-in',
    description: 'Sistem check-in dengan foto selfie untuk validasi kehadiran',
  },
  {
    icon: ClipboardList,
    title: 'Input Suara',
    description: 'Input hasil perhitungan suara dengan upload dokumen C1',
  },
  {
    icon: Shield,
    title: 'Laporan Pelanggaran',
    description: 'Laporkan kecurangan atau pelanggaran dengan bukti video',
  },
  {
    icon: Wallet,
    title: 'Pembayaran Otomatis',
    description: 'Sistem pembayaran berbasis kinerja dengan validasi otomatis',
  },
  {
    icon: Users,
    title: 'Multi-Role System',
    description: 'Sistem dengan peran Admin, Admin Keuangan, dan Saksi',
  },
];

const benefits = [
  'Verifikasi kehadiran dengan GPS dan foto',
  'Input data suara secara real-time',
  'Laporan pelanggaran dengan bukti video',
  'Pembayaran transparan berdasarkan kinerja',
  'Dashboard monitoring untuk admin',
  'Audit trail lengkap semua aktivitas',
];

export default function HomePage() {
  return (
    <PageWrapper>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-background to-muted">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Shield className="h-4 w-4" />
                Sistem Manajemen Saksi Terpercaya
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
                SAKSI APP
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl">
                Platform terintegrasi untuk manajemen saksi pemilu dengan sistem verifikasi GPS, 
                input suara real-time, dan pembayaran berbasis kinerja.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/auth/register">
                    Daftar sebagai Saksi
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/auth/login">Masuk ke Akun</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/5 rounded-3xl blur-3xl" />
                <Card className="relative bg-card/80 backdrop-blur-sm border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      Statistik Sistem
                    </CardTitle>
                    <CardDescription>Data real-time sistem SAKSI APP</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">1,234</p>
                        <p className="text-sm text-muted-foreground">Total Saksi</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">567</p>
                        <p className="text-sm text-muted-foreground">TPS Aktif</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">89%</p>
                        <p className="text-sm text-muted-foreground">Check-in Rate</p>
                      </div>
                      <div className="p-4 rounded-lg bg-muted">
                        <p className="text-2xl font-bold">456</p>
                        <p className="text-sm text-muted-foreground">Data Terinput</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Fitur Unggulan</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sistem lengkap untuk mengelola saksi pemilu dengan transparansi dan akuntabilitas tinggi
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Mengapa Memilih SAKSI APP?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-6 text-center">
                  <p className="text-4xl font-bold text-primary mb-2">99%</p>
                  <p className="text-sm text-muted-foreground">Akurasi Data</p>
                </Card>
                <Card className="p-6 text-center">
                  <p className="text-4xl font-bold text-primary mb-2">24/7</p>
                  <p className="text-sm text-muted-foreground">Akses Sistem</p>
                </Card>
                <Card className="p-6 text-center">
                  <p className="text-4xl font-bold text-primary mb-2">100%</p>
                  <p className="text-sm text-muted-foreground">Transparansi</p>
                </Card>
                <Card className="p-6 text-center">
                  <p className="text-4xl font-bold text-primary mb-2">Real-time</p>
                  <p className="text-sm text-muted-foreground">Monitoring</p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Siap Bergabung sebagai Saksi?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Daftarkan diri Anda sekarang dan berkontribusi dalam menjaga transparansi pemilu
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link href="/auth/register">
                Daftar Sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Link href="/auth/login">Sudah Punya Akun? Masuk</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </PageWrapper>
  );
}
