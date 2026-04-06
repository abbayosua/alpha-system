'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { SplashScreen } from '@/components/common/SplashScreen'

const SPLASH_SESSION_KEY = 'alpha-system-splash-shown'

function getInitialSplashState(): { showSplash: boolean; isReady: boolean } {
  // Read sessionStorage synchronously during mount (client-only)
  if (typeof window === 'undefined') {
    return { showSplash: true, isReady: false }
  }
  try {
    const alreadyShown = sessionStorage.getItem(SPLASH_SESSION_KEY)
    return alreadyShown
      ? { showSplash: false, isReady: true }
      : { showSplash: true, isReady: false }
  } catch {
    return { showSplash: true, isReady: false }
  }
}

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(getInitialSplashState)
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleDismiss = useCallback(() => {
    setState((prev) => ({ ...prev, showSplash: false }))
    try {
      sessionStorage.setItem(SPLASH_SESSION_KEY, 'true')
    } catch {
      // ignore
    }
    // Small delay for crossfade
    dismissTimerRef.current = setTimeout(() => {
      setState((prev) => ({ ...prev, isReady: true }))
    }, 500)
  }, [])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current)
      }
    }
  }, [])

  return (
    <>
      <SplashScreen isVisible={state.showSplash} onDismiss={handleDismiss} />
      <div
        style={{
          opacity: state.isReady ? 1 : 0,
          transition: 'opacity 0.5s ease',
          pointerEvents: state.isReady ? 'auto' : 'none',
        }}
      >
        {children}
      </div>
    </>
  )
}
