'use client';

import { cn } from '@/lib/utils';

type Variant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export function StatusBadge({ children, variant = 'default', className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// Helper function to map payment status to badge variant
export function getPaymentStatusVariant(status: string): Variant {
  switch (status) {
    case 'DISBURSED':
    case 'APPROVED':
      return 'success';
    case 'READY_FOR_PAYMENT':
      return 'info';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
    case 'CANCELLED':
      return 'danger';
    default:
      return 'default';
  }
}

// Helper function to map report status to badge variant
export function getReportStatusVariant(status: string): Variant {
  switch (status) {
    case 'VERIFIED':
      return 'success';
    case 'UNDER_REVIEW':
      return 'info';
    case 'PENDING':
      return 'warning';
    case 'DISMISSED':
      return 'danger';
    default:
      return 'default';
  }
}

// Helper function to map assignment status to badge variant
export function getAssignmentStatusVariant(status: string): Variant {
  switch (status) {
    case 'COMPLETED':
      return 'success';
    case 'ACTIVE':
      return 'info';
    case 'CANCELLED':
      return 'danger';
    default:
      return 'default';
  }
}
