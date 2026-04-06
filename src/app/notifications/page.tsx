'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function NotificationsRedirectPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    const role = user.role
    if (role === 'ADMIN_KEUANGAN') {
      router.replace('/keuangan/notifications')
    } else if (role === 'ADMIN') {
      router.replace('/admin/notifications')
    } else {
      router.replace('/saksi/notifications')
    }
  }, [user, router])

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
    </div>
  )
}
