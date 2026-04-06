'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  ArrowLeft, Save, User, Phone, CreditCard, Wallet, Shield,
  CheckCircle2, Camera, Edit3, Calendar, Mail, Landmark, Lock,
  CircleCheck, X, LogOut, Trash2, ClipboardCheck, FileText,
  Clock, KeyRound, AlertTriangle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { motion, AnimatePresence } from 'framer-motion'

/* ─── Animation Variants ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

const titleVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
}

const saveSuccessVariants = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: -10,
    transition: { duration: 0.3 },
  },
}

/* ─── Progress Ring Component ─── */
function ProgressRing({ value, size = 100, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  const color = value === 100
    ? { stroke: '#10b981', trail: '#d1fae5', text: '#059669', bg: '#ecfdf5' }
    : value >= 50
      ? { stroke: '#f59e0b', trail: '#fef3c7', text: '#d97706', bg: '#fffbeb' }
      : { stroke: '#f43f5e', trail: '#ffe4e6', text: '#e11d48', bg: '#fff1f2' }

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Trail circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.trail}
          strokeWidth={strokeWidth}
          className="dark:opacity-20"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        />
      </svg>
      {/* Center text */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <span className="text-xl font-bold" style={{ color: color.text }}>{value}%</span>
        <span className="text-[10px] font-medium text-muted-foreground">Lengkap</span>
      </motion.div>
    </div>
  )
}

/* ─── Helper: Mask account number ─── */
function maskAccount(value: string): string {
  if (!value || value.length < 4) return value || '-'
  const last = value.slice(-4)
  const masked = '*'.repeat(value.length - 4)
  return masked + last
}

/* ─── Helper: Format date in Indonesian ─── */
function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/* ─── Helper: Relative time ─── */
function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const now = new Date()
  const date = new Date(dateStr)
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return formatDate(dateStr)
}

/* ─── Completion Check Item ─── */
function CheckItem({ label, filled, icon }: { label: string; filled: boolean; icon: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
      filled
        ? 'bg-emerald-50 dark:bg-emerald-950/30'
        : 'bg-muted/30'
    }`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
        filled
          ? 'bg-emerald-500 text-white'
          : 'bg-muted text-muted-foreground'
      }`}>
        {filled ? (
          <CheckCircle2 className="w-3.5 h-3.5" />
        ) : (
          icon
        )}
      </div>
      <span className={`text-sm ${
        filled
          ? 'text-emerald-700 dark:text-emerald-300 font-medium'
          : 'text-muted-foreground'
      }`}>
        {label}
      </span>
    </div>
  )
}

export default function SaksiProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [editMode, setEditMode] = useState(false)
  const [editSection, setEditSection] = useState<'personal' | 'bank' | null>(null)
  const [activity, setActivity] = useState<{ totalCheckIns: number; totalReports: number; lastActivity: string | null }>({
    totalCheckIns: 0,
    totalReports: 0,
    lastActivity: null,
  })

  // Dialogs
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    ktpNumber: '',
    bankName: '',
    bankAccount: '',
    bankHolderName: '',
    eWalletType: '',
    eWalletNumber: '',
  })

  // Store original form for cancel
  const [originalForm, setOriginalForm] = useState(form)

  const fetchProfile = useCallback(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((res) => {
        if (res.success) {
          setProfile(res.data)
          const newForm = {
            name: res.data.name || '',
            email: res.data.email || '',
            phone: res.data.phone || '',
            ktpNumber: res.data.ktpNumber || '',
            bankName: res.data.bankName || '',
            bankAccount: res.data.bankAccount || '',
            bankHolderName: res.data.bankHolderName || '',
            eWalletType: res.data.eWalletType || '',
            eWalletNumber: res.data.eWalletNumber || '',
          }
          setForm(newForm)
          setOriginalForm(newForm)
        } else {
          setError(res.error)
        }
      })
      .catch(() => setError('Gagal memuat profil'))
      .finally(() => setLoading(false))
  }, [])

  const fetchActivity = useCallback(() => {
    // Fetch check-ins count
    fetch('/api/check-ins/my')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) {
          setActivity((prev) => ({
            ...prev,
            totalCheckIns: data.data.length,
            lastActivity: data.data.length > 0
              ? data.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.createdAt
              : prev.lastActivity,
          }))
        }
      })
      .catch(() => {})

    // Fetch reports count
    fetch('/api/reports')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) {
          const myReports = data.data.filter((r: any) => r.userId === user?.id)
          setActivity((prev) => ({
            ...prev,
            totalReports: myReports.length,
            lastActivity: myReports.length > 0
              ? (() => {
                  const latestReport = myReports.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]?.createdAt
                  if (!prev.lastActivity) return latestReport
                  return new Date(latestReport) > new Date(prev.lastActivity) ? latestReport : prev.lastActivity
                })()
              : prev.lastActivity,
          }))
        }
      })
      .catch(() => {})
  }, [user?.id])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  useEffect(() => {
    if (user) fetchActivity()
  }, [user, fetchActivity])

  // Hide saved badge after 3 seconds
  useEffect(() => {
    if (saved) {
      const timer = setTimeout(() => setSaved(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [saved])

  const updateForm = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setSaved(false)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Profil berhasil diperbarui')
        setProfile(data.data)
        setOriginalForm({ ...form })
        setSaved(true)
        setEditSection(null)
      } else {
        toast.error(data.error || 'Gagal memperbarui profil')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setForm(originalForm)
    setEditSection(null)
    setSaved(false)
  }

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Kata sandi baru tidak cocok')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Kata sandi minimal 6 karakter')
      return
    }
    setPasswordSaving(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Kata sandi berhasil diubah')
        setPasswordDialogOpen(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        toast.error(data.error || 'Gagal mengubah kata sandi')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Akun berhasil dihapus')
        await logout()
        router.push('/')
      } else {
        toast.error(data.error || 'Gagal menghapus akun')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  // Profile completion
  const profileCompletion = useMemo(() => {
    const checks = [
      { key: 'Nama', filled: !!form.name },
      { key: 'No. HP', filled: !!form.phone },
      { key: 'No. KTP', filled: !!form.ktpNumber },
      { key: 'Info Bank', filled: !!form.bankName && !!form.bankAccount },
      { key: 'Email Terverifikasi', filled: !!profile?.email },
    ]
    const filled = checks.filter((c) => c.filled).length
    return {
      percentage: Math.round((filled / checks.length) * 100),
      checks,
    }
  }, [form, profile?.email])

  const completionColor = profileCompletion.percentage === 100
    ? 'emerald'
    : profileCompletion.percentage >= 50
      ? 'amber'
      : 'rose'

  if (loading) return <DashboardSkeleton variant="detail" />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  const initials = (form.name || profile?.name || 'U').charAt(0).toUpperCase()
  const isEditing = editSection !== null

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-8">
      {/* ─── Gradient Title Area with Large Avatar ─── */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-transparent p-6 pt-8 pb-10"
        variants={titleVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative blurred circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-100/40 dark:bg-emerald-900/20 blur-2xl" />
        <div className="absolute -bottom-4 left-1/4 w-28 h-28 rounded-full bg-teal-100/30 dark:bg-teal-900/15 blur-xl" />
        <div className="absolute top-4 right-1/3 w-16 h-16 rounded-full bg-amber-100/20 dark:bg-amber-900/10 blur-lg" />

        <div className="relative flex flex-col items-center text-center">
          {/* Back button */}
          <div className="absolute top-0 left-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="bg-white/60 hover:bg-white/80 dark:bg-slate-800/60 dark:hover:bg-slate-800/80 border border-emerald-100 dark:border-emerald-800/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Large Avatar */}
          <div className="relative mb-4">
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-emerald-200/50 dark:shadow-emerald-900/30 ring-4 ring-white dark:ring-slate-800"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {initials}
            </motion.div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-emerald-200 dark:border-emerald-800">
              <Camera className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                {form.name || profile?.name || 'Belum diisi'}
              </h1>
              <Badge
                variant="secondary"
                className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs"
              >
                {profile?.role || 'Saksi'}
              </Badge>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-1 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span className="text-sm">{profile?.email || '-'}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kelola data diri dan informasi pembayaran
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Profile Completion Card with Ring + Check Items ─── */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <Card className="overflow-hidden shadow-sm">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Circular Progress Ring */}
              <ProgressRing
                value={profileCompletion.percentage}
                size={100}
                strokeWidth={8}
              />

              {/* Check Items */}
              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`p-1.5 rounded-lg ${
                    completionColor === 'emerald'
                      ? 'bg-emerald-100 dark:bg-emerald-900/40'
                      : completionColor === 'amber'
                        ? 'bg-amber-100 dark:bg-amber-900/40'
                        : 'bg-rose-100 dark:bg-rose-900/40'
                  }`}>
                    <CircleCheck className={`h-4 w-4 ${
                      completionColor === 'emerald'
                        ? 'text-emerald-600'
                        : completionColor === 'amber'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                    }`} />
                  </div>
                  <span className="font-medium text-sm">Kelengkapan Profil</span>
                  {profileCompletion.percentage === 100 && (
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] border-0 ml-auto">
                      Lengkap!
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  <CheckItem
                    label="Nama"
                    filled={!!form.name}
                    icon={<User className="w-3 h-3" />}
                  />
                  <CheckItem
                    label="No. HP"
                    filled={!!form.phone}
                    icon={<Phone className="w-3 h-3" />}
                  />
                  <CheckItem
                    label="No. KTP"
                    filled={!!form.ktpNumber}
                    icon={<CreditCard className="w-3 h-3" />}
                  />
                  <CheckItem
                    label="Info Bank"
                    filled={!!form.bankName && !!form.bankAccount}
                    icon={<Landmark className="w-3 h-3" />}
                  />
                  <CheckItem
                    label="Email Terverifikasi"
                    filled={!!profile?.email}
                    icon={<Mail className="w-3 h-3" />}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ─── Animated Card Container ─── */}
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ─── Activity Summary ─── */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/40">
                  <Clock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                Ringkasan Aktivitas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-3 gap-3">
                {/* Total Check-ins */}
                <motion.div
                  className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/60 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/50"
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-2">
                    <ClipboardCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <motion.span
                    className="text-2xl font-bold text-emerald-700 dark:text-emerald-300"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.4 }}
                  >
                    {activity.totalCheckIns}
                  </motion.span>
                  <span className="text-[11px] text-muted-foreground font-medium mt-0.5">Check-in</span>
                </motion.div>

                {/* Reports Submitted */}
                <motion.div
                  className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/60 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-100 dark:border-amber-900/50"
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mb-2">
                    <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <motion.span
                    className="text-2xl font-bold text-amber-700 dark:text-amber-300"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.5 }}
                  >
                    {activity.totalReports}
                  </motion.span>
                  <span className="text-[11px] text-muted-foreground font-medium mt-0.5">Laporan</span>
                </motion.div>

                {/* Last Activity */}
                <motion.div
                  className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-slate-50 to-muted/60 dark:from-slate-950/20 dark:to-slate-900/20 border border-slate-200 dark:border-slate-800/50"
                  whileHover={{ scale: 1.03, y: -2 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-tight text-center">
                    {activity.lastActivity ? timeAgo(activity.lastActivity) : '-'}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium mt-1">Aktivitas Terakhir</span>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Personal Data Card ─── */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                    <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  Data Diri
                </CardTitle>
                {editSection !== 'personal' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditSection('personal')}
                    className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 h-8"
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {/* Name */}
              <div className={`rounded-xl p-4 transition-colors ${editSection === 'personal' ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50' : 'bg-muted/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nama Lengkap
                  </Label>
                </div>
                <AnimatePresence mode="wait">
                  {editSection === 'personal' ? (
                    <motion.div
                      key="name-edit"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => updateForm('name', e.target.value)}
                        className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500/30"
                        placeholder="Masukkan nama lengkap"
                      />
                    </motion.div>
                  ) : (
                    <motion.p
                      key="name-display"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium pl-9"
                    >
                      {form.name || <span className="text-muted-foreground italic">Belum diisi</span>}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Email (read-only) */}
              <div className="rounded-xl p-4 bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                    <Mail className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </Label>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] gap-1 ml-auto"
                  >
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Terverifikasi
                  </Badge>
                </div>
                <p className="text-sm font-medium pl-9">
                  {form.email || <span className="text-muted-foreground italic">Belum diisi</span>}
                </p>
              </div>

              {/* Phone */}
              <div className={`rounded-xl p-4 transition-colors ${editSection === 'personal' ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50' : 'bg-muted/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                    <Phone className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    No. Telepon
                  </Label>
                </div>
                <AnimatePresence mode="wait">
                  {editSection === 'personal' ? (
                    <motion.div
                      key="phone-edit"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => updateForm('phone', e.target.value)}
                        className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500/30"
                        placeholder="08xxxxxxxxxx"
                      />
                    </motion.div>
                  ) : (
                    <motion.p
                      key="phone-display"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium pl-9 font-mono"
                    >
                      {form.phone || <span className="text-muted-foreground italic">Belum diisi</span>}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* KTP */}
              <div className={`rounded-xl p-4 transition-colors ${editSection === 'personal' ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50' : 'bg-muted/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                    <CreditCard className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <Label htmlFor="ktpNumber" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    No. KTP
                  </Label>
                </div>
                <AnimatePresence mode="wait">
                  {editSection === 'personal' ? (
                    <motion.div
                      key="ktp-edit"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Input
                        id="ktpNumber"
                        value={form.ktpNumber}
                        onChange={(e) => updateForm('ktpNumber', e.target.value)}
                        className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500/30"
                        placeholder="16 digit nomor KTP"
                      />
                    </motion.div>
                  ) : (
                    <motion.p
                      key="ktp-display"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium pl-9 font-mono"
                    >
                      {form.ktpNumber
                        ? form.ktpNumber.length > 8
                          ? form.ktpNumber.slice(0, 4) + '****' + form.ktpNumber.slice(-4)
                          : form.ktpNumber
                        : <span className="text-muted-foreground italic">Belum diisi</span>}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Save/Cancel Buttons */}
              <AnimatePresence>
                {editSection === 'personal' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-2 pt-1"
                  >
                    <Button
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 h-10 text-sm"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <motion.div
                            className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1.5" />
                          Simpan
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 text-sm"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      Batal
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Payment Info Card ─── */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/40">
                    <Wallet className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  </div>
                  Informasi Pembayaran
                </CardTitle>
                {editSection !== 'bank' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditSection('bank')}
                    className="border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 h-8"
                  >
                    <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              {/* Bank Info Section */}
              <div className="rounded-xl bg-gradient-to-br from-emerald-50/80 to-teal-50/60 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-100 dark:border-emerald-900/50 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                    <Landmark className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Informasi Bank</h4>
                    <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70">Rekening untuk pencairan honor</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {/* Bank Name */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="bankName" className="text-xs text-muted-foreground w-32 shrink-0">Nama Bank</Label>
                    <AnimatePresence mode="wait">
                      {editSection === 'bank' ? (
                        <motion.div
                          key="bankName-edit"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-1"
                        >
                          <Input
                            id="bankName"
                            value={form.bankName}
                            onChange={(e) => updateForm('bankName', e.target.value)}
                            className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500/30 h-8 text-sm"
                            placeholder="BCA, Mandiri, dll"
                          />
                        </motion.div>
                      ) : (
                        <motion.span
                          key="bankName-display"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm font-medium flex-1"
                        >
                          {form.bankName || <span className="text-muted-foreground italic">Belum diisi</span>}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Bank Account */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="bankAccount" className="text-xs text-muted-foreground w-32 shrink-0">No. Rekening</Label>
                    <AnimatePresence mode="wait">
                      {editSection === 'bank' ? (
                        <motion.div
                          key="bankAccount-edit"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-1"
                        >
                          <Input
                            id="bankAccount"
                            value={form.bankAccount}
                            onChange={(e) => updateForm('bankAccount', e.target.value)}
                            className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500/30 h-8 text-sm font-mono"
                            placeholder="Nomor rekening"
                          />
                        </motion.div>
                      ) : (
                        <motion.span
                          key="bankAccount-display"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm font-medium flex-1 font-mono"
                        >
                          {form.bankAccount
                            ? maskAccount(form.bankAccount)
                            : <span className="text-muted-foreground italic">Belum diisi</span>}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Bank Holder Name */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="bankHolderName" className="text-xs text-muted-foreground w-32 shrink-0">Nama Pemilik</Label>
                    <AnimatePresence mode="wait">
                      {editSection === 'bank' ? (
                        <motion.div
                          key="bankHolderName-edit"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-1"
                        >
                          <Input
                            id="bankHolderName"
                            value={form.bankHolderName}
                            onChange={(e) => updateForm('bankHolderName', e.target.value)}
                            className="border-emerald-200 dark:border-emerald-800 focus-visible:ring-emerald-500/30 h-8 text-sm"
                            placeholder="Nama sesuai buku rekening"
                          />
                        </motion.div>
                      ) : (
                        <motion.span
                          key="bankHolderName-display"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm font-medium flex-1"
                        >
                          {form.bankHolderName || <span className="text-muted-foreground italic">Belum diisi</span>}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* E-Wallet Section */}
              <div className="rounded-xl bg-gradient-to-br from-amber-50/60 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-100 dark:border-amber-900/50 p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                    <Wallet className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">E-Wallet</h4>
                    <p className="text-[11px] text-amber-600/70 dark:text-amber-400/70">Dompet digital alternatif</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {/* E-Wallet Type */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="eWalletType" className="text-xs text-muted-foreground w-32 shrink-0">Jenis E-Wallet</Label>
                    <AnimatePresence mode="wait">
                      {editSection === 'bank' ? (
                        <motion.div
                          key="eWalletType-edit"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-1"
                        >
                          <Input
                            id="eWalletType"
                            value={form.eWalletType}
                            onChange={(e) => updateForm('eWalletType', e.target.value)}
                            className="border-amber-200 dark:border-amber-800 focus-visible:ring-amber-500/30 h-8 text-sm"
                            placeholder="GoPay, OVO, dll"
                          />
                        </motion.div>
                      ) : (
                        <motion.span
                          key="eWalletType-display"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm font-medium flex-1"
                        >
                          {form.eWalletType || <span className="text-muted-foreground italic">Belum diisi</span>}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* E-Wallet Number */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="eWalletNumber" className="text-xs text-muted-foreground w-32 shrink-0">No. E-Wallet</Label>
                    <AnimatePresence mode="wait">
                      {editSection === 'bank' ? (
                        <motion.div
                          key="eWalletNumber-edit"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="flex-1"
                        >
                          <Input
                            id="eWalletNumber"
                            value={form.eWalletNumber}
                            onChange={(e) => updateForm('eWalletNumber', e.target.value)}
                            className="border-amber-200 dark:border-amber-800 focus-visible:ring-amber-500/30 h-8 text-sm font-mono"
                            placeholder="Nomor E-Wallet"
                          />
                        </motion.div>
                      ) : (
                        <motion.span
                          key="eWalletNumber-display"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm font-medium flex-1 font-mono"
                        >
                          {form.eWalletNumber
                            ? maskAccount(form.eWalletNumber)
                            : <span className="text-muted-foreground italic">Belum diisi</span>}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Save/Cancel Buttons for Bank Section */}
              <AnimatePresence>
                {editSection === 'bank' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="flex gap-2"
                  >
                    <Button
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 h-10 text-sm"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <motion.div
                            className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1.5" />
                          Simpan
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-10 text-sm"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      Batal
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Account Actions Card ─── */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Shield className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                Keamanan & Akun
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Registration Date */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tanggal Registrasi</p>
                    <p className="text-sm font-medium">{formatDate(profile?.createdAt)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Role */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Peran Akun</p>
                    <p className="text-sm font-medium">{profile?.role || 'Saksi'}</p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                >
                  {profile?.role || 'Saksi'}
                </Badge>
              </div>

              <Separator />

              {/* Change Password */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                    <KeyRound className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Kata Sandi</p>
                    <p className="text-sm font-medium">••••••••</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPasswordDialogOpen(true)}
                  className="border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 h-8"
                >
                  <Lock className="h-3.5 w-3.5 mr-1.5" />
                  Ubah
                </Button>
              </div>

              <Separator />

              {/* Logout */}
              <Button
                variant="outline"
                className="w-full h-11 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/30"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Keluar dari Akun
              </Button>

              <Separator />

              {/* Delete Account */}
              <Button
                variant="ghost"
                className="w-full h-10 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-300"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Hapus Akun
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Saved indicator ─── */}
        <AnimatePresence>
          {saved && (
            <motion.div
              className="flex items-center justify-center gap-2"
              variants={saveSuccessVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.1 }}
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </motion.div>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                Profil berhasil disimpan
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ─── Change Password Dialog ─── */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40">
                <KeyRound className="h-4 w-4 text-amber-600" />
              </div>
              Ubah Kata Sandi
            </DialogTitle>
            <DialogDescription>
              Masukkan kata sandi lama dan kata sandi baru Anda. Kata sandi minimal 6 karakter.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Kata Sandi Lama
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="border-slate-200 dark:border-slate-800 focus-visible:ring-amber-500/30"
                placeholder="Masukkan kata sandi lama"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Kata Sandi Baru
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="border-slate-200 dark:border-slate-800 focus-visible:ring-amber-500/30"
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Konfirmasi Kata Sandi Baru
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className={`border-slate-200 dark:border-slate-800 focus-visible:ring-amber-500/30 ${
                  passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword
                    ? 'border-rose-300 dark:border-rose-800 focus-visible:ring-rose-500/30'
                    : ''
                }`}
                placeholder="Ulangi kata sandi baru"
              />
              {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-xs text-rose-500">Kata sandi tidak cocok</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setPasswordDialogOpen(false)
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
              }}
              disabled={passwordSaving}
            >
              Batal
            </Button>
            <Button
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white border-0"
              onClick={handleChangePassword}
              disabled={passwordSaving || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            >
              {passwordSaving ? (
                <>
                  <motion.div
                    className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Mengubah...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1.5" />
                  Ubah Sandi
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Account Confirmation Dialog ─── */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-900/40">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
              </div>
              Hapus Akun
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-400">
              Tindakan ini tidak dapat dibatalkan. Semua data Anda termasuk profil, riwayat check-in, dan laporan akan dihapus secara permanen.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="h-5 w-5 text-rose-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-rose-800 dark:text-rose-200">Peringatan</p>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                  Akun <strong>{profile?.email}</strong> akan dihapus permanen dan tidak dapat dikembalikan.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              className="flex-1 sm:flex-none"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              className="flex-1 sm:flex-none"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <motion.div
                    className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Ya, Hapus Akun
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
