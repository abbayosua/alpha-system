'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import dynamic from 'next/dynamic'
import {
  ArrowLeft, Users, MapPin, Link, Trash2, Loader2, GitBranch,
  UserPlus, CheckCircle2, Clock, GripVertical, Search,
  ChevronRight, X, UserCheck, AlertTriangle, ArrowUpDown,
  Filter, Map, Percent, TrendingUp
} from 'lucide-react'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

const TPSMapView = dynamic(() => import('@/components/maps/TPSMapView'), { ssr: false })

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

// ─── Status Config ────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string; border: string; bg: string }> = {
  ACTIVE: { label: 'Aktif', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500', border: 'border-l-emerald-400', bg: 'from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-800' },
  COMPLETED: { label: 'Selesai', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300', dot: 'bg-teal-500', border: 'border-l-teal-400', bg: 'from-teal-50/50 to-white dark:from-teal-950/20 dark:to-slate-800' },
  CANCELLED: { label: 'Dibatalkan', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', dot: 'bg-rose-500', border: 'border-l-rose-400', bg: 'from-rose-50/50 to-white dark:from-rose-950/20 dark:to-slate-800' },
}

// ─── UserAvatar Component ─────────────────────────────────────────

function UserAvatar({ name, size = 'sm' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initial = (name || '?')[0]?.toUpperCase() || '?'
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-xl',
  }
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-semibold flex items-center justify-center flex-shrink-0 shadow-sm`}>
      {initial}
    </div>
  )
}

// ─── Assignment Stat Card ─────────────────────────────────────────

function AssignmentStatCard({
  icon,
  label,
  value,
  subValue,
  borderColor,
  bgColor,
  iconBg,
  iconColor,
  index,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  subValue?: string
  borderColor: string
  bgColor: string
  iconBg: string
  iconColor: string
  index: number
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="cursor-default"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card className={`shadow-sm border-l-4 ${borderColor} bg-gradient-to-br ${bgColor} transition-shadow hover:shadow-md`}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-2xl font-bold leading-tight">{value}</p>
            <p className="text-xs text-muted-foreground truncate">{label}</p>
            {subValue && (
              <p className={`text-[11px] mt-0.5 ${iconColor} font-medium`}>{subValue}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// ─── Assignment Status Badge ──────────────────────────────────────

function AssignmentStatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE
  return (
    <Badge variant="secondary" className={`${c.color} gap-1.5`}>
      <span className={`inline-flex h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </Badge>
  )
}

// ─── TPS Code Badge ───────────────────────────────────────────────

function TPSCodeBadge({ code }: { code: string }) {
  const colors = ['from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    'from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800']
  const colorIdx = code.charCodeAt(code.length - 1) % colors.length
  return (
    <Badge variant="outline" className={`${colors[colorIdx]} border text-xs font-medium gap-1`}>
      <MapPin className="h-3 w-3" />
      {code}
    </Badge>
  )
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

      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{saksi.name}</p>
        <p className="text-xs text-muted-foreground truncate">{saksi.email}</p>
      </div>

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
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${gradientFrom} ${gradientTo}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-1.5 px-0.5">
          <span className="text-[10px] text-muted-foreground">0%</span>
          <span className="text-[10px] text-muted-foreground">25%</span>
          <span className="text-[10px] text-muted-foreground">50%</span>
          <span className="text-[10px] text-muted-foreground">75%</span>
          <span className="text-[10px] text-muted-foreground">100%</span>
        </div>
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

// ─── Empty State Illustration ─────────────────────────────────────

function PlottingEmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="py-16 px-6 text-center"
    >
      <div className="relative mx-auto w-24 h-24 mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-200/50 to-teal-200/50 dark:from-emerald-900/30 dark:to-teal-900/30 animate-pulse" />
        <div className="relative inset-0 flex items-center justify-center">
          {isFiltered ? (
            <Search className="h-10 w-10 text-emerald-600" />
          ) : (
            <GitBranch className="h-10 w-10 text-emerald-600" />
          )}
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400/60" />
        <div className="absolute -bottom-2 left-1 w-2 h-2 rounded-full bg-teal-400/60" />
        <div className="absolute top-3 -left-2 w-2.5 h-2.5 rounded-full bg-emerald-400/50" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">
        {isFiltered ? 'Tidak Ada Hasil' : 'Belum Ada Penugasan'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
        {isFiltered
          ? 'Tidak ditemukan penugasan yang sesuai dengan filter saat ini.'
          : 'Seret saksi ke TPS untuk mulai membuat penugasan plotting.'}
      </p>
    </motion.div>
  )
}

// ─── Main Page Component ─────────────────────────────────────────

export default function AdminPlottingPage() {
  const router = useRouter()
  const [unassignedSaksi, setUnassignedSaksi] = useState<any[]>([])
  const [tpsList, setTpsList] = useState<any[]>([])
  const [allAssignments, setAllAssignments] = useState<any[]>([])
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

  // Table filter & sort
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('date_desc')

  // Tab state: 'table' | 'map'
  const [activeTab, setActiveTab] = useState<'table' | 'map'>('table')

  const fetchData = useCallback(() => {
    setLoading(true)
    Promise.all([
      fetch('/api/users?role=SAKSI&limit=100').then((r) => r.json()),
      fetch('/api/tps?limit=100').then((r) => r.json()),
      // Fetch all assignments (no status filter) for stats
      fetch('/api/assignments?limit=100').then((r) => r.json()),
    ])
      .then(([usersRes, tpsRes, assignRes]) => {
        if (usersRes.success && assignRes.success) {
          const allAssigned = assignRes.data.assignments
          const activeIds = new Set(allAssigned.filter((a: any) => a.status === 'ACTIVE').map((a: any) => a.userId))
          setUnassignedSaksi(usersRes.data.users.filter((u: any) => !activeIds.has(u.id)))
          setAllAssignments(allAssigned)
        }
        if (tpsRes.success) setTpsList(tpsRes.data)
      })
      .catch(() => toast.error('Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Compute stats
  const stats = useMemo(() => {
    const total = allAssignments.length
    const active = allAssignments.filter((a) => a.status === 'ACTIVE').length
    const completed = allAssignments.filter((a) => a.status === 'COMPLETED').length
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
    const unassignedCount = unassignedSaksi.length
    const tpsCount = tpsList.length
    const occupiedTps = tpsList.filter((t) => (t.activeAssignmentCount || 0) > 0).length
    return { total, active, completed, completionRate, unassignedCount, tpsCount, occupiedTps }
  }, [allAssignments.length, unassignedSaksi.length, tpsList])

  // Active assignments for DnD panel
  const activeAssignments = useMemo(() => allAssignments.filter((a) => a.status === 'ACTIVE'), [allAssignments])

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

  // Filtered & sorted assignments for table
  const filteredAssignments = useMemo(() => {
    let list = [...allAssignments]
    if (statusFilter !== 'ALL') {
      list = list.filter((a) => a.status === statusFilter)
    }
    // Sort
    switch (sortBy) {
      case 'date_desc':
        list.sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())
        break
      case 'date_asc':
        list.sort((a, b) => new Date(a.assignedAt).getTime() - new Date(b.assignedAt).getTime())
        break
      case 'tps_asc':
        list.sort((a, b) => (a.tps?.code || '').localeCompare(b.tps?.code || ''))
        break
      case 'tps_desc':
        list.sort((a, b) => (b.tps?.code || '').localeCompare(a.tps?.code || ''))
        break
      case 'user_asc':
        list.sort((a, b) => (a.user?.name || '').localeCompare(b.user?.name || ''))
        break
      case 'user_desc':
        list.sort((a, b) => (b.user?.name || '').localeCompare(a.user?.name || ''))
        break
    }
    return list
  }, [allAssignments, statusFilter, sortBy])

  // Map data for TPSMapView
  const mapData = useMemo(() => {
    return tpsList.map((t) => ({
      id: t.id,
      name: t.name,
      code: t.code,
      latitude: t.latitude,
      longitude: t.longitude,
      address: t.address,
      activeAssignmentCount: t.activeAssignmentCount || 0,
      status: (t.activeAssignmentCount && t.activeAssignmentCount > 0) ? 'active' as const : 'inactive' as const,
    }))
  }, [tpsList])

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

      const overId = String(over.id)
      if (overId.startsWith('tps-')) {
        const tpsId = overId.replace('tps-', '')
        const saksiData = active.data.current?.saksi
        if (saksiData) {
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
        {/* ═══════════════════════════════════════════════════════════
            SECTION 1: Gradient Title Area
        ═══════════════════════════════════════════════════════════ */}
        <motion.div
          className="relative rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-transparent dark:from-slate-800 dark:via-emerald-950/20 dark:to-transparent border border-emerald-100/50 dark:border-emerald-800/50 px-6 py-5 overflow-hidden"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Decorative blurred circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-emerald-100/30 dark:bg-emerald-900/20 blur-sm" />
          <div className="absolute bottom-0 left-1/3 w-24 h-24 rounded-full bg-teal-100/20 dark:bg-teal-900/20 blur-sm" />
          <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-amber-100/10 dark:bg-amber-900/10 blur-sm" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="-ml-2 flex-shrink-0" onClick={() => router.push('/admin/dashboard')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm flex-shrink-0">
                  <GitBranch className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">Plotting Saksi</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">Assign saksi ke TPS dan kelola penugasan</p>
                </div>
              </div>
            </div>
            {/* Inline summary stats */}
            <div className="flex items-center gap-3 ml-11 sm:ml-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 dark:bg-slate-700/60 border border-emerald-100 dark:border-emerald-800/50 text-sm">
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">{stats.total}</span>
                <span className="text-muted-foreground text-xs">Total</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 dark:bg-slate-700/60 border border-emerald-100 dark:border-emerald-800/50 text-sm">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-emerald-700 dark:text-emerald-300">{stats.active}</span>
                <span className="text-muted-foreground text-xs">Aktif</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/60 dark:bg-slate-700/60 border border-emerald-100 dark:border-emerald-800/50 text-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />
                <span className="font-semibold text-teal-700 dark:text-teal-300">{stats.completed}</span>
                <span className="text-muted-foreground text-xs">Selesai</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 2: Assignment Stats Cards (3 cards)
        ═══════════════════════════════════════════════════════════ */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.1 }}
        >
          <AssignmentStatCard
            icon={<Users className="h-5 w-5 text-emerald-600" />}
            label="Total Penugasan"
            value={stats.total}
            subValue={`${stats.unassignedCount} saksi belum ditugaskan`}
            borderColor="border-l-emerald-500"
            bgColor="from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-800"
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            index={0}
          />
          <AssignmentStatCard
            icon={<MapPin className="h-5 w-5 text-emerald-600" />}
            label="Penugasan Aktif"
            value={stats.active}
            subValue={`${stats.occupiedTps} dari ${stats.tpsCount} TPS terisi`}
            borderColor="border-l-emerald-500"
            bgColor="from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-800"
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
            index={1}
          />
          <AssignmentStatCard
            icon={<Percent className="h-5 w-5 text-teal-600" />}
            label="Tingkat Penyelesaian"
            value={`${stats.completionRate}%`}
            subValue={`${stats.completed} dari ${stats.total} penugasan`}
            borderColor="border-l-teal-500"
            bgColor="from-teal-50/50 to-white dark:from-teal-950/20 dark:to-slate-800"
            iconBg="bg-teal-100"
            iconColor="text-teal-600"
            index={2}
          />
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 3: Coverage Visualization
        ═══════════════════════════════════════════════════════════ */}
        <motion.div variants={itemVariants}>
          <CoverageBar occupied={stats.occupiedTps} total={stats.tpsCount} />
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 4: Two Column Panel: Saksi + TPS
        ═══════════════════════════════════════════════════════════ */}
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

                <div className="max-h-[420px] overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
                  {filteredTps.length > 0 ? (
                    filteredTps.map((t, i) => (
                      <DroppableTpsCard
                        key={t.id}
                        tps={t}
                        index={i}
                        assignments={activeAssignments}
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

        {/* ═══════════════════════════════════════════════════════════
            SECTION 5: Visual Assignment Map
        ═══════════════════════════════════════════════════════════ */}
        {!loading && tpsList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="shadow-sm">
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Map className="h-5 w-5 text-emerald-600" />
                  Peta Sebaran Penugasan
                  <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full px-2">
                    {stats.occupiedTps}/{stats.tpsCount} TPS
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TPSMapView tpsData={mapData} height="350px" />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════
            SECTION 6: All Assignments Table with Filter & Sort
        ═══════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-emerald-600" />
                Daftar Penugasan
                <Badge variant="secondary" className="ml-auto bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full px-2">
                  {filteredAssignments.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* ── Filter & Sort Controls ── */}
              <div className="flex flex-col sm:flex-row gap-3 p-4 border-b">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filter</span>
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                  <SelectTrigger className="w-[180px] h-9 text-sm">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Status</SelectItem>
                    <SelectItem value="ACTIVE">Aktif</SelectItem>
                    <SelectItem value="COMPLETED">Selesai</SelectItem>
                    <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 sm:ml-auto">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Urutkan</span>
                </div>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
                  <SelectTrigger className="w-[180px] h-9 text-sm">
                    <SelectValue placeholder="Terbaru" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">Terbaru</SelectItem>
                    <SelectItem value="date_asc">Terlama</SelectItem>
                    <SelectItem value="tps_asc">TPS A-Z</SelectItem>
                    <SelectItem value="tps_desc">TPS Z-A</SelectItem>
                    <SelectItem value="user_asc">Saksi A-Z</SelectItem>
                    <SelectItem value="user_desc">Saksi Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="pl-5">Saksi</TableHead>
                      <TableHead>TPS</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right pr-5">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.length > 0 ? filteredAssignments.map((a, i) => {
                      const config = STATUS_CONFIG[a.status] || STATUS_CONFIG.ACTIVE
                      return (
                        <motion.tr
                          key={a.id}
                          className={`hover:bg-muted/50 border-b transition-colors border-l-4 ${config.border}`}
                          variants={rowVariants}
                          initial="hidden"
                          animate="show"
                          transition={{ delay: i * 0.04 }}
                          whileHover={{ backgroundColor: 'rgba(241, 245, 249, 0.8)' }}
                        >
                          <TableCell className="pl-5">
                            <div className="flex items-center gap-3">
                              <UserAvatar name={a.user?.name || '?'} />
                              <div>
                                <p className="font-medium">{a.user?.name}</p>
                                <p className="text-xs text-muted-foreground">{a.user?.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <TPSCodeBadge code={a.tps?.code || '?'} />
                            <p className="text-xs text-muted-foreground mt-0.5">{a.tps?.name}</p>
                          </TableCell>
                          <TableCell>
                            <AssignmentStatusBadge status={a.status} />
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
                      )
                    }) : (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <PlottingEmptyState isFiltered={statusFilter !== 'ALL'} />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════
            SECTION 7: Enhanced Assign Dialog
        ═══════════════════════════════════════════════════════════ */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <UserPlus className="h-4 w-4 text-white" />
                </div>
                Assign Saksi ke TPS
              </DialogTitle>
            </DialogHeader>
            {selectedSaksi && (
              <div className="space-y-5">
                {/* Selected Saksi Info */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30">
                  <UserAvatar name={selectedSaksi.name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{selectedSaksi.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedSaksi.email}</p>
                    {selectedSaksi.phone && (
                      <p className="text-xs text-muted-foreground mt-0.5">{selectedSaksi.phone}</p>
                    )}
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 shrink-0">
                    Saksi
                  </Badge>
                </div>

                <Separator className="bg-gradient-to-r from-transparent via-amber-200 to-transparent" />

                {/* TPS Select with visual indicators */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <Label className="text-sm font-semibold">Pilih TPS Tujuan</Label>
                  </div>
                  <Select value={selectedTps} onValueChange={(val) => setSelectedTps(val)}>
                    <SelectTrigger className="w-full h-11">
                      <SelectValue placeholder="-- Pilih TPS --" />
                    </SelectTrigger>
                    <SelectContent>
                      {tpsList.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${(t.activeAssignmentCount || 0) > 0 ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                            <span className="font-medium">{t.code}</span>
                            <span className="text-muted-foreground">— {t.name}</span>
                            <span className="text-xs text-muted-foreground ml-auto">({t.activeAssignmentCount || 0} saksi)</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!selectedTps && (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Pilih TPS tujuan untuk melanjutkan
                    </p>
                  )}
                </div>

                {/* TPS Info Card */}
                <AnimatePresence>
                  {selectedTpsData && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
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
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-2 text-xs bg-white/60 dark:bg-slate-700/40 rounded-lg px-3 py-2">
                              <Users className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-muted-foreground">Saksi saat ini:</span>
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 text-xs px-1.5 py-0">
                                {selectedTpsData.activeAssignmentCount || 0} orang
                              </Badge>
                            </div>
                            {(selectedTpsData.latitude != null && selectedTpsData.longitude != null) && (
                              <div className="flex items-center gap-2 text-xs bg-white/60 dark:bg-slate-700/40 rounded-lg px-3 py-2">
                                <MapPin className="h-3.5 w-3.5 text-teal-600" />
                                <span className="text-muted-foreground">Koordinat:</span>
                                <span className="font-mono font-medium text-teal-700 dark:text-teal-300">
                                  {Number(selectedTpsData.latitude).toFixed(4)}
                                </span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Gradient Submit Button */}
                <Button
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/30 transition-all h-11"
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

        {/* ═══════════════════════════════════════════════════════════
            SECTION 8: Delete Assignment Confirmation
        ═══════════════════════════════════════════════════════════ */}
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
