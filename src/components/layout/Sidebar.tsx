'use client'

import { useAuthStore } from '@/store/authStore'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useEffect, useState, useRef } from 'react'
import {
  LayoutDashboard,
  MapPin,
  LogIn,
  PenLine,
  LogOut,
  AlertTriangle,
  Wallet,
  Users,
  MapPinned,
  GitBranch,
  FileBarChart,
  BarChart3,
  ScrollText,
  Receipt,
  Send,
  History,
  ChevronLeft,
  Shield,
  Building2,
  Settings,
  HelpCircle,
  X,
  Mail,
} from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import type { UserRole, LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badgeApi?: string
}

const navConfigs: Record<UserRole, NavItem[]> = {
  SAKSI: [
    { label: 'Dashboard', href: '/saksi/dashboard', icon: LayoutDashboard },
    { label: 'TPS Saya', href: '/saksi/tps', icon: MapPin },
    { label: 'Check-in', href: '/saksi/check-in', icon: LogIn },
    { label: 'Input Suara', href: '/saksi/input', icon: PenLine },
    { label: 'Check-in Akhir', href: '/saksi/final-check-in', icon: LogOut },
    { label: 'Lapor', href: '/saksi/lapor', icon: AlertTriangle },
    { label: 'Pembayaran', href: '/saksi/payment', icon: Wallet },
  ],
  ADMIN: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Kelola Saksi', href: '/admin/saksi', icon: Users },
    { label: 'Kelola TPS', href: '/admin/tps', icon: MapPinned },
    { label: 'Plotting', href: '/admin/plotting', icon: GitBranch },
    { label: 'Laporan', href: '/admin/reports', icon: FileBarChart, badgeApi: '/api/reports?status=PENDING&limit=1' },
    { label: 'Analitik', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Audit Log', href: '/admin/audit', icon: ScrollText },
    { label: 'Pengaturan', href: '/admin/settings', icon: Settings },
  ],
  ADMIN_KEUANGAN: [
    { label: 'Dashboard', href: '/keuangan/dashboard', icon: LayoutDashboard },
    { label: 'Pembayaran', href: '/keuangan/payments', icon: Receipt, badgeApi: '/api/payments?status=READY_FOR_PAYMENT&limit=1' },
    { label: 'Pencairan', href: '/keuangan/disbursement', icon: Send, badgeApi: '/api/payments?status=APPROVED&limit=1' },
    { label: 'Riwayat', href: '/keuangan/history', icon: History },
  ],
}

const roleLabels: Record<UserRole, string> = {
  SAKSI: 'Saksi',
  ADMIN: 'Admin',
  ADMIN_KEUANGAN: 'Keuangan',
}

const roleColors: Record<UserRole, string> = {
  SAKSI: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  ADMIN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  ADMIN_KEUANGAN: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
}

const roleGradients: Record<UserRole, string> = {
  SAKSI: 'from-emerald-700 via-emerald-600 to-teal-600',
  ADMIN: 'from-emerald-700 via-emerald-600 to-teal-600',
  ADMIN_KEUANGAN: 'from-amber-700 via-amber-600 to-orange-600',
}

const roleIconBg: Record<UserRole, string> = {
  SAKSI: 'bg-white/20',
  ADMIN: 'bg-white/20',
  ADMIN_KEUANGAN: 'bg-white/20',
}

interface AppSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

// ─── Shared Sidebar Navigation Content ─────────────────────────────
function SidebarNavContent({
  pathname,
  navItems,
  badgeCounts,
  onNavigate,
  user,
  role,
  onLogout,
}: {
  pathname: string
  navItems: NavItem[]
  badgeCounts: Record<string, number>
  onNavigate: () => void
  user: any
  role: UserRole
  onLogout: () => void
}) {
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??'

  return (
    <>
      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4 custom-scrollbar">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon
            const count = badgeCounts[item.href]
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group select-none',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/25'
                    : 'text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400'
                )}
              >
                <div className={cn(
                  'shrink-0 transition-colors duration-200',
                  isActive ? 'text-white' : 'text-muted-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex-1">{item.label}</span>
                {count !== undefined && count > 0 && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'rounded-full px-2 py-0 text-xs font-bold min-w-[20px] text-center transition-colors',
                      isActive
                        ? 'bg-white/20 text-white border-0'
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                    )}
                  >
                    {count}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Help link */}
      <div className="px-3 py-2 border-t border-border/30">
        <Link
          href="#"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-400 transition-all duration-200 group select-none"
        >
          <HelpCircle className="h-4 w-4 shrink-0 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
          <span>Bantuan</span>
        </Link>
      </div>

      {/* User info - collapsible */}
      <Collapsible className="border-t border-border/50 bg-muted/30">
        <CollapsibleTrigger className="w-full px-4 py-3 safe-bottom">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-2 ring-emerald-200 dark:ring-emerald-800">
              <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium truncate leading-tight">{user?.name || 'Pengguna'}</p>
              <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0 mt-0.5', roleColors[role])}>
                {role === 'ADMIN_KEUANGAN' ? (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-2.5 w-2.5" />
                    {roleLabels[role]}
                  </span>
                ) : (
                  roleLabels[role]
                )}
              </Badge>
            </div>
            <ChevronLeft className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 [[data-state=open]>&]:rotate-90" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-4 pb-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {user?.email && (
                <>
                  <Mail className="h-3 w-3 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 gap-1.5"
              onClick={onLogout}
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Bottom branding */}
      <div className="border-t border-border/30 px-4 py-2">
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground/60">
          <div className="relative h-3.5 w-3.5 rounded overflow-hidden shrink-0">
            <Image src="/logo.png" alt="" fill className="object-cover" />
          </div>
          <span className="font-medium">Alpha System v5</span>
          <span className="text-muted-foreground/30">·</span>
          <span>v5.0.0</span>
        </div>
      </div>
    </>
  )
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({})
  const sheetRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)

  const role = user?.role || 'SAKSI'
  const navItems = navConfigs[role] || []

  // Fetch badge counts
  useEffect(() => {
    let cancelled = false

    const fetchBadges = async () => {
      const counts: Record<string, number> = {}
      const promises = navItems
        .filter((item) => item.badgeApi)
        .map(async (item) => {
          try {
            const res = await fetch(item.badgeApi!)
            if (res.ok) {
              const data = await res.json()
              if (data.success && !cancelled) {
                counts[item.href] = data.data.pagination?.total || data.data.payments?.length || data.data.reports?.length || 0
              }
            }
          } catch {
            // ignore
          }
        })
      await Promise.all(promises)
      if (!cancelled) {
        setBadgeCounts(counts)
      }
    }

    fetchBadges()
    const interval = setInterval(fetchBadges, 60000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [navItems])

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
  }

  const handleNavigate = () => {
    if (isOpen) onToggle()
  }

  // Touch gesture support for swiping to close
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchEndX - touchStartX.current
    // Swipe right by more than 60px closes the drawer
    if (diff > 60) {
      onToggle()
    }
    touchStartX.current = null
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '??'

  return (
    <>
      {/* ─── Mobile Sheet-based Drawer ─── */}
      <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onToggle() }}>
        <SheetContent
          side="left"
          className="w-72 p-0 bg-card border-r border-border/50 safe-bottom lg:hidden"
          ref={sheetRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Gradient Header */}
          <div className={cn(
            'relative flex h-16 items-center justify-between px-4 bg-gradient-to-r shadow-md',
            roleGradients[role]
          )}>
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-8 w-12 h-12 bg-white/5 rounded-full translate-y-1/2" />

            <Link
              href={`/${role === 'ADMIN_KEUANGAN' ? 'keuangan' : role.toLowerCase()}/dashboard`}
              className="flex items-center gap-2.5 relative z-10 select-none"
              onClick={handleNavigate}
            >
              <div className="relative h-7 w-7 rounded-lg overflow-hidden flex-shrink-0">
                <Image src="/logo.png" alt="Alpha System v5" fill className="object-cover" priority />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-white leading-tight">Alpha System v5</span>
                <span className="text-[10px] text-white/70 leading-tight">Management System</span>
              </div>
            </Link>
          </div>

          {/* Hidden accessibility titles */}
          <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
          <SheetDescription className="sr-only">Navigasi menu Alpha System</SheetDescription>

          {/* Navigation Content */}
          <div className="flex flex-1 flex-col h-[calc(100%-4rem)]">
            <SidebarNavContent
              pathname={pathname}
              navItems={navItems}
              badgeCounts={badgeCounts}
              onNavigate={handleNavigate}
              user={user}
              role={role}
              onLogout={handleLogout}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden lg:flex w-64 flex-col bg-card border-r border-border/50 shadow-none">
        {/* Logo / Brand Header with Gradient */}
        <div className={cn(
          'relative flex h-16 items-center justify-between px-4 bg-gradient-to-r shadow-md',
          roleGradients[role]
        )}>
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-8 w-12 h-12 bg-white/5 rounded-full translate-y-1/2" />

          <Link href={`/${role === 'ADMIN_KEUANGAN' ? 'keuangan' : role.toLowerCase()}/dashboard`} className="flex items-center gap-2.5 relative z-10">
            <div className="relative h-7 w-7 rounded-lg overflow-hidden flex-shrink-0">
              <Image src="/logo.png" alt="Alpha System v5" fill className="object-cover" priority />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-white leading-tight">Alpha System v5</span>
              <span className="text-[10px] text-white/70 leading-tight">Management System</span>
            </div>
          </Link>
        </div>

        <div className="flex flex-1 flex-col">
          <SidebarNavContent
            pathname={pathname}
            navItems={navItems}
            badgeCounts={badgeCounts}
            onNavigate={() => {}}
            user={user}
            role={role}
            onLogout={handleLogout}
          />
        </div>
      </aside>
    </>
  )
}
