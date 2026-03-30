'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  ClipboardList, 
  ChevronRight,
  Home,
} from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface HeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
}

export function Header({ title, breadcrumbs }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              <Home className="h-4 w-4" />
            </Link>
            {breadcrumbs.map((item, index) => (
              <div key={index} className="flex items-center gap-1">
                <ChevronRight className="h-4 w-4" />
                {item.href ? (
                  <Link href={item.href} className="hover:text-foreground">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{item.label}</span>
                )}
              </div>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
