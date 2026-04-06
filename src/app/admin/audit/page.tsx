'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Shield, ScrollText, ClipboardCheck, PenLine } from 'lucide-react'
import { toast } from 'sonner'
import { DashboardSkeleton } from '@/components/common/LoadingSkeleton'
import { EmptyState } from '@/components/common/EmptyState'

export default function AdminAuditPage() {
  const router = useRouter()
  const [checkIns, setCheckIns] = useState<any[]>([])
  const [votes, setVotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'checkins' | 'votes'>('checkins')

  useEffect(() => {
    Promise.all([
      fetch('/api/check-ins?limit=50').then((r) => (r.ok ? r.json() : Promise.reject(r))),
      fetch('/api/votes?limit=50').then((r) => (r.ok ? r.json() : Promise.reject(r))),
    ])
      .then(([ciRes, vRes]) => {
        if (ciRes.success) setCheckIns(ciRes.data.checkIns)
        if (vRes.success) setVotes(vRes.data.votes)
      })
      .catch(() => {
        setError('Gagal memuat data audit')
        toast.error('Gagal memuat data audit')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton variant="table" />
  if (error) return <EmptyState icon={ScrollText} title={error} description="Coba muat ulang halaman" action={<Button onClick={() => window.location.reload()}>Coba Lagi</Button>} />

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/dashboard')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Audit Log
          </h1>
          <p className="text-sm text-muted-foreground">Log aktivitas check-in dan input suara</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'checkins' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('checkins')}
          className="gap-2"
        >
          <ClipboardCheck className="h-4 w-4" />
          Check-ins
          <Badge variant="secondary" className="rounded-full px-2 bg-background/20 text-foreground">
            {checkIns.length}
          </Badge>
        </Button>
        <Button
          variant={activeTab === 'votes' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('votes')}
          className="gap-2"
        >
          <PenLine className="h-4 w-4" />
          Input Suara
          <Badge variant="secondary" className="rounded-full px-2 bg-background/20 text-foreground">
            {votes.length}
          </Badge>
        </Button>
      </div>

      {activeTab === 'checkins' && (
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">Log Check-in</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Saksi</TableHead>
                    <TableHead>TPS</TableHead>
                    <TableHead>GPS</TableHead>
                    <TableHead>Jarak</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkIns.length > 0 ? checkIns.map((c) => (
                    <TableRow key={c.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm">
                        {new Date(c.timestamp).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={c.type === 'MORNING' ? 'bg-emerald-100 text-emerald-700 gap-1.5' : 'bg-amber-100 text-amber-700 gap-1.5'}
                        >
                          <span className={`inline-flex h-1.5 w-1.5 rounded-full ${c.type === 'MORNING' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {c.type === 'MORNING' ? 'Pagi' : 'Akhir'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{c.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{c.user?.email}</p>
                      </TableCell>
                      <TableCell className="text-sm">{c.tps?.code} - {c.tps?.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={c.gpsVerified ? 'bg-emerald-100 text-emerald-700 gap-1.5' : 'bg-rose-100 text-rose-700 gap-1.5'}>
                          <span className={`inline-flex h-1.5 w-1.5 rounded-full ${c.gpsVerified ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {c.gpsVerified ? 'Valid' : 'Invalid'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{c.distance ? `${Math.round(c.distance)}m` : '-'}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <EmptyState icon={ClipboardCheck} title="Belum Ada Data Check-in" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'votes' && (
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/50">
            <CardTitle className="text-lg">Log Input Suara</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Saksi</TableHead>
                    <TableHead>TPS</TableHead>
                    <TableHead>Kandidat 1</TableHead>
                    <TableHead>Kandidat 2</TableHead>
                    <TableHead>Kandidat 3</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>C1</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {votes.length > 0 ? votes.map((v) => (
                    <TableRow key={v.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm">
                        {new Date(v.submittedAt).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{v.user?.name}</p>
                      </TableCell>
                      <TableCell className="text-sm">{v.tps?.code} - {v.tps?.name}</TableCell>
                      <TableCell className="text-sm text-center">{v.candidate1Votes}</TableCell>
                      <TableCell className="text-sm text-center">{v.candidate2Votes}</TableCell>
                      <TableCell className="text-sm text-center">{v.candidate3Votes}</TableCell>
                      <TableCell className="text-sm font-semibold text-center">{v.totalVotes}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={v.c1Photo ? 'bg-emerald-100 text-emerald-700 gap-1.5' : 'bg-gray-100 text-gray-600 gap-1.5'}>
                          <span className={`inline-flex h-1.5 w-1.5 rounded-full ${v.c1Photo ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {v.c1Photo ? 'Ada' : 'Tidak'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <EmptyState icon={PenLine} title="Belum Ada Data Input Suara" />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
