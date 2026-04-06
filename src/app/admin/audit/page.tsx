'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, Shield } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminAuditPage() {
  const router = useRouter()
  const [checkIns, setCheckIns] = useState<any[]>([])
  const [votes, setVotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'checkins' | 'votes'>('checkins')

  useEffect(() => {
    Promise.all([
      fetch('/api/check-ins?limit=50').then((r) => r.json()),
      fetch('/api/votes?limit=50').then((r) => r.json()),
    ])
      .then(([ciRes, vRes]) => {
        if (ciRes.success) setCheckIns(ciRes.data.checkIns)
        if (vRes.success) setVotes(vRes.data.votes)
      })
      .catch(() => toast.error('Gagal memuat data audit'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-4 max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="p-4 max-w-6xl mx-auto space-y-6">
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
        <Button variant={activeTab === 'checkins' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('checkins')}>
          Check-ins ({checkIns.length})
        </Button>
        <Button variant={activeTab === 'votes' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('votes')}>
          Input Suara ({votes.length})
        </Button>
      </div>

      {activeTab === 'checkins' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Log Check-in</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
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
                    <TableRow key={c.id}>
                      <TableCell className="text-sm">
                        {new Date(c.timestamp).toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.type === 'MORNING' ? 'default' : 'secondary'}>
                          {c.type === 'MORNING' ? 'Pagi' : 'Akhir'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{c.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{c.user?.email}</p>
                      </TableCell>
                      <TableCell className="text-sm">{c.tps?.code} - {c.tps?.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={c.gpsVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {c.gpsVerified ? '✓ Valid' : '✗ Invalid'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{c.distance ? `${Math.round(c.distance)}m` : '-'}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-6">Belum ada data check-in</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'votes' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Log Input Suara</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
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
                    <TableRow key={v.id}>
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
                      <TableCell className="text-sm font-medium text-center">{v.totalVotes}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={v.c1Photo ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>
                          {v.c1Photo ? '✓' : '✗'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-6">Belum ada data input suara</TableCell>
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
