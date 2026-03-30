// App constants

export const APP_NAME = 'Alpha System v5';
export const APP_DESCRIPTION = 'Election Witness Management System';

// Payment constants
export const BASE_PAYMENT_AMOUNT = 150000; // Rp 150.000

// GPS constants
export const GPS_MAX_DISTANCE = 100; // 100 meters radius

// File upload constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

// Status labels
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Menunggu Validasi',
  READY_FOR_PAYMENT: 'Siap Dibayar',
  APPROVED: 'Disetujui',
  DISBURSED: 'Telah Dibayar',
  FAILED: 'Gagal',
  CANCELLED: 'Dibatalkan',
};

export const REPORT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Menunggu',
  UNDER_REVIEW: 'Sedang Ditinjau',
  VERIFIED: 'Terverifikasi',
  DISMISSED: 'Ditolak',
};

export const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktif',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
};

export const CHECKIN_TYPE_LABELS: Record<string, string> = {
  MORNING: 'Check-in Pagi',
  FINAL: 'Check-in Akhir',
};

// E-wallet options
export const EWALLET_OPTIONS = [
  { value: 'gopay', label: 'GoPay' },
  { value: 'ovo', label: 'OVO' },
  { value: 'dana', label: 'DANA' },
  { value: 'shopeepay', label: 'ShopeePay' },
  { value: 'linkaja', label: 'LinkAja' },
];

// Bank options
export const BANK_OPTIONS = [
  { value: 'bca', label: 'Bank Central Asia (BCA)' },
  { value: 'mandiri', label: 'Bank Mandiri' },
  { value: 'bri', label: 'Bank Rakyat Indonesia (BRI)' },
  { value: 'bni', label: 'Bank Negara Indonesia (BNI)' },
  { value: 'bsi', label: 'Bank Syariah Indonesia (BSI)' },
  { value: 'btn', label: 'Bank Tabungan Negara (BTN)' },
  { value: 'cimb', label: 'Bank CIMB Niaga' },
  { value: 'danamon', label: 'Bank Danamon' },
  { value: 'permata', label: 'Bank Permata' },
  { value: 'other', label: 'Lainnya' },
];
