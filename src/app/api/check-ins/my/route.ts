import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/check-ins/my - Get my check-ins (Saksi only)
export async function GET() {
  try {
    const auth = await requireAuth('SAKSI')
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const checkIns = await db.checkIn.findMany({
      where: { userId: auth.user.id },
      orderBy: { timestamp: 'desc' },
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

    return NextResponse.json({
      success: true,
      data: checkIns.map((c) => ({
        id: c.id,
        userId: c.userId,
        tpsId: c.tpsId,
        type: c.type,
        selfiePhoto: c.selfiePhoto,
        latitude: c.latitude,
        longitude: c.longitude,
        gpsVerified: c.gpsVerified,
        distance: c.distance,
        timestamp: c.timestamp.toISOString(),
        createdAt: c.createdAt.toISOString(),
        tps: c.tps,
      })),
    })
  } catch (error: any) {
    console.error('Get my check-ins error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
