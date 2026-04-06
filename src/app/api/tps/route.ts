import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/tps - List all TPS
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
    const search = searchParams.get('search') || ''

    const where: any = {}
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { kelurahan: { contains: search, mode: 'insensitive' } },
        { kecamatan: { contains: search, mode: 'insensitive' } },
      ]
    }

    const tpsList = await db.tPS.findMany({
      where,
      orderBy: { code: 'asc' },
      include: {
        _count: {
          select: {
            assignments: {
              where: { status: 'ACTIVE' },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: tpsList.map((t) => ({
        id: t.id,
        code: t.code,
        name: t.name,
        address: t.address,
        latitude: t.latitude,
        longitude: t.longitude,
        kelurahan: t.kelurahan,
        kecamatan: t.kecamatan,
        kota: t.kota,
        province: t.province,
        totalDpt: t.totalDpt,
        activeAssignmentCount: t._count.assignments,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    })
  } catch (error: any) {
    console.error('List TPS error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/tps - Create new TPS (Admin only)
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

    const { code, name, address, latitude, longitude, kelurahan, kecamatan, kota, province, totalDpt } = body

    if (!code || !name || !address || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, error: 'Code, name, address, latitude, and longitude are required' },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existingTPS = await db.tPS.findUnique({ where: { code } })
    if (existingTPS) {
      return NextResponse.json(
        { success: false, error: 'TPS code already exists' },
        { status: 409 }
      )
    }

    const tps = await db.tPS.create({
      data: {
        code,
        name,
        address,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        kelurahan: kelurahan || null,
        kecamatan: kecamatan || null,
        kota: kota || null,
        province: province || null,
        totalDpt: parseInt(totalDpt) || 0,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: tps.id,
          code: tps.code,
          name: tps.name,
          address: tps.address,
          latitude: tps.latitude,
          longitude: tps.longitude,
          kelurahan: tps.kelurahan,
          kecamatan: tps.kecamatan,
          kota: tps.kota,
          province: tps.province,
          totalDpt: tps.totalDpt,
          createdAt: tps.createdAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create TPS error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
