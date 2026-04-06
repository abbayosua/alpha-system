import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Supabase session mode pooler (port 5432) supports prepared statements.
// Port 6543 (transaction mode) does NOT support prepared statements.
const DATABASE_URL = 'postgresql://postgres.wwekdhlzsyhqkgapiszl:890iop*()IOP@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'

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
