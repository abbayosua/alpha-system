'use client'

import { createContext, useContext, useEffect, useCallback, useRef, useState, type ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useSocket, type SocketNotification } from '@/hooks/useSocket'
import { toast } from 'sonner'
import { Wifi, WifiOff } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SocketContextType {
  isConnected: boolean
  lastNotification: SocketNotification | null
  notificationCount: number
  joinRoom: (room: string) => void
  sendNotification: (type: string, data: Record<string, unknown>, targetRoom?: string) => void
}

const SocketContext = createContext<SocketContextType | null>(null)

export function useSocketContext() {
  const ctx = useContext(SocketContext)
  if (!ctx) {
    // Return a no-op context if not wrapped
    return {
      isConnected: false,
      lastNotification: null,
      notificationCount: 0,
      joinRoom: () => {},
      sendNotification: () => {},
    }
  }
  return ctx
}

// Map event types to toast styling
const eventToastConfig: Record<string, { title: string; icon?: string; description?: string }> = {
  new_report: { title: 'Laporan Baru', description: 'Laporan baru telah diterima' },
  payment_update: { title: 'Update Pembayaran', description: 'Status pembayaran diperbarui' },
  check_in: { title: 'Check-in Baru', description: 'Saksi berhasil check-in' },
  new_user: { title: 'Pengguna Baru', description: 'Pengguna baru terdaftar' },
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const { isConnected, lastNotification, notificationCount, joinRoom, sendNotification } = useSocket()
  const user = useAuthStore((s) => s.user)
  const previousNotificationRef = useRef<SocketNotification | null>(null)

  // Auto-join role room when user is authenticated and socket is connected
  useEffect(() => {
    if (!isConnected || !user?.role) return

    let roleRoom = 'saksi'
    if (user.role === 'ADMIN') roleRoom = 'admin'
    else if (user.role === 'ADMIN_KEUANGAN') roleRoom = 'keuangan'
    else roleRoom = 'saksi'

    joinRoom(roleRoom)

    // Also join user-specific room
    if (user.id) {
      const { socket } = useSocket as any
      // join:user is handled by the hook internally, we use join-room for the role
    }
  }, [isConnected, user?.role, user?.id, joinRoom])

  // Show toast notification for new real-time events
  useEffect(() => {
    if (!lastNotification) return
    // Avoid re-showing the same notification
    if (previousNotificationRef.current?.timestamp === lastNotification.timestamp) return
    previousNotificationRef.current = lastNotification

    const config = eventToastConfig[lastNotification.type]
    const message = (lastNotification.data?.message as string) || config?.description || 'Notifikasi baru'

    // Don't show toast for simulated notifications silently if too many
    const isSimulated = lastNotification.data?.simulated

    toast[config ? 'info' : 'info'](config?.title || 'Notifikasi', {
      description: message,
      icon: isSimulated ? undefined : undefined,
      duration: 4000,
    })
  }, [lastNotification])

  const contextValue = {
    isConnected,
    lastNotification,
    notificationCount,
    joinRoom,
    sendNotification,
  }

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
      {/* Connection Status Indicator */}
      <ConnectionStatusIndicator isConnected={isConnected} />
    </SocketContext.Provider>
  )
}

function ConnectionStatusIndicator({ isConnected }: { isConnected: boolean }) {
  return (
    <AnimatePresence>
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: -10, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-rose-500 px-3 py-2 text-white shadow-lg text-xs font-medium"
        >
          <WifiOff className="h-3.5 w-3.5" />
          <span>Realtime terputus</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
