'use client';

import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { User, Camera, Wallet, Save, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { BANK_OPTIONS, EWALLET_OPTIONS } from '@/lib/constants';

const profileSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon tidak valid'),
  ktpNumber: z.string().length(16, 'NIK harus 16 digit'),
});

const paymentSchema = z.object({
  paymentType: z.enum(['bank', 'ewallet']),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankHolderName: z.string().optional(),
  eWalletType: z.string().optional(),
  eWalletNumber: z.string().optional(),
});

export default function SaksiProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentType, setPaymentType] = useState<'bank' | 'ewallet'>('bank');

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: 'Ahmad Subekti',
      email: 'ahmad@email.com',
      phone: '081234567890',
      ktpNumber: '3171234567890123',
    },
  });

  const paymentForm = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentType: 'bank',
      bankName: 'bca',
      bankAccount: '1234567890',
      bankHolderName: 'Ahmad Subekti',
    },
  });

  const onProfileSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profil berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui profil');
    } finally {
      setIsLoading(false);
    }
  };

  const onPaymentSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Informasi pembayaran berhasil diperbarui');
    } catch (error) {
      toast.error('Gagal memperbarui informasi pembayaran');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Profil Saya"
        breadcrumbs={[{ label: 'Dashboard', href: '/saksi/dashboard' }, { label: 'Profil' }]}
      />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="payment">
            <Wallet className="mr-2 h-4 w-4" />
            Pembayaran
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pribadi</CardTitle>
              <CardDescription>Kelola informasi pribadi Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src="/placeholder-avatar.jpg" />
                    <AvatarFallback className="text-2xl">AS</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    <Camera className="mr-2 h-4 w-4" />
                    Ganti Foto
                  </Button>
                </div>

                {/* Form */}
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="flex-1 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama Lengkap</Label>
                      <Input id="name" {...profileForm.register('name')} />
                      {profileForm.formState.errors.name && (
                        <p className="text-sm text-destructive">
                          {profileForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" {...profileForm.register('email')} />
                      {profileForm.formState.errors.email && (
                        <p className="text-sm text-destructive">
                          {profileForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Nomor Telepon</Label>
                      <Input id="phone" {...profileForm.register('phone')} />
                      {profileForm.formState.errors.phone && (
                        <p className="text-sm text-destructive">
                          {profileForm.formState.errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ktpNumber">NIK</Label>
                      <Input id="ktpNumber" maxLength={16} {...profileForm.register('ktpNumber')} />
                      {profileForm.formState.errors.ktpNumber && (
                        <p className="text-sm text-destructive">
                          {profileForm.formState.errors.ktpNumber.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      Simpan Perubahan
                    </Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* KTP Photo */}
          <Card>
            <CardHeader>
              <CardTitle>Foto KTP</CardTitle>
              <CardDescription>Upload foto KTP untuk verifikasi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Camera className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  Klik atau drag foto KTP Anda ke sini
                </p>
                <Button variant="outline">Upload KTP</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Pembayaran</CardTitle>
              <CardDescription>
                Kelola rekening bank atau e-wallet untuk menerima pembayaran
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <Label>Metode Pembayaran</Label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={paymentType === 'bank' ? 'default' : 'outline'}
                      onClick={() => {
                        setPaymentType('bank');
                        paymentForm.setValue('paymentType', 'bank');
                      }}
                    >
                      Transfer Bank
                    </Button>
                    <Button
                      type="button"
                      variant={paymentType === 'ewallet' ? 'default' : 'outline'}
                      onClick={() => {
                        setPaymentType('ewallet');
                        paymentForm.setValue('paymentType', 'ewallet');
                      }}
                    >
                      E-Wallet
                    </Button>
                  </div>
                </div>

                {paymentType === 'bank' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nama Bank</Label>
                      <Select
                        onValueChange={(value) => paymentForm.setValue('bankName', value)}
                        defaultValue={paymentForm.getValues('bankName')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih bank" />
                        </SelectTrigger>
                        <SelectContent>
                          {BANK_OPTIONS.map((bank) => (
                            <SelectItem key={bank.value} value={bank.value}>
                              {bank.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nomor Rekening</Label>
                      <Input
                        placeholder="Masukkan nomor rekening"
                        {...paymentForm.register('bankAccount')}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nama Pemilik Rekening</Label>
                      <Input
                        placeholder="Nama sesuai rekening"
                        {...paymentForm.register('bankHolderName')}
                      />
                    </div>
                  </div>
                )}

                {paymentType === 'ewallet' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Jenis E-Wallet</Label>
                      <Select onValueChange={(value) => paymentForm.setValue('eWalletType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih e-wallet" />
                        </SelectTrigger>
                        <SelectContent>
                          {EWALLET_OPTIONS.map((ewallet) => (
                            <SelectItem key={ewallet.value} value={ewallet.value}>
                              {ewallet.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nomor E-Wallet</Label>
                      <Input
                        placeholder="Masukkan nomor e-wallet"
                        {...paymentForm.register('eWalletNumber')}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
