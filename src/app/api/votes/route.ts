import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/votes - List all vote inputs (Admin only)
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
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const tpsId = searchParams.get('tpsId') || ''

    const skip = (page - 1) * limit

    const where: any = {}
    if (tpsId) where.tpsId = tpsId

    const [votes, total] = await Promise.all([
      db.voteInput.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          tps: { select: { id: true, code: true, name: true, address: true } },
        },
      }),
      db.voteInput.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        votes: votes.map((v) => ({
          id: v.id,
          userId: v.userId,
          tpsId: v.tpsId,
          candidate1Votes: v.candidate1Votes,
          candidate2Votes: v.candidate2Votes,
          candidate3Votes: v.candidate3Votes,
          totalValidVotes: v.totalValidVotes,
          totalInvalidVotes: v.totalInvalidVotes,
          totalVotes: v.totalVotes,
          c1Photo: v.c1Photo,
          c1Verified: v.c1Verified,
          submittedAt: v.submittedAt.toISOString(),
          createdAt: v.createdAt.toISOString(),
          updatedAt: v.updatedAt.toISOString(),
          user: v.user,
          tps: v.tps,
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
    console.error('List votes error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/votes - Submit vote input (Saksi only)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth('SAKSI')
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      candidate1Votes,
      candidate2Votes,
      candidate3Votes,
      totalInvalidVotes,
      c1Photo,
    } = body

    if (
      candidate1Votes === undefined ||
      candidate2Votes === undefined ||
      candidate3Votes === undefined ||
      totalInvalidVotes === undefined
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'candidate1Votes, candidate2Votes, candidate3Votes, and totalInvalidVotes are required',
        },
        { status: 400 }
      )
    }

    // Find active assignment
    const assignment = await db.tPSAssignment.findFirst({
      where: {
        userId: auth.user.id,
        status: 'ACTIVE',
      },
    })

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'No active assignment found' },
        { status: 400 }
      )
    }

    // Calculate totals automatically
    const totalValidVotes =
      parseInt(candidate1Votes) +
      parseInt(candidate2Votes) +
      parseInt(candidate3Votes)
    const totalVotes = totalValidVotes + parseInt(totalInvalidVotes)

    // Create vote input
    const voteInput = await db.voteInput.create({
      data: {
        userId: auth.user.id,
        tpsId: assignment.tpsId,
        candidate1Votes: parseInt(candidate1Votes),
        candidate2Votes: parseInt(candidate2Votes),
        candidate3Votes: parseInt(candidate3Votes),
        totalValidVotes,
        totalInvalidVotes: parseInt(totalInvalidVotes),
        totalVotes,
        c1Photo: c1Photo || null,
        c1Verified: !!c1Photo,
      },
    })

    // Update payment validation
    const payment = await db.payment.findFirst({
      where: { userId: auth.user.id },
      orderBy: { createdAt: 'desc' },
    })

    if (payment) {
      const updateData: any = { dataInputted: true }
      if (c1Photo) {
        updateData.c1Uploaded = true
      }

      const score = [
        payment.gpsVerified ? 1 : 0,
        (c1Photo ? true : false) || payment.c1Uploaded ? 1 : 0,
        true, // dataInputted = true
      ].reduce((a, b) => a + b, 0)

      updateData.validationScore = score

      // Update status based on validation score
      if (score >= 2 && payment.status === 'PENDING') {
        updateData.status = 'READY_FOR_PAYMENT'
      }

      await db.payment.update({
        where: { id: payment.id },
        data: updateData,
      })
    }

    return NextResponse.json(
      {
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
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create vote input error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
