'use client';

import { useEffect } from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function PageWrapper({ children, className }: PageWrapperProps) {
  // Ensure footer stays at bottom
  useEffect(() => {
    document.body.classList.add('min-h-screen');
    return () => document.body.classList.remove('min-h-screen');
  }, []);

  return (
    <div className={`min-h-screen flex flex-col ${className || ''}`}>
      {children}
    </div>
  );
}
