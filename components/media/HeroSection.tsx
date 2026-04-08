'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Plus, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { tmdbApi, backdrop } from '@/lib/external'
import { useCinematicEntry } from '@/hooks/useCinematicEntry'
import { gsap } from 'gsap'
import type { MediaItem } from '@/types'

export function HeroSection() {
  const [films, setFilms] = useState<MediaItem[]>([])
  const [idx, setIdx] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const { containerVariants, itemVariants } = useCinematicEntry({ baseDelay: 600 })

  useEffect(() => {
    tmdbApi.trending('week').then(res => {
      const r = res as Record<string, unknown>
      const results = (r.results || []) as any[]
      const m = results.filter(it => it.backdrop_path).slice(0, 6).map(it => ({
        _id: String(it.id),
        title: it.title || it.name || '',
        backdropPath: backdrop(it.backdrop_path),
        posterPath: it.poster_path ? `https://image.tmdb.org/t/p/w500${it.poster_path}` : undefined,
        releaseYear: it.release_date ? new Date(it.release_date).getFullYear() : undefined,
        tmdbRating: it.vote_average,
        voteCount: it.vote_count,
        tagline: it.tagline,
        overview: it.overview,
      }))
      setFilms(m as any)
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  // GSAP Title Reveal
  useEffect(() => {
    if (loaded && film) {
      gsap.fromTo('.hero-title-reveal',
        { opacity: 0, y: 30, skewY: 2 },
        { opacity: 1, y: 0, skewY: 0, duration: 1.2, ease: 'power4.out', delay: 0.8 }
      )
    }
  }, [idx, loaded])

  // Auto-advance every 10s
  useEffect(() => {
    if (films.length < 2) return
    const t = setInterval(() => setIdx(i => (i + 1) % films.length), 10000)
    return () => clearInterval(t)
  }, [films.length])

  const film = films[idx]
  const prev = () => setIdx(i => (i - 1 + films.length) % films.length)
  const next = () => setIdx(i => (i + 1) % films.length)

  return (
    <section className="relative h-screen min-h-[600px] max-h-[1000px] flex items-end overflow-hidden">

      {/* Backdrops */}
      <AnimatePresence mode="sync">
        {film?.backdropPath && (
          <motion.div
            key={`hero-${idx}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={film.backdropPath}
              alt=""
              fill
              className="object-cover"
              style={{ filter: 'brightness(0.5) saturate(0.75)' }}
              priority
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skeleton while loading */}
      {!loaded && (
        <div className="absolute inset-0 skeleton" />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-gradient-to-r from-void/80 via-transparent to-transparent" />

      {/* Nav arrows */}
      {films.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-void/50 border border-border-subtle backdrop-blur-sm flex items-center justify-center text-cv-secondary hover:text-cv-text hover:border-border-default transition-colors"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-void/50 border border-border-subtle backdrop-blur-sm flex items-center justify-center text-cv-secondary hover:text-cv-text hover:border-border-default transition-colors"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {film && (
          <motion.div
            key={`content-${idx}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="relative z-10 w-full max-w-4xl px-6 md:px-10 pb-16 md:pb-24"
          >
            {/* Genre pills */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-5">
              {film.genres?.slice(0, 3).map(g => (
                <span
                  key={g}
                  className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-border-subtle text-cv-secondary"
                >
                  {g}
                </span>
              ))}
              {film.releaseYear && (
                <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border border-border-subtle text-cv-secondary">
                  {film.releaseYear}
                </span>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={itemVariants}
              className="hero-title-reveal font-display text-5xl md:text-7xl lg:text-9xl font-light leading-[0.9] tracking-[-0.03em] text-text-1 mb-6"
              style={{ textShadow: '0 10px 40px rgba(0,0,0,0.8)' }}
            >
              {film.title}
            </motion.h1>

            {/* Tagline */}
            {film.tagline && (
              <motion.p variants={itemVariants} className="font-display text-xl md:text-2xl italic text-gold/70 mb-5 font-light">
                {film.tagline}
              </motion.p>
            )}

            {/* Synopsis */}
            {film.overview && (
              <motion.p variants={itemVariants} className="text-cv-secondary text-sm leading-relaxed mb-6 max-w-xl line-clamp-2">
                {film.overview}
              </motion.p>
            )}

            {/* Rating */}
            {(film.tmdbRating ?? 0) > 0 && (
              <motion.div variants={itemVariants} className="flex items-center gap-2 mb-8">
                <Star className="w-4 h-4 text-gold fill-gold" strokeWidth={0} />
                <span className="font-mono text-gold text-lg">{film.tmdbRating!.toFixed(1)}</span>
                <span className="text-cv-muted text-xs">/ 10</span>
                {film.voteCount && (
                  <span className="text-cv-muted text-xs">from {film.voteCount.toLocaleString()} ratings</span>
                )}
              </motion.div>
            )}

            {/* Actions */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
              {film.trailerKey && (
                <a
                  href={`https://www.youtube.com/watch?v=${film.trailerKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-6 py-3 bg-gradient-gold text-void text-[11px] font-medium tracking-wider uppercase rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Play className="w-3.5 h-3.5" strokeWidth={2} fill="currentColor" />
                  Watch Trailer
                </a>
              )}
              <Link
                href={`/movie/${film._id}`}
                className="flex items-center gap-2.5 px-6 py-3 bg-elevated border border-border-default text-cv-secondary text-[11px] font-medium tracking-wider uppercase rounded-lg hover:text-cv-text hover:border-border-gold transition-colors"
              >
                Explore
              </Link>
              <button className="w-11 h-11 flex items-center justify-center rounded-lg bg-elevated border border-border-default text-cv-secondary hover:text-gold hover:border-border-gold transition-colors">
                <Plus className="w-4.5 h-4.5" strokeWidth={1.5} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dots */}
      {films.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {films.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`rounded-full transition-all duration-500 ${
                i === idx ? 'w-6 h-1 bg-gold' : 'w-1 h-1 bg-white/25 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      )}

      {/* Scroll hint */}
      <div className="absolute bottom-4 right-8 text-[9px] uppercase tracking-widest text-cv-muted hidden md:block">
        Scroll to explore
      </div>
    </section>
  )
}
