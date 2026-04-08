'use client'

import { useEffect, useRef } from 'react'
import { useAmbient } from '@/contexts/AmbientContext'

export function CursorSpotlight() {
  const { presence, intensity, tone } = useAmbient()
  const spotlightRef = useRef<HTMLDivElement>(null)
  const pos = useRef({ x: -400, y: -400 })
  const current = useRef({ x: -400, y: -400 })
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMove, { passive: true })

    const animate = () => {
      current.current.x += (pos.current.x - current.current.x) * 0.05
      current.current.y += (pos.current.y - current.current.y) * 0.05

      if (spotlightRef.current) {
        spotlightRef.current.style.transform =
          `translate(${current.current.x - 300}px, ${current.current.y - 300}px)`
      }
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const spotlightColors: Record<string, string> = {
    night:    'rgba(100, 80, 150, 0.04)',
    dusk:     'rgba(150, 80, 60, 0.04)',
    golden:   'rgba(198, 169, 107, 0.06)',
    daylight: 'rgba(80, 100, 180, 0.03)',
  }

  const isIdle = presence === 'idle' || presence === 'deep_idle'

  return (
    <div
      className="fixed inset-0 z-[5] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      <div
        ref={spotlightRef}
        style={{
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: `radial-gradient(circle at center, ${spotlightColors[tone] ?? 'rgba(198,169,107,0.04)'} 0%, transparent 70%)`,
          opacity: isIdle ? 0.4 : 0.7 + intensity * 0.3,
          transition: 'opacity 3s ease',
          willChange: 'transform',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />
    </div>
  )
}
