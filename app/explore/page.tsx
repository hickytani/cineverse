'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, ChevronRight, SlidersHorizontal, LayoutGrid, LayoutList, Film, BookOpen, Music, Star, Search as SearchIcon } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { FilterChip } from '@/components/ui/FilterChip'
import { tmdbApi, jikanApi, openLibraryApi, lastfmApi, poster, backdrop } from '@/lib/external'

// ── Types ──────────────────────────────────────────────────────────────────

type MainTab = 'films' | 'books' | 'music'
type FilmsSubTab = 'all' | 'movies' | 'tv' | 'anime' | 'webseries' | 'documentary'
type BooksSubTab = 'manga' | 'comics' | 'novels'
type MusicSubTab = 'albums' | 'artists' | 'tracks'

interface DisplayCard {
  id: string | number
  title: string
  posterUrl: string | null
  year?: number
  rating?: number
  genre?: string
  langEmoji?: string
  badge?: string
}

// ── Constants ──────────────────────────────────────────────────────────────

const FILM_SUB_TABS: { id: FilmsSubTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'movies', label: 'Movies' },
  { id: 'tv', label: 'TV Series' },
  { id: 'anime', label: 'Anime' },
  { id: 'webseries', label: 'Web Series' },
  { id: 'documentary', label: 'Documentaries' },
]

const GENRES = [
  { id: '28',  label: 'Action',        emoji: '💥' },
  { id: '12',  label: 'Adventure',     emoji: '🗺️' },
  { id: '16',  label: 'Animation',     emoji: '🎨' },
  { id: '35',  label: 'Comedy',        emoji: '😄' },
  { id: '80',  label: 'Crime',         emoji: '🔍' },
  { id: '18',  label: 'Drama',         emoji: '🎭' },
  { id: '14',  label: 'Fantasy',       emoji: '🧙' },
  { id: '27',  label: 'Horror',        emoji: '👻' },
  { id: '9648', label: 'Mystery',      emoji: '🕵️' },
  { id: '10749', label: 'Romance',     emoji: '💕' },
  { id: '878', label: 'Sci-Fi',        emoji: '🚀' },
  { id: '53',  label: 'Thriller',      emoji: '⚡' },
  { id: '10752', label: 'War',         emoji: '🎖️' },
  { id: '10402', label: 'Musical',     emoji: '🎶' },
  { id: '99',  label: 'Documentary',   emoji: '🎥' },
]

const REGIONS = [
  {
    label: '🌍 World Cinema', value: '',
    children: [
      {
        label: '🇮🇳 Indian', value: 'IN',
        children: [
          { label: 'Bollywood (Hindi)', value: 'hi' },
          { label: 'Telugu', value: 'te' },
          { label: 'Tamil', value: 'ta' },
          { label: 'Malayalam', value: 'ml' },
          { label: 'Kannada', value: 'kn' },
        ],
      },
      { label: '🇺🇸 Hollywood (English)', value: 'en', children: [] },
      {
        label: '🇰🇷 Korean', value: 'KR',
        children: [
          { label: 'K-Drama', value: 'ko-tv' },
          { label: 'Korean Films', value: 'ko' },
        ],
      },
      {
        label: '🇯🇵 Japanese', value: 'JP',
        children: [
          { label: 'Anime', value: 'ja-anime' },
          { label: 'J-Drama', value: 'ja' },
        ],
      },
      { label: '🇨🇳 Chinese / C-Drama', value: 'zh', children: [] },
      { label: '🇹🇭 Thai', value: 'th', children: [] },
      { label: '🇪🇸 Spanish / Latino', value: 'es', children: [] },
      { label: '🇫🇷 French', value: 'fr', children: [] },
      { label: '🇩🇪 German', value: 'de', children: [] },
      { label: '🌐 Other', value: 'other', children: [] },
    ],
  },
]

const SORT_OPTIONS = [
  { id: 'popularity.desc', label: 'Trending Now' },
  { id: 'vote_average.desc', label: 'Top Rated' },
  { id: 'release_date.desc', label: 'Newest' },
  { id: 'revenue.desc', label: 'Most Reviewed' },
]

const PERIODS = ['Classic (pre-1980)', '80s & 90s', '2000s', '2010s', '2020s', 'All Time']

// ── Helpers ────────────────────────────────────────────────────────────────

function yearFromDate(d?: string) {
  if (!d) return undefined
  return new Date(d).getFullYear()
}

// ── Main Component ──────────────────────────────────────────────────────────

export default function ExplorePage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''

  const [mainTab, setMainTab] = useState<MainTab>('films')
  const [filmsTab, setFilmsTab] = useState<FilmsSubTab>('all')
  const [booksTab, setBooksTab] = useState<BooksSubTab>('manga')
  const [musicTab, setMusicTab] = useState<MusicSubTab>('tracks')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedRegion, setSelectedRegion] = useState('')
  const [selectedSort, setSelectedSort] = useState('popularity.desc')
  const [selectedPeriod, setSelectedPeriod] = useState('All Time')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [expandedRegions, setExpandedRegions] = useState<string[]>(['🌍 World Cinema'])
  const [cards, setCards] = useState<DisplayCard[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query) {
       // Automatic switch tab based on context if query exists? 
       // For now just stay on current tab but trigger search logic
    }
  }, [query])

  // Fetch data based on current filters
  const fetchData = useCallback(async (reset = true) => {
    setLoading(true)
    try {
      let raw: DisplayCard[] = []

      if (query) {
        // ── SEARCH MODE ──────────────────────────────────────────────────────
        if (mainTab === 'films') {
          const res = await tmdbApi.searchMulti(query, reset ? 1 : page) as any
          raw = (res.results || []).map((m: any) => ({
            id: m.id,
            title: m.title || m.name || '',
            posterUrl: poster(m.poster_path),
            year: yearFromDate(m.release_date || m.first_air_date),
            rating: m.vote_average,
            genre: m.media_type === 'movie' ? 'Movie' : 'TV Series',
          }))
        } else if (mainTab === 'books') {
          const res = await openLibraryApi.search(query) as any
          raw = (res.docs || []).slice(0, 40).map((b: any) => ({
            id: b.key,
            title: b.title,
            posterUrl: b.cover_i ? openLibraryApi.cover(b.cover_i, 'M') : null,
            year: b.first_publish_year,
            genre: 'Book',
          }))
        } else if (mainTab === 'music') {
          // Last.fm search usually requires a different method, but we'll use a placeholder or reuse top for now
          // or just fallback to top if search is empty? No, let's just keep search logic specific.
          raw = [] 
        }
      } else {
        // ── EXPLORE MODE (Browsing) ──────────────────────────────────────────
        if (mainTab === 'films') {
          const params: Record<string, string | number> = {
            sort_by: selectedSort,
            page: reset ? 1 : page,
          }
          if (selectedGenres.length > 0) params.with_genres = selectedGenres.join(',')
          if (selectedRegion === 'hi' || selectedRegion === 'IN') params.with_original_language = 'hi'
          else if (selectedRegion === 'ko' || selectedRegion === 'KR') params.with_original_language = 'ko'
          else if (selectedRegion === 'ja') params.with_original_language = 'ja'
          else if (selectedRegion === 'en') params.with_original_language = 'en'
          else if (selectedRegion === 'fr') params.with_original_language = 'fr'
          else if (selectedRegion === 'de') params.with_original_language = 'de'
          else if (selectedRegion === 'es') params.with_original_language = 'es'
          else if (selectedRegion === 'zh') params.with_original_language = 'zh'
          else if (selectedRegion === 'th') params.with_original_language = 'th'
          else if (['te', 'ta', 'ml', 'kn'].includes(selectedRegion)) params.with_original_language = selectedRegion

          if (selectedPeriod === 'Classic (pre-1980)') params['release_date.lte'] = '1980-01-01'
          else if (selectedPeriod === '80s & 90s') { params['release_date.gte'] = '1980-01-01'; params['release_date.lte'] = '1999-12-31' }
          else if (selectedPeriod === '2000s') { params['release_date.gte'] = '2000-01-01'; params['release_date.lte'] = '2009-12-31' }
          else if (selectedPeriod === '2010s') { params['release_date.gte'] = '2010-01-01'; params['release_date.lte'] = '2019-12-31' }
          else if (selectedPeriod === '2020s') params['release_date.gte'] = '2020-01-01'

          let data: Record<string, unknown>
          if (filmsTab === 'anime' || selectedRegion === 'ja-anime') {
            const jData = await jikanApi.topAnime(reset ? 1 : page)
            const j = jData as any
            raw = (j.data || []).map((a: any) => ({
              id: a.mal_id,
              title: a.title,
              posterUrl: a.images?.jpg?.large_image_url || null,
              rating: a.score,
              genre: 'Anime',
              langEmoji: '🇯🇵',
            }))
          } else if (filmsTab === 'tv' || filmsTab === 'webseries' || selectedRegion === 'ko-tv') {
            data = await tmdbApi.discoverTv(params) as Record<string, unknown>
            const results = data.results as Array<Record<string, unknown>> || []
            raw = results.map(m => ({
              id: m.id as number,
              title: m.name as string || m.title as string || '',
              posterUrl: poster((m.poster_path as string) || null),
              year: yearFromDate(m.first_air_date as string),
              rating: m.vote_average ? parseFloat(String(m.vote_average)) : undefined,
              genre: 'TV Series',
              langEmoji: '📺',
            }))
          } else {
            data = await tmdbApi.discover(params) as Record<string, unknown>
            const results = data.results as Array<Record<string, unknown>> || []
            raw = results.map(m => ({
              id: m.id as number,
              title: m.title as string || m.name as string || '',
              posterUrl: poster((m.poster_path as string) || null),
              year: yearFromDate(m.release_date as string),
              rating: m.vote_average ? parseFloat(String(m.vote_average)) : undefined,
              genre: 'Movie',
            }))
          }
        }

        else if (mainTab === 'books') {
          if (booksTab === 'manga') {
            const data = await jikanApi.topManga() as any
            raw = (data.data || []).map((m: any) => ({
              id: m.mal_id,
              title: m.title,
              posterUrl: m.images?.jpg?.large_image_url || null,
              rating: m.score,
              genre: 'Manga',
              langEmoji: '🇯🇵',
            }))
          } else {
            const data = await openLibraryApi.search(booksTab === 'novels' ? 'bestseller novel' : 'graphic novel') as any
            raw = (data.docs || []).slice(0, 20).map((b: any) => ({
              id: b.key,
              title: b.title,
              posterUrl: b.cover_i ? openLibraryApi.cover(b.cover_i, 'M') : null,
              year: b.first_publish_year,
              genre: booksTab === 'novels' ? 'Novel' : 'Graphic Novel',
            }))
          }
        }

        else if (mainTab === 'music') {
          if (musicTab === 'tracks') {
            const data = await lastfmApi.topTracks() as any
            raw = (data.tracks?.track || []).map((t: any) => ({
              id: t.name,
              title: t.name,
              posterUrl: t.image?.[3]?.['#text'] || null,
              genre: 'Track',
              langEmoji: '🎵',
              badge: t.artist?.name
            }))
          } else {
            const data = await lastfmApi.topArtists() as any
            raw = (data.artists?.artist || []).map((a: any) => ({
              id: a.name,
              title: a.name,
              posterUrl: a.image?.[3]?.['#text'] || null,
              genre: 'Artist',
              langEmoji: '🎤',
            }))
          }
        }
      }

      setCards(prev => reset ? raw : [...prev, ...raw])
    } catch (e) {
      console.error('Explore fetch error:', e)
    } finally {
      setLoading(false)
    }
  }, [mainTab, filmsTab, booksTab, musicTab, selectedGenres, selectedRegion, selectedSort, selectedPeriod, page, query])

  useEffect(() => { fetchData(true) }, [mainTab, filmsTab, booksTab, musicTab, selectedGenres, selectedRegion, selectedSort, selectedPeriod, query])

  const toggleGenre = (id: string) =>
    setSelectedGenres(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id])

  const toggleRegionExpand = (label: string) =>
    setExpandedRegions(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label])

  const sectionTitle =
    mainTab === 'films' ? (FILM_SUB_TABS.find(t => t.id === filmsTab)?.label || 'All Films') :
    mainTab === 'books' ? (booksTab === 'manga' ? 'Manga' : booksTab === 'novels' ? 'Novels' : 'Graphic Novels') :
    (musicTab === 'tracks' ? 'Top Tracks' : 'Top Artists')

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh', color: 'var(--text-1)' }}>
      <Navbar />

      {/* ── Hero Banner ── */}
      <div className="relative h-48 flex items-end overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--bg-1) 0%, var(--bg-2) 100%)' }}>
        <div className="absolute inset-0 noise pointer-events-none" />
        <div className="relative z-10 max-w-screen-2xl mx-auto w-full px-8 md:px-12 pb-8">
          <p className="font-accent text-[11px] tracking-widest uppercase text-[var(--text-3)] mb-1">Pop Culture Universe</p>
          <h1 className="font-display text-5xl font-light text-[var(--text-1)]">Explore</h1>
        </div>
        <div className="absolute bottom-0 inset-x-0 h-px" style={{ background: 'var(--border-gold)' }} />
      </div>

      {/* ── Primary Tab Bar ── */}
      <div className="sticky top-16 z-20 border-b" style={{ background: 'rgba(4,4,10,0.88)', backdropFilter: 'blur(16px)', borderColor: 'var(--border-1)' }}>
        <div className="max-w-screen-2xl mx-auto px-8 md:px-12 flex items-center gap-0">
          {[
            { id: 'films' as MainTab, label: '🎬 Films & Series', icon: Film },
            { id: 'books' as MainTab, label: '📚 Books & Manga', icon: BookOpen },
            { id: 'music' as MainTab, label: '🎵 Music', icon: Music },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setMainTab(tab.id); setCards([]); setPage(1) }}
              className={`relative px-6 py-4 font-sans text-sm transition-colors duration-300 ${
                mainTab === tab.id ? 'text-gold' : 'text-[var(--text-2)] hover:text-[var(--text-1)]'
              }`}
            >
              {tab.label}
              {mainTab === tab.id && (
                <motion.div
                  layoutId="explore-tab"
                  className="absolute bottom-0 left-0 right-0 h-px bg-gold"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 py-8 flex gap-8">

        {/* ── Sidebar ── */}
        <motion.aside
          animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 overflow-hidden rounded-lg"
          style={{ height: 'fit-content', position: 'sticky', top: '9rem' }}
        >
          <div className="w-[280px] rounded-lg border p-5 flex flex-col gap-6" style={{ background: 'var(--bg-2)', borderColor: 'var(--border-1)' }}>

            {/* Sub-tabs for Films */}
            {mainTab === 'films' && (
              <div>
                <p className="font-accent text-[10px] tracking-widest uppercase text-[var(--text-3)] mb-3">Type</p>
                <div className="flex flex-col gap-1">
                  {FILM_SUB_TABS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setFilmsTab(t.id); setCards([]) }}
                      className={`text-left px-3 py-2 rounded text-sm font-sans transition-colors duration-200 ${
                        filmsTab === t.id ? 'bg-gold/10 text-gold' : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-bg-3'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tabs for Books */}
            {mainTab === 'books' && (
              <div>
                <p className="font-accent text-[10px] tracking-widest uppercase text-[var(--text-3)] mb-3">Category</p>
                <div className="flex flex-col gap-1">
                  {[{id: 'manga', label: 'Manga'},{id: 'novels', label: 'Novels'},{id: 'comics', label: 'Graphic Novels'}].map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setBooksTab(t.id as BooksSubTab); setCards([]) }}
                      className={`text-left px-3 py-2 rounded text-sm font-sans transition-colors duration-200 ${
                        booksTab === t.id ? 'bg-gold/10 text-gold' : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-bg-3'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-tabs for Music */}
            {mainTab === 'music' && (
              <div>
                <p className="font-accent text-[10px] tracking-widest uppercase text-[var(--text-3)] mb-3">Category</p>
                <div className="flex flex-col gap-1">
                  {[{id: 'tracks', label: 'Top Tracks'},{id: 'artists', label: 'Artists'}].map(t => (
                    <button
                      key={t.id}
                      onClick={() => { setMusicTab(t.id as MusicSubTab); setCards([]) }}
                      className={`text-left px-3 py-2 rounded text-sm font-sans transition-colors duration-200 ${
                        musicTab === t.id ? 'bg-gold/10 text-gold' : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-bg-3'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Region Tree (Films only) */}
            {mainTab === 'films' && (
              <div>
                <p className="font-accent text-[10px] tracking-widest uppercase text-[var(--text-3)] mb-3">Region / Language</p>
                <RegionTree
                  nodes={REGIONS}
                  selectedRegion={selectedRegion}
                  expandedRegions={expandedRegions}
                  onSelect={v => { setSelectedRegion(v); setCards([]) }}
                  onToggle={toggleRegionExpand}
                />
              </div>
            )}

            {/* Genre Chips (Films only) */}
            {mainTab === 'films' && (
              <div>
                <p className="font-accent text-[10px] tracking-widest uppercase text-[var(--text-3)] mb-3">Genres</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {GENRES.map(g => (
                    <FilterChip
                      key={g.id}
                      label={`${g.emoji} ${g.label}`}
                      selected={selectedGenres.includes(g.id)}
                      onClick={() => toggleGenre(g.id)}
                      className="text-[11px] py-1.5 px-2"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Time Period */}
            {mainTab === 'films' && (
              <div>
                <p className="font-accent text-[10px] tracking-widest uppercase text-[var(--text-3)] mb-3">Time Period</p>
                <div className="flex flex-wrap gap-1.5">
                  {PERIODS.map(p => (
                    <button
                      key={p}
                      onClick={() => { setSelectedPeriod(p); setCards([]) }}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-sans transition-all duration-200 border ${
                        selectedPeriod === p
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-[var(--border-1)] text-[var(--text-3)] hover:border-[var(--border-2)] hover:text-[var(--text-2)]'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sort By */}
            {mainTab === 'films' && (
              <div>
                <p className="font-accent text-[10px] tracking-widest uppercase text-[var(--text-3)] mb-3">Sort By</p>
                <div className="flex flex-col gap-1">
                  {SORT_OPTIONS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setSelectedSort(s.id); setCards([]) }}
                      className={`text-left px-3 py-2 rounded text-sm font-sans transition-colors duration-200 ${
                        selectedSort === s.id ? 'bg-gold/10 text-gold' : 'text-[var(--text-2)] hover:bg-bg-3'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.aside>

        {/* ── Content Area ── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded border text-sm font-sans transition-all duration-200 hover:border-gold hover:text-gold"
                style={{ borderColor: 'var(--border-1)', color: 'var(--text-2)' }}
              >
                <SlidersHorizontal className="w-4 h-4" strokeWidth={1.5} />
                Filters
              </button>
              <div>
                <h2 className="font-display text-2xl text-[var(--text-1)] leading-none">{sectionTitle}</h2>
                {!loading && <p className="font-mono text-[11px] text-[var(--text-3)] mt-0.5">{cards.length} results</p>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors duration-200 ${viewMode === 'grid' ? 'text-gold' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'}`}
              >
                <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors duration-200 ${viewMode === 'list' ? 'text-gold' : 'text-[var(--text-3)] hover:text-[var(--text-1)]'}`}
              >
                <LayoutList className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Grid */}
          {loading && cards.length === 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...Array(18)].map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-md skeleton" />
              ))}
            </div>
          ) : (
            <motion.div
              className={viewMode === 'grid' ? 'grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4' : 'flex flex-col gap-3'}
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
            >
              {cards.map((card, i) => (
                <motion.div
                  key={`${card.id}-${i}`}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
                  }}
                >
                  {viewMode === 'grid' ? (
                    <ExploreCard card={card} />
                  ) : (
                    <ExploreListRow card={card} />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Infinite scroll loader */}
          <div ref={loaderRef} className="h-16 flex items-center justify-center mt-6">
            {loading && cards.length > 0 && (
              <div className="w-6 h-6 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub Components ─────────────────────────────────────────────────────────

interface RegionNode {
  label: string
  value: string
  children?: RegionNode[]
}

function RegionTree({ nodes, selectedRegion, expandedRegions, onSelect, onToggle, depth = 0 }: {
  nodes: RegionNode[]
  selectedRegion: string
  expandedRegions: string[]
  onSelect: (v: string) => void
  onToggle: (label: string) => void
  depth?: number
}) {
  return (
    <div>
      {nodes.map(node => {
        const isExpanded = expandedRegions.includes(node.label)
        const hasChildren = node.children && node.children.length > 0
        const isSelected = selectedRegion === node.value && node.value !== ''
        return (
          <div key={node.label}>
            <div
              className={`flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-colors duration-200 text-[13px] font-sans ${
                isSelected ? 'text-gold bg-gold/8' : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-bg-3'
              }`}
              style={{ paddingLeft: `${8 + depth * 14}px` }}
              onClick={() => { onSelect(node.value); if (hasChildren) onToggle(node.label) }}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown className="w-3 h-3 shrink-0 opacity-60" /> : <ChevronRight className="w-3 h-3 shrink-0 opacity-60" />
              ) : <span className="w-3" />}
              <span className="leading-none">{node.label}</span>
            </div>
            {hasChildren && isExpanded && (
              <RegionTree
                nodes={node.children!}
                selectedRegion={selectedRegion}
                expandedRegions={expandedRegions}
                onSelect={onSelect}
                onToggle={onToggle}
                depth={depth + 1}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ExploreCard({ card }: { card: DisplayCard }) {
  const [hovered, setHovered] = useState(false)
  const detailLink = (card.genre?.includes('Track') || card.genre?.includes('Artist') || card.genre?.includes('Music')) ? `/music/${encodeURIComponent(card.id as string)}` : 
                    (card.genre?.includes('Book') || card.genre?.includes('Novel') || card.genre?.includes('Manga') || card.genre?.includes('Comic')) ? `/book/${encodeURIComponent(card.id as string).replace('/works/','')}` :
                    `/movie/${card.id}`

  return (
    <Link
      href={detailLink}
      className="group block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="relative aspect-[2/3] rounded-md overflow-hidden transition-all duration-500"
        style={{
          border: hovered ? '1px solid var(--border-gold)' : '1px solid var(--border-1)',
          background: 'var(--bg-2)',
          boxShadow: hovered ? '0 20px 40px rgba(0,0,0,0.8), 0 0 20px rgba(191,155,48,0.1)' : '0 4px 12px rgba(0,0,0,0.4)',
          transform: hovered ? 'scale(1.04) translateY(-4px)' : 'scale(1) translateY(0)',
        }}
      >
        {card.posterUrl ? (
          <Image src={card.posterUrl} alt={card.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-3xl text-[var(--text-3)]">{card.title[0]}</span>
          </div>
        )}
        {card.rating && card.rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full px-1.5 py-0.5" style={{ background: 'rgba(4,4,10,0.85)', backdropFilter: 'blur(8px)', border: '1px solid var(--border-1)' }}>
            <Star className="w-2.5 h-2.5 text-gold fill-gold" strokeWidth={0} />
            <span className="font-mono text-[10px] text-[var(--text-1)]">{card.rating.toFixed(1)}</span>
          </div>
        )}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-x-0 bottom-0 p-2"
              style={{ background: 'var(--grad-card)' }}
            >
              <div className="flex gap-1 w-full">
                <button 
                  onClick={async (e) => { 
                    e.preventDefault(); e.stopPropagation(); 
                    const type = detailLink.includes('/book/') ? 'BOOK' : detailLink.includes('/music/') ? 'MUSIC' : 'MOVIE';
                    await fetch('/api/user/state', {
                      method: 'POST',
                      body: JSON.stringify({
                        userId: 'demo-user',
                        mediaId: card.id,
                        action: 'watchlist',
                        metadata: { title: card.title, poster: card.posterUrl, type }
                      })
                    })
                  }} 
                  className="flex-1 py-1 text-[10px] font-accent uppercase tracking-wider text-[var(--text-1)] rounded-sm transition-all duration-200 hover:bg-gold hover:text-void" 
                  style={{ background: 'rgba(4,4,10,0.6)', border: '1px solid var(--border-1)' }}
                >
                  + List
                </button>
                <button 
                  onClick={async (e) => { 
                    e.preventDefault(); e.stopPropagation(); 
                    const type = detailLink.includes('/book/') ? 'BOOK' : detailLink.includes('/music/') ? 'MUSIC' : 'MOVIE';
                    await fetch('/api/user/state', {
                      method: 'POST',
                      body: JSON.stringify({
                        userId: 'demo-user',
                        mediaId: card.id,
                        action: 'watchlist',
                        metadata: { title: card.title, poster: card.posterUrl, type }
                      })
                    })
                  }} 
                  className="flex-1 py-1 text-[10px] font-accent uppercase tracking-wider text-[var(--text-1)] rounded-sm transition-all duration-200" 
                  style={{ background: 'rgba(4,4,10,0.6)', border: '1px solid var(--border-1)' }}
                >
                  ♥ Watch
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="mt-2">
        <p className="text-[12px] font-sans font-medium line-clamp-1 transition-colors duration-200" style={{ color: hovered ? 'var(--gold)' : 'var(--text-1)' }}>
          {card.title}
        </p>
        <div className="flex items-center gap-1 text-[10px] font-sans" style={{ color: 'var(--text-3)' }}>
          {card.year && <span className="font-mono">{card.year}</span>}
          {card.langEmoji && <span>{card.langEmoji}</span>}
          {card.genre && <span>{card.genre}</span>}
          {card.badge && <span className="text-gold italic ml-1">{card.badge}</span>}
        </div>
      </div>
    </Link>
  )
}

function ExploreListRow({ card }: { card: DisplayCard }) {
  const detailLink = (card.genre?.includes('Track') || card.genre?.includes('Artist') || card.genre?.includes('Music')) ? `/music/${encodeURIComponent(card.id as string)}` : 
                    (card.genre?.includes('Book') || card.genre?.includes('Novel') || card.genre?.includes('Manga') || card.genre?.includes('Comic')) ? `/book/${encodeURIComponent(card.id as string).replace('/works/','')}` :
                    `/movie/${card.id}`

  return (
    <Link
      href={detailLink}
      className="flex items-center gap-4 p-3 rounded-lg border transition-all duration-200 hover:border-[var(--border-gold)] hover:bg-bg-2"
      style={{ border: '1px solid var(--border-1)', background: 'var(--bg-1)' }}
    >
      <div className="relative w-12 aspect-[2/3] rounded overflow-hidden shrink-0" style={{ background: 'var(--bg-2)' }}>
        {card.posterUrl && <Image src={card.posterUrl} alt={card.title} fill className="object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-sans font-medium text-[var(--text-1)] line-clamp-1">{card.title}</p>
        <div className="flex items-center gap-2 text-[11px] font-sans text-[var(--text-3)] mt-0.5">
          {card.year && <span className="font-mono">{card.year}</span>}
          {card.genre && <span className="font-accent text-[10px] uppercase tracking-wider">{card.genre}</span>}
          {card.badge && <span className="text-gold italic ml-1">{card.badge}</span>}
        </div>
      </div>
      {card.rating && card.rating > 0 && (
        <div className="flex items-center gap-1 shrink-0">
          <Star className="w-3.5 h-3.5 text-gold fill-gold" strokeWidth={0} />
          <span className="font-mono text-sm" style={{ color: 'var(--gold)' }}>{card.rating.toFixed(1)}</span>
        </div>
      )}
    </Link>
  )
}
