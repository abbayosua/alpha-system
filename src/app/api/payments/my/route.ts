import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/payments/my - Get my payments (Saksi only)
export async function GET() {
  try {
    const auth = await requireAuth('SAKSI')
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payments = await db.payment.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: payments.map((p) => ({
        id: p.id,
        userId: p.userId,
        amount: p.amount,
        status: p.status,
        c1Uploaded: p.c1Uploaded,
        gpsVerified: p.gpsVerified,
        dataInputted: p.dataInputted,
        validationScore: p.validationScore,
        paymentMethod: p.paymentMethod,
        accountNumber: p.accountNumber,
        accountName: p.accountName,
        transferProof: p.transferProof,
        approvedBy: p.approvedBy,
        approvedAt: p.approvedAt?.toISOString() || null,
        disbursedAt: p.disbursedAt?.toISOString() || null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    })
  } catch (error: any) {
    console.error('Get my payments error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
