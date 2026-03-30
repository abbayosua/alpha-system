'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
