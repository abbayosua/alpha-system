'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useReducedMotion } from 'framer-motion'

export function SplashScreen({ isVisible, onDismiss }: { isVisible: boolean; onDismiss: () => void }) {
  const [progress, setProgress] = useState(0)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!isVisible) return

    // Animate progress bar
    const duration = 1500
    const interval = 20
    const step = 100 / (duration / interval)
    let current = 0

    const timer = setInterval(() => {
      current += step
      if (current >= 100) {
        current = 100
        clearInterval(timer)
        onDismiss()
      }
      setProgress(current)
    }, interval)

    return () => clearInterval(timer)
  }, [isVisible, onDismiss])

  // Respect prefers-reduced-motion: skip animation and dismiss immediately
  useEffect(() => {
    if (prefersReducedMotion && isVisible) {
      const timer = setTimeout(onDismiss, 300)
      return () => clearTimeout(timer)
    }
  }, [prefersReducedMotion, isVisible, onDismiss])

  const shouldAnimate = !prefersReducedMotion

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          initial={shouldAnimate ? { opacity: 1 } : { opacity: 1 }}
          exit={shouldAnimate ? { opacity: 0, scale: 1.05 } : { opacity: 0 }}
          transition={shouldAnimate ? { duration: 0.5, ease: [0.22, 1, 0.36, 1] } : { duration: 0.15 }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900" />

          {/* Animated decorative orbs */}
          {!prefersReducedMotion && (
            <>
              <motion.div
                className="absolute w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl"
                animate={{ x: [0, 60, -30, 0], y: [0, -40, 30, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                style={{ top: '5%', left: '5%' }}
              />
              <motion.div
                className="absolute w-72 h-72 rounded-full bg-teal-500/10 blur-3xl"
                animate={{ x: [0, -40, 30, 0], y: [0, 30, -40, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                style={{ bottom: '10%', right: '10%' }}
              />
              <motion.div
                className="absolute w-56 h-56 rounded-full bg-amber-500/5 blur-3xl"
                animate={{ x: [0, 25, -15, 0], y: [0, -20, 35, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                style={{ bottom: '30%', left: '35%' }}
              />
            </>
          )}

          {/* Dot grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Logo */}
            <motion.div
              className="relative"
              initial={shouldAnimate ? { scale: 0.5, opacity: 0 } : { scale: 1, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Glow ring */}
              {!prefersReducedMotion && (
                <motion.div
                  className="absolute -inset-4 rounded-full bg-emerald-400/20 blur-xl"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-500/20 ring-2 ring-white/10">
                <Image
                  src="/logo.png"
                  alt="Alpha System v5"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </motion.div>

            {/* App name */}
            <motion.div
              className="text-center space-y-2"
              initial={shouldAnimate ? { opacity: 0, y: 15 } : { opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: shouldAnimate ? 0.2 : 0, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Alpha System{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  v5
                </span>
              </h1>
              <p className="text-sm text-emerald-200/60 font-medium tracking-wide">
                Comprehensive Management System
              </p>
            </motion.div>

            {/* Loading indicator */}
            <motion.div
              className="w-48 space-y-3 mt-2"
              initial={shouldAnimate ? { opacity: 0 } : { opacity: 1 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: shouldAnimate ? 0.4 : 0 }}
            >
              {/* Progress bar track */}
              <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-300"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              </div>

              {/* Animated dots text */}
              <div className="flex justify-center">
                <motion.p
                  className="text-xs text-emerald-300/50 font-medium"
                  animate={shouldAnimate ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.7 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Memuat sistem
                </motion.p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
