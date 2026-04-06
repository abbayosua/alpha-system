import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const auth = await requireAuth()
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { user, profile } = auth

    // Get assignment info
    const assignment = await db.tPSAssignment.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
      include: {
        tps: true,
      },
      orderBy: { assignedAt: 'desc' },
    })

    // Get check-in count
    const checkInCount = await db.checkIn.count({
      where: { userId: user.id },
    })

    // Get vote input
    const voteInput = await db.voteInput.findFirst({
      where: { userId: user.id },
      orderBy: { submittedAt: 'desc' },
    })

    // Get payment info
    const payments = await db.payment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    // Get report count
    const reportCount = await db.fraudReport.count({
      where: { userId: user.id },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...profile,
        stats: {
          hasAssignment: !!assignment,
          assignment,
          checkInCount,
          hasVoteInput: !!voteInput,
          voteInput,
          payments,
          reportCount,
        },
      },
    })
  } catch (error: any) {
    console.error('Get me error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
