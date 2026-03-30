'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SAKSI APP. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground">
              Bantuan
            </Link>
            <Link href="#" className="hover:text-foreground">
              Privasi
            </Link>
            <Link href="#" className="hover:text-foreground">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
