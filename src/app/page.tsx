'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, MapPin, ClipboardCheck, Camera, FileText, Wallet, Users, BarChart3, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="animate-pulse text-muted-foreground text-lg">Memuat...</div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    // Redirect to appropriate dashboard
    const dashboardPath = user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'ADMIN_KEUANGAN' ? '/keuangan/dashboard' : '/saksi/dashboard'
    router.replace(dashboardPath)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="animate-pulse text-muted-foreground text-lg">Mengalihkan...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">SAKSI APP</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.push('/auth/login')}>
              Masuk
            </Button>
            <Button onClick={() => router.push('/auth/register')}>
              Daftar Sekarang
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <Badge variant="secondary" className="mb-4">
          Sistem Manajemen Saksi Pemilu
        </Badge>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          Lindungi Suara Rakyat
          <br />
          <span className="text-primary">Dengan Teknologi Modern</span>
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Aplikasi terpadu untuk manajemen saksi pemilu. Check-in GPS, input suara real-time,
          pelaporan fraud, dan transparansi pembayaran.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => router.push('/auth/register')} className="text-lg px-8">
            Daftar Sebagai Saksi
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => router.push('/auth/login')} className="text-lg px-8">
            Masuk ke Akun
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Fitur Unggulan</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Semua yang Anda butuhkan untuk menjalankan tugas sebagai saksi pemilu
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<MapPin className="h-6 w-6" />}
            title="Plotting TPS"
            description="Plotting saksi ke TPS secara sistematis. Koordinat GPS untuk setiap lokasi TPS."
          />
          <FeatureCard
            icon={<ClipboardCheck className="h-6 w-6" />}
            title="GPS Check-in"
            description="Check-in pagi dan akhir dengan verifikasi GPS. Selfie sebagai bukti kehadiran."
          />
          <FeatureCard
            icon={<Camera className="h-6 w-6" />}
            title="Input Suara"
            description="Input hasil perhitungan suara real-time dengan foto C1 sebagai bukti."
          />
          <FeatureCard
            icon={<FileText className="h-6 w-6" />}
            title="Laporan Fraud"
            description="Laporkan kecurangan pemilu dengan video dan deskripsi detail."
          />
          <FeatureCard
            icon={<Wallet className="h-6 w-6" />}
            title="Pembayaran Transparan"
            description="Tracking pembayaran honor saksi secara transparan dan terverifikasi."
          />
          <FeatureCard
            icon={<BarChart3 className="h-6 w-6" />}
            title="Dashboard Real-time"
            description="Monitoring dan analitik real-time untuk admin dan tim keuangan."
          />
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-primary/5 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Cara Kerja</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              4 langkah sederhana untuk mulai bertugas
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard number={1} title="Daftar" description="Buat akun dan lengkapi data diri serta informasi pembayaran." />
            <StepCard number={2} title="Ditugaskan" description="Admin akan memplotting Anda ke TPS tertentu di wilayah Anda." />
            <StepCard number={3} title="Check-in" description="Lakukan check-in GPS saat tiba dan saat selesai bertugas." />
            <StepCard number={4} title="Input Suara" description="Input hasil perhitungan suara dan upload foto C1." />
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Multi-Role System</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Dibangun untuk mendukung berbagai peran dalam pengawasan pemilu
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-8 w-8 text-primary" />
                <CardTitle className="text-lg">Saksi</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Check-in GPS</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Input suara</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Laporan fraud</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Tracking pembayaran</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-primary" />
                <CardTitle className="text-lg">Admin</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Manajemen saksi</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Plotting TPS</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Monitoring check-in</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Review laporan</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="h-8 w-8 text-primary" />
                <CardTitle className="text-lg">Keuangan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Approval pembayaran</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Validasi data</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Pencairan dana</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Riwayat transaksi</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Siap Berkontribusi?</h2>
          <p className="text-primary-foreground/80 mb-8">
            Bergabunglah sebagai saksi pemilu dan lindungi suara rakyat Indonesia.
          </p>
          <Button size="lg" variant="secondary" onClick={() => router.push('/auth/register')} className="text-lg px-8">
            Daftar Sekarang
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SAKSI APP - Sistem Manajemen Saksi Pemilu</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="mb-2 text-primary">{icon}</div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-xl font-bold">
        {number}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
