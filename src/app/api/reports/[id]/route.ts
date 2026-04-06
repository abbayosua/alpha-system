import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/reports/[id] - Get report details
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

    const report = await db.fraudReport.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    })

    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      )
    }

    // Saksi can only view their own reports
    if (auth.profile.role === 'SAKSI' && report.userId !== auth.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: report.id,
        userId: report.userId,
        tpsId: report.tpsId,
        title: report.title,
        description: report.description,
        category: report.category,
        videoPath: report.videoPath,
        status: report.status,
        reviewedBy: report.reviewedBy,
        reviewedAt: report.reviewedAt?.toISOString() || null,
        reviewNotes: report.reviewNotes,
        createdAt: report.createdAt.toISOString(),
        updatedAt: report.updatedAt.toISOString(),
        user: report.user,
      },
    })
  } catch (error: any) {
    console.error('Get report error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/reports/[id] - Update report status (Admin only)
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

    const report = await db.fraudReport.findUnique({ where: { id } })
    if (!report) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      )
    }

    const validStatuses = ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'DISMISSED']
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be PENDING, UNDER_REVIEW, VERIFIED, or DISMISSED' },
        { status: 400 }
      )
    }

    const updated = await db.fraudReport.update({
      where: { id },
      data: {
        status: body.status || report.status,
        reviewNotes: body.reviewNotes !== undefined ? body.reviewNotes : report.reviewNotes,
        reviewedBy: body.status ? auth.user.id : report.reviewedBy,
        reviewedAt: body.status ? new Date() : report.reviewedAt,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        userId: updated.userId,
        tpsId: updated.tpsId,
        title: updated.title,
        description: updated.description,
        category: updated.category,
        videoPath: updated.videoPath,
        status: updated.status,
        reviewedBy: updated.reviewedBy,
        reviewedAt: updated.reviewedAt?.toISOString() || null,
        reviewNotes: updated.reviewNotes,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        user: updated.user,
      },
    })
  } catch (error: any) {
    console.error('Update report error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
