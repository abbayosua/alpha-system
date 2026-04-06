import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/tps/[id] - Get TPS details with assignment count
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

    const tps = await db.tPS.findUnique({
      where: { id },
      include: {
        assignments: {
          where: { status: 'ACTIVE' },
          include: { user: true },
        },
        _count: {
          select: {
            checkIns: true,
            voteInputs: true,
            assignments: true,
          },
        },
      },
    })

    if (!tps) {
      return NextResponse.json(
        { success: false, error: 'TPS not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...tps,
        assignmentCount: tps._count.assignments,
        checkInCount: tps._count.checkIns,
        voteInputCount: tps._count.voteInputs,
        activeAssignments: tps.assignments.map((a) => ({
          id: a.id,
          userId: a.userId,
          userName: a.user.name,
          userEmail: a.user.email,
          status: a.status,
          assignedAt: a.assignedAt.toISOString(),
        })),
        createdAt: tps.createdAt.toISOString(),
        updatedAt: tps.updatedAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Get TPS error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/tps/[id] - Update TPS (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('ADMIN')
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const tps = await db.tPS.findUnique({ where: { id } })
    if (!tps) {
      return NextResponse.json(
        { success: false, error: 'TPS not found' },
        { status: 404 }
      )
    }

    // If code is being changed, check uniqueness
    if (body.code && body.code !== tps.code) {
      const existing = await db.tPS.findUnique({ where: { code: body.code } })
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'TPS code already exists' },
          { status: 409 }
        )
      }
    }

    const updateData: any = { ...body }
    if (body.latitude !== undefined) updateData.latitude = parseFloat(body.latitude)
    if (body.longitude !== undefined) updateData.longitude = parseFloat(body.longitude)
    if (body.totalDpt !== undefined) updateData.totalDpt = parseInt(body.totalDpt)

    const updated = await db.tPS.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Update TPS error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/tps/[id] - Delete TPS (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAuth('ADMIN')
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const { id } = await params

    const tps = await db.tPS.findUnique({
      where: { id },
      include: {
        _count: {
          select: { assignments: true },
        },
      },
    })

    if (!tps) {
      return NextResponse.json(
        { success: false, error: 'TPS not found' },
        { status: 404 }
      )
    }

    if (tps._count.assignments > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete TPS with active assignments. Remove all assignments first.' },
        { status: 400 }
      )
    }

    await db.tPS.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      data: { message: 'TPS deleted successfully' },
    })
  } catch (error: any) {
    console.error('Delete TPS error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
