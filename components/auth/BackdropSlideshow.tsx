'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import { movieApi } from '@/lib/api'
import type { MediaItem } from '@/types'

/**
 * BackdropSlideshow — the left panel of auth pages.
 * Crossfades between TMDB trending movie backdrops every 5 seconds.
 * Shows floating poster cards drifting upward.
 */
export function BackdropSlideshow() {
  const [movies, setMovies] = useState<MediaItem[]>([])
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    movieApi.getTrending('week').then(res => {
      const m = (res.movies || []).filter((m: MediaItem) => m.backdropPath && m.posterPath).slice(0, 10)
      setMovies(m)
    }).catch(() => {})
  }, [])

  // Crossfade every 5s
  useEffect(() => {
    if (movies.length < 2) return
    const t = setInterval(() => setActiveIdx(i => (i + 1) % movies.length), 5000)
    return () => clearInterval(t)
  }, [movies.length])

  const current = movies[activeIdx]
  // Pick 3 floating posters (different from active)
  const floatPosters = movies.filter((_, i) => i !== activeIdx).slice(0, 3)

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Backdrops — crossfade */}
      <AnimatePresence mode="sync">
        {current?.backdropPath && (
          <motion.div
            key={`bd-${activeIdx}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={current.backdropPath}
              alt=""
              fill
              className="object-cover"
              style={{ filter: 'brightness(0.35) saturate(0.6)' }}
              priority
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-gradient-to-r from-void/60 via-transparent to-void/10" />

      {/* Floating poster cards */}
      {floatPosters.map((movie, i) => {
        const rotations = [-4, 2, -2]
        const lefts = ['12%', '35%', '60%']
        const delays = [0, 8, 16]
        return (
          <div
            key={movie._id}
            className="absolute bottom-0"
            style={{
              left: lefts[i],
              ['--rotate' as string]: `${rotations[i]}deg`,
              animation: `drift ${28 + i * 4}s linear ${delays[i]}s infinite`,
              width: '90px',
            }}
          >
            <div
              style={{ transform: `rotate(${rotations[i]}deg)` }}
              className="rounded-lg overflow-hidden shadow-2xl border border-white/10"
            >
              {movie.posterPath && (
                <div className="relative aspect-[2/3]">
                  <Image
                    src={movie.posterPath}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="90px"
                  />
                </div>
              )}
              <div className="bg-void/90 backdrop-blur-sm px-2 py-1.5">
                <p className="text-[9px] text-cv-text font-medium line-clamp-1">{movie.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="w-2 h-2 text-gold fill-gold" strokeWidth={0} />
                  <span className="font-mono text-[8px] text-gold">{movie.tmdbRating?.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Now showing — bottom of left panel */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={`title-${activeIdx}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-10 left-10 right-10 z-10"
          >
            <p className="text-[9px] uppercase tracking-[0.25em] text-gold/70 mb-2">Now Showing</p>
            <h2
              className="font-display text-5xl font-light leading-tight text-gold"
              style={{ textShadow: '0 2px 20px rgba(201,168,76,0.3)' }}
            >
              {current.title}
            </h2>
            {current.genres && (
              <p className="text-cv-secondary text-xs mt-2">
                {current.genres.slice(0, 3).join('  ·  ')}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      {movies.length > 1 && (
        <div className="absolute bottom-10 right-10 flex gap-1.5">
          {movies.slice(0, 8).map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={`rounded-full transition-all duration-500 ${
                i === activeIdx ? 'w-5 h-1 bg-gold' : 'w-1 h-1 bg-white/25'
              }`}
            />
          ))}
        </div>
      )}

      {/* Gold separator line */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gold/30 to-transparent" />
    </div>
  )
}
