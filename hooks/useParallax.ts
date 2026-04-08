'use client'

import { useState, useEffect, useRef } from 'react'

interface ParallaxOptions {
  depth?: number
  maxShift?: number
  smoothing?: number
}

interface ParallaxValues {
  x: number
  y: number
  rotateX: number
  rotateY: number
}

export function useParallax({
  depth = 0.5,
  maxShift = 18,
  smoothing = 0.08,
}: ParallaxOptions = {}): ParallaxValues {
  const [values, setValues] = useState<ParallaxValues>({ x: 0, y: 0, rotateX: 0, rotateY: 0 })
  const target = useRef({ x: 0, y: 0 })
  const current = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number | null>(null)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true

    const handleMouseMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2
      const cy = window.innerHeight / 2
      target.current.x = ((e.clientX - cx) / cx) * maxShift * depth
      target.current.y = ((e.clientY - cy) / cy) * maxShift * depth
    }

    const animate = () => {
      if (!isMounted.current) return
      current.current.x += (target.current.x - current.current.x) * smoothing
      current.current.y += (target.current.y - current.current.y) * smoothing

      setValues({
        x: current.current.x,
        y: current.current.y,
        rotateX: -(current.current.y / maxShift) * 2 * depth,
        rotateY: (current.current.x / maxShift) * 2 * depth,
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    rafRef.current = requestAnimationFrame(animate)

    return () => {
      isMounted.current = false
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [depth, maxShift, smoothing])

  return values
}

export function useParallaxTransform(depth: number = 0.5) {
  const { x, y } = useParallax({ depth, smoothing: 0.06 })
  return `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`
}
