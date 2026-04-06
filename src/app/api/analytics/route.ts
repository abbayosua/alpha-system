import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/analytics - Comprehensive analytics data
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth('ADMIN')
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const rawDays = searchParams.get('days') || '30'
    const days = parseInt(rawDays, 10)

    // days=0 means "Semua" (no date filter for most data, but still limit charts)
    const chartDays = days === 0 ? 90 : days
    const useDateFilter = days > 0

    const since = new Date()
    since.setDate(since.getDate() - chartDays)
    since.setHours(0, 0, 0, 0)

    // Build date filter for queries
    const dateFilter = useDateFilter ? { gte: since } : undefined

    // Run all queries in parallel
    const [
      registrationTrend,
      checkInTrend,
      voteDistribution,
      paymentStatusDist,
      reportCategoryDist,
      tpsCoverageData,
      totalSaksi,
      totalPayments,
      totalVotes,
      totalDisbursed,
      totalPaymentSum,
      totalReports,
      checkInByType,
      allCheckIns,
      saksiRankingsData,
      totalVoteInputs,
    ] = await Promise.all([
      // 1. Registration Trend
      db.profile.groupBy({
        by: ['createdAt'],
        where: {
          role: 'SAKSI',
          createdAt: dateFilter,
        },
        _count: true,
        orderBy: { createdAt: 'asc' },
      }),

      // 2. Check-in Trend (grouped by date + type)
      db.checkIn.groupBy({
        by: ['timestamp', 'type'],
        where: dateFilter ? { timestamp: dateFilter } : undefined,
        _count: true,
        orderBy: { timestamp: 'asc' },
      }),

      // 3. Vote Distribution (aggregate per-candidate)
      db.voteInput.aggregate({
        _sum: {
          candidate1Votes: true,
          candidate2Votes: true,
          candidate3Votes: true,
          totalValidVotes: true,
          totalInvalidVotes: true,
          totalVotes: true,
        },
      }),

      // 4. Payment Status Distribution
      db.payment.groupBy({
        by: ['status'],
        _count: true,
        _sum: { amount: true },
      }),

      // 5. Report Category Distribution
      db.fraudReport.groupBy({
        by: ['category'],
        _count: true,
      }),

      // 6. TPS Coverage
      db.tPS.findMany({
        select: {
          id: true,
          code: true,
          name: true,
          totalDpt: true,
          _count: {
            select: {
              assignments: { where: { status: 'ACTIVE' } },
              checkIns: true,
            },
          },
        },
        orderBy: { code: 'asc' },
      }),

      // 7. Summary stats
      db.profile.count({ where: { role: 'SAKSI' } }),
      db.payment.count(),
      db.voteInput.count(),
      db.payment.aggregate({ _sum: { amount: true }, where: { status: 'DISBURSED' } }),
      db.payment.aggregate({ _sum: { amount: true } }),
      db.fraudReport.count(),
      db.checkIn.groupBy({ by: ['type'], _count: true }),

      // 8. All check-ins for activity heatmap (last 90 days max)
      db.checkIn.findMany({
        select: { timestamp: true },
        where: { timestamp: { gte: since } },
        orderBy: { timestamp: 'asc' },
      }),

      // 9. Saksi rankings
      db.profile.findMany({
        where: { role: 'SAKSI' },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
          _count: {
            select: {
              assignments: { where: { status: 'ACTIVE' } },
              checkIns: true,
              voteInputs: true,
              fraudReports: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),

      // 10. Total vote inputs for data completeness
      db.voteInput.count(),
    ])

    // ── Process Registration Trend ──
    const registrationByDate: Record<string, number> = {}
    for (const r of registrationTrend) {
      const dateKey = new Date(r.createdAt).toISOString().split('T')[0]
      registrationByDate[dateKey] = (registrationByDate[dateKey] || 0) + r._count
    }

    const registrationTrendData: Array<{ date: string; count: number }> = []
    const today = new Date()
    const trendDays = days === 0 ? 90 : days
    for (let i = trendDays - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      registrationTrendData.push({
        date: key,
        count: registrationByDate[key] || 0,
      })
    }

    // ── Process Check-in Trend ──
    const checkInByDate: Record<string, { MORNING: number; FINAL: number }> = {}
    for (const c of checkInTrend) {
      const dateKey = new Date(c.timestamp).toISOString().split('T')[0]
      if (!checkInByDate[dateKey]) checkInByDate[dateKey] = { MORNING: 0, FINAL: 0 }
      checkInByDate[dateKey][c.type] = (checkInByDate[dateKey][c.type] || 0) + c._count
    }

    const checkInTrendDays = Math.min(trendDays, 14)
    const checkInTrendData: Array<{ date: string; pagi: number; akhir: number; total: number }> = []
    for (let i = checkInTrendDays - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      const entry = checkInByDate[key] || { MORNING: 0, FINAL: 0 }
      checkInTrendData.push({
        date: key,
        pagi: entry.MORNING,
        akhir: entry.FINAL,
        total: entry.MORNING + entry.FINAL,
      })
    }

    // ── Process Vote Distribution ──
    const voteData = [
      { name: 'Kandidat 1', votes: voteDistribution._sum.candidate1Votes || 0, color: '#10b981' },
      { name: 'Kandidat 2', votes: voteDistribution._sum.candidate2Votes || 0, color: '#f59e0b' },
      { name: 'Kandidat 3', votes: voteDistribution._sum.candidate3Votes || 0, color: '#14b8a6' },
    ]
    const totalVotesAll = voteData.reduce((sum, v) => sum + v.votes, 0)

    // ── Process Payment Status ──
    const paymentStatusData = paymentStatusDist.map((p) => ({
      status: p.status,
      count: p._count,
      total: p._sum.amount || 0,
    }))

    const paymentStatusColors: Record<string, string> = {
      PENDING: '#f59e0b',
      READY_FOR_PAYMENT: '#14b8a6',
      APPROVED: '#10b981',
      DISBURSED: '#065f46',
      FAILED: '#f43f5e',
      CANCELLED: '#9ca3af',
    }

    // ── Process Report Categories ──
    const reportCategoryData = reportCategoryDist.map((r) => ({
      category: r.category || 'LAINNYA',
      count: r._count,
    }))

    const reportCategoryColors: Record<string, string> = {
      KECURANGAN_SUARA: '#f43f5e',
      PENGAWAS_GANDA: '#f59e0b',
      PELANGGARAN_TPS: '#ef4444',
      INTIMIDASI: '#f97316',
      MONEY_POLITICS: '#dc2626',
      LAINNYA: '#9ca3af',
    }

    // ── Process TPS Coverage ──
    const tpsCoverage = tpsCoverageData.map((tps) => {
      const activeAssignments = tps._count.assignments
      const totalCheckIns = tps._count.checkIns
      const rate = activeAssignments > 0 ? Math.round((totalCheckIns / (activeAssignments * 2)) * 100) : 0
      return {
        id: tps.id,
        code: tps.code,
        name: tps.name,
        totalDpt: tps.totalDpt,
        assignments: activeAssignments,
        checkIns: totalCheckIns,
        rate,
      }
    })

    const topAreas = [...tpsCoverage]
      .filter((tps) => tps.assignments > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5)

    // ── Summary stats ──
    const checkInBreakdown: Record<string, number> = {}
    for (const ct of checkInByType) {
      checkInBreakdown[ct.type] = ct._count
    }
    const totalCheckIns = (checkInBreakdown['MORNING'] || 0) + (checkInBreakdown['FINAL'] || 0)

    const tpsWithAssignments = tpsCoverage.filter((t) => t.assignments > 0)
    const avgCheckInRate = tpsWithAssignments.length > 0
      ? Math.round(tpsWithAssignments.reduce((sum, t) => sum + t.rate, 0) / tpsWithAssignments.length)
      : 0

    // Data completeness: (saksi with vote inputs) / total active assignments
    const totalActiveAssignments = tpsWithAssignments.reduce((sum, t) => sum + t.assignments, 0)
    const dataCompleteness = totalActiveAssignments > 0
      ? Math.round((totalVoteInputs / totalActiveAssignments) * 100)
      : 0

    // ── Activity Heatmap ──
    // Group check-ins by day of week (0=Sun, 1=Mon...6=Sat) and hour
    const heatmapGrid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0))
    for (const ci of allCheckIns) {
      const d = new Date(ci.timestamp)
      const day = d.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
      const hour = d.getHours()
      heatmapGrid[day][hour]++
    }

    // Convert to array format: { day, hour, count }
    const activityHeatmap: Array<{ day: number; hour: number; count: number }> = []
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        if (heatmapGrid[day][hour] > 0) {
          activityHeatmap.push({ day, hour, count: heatmapGrid[day][hour] })
        }
      }
    }

    // ── Saksi Rankings ──
    const saksiRankings = saksiRankingsData
      .map((s) => {
        const assignments = s._count.assignments
        const checkIns = s._count.checkIns
        const voteInputs = s._count.voteInputs
        const reports = s._count.fraudReports
        const expectedCheckIns = assignments * 2 // Pagi + Akhir
        const completionRate = expectedCheckIns > 0
          ? Math.min(Math.round((checkIns / expectedCheckIns) * 100), 100)
          : 0
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          phone: s.phone,
          createdAt: s.createdAt,
          assignments,
          checkIns,
          voteInputs,
          reports,
          completionRate,
        }
      })
      .sort((a, b) => b.completionRate - a.completionRate || b.checkIns - a.checkIns)

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalSaksi,
          avgCheckInRate,
          totalVotes: voteDistribution._sum.totalValidVotes || 0,
          totalDisbursed: totalDisbursed._sum.amount || 0,
          totalCheckIns,
          totalReports,
          totalPayments: totalPaymentSum._sum.amount || 0,
          dataCompleteness,
        },
        registrationTrend: registrationTrendData,
        checkInTrend: checkInTrendData,
        voteDistribution: voteData,
        totalVotesAll,
        paymentStatus: paymentStatusData,
        paymentStatusColors,
        reportCategories: reportCategoryData,
        reportCategoryColors,
        tpsCoverage,
        topAreas,
        activityHeatmap,
        saksiRankings,
      },
    })
  } catch (error: any) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
