'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  MapPin,
  ClipboardCheck,
  AlertTriangle,
  User,
  Users,
  FileBarChart,
  Settings,
  Wallet,
  Send,
  History,
  type LucideIcon,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/types'

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

const navItemsByRole: Record<UserRole, NavItem[]> = {
  SAKSI: [
    { label: 'Dashboard', href: '/saksi/dashboard', icon: LayoutDashboard },
    { label: 'TPS', href: '/saksi/tps', icon: MapPin },
    { label: 'Check-in', href: '/saksi/check-in', icon: ClipboardCheck },
    { label: 'Lapor', href: '/saksi/lapor', icon: AlertTriangle },
    { label: 'Profil', href: '/saksi/profile', icon: User },
  ],
  ADMIN: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Saksi', href: '/admin/saksi', icon: Users },
    { label: 'TPS', href: '/admin/tps', icon: MapPin },
    { label: 'Laporan', href: '/admin/reports', icon: FileBarChart },
    { label: 'Pengaturan', href: '/admin/settings', icon: Settings },
  ],
  ADMIN_KEUANGAN: [
    { label: 'Dashboard', href: '/keuangan/dashboard', icon: LayoutDashboard },
    { label: 'Pembayaran', href: '/keuangan/payments', icon: Wallet },
    { label: 'Pencairan', href: '/keuangan/disbursement', icon: Send },
    { label: 'Riwayat', href: '/keuangan/history', icon: History },
    { label: 'Pengaturan', href: '/keuangan/settings', icon: Settings },
  ],
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  if (!user) return null

  const items = navItemsByRole[user.role]
  if (!items) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-border/50 pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around px-2 pt-1 pb-1">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`
                  flex flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-2 min-w-[3.5rem] transition-colors
                  ${isActive
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'text-muted-foreground'
                  }
                `}
              >
                <Icon className="h-5 w-5 shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium leading-tight">{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
