import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/users/[id] - Get user by ID
export async function GET(
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

    const user = await db.profile.findUnique({
      where: { id },
      include: {
        assignments: {
          include: { tps: true },
          orderBy: { assignedAt: 'desc' },
        },
        checkIns: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
        voteInputs: {
          orderBy: { submittedAt: 'desc' },
        },
        fraudReports: {
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        assignments: user.assignments.map((a) => ({
          ...a,
          assignedAt: a.assignedAt.toISOString(),
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
          tps: a.tps ? {
            ...a.tps,
            createdAt: a.tps.createdAt.toISOString(),
            updatedAt: a.tps.updatedAt.toISOString(),
          } : null,
        })),
        checkIns: user.checkIns.map((c) => ({
          ...c,
          timestamp: c.timestamp.toISOString(),
          createdAt: c.createdAt.toISOString(),
        })),
        voteInputs: user.voteInputs.map((v) => ({
          ...v,
          submittedAt: v.submittedAt.toISOString(),
          createdAt: v.createdAt.toISOString(),
          updatedAt: v.updatedAt.toISOString(),
        })),
        fraudReports: user.fraudReports.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
          reviewedAt: r.reviewedAt?.toISOString() || null,
        })),
        payments: user.payments.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
          approvedAt: p.approvedAt?.toISOString() || null,
          disbursedAt: p.disbursedAt?.toISOString() || null,
        })),
      },
    })
  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/users/[id] - Update user profile
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

    const user = await db.profile.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // If KTP number is being changed, check for uniqueness
    if (body.ktpNumber && body.ktpNumber !== user.ktpNumber) {
      const existingKtp = await db.profile.findUnique({
        where: { ktpNumber: body.ktpNumber },
      })
      if (existingKtp) {
        return NextResponse.json(
          { success: false, error: 'KTP number already registered' },
          { status: 409 }
        )
      }
    }

    const { email: _email, id: _id, role: _role, createdAt: _ca, updatedAt: _ua, ...updateData } = body

    const updated = await db.profile.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        phone: updated.phone,
        ktpNumber: updated.ktpNumber,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Soft-delete (delete profile)
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

    const user = await db.profile.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Prevent self-deletion
    if (id === auth.user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    await db.profile.delete({ where: { id } })

    return NextResponse.json({
      success: true,
      data: { message: 'User deleted successfully' },
    })
  } catch (error: any) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
