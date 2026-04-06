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
    const days = parseInt(searchParams.get('days') || '30', 10)

    const since = new Date()
    since.setDate(since.getDate() - days)
    since.setHours(0, 0, 0, 0)

    // Run all queries in parallel
    const [
      // 1. Saksi Registration Trend - daily counts
      registrationTrend,
      // 2. Check-in Rate Trend - daily check-ins
      checkInTrend,
      // 3. Vote Distribution - per-candidate totals
      voteDistribution,
      // 4. Payment Status Distribution
      paymentStatusDist,
      // 5. Report Category Distribution
      reportCategoryDist,
      // 6. TPS Coverage - check-in rate per TPS
      tpsCoverageData,
      // 7. Summary stats
      totalSaksi,
      totalPayments,
      totalVotes,
      totalDisbursed,
      totalReports,
      checkInByType,
    ] = await Promise.all([
      // 1. Registration Trend
      db.profile.groupBy({
        by: ['createdAt'],
        where: {
          role: 'SAKSI',
          createdAt: { gte: since },
        },
        _count: true,
        orderBy: { createdAt: 'asc' },
      }),

      // 2. Check-in Trend (grouped by date + type)
      db.checkIn.groupBy({
        by: ['timestamp', 'type'],
        where: { timestamp: { gte: since } },
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

      // 6. TPS Coverage - all TPS with their assignment and check-in counts
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
      db.fraudReport.count(),
      db.checkIn.groupBy({ by: ['type'], _count: true }),
    ])

    // ── Process Registration Trend ──
    const registrationByDate: Record<string, number> = {}
    for (const r of registrationTrend) {
      const dateKey = new Date(r.createdAt).toISOString().split('T')[0]
      registrationByDate[dateKey] = (registrationByDate[dateKey] || 0) + r._count
    }

    // Fill missing dates
    const registrationTrendData: Array<{ date: string; count: number }> = []
    const today = new Date()
    for (let i = days - 1; i >= 0; i--) {
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

    const checkInTrendData: Array<{ date: string; pagi: number; akhir: number; total: number }> = []
    for (let i = Math.min(days, 14) - 1; i >= 0; i--) {
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

    // Top performing areas (TPS with highest check-in rates)
    const topAreas = [...tpsCoverage]
      .filter((tps) => tps.assignments > 0)
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 5)

    // ── Summary stats ──
    const checkInBreakdown: Record<string, number> = {}
    for (const ct of checkInByType) {
      checkInBreakdown[ct.type] = ct._count
    }
    const totalCheckIns = checkInBreakdown['MORNING'] || 0 + checkInBreakdown['FINAL'] || 0

    // Average check-in rate across TPS
    const tpsWithAssignments = tpsCoverage.filter((t) => t.assignments > 0)
    const avgCheckInRate = tpsWithAssignments.length > 0
      ? Math.round(tpsWithAssignments.reduce((sum, t) => sum + t.rate, 0) / tpsWithAssignments.length)
      : 0

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
