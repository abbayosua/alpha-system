'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { CommandPalette } from '@/components/common/CommandPalette'
import { MobileBottomNav } from '@/components/layout/MobileBottomNav'

export default function SaksiLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <PageWrapper>
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 flex-col min-h-screen">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1">
          <div className="p-4 md:p-6 lg:p-8 pb-20 lg:pb-8">
            {children}
          </div>
        </main>
        <Footer />
      </div>
      <CommandPalette />
      <MobileBottomNav />
    </PageWrapper>
  )
}
