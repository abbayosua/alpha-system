import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/dashboard/admin - Admin dashboard stats
export async function GET() {
  try {
    const auth = await requireAuth('ADMIN')
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    // Run all queries in parallel
    const [
      totalSaksi,
      totalTps,
      totalCheckIns,
      totalVoteInputs,
      totalAssignments,
      totalReports,
      paymentStats,
      recentSaksi,
      recentReports,
      checkInByType,
    ] = await Promise.all([
      // Total saksi count
      db.profile.count({ where: { role: 'SAKSI' } }),

      // Total TPS
      db.tPS.count(),

      // Total check-ins
      db.checkIn.count(),

      // Total vote inputs
      db.voteInput.count(),

      // Total assignments
      db.tPSAssignment.count({ where: { status: 'ACTIVE' } }),

      // Total fraud reports
      db.fraudReport.count(),

      // Payment summary by status
      db.payment.groupBy({
        by: ['status'],
        _count: true,
        _sum: { amount: true },
      }),

      // Recent saksi registrations (last 10)
      db.profile.findMany({
        where: { role: 'SAKSI' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      }),

      // Recent fraud reports (last 10)
      db.fraudReport.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, name: true } },
        },
      }),

      // Check-in breakdown by type
      db.checkIn.groupBy({
        by: ['type'],
        _count: true,
      }),
    ])

    // Calculate rates
    const checkInRate = totalAssignments > 0
      ? Math.round((totalCheckIns / (totalAssignments * 2)) * 100)
      : 0 // *2 because each assignment has morning + final

    const dataInputRate = totalAssignments > 0
      ? Math.round((totalVoteInputs / totalAssignments) * 100)
      : 0

    // Build payment summary
    const paymentSummary: Record<string, { count: number; total: number }> = {}
    for (const ps of paymentStats) {
      paymentSummary[ps.status] = {
        count: ps._count,
        total: ps._sum.amount || 0,
      }
    }

    // Build check-in type breakdown
    const checkInBreakdown: Record<string, number> = {}
    for (const ct of checkInByType) {
      checkInBreakdown[ct.type] = ct._count
    }

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalSaksi,
          totalTps,
          activeAssignments: totalAssignments,
          checkInRate,
          dataInputRate,
          totalCheckIns,
          totalVoteInputs,
          totalReports,
        },
        checkInBreakdown,
        paymentSummary,
        recentSaksi: recentSaksi.map((s) => ({
          ...s,
          createdAt: s.createdAt.toISOString(),
        })),
        recentReports: recentReports.map((r) => ({
          id: r.id,
          title: r.title,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
          user: r.user,
        })),
      },
    })
  } catch (error: any) {
    console.error('Admin dashboard error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
