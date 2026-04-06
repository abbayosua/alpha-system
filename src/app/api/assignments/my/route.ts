import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/assignments/my - Get current user's assignment (Saksi only)
export async function GET() {
  try {
    const auth = await requireAuth('SAKSI')
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const assignment = await db.tPSAssignment.findFirst({
      where: {
        userId: auth.user.id,
        status: 'ACTIVE',
      },
      include: {
        tps: true,
      },
      orderBy: { assignedAt: 'desc' },
    })

    if (!assignment) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No active assignment found',
      })
    }

    // Get check-in status for this assignment
    const checkIns = await db.checkIn.findMany({
      where: {
        userId: auth.user.id,
        tpsId: assignment.tpsId,
      },
      orderBy: { timestamp: 'desc' },
    })

    const morningCheckIn = checkIns.find((c) => c.type === 'MORNING')
    const finalCheckIn = checkIns.find((c) => c.type === 'FINAL')

    // Get vote input status
    const voteInput = await db.voteInput.findFirst({
      where: {
        userId: auth.user.id,
        tpsId: assignment.tpsId,
      },
      orderBy: { submittedAt: 'desc' },
    })

    // Get payment status
    const payment = await db.payment.findFirst({
      where: {
        userId: auth.user.id,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: assignment.id,
        userId: assignment.userId,
        tpsId: assignment.tpsId,
        status: assignment.status,
        assignedAt: assignment.assignedAt.toISOString(),
        tps: {
          id: assignment.tps.id,
          code: assignment.tps.code,
          name: assignment.tps.name,
          address: assignment.tps.address,
          latitude: assignment.tps.latitude,
          longitude: assignment.tps.longitude,
          kelurahan: assignment.tps.kelurahan,
          kecamatan: assignment.tps.kecamatan,
          kota: assignment.tps.kota,
          province: assignment.tps.province,
          totalDpt: assignment.tps.totalDpt,
        },
        checkInStatus: {
          morning: morningCheckIn ? {
            id: morningCheckIn.id,
            type: morningCheckIn.type,
            gpsVerified: morningCheckIn.gpsVerified,
            distance: morningCheckIn.distance,
            timestamp: morningCheckIn.timestamp.toISOString(),
          } : null,
          final: finalCheckIn ? {
            id: finalCheckIn.id,
            type: finalCheckIn.type,
            gpsVerified: finalCheckIn.gpsVerified,
            distance: finalCheckIn.distance,
            timestamp: finalCheckIn.timestamp.toISOString(),
          } : null,
        },
        voteInputStatus: voteInput ? {
          id: voteInput.id,
          submitted: true,
          c1Uploaded: !!voteInput.c1Photo,
          submittedAt: voteInput.submittedAt.toISOString(),
        } : null,
        paymentStatus: payment ? {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          validationScore: payment.validationScore,
          createdAt: payment.createdAt.toISOString(),
        } : null,
      },
    })
  } catch (error: any) {
    console.error('Get my assignment error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
