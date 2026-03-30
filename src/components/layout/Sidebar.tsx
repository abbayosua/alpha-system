'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore, getDashboardRoute } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  User,
  MapPin,
  Camera,
  FileText,
  AlertTriangle,
  Wallet,
  Users,
  Building2,
  GitBranch,
  ClipboardList,
  FileSearch,
  LogOut,
  Menu,
  X,
  CreditCard,
  History,
} from 'lucide-react';
import { useState } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const saksiNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/saksi/dashboard', icon: LayoutDashboard },
  { label: 'Profil', href: '/saksi/profile', icon: User },
  { label: 'TPS Saya', href: '/saksi/tps', icon: MapPin },
  { label: 'Check-in', href: '/saksi/check-in', icon: Camera },
  { label: 'Input Suara', href: '/saksi/input', icon: FileText },
  { label: 'Lapor', href: '/saksi/lapor', icon: AlertTriangle },
  { label: 'Pembayaran', href: '/saksi/payment', icon: Wallet },
];

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Kelola Saksi', href: '/admin/saksi', icon: Users },
  { label: 'Kelola TPS', href: '/admin/tps', icon: Building2 },
  { label: 'Plotting', href: '/admin/plotting', icon: GitBranch },
  { label: 'Laporan', href: '/admin/reports', icon: AlertTriangle },
  { label: 'Audit Trail', href: '/admin/audit', icon: FileSearch },
];

const keuanganNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/keuangan/dashboard', icon: LayoutDashboard },
  { label: 'Pembayaran', href: '/keuangan/payments', icon: CreditCard },
  { label: 'Disbursement', href: '/keuangan/disbursement', icon: Wallet },
  { label: 'Riwayat', href: '/keuangan/history', icon: History },
];

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'ADMIN':
      return adminNavItems;
    case 'ADMIN_KEUANGAN':
      return keuanganNavItems;
    case 'SAKSI':
    default:
      return saksiNavItems;
  }
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user ? getNavItems(user.role) : [];
  const userInitials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-background border shadow-sm"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-full w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <Link href={user ? getDashboardRoute(user.role) : '/'} className="flex items-center gap-3">
              <img src="/logo.png" alt="Alpha System v5" className="w-10 h-10 rounded-lg object-contain" />
              <div>
                <h1 className="font-bold text-lg">Alpha System v5</h1>
                <p className="text-xs text-muted-foreground">Election Management</p>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.ktpPhoto} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={user?.role === 'SAKSI' ? '/saksi/profile' : '/admin/saksi'}>
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>
    </>
  );
}
