import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'id' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Indonesian translations (default)
const translationsId: Record<string, string> = {
  // Landing page
  'app.name': 'Alpha System v5',
  'app.tagline': 'Sistem Manajemen Saksi Terpercaya',
  'app.description': 'Platform terintegrasi untuk manajemen saksi pemilu dengan sistem verifikasi GPS, input suara real-time, dan pembayaran berbasis kinerja.',
  
  'hero.register': 'Daftar sebagai Saksi',
  'hero.signin': 'Masuk ke Akun',
  
  'stats.witnesses': 'Total Saksi',
  'stats.tps': 'TPS Aktif',
  'stats.checkin': 'Check-in Rate',
  'stats.submitted': 'Data Terinput',
  
  'features.title': 'Fitur Unggulan',
  'features.subtitle': 'Sistem lengkap untuk mengelola saksi pemilu dengan transparansi dan akuntabilitas tinggi',
  
  'feature.gps.title': 'Verifikasi GPS',
  'feature.gps.desc': 'Verifikasi lokasi real-time untuk memastikan kehadiran di TPS yang tepat',
  'feature.selfie.title': 'Selfie Check-in',
  'feature.selfie.desc': 'Sistem check-in dengan foto selfie untuk validasi kehadiran',
  'feature.vote.title': 'Input Suara',
  'feature.vote.desc': 'Input hasil perhitungan suara dengan upload dokumen C1',
  'feature.fraud.title': 'Laporan Pelanggaran',
  'feature.fraud.desc': 'Laporkan kecurangan atau pelanggaran dengan bukti video',
  'feature.payment.title': 'Pembayaran Otomatis',
  'feature.payment.desc': 'Sistem pembayaran berbasis kinerja dengan validasi otomatis',
  'feature.multirole.title': 'Multi-Role System',
  'feature.multirole.desc': 'Sistem dengan peran Admin, Admin Keuangan, dan Saksi',
  
  'benefits.title': 'Mengapa Memilih Alpha System v5?',
  'benefits.1': 'Verifikasi kehadiran dengan GPS dan foto',
  'benefits.2': 'Input data suara secara real-time',
  'benefits.3': 'Laporan pelanggaran dengan bukti video',
  'benefits.4': 'Pembayaran transparan berdasarkan kinerja',
  'benefits.5': 'Dashboard monitoring untuk admin',
  'benefits.6': 'Audit trail lengkap semua aktivitas',
  
  'stats2.accuracy': 'Akurasi Data',
  'stats2.access': 'Akses Sistem',
  'stats2.transparency': 'Transparansi',
  'stats2.monitoring': 'Monitoring',
  
  'cta.title': 'Siap Bergabung sebagai Saksi?',
  'cta.subtitle': 'Daftarkan diri Anda sekarang dan berkontribusi dalam menjaga transparansi pemilu',
  'cta.register': 'Daftar Sekarang',
  'cta.signin': 'Sudah Punya Akun? Masuk',
  
  // Auth
  'auth.signin': 'Masuk',
  'auth.signin_desc': 'Masuk ke akun Alpha System v5 Anda',
  'auth.register': 'Daftar',
  'auth.register_desc': 'Daftarkan diri Anda sebagai saksi pemilu',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.password_placeholder': 'Masukkan password',
  'auth.no_account': 'Belum punya akun?',
  'auth.has_account': 'Sudah punya akun?',
  'auth.register_here': 'Daftar di sini',
  'auth.signin_here': 'Masuk di sini',
  
  'auth.demo_accounts': 'Akun Demo',
  'auth.demo_password': 'Password untuk semua akun demo:',
  'auth.witness': 'Saksi',
  'auth.admin': 'Admin',
  'auth.finance': 'Admin Keuangan',
  
  // Sidebar
  'sidebar.subtitle': 'Manajemen Pemilu',
  'sidebar.my_account': 'Akun Saya',
  'sidebar.profile': 'Profil',
  'sidebar.logout': 'Keluar',
  
  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.profile': 'Profil',
  'nav.my_tps': 'TPS Saya',
  'nav.checkin': 'Check-in',
  'nav.vote_input': 'Input Suara',
  'nav.report': 'Lapor',
  'nav.payment': 'Pembayaran',
  'nav.manage_witnesses': 'Kelola Saksi',
  'nav.manage_tps': 'Kelola TPS',
  'nav.plotting': 'Plotting',
  'nav.reports': 'Laporan',
  'nav.audit': 'Audit Trail',
  'nav.disbursement': 'Disbursement',
  'nav.history': 'Riwayat',
  
  // Common
  'common.search': 'Cari...',
  'common.filter': 'Filter',
  'common.export': 'Export',
  'common.save': 'Simpan',
  'common.cancel': 'Batal',
  'common.delete': 'Hapus',
  'common.edit': 'Edit',
  'common.view': 'Lihat',
  'common.add': 'Tambah',
  'common.submit': 'Submit',
  'common.loading': 'Memuat...',
  'common.success': 'Berhasil',
  'common.error': 'Gagal',
  
  // Status
  'status.active': 'Aktif',
  'status.pending': 'Menunggu',
  'status.completed': 'Selesai',
  'status.verified': 'Terverifikasi',
  'status.rejected': 'Ditolak',
};

// English translations
const translationsEn: Record<string, string> = {
  // Landing page
  'app.name': 'Alpha System v5',
  'app.tagline': 'Trusted Election Witness Management',
  'app.description': 'Integrated platform for election witness management with GPS verification, real-time vote input, and performance-based payment system.',
  
  'hero.register': 'Register as Witness',
  'hero.signin': 'Sign In',
  
  'stats.witnesses': 'Total Witnesses',
  'stats.tps': 'Active TPS',
  'stats.checkin': 'Check-in Rate',
  'stats.submitted': 'Data Submitted',
  
  'features.title': 'Key Features',
  'features.subtitle': 'Complete system for managing election witnesses with high transparency and accountability',
  
  'feature.gps.title': 'GPS Verification',
  'feature.gps.desc': 'Real-time location verification to ensure presence at the correct TPS',
  'feature.selfie.title': 'Selfie Check-in',
  'feature.selfie.desc': 'Check-in system with selfie photo for attendance validation',
  'feature.vote.title': 'Vote Input',
  'feature.vote.desc': 'Input vote count results with C1 document upload',
  'feature.fraud.title': 'Fraud Reporting',
  'feature.fraud.desc': 'Report violations or fraud with video evidence',
  'feature.payment.title': 'Automatic Payment',
  'feature.payment.desc': 'Performance-based payment system with automatic validation',
  'feature.multirole.title': 'Multi-Role System',
  'feature.multirole.desc': 'System with Admin, Finance Admin, and Witness roles',
  
  'benefits.title': 'Why Choose Alpha System v5?',
  'benefits.1': 'GPS and photo verified attendance',
  'benefits.2': 'Real-time vote data input',
  'benefits.3': 'Video evidence fraud reporting',
  'benefits.4': 'Transparent performance-based payment',
  'benefits.5': 'Admin monitoring dashboard',
  'benefits.6': 'Complete activity audit trail',
  
  'stats2.accuracy': 'Data Accuracy',
  'stats2.access': 'System Access',
  'stats2.transparency': 'Transparency',
  'stats2.monitoring': 'Monitoring',
  
  'cta.title': 'Ready to Join as a Witness?',
  'cta.subtitle': 'Register now and contribute to maintaining election transparency',
  'cta.register': 'Register Now',
  'cta.signin': 'Already Have an Account? Sign In',
  
  // Auth
  'auth.signin': 'Sign In',
  'auth.signin_desc': 'Sign in to your Alpha System v5 account',
  'auth.register': 'Register',
  'auth.register_desc': 'Register as an election witness',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.password_placeholder': 'Enter password',
  'auth.no_account': "Don't have an account?",
  'auth.has_account': 'Already have an account?',
  'auth.register_here': 'Register here',
  'auth.signin_here': 'Sign in here',
  
  'auth.demo_accounts': 'Demo Accounts',
  'auth.demo_password': 'Password for all demo accounts:',
  'auth.witness': 'Witness',
  'auth.admin': 'Admin',
  'auth.finance': 'Finance Admin',
  
  // Sidebar
  'sidebar.subtitle': 'Election Management',
  'sidebar.my_account': 'My Account',
  'sidebar.profile': 'Profile',
  'sidebar.logout': 'Logout',
  
  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.profile': 'Profile',
  'nav.my_tps': 'My TPS',
  'nav.checkin': 'Check-in',
  'nav.vote_input': 'Vote Input',
  'nav.report': 'Report',
  'nav.payment': 'Payment',
  'nav.manage_witnesses': 'Manage Witnesses',
  'nav.manage_tps': 'Manage TPS',
  'nav.plotting': 'Plotting',
  'nav.reports': 'Reports',
  'nav.audit': 'Audit Trail',
  'nav.disbursement': 'Disbursement',
  'nav.history': 'History',
  
  // Common
  'common.search': 'Search...',
  'common.filter': 'Filter',
  'common.export': 'Export',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.view': 'View',
  'common.add': 'Add',
  'common.submit': 'Submit',
  'common.loading': 'Loading...',
  'common.success': 'Success',
  'common.error': 'Error',
  
  // Status
  'status.active': 'Active',
  'status.pending': 'Pending',
  'status.completed': 'Completed',
  'status.verified': 'Verified',
  'status.rejected': 'Rejected',
};

const translations = {
  id: translationsId,
  en: translationsEn,
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'id', // Indonesian as default
      setLanguage: (lang) => set({ language: lang }),
      t: (key) => {
        const state = get();
        return translations[state.language][key] || key;
      },
    }),
    {
      name: 'alpha-language',
      partialize: (state) => ({ language: state.language }),
    }
  )
);
