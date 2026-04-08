'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Plus, Star, Share2, List, Calendar, Clock } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { MediaCard } from '@/components/media/MediaCard'
import { tmdbApi, poster, backdrop } from '@/lib/external'
import { useAuthStore } from '@/store/authStore'
import { watchlistApi, ratingApi } from '@/lib/api'
import type { MediaItem, Review, CastMember } from '@/types'

type TabId = 'overview' | 'reviews' | 'media' | 'similar'

export default function MovieDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { user } = useAuthStore()
  const [movie, setMovie] = useState<MediaItem | null>(null)
  const [similar, setSimilar] = useState<MediaItem[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabId>('overview')
  const [hoveredStar, setHoveredStar] = useState(0)
  const [inWatchlist, setInWatchlist] = useState(false)
  const [userRating, setUserRating] = useState(0)

  useEffect(() => {
    setLoading(true)
    
    // 1. Fetch movie info from TMDB
    tmdbApi.movie(parseInt(id)).then(res => {
      const it = res as any
      const m: MediaItem = {
        _id: String(it.id),
        tmdbId: it.id,
        type: 'MOVIE',
        title: it.title || it.name || '',
        tagline: it.tagline,
        overview: it.overview,
        posterPath: poster(it.poster_path) ?? undefined,
        backdropPath: backdrop(it.backdrop_path) ?? undefined,
        releaseYear: it.release_date ? new Date(it.release_date).getFullYear() : undefined,
        runtime: it.runtime,
        genres: it.genres?.map((g: any) => g.name),
        tmdbRating: it.vote_average,
        voteCount: it.vote_count,
        director: it.credits?.crew?.find((c: any) => c.job === 'Director')?.name,
        cast: it.credits?.cast?.slice(0, 15).map((c: any) => ({
          name: c.name,
          character: c.character,
          profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : undefined,
        })),
        trailerKey: it.videos?.results?.find((v: any) => v.type === 'Trailer')?.key,
      }
      setMovie(m)
      
      const sim = (it.similar?.results || []).map((s: any) => ({
        _id: String(s.id),
        title: s.title || s.name,
        posterPath: poster(s.poster_path),
        backdropPath: backdrop(s.backdrop_path),
        releaseYear: s.release_date ? new Date(s.release_date).getFullYear() : undefined,
        tmdbRating: s.vote_average,
      }))
      setSimilar(sim)
    }).catch(err => {
      console.error('Detail fetch error:', err)
    }).finally(() => setLoading(false))

    // 2. Fetch local reviews (from MongoDB)
    ratingApi.getForMovie(id).then(res => {
      if (res.success) setReviews(res.ratings)
    })

    // 3. Fetch user's personal status if logged in
    if (user) {
      // Get watchlist status
      fetch(`/api/lists/status/${id}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) setInWatchlist(data.inWatchlist)
        })

      // Get user rating
      ratingApi.getForUser(user.id).then(res => {
        if (res.success) {
          const r = res.ratings.find((r: any) => String(r.movie.id) === id)
          if (r) setUserRating(r.score)
        }
      })
    }
  }, [id, user?.id])

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-void pt-16">
          <div className="relative h-[70vh] skeleton" />
          <div className="max-w-screen-xl mx-auto px-6 pt-12 space-y-4">
            <div className="h-12 w-80 skeleton rounded" />
            <div className="h-4 w-64 skeleton rounded" />
          </div>
        </div>
      </>
    )
  }

  if (!movie) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="font-display text-2xl text-cv-muted">Film not found.</p>
        </div>
      </>
    )
  }

  const handleToggleWatchlist = async () => {
    if (!user) return alert('Please identify yourself to the Collective Archive.')
    try {
      const res = await watchlistApi.toggle(movie._id)
      if (res.success) setInWatchlist(res.inWatchlist)
    } catch (e) {
      console.error("Watchlist fail", e)
    }
  }

  const handleRate = async (score: number) => {
    if (!user) return alert('Please identify yourself to the Collective Archive.')
    try {
      const res = await ratingApi.upsert(movie._id, score)
      if (res.success) {
        setUserRating(score)
        // Refresh reviews to show our new rating
        const rData = await ratingApi.getForMovie(movie._id)
        if (rData.success) setReviews(rData.ratings)
      }
    } catch (e) {
      console.error("Rating fail", e)
    }
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
    { id: 'media', label: 'Media' },
    { id: 'similar', label: 'Similar' },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-void">

        {/* ── Hero Backdrop (70vh) ── */}
        <section className="relative h-[70vh] flex items-end overflow-hidden">
          {movie.backdropPath && (
            <div className="absolute inset-0">
              <Image
                src={movie.backdropPath}
                alt=""
                fill
                className="object-cover"
                style={{ filter: 'brightness(0.4) saturate(0.6)' }}
                priority
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="absolute inset-0 bg-gradient-to-r from-void/70 via-transparent to-transparent" />

          {/* Floating poster */}
          <div className="relative z-10 flex items-end gap-8 px-6 md:px-10 pb-0 w-full max-w-screen-xl mx-auto">
            {movie.posterPath && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="shrink-0 w-36 md:w-48 translate-y-16 rounded-lg overflow-hidden shadow-2xl border border-border-subtle hidden md:block"
              >
                <div className="relative aspect-[2/3]">
                  <Image src={movie.posterPath} alt={movie.title} fill className="object-cover" />
                </div>
              </motion.div>
            )}

            {/* Title area */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex-1 pb-8"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres?.slice(0, 4).map(g => (
                  <span key={g} className="text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm border border-gold/40 text-gold bg-gold/5 backdrop-blur-sm font-accent">
                    {g}
                  </span>
                ))}
              </div>
              <h1 className="font-display text-4xl md:text-6xl font-light leading-tight tracking-[-0.02em] text-cv-text mb-2">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="font-display text-lg italic text-gold/70 mb-4">{movie.tagline}</p>
              )}
              <div className="flex flex-wrap items-center gap-6 text-white/60 text-xs font-sans tracking-wide">
                {movie.releaseYear && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gold/50" /> {movie.releaseYear}</span>}
                {movie.runtime && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gold/50" /> {movie.runtime}m</span>}
                {movie.language && <span className="uppercase border border-white/20 px-1.5 py-0.5 rounded-[2px] text-[10px] tracking-widest">{movie.language}</span>}
                {(movie.tmdbRating ?? 0) > 0 && (
                  <div className="flex items-center gap-2 bg-gold/10 px-2.5 py-1 rounded border border-gold/20">
                    <Star className="w-3.5 h-3.5 text-gold fill-gold" strokeWidth={0} />
                    <span className="font-mono text-gold font-bold text-sm leading-none">{movie.tmdbRating!.toFixed(1)}</span>
                    {movie.voteCount && <span className="text-gold/40 text-[10px] font-accent uppercase tracking-tighter">/ {movie.voteCount.toLocaleString()}</span>}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Action Bar ── */}
        <div className="bg-card border-b border-border-subtle">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10 md:pl-72 py-5 flex flex-wrap items-center gap-3">
            {movie.trailerKey && (
              <a
                href={`https://www.youtube.com/watch?v=${movie.trailerKey}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-6 py-3 bg-gradient-gold text-void text-[11px] font-medium tracking-wider uppercase rounded-lg hover:opacity-90 transition-opacity"
              >
                <Play className="w-3.5 h-3.5" strokeWidth={2} fill="currentColor" />
                Trailer
              </a>
            )}
            <button
              onClick={handleToggleWatchlist}
              className={`flex items-center gap-2 px-6 py-3 backdrop-blur-md border text-[11px] font-medium tracking-widest uppercase rounded-sm transition-all duration-500 shadow-[0_0_20px_rgba(191,155,48,0.1)] ${
                inWatchlist 
                  ? 'bg-gold text-void border-gold' 
                  : 'bg-void/40 border-gold/30 text-gold/90 hover:bg-gold hover:text-void hover:border-gold'
              }`}
            >
              <Plus className={`w-4 h-4 transition-transform duration-500 ${inWatchlist ? 'rotate-45' : ''}`} strokeWidth={1.5} />
              {inWatchlist ? 'In Watchlist' : 'Watchlist'}
            </button>
 
             {/* Star rating */}
             <div className="flex items-center gap-2 ml-4 px-4 py-2 bg-void/20 backdrop-blur-sm rounded-lg border border-border-subtle">
               <span className="font-accent text-[9px] uppercase tracking-widest text-gold/50">
                 {userRating > 0 ? 'Your Rating' : 'Rate'}
               </span>
               <div className="flex gap-1.5">
                 {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                   <button
                     key={s}
                     onMouseEnter={() => setHoveredStar(s)}
                     onMouseLeave={() => setHoveredStar(0)}
                     onClick={() => handleRate(s)}
                     className="transition-all duration-300"
                   >
                     <Star 
                       className={`w-4 h-4 transition-all duration-300 ${s <= (hoveredStar || userRating) ? 'text-gold fill-gold scale-125' : 'text-cv-muted'}`} 
                       strokeWidth={1} 
                     />
                   </button>
                 ))}
               </div>
               {userRating > 0 && hoveredStar === 0 && (
                 <span className="font-mono text-gold text-xs ml-1">{userRating}.0</span>
               )}
             </div>
 
             <div className="ml-auto flex items-center gap-3">
               <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-subtle text-cv-muted hover:text-gold hover:border-gold transition-all bg-void/20">
                 <Share2 className="w-4 h-4" strokeWidth={1.5} />
               </button>
               <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-border-subtle text-cv-muted hover:text-gold hover:border-gold transition-all bg-void/20">
                 <List className="w-4 h-4" strokeWidth={1.5} />
               </button>
             </div>
           </div>
         </div>

        {/* ── Tabs ── */}
        <div className="bg-card border-b border-border-subtle sticky top-16 z-30">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10 md:pl-72 flex gap-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-3.5 text-sm font-medium relative transition-colors ${
                  tab === t.id ? 'text-gold' : 'text-cv-muted hover:text-cv-secondary'
                }`}
              >
                {t.label}
                {tab === t.id && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-t" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab Content ── */}
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 md:pl-72 py-10">
          {tab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
              {/* Synopsis */}
              {movie.overview && (
                <div>
                  <h2 className="font-display text-2xl font-light text-cv-text mb-3">Synopsis</h2>
                  <p className="text-cv-secondary leading-relaxed max-w-2xl">{movie.overview}</p>
                </div>
              )}

              {/* Cast */}
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl font-light text-cv-text mb-4">Cast</h2>
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                    {movie.cast.slice(0, 12).map((c, i) => (
                      <div key={i} className="shrink-0 w-24 text-center">
                        <div className="w-24 h-24 rounded-full bg-elevated mb-2 overflow-hidden">
                          <div className="w-full h-full flex items-center justify-center text-cv-muted font-display text-xl">
                            {c.name[0]}
                          </div>
                        </div>
                        <p className="text-xs text-cv-text font-medium line-clamp-1">{c.name}</p>
                        <p className="text-[10px] text-cv-muted line-clamp-1 mt-0.5">{c.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Details */}
              <div>
                <h2 className="font-display text-2xl font-light text-cv-text mb-4">Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Director', value: movie.director },
                    { label: 'Release Date', value: movie.releaseDate },
                    { label: 'Runtime', value: movie.runtime ? `${movie.runtime} min` : undefined },
                    { label: 'Language', value: movie.language?.toUpperCase() },
                    { label: 'IMDb Rating', value: movie.imdbRating?.toFixed(1) },
                    { label: 'Box Office', value: movie.boxOffice },
                  ].filter(d => d.value).map(d => (
                    <div key={d.label} className="bg-bg-2 rounded-lg p-4 border border-border-1">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-text-3 mb-1">{d.label}</p>
                      <p className="text-text-1 text-sm font-medium">{d.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-2xl">
              {reviews.length === 0 ? (
                <p className="text-cv-muted text-sm">No reviews yet. Be the first to write one.</p>
              ) : reviews.map((r, i) => (
                <div key={r._id || i} className="bg-elevated rounded-xl p-5 border border-border-subtle">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary border border-border-subtle flex items-center justify-center text-cv-muted text-sm">
                        {r.user?.displayName?.[0] || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-cv-text">{r.user?.displayName || 'Anonymous'}</p>
                        <p className="text-[10px] text-cv-muted">@{r.user?.username || 'user'}</p>
                      </div>
                    </div>
                    {r.score && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-gold fill-gold" strokeWidth={0} />
                        <span className="font-mono text-xs text-gold">{r.score}/10</span>
                      </div>
                    )}
                  </div>
                  <p className="text-cv-secondary text-sm leading-relaxed">{r.reviewText}</p>
                </div>
              ))}
            </motion.div>
          )}

          {tab === 'media' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {movie.trailerKey ? (
                <div className="aspect-video max-w-3xl rounded-xl overflow-hidden bg-elevated">
                  <iframe
                    src={`https://www.youtube.com/embed/${movie.trailerKey}?autoplay=0`}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : (
                <p className="text-cv-muted text-sm">No media available.</p>
              )}
            </motion.div>
          )}

          {tab === 'similar' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {similar.length === 0 ? (
                <p className="text-cv-muted text-sm">No similar titles found.</p>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {similar.map((item, i) => (
                    <MediaCard
                      key={item._id || String(i)}
                      item={{
                        id: item._id || String(i),
                        title: item.title,
                        posterUrl: item.posterPath,
                        backdropUrl: item.backdropPath,
                        releaseYear: item.releaseYear,
                        rating: item.tmdbRating,
                        link: `/movie/${item._id || item.tmdbId || i}`,
                      }}
                      index={i}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </>
  )
}
