import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/reports - List fraud reports
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth()
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''

    const skip = (page - 1) * limit

    const where: any = {}
    if (auth.profile.role === 'SAKSI') {
      where.userId = auth.user.id
    }
    if (status) where.status = status
    if (category) where.category = category

    const [reports, total] = await Promise.all([
      db.fraudReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      }),
      db.fraudReport.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        reports: reports.map((r) => ({
          id: r.id,
          userId: r.userId,
          tpsId: r.tpsId,
          title: r.title,
          description: r.description,
          category: r.category,
          videoPath: r.videoPath,
          status: r.status,
          reviewedBy: r.reviewedBy,
          reviewedAt: r.reviewedAt?.toISOString() || null,
          reviewNotes: r.reviewNotes,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
          user: r.user,
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
    console.error('List reports error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/reports - Submit fraud report (Saksi only)
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
    const { title, description, category, videoPath, tpsId } = body

    if (!title || !description) {
      return NextResponse.json(
        { success: false, error: 'title and description are required' },
        { status: 400 }
      )
    }

    // Find user's active assignment for tpsId if not provided
    let reportTpsId = tpsId || null
    if (!reportTpsId) {
      const assignment = await db.tPSAssignment.findFirst({
        where: {
          userId: auth.user.id,
          status: 'ACTIVE',
        },
      })
      reportTpsId = assignment?.tpsId || null
    }

    const report = await db.fraudReport.create({
      data: {
        userId: auth.user.id,
        tpsId: reportTpsId,
        title,
        description,
        category: category || 'LAINNYA',
        videoPath: videoPath || null,
      },
    })

    return NextResponse.json(
      {
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
          createdAt: report.createdAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create report error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
