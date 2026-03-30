'use client';

import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Footer } from '@/components/layout/Footer';
import { ClipboardList } from 'lucide-react';

export default function RegisterPage() {
  return (
    <PageWrapper className="bg-muted/50">
      <div className="flex-1 flex flex-col items-center justify-center p-4 py-8">
        <div className="w-full max-w-lg mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">SAKSI APP</span>
          </Link>
          <p className="text-muted-foreground">
            Daftarkan diri Anda sebagai saksi pemilu
          </p>
        </div>
        <RegisterForm />
        <p className="mt-4 text-sm text-muted-foreground">
          Sudah punya akun?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
      <Footer />
    </PageWrapper>
  );
}
