'use client';

import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Footer } from '@/components/layout/Footer';

export default function RegisterPage() {
  return (
    <PageWrapper className="bg-muted/50">
      <div className="flex-1 flex flex-col items-center justify-center p-4 py-8">
        <div className="w-full max-w-lg mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Alpha System v5" className="w-12 h-12 object-contain" />
            <span className="font-bold text-xl">Alpha System v5</span>
          </Link>
          <p className="text-muted-foreground">
            Register as an election witness
          </p>
        </div>
        <RegisterForm />
        <p className="mt-4 text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
      <Footer />
    </PageWrapper>
  );
}
