'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter,
  type DragEndEvent,
  type UniqueIdentifier,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import type { Transform } from '@dnd-kit/utilities'
import { CSS } from '@dnd-kit/utilities'
import {
  ArrowLeft, Users, MapPin, Link, Trash2, Loader2, GitBranch,
  UserPlus, CheckCircle2, Clock, GripVertical, Search,
  ChevronRight, X, UserCheck, AlertTriangle
} from 'lucide-react'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

// ─── Animation Variants ───────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

// ─── Draggable Saksi Card ─────────────────────────────────────────

interface DraggableSaksiProps {
  saksi: { id: string; name: string; email: string; phone?: string }
  index: number
  onClick: () => void
}

function DraggableSaksiCard({ saksi, index, onClick }: DraggableSaksiProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `saksi-${saksi.id}`,
    data: { type: 'saksi', saksi },
  })

  const style: React.CSSProperties = transform
    ? { transform: CSS.Translate.toString(transform), zIndex: 50 }
    : undefined

  const initials = saksi.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 p-3 rounded-lg text-sm cursor-default
        transition-all duration-200 group
        ${isDragging
          ? 'bg-emerald-50 dark:bg-emerald-950/40 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30 ring-2 ring-emerald-400/50 scale-[1.03] opacity-90'
          : 'bg-muted/70 hover:bg-muted border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800'
        }
      `}
      variants={rowVariants}
      initial="hidden"
      animate="show"
      transition={{ delay: index * 0.04 }}
      {...attributes}
    >
      {/* Drag handle */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="p-0.5 rounded cursor-grab active:cursor-grabbing text-muted-foreground hover:text-emerald-600 transition-colors shrink-0"
              {...listeners}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">
            Seret ke TPS untuk assign
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
        {initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{saksi.name}</p>
        <p className="text-xs text-muted-foreground truncate">{saksi.email}</p>
      </div>

      {/* Assign button */}
      <Button
        size="sm"
        variant="ghost"
        className="shrink-0 h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
      >
        <Link className="h-3 w-3 mr-1" />
        Assign
      </Button>
    </motion.div>
  )
}

// ─── Droppable TPS Card ───────────────────────────────────────────

interface DroppableTpsProps {
  tps: {
    id: string
    code: string
    name: string
    address?: string
    latitude?: number
    longitude?: number
    activeAssignmentCount?: number
  }
  index: number
  assignments: any[]
  isAnyDragging: boolean
}

function DroppableTpsCard({ tps, index, assignments, isAnyDragging }: DroppableTpsProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `tps-${tps.id}`,
    data: { type: 'tps', tpsId: tps.id },
  })

  const tpsAssignments = assignments.filter((a) => a.tpsId === tps.id)
  const [expanded, setExpanded] = useState(false)

  return (
    <motion.div
      ref={setNodeRef}
      className={`
        p-3 rounded-lg text-sm cursor-pointer transition-all duration-200
        ${isOver
          ? 'bg-emerald-100 dark:bg-emerald-950/50 border-2 border-dashed border-emerald-400 shadow-lg shadow-emerald-200/40 scale-[1.02]'
          : isAnyDragging
            ? 'bg-muted/70 border-2 border-dashed border-transparent hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
            : 'bg-muted/70 border border-transparent hover:bg-muted'
        }
      `}
      variants={rowVariants}
      initial="hidden"
      animate="show"
      transition={{ delay: index * 0.04 }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-medium">{tps.code} — {tps.name}</p>
          <p className="text-xs text-muted-foreground truncate">{tps.address}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {/* Mini avatar stack */}
          {tpsAssignments.length > 0 && (
            <div className="flex -space-x-1.5">
              {tpsAssignments.slice(0, 3).map((a) => {
                const name = a.user?.name || '?'
                const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                return (
                  <div
                    key={a.id}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-slate-800"
                  >
                    {initials}
                  </div>
                )
              })}
              {tpsAssignments.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold ring-2 ring-white dark:ring-slate-800">
                  +{tpsAssignments.length - 3}
                </div>
              )}
            </div>
          )}

          <Badge
            variant="secondary"
            className={`
              gap-1.5 px-1.5 py-0 text-xs font-medium
              ${tps.activeAssignmentCount && tps.activeAssignmentCount > 0
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }
            `}
          >
            <span className={`inline-flex h-1.5 w-1.5 rounded-full ${tps.activeAssignmentCount && tps.activeAssignmentCount > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {tps.activeAssignmentCount || 0} saksi
          </Badge>

          <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </div>

      {/* Expand to show assigned saksi */}
      <AnimatePresence>
        {expanded && tpsAssignments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <Separator className="my-2" />
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Saksi yang ditugaskan:</p>
              {tpsAssignments.map((a) => {
                const name = a.user?.name || '?'
                const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                return (
                  <div key={a.id} className="flex items-center gap-2 py-1 px-2 rounded-md bg-emerald-50/60 dark:bg-emerald-950/20">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{name}</p>
                    </div>
                    <UserCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
        {expanded && tpsAssignments.length === 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <Separator className="my-2" />
            <p className="text-xs text-muted-foreground text-center py-1">Belum ada saksi ditugaskan</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop zone overlay hint */}
      {isOver && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center justify-center gap-1.5 mt-2 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-300 dark:border-emerald-700"
        >
          <UserPlus className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-xs font-medium text-emerald-600">Lepas untuk assign ke sini</span>
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Drag Overlay Content ─────────────────────────────────────────

function DragOverlayContent({ saksi }: { saksi: { name: string; email: string } | null }) {
  if (!saksi) return null
  const initials = saksi.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-xl shadow-2xl shadow-emerald-300/30 dark:shadow-emerald-900/30 ring-2 ring-emerald-400/60 border border-emerald-200 dark:border-emerald-800">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-sm font-bold shadow-md">
        {initials}
      </div>
      <div>
        <p className="font-semibold text-sm">{saksi.name}</p>
        <p className="text-xs text-muted-foreground">{saksi.email}</p>
      </div>
      <UserPlus className="h-4 w-4 text-emerald-500 ml-1" />
    </div>
  )
}

// ─── Coverage Visualization ───────────────────────────────────────

function CoverageBar({
  occupied,
  total,
}: {
  occupied: number
  total: number
}) {
  const pct = total > 0 ? Math.round((occupied / total) * 100) : 0
  const color = pct >= 70 ? 'emerald' : pct >= 40 ? 'amber' : 'rose'
  const gradientFrom = color === 'emerald'
    ? 'from-emerald-500'
    : color === 'amber'
      ? 'from-amber-500'
      : 'from-rose-500'
  const gradientTo = color === 'emerald'
    ? 'to-teal-400'
    : color === 'amber'
      ? 'to-orange-400'
      : 'to-rose-400'
  const textColor = color === 'emerald'
    ? 'text-emerald-600'
    : color === 'amber'
      ? 'text-amber-600'
      : 'text-rose-600'
  const bgColor = color === 'emerald'
    ? 'bg-emerald-500/10'
    : color === 'amber'
      ? 'bg-amber-500/10'
      : 'bg-rose-500/10'
  const dotColor = color === 'emerald'
    ? 'bg-emerald-500'
    : color === 'amber'
      ? 'bg-amber-500'
      : 'bg-rose-500'

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${bgColor}`}>
              <MapPin className={`h-4 w-4 ${textColor}`} />
            </div>
            <div>
              <p className="text-sm font-semibold">TPS Coverage</p>
              <p className="text-xs text-muted-foreground">
                {occupied} dari {total} TPS terisi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex h-2 w-2 rounded-full ${dotColor}`} />
            <span className={`text-2xl font-bold ${textColor}`}>{pct}%</span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />
        </div>
        {/* Milestone markers */}
        <div className="flex justify-between mt-1.5 px-0.5">
          <span className="text-[10px] text-muted-foreground">0%</span>
          <span className="text-[10px] text-muted-foreground">25%</span>
          <span className="text-[10px] text-muted-foreground">50%</span>
          <span className="text-[10px] text-muted-foreground">75%</span>
          <span className="text-[10px] text-muted-foreground">100%</span>
        </div>
        {/* Status label */}
        <div className="mt-3 flex items-center gap-2">
          {pct >= 70 ? (
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 gap-1 text-xs">
              <CheckCircle2 className="h-3 w-3" />
              Coverage Baik
            </Badge>
          ) : pct >= 40 ? (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 gap-1 text-xs">
              <AlertTriangle className="h-3 w-3" />
              Perlu Ditambah
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 gap-1 text-xs">
              <AlertTriangle className="h-3 w-3" />
              Coverage Rendah
            </Badge>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {total - occupied} TPS belum terisi
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Main Page Component ─────────────────────────────────────────

export default function AdminPlottingPage() {
  const router = useRouter()
  const [unassignedSaksi, setUnassignedSaksi] = useState<any[]>([])
  const [tpsList, setTpsList] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedSaksi, setSelectedSaksi] = useState<any>(null)
  const [selectedTps, setSelectedTps] = useState<string>('')
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // DnD state
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [activeSaksi, setActiveSaksi] = useState<any>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  // Search/filter
  const [saksiSearch, setSaksiSearch] = useState('')
  const [tpsSearch, setTpsSearch] = useState('')

  const fetchData = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/users?role=SAKSI&limit=100').then((r) => r.json()),
      fetch('/api/tps?limit=100').then((r) => r.json()),
      fetch('/api/assignments?status=ACTIVE&limit=100').then((r) => r.json()),
    ])
      .then(([usersRes, tpsRes, assignRes]) => {
        if (usersRes.success) {
          const assignedIds = new Set(assignRes.success ? assignRes.data.assignments.map((a: any) => a.userId) : [])
          setUnassignedSaksi(usersRes.data.users.filter((u: any) => !assignedIds.has(u.id)))
        }
        if (tpsRes.success) setTpsList(tpsRes.data)
        if (assignRes.success) setAssignments(assignRes.data.assignments)
      })
      .catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Compute stats
  const stats = useMemo(() => ({
    activeAssignments: assignments.length,
    unassignedCount: unassignedSaksi.length,
    tpsCount: tpsList.length,
    occupiedTps: tpsList.filter((t) => (t.activeAssignmentCount || 0) > 0).length,
  }), [assignments.length, unassignedSaksi.length, tpsList])

  // Find selected TPS data for info card
  const selectedTpsData = tpsList.find((t) => t.id === selectedTps)

  // Filtered lists
  const filteredSaksi = useMemo(() => {
    if (!saksiSearch.trim()) return unassignedSaksi
    const q = saksiSearch.toLowerCase()
    return unassignedSaksi.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q)
    )
  }, [unassignedSaksi, saksiSearch])

  const filteredTps = useMemo(() => {
    if (!tpsSearch.trim()) return tpsList
    const q = tpsSearch.toLowerCase()
    return tpsList.filter(
      (t) =>
        t.code?.toLowerCase().includes(q) ||
        t.name?.toLowerCase().includes(q) ||
        t.address?.toLowerCase().includes(q)
    )
  }, [tpsList, tpsSearch])

  // DnD handlers
  const handleDragStart = useCallback((event: any) => {
    setActiveId(event.active.id)
    const saksiData = event.active.data.current?.saksi
    if (saksiData) {
      setActiveSaksi(saksiData)
    }
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      setActiveId(null)
      setActiveSaksi(null)

      if (!over) return

      // Check if dropped on a TPS
      const overId = String(over.id)
      if (overId.startsWith('tps-')) {
        const tpsId = overId.replace('tps-', '')
        const saksiData = active.data.current?.saksi
        if (saksiData) {
          // Open assign dialog with pre-selected TPS
          setSelectedSaksi(saksiData)
          setSelectedTps(tpsId)
          setShowAssignDialog(true)
        }
      }
    },
    []
  )

  const handleAssign = async () => {
    if (!selectedSaksi || !selectedTps) {
      toast.error('Pilih saksi dan TPS')
      return
    }
    setAssigning(true)
    try {
      const res = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedSaksi.id, tpsId: selectedTps }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`${selectedSaksi.name} berhasil ditugaskan ke TPS`)
        setShowAssignDialog(false)
        setSelectedSaksi(null)
        setSelectedTps('')
        fetchData()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setAssigning(false)
    }
  }

  const handleRemoveAssignment = async () => {
    if (!deleteTarget) return
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/assignments/${deleteTarget.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Penugasan berhasil dihapus')
        setDeleteTarget(null)
        fetchData()
      } else {
        toast.error(data.error)
      }
    } catch {
      toast.error('Gagal menghapus penugasan')
    } finally {
      setDeleteLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) return <DashboardSkeleton variant="dashboard" />

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* ─── Page Title Area ─── */}
        <motion.div
          className="relative rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 dark:from-slate-800 dark:to-slate-900 p-6 sm:p-8 overflow-hidden"
          variants={itemVariants}
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-emerald-100/60" />
          <div className="absolute bottom-0 left-1/3 w-20 h-20 rounded-full bg-teal-100/40" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-1">
              <Button variant="ghost" size="icon" className="bg-white/60 dark:bg-slate-700/60 hover:bg-white/80 dark:hover:bg-slate-600/80 -ml-2" onClick={() => router.push('/admin/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold">Plotting Saksi</h1>
            </div>
            <p className="text-sm text-muted-foreground ml-11">Assign saksi ke TPS dan kelola penugasan aktif</p>
          </div>
        </motion.div>

        {/* ─── Stats Summary ─── */}
        <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-3" variants={itemVariants}>
          <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                <GitBranch className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeAssignments}</p>
                <p className="text-xs text-muted-foreground">Penugasan Aktif</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50/50 to-white dark:from-amber-950/20 dark:to-slate-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.unassignedCount}</p>
                <p className="text-xs text-muted-foreground">Belum Ditugaskan</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-l-4 border-l-teal-500 bg-gradient-to-br from-teal-50/50 to-white dark:from-teal-950/20 dark:to-slate-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-100 text-teal-600">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.tpsCount}</p>
                <p className="text-xs text-muted-foreground">Total TPS</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-800">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.occupiedTps}</p>
                <p className="text-xs text-muted-foreground">TPS Terisi</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Coverage Visualization ─── */}
        <motion.div variants={itemVariants}>
          <CoverageBar occupied={stats.occupiedTps} total={stats.tpsCount} />
        </motion.div>

        {/* ─── Two Column Panel: Saksi + TPS ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* ── Unassigned Saksi Panel ── */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm border-l-4 border-l-amber-500">
              <CardHeader className="bg-muted/50 pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-amber-600" />
                  <span>Saksi Belum Ditugaskan</span>
                  <Badge
                    variant="secondary"
                    className={`ml-auto rounded-full px-2.5 gap-1.5 ${
                      stats.unassignedCount > 0
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    }`}
                  >
                    {stats.unassignedCount > 0 && (
                      <motion.span
                        className="inline-flex h-2 w-2 rounded-full bg-amber-500"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                    {stats.unassignedCount}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama atau email saksi..."
                    className="pl-9 h-9 text-sm"
                    value={saksiSearch}
                    onChange={(e) => setSaksiSearch(e.target.value)}
                  />
                  {saksiSearch && (
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setSaksiSearch('')}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Saksi List */}
                <div className="max-h-[420px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {filteredSaksi.length > 0 ? (
                    filteredSaksi.map((s, i) => (
                      <DraggableSaksiCard
                        key={s.id}
                        saksi={s}
                        index={i}
                        onClick={() => {
                          setSelectedSaksi(s)
                          setSelectedTps('')
                          setShowAssignDialog(true)
                        }}
                      />
                    ))
                  ) : saksiSearch ? (
                    <div className="text-center py-6">
                      <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Tidak ada hasil untuk &quot;{saksiSearch}&quot;</p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Semua saksi sudah ditugaskan 🎉</p>
                    </div>
                  )}
                </div>

                {/* Drag hint */}
                {unassignedSaksi.length > 0 && (
                  <motion.p
                    className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <GripVertical className="h-3 w-3" />
                    Seret saksi ke TPS atau klik tombol Assign
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* ── TPS Panel ── */}
          <motion.div variants={itemVariants}>
            <Card className="shadow-sm border-l-4 border-l-emerald-500">
              <CardHeader className="bg-muted/50 pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  <span>Daftar TPS</span>
                  <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full px-2">
                    {tpsList.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari kode, nama, atau alamat TPS..."
                    className="pl-9 h-9 text-sm"
                    value={tpsSearch}
                    onChange={(e) => setTpsSearch(e.target.value)}
                  />
                  {tpsSearch && (
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setTpsSearch('')}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* TPS List */}
                <div className="max-h-[420px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {filteredTps.length > 0 ? (
                    filteredTps.map((t, i) => (
                      <DroppableTpsCard
                        key={t.id}
                        tps={t}
                        index={i}
                        assignments={assignments}
                        isAnyDragging={!!activeId}
                      />
                    ))
                  ) : tpsSearch ? (
                    <div className="text-center py-6">
                      <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Tidak ada TPS ditemukan</p>
                    </div>
                  ) : (
                    <EmptyState icon={MapPin} title="Belum Ada TPS" description="Tambahkan TPS terlebih dahulu" />
                  )}
                </div>

                {/* Drop hint */}
                {activeId && (
                  <motion.p
                    className="text-xs text-emerald-600 dark:text-emerald-400 text-center flex items-center justify-center gap-1.5"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <motion.span
                      className="inline-flex h-2 w-2 rounded-full bg-emerald-500"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                    Lepaskan saksi pada TPS yang diinginkan
                  </motion.p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* ─── Active Assignments Table ─── */}
        <motion.div variants={itemVariants}>
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-emerald-600" />
                Penugasan Aktif
                <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full px-2">
                  {assignments.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="pl-5">Saksi</TableHead>
                      <TableHead>TPS</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right pr-5">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.length > 0 ? assignments.map((a, i) => (
                      <motion.tr
                        key={a.id}
                        className="hover:bg-muted/50 border-b transition-colors border-l-4 border-l-emerald-400"
                        variants={rowVariants}
                        initial="hidden"
                        animate="show"
                        transition={{ delay: i * 0.04 }}
                        whileHover={{ backgroundColor: 'rgba(241, 245, 249, 0.8)' }}
                      >
                        <TableCell className="pl-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                              {getInitials(a.user?.name || '?')}
                            </div>
                            <div>
                              <p className="font-medium">{a.user?.name}</p>
                              <p className="text-xs text-muted-foreground">{a.user?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-xs font-medium gap-1">
                            <MapPin className="h-3 w-3" />
                            {a.tps?.code}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-0.5">{a.tps?.name}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(a.assignedAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            onClick={() => setDeleteTarget(a)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </motion.tr>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <EmptyState icon={GitBranch} title="Belum Ada Penugasan" description="Seret saksi ke TPS untuk mulai plotting" />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── Assign Dialog ─── */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-600" />
                Assign Saksi ke TPS
              </DialogTitle>
            </DialogHeader>
            {selectedSaksi && (
              <div className="space-y-4">
                {/* Selected Saksi Info with Avatar */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-md shadow-amber-200/50">
                    {getInitials(selectedSaksi.name)}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedSaksi.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedSaksi.email}</p>
                  </div>
                </div>

                {/* TPS Select */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pilih TPS</label>
                  <Select value={selectedTps} onValueChange={(val) => setSelectedTps(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Pilih TPS --" />
                    </SelectTrigger>
                    <SelectContent>
                      {tpsList.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.code} - {t.name} ({t.activeAssignmentCount || 0} saksi)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* TPS Info Card */}
                {selectedTpsData && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 overflow-hidden">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600 mt-0.5">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">
                              {selectedTpsData.code} — {selectedTpsData.name}
                            </p>
                            {selectedTpsData.address && (
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                {selectedTpsData.address}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Users className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-muted-foreground">Saksi saat ini:</span>
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs px-1.5 py-0">
                              {selectedTpsData.activeAssignmentCount || 0} orang
                            </Badge>
                          </div>
                        </div>
                        {/* Map coordinates preview */}
                        {(selectedTpsData.latitude != null && selectedTpsData.longitude != null) && (
                          <div className="h-16 rounded-md bg-gradient-to-br from-emerald-100/50 to-teal-100/50 border border-dashed border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                              {Number(selectedTpsData.latitude).toFixed(4)}, {Number(selectedTpsData.longitude).toFixed(4)}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Gradient save button */}
                <Button
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30 transition-all"
                  onClick={handleAssign}
                  disabled={assigning || !selectedTps}
                >
                  {assigning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Assign Sekarang
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* ─── Delete Assignment Confirmation ─── */}
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
          title="Hapus Penugasan"
          description={`Apakah Anda yakin ingin menghapus penugasan ${deleteTarget?.user?.name} dari ${deleteTarget?.tps?.name}?`}
          confirmLabel="Ya, Hapus"
          onConfirm={handleRemoveAssignment}
          loading={deleteLoading}
        />
      </motion.div>

      {/* ─── Drag Overlay ─── */}
      <DragOverlay dropAnimation={null}>
        {activeSaksi ? (
          <DragOverlayContent saksi={activeSaksi} />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
