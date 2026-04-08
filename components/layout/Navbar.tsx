'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, Compass, TrendingUp, Users, List, Search, Bookmark, User, X, ChevronRight, MessageSquare, Loader2 } from 'lucide-react'
import Image from 'next/image'

const NAV_LINKS = [
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/community', label: 'Community', icon: Users },
  { href: '/lists', label: 'Lists', icon: List },
  { href: '/trending', label: 'Trending', icon: TrendingUp },
]

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100)
  }, [searchOpen])

  const [userResults, setUserResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        setSearching(true)
        import('@/lib/api').then(({ userApi }) => {
          userApi.search(query).then(res => {
            if (res.success) setUserResults(res.users)
            setSearching(false)
          }).catch(() => setSearching(false))
        })
      } else {
        setUserResults([])
      }
    }, 300)
    return () => clearTimeout(delayDebounceFn)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearchOpen(false)
    router.push(`/explore?q=${encodeURIComponent(query.trim())}`)
  }

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 h-16 flex items-center transition-all duration-500 ${scrolled
          ? 'bg-[rgba(4,4,10,0.92)] backdrop-blur-xl border-b border-[var(--border-gold)] shadow-[0_1px_0_rgba(191,155,48,0.1)]'
          : 'bg-gradient-to-b from-[rgba(4,4,10,0.7)] to-transparent'
          }`}
      >
        <div className="max-w-screen-2xl mx-auto w-full flex items-center justify-between px-6 md:px-10">

          {/* LEFT — Logo */}
          <Link href="/home" className="flex items-center gap-3 group shrink-0">
            <div className="relative w-8 h-8">
              {/* Film reel SVG glyph in gold */}
              <svg viewBox="0 0 32 32" className="w-full h-full text-gold transition-transform duration-500 group-hover:rotate-90">
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="16" cy="16" r="3" fill="currentColor" />
                <circle cx="16" cy="8" r="2" fill="currentColor" opacity="0.6" />
                <circle cx="16" cy="24" r="2" fill="currentColor" opacity="0.6" />
                <circle cx="8" cy="16" r="2" fill="currentColor" opacity="0.6" />
                <circle cx="24" cy="16" r="2" fill="currentColor" opacity="0.6" />
                <circle cx="10" cy="10" r="2" fill="currentColor" opacity="0.4" />
                <circle cx="22" cy="22" r="2" fill="currentColor" opacity="0.4" />
                <circle cx="22" cy="10" r="2" fill="currentColor" opacity="0.4" />
                <circle cx="10" cy="22" r="2" fill="currentColor" opacity="0.4" />
              </svg>
            </div>
            <span className="font-display text-xl tracking-wide text-[var(--text-1)] group-hover:text-gold transition-colors duration-300">
              CineVerse
            </span>
          </Link>

          {/* CENTER — Nav Links */}
          <nav className="hidden md:flex items-center gap-4">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`relative px-9 py-5 text-sm font-sans transition-colors duration-300 gold-link ${isActive(href) ? 'text-gold' : 'text-[var(--text-2)] hover:text-[var(--text-1)]'
                  }`}
              >
                {label}
                {isActive(href) && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-px bg-gold"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            ))}
            {/* Added Chat Link */}
            <Link 
              href="/chat"
              className={`relative px-9 py-5 text-sm font-sans transition-colors duration-300 gold-link ${pathname === '/chat' ? 'text-gold' : 'text-[var(--text-2)] hover:text-[var(--text-1)]'}`}
            >
              Chat
              {pathname === '/chat' && (
                  <motion.div layoutId="nav-indicator" className="absolute bottom-0 left-0 right-0 h-px bg-gold" />
              )}
            </Link>
          </nav>

          {/* RIGHT — Icons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded text-[var(--text-2)] hover:text-gold transition-colors duration-200"
              aria-label="Search"
            >
              <Search className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <Link
              href="/watchlist"
              className="w-9 h-9 flex items-center justify-center rounded text-[var(--text-2)] hover:text-gold transition-colors duration-200"
            >
              <Bookmark className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/profile"
              className="w-9 h-9 flex items-center justify-center rounded text-[var(--text-2)] hover:text-gold transition-colors duration-200"
            >
              <User className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded text-[var(--text-2)] hover:text-gold transition-colors duration-200 ml-1"
            >
              {mobileOpen ? <X className="w-5 h-5" strokeWidth={1.5} /> : <Film className="w-5 h-5" strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-void/70 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 w-64 bg-bg-2 border-l border-[var(--border-gold)] flex flex-col pt-20 pb-8 px-4 md:hidden"
            >
              <div className="h-px bg-[var(--border-gold)] mb-6" />
              <nav className="flex flex-col gap-1">
                {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded transition-colors duration-200 group ${isActive(href) ? 'text-gold bg-gold/8' : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-bg-3'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                      <span className="text-sm font-sans">{label}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-40" strokeWidth={1.5} />
                  </Link>
                ))}
                {/* Added Mobile Chat Link */}
                <Link
                  href="/chat"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded transition-colors duration-200 group ${pathname === '/chat' ? 'text-gold bg-gold/8' : 'text-[var(--text-2)] hover:text-[var(--text-1)] hover:bg-bg-3'}`}
                >
                   <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                      <span className="text-sm font-sans">Chat</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-40" strokeWidth={1.5} />
                </Link>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-24 pt-32 px-4"
            onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}
            style={{ background: 'rgba(4,4,10,0.88)', backdropFilter: 'blur(12px)' }}
          >
            <motion.div
              initial={{ y: -20, opacity: 0, scale: 0.97 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl bg-bg-2 border border-[var(--border-gold)] rounded-lg shadow-[0_30px_80px_rgba(0,0,0,0.9),_0_0_30px_rgba(191,155,48,0.08)] overflow-hidden"
            >
              {/* Search Input */}
              <form onSubmit={handleSearch} className="flex items-center gap-4 px-5 py-4 border-b border-[var(--border-1)]">
                <Search className="w-5 h-5 text-gold shrink-0" strokeWidth={1.5} />
                <input
                  ref={searchRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search movies, accounts, anime, manga…"
                  className="flex-1 bg-transparent text-[var(--text-1)] text-base placeholder:text-[var(--text-3)] outline-none font-sans"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="text-[var(--text-3)] hover:text-[var(--text-1)] transition-colors">
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </form>

              {/* Placeholder / Results area */}
              {!query ? (
                <div className="px-5 py-8 text-center">
                  <p className="font-accent text-[10px] text-[var(--text-3)] tracking-widest uppercase mb-2">Discover the Verse</p>
                  <p className="font-display text-[var(--text-2)] text-lg italic">Films · Series · Souls · Stories</p>
                </div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {/* User Results Section */}
                  {userResults.length > 0 && (
                    <div className="p-4 border-b border-[var(--border-1)] bg-gold/5">
                      <p className="font-mono text-[9px] text-gold uppercase tracking-widest mb-3">Identified Souls</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {userResults.map(u => (
                          <Link 
                            key={u.id} 
                            href={`/profile/${u.username}`}
                            onClick={() => setSearchOpen(false)}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-bg-3 border border-transparent hover:border-gold/20 transition-all"
                          >
                            <div className="w-8 h-8 rounded-full bg-void border border-gold/20 overflow-hidden relative">
                              {u.avatar ? <Image src={u.avatar} alt="" fill className="object-cover" /> : <User className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold/30" />}
                            </div>
                            <div className="min-w-0">
                               <p className="text-sm font-sans font-medium text-text-1 truncate">{u.displayName}</p>
                               <p className="text-[10px] font-mono text-gold/60">@{u.username}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="px-5 py-4 text-[var(--text-2)] text-sm font-sans flex items-center justify-between">
                    <span>Searching for "<span className="text-gold">{query}</span>" in Archive…</span>
                    {searching && <Loader2 className="w-4 h-4 text-gold animate-spin" />}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
