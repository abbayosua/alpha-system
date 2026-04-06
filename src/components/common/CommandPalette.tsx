'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command'
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
  Plus,
  Download,
  FileText,
  Upload,
  Settings,
} from 'lucide-react'
import type { UserRole, LucideIcon } from 'lucide-react'

interface CommandRouteItem {
  label: string
  href: string
  icon: LucideIcon
  shortcut?: string
}

interface CommandActionItem {
  label: string
  href: string
  icon: LucideIcon
  shortcut?: string
  description?: string
}

const routeItemsByRole: Record<UserRole, CommandRouteItem[]> = {
  SAKSI: [
    { label: 'Dashboard', href: '/saksi/dashboard', icon: LayoutDashboard, shortcut: 'D' },
    { label: 'TPS Saya', href: '/saksi/tps', icon: MapPin, shortcut: 'T' },
    { label: 'Check-in Pagi', href: '/saksi/check-in', icon: LogIn, shortcut: 'C' },
    { label: 'Input Suara', href: '/saksi/input', icon: PenLine, shortcut: 'I' },
    { label: 'Check-in Akhir', href: '/saksi/final-check-in', icon: LogOut, shortcut: 'F' },
    { label: 'Lapor Kecurangan', href: '/saksi/lapor', icon: AlertTriangle, shortcut: 'L' },
    { label: 'Pembayaran', href: '/saksi/payment', icon: Wallet, shortcut: 'P' },
  ],
  ADMIN: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, shortcut: 'D' },
    { label: 'Kelola Saksi', href: '/admin/saksi', icon: Users, shortcut: 'S' },
    { label: 'Kelola TPS', href: '/admin/tps', icon: MapPinned, shortcut: 'T' },
    { label: 'Plotting', href: '/admin/plotting', icon: GitBranch, shortcut: 'G' },
    { label: 'Laporan', href: '/admin/reports', icon: FileBarChart, shortcut: 'R' },
    { label: 'Audit Log', href: '/admin/audit', icon: ScrollText, shortcut: 'A' },
  ],
  ADMIN_KEUANGAN: [
    { label: 'Dashboard', href: '/keuangan/dashboard', icon: LayoutDashboard, shortcut: 'D' },
    { label: 'Pembayaran', href: '/keuangan/payments', icon: Receipt, shortcut: 'P' },
    { label: 'Pencairan Dana', href: '/keuangan/disbursement', icon: Send, shortcut: 'C' },
    { label: 'Riwayat', href: '/keuangan/history', icon: History, shortcut: 'H' },
  ],
}

const actionItemsByRole: Record<UserRole, CommandActionItem[]> = {
  SAKSI: [
    { label: 'Check-in Sekarang', href: '/saksi/check-in', icon: LogIn, shortcut: '⌘C' },
    { label: 'Buat Laporan', href: '/saksi/lapor', icon: FileText, shortcut: '⌘L' },
    { label: 'Upload Foto C1', href: '/saksi/input', icon: Upload, shortcut: '⌘U' },
    { label: 'Cek Pembayaran', href: '/saksi/payment', icon: Wallet },
  ],
  ADMIN: [
    { label: 'Tambah Saksi', href: '/admin/saksi', icon: Plus, shortcut: '⌘N' },
    { label: 'Tambah TPS', href: '/admin/tps', icon: MapPinned, shortcut: '⌘N' },
    { label: 'Buat Plotting', href: '/admin/plotting', icon: GitBranch },
    { label: 'Review Laporan', href: '/admin/reports', icon: FileBarChart },
    { label: 'Export Data Saksi', href: '/admin/saksi', icon: Download, shortcut: '⌘E' },
  ],
  ADMIN_KEUANGAN: [
    { label: 'Validasi Pembayaran', href: '/keuangan/payments', icon: Receipt, shortcut: '⌘V' },
    { label: 'Cairkan Dana', href: '/keuangan/disbursement', icon: Send, shortcut: '⌘D' },
    { label: 'Export Riwayat', href: '/keuangan/history', icon: Download, shortcut: '⌘E' },
    { label: 'Lihat Laporan', href: '/keuangan/payments', icon: FileBarChart },
  ],
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  const role = user?.role || 'SAKSI'
  const routeItems = routeItemsByRole[role] || []
  const actionItems = actionItemsByRole[role] || []

  const handleNavigate = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router]
  )

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!user) return null

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Pencarian Cepat"
      description="Cari halaman atau aksi cepat"
      className="max-w-lg"
    >
      <CommandInput placeholder="Cari halaman atau aksi..." />
      <CommandList>
        <CommandEmpty>Tidak ada hasil untuk &ldquo;{''}&rdquo;</CommandEmpty>

        <CommandGroup heading="Navigasi">
          {routeItems.map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={item.href}
                value={item.label}
                onSelect={() => handleNavigate(item.href)}
              >
                <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
                {item.shortcut && (
                  <CommandShortcut>{item.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Aksi Cepat">
          {actionItems.map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={`action-${item.label}`}
                value={item.label}
                onSelect={() => handleNavigate(item.href)}
              >
                <Icon className="mr-2 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{item.label}</span>
                {item.shortcut && (
                  <CommandShortcut>{item.shortcut}</CommandShortcut>
                )}
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        <div className="px-4 py-2 border-t">
          <p className="text-[11px] text-muted-foreground text-center">
            Tekan <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">Enter</kbd> untuk navigasi &bull;{' '}
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">Esc</kbd> untuk menutup
          </p>
        </div>
      </CommandList>
    </CommandDialog>
  )
}
