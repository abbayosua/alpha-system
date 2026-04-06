import { Badge } from '@/components/ui/badge'
import type { PaymentStatus, ReportStatus, AssignmentStatus } from '@/types'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

function getVariantClasses(variant: 'success' | 'warning' | 'danger' | 'info' | 'secondary'): string {
  const map: Record<string, string> = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    warning: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    danger: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    secondary: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800',
  }
  return map[variant] || ''
}

export function getPaymentStatusVariant(status: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    PENDING: getVariantClasses('secondary'),
    READY_FOR_PAYMENT: getVariantClasses('warning'),
    APPROVED: getVariantClasses('info'),
    DISBURSED: getVariantClasses('success'),
    FAILED: getVariantClasses('danger'),
    CANCELLED: getVariantClasses('danger'),
  }
  return map[status] || ''
}

export function getPaymentStatusLabel(status: PaymentStatus): string {
  const map: Record<PaymentStatus, string> = {
    PENDING: 'Pending',
    READY_FOR_PAYMENT: 'Siap Bayar',
    APPROVED: 'Disetujui',
    DISBURSED: 'Dicairkan',
    FAILED: 'Gagal',
    CANCELLED: 'Dibatalkan',
  }
  return map[status] || status
}

export function getReportStatusVariant(status: ReportStatus): string {
  const map: Record<ReportStatus, string> = {
    PENDING: getVariantClasses('warning'),
    UNDER_REVIEW: getVariantClasses('info'),
    VERIFIED: getVariantClasses('success'),
    DISMISSED: getVariantClasses('danger'),
  }
  return map[status] || ''
}

export function getReportStatusLabel(status: ReportStatus): string {
  const map: Record<ReportStatus, string> = {
    PENDING: 'Menunggu',
    UNDER_REVIEW: 'Ditinjau',
    VERIFIED: 'Terverifikasi',
    DISMISSED: 'Ditolak',
  }
  return map[status] || status
}

export function getAssignmentStatusVariant(status: AssignmentStatus): string {
  const map: Record<AssignmentStatus, string> = {
    ACTIVE: getVariantClasses('success'),
    COMPLETED: getVariantClasses('info'),
    CANCELLED: getVariantClasses('danger'),
  }
  return map[status] || ''
}

export function getAssignmentStatusLabel(status: AssignmentStatus): string {
  const map: Record<AssignmentStatus, string> = {
    ACTIVE: 'Aktif',
    COMPLETED: 'Selesai',
    CANCELLED: 'Dibatalkan',
  }
  return map[status] || status
}

interface StatusBadgeProps {
  status: string
  variant?: BadgeVariant
  label?: string
  className?: string
}

export function StatusBadge({ status, variant: _variant, label, className }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={className}>
      {label || status}
    </Badge>
  )
}

export function PaymentStatusBadge({ status, className }: { status: PaymentStatus; className?: string }) {
  return (
    <Badge variant="outline" className={`${getPaymentStatusVariant(status)} ${className || ''}`}>
      {getPaymentStatusLabel(status)}
    </Badge>
  )
}

export function ReportStatusBadge({ status, className }: { status: ReportStatus; className?: string }) {
  return (
    <Badge variant="outline" className={`${getReportStatusVariant(status)} ${className || ''}`}>
      {getReportStatusLabel(status)}
    </Badge>
  )
}

export function AssignmentStatusBadge({ status, className }: { status: AssignmentStatus; className?: string }) {
  return (
    <Badge variant="outline" className={`${getAssignmentStatusVariant(status)} ${className || ''}`}>
      {getAssignmentStatusLabel(status)}
    </Badge>
  )
}
