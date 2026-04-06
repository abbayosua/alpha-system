'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SaksiProfilePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    ktpNumber: '',
    bankName: '',
    bankAccount: '',
    bankHolderName: '',
    eWalletType: '',
    eWalletNumber: '',
  })

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setProfile(res.data)
          setForm({
            name: res.data.name || '',
            phone: res.data.phone || '',
            ktpNumber: res.data.ktpNumber || '',
            bankName: res.data.bankName || '',
            bankAccount: res.data.bankAccount || '',
            bankHolderName: res.data.bankHolderName || '',
            eWalletType: res.data.eWalletType || '',
            eWalletNumber: res.data.eWalletNumber || '',
          })
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Profil berhasil diperbarui')
        setProfile(data.data)
      } else {
        toast.error(data.error || 'Gagal memperbarui profil')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Profil Saya</h1>
          <p className="text-sm text-muted-foreground">Kelola data diri dan informasi pembayaran</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Email:</span>
            <span className="text-sm font-medium">{profile?.email}</span>
            <Badge variant="secondary">{profile?.role}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Terdaftar:</span>
            <span className="text-sm">
              {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Diri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" value={form.name} onChange={(e) => updateForm('name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">No. Telepon</Label>
            <Input id="phone" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="08xxxxxxxxxx" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ktpNumber">No. KTP</Label>
            <Input id="ktpNumber" value={form.ktpNumber} onChange={(e) => updateForm('ktpNumber', e.target.value)} placeholder="Nomor KTP" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Pembayaran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Nama Bank</Label>
              <Input id="bankName" value={form.bankName} onChange={(e) => updateForm('bankName', e.target.value)} placeholder="BCA, Mandiri, dll" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankAccount">No. Rekening</Label>
              <Input id="bankAccount" value={form.bankAccount} onChange={(e) => updateForm('bankAccount', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bankHolderName">Nama Pemilik Rekening</Label>
            <Input id="bankHolderName" value={form.bankHolderName} onChange={(e) => updateForm('bankHolderName', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eWalletType">Jenis E-Wallet</Label>
              <Input id="eWalletType" value={form.eWalletType} onChange={(e) => updateForm('eWalletType', e.target.value)} placeholder="GoPay, OVO, dll" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eWalletNumber">No. E-Wallet</Label>
              <Input id="eWalletNumber" value={form.eWalletNumber} onChange={(e) => updateForm('eWalletNumber', e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleSave} disabled={saving}>
        <Save className="h-4 w-4 mr-2" />
        {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
      </Button>
    </div>
  )
}
