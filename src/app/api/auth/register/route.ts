import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      email,
      password,
      name,
      phone,
      ktpNumber,
      bankName,
      bankAccount,
      bankHolderName,
      eWalletType,
      eWalletNumber,
    } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if email already exists in profiles
    const existingProfile = await db.profile.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Check if KTP number already exists
    if (ktpNumber) {
      const existingKtp = await db.profile.findUnique({
        where: { ktpNumber },
      })
      if (existingKtp) {
        return NextResponse.json(
          { success: false, error: 'KTP number already registered' },
          { status: 409 }
        )
      }
    }

    // Create Supabase Auth user using service role client
    const supabase = createServiceClient()
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: { name },
      },
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: authError?.message || 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create profile in database
    const profile = await db.profile.create({
      data: {
        id: authData.user.id,
        email: email.toLowerCase(),
        name,
        phone: phone || null,
        ktpNumber: ktpNumber || null,
        bankName: bankName || null,
        bankAccount: bankAccount || null,
        bankHolderName: bankHolderName || null,
        eWalletType: eWalletType || null,
        eWalletNumber: eWalletNumber || null,
        role: 'SAKSI',
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          createdAt: profile.createdAt.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
