'use client'

import { useAuthStore } from '@/store/authStore'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
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
  ScrollText,
  Receipt,
  Send,
  History,
  ChevronLeft,
  Shield,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { UserRole, LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
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
    { label: 'Laporan', href: '/admin/reports', icon: FileBarChart },
    { label: 'Audit Log', href: '/admin/audit', icon: ScrollText },
  ],
  ADMIN_KEUANGAN: [
    { label: 'Dashboard', href: '/keuangan/dashboard', icon: LayoutDashboard },
    { label: 'Pembayaran', href: '/keuangan/payments', icon: Receipt },
    { label: 'Pencairan', href: '/keuangan/disbursement', icon: Send },
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
  ADMIN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  ADMIN_KEUANGAN: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
}

interface AppSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  const role = user?.role || 'SAKSI'
  const navItems = navConfigs[role] || []

  const handleLogout = async () => {
    await logout()
    router.push('/auth/login')
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
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-card border-r transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo / Brand */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          <Link href={`/${role === 'ADMIN_KEUANGAN' ? 'keuangan' : role.toLowerCase()}/dashboard`} className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold">SAKSI APP</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8"
            onClick={onToggle}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    if (isOpen) onToggle()
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </ScrollArea>

        {/* User info */}
        <Separator />
        <div className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name || 'Pengguna'}</p>
              <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', roleColors[role])}>
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
              onClick={handleLogout}
              title="Keluar"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
