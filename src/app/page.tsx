'use client'

import { useEffect, useState, useRef, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Shield, MapPin, ClipboardCheck, Camera, FileText, Wallet,
  Users, BarChart3, ArrowRight, CheckCircle2, LayoutDashboard,
  Phone, Mail, Heart, Eye, AlertTriangle, UserPlus
} from 'lucide-react'
import { ActivityTimeline } from '@/components/charts/ActivityTimeline'

/* ─── Animated Counter ─── */
function useAnimatedCounter(end: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!startOnView) {
      // Start with a small delay for stagger effect
      const timer = setTimeout(() => setStarted(true), 300)
      return () => clearTimeout(timer)
    }
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect() } },
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [startOnView])

  useEffect(() => {
    if (!started) return
    let raf: number
    const startTime = performance.now()
    const step = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * end))
      if (progress < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [started, end, duration])

  return { count, ref }
}

/* ─── Fade-in on Scroll ─── */
function FadeInSection({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect() } },
      { threshold: 0.15 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}

/* ─── Stat Card ─── */
function StatItem({ icon, value, suffix, label }: { icon: ReactNode; value: number; suffix: string; label: string }) {
  const { count, ref } = useAnimatedCounter(value, 2000, false)
  return (
    <div ref={ref} className="text-center space-y-2">
      <div className="flex justify-center text-emerald-500 mb-1">{icon}</div>
      <div className="text-3xl sm:text-4xl font-bold text-foreground">
        {count.toLocaleString('id-ID')}{suffix}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export default function Home() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuthStore()

  const getDashboardPath = () => {
    if (!user) return '/auth/login'
    return user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'ADMIN_KEUANGAN' ? '/keuangan/dashboard' : '/saksi/dashboard'
  }

  const getRoleLabel = () => {
    if (!user) return ''
    return user.role === 'ADMIN' ? 'Admin' : user.role === 'ADMIN_KEUANGAN' ? 'Keuangan' : 'Saksi'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50">
        <div className="animate-pulse text-muted-foreground text-lg">Memuat...</div>
      </div>
    )
  }

  const features = [
    { icon: <MapPin className="h-6 w-6" />, title: 'Plotting TPS', description: 'Plotting saksi ke TPS secara sistematis. Koordinat GPS untuk setiap lokasi TPS.', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' },
    { icon: <ClipboardCheck className="h-6 w-6" />, title: 'GPS Check-in', description: 'Check-in pagi dan akhir dengan verifikasi GPS. Selfie sebagai bukti kehadiran.', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400' },
    { icon: <Camera className="h-6 w-6" />, title: 'Input Suara', description: 'Input hasil perhitungan suara real-time dengan foto C1 sebagai bukti.', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400' },
    { icon: <FileText className="h-6 w-6" />, title: 'Laporan Fraud', description: 'Laporkan kecurangan pemilu dengan video dan deskripsi detail.', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400' },
    { icon: <Wallet className="h-6 w-6" />, title: 'Pembayaran Transparan', description: 'Tracking pembayaran honor saksi secara transparan dan terverifikasi.', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' },
    { icon: <BarChart3 className="h-6 w-6" />, title: 'Dashboard Real-time', description: 'Monitoring dan analitik real-time untuk admin dan tim keuangan.', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400' },
  ]

  const steps = [
    { number: 1, title: 'Daftar', description: 'Buat akun dan lengkapi data diri serta informasi pembayaran.' },
    { number: 2, title: 'Ditugaskan', description: 'Admin akan memplotting Anda ke TPS tertentu di wilayah Anda.' },
    { number: 3, title: 'Check-in', description: 'Lakukan check-in GPS saat tiba dan saat selesai bertugas.' },
    { number: 4, title: 'Input Suara', description: 'Input hasil perhitungan suara dan upload foto C1.' },
  ]

  const roles = [
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Saksi',
      gradient: 'from-emerald-500 to-emerald-700',
      bgGradient: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-950/50',
      items: ['Check-in GPS', 'Input suara', 'Laporan fraud', 'Tracking pembayaran'],
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: 'Admin',
      gradient: 'from-teal-500 to-teal-700',
      bgGradient: 'from-teal-50 to-teal-100 dark:from-teal-950/30 dark:to-teal-950/50',
      items: ['Manajemen saksi', 'Plotting TPS', 'Monitoring check-in', 'Review laporan'],
    },
    {
      icon: <Wallet className="h-6 w-6" />,
      title: 'Keuangan',
      gradient: 'from-amber-500 to-amber-700',
      bgGradient: 'from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-950/50',
      items: ['Approval pembayaran', 'Validasi data', 'Pencairan dana', 'Riwayat transaksi'],
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 rounded-lg overflow-hidden">
              <Image src="/logo.png" alt="Alpha System v5" fill className="object-cover" />
            </div>
            <span className="text-xl font-bold">Alpha System v5</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.name} · {getRoleLabel()}
                </span>
                <Button onClick={() => router.push(getDashboardPath())}>
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => router.push('/auth/login')}>Masuk</Button>
                <Button onClick={() => router.push('/auth/register')}>Daftar Sekarang</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-amber-50 dark:from-emerald-950 dark:via-slate-900 dark:to-slate-950"
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            style={{ backgroundSize: '400% 400%' }}
          />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-emerald-200/20 dark:bg-emerald-900/15 blur-3xl"
            animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            style={{ top: '10%', left: '10%' }}
          />
          <motion.div
            className="absolute w-48 h-48 rounded-full bg-teal-200/20 dark:bg-teal-900/15 blur-3xl"
            animate={{ x: [0, -30, 20, 0], y: [0, 20, -30, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
            style={{ top: '60%', right: '10%' }}
          />
          <motion.div
            className="absolute w-32 h-32 rounded-full bg-amber-200/20 dark:bg-amber-900/15 blur-3xl"
            animate={{ x: [0, 20, -10, 0], y: [0, -15, 25, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            style={{ bottom: '15%', left: '40%' }}
          />
          {/* Subtle dots pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="outline" className="mb-6 px-4 py-1.5 border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-emerald-700 dark:text-emerald-400 gap-2">
              <motion.span
                className="inline-flex h-2 w-2 rounded-full bg-emerald-500"
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              Live — Sistem Manajemen Saksi Pemilu
            </Badge>
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Lindungi Suara Rakyat
            <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Dengan Teknologi Modern
            </span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Aplikasi terpadu untuk manajemen saksi pemilu. Check-in GPS, input suara real-time,
            pelaporan fraud, dan transparansi pembayaran.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {isAuthenticated && user ? (
              <Button size="lg" onClick={() => router.push(getDashboardPath())} className="text-lg px-8 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Buka Dashboard {getRoleLabel()}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => router.push('/auth/register')} className="text-lg px-8 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20">
                  Daftar Sebagai Saksi
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => router.push('/auth/login')} className="text-lg px-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                  Masuk ke Akun
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── Features Section ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
        {/* Subtle decorative pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.015]">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full border border-emerald-400" />
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full border border-teal-400" />
        </div>

        <FadeInSection className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Fitur Unggulan</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Semua yang Anda butuhkan untuk menjalankan tugas sebagai saksi pemilu
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FadeInSection key={feature.title} delay={i * 0.08}>
              <Card className="shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full border-0 bg-white dark:bg-slate-800">
                <CardHeader>
                  <div className={`mb-3 p-2.5 rounded-xl inline-flex ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ─── How it Works ─── */}
      <section className="relative bg-emerald-50/50 dark:bg-emerald-950/20 py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Cara Kerja</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              4 langkah sederhana untuk mulai bertugas
            </p>
          </FadeInSection>

          <div className="relative">
            {/* Connecting line - desktop only */}
            <div className="hidden lg:block absolute top-6 left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-0.5 bg-emerald-200 dark:bg-emerald-800 z-0">
              <motion.div
                className="h-full bg-emerald-500"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                style={{ transformOrigin: 'left' }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {steps.map((step, i) => (
                <FadeInSection key={step.number} delay={i * 0.15}>
                  <div className="text-center">
                    <motion.div
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mx-auto mb-5 text-xl font-bold shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.6 + i * 0.15, type: 'spring', stiffness: 200 }}
                    >
                      {step.number}
                    </motion.div>
                    <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </FadeInSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Aktivitas Terkini Section ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <FadeInSection className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Aktivitas Terkini</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Pantau aktivitas terbaru dalam sistem pengawasan pemilu secara real-time
          </p>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <Card className="shadow-sm rounded-xl overflow-hidden border-0">
            {/* Gradient title area */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Aktivitas Terbaru</h3>
                  <p className="text-sm text-emerald-100">Update real-time dari seluruh sistem</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <ActivityTimeline
                items={[
                  { id: '1', title: 'Admin menambahkan TPS baru', description: 'TPS-006 telah ditambahkan di Kecamatan Menteng', time: '2 menit lalu', icon: <MapPin className="h-4 w-4" />, color: '#10b981' },
                  { id: '2', title: 'Check-in pagi berhasil', description: 'Saksi Budi menyelesaikan check-in di TPS-003', time: '15 menit lalu', icon: <ClipboardCheck className="h-4 w-4" />, color: '#14b8a6' },
                  { id: '3', title: 'Laporan kecurangan masuk', description: 'Dugaan kecurangan di TPS-001 sedang direview', time: '30 menit lalu', icon: <AlertTriangle className="h-4 w-4" />, color: '#f43f5e' },
                  { id: '4', title: 'Pembayaran disetujui', description: 'Pembayaran untuk Saksi Ahmad telah disetujui', time: '1 jam lalu', icon: <Wallet className="h-4 w-4" />, color: '#10b981' },
                  { id: '5', title: '5 saksi baru terdaftar', description: 'Registrasi saksi baru dari Kecamatan Menteng', time: '2 jam lalu', icon: <UserPlus className="h-4 w-4" />, color: '#14b8a6' },
                ]}
              />
            </CardContent>
          </Card>
        </FadeInSection>
      </section>

      {/* ─── Roles Section ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <FadeInSection className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Multi-Role System</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Dibangun untuk mendukung berbagai peran dalam pengawasan pemilu
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role, i) => (
            <FadeInSection key={role.title} delay={i * 0.1}>
              <Card className="shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border-0 h-full">
                <div className={`bg-gradient-to-br ${role.gradient} px-6 pt-6 pb-4`}>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                      <div className="text-white">{role.icon}</div>
                    </div>
                    <CardTitle className="text-lg text-white">{role.title}</CardTitle>
                  </div>
                </div>
                <CardContent className={`bg-gradient-to-b ${role.bgGradient} p-6`}>
                  <ul className="space-y-2.5">
                    {role.items.map((item) => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </FadeInSection>
          ))}
        </div>
      </section>

      {/* ─── Statistics Section ─── */}
      <section className="relative py-24 overflow-hidden">
        {/* Dot pattern background */}
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-900" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeInSection className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400">Dipercaya</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Pengawasan Pemilu Terpercaya</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Alpha System v5 telah digunakan dalam berbagai tahapan operasi dan manajemen di Indonesia
            </p>
          </FadeInSection>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            <StatItem icon={<Users className="h-8 w-8" />} value={1000} suffix="+" label="Saksi Terdaftar" />
            <StatItem icon={<MapPin className="h-8 w-8" />} value={500} suffix="+" label="TPS Terpantau" />
            <StatItem icon={<CheckCircle2 className="h-8 w-8" />} value={99} suffix=".9%" label="Uptime" />
            <StatItem icon={<Phone className="h-8 w-8" />} value={24} suffix="/7" label="Support" />
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700" />
        <motion.div
          className="absolute inset-0 opacity-10"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(255,255,255,0.1) 30px, rgba(255,255,255,0.1) 60px)',
            backgroundSize: '200% 200%',
          }}
        />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }} />

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Siap Berkontribusi?
            </h2>
            <p className="text-emerald-100 mb-8 text-base sm:text-lg">
              Bergabunglah sebagai saksi pemilu dan lindungi suara rakyat Indonesia.
            </p>
            {isAuthenticated && user ? (
              <Button size="lg" variant="secondary" onClick={() => router.push(getDashboardPath())} className="text-lg px-8 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 shadow-xl">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Buka Dashboard
              </Button>
            ) : (
              <Button size="lg" variant="secondary" onClick={() => router.push('/auth/register')} className="text-lg px-8 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/50 shadow-xl">
                Daftar Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative h-7 w-7 rounded-lg overflow-hidden">
                  <Image src="/logo.png" alt="Alpha System v5" fill className="object-cover" />
                </div>
                <span className="text-lg font-bold">Alpha System v5</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Comprehensive management system terpadu. Lindungi integritas data 
                dengan teknologi modern dan transparansi penuh.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Tautan Cepat</h4>
              <ul className="space-y-2.5">
                <li>
                  <button onClick={() => router.push('/auth/login')} className="text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    Masuk
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/auth/register')} className="text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    Daftar
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push(isAuthenticated ? getDashboardPath() : '/auth/login')} className="text-sm text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    Dashboard
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Kontak</h4>
              <ul className="space-y-2.5">
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 text-emerald-500" />
                  support@saksiapp.id
                </li>
                <li className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 text-emerald-500" />
                  +62 812-XXXX-XXXX
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-10 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Alpha System v5 — Comprehensive Management System
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Dibuat dengan <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> untuk Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
