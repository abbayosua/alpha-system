import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/assignments - List all assignments (Admin only)
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
    const status = searchParams.get('status') || ''
    const tpsId = searchParams.get('tpsId') || ''

    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status
    if (tpsId) where.tpsId = tpsId

    const [assignments, total] = await Promise.all([
      db.tPSAssignment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { assignedAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, role: true },
          },
          tps: true,
        },
      }),
      db.tPSAssignment.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        assignments: assignments.map((a) => ({
          id: a.id,
          userId: a.userId,
          tpsId: a.tpsId,
          status: a.status,
          assignedBy: a.assignedBy,
          assignedAt: a.assignedAt.toISOString(),
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
          user: a.user,
          tps: a.tps ? {
            id: a.tps.id,
            code: a.tps.code,
            name: a.tps.name,
            address: a.tps.address,
            latitude: a.tps.latitude,
            longitude: a.tps.longitude,
          } : null,
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
    console.error('List assignments error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/assignments - Assign user to TPS (Admin only)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth('ADMIN')
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { userId, tpsId } = body

    if (!userId || !tpsId) {
      return NextResponse.json(
        { success: false, error: 'userId and tpsId are required' },
        { status: 400 }
      )
    }

    // Verify user exists
    const user = await db.profile.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify TPS exists
    const tps = await db.tPS.findUnique({ where: { id: tpsId } })
    if (!tps) {
      return NextResponse.json(
        { success: false, error: 'TPS not found' },
        { status: 404 }
      )
    }

    // Check for existing active assignment
    const existingAssignment = await db.tPSAssignment.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    })

    if (existingAssignment) {
      return NextResponse.json(
        { success: false, error: 'User already has an active assignment' },
        { status: 409 }
      )
    }

    // Check for duplicate assignment
    const duplicateAssignment = await db.tPSAssignment.findUnique({
      where: {
        userId_tpsId: { userId, tpsId },
      },
    })

    if (duplicateAssignment) {
      // Reactivate existing cancelled assignment
      const reactivated = await db.tPSAssignment.update({
        where: { id: duplicateAssignment.id },
        data: {
          status: 'ACTIVE',
          assignedBy: auth.user.id,
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          id: reactivated.id,
          userId: reactivated.userId,
          tpsId: reactivated.tpsId,
          status: reactivated.status,
          assignedBy: reactivated.assignedBy,
          assignedAt: reactivated.assignedAt.toISOString(),
          message: 'Assignment reactivated successfully',
        },
      })
    }

    const assignment = await db.tPSAssignment.create({
      data: {
        userId,
        tpsId,
        assignedBy: auth.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        tps: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: assignment.id,
          userId: assignment.userId,
          tpsId: assignment.tpsId,
          status: assignment.status,
          assignedBy: assignment.assignedBy,
          assignedAt: assignment.assignedAt.toISOString(),
          user: assignment.user,
          tps: assignment.tps ? {
            id: assignment.tps.id,
            code: assignment.tps.code,
            name: assignment.tps.name,
          } : null,
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create assignment error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
