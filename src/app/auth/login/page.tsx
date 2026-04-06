'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Eye, EyeOff } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Email dan password harus diisi')
      return
    }
    setIsLoading(true)
    const { error } = await login({ email, password })
    setIsLoading(false)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Login berhasil!')
      const user = useAuthStore.getState().user
      if (user) {
        const path = user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'ADMIN_KEUANGAN' ? '/keuangan/dashboard' : '/saksi/dashboard'
        router.push(path)
      }
    }
  }

  const fillDemo = async (demoEmail: string) => {
    setEmail(demoEmail)
    setPassword('demo123')
    setIsLoading(true)
    try {
      const { error } = await login({ email: demoEmail, password: 'demo123' })
      if (error) {
        toast.error(error)
        setIsLoading(false)
      } else {
        toast.success('Login berhasil!')
        // Small delay to let the auth store update
        await new Promise((r) => setTimeout(r, 500))
        const user = useAuthStore.getState().user
        if (user) {
          const path = user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'ADMIN_KEUANGAN' ? '/keuangan/dashboard' : '/saksi/dashboard'
          router.push(path)
        } else {
          // Fallback: check role from profile fetch
          setIsLoading(false)
        }
      }
    } catch {
      toast.error('Gagal login. Silakan coba lagi.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-900 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-900/15 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-200/20 dark:bg-teal-900/15 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-100/10 dark:bg-emerald-900/10 rounded-full blur-2xl" />

      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="relative h-14 w-14 rounded-2xl overflow-hidden shadow-lg shadow-emerald-500/20">
              <Image src="/logo.png" alt="Alpha System v5" fill className="object-cover" priority />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">Masuk ke Alpha System v5</CardTitle>
          <CardDescription className="text-muted-foreground mt-1">Masuk ke akun Anda untuk melanjutkan</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@contoh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Demo akun (klik untuk isi otomatis):</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => fillDemo('saksi@demo.com')}>
                  Saksi Demo
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => fillDemo('admin@demo.com')}>
                  Admin Demo
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => fillDemo('finance@demo.com')}>
                  Keuangan Demo
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Belum punya akun?{' '}
              <button type="button" className="text-primary hover:underline font-medium" onClick={() => router.push('/auth/register')}>
                Daftar sekarang
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
