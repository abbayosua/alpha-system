import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import type { UserRole } from '@/types'

type NotificationType = 'info' | 'success' | 'warning' | 'error'

interface Notification {
  id: string
  title: string
  description: string
  type: NotificationType
  read: boolean
  createdAt: string
  iconName: string
}

// Generate relative timestamp
function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60000).toISOString()
}

function hoursAgo(hours: number): string {
  return minutesAgo(hours * 60)
}

function daysAgo(days: number): string {
  return hoursAgo(days * 24)
}

// Saksi notifications
const saksiNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'Reminder Check-in Pagi',
    description: 'Jangan lupa lakukan check-in pagi di TPS Anda sebelum pukul 07:00 WIB.',
    type: 'warning',
    read: false,
    createdAt: minutesAgo(5),
    iconName: 'LogIn',
  },
  {
    id: 'n2',
    title: 'Pembayaran Disetujui',
    description: 'Pembayaran honor Anda sebesar Rp 500.000 telah disetujui dan akan segera dicairkan.',
    type: 'success',
    read: false,
    createdAt: minutesAgo(30),
    iconName: 'Wallet',
  },
  {
    id: 'n3',
    title: 'Penugasan TPS Diperbarui',
    description: 'Anda telah ditugaskan ke TPS-003 Kelurahan Sukamaju. Silakan cek detail penugasan.',
    type: 'info',
    read: false,
    createdAt: hoursAgo(2),
    iconName: 'MapPin',
  },
  {
    id: 'n4',
    title: 'Laporan Diverifikasi',
    description: 'Laporan kecurangan yang Anda ajukan pada TPS-002 telah diverifikasi oleh admin.',
    type: 'success',
    read: true,
    createdAt: hoursAgo(5),
    iconName: 'CheckCircle2',
  },
  {
    id: 'n5',
    title: 'Dana Berhasil Dicairkan',
    description: 'Dana pembayaran sebesar Rp 500.000 telah berhasil ditransfer ke rekening Anda.',
    type: 'success',
    read: true,
    createdAt: daysAgo(1),
    iconName: 'Banknote',
  },
  {
    id: 'n6',
    title: 'Update Aplikasi',
    description: 'Alpha System v5 telah diperbarui. Fitur baru: upload foto C1 dan selfie check-in.',
    type: 'info',
    read: true,
    createdAt: daysAgo(2),
    iconName: 'Smartphone',
  },
  {
    id: 'n7',
    title: 'Peringatan GPS Check-in',
    description: 'Pastikan GPS aktif saat melakukan check-in untuk verifikasi lokasi.',
    type: 'warning',
    read: false,
    createdAt: hoursAgo(8),
    iconName: 'AlertTriangle',
  },
]

// Admin notifications
const adminNotifications: Notification[] = [
  {
    id: 'a1',
    title: 'Saksi Baru Terdaftar',
    description: 'Ahmad Fauzi baru saja mendaftar sebagai saksi. Menunggu verifikasi data KTP.',
    type: 'info',
    read: false,
    createdAt: minutesAgo(3),
    iconName: 'UserPlus',
  },
  {
    id: 'a2',
    title: 'Laporan Kecurangan Baru',
    description: 'Saksi di TPS-005 melaporkan indikasi kecurangan pemilu. Segera review.',
    type: 'error',
    read: false,
    createdAt: minutesAgo(15),
    iconName: 'AlertTriangle',
  },
  {
    id: 'a3',
    title: 'Check-in Rate Rendah',
    description: 'Check-in pagi hanya mencapai 45% di kecamatan Merdeka. Perlu tindakan.',
    type: 'warning',
    read: false,
    createdAt: hoursAgo(1),
    iconName: 'TrendingDown',
  },
  {
    id: 'a4',
    title: '5 Saksi Belum Punya Penugasan',
    description: 'Ada 5 saksi aktif yang belum diplotting ke TPS manapun.',
    type: 'warning',
    read: true,
    createdAt: hoursAgo(3),
    iconName: 'GitBranch',
  },
  {
    id: 'a5',
    title: 'Input Suara Selesai',
    description: 'Semua saksi di TPS-001 telah selesai menginput suara. Data lengkap.',
    type: 'success',
    read: true,
    createdAt: hoursAgo(6),
    iconName: 'CheckCircle2',
  },
  {
    id: 'a6',
    title: 'Data TPS Diperbarui',
    description: 'Koordinat TPS-010 telah diperbarui oleh admin. Verifikasi ulang lokasi.',
    type: 'info',
    read: true,
    createdAt: daysAgo(1),
    iconName: 'MapPinned',
  },
  {
    id: 'a7',
    title: 'Audit Log - Perubahan Role',
    description: 'Role user saksi@demo.com diubah oleh superadmin.',
    type: 'info',
    read: true,
    createdAt: daysAgo(2),
    iconName: 'ScrollText',
  },
]

// Admin Keuangan notifications
const keuanganNotifications: Notification[] = [
  {
    id: 'k1',
    title: 'Permintaan Pembayaran Baru',
    description: '3 pembayaran baru siap divalidasi. Total: Rp 1.500.000.',
    type: 'warning',
    read: false,
    createdAt: minutesAgo(8),
    iconName: 'Receipt',
  },
  {
    id: 'k2',
    title: 'Pembayaran Siap Dicairkan',
    description: '5 pembayaran telah disetujui dan siap dicairkan. Total: Rp 2.500.000.',
    type: 'info',
    read: false,
    createdAt: minutesAgo(45),
    iconName: 'Send',
  },
  {
    id: 'k3',
    title: 'Transfer Berhasil',
    description: 'Pencairan dana batch #12 berhasil. 10 saksi telah menerima pembayaran.',
    type: 'success',
    read: false,
    createdAt: hoursAgo(2),
    iconName: 'CheckCircle2',
  },
  {
    id: 'k4',
    title: 'Validasi Gagal',
    description: 'Pembayaran untuk Budi Santoso gagal divalidasi: data KTP tidak lengkap.',
    type: 'error',
    read: false,
    createdAt: hoursAgo(4),
    iconName: 'XCircle',
  },
  {
    id: 'k5',
    title: 'Laporan Keuangan Tersedia',
    description: 'Laporan keuangan mingguan telah tersedia. Total pencairan: Rp 15.000.000.',
    type: 'info',
    read: true,
    createdAt: daysAgo(1),
    iconName: 'FileBarChart',
  },
  {
    id: 'k6',
    title: 'Reminder Pencairan',
    description: 'Ada pembayaran yang sudah disetujui lebih dari 24 jam namun belum dicairkan.',
    type: 'warning',
    read: true,
    createdAt: daysAgo(1),
    iconName: 'Clock',
  },
  {
    id: 'k7',
    title: 'Batch Pencairan Selesai',
    description: 'Batch #11 dengan 8 pembayaran telah berhasil dicairkan kemarin.',
    type: 'success',
    read: true,
    createdAt: daysAgo(2),
    iconName: 'Banknote',
  },
  {
    id: 'k8',
    title: 'Saldo Tidak Memadai',
    description: 'Saldo akun tidak cukup untuk pencairan batch berikutnya. Segera top-up.',
    type: 'error',
    read: false,
    createdAt: minutesAgo(10),
    iconName: 'Wallet',
  },
]

const notificationsByRole: Record<UserRole, Notification[]> = {
  SAKSI: saksiNotifications,
  ADMIN: adminNotifications,
  ADMIN_KEUANGAN: keuanganNotifications,
}

// GET /api/notifications - Get notifications based on user role
export async function GET() {
  try {
    // Check authentication (any authenticated role is fine)
    const authResult = await requireAuth()
    if (!authResult) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Silakan login terlebih dahulu.' },
        { status: 401 }
      )
    }

    const role = authResult.profile.role
    const notifications = notificationsByRole[role] || []

    const unreadCount = notifications.filter((n) => !n.read).length

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Notifications error:', error)
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
