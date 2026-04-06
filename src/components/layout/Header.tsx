'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Menu, Moon, Sun } from 'lucide-react'
import { NotificationBell } from '@/components/common/NotificationBell'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface HeaderProps {
  onMenuClick: () => void
}

function getBreadcrumbSegments(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; href: string; isLast: boolean }[] = []

  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    // Friendly labels for known segments
    const labels: Record<string, string> = {
      saksi: 'Saksi',
      admin: 'Admin',
      keuangan: 'Keuangan',
      dashboard: 'Dashboard',
      tps: 'TPS',
      'check-in': 'Check-in',
      input: 'Input Suara',
      'final-check-in': 'Check-in Akhir',
      lapor: 'Lapor',
      payment: 'Pembayaran',
      profile: 'Profil',
      plotting: 'Plotting',
      reports: 'Laporan',
      audit: 'Audit Log',
      payments: 'Pembayaran',
      disbursement: 'Pencairan',
      history: 'Riwayat',
      notifications: 'Notifikasi',
    }

    crumbs.push({
      label: labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: currentPath,
      isLast,
    })
  })

  return crumbs
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const { setTheme, resolvedTheme } = useTheme()
  const crumbs = getBreadcrumbSegments(pathname)
  const [isScrolled, setIsScrolled] = useState(false)

  // Track scroll position for shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header
      className={`sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-md px-4 lg:px-6 transition-shadow duration-200 ${
        isScrolled ? 'shadow-sm' : ''
      }`}
    >
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-10 w-10 touch-feedback active:scale-[0.98]"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex flex-1 items-center gap-2">
        {/* App title on mobile */}
        <span className="text-sm font-bold text-primary lg:hidden">Alpha System v5</span>

        {/* Breadcrumb - hide on mobile when only 1 item */}
        <Breadcrumb className={crumbs.length <= 1 ? 'hidden sm:flex' : ''}>
          <BreadcrumbList>
            {crumbs.map((crumb, index) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {crumb.isLast ? (
                    <BreadcrumbPage className="text-sm font-medium">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link href={crumb.href} className="text-sm text-muted-foreground hover:text-foreground">
                        {crumb.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </span>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Notification Bell */}
      <NotificationBell />

      {/* Dark mode toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-lg touch-feedback active:scale-[0.98]"
        onClick={toggleTheme}
        title={resolvedTheme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="h-4 w-4 text-amber-400" />
        ) : (
          <Moon className="h-4 w-4 text-slate-500" />
        )}
      </Button>
    </header>
  )
}
