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
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, Loader2, User, Shield, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Demo users for testing
const now = new Date().toISOString();

const DEMO_USERS = {
  'saksi@demo.com': {
    id: 'demo-saksi-1',
    name: 'Ahmad Subekti',
    email: 'saksi@demo.com',
    role: 'SAKSI' as const,
    phone: '081234567890',
    ktpNumber: '3171234567890001',
    bankName: 'bca',
    bankAccount: '1234567890',
    bankHolderName: 'Ahmad Subekti',
    createdAt: now,
    updatedAt: now,
  },
  'admin@demo.com': {
    id: 'demo-admin-1',
    name: 'Admin User',
    email: 'admin@demo.com',
    role: 'ADMIN' as const,
    phone: '081234567891',
    createdAt: now,
    updatedAt: now,
  },
  'finance@demo.com': {
    id: 'demo-finance-1',
    name: 'Finance Admin',
    email: 'finance@demo.com',
    role: 'ADMIN_KEUANGAN' as const,
    phone: '081234567892',
    createdAt: now,
    updatedAt: now,
  },
};

const DEMO_PASSWORD = 'demo123';

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleDemoLogin = (email: string) => {
    const user = DEMO_USERS[email as keyof typeof DEMO_USERS];
    if (user) {
      login(user, 'demo-token-' + user.role.toLowerCase());
      toast.success(`Logged in as ${user.role === 'SAKSI' ? 'Witness' : user.role === 'ADMIN' ? 'Admin' : 'Finance Admin'}!`);
      
      // Redirect based on role
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (user.role === 'ADMIN_KEUANGAN') {
        router.push('/keuangan/dashboard');
      } else {
        router.push('/saksi/dashboard');
      }
    }
  };

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // Check for demo login
      const demoUser = DEMO_USERS[data.email as keyof typeof DEMO_USERS];
      if (demoUser && data.password === DEMO_PASSWORD) {
        handleDemoLogin(data.email);
        return;
      }

      // Try actual API call
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        login(result.user, result.token);
        toast.success('Login successful!');
        
        // Redirect based on role
        const role = result.user.role;
        if (role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (role === 'ADMIN_KEUANGAN') {
          router.push('/keuangan/dashboard');
        } else {
          router.push('/saksi/dashboard');
        }
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sign In</CardTitle>
        <CardDescription>Sign in to your Alpha System v5 account</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                        placeholder="Enter password"
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </Form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Demo Accounts</span>
            </div>
          </div>
          
          <p className="text-xs text-center text-muted-foreground mt-2 mb-4">
            Password for all demo accounts: <code className="bg-muted px-1 rounded">demo123</code>
          </p>

          <div className="grid gap-2">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                form.setValue('email', 'saksi@demo.com');
                form.setValue('password', 'demo123');
              }}
            >
              <User className="mr-2 h-4 w-4 text-blue-500" />
              <span className="flex-1 text-left">Witness (Saksi)</span>
              <span className="text-xs text-muted-foreground">saksi@demo.com</span>
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                form.setValue('email', 'admin@demo.com');
                form.setValue('password', 'demo123');
              }}
            >
              <Shield className="mr-2 h-4 w-4 text-red-500" />
              <span className="flex-1 text-left">Admin</span>
              <span className="text-xs text-muted-foreground">admin@demo.com</span>
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => {
                form.setValue('email', 'finance@demo.com');
                form.setValue('password', 'demo123');
              }}
            >
              <Wallet className="mr-2 h-4 w-4 text-green-500" />
              <span className="flex-1 text-left">Finance Admin</span>
              <span className="text-xs text-muted-foreground">finance@demo.com</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
