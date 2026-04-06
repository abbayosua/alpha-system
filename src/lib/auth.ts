import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import type { UserProfile } from '@/types'

/**
 * Get the current Supabase session from server-side cookies.
 * Returns the session object or null if not authenticated.
 */
export async function getSession() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

/**
 * Get the current authenticated user along with their profile from the database.
 * Returns null if not authenticated or profile not found.
 */
export async function getCurrentUser(): Promise<{
  user: { id: string; email: string }
  profile: UserProfile
} | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const profile = await db.profile.findUnique({
    where: { id: user.id },
  })

  if (!profile) return null

  return {
    user: {
      id: user.id,
      email: user.email ?? '',
    },
    profile: {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      phone: profile.phone,
      ktpNumber: profile.ktpNumber,
      ktpPhoto: profile.ktpPhoto,
      bankName: profile.bankName,
      bankAccount: profile.bankAccount,
      bankHolderName: profile.bankHolderName,
      eWalletType: profile.eWalletType,
      eWalletNumber: profile.eWalletNumber,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString(),
    },
  }
}

/**
 * Require authentication with optional role check.
 * Throws a redirect or returns null if requirements are not met.
 * Use this in server components and API routes to protect resources.
 */
export async function requireAuth(
  requiredRole?: 'SAKSI' | 'ADMIN' | 'ADMIN_KEUANGAN'
): Promise<{
  user: { id: string; email: string }
  profile: UserProfile
} | null> {
  const result = await getCurrentUser()

  if (!result) return null

  if (requiredRole && result.profile.role !== requiredRole) {
    return null
  }

  return result
}
