import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { db } from '@/lib/db'
import { haversineDistance } from '@/lib/utils'

// GET /api/check-ins - List all check-ins (Admin only)
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
    const type = searchParams.get('type') || ''

    const skip = (page - 1) * limit

    const where: any = {}
    if (tpsId) where.tpsId = tpsId
    if (type) where.type = type

    const [checkIns, total] = await Promise.all([
      db.checkIn.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          tps: { select: { id: true, code: true, name: true } },
        },
      }),
      db.checkIn.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        checkIns: checkIns.map((c) => ({
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
          user: c.user,
          tps: c.tps,
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
    console.error('List check-ins error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/check-ins - Submit check-in (Saksi only)
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
    const { type, selfiePhoto, latitude, longitude } = body

    if (!type || !selfiePhoto || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, error: 'type, selfiePhoto, latitude, and longitude are required' },
        { status: 400 }
      )
    }

    if (!['MORNING', 'FINAL'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'type must be MORNING or FINAL' },
        { status: 400 }
      )
    }

    // Find active assignment
    const assignment = await db.tPSAssignment.findFirst({
      where: {
        userId: auth.user.id,
        status: 'ACTIVE',
      },
      include: { tps: true },
    })

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'No active assignment found' },
        { status: 400 }
      )
    }

    // Check for duplicate check-in of same type
    const existingCheckIn = await db.checkIn.findFirst({
      where: {
        userId: auth.user.id,
        tpsId: assignment.tpsId,
        type,
      },
    })

    if (existingCheckIn) {
      return NextResponse.json(
        { success: false, error: `${type} check-in already submitted for this TPS` },
        { status: 409 }
      )
    }

    // Calculate distance from TPS using Haversine formula
    const distance = haversineDistance(
      latitude,
      longitude,
      assignment.tps.latitude,
      assignment.tps.longitude
    )

    // Set GPS verified if within 100 meters
    const gpsVerified = distance <= 100

    // Create check-in
    const checkIn = await db.checkIn.create({
      data: {
        userId: auth.user.id,
        tpsId: assignment.tpsId,
        type,
        selfiePhoto,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        gpsVerified,
        distance,
      },
    })

    // Auto-create payment record if this is the first check-in
    const existingPayments = await db.payment.count({
      where: { userId: auth.user.id },
    })

    if (existingPayments === 0) {
      await db.payment.create({
        data: {
          userId: auth.user.id,
          amount: 150000,
          status: 'PENDING',
        },
      })
    }

    // Update payment validation if GPS is verified
    if (gpsVerified) {
      const payment = await db.payment.findFirst({
        where: { userId: auth.user.id },
        orderBy: { createdAt: 'desc' },
      })
      if (payment && !payment.gpsVerified) {
        await db.payment.update({
          where: { id: payment.id },
          data: { gpsVerified: true },
        })
      }
    }

    // Recalculate validation score
    const paymentRecord = await db.payment.findFirst({
      where: { userId: auth.user.id },
      orderBy: { createdAt: 'desc' },
    })
    if (paymentRecord) {
      const score = [
        paymentRecord.gpsVerified ? 1 : 0,
        paymentRecord.c1Uploaded ? 1 : 0,
        paymentRecord.dataInputted ? 1 : 0,
      ].reduce((a, b) => a + b, 0)
      await db.payment.update({
        where: { id: paymentRecord.id },
        data: { validationScore: score },
      })

      // Update status based on validation score
      if (score >= 2 && paymentRecord.status === 'PENDING') {
        await db.payment.update({
          where: { id: paymentRecord.id },
          data: { status: 'READY_FOR_PAYMENT' },
        })
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: checkIn.id,
          userId: checkIn.userId,
          tpsId: checkIn.tpsId,
          type: checkIn.type,
          gpsVerified: checkIn.gpsVerified,
          distance: checkIn.distance,
          timestamp: checkIn.timestamp.toISOString(),
          createdAt: checkIn.createdAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create check-in error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
