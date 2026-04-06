import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// PUT /api/assignments/[id] - Update assignment status (Admin only)
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

    const assignment = await db.tPSAssignment.findUnique({ where: { id } })
    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      )
    }

    const validStatuses = ['ACTIVE', 'COMPLETED', 'CANCELLED']
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be ACTIVE, COMPLETED, or CANCELLED' },
        { status: 400 }
      )
    }

    const updated = await db.tPSAssignment.update({
      where: { id },
      data: {
        status: body.status || assignment.status,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        tps: { select: { id: true, code: true, name: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        userId: updated.userId,
        tpsId: updated.tpsId,
        status: updated.status,
        assignedAt: updated.assignedAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        user: updated.user,
        tps: updated.tps,
      },
    })
  } catch (error: any) {
    console.error('Update assignment error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/assignments/[id] - Remove assignment (Admin only)
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

    const assignment = await db.tPSAssignment.findUnique({ where: { id } })
    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      )
    }

    await db.tPSAssignment.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      data: { message: 'Assignment removed successfully' },
    })
  } catch (error: any) {
    console.error('Delete assignment error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
