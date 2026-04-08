'use client'

import { Navbar } from '@/components/layout/Navbar'
import { HeroSection } from '@/components/media/HeroSection'
import { MediaRow } from '@/components/media/MediaRow'
import { tmdbApi } from '@/lib/external'

const RIVERS = [
  {
    emoji: '🔥', label: 'Right Now',         title: 'Trending Today',
    fetchFn: () => tmdbApi.trending('day'),
  },
  {
    emoji: '🎬', label: 'In Theatres',        title: 'Now Showing',
    fetchFn: () => tmdbApi.popular(),
  },
  {
    emoji: '⏰', label: 'Opening Soon',       title: 'Coming Soon',
    fetchFn: () => tmdbApi.upcoming(),
  },
  {
    emoji: '🇮🇳', label: 'Bollywood & Beyond', title: 'Indian Cinema',
    fetchFn: () => tmdbApi.bollywood(),
  },
  {
    emoji: '🇰🇷', label: 'Korean Excellence',  title: 'K-Drama & Films',
    fetchFn: () => tmdbApi.kdramas(),
    variant: 'landscape' as const,
  },
  {
    emoji: '🌸', label: 'Anime & Animation',  title: 'Anime World',
    fetchFn: () => tmdbApi.animeShows(),
  },
  {
    emoji: '📺', label: 'OTT & Streaming',    title: 'Web Series',
    fetchFn: () => tmdbApi.webSeries(),
    variant: 'landscape' as const,
  },
  {
    emoji: '🌟', label: 'Critically Acclaimed', title: 'Hidden Gems',
    fetchFn: () => tmdbApi.hiddenGems(),
  },
  {
    emoji: '🏆', label: 'All Time Greats',    title: 'Top Rated',
    fetchFn: () => tmdbApi.topRated(),
  },
  {
    emoji: '🎭', label: 'Tollywood Spotlight', title: 'South Indian Cinema',
    fetchFn: () => tmdbApi.southIndian(),
  },
]

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main style={{ background: 'var(--void)', minHeight: '100vh' }}>

        {/* ── SCENE 1: The Hero ── */}
        <HeroSection />

        {/* ── SCENE 2: The 10 Content Rivers ── */}
        <div className="pt-16 pb-24">
          {RIVERS.map((river) => (
            <MediaRow
              key={river.title}
              emoji={river.emoji}
              label={river.label}
              title={river.title}
              fetchFn={river.fetchFn}
              viewAllHref="/explore"
              variant={river.variant || 'poster'}
            />
          ))}
        </div>

        {/* ── Footer ── */}
        <footer className="border-t py-10 px-6 md:px-10" style={{ borderColor: 'var(--border-1)' }}>
          <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="font-display text-xl" style={{ color: 'var(--gold)' }}>CineVerse</span>
              <span className="text-xs font-sans" style={{ color: 'var(--text-3)' }}>— Every frame tells a story.</span>
            </div>
            <div className="flex items-center gap-6 text-xs font-sans" style={{ color: 'var(--text-3)' }}>
              <a href="#" className="hover:text-[var(--text-1)] transition-colors">About</a>
              <a href="#" className="hover:text-[var(--text-1)] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[var(--text-1)] transition-colors">Terms</a>
              <span>© {new Date().getFullYear()} CineVerse</span>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
