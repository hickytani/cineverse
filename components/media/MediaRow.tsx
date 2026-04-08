'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { MediaCard } from './MediaCard'
import { useCinematicEntry } from '@/hooks/useCinematicEntry'
import type { MediaItem } from '@/types'

interface MediaRowProps {
  label: string
  title: string
  emoji?: string
  fetchFn: () => Promise<unknown>
  viewAllHref?: string
  variant?: 'poster' | 'landscape'
}

export function MediaRow({
  label,
  title,
  emoji,
  fetchFn,
  viewAllHref,
  variant = 'poster',
}: MediaRowProps) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const { containerVariants, itemVariants } = useCinematicEntry({ stagger: 120 })

  useEffect(() => {
    let cancelled = false
    fetchFn()
      .then(res => {
        if (cancelled) return
        const r = res as Record<string, unknown>
        const raw = (r.results || r.movies || []) as MediaItem[]
        setItems(raw.slice(0, 12))
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [fetchFn])

  if (!loading && items.length === 0) return null

  const cardCount = variant === 'landscape' ? 6 : 8

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="mb-12"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-end justify-between mb-5 px-6 md:px-10">
        <div className="flex items-center gap-2.5">
          {emoji && <span className="text-lg">{emoji}</span>}
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-cv-muted font-medium mb-1 line-clamp-1">{label}</p>
            <h2 className="font-display text-2xl md:text-3xl font-light text-cv-text leading-none">{title}</h2>
          </div>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="group hidden md:flex items-center gap-1.5 text-xs text-gold hover:text-gold-bright transition-colors duration-200"
          >
            View All
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" strokeWidth={1.5} />
          </Link>
        )}
      </motion.div>

      {/* Divider */}
      <motion.div variants={itemVariants} className="h-px bg-border-subtle mx-6 md:mx-10 mb-5" />

      {/* Scroll track */}
      {loading ? (
        <div className="flex gap-4 px-6 md:px-10 overflow-hidden">
          {[...Array(cardCount)].map((_, i) => (
            <div
              key={i}
              className={`shrink-0 skeleton rounded-lg ${variant === 'landscape' ? 'w-72 aspect-video' : 'w-36 md:w-44 aspect-[2/3]'}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            />
          ))}
        </div>
      ) : (
        <motion.div
          ref={scrollRef}
          variants={containerVariants}
          className="flex gap-4 px-6 md:px-10 overflow-x-auto no-scrollbar pb-2"
        >
          {items.map((item, i) => {
            // Cast through unknown to safely read raw TMDB snake_case fields
            const r = item as unknown as Record<string, unknown>
            const tmdbId = r.id as number | undefined
            const posterPath = (r.poster_path || r.posterPath || '') as string
            const backdropPath = (r.backdrop_path || r.backdropPath || '') as string
            const relDate = (r.release_date || r.releaseDate || '') as string
            return (
              <MediaCard
                key={item._id || String(tmdbId) || String(i)}
                item={{
                  id: item._id || String(tmdbId) || String(i),
                  title: item.title || (r.name as string) || '',
                  posterUrl: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : undefined,
                  backdropUrl: backdropPath ? `https://image.tmdb.org/t/p/w1280${backdropPath}` : undefined,
                  releaseYear: relDate ? new Date(relDate).getFullYear() : (item.releaseYear),
                  rating: (r.vote_average as number) || item.tmdbRating || undefined,
                  link: `/movie/${item._id || tmdbId || i}`,
                }}
                variant={variant}
                index={i}
              />
            )
          })}
        </motion.div>
      )}
    </motion.section>
  )
}
