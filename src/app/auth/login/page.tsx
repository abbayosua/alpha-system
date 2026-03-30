'use client';

import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Footer } from '@/components/layout/Footer';

export default function LoginPage() {
  return (
    <PageWrapper className="bg-muted/50">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Alpha System v5" className="w-12 h-12 object-contain" />
            <span className="font-bold text-xl">Alpha System v5</span>
          </Link>
        </div>
        <LoginForm />
        <p className="mt-4 text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-primary hover:underline">
            Register here
          </Link>
        </p>
      </div>
      <Footer />
    </PageWrapper>
  );
}
