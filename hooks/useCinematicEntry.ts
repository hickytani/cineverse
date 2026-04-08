'use client'

import { useMemo } from 'react'
import type { Variants } from 'framer-motion'

interface EntryOptions {
  layers?: number
  baseDelay?: number
  stagger?: number
}

interface CinematicEntry {
  delay: (index: number) => number
  containerVariants: Variants
  itemVariants: Variants
}

export function useCinematicEntry({
  baseDelay = 300,
  stagger = 160,
}: EntryOptions = {}): CinematicEntry {
  return useMemo(() => ({
    delay: (index: number) => (baseDelay + index * stagger) / 1000,

    containerVariants: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: stagger / 1000,
          delayChildren: baseDelay / 1000,
        },
      },
    },

    itemVariants: {
      hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
      visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
          duration: 0.9,
          ease: [0.16, 1, 0.3, 1],
        },
      },
    },
  }), [baseDelay, stagger])
}
