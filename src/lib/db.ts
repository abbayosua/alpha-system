import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Direct connection URL for Supabase (no pooler) - required for Prisma prepared statements
const DATABASE_URL = 'postgresql://postgres.wwekdhlzsyhqkgapiszl:890iop*()IOP@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres'

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
