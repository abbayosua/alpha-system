'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  ArrowLeft, Save, User, Phone, CreditCard, Wallet, Shield,
  CheckCircle2, Camera, Edit3, Calendar, Mail, Landmark, Lock,
  CircleCheck
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

export default function SaksiProfilePage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    ktpNumber: '',
    bankName: '',
    bankAccount: '',
    bankHolderName: '',
    eWalletType: '',
    eWalletNumber: '',
  })

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((res) => {
        if (res.success) {
          setProfile(res.data)
          setForm({
            name: res.data.name || '',
            phone: res.data.phone || '',
            ktpNumber: res.data.ktpNumber || '',
            bankName: res.data.bankName || '',
            bankAccount: res.data.bankAccount || '',
            bankHolderName: res.data.bankHolderName || '',
            eWalletType: res.data.eWalletType || '',
            eWalletNumber: res.data.eWalletNumber || '',
          })
        } else {
          setError(res.error)
        }
      })
      .catch(() => setError('Gagal memuat profil'))
      .finally(() => setLoading(false))
  }, [])

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
        setSaved(true)
        setEditMode(false)
      } else {
        toast.error(data.error || 'Gagal memperbarui profil')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  // Profile completion
  const profileCompletion = useMemo(() => {
    const checks = [
      { key: 'Nama', filled: !!form.name },
      { key: 'No. HP', filled: !!form.phone },
      { key: 'No. KTP', filled: !!form.ktpNumber },
      { key: 'Info Bank', filled: !!form.bankName && !!form.bankAccount },
      { key: 'E-Wallet', filled: !!form.eWalletType && !!form.eWalletNumber },
    ]
    const filled = checks.filter((c) => c.filled).length
    const missing = checks.filter((c) => !c.filled).map((c) => c.key)
    return { percentage: Math.round((filled / checks.length) * 100), missing }
  }, [form])

  const completionColor = profileCompletion.percentage === 100
    ? 'emerald'
    : profileCompletion.percentage >= 50
      ? 'amber'
      : 'rose'

  if (loading) return <DashboardSkeleton variant="detail" />
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />

  const initials = (form.name || profile?.name || 'U').charAt(0).toUpperCase()

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* ─── Gradient Title Area ─── */}
      <motion.div
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-transparent p-6 pb-8"
        variants={titleVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Decorative blurred circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-emerald-100/40 dark:bg-emerald-900/20 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 w-24 h-24 rounded-full bg-teal-100/30 dark:bg-teal-900/15 blur-xl" />

        <div className="relative flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="bg-white/60 hover:bg-white/80 dark:bg-slate-800/60 dark:hover:bg-slate-800/80 border border-emerald-100 dark:border-emerald-800/50"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              Profil Saya
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola data diri dan informasi pembayaran
            </p>
          </div>
          <div className="ml-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Profile Avatar Section ─── */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <Card className="overflow-hidden shadow-sm border-0">
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/60 to-transparent p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Avatar */}
              <div className="relative">
                <motion.div
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 ring-4 ring-white dark:ring-slate-800"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  {initials}
                </motion.div>
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-emerald-200 dark:border-emerald-800">
                  <Camera className="h-3 w-3 text-emerald-600" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2">
                  <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-100">
                    {form.name || profile?.name || 'Belum diisi'}
                  </h2>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs"
                  >
                    {profile?.role || 'Saksi'}
                  </Badge>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1 text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="text-sm">{profile?.email || '-'}</span>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-0.5 text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="text-xs">Terdaftar {formatDate(profile?.createdAt)}</span>
                </div>
              </div>

              {/* Edit Toggle */}
              <Button
                variant={editMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEditMode(!editMode)}
                className={editMode
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 border-0 shadow-sm'
                  : 'border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                }
              >
                {editMode ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Selesai
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4 mr-1.5" />
                    Edit Profil
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* ─── Profile Completion ─── */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible">
        <Card className="overflow-hidden shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
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
              </div>
              <motion.span
                className={`text-sm font-bold ${
                  completionColor === 'emerald'
                    ? 'text-emerald-600'
                    : completionColor === 'amber'
                      ? 'text-amber-600'
                      : 'text-rose-600'
                }`}
                key={profileCompletion.percentage}
                initial={{ scale: 1.3 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {profileCompletion.percentage}%
              </motion.span>
            </div>

            {/* Progress bar */}
            <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className={`absolute inset-y-0 left-0 rounded-full ${
                  completionColor === 'emerald'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : completionColor === 'amber'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                      : 'bg-gradient-to-r from-rose-500 to-pink-400'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletion.percentage}%` }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              />
            </div>

            {/* Missing items */}
            {profileCompletion.missing.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profileCompletion.missing.map((item) => (
                  <Badge
                    key={item}
                    variant="outline"
                    className={`text-xs ${
                      completionColor === 'emerald'
                        ? 'border-emerald-200 text-emerald-600 dark:border-emerald-800 dark:text-emerald-400'
                        : completionColor === 'amber'
                          ? 'border-amber-200 text-amber-600 dark:border-amber-800 dark:text-amber-400'
                          : 'border-rose-200 text-rose-600 dark:border-rose-800 dark:text-rose-400'
                    }`}
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            )}
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
        {/* ─── Personal Data Card ─── */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                  <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                Data Diri
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {/* Name */}
              <div className={`rounded-xl p-4 transition-colors ${editMode ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50' : 'bg-muted/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Nama Lengkap
                  </Label>
                </div>
                <AnimatePresence mode="wait">
                  {editMode ? (
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

              {/* Phone */}
              <div className={`rounded-xl p-4 transition-colors ${editMode ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50' : 'bg-muted/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
                    <Phone className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    No. Telepon
                  </Label>
                </div>
                <AnimatePresence mode="wait">
                  {editMode ? (
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
              <div className={`rounded-xl p-4 transition-colors ${editMode ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50' : 'bg-muted/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                    <CreditCard className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <Label htmlFor="ktpNumber" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    No. KTP
                  </Label>
                </div>
                <AnimatePresence mode="wait">
                  {editMode ? (
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
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Payment Info Card ─── */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/40">
                  <Wallet className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                </div>
                Informasi Pembayaran
              </CardTitle>
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
                      {editMode ? (
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
                      {editMode ? (
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
                      {editMode ? (
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
                      {editMode ? (
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
                      {editMode ? (
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
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Account Security Card ─── */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Shield className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                Keamanan Akun
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

              {/* Email Verification Status */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Verifikasi Email</p>
                    <p className="text-sm font-medium">{profile?.email || '-'}</p>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 gap-1.5"
                >
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Terverifikasi
                </Badge>
              </div>

              <Separator />

              {/* Change Password Placeholder */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Kata Sandi</p>
                    <p className="text-sm font-medium">••••••••</p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground border-dashed"
                >
                  Segera Hadir
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Save Button ─── */}
        <motion.div variants={itemVariants}>
          <AnimatePresence mode="wait">
            {editMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-3"
              >
                <Button
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 border-0 h-11 text-sm font-medium"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <motion.div
                        className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      <span className="ml-2">Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>

                {/* Saved indicator */}
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
                        Tersimpan
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}
