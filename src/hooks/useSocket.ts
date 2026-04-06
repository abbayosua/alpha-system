'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

export interface SocketNotification {
  type: string
  data: Record<string, unknown>
  timestamp: string
  from?: string
  userId?: string
  role?: string
}

interface UseSocketReturn {
  isConnected: boolean
  lastNotification: SocketNotification | null
  notificationCount: number
  joinRoom: (room: string) => void
  sendNotification: (type: string, data: Record<string, unknown>, targetRoom?: string) => void
}

const MAX_RECONNECT_DELAY = 30000 // 30s max backoff
const BASE_DELAY = 1000 // 1s base

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [isConnected, setIsConnected] = useState(false)
  const [lastNotification, setLastNotification] = useState<SocketNotification | null>(null)
  const [notificationCount, setNotificationCount] = useState(0)

  const joinRoom = useCallback((room: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join-room', room)
    }
  }, [])

  const sendNotification = useCallback((type: string, data: Record<string, unknown>, targetRoom?: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send-notification', { type, data, targetRoom })
    }
  }, [])

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    // Exponential backoff reconnection (defined inline to avoid hoisting issues)
    const scheduleReconnect = () => {
      if (reconnectTimerRef.current) return // Already scheduled

      const attempt = reconnectAttemptsRef.current
      const delay = Math.min(BASE_DELAY * Math.pow(2, attempt) + Math.random() * 1000, MAX_RECONNECT_DELAY)
      reconnectAttemptsRef.current = attempt + 1

      console.log(`[Socket] Reconnecting in ${Math.round(delay / 1000)}s (attempt ${reconnectAttemptsRef.current})`)

      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null
        if (socketRef.current && !socketRef.current.connected) {
          socketRef.current.connect()
        }
      }, delay)
    }

    const socket = io('/?XTransformPort=3004', {
      transports: ['websocket', 'polling'],
      reconnection: false, // We handle reconnection ourselves
      timeout: 10000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id)
      setIsConnected(true)
      reconnectAttemptsRef.current = 0 // Reset on successful connection
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
    })

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
      setIsConnected(false)
      // Only attempt reconnect if it's not a deliberate disconnect
      if (reason !== 'io server disconnect') {
        scheduleReconnect()
      }
    })

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message)
      setIsConnected(false)
      scheduleReconnect()
    })

    // Listen for notifications
    socket.on('notification', (notification: SocketNotification) => {
      setLastNotification(notification)
      setNotificationCount((prev) => prev + 1)
      console.log('[Socket] Notification received:', notification.type)
    })

    socket.on('init', (data) => {
      console.log('[Socket] Init:', data.message)
    })

    socket.on('room-joined', (data) => {
      console.log('[Socket] Room joined:', data.room)
    })

    socket.on('joined', (data) => {
      console.log('[Socket] Joined:', data.room)
    })

    // Initial connection
    socket.connect()

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
      }
      socket.disconnect()
      socketRef.current = null
      setIsConnected(false)
    }
  }, [joinRoom, sendNotification])

  return {
    isConnected,
    lastNotification,
    notificationCount,
    joinRoom,
    sendNotification,
  }
}
