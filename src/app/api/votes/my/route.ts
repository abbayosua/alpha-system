import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/votes/my - Get my vote input (Saksi only)
export async function GET() {
  try {
    const auth = await requireAuth('SAKSI')
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const voteInput = await db.voteInput.findFirst({
      where: { userId: auth.user.id },
      orderBy: { submittedAt: 'desc' },
      include: {
        tps: {
          select: {
            id: true,
            code: true,
            name: true,
            address: true,
          },
        },
      },
    })

    if (!voteInput) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No vote input found',
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: voteInput.id,
        userId: voteInput.userId,
        tpsId: voteInput.tpsId,
        candidate1Votes: voteInput.candidate1Votes,
        candidate2Votes: voteInput.candidate2Votes,
        candidate3Votes: voteInput.candidate3Votes,
        totalValidVotes: voteInput.totalValidVotes,
        totalInvalidVotes: voteInput.totalInvalidVotes,
        totalVotes: voteInput.totalVotes,
        c1Photo: voteInput.c1Photo,
        c1Verified: voteInput.c1Verified,
        submittedAt: voteInput.submittedAt.toISOString(),
        createdAt: voteInput.createdAt.toISOString(),
        updatedAt: voteInput.updatedAt.toISOString(),
        tps: voteInput.tps,
      },
    })
  } catch (error: any) {
    console.error('Get my vote input error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
