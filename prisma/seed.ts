// Override system env vars before any imports
process.env.DATABASE_URL = 'postgresql://postgres.wwekdhlzsyhqkgapiszl:890iop*()IOP@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres'
process.env.DIRECT_URL = process.env.DATABASE_URL

import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const db = new PrismaClient()

async function seed() {
  console.log('🌱 Starting seed...')

  // ===== 1. Create Supabase Auth Users =====
  const usersToCreate = [
    { email: 'admin@demo.com', password: 'demo123', name: 'Admin Utama', role: 'ADMIN' as const },
    { email: 'finance@demo.com', password: 'demo123', name: 'Admin Keuangan', role: 'ADMIN_KEUANGAN' as const },
    { email: 'saksi@demo.com', password: 'demo123', name: 'Ahmad Saksi', role: 'SAKSI' as const },
    { email: 'budi@saksi.com', password: 'demo123', name: 'Budi Santoso', role: 'SAKSI' as const },
    { email: 'siti@saksi.com', password: 'demo123', name: 'Siti Rahayu', role: 'SAKSI' as const },
  ]

  const userIds: Record<string, string> = {}

  for (const u of usersToCreate) {
    // Check if user already exists by listing all and filtering
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    const existingUser = listData!.users.find((user) => user.email === u.email)

    if (existingUser) {
      userIds[u.email] = existingUser.id
      console.log(`  ✓ User ${u.email} already exists (id: ${existingUser.id.slice(0, 8)}...)`)
    } else {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: { role: u.role, name: u.name },
      })
      if (error) {
        console.error(`  ✗ Failed to create ${u.email}:`, error.message)
        continue
      }
      userIds[u.email] = data.user.id
      console.log(`  ✓ Created user ${u.email} (id: ${data.user.id.slice(0, 8)}...)`)
      // Create profile immediately after user creation
      if (process.env.DATABASE_URL) {
        try {
          await db.profile.create({
            data: {
              id: data.user.id,
              email: u.email,
              name: u.name,
              role: u.role as any,
            },
          })
        } catch (e) {
          // Profile might already exist, ignore
        }
      }
    }
  }

  // ===== 2. Create/Update Profiles =====
  const profileData = [
    { email: 'admin@demo.com', name: 'Admin Utama', role: 'ADMIN', phone: '081234567890' },
    { email: 'finance@demo.com', name: 'Admin Keuangan', role: 'ADMIN_KEUANGAN', phone: '081234567891' },
    {
      email: 'saksi@demo.com', name: 'Ahmad Saksi', role: 'SAKSI', phone: '081298765432',
      ktpNumber: '3201010101010001', bankName: 'BCA', bankAccount: '1234567890', bankHolderName: 'Ahmad Saksi',
    },
    {
      email: 'budi@saksi.com', name: 'Budi Santoso', role: 'SAKSI', phone: '081298765433',
      ktpNumber: '3201010101010002', bankName: 'Mandiri', bankAccount: '0987654321', bankHolderName: 'Budi Santoso',
    },
    {
      email: 'siti@saksi.com', name: 'Siti Rahayu', role: 'SAKSI', phone: '081298765434',
      ktpNumber: '3201010101010003', eWalletType: 'GoPay', eWalletNumber: '081298765434',
    },
  ]

  for (const p of profileData) {
    const id = userIds[p.email]
    if (!id) continue

    await db.profile.upsert({
      where: { id },
      create: {
        id,
        email: p.email,
        name: p.name,
        role: p.role as any,
        phone: p.phone,
        ktpNumber: (p as any).ktpNumber,
        ktpPhoto: (p as any).ktpPhoto,
        bankName: (p as any).bankName,
        bankAccount: (p as any).bankAccount,
        bankHolderName: (p as any).bankHolderName,
        eWalletType: (p as any).eWalletType,
        eWalletNumber: (p as any).eWalletNumber,
      },
      update: {
        name: p.name,
        role: p.role as any,
        phone: p.phone,
        ktpNumber: (p as any).ktpNumber,
        bankName: (p as any).bankName,
        bankAccount: (p as any).bankAccount,
        bankHolderName: (p as any).bankHolderName,
        eWalletType: (p as any).eWalletType,
        eWalletNumber: (p as any).eWalletNumber,
      },
    })
    console.log(`  ✓ Profile for ${p.email}`)
  }

  // ===== 3. Create TPS =====
  const tpsData = [
    { code: 'TPS-001', name: 'TPS 001 Menteng', address: 'Jl. Menteng Raya No. 12', latitude: -6.1867, longitude: 106.8343, kelurahan: 'Menteng', kecamatan: 'Menteng', kota: 'Jakarta Pusat', province: 'DKI Jakarta', totalDpt: 312 },
    { code: 'TPS-002', name: 'TPS 002 Senayan', address: 'Jl. Asia Afrika No. 8', latitude: -6.2247, longitude: 106.8021, kelurahan: 'Senayan', kecamatan: 'Kebayoran Baru', kota: 'Jakarta Selatan', province: 'DKI Jakarta', totalDpt: 287 },
    { code: 'TPS-003', name: 'TPS 003 Tanah Abang', address: 'Jl. Jatibaru No. 25', latitude: -6.1854, longitude: 106.8132, kelurahan: 'Tanah Abang', kecamatan: 'Tanah Abang', kota: 'Jakarta Pusat', province: 'DKI Jakarta', totalDpt: 350 },
    { code: 'TPS-004', name: 'TPS 004 Kemayoran', address: 'Jl. Kemayoran Gempol No. 5', latitude: -6.1567, longitude: 106.8414, kelurahan: 'Kemayoran', kecamatan: 'Kemayoran', kota: 'Jakarta Pusat', province: 'DKI Jakarta', totalDpt: 275 },
    { code: 'TPS-005', name: 'TPS 005 Palmerah', address: 'Jl. Palmerah Barat No. 17', latitude: -6.1861, longitude: 106.7989, kelurahan: 'Palmerah', kecamatan: 'Palmerah', kota: 'Jakarta Barat', province: 'DKI Jakarta', totalDpt: 298 },
  ]

  const tpsIds: Record<string, string> = {}
  for (const t of tpsData) {
    const tps = await db.tPS.upsert({
      where: { code: t.code },
      create: t,
      update: t,
    })
    tpsIds[t.code] = tps.id
    console.log(`  ✓ TPS ${t.code} - ${t.name}`)
  }

  // ===== 4. Create TPS Assignments =====
  const assignments = [
    { userEmail: 'saksi@demo.com', tpsCode: 'TPS-001' },
    { userEmail: 'budi@saksi.com', tpsCode: 'TPS-002' },
    { userEmail: 'siti@saksi.com', tpsCode: 'TPS-003' },
  ]

  for (const a of assignments) {
    const userId = userIds[a.userEmail]
    const tpsId = tpsIds[a.tpsCode]
    if (!userId || !tpsId) continue

    await db.tPSAssignment.upsert({
      where: { userId_tpsId: { userId, tpsId } },
      create: {
        userId,
        tpsId,
        assignedBy: userIds['admin@demo.com'],
      },
      update: { status: 'ACTIVE' },
    })
    console.log(`  ✓ Assignment: ${a.userEmail} → ${a.tpsCode}`)
  }

  // ===== 5. Create Check-ins =====
  const now = new Date()
  const checkIns = [
    { userEmail: 'saksi@demo.com', tpsCode: 'TPS-001', type: 'MORNING' as const, time: new Date(now.getTime() - 4 * 3600000) },
    { userEmail: 'budi@saksi.com', tpsCode: 'TPS-002', type: 'MORNING' as const, time: new Date(now.getTime() - 3.5 * 3600000) },
    { userEmail: 'siti@saksi.com', tpsCode: 'TPS-003', type: 'MORNING' as const, time: new Date(now.getTime() - 4 * 3600000) },
    { userEmail: 'saksi@demo.com', tpsCode: 'TPS-001', type: 'FINAL' as const, time: new Date(now.getTime() - 1 * 3600000) },
    { userEmail: 'budi@saksi.com', tpsCode: 'TPS-002', type: 'FINAL' as const, time: new Date(now.getTime() - 0.5 * 3600000) },
  ]

  for (const ci of checkIns) {
    const userId = userIds[ci.userEmail]
    const tps = tpsData.find(t => t.code === ci.tpsCode)
    if (!userId || !tps) continue

    await db.checkIn.create({
      data: {
        userId,
        tpsId: tpsIds[ci.tpsCode],
        type: ci.type,
        selfiePhoto: `/uploads/selfie_${ci.userEmail}_${ci.type.toLowerCase()}.jpg`,
        latitude: tps.latitude + (Math.random() - 0.5) * 0.0003,
        longitude: tps.longitude + (Math.random() - 0.5) * 0.0003,
        gpsVerified: true,
        distance: Math.round(Math.random() * 30 + 5),
        timestamp: ci.time,
      },
    })
    console.log(`  ✓ Check-in: ${ci.userEmail} ${ci.type} at ${ci.tpsCode}`)
  }

  // ===== 6. Create Vote Inputs =====
  const voteInputs = [
    { userEmail: 'saksi@demo.com', tpsCode: 'TPS-001', c1: 85, c2: 72, c3: 45, invalid: 8 },
    { userEmail: 'budi@saksi.com', tpsCode: 'TPS-002', c1: 92, c2: 68, c3: 51, invalid: 5 },
    { userEmail: 'siti@saksi.com', tpsCode: 'TPS-003', c1: 78, c2: 88, c3: 42, invalid: 12 },
  ]

  for (const vi of voteInputs) {
    const userId = userIds[vi.userEmail]
    if (!userId) continue

    const totalValid = vi.c1 + vi.c2 + vi.c3
    await db.voteInput.upsert({
      where: { id: `${userId}_${tpsIds[vi.tpsCode]}` },
      create: {
        id: `${userId}_${tpsIds[vi.tpsCode]}`,
        userId,
        tpsId: tpsIds[vi.tpsCode],
        candidate1Votes: vi.c1,
        candidate2Votes: vi.c2,
        candidate3Votes: vi.c3,
        totalValidVotes: totalValid,
        totalInvalidVotes: vi.invalid,
        totalVotes: totalValid + vi.invalid,
        c1Photo: `/uploads/c1_${vi.userEmail}.jpg`,
        c1Verified: true,
      },
      update: {
        candidate1Votes: vi.c1,
        candidate2Votes: vi.c2,
        candidate3Votes: vi.c3,
        totalValidVotes: totalValid,
        totalInvalidVotes: vi.invalid,
        totalVotes: totalValid + vi.invalid,
        c1Photo: `/uploads/c1_${vi.userEmail}.jpg`,
        c1Verified: true,
      },
    })
    console.log(`  ✓ Vote input: ${vi.userEmail} (${totalValid + vi.invalid} total votes)`)
  }

  // ===== 7. Create Fraud Reports =====
  const reports = [
    {
      userEmail: 'saksi@demo.com', tpsCode: 'TPS-001',
      title: 'Dugaan Politik Uang di TPS 001',
      description: 'Ditemukan aktivitas pembagian uang kepada pemilih sebelum memasuki bilik suara. Kejadian terjadi sekitar pukul 09:30 WIB.',
      category: 'POLITIK_UANG',
      status: 'PENDING' as const,
    },
    {
      userEmail: 'budi@saksi.com', tpsCode: 'TPS-002',
      title: 'Surat Suara Tidak Sesuai',
      description: 'Terdapat 5 surat suara yang kondisinya sudah tercoblos sebelum diberikan ke pemilih. KPPS telah diminta untuk mendokumentasikan.',
      category: 'PELANGGARAN_PROSEDUR',
      status: 'UNDER_REVIEW' as const,
    },
  ]

  for (const r of reports) {
    const userId = userIds[r.userEmail]
    if (!userId) continue

    await db.fraudReport.create({
      data: {
        userId,
        tpsId: tpsIds[r.tpsCode],
        title: r.title,
        description: r.description,
        category: r.category,
        status: r.status,
      },
    })
    console.log(`  ✓ Report: ${r.title}`)
  }

  // ===== 8. Create Payments =====
  const payments = [
    { userEmail: 'saksi@demo.com', status: 'DISBURSED' as const, c1: true, gps: true, data: true, amount: 150000, disbursedAt: new Date(now.getTime() - 2 * 86400000) },
    { userEmail: 'budi@saksi.com', status: 'APPROVED' as const, c1: true, gps: true, data: true, amount: 150000 },
    { userEmail: 'siti@saksi.com', status: 'READY_FOR_PAYMENT' as const, c1: true, gps: true, data: true, amount: 150000 },
    { userEmail: 'saksi@demo.com', status: 'PENDING' as const, c1: false, gps: true, data: false, amount: 150000 },
  ]

  for (const p of payments) {
    const userId = userIds[p.userEmail]
    if (!userId) continue

    const score = (p.c1 ? 1 : 0) + (p.gps ? 1 : 0) + (p.data ? 1 : 0)
    await db.payment.create({
      data: {
        userId,
        amount: p.amount,
        status: p.status,
        c1Uploaded: p.c1,
        gpsVerified: p.gps,
        dataInputted: p.data,
        validationScore: score,
        ...(p.status === 'APPROVED' || p.status === 'DISBURSED' ? {
          approvedBy: userIds['finance@demo.com'],
          approvedAt: new Date(now.getTime() - 3 * 86400000),
        } : {}),
        ...(p.disbursedAt ? { disbursedAt: p.disbursedAt } : {}),
      },
    })
    console.log(`  ✓ Payment: ${p.userEmail} → ${p.status} (${score}/3 validated)`)
  }

  // ===== 9. Create Audit Logs =====
  const auditLogs = [
    { userId: userIds['admin@demo.com'], action: 'CREATE', entityType: 'TPS', description: 'Created TPS 001' },
    { userId: userIds['admin@demo.com'], action: 'CREATE', entityType: 'TPSAssignment', description: 'Assigned Ahmad Saksi to TPS 001' },
    { userId: userIds['finance@demo.com'], action: 'UPDATE', entityType: 'Payment', description: 'Approved payment for Budi Santoso' },
    { userId: userIds['saksi@demo.com'], action: 'CREATE', entityType: 'CheckIn', description: 'Morning check-in at TPS 001' },
    { userId: userIds['admin@demo.com'], action: 'UPDATE', entityType: 'FraudReport', description: 'Started review of report at TPS 002' },
  ]

  for (const log of auditLogs) {
    await db.auditLog.create({
      data: {
        userId: log.userId,
        action: log.action,
        entityType: log.entityType,
        newValue: log.description,
        ipAddress: '103.xx.xx.xx',
      },
    })
    console.log(`  ✓ Audit: ${log.action} ${log.entityType}`)
  }

  // ===== 10. Create System Configs =====
  const configs = [
    { key: 'base_payment_amount', value: '150000', description: 'Base payment amount per saksi in IDR' },
    { key: 'gps_max_distance', value: '100', description: 'Max GPS distance in meters for check-in verification' },
    { key: 'app_version', value: '5.0.0', description: 'Current application version' },
  ]

  for (const c of configs) {
    await db.systemConfig.upsert({
      where: { key: c.key },
      create: c,
      update: c,
    })
    console.log(`  ✓ Config: ${c.key} = ${c.value}`)
  }

  console.log('\n✅ Seed completed successfully!')
}

seed()
  .catch((err) => {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
