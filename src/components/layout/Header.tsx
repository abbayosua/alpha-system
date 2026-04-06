'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
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
  const crumbs = getBreadcrumbSegments(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden h-8 w-8"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex flex-1 items-center gap-2">
        {/* App title on mobile */}
        <span className="text-sm font-bold text-primary lg:hidden">SAKSI APP</span>

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
    </header>
  )
}
