import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/dashboard/saksi - Saksi personal dashboard
export async function GET() {
  try {
    const auth = await requireAuth('SAKSI')
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { user, profile } = auth

    // Get active assignment
    const assignment = await db.tPSAssignment.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
      include: { tps: true },
      orderBy: { assignedAt: 'desc' },
    })

    // Get check-in status
    const checkIns = assignment
      ? await db.checkIn.findMany({
          where: {
            userId: user.id,
            tpsId: assignment.tpsId,
          },
          orderBy: { timestamp: 'desc' },
        })
      : []

    const morningCheckIn = checkIns.find((c) => c.type === 'MORNING')
    const finalCheckIn = checkIns.find((c) => c.type === 'FINAL')

    // Get vote input status
    const voteInput = assignment
      ? await db.voteInput.findFirst({
          where: {
            userId: user.id,
            tpsId: assignment.tpsId,
          },
          orderBy: { submittedAt: 'desc' },
        })
      : null

    // Get payment status
    const payment = await db.payment.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    // Get recent fraud reports
    const recentReports = await db.fraudReport.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    // Build validation checklist
    const validationChecklist = {
      morningCheckIn: !!morningCheckIn,
      finalCheckIn: !!finalCheckIn,
      gpsVerified: morningCheckIn?.gpsVerified || false,
      voteDataInputted: !!voteInput,
      c1Uploaded: !!voteInput?.c1Photo,
    }

    return NextResponse.json({
      success: true,
      data: {
        profile,
        assignment: assignment
          ? {
              id: assignment.id,
              status: assignment.status,
              assignedAt: assignment.assignedAt.toISOString(),
              tps: {
                id: assignment.tps.id,
                code: assignment.tps.code,
                name: assignment.tps.name,
                address: assignment.tps.address,
                kelurahan: assignment.tps.kelurahan,
                kecamatan: assignment.tps.kecamatan,
                kota: assignment.tps.kota,
                province: assignment.tps.province,
              },
            }
          : null,
        checkInStatus: {
          morning: morningCheckIn
            ? {
                completed: true,
                gpsVerified: morningCheckIn.gpsVerified,
                distance: morningCheckIn.distance,
                timestamp: morningCheckIn.timestamp.toISOString(),
              }
            : { completed: false },
          final: finalCheckIn
            ? {
                completed: true,
                gpsVerified: finalCheckIn.gpsVerified,
                distance: finalCheckIn.distance,
                timestamp: finalCheckIn.timestamp.toISOString(),
              }
            : { completed: false },
        },
        voteInputStatus: voteInput
          ? {
              submitted: true,
              c1Uploaded: !!voteInput.c1Photo,
              totalVotes: voteInput.totalVotes,
              submittedAt: voteInput.submittedAt.toISOString(),
            }
          : { submitted: false },
        payment: payment
          ? {
              id: payment.id,
              status: payment.status,
              amount: payment.amount,
              validationScore: payment.validationScore,
              validationChecklist,
            }
          : null,
        recentReports: recentReports.map((r) => ({
          id: r.id,
          title: r.title,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        })),
      },
    })
  } catch (error: any) {
    console.error('Saksi dashboard error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
