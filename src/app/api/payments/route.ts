import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/payments - List payments (Admin/Finance: all, Saksi: own only)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    const where: any = {}
    if (auth.profile.role === 'SAKSI') {
      where.userId = auth.user.id
    }
    if (status) where.status = status

    const [payments, total] = await Promise.all([
      db.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      }),
      db.payment.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        payments: payments.map((p) => ({
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
          user: p.user,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error: any) {
    console.error('List payments error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
