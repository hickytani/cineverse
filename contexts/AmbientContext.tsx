'use client'

/**
 * AmbientContext — The emotional state engine for CineVerse.
 * 
 * Maintains "mood" based on:
 * - Time of day
 * - Idle vs. active state
 * - Interaction intensity
 * 
 * The system "breathes" via breathingPhase.
 */

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import type { ReactNode } from 'react'

type AmbientTone = 'night' | 'dusk' | 'golden' | 'daylight'
type PresenceState = 'entering' | 'present' | 'idle' | 'deep_idle'

interface AmbientState {
  tone: AmbientTone
  presence: PresenceState
  intensity: number         // 0-1: interaction density
  brightness: number        // 0-1: environmental brightness
  breathingPhase: number    // 0-1: ambient breathing cycle
  isFirstVisit: boolean
}

const AmbientContext = createContext<AmbientState>({
  tone: 'night',
  presence: 'entering',
  intensity: 0,
  brightness: 0.5,
  breathingPhase: 0,
  isFirstVisit: true,
})

export function AmbientProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AmbientState>({
    tone: 'night',
    presence: 'entering',
    intensity: 0,
    brightness: 0.5,
    breathingPhase: 0,
    isFirstVisit: true,
  })

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deepIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intensityDecayRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const breathingRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initialize tone and brightness
  useEffect(() => {
    setState(s => ({
      ...s,
      tone: getTimeOfDayTone(),
      brightness: getTimeBasedBrightness(),
    }))
  }, [])

  // Entry sequence
  useEffect(() => {
    const entryTimer = setTimeout(() => {
      setState(s => ({ ...s, presence: 'present', isFirstVisit: false }))
    }, 2400)
    return () => clearTimeout(entryTimer)
  }, [])

  // Breathing cycle
  useEffect(() => {
    let phase = 0
    let direction = 1
    const tick = () => {
      phase += 0.005 * direction
      if (phase >= 1) { phase = 1; direction = -1 }
      if (phase <= 0) { phase = 0; direction = 1 }
      setState(s => ({ ...s, breathingPhase: phase }))
      breathingRef.current = setTimeout(tick, 50)
    }
    breathingRef.current = setTimeout(tick, 50)
    return () => { if (breathingRef.current) clearTimeout(breathingRef.current) }
  }, [])

  const registerInteraction = useCallback(() => {
    // Reset idle timers
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    if (deepIdleTimerRef.current) clearTimeout(deepIdleTimerRef.current)

    // Update intensity
    setState(s => ({
      ...s,
      presence: 'present',
      intensity: Math.min(1, s.intensity + 0.15),
    }))

    // Decay intensity
    if (intensityDecayRef.current) clearTimeout(intensityDecayRef.current)
    const decayIntensity = () => {
      setState(s => {
        if (s.intensity <= 0) return s
        const next = Math.max(0, s.intensity - 0.03)
        if (next > 0) intensityDecayRef.current = setTimeout(decayIntensity, 200)
        return { ...s, intensity: next }
      })
    }
    intensityDecayRef.current = setTimeout(decayIntensity, 1500)

    // Idle detection
    idleTimerRef.current = setTimeout(() => {
      setState(s => ({ ...s, presence: 'idle' }))
    }, 12000)

    deepIdleTimerRef.current = setTimeout(() => {
      setState(s => ({ ...s, presence: 'deep_idle' }))
    }, 40000)
  }, [])

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart']
    const throttled = throttle(registerInteraction, 300)
    events.forEach(e => window.addEventListener(e, throttled, { passive: true }))
    return () => events.forEach(e => window.removeEventListener(e, throttled))
  }, [registerInteraction])

  return (
    <AmbientContext.Provider value={state}>
      {children}
    </AmbientContext.Provider>
  )
}

export const useAmbient = () => useContext(AmbientContext)

// ── Helpers ──

function getTimeOfDayTone(): AmbientTone {
  const hour = new Date().getHours()
  if (hour >= 22 || hour < 5) return 'night'
  if (hour < 7 || hour >= 19) return 'dusk'
  if (hour >= 16) return 'golden'
  return 'daylight'
}

function getTimeBasedBrightness(): number {
  const hour = new Date().getHours()
  if (hour >= 22 || hour < 5) return 0.15
  if (hour < 7 || hour >= 19) return 0.3
  if (hour >= 16) return 0.45
  return 0.55
}

function throttle<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let last = 0
  return ((...args: unknown[]) => {
    const now = Date.now()
    if (now - last >= ms) { last = now; fn(...args) }
  }) as unknown as T
}
