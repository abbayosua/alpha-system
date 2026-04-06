'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    ktpNumber: '',
    bankName: '',
    bankAccount: '',
    bankHolderName: '',
    eWalletType: '',
    eWalletNumber: '',
  })

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.password) {
      toast.error('Nama, email, dan password wajib diisi')
      return
    }

    if (form.password.length < 6) {
      toast.error('Password minimal 6 karakter')
      return
    }

    if (form.password !== form.confirmPassword) {
      toast.error('Password tidak cocok')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          ktpNumber: form.ktpNumber || undefined,
          bankName: form.bankName || undefined,
          bankAccount: form.bankAccount || undefined,
          bankHolderName: form.bankHolderName || undefined,
          eWalletType: form.eWalletType || undefined,
          eWalletNumber: form.eWalletNumber || undefined,
        }),
      })

      const data = await res.json()

      if (!data.success) {
        toast.error(data.error || 'Registrasi gagal')
        return
      }

      toast.success('Registrasi berhasil! Silakan masuk.')
      router.push('/auth/login?registered=true')
    } catch {
      toast.error('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Daftar Sebagai Saksi</CardTitle>
          <CardDescription>Lengkapi data diri Anda untuk mendaftar sebagai saksi pemilu</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Basic Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Data Diri</h3>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input id="name" placeholder="Nama lengkap" value={form.name} onChange={(e) => updateForm('name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="email@contoh.com" value={form.email} onChange={(e) => updateForm('email', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">No. Telepon</Label>
              <Input id="phone" placeholder="08xxxxxxxxxx" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ktpNumber">No. KTP</Label>
              <Input id="ktpNumber" placeholder="Nomor KTP" value={form.ktpNumber} onChange={(e) => updateForm('ktpNumber', e.target.value)} />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 6 karakter" value={form.password} onChange={(e) => updateForm('password', e.target.value)} required />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password *</Label>
              <Input id="confirmPassword" type="password" placeholder="Ulangi password" value={form.confirmPassword} onChange={(e) => updateForm('confirmPassword', e.target.value)} required />
            </div>

            {/* Payment Info */}
            <div className="space-y-2 pt-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Informasi Pembayaran</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Nama Bank</Label>
                <Input id="bankName" placeholder="BCA, Mandiri, dll" value={form.bankName} onChange={(e) => updateForm('bankName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccount">No. Rekening</Label>
                <Input id="bankAccount" placeholder="Nomor rekening" value={form.bankAccount} onChange={(e) => updateForm('bankAccount', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankHolderName">Nama Pemilik Rekening</Label>
              <Input id="bankHolderName" placeholder="Sesuai buku rekening" value={form.bankHolderName} onChange={(e) => updateForm('bankHolderName', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="eWalletType">Jenis E-Wallet</Label>
                <Input id="eWalletType" placeholder="GoPay, OVO, dll" value={form.eWalletType} onChange={(e) => updateForm('eWalletType', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eWalletNumber">No. E-Wallet</Label>
                <Input id="eWalletNumber" placeholder="Nomor e-wallet" value={form.eWalletNumber} onChange={(e) => updateForm('eWalletNumber', e.target.value)} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Sudah punya akun?{' '}
              <button type="button" className="text-primary hover:underline font-medium" onClick={() => router.push('/auth/login')}>
                Masuk
              </button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
