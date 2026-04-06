import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/payments/[id] - Get payment details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth()
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const payment = await db.payment.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Saksi can only view their own payments
    if (auth.profile.role === 'SAKSI' && payment.userId !== auth.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: payment.id,
        userId: payment.userId,
        amount: payment.amount,
        status: payment.status,
        c1Uploaded: payment.c1Uploaded,
        gpsVerified: payment.gpsVerified,
        dataInputted: payment.dataInputted,
        validationScore: payment.validationScore,
        paymentMethod: payment.paymentMethod,
        accountNumber: payment.accountNumber,
        accountName: payment.accountName,
        transferProof: payment.transferProof,
        approvedBy: payment.approvedBy,
        approvedAt: payment.approvedAt?.toISOString() || null,
        disbursedAt: payment.disbursedAt?.toISOString() || null,
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
        user: payment.user,
      },
    })
  } catch (error: any) {
    console.error('Get payment error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/payments/[id] - Update payment status (Finance only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('ADMIN_KEUANGAN')
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Finance access required.' },
        { status: 401 }
      )
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || ''

    const validActions = ['approve', 'disburse', 'reject']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be approve, disburse, or reject' },
        { status: 400 }
      )
    }

    const payment = await db.payment.findUnique({ where: { id } })
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      )
    }

    const updateData: any = {}

    switch (action) {
      case 'approve':
        if (payment.status !== 'READY_FOR_PAYMENT') {
          return NextResponse.json(
            { success: false, error: 'Payment must be READY_FOR_PAYMENT to approve' },
            { status: 400 }
          )
        }
        updateData.status = 'APPROVED'
        updateData.approvedBy = auth.user.id
        updateData.approvedAt = new Date()
        break

      case 'disburse':
        if (payment.status !== 'APPROVED') {
          return NextResponse.json(
            { success: false, error: 'Payment must be APPROVED to disburse' },
            { status: 400 }
          )
        }
        updateData.status = 'DISBURSED'
        updateData.disbursedAt = new Date()
        break

      case 'reject':
        if (payment.status === 'DISBURSED' || payment.status === 'CANCELLED') {
          return NextResponse.json(
            { success: false, error: 'Cannot reject a disbursed or cancelled payment' },
            { status: 400 }
          )
        }
        updateData.status = 'CANCELLED'
        break
    }

    const body = await request.json().catch(() => ({}))

    const updated = await db.payment.update({
      where: { id },
      data: {
        ...updateData,
        paymentMethod: body.paymentMethod || payment.paymentMethod,
        accountNumber: body.accountNumber || payment.accountNumber,
        accountName: body.accountName || payment.accountName,
        transferProof: body.transferProof || payment.transferProof,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        userId: updated.userId,
        amount: updated.amount,
        status: updated.status,
        c1Uploaded: updated.c1Uploaded,
        gpsVerified: updated.gpsVerified,
        dataInputted: updated.dataInputted,
        validationScore: updated.validationScore,
        paymentMethod: updated.paymentMethod,
        accountNumber: updated.accountNumber,
        accountName: updated.accountName,
        transferProof: updated.transferProof,
        approvedBy: updated.approvedBy,
        approvedAt: updated.approvedAt?.toISOString() || null,
        disbursedAt: updated.disbursedAt?.toISOString() || null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        user: updated.user,
      },
    })
  } catch (error: any) {
    console.error('Update payment error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
