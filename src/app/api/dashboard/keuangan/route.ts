import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/dashboard/keuangan - Finance dashboard
export async function GET() {
  try {
    const auth = await requireAuth('ADMIN_KEUANGAN')
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Finance access required.' },
        { status: 401 }
      )
    }

    // Run all queries in parallel
    const [
      pendingPayments,
      readyPayments,
      approvedPayments,
      disbursedPayments,
      failedPayments,
      cancelledPayments,
      allPayments,
      paymentByStatus,
      recentDisbursements,
    ] = await Promise.all([
      db.payment.count({ where: { status: 'PENDING' } }),
      db.payment.count({ where: { status: 'READY_FOR_PAYMENT' } }),
      db.payment.count({ where: { status: 'APPROVED' } }),
      db.payment.count({ where: { status: 'DISBURSED' } }),
      db.payment.count({ where: { status: 'FAILED' } }),
      db.payment.count({ where: { status: 'CANCELLED' } }),
      db.payment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      }),
      db.payment.groupBy({
        by: ['status'],
        _count: true,
        _sum: { amount: true },
      }),
      db.payment.findMany({
        where: { status: 'DISBURSED' },
        orderBy: { disbursedAt: 'desc' },
        take: 10,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
    ])

    // Total disbursed amount
    const totalDisbursedResult = await db.payment.aggregate({
      where: { status: 'DISBURSED' },
      _sum: { amount: true },
      _count: true,
    })

    // Total amount for ready payments
    const readyAmountResult = await db.payment.aggregate({
      where: { status: 'READY_FOR_PAYMENT' },
      _sum: { amount: true },
      _count: true,
    })

    // Build status breakdown
    const statusBreakdown: Record<string, { count: number; total: number }> = {}
    for (const ps of paymentByStatus) {
      statusBreakdown[ps.status] = {
        count: ps._count,
        total: ps._sum.amount || 0,
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          pendingCount: pendingPayments,
          readyForPaymentCount: readyPayments,
          readyForPaymentAmount: readyAmountResult._sum.amount || 0,
          approvedCount: approvedPayments,
          disbursedCount: totalDisbursedResult._count,
          disbursedTotalAmount: totalDisbursedResult._sum.amount || 0,
          failedCount: failedPayments,
          cancelledCount: cancelledPayments,
        },
        statusBreakdown,
        recentDisbursements: recentDisbursements.map((p) => ({
          id: p.id,
          userId: p.userId,
          amount: p.amount,
          disbursedAt: p.disbursedAt?.toISOString() || null,
          user: p.user,
        })),
      },
    })
  } catch (error: any) {
    console.error('Finance dashboard error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
