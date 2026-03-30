'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BANK_OPTIONS, EWALLET_OPTIONS } from '@/lib/constants';

const registerSchema = z.object({
  name: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
  ktpNumber: z.string().length(16, 'NIK harus 16 digit'),
  paymentType: z.enum(['bank', 'ewallet']),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankHolderName: z.string().optional(),
  eWalletType: z.string().optional(),
  eWalletNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.paymentType === 'bank') {
    return !!data.bankName && !!data.bankAccount && !!data.bankHolderName;
  }
  if (data.paymentType === 'ewallet') {
    return !!data.eWalletType && !!data.eWalletNumber;
  }
  return true;
}, {
  message: 'Lengkapi informasi pembayaran',
  path: ['paymentType'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [paymentType, setPaymentType] = useState<'bank' | 'ewallet'>('bank');

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      ktpNumber: '',
      paymentType: 'bank',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        login(result.user, result.token);
        toast.success('Registrasi berhasil!');
        router.push('/saksi/dashboard');
      } else {
        toast.error(result.error || 'Registrasi gagal');
      }
    } catch (error) {
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Daftar Saksi</CardTitle>
        <CardDescription>Daftarkan diri Anda sebagai saksi pemilu</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Informasi Pribadi</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama sesuai KTP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="nama@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nomor Telepon</FormLabel>
                    <FormControl>
                      <Input placeholder="08xxxxxxxxxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ktpNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIK (Nomor Induk Kependudukan)</FormLabel>
                    <FormControl>
                      <Input placeholder="16 digit NIK" maxLength={16} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Password */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Password</h3>
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Minimal 6 karakter"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Ulangi password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm text-muted-foreground">Informasi Pembayaran</h3>
              
              <FormField
                control={form.control}
                name="paymentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Metode Pembayaran</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value: 'bank' | 'ewallet') => {
                        field.onChange(value);
                        setPaymentType(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih metode pembayaran" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bank">Transfer Bank</SelectItem>
                        <SelectItem value="ewallet">E-Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {paymentType === 'bank' && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Bank</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih bank" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {BANK_OPTIONS.map((bank) => (
                              <SelectItem key={bank.value} value={bank.value}>
                                {bank.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor Rekening</FormLabel>
                        <FormControl>
                          <Input placeholder="Nomor rekening" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankHolderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Pemilik Rekening</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama sesuai rekening" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {paymentType === 'ewallet' && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="eWalletType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jenis E-Wallet</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Pilih e-wallet" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EWALLET_OPTIONS.map((ewallet) => (
                              <SelectItem key={ewallet.value} value={ewallet.value}>
                                {ewallet.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="eWalletNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nomor E-Wallet</FormLabel>
                        <FormControl>
                          <Input placeholder="Nomor e-wallet" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Daftar
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
