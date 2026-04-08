'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/api'
import { poster, backdrop, tmdbApi } from '@/lib/external'

// Demo accounts tied to the 5 taste profiles — password matches seedCommunity.js
const DEMOS = [
  { label: '🎬 Film Fan',     username: 'filmfan',      password: 'CineVerse@2024' },
  { label: '🌸 Anime Fan',    username: 'animefan',     password: 'CineVerse@2024' },
  { label: '🇮🇳 Bollywood',   username: 'bollystar',    password: 'CineVerse@2024' },
  { label: '🇰🇷 K-Drama',     username: 'kdramalover',  password: 'CineVerse@2024' },
  { label: '📚 Manga Fan',    username: 'mangafan',     password: 'CineVerse@2024' },
]

// Floating poster card positions (as described in the prompt)
const POSTER_POSITIONS = [
  { top: '15%', left: '8%',  rotate: '-8deg', scale: '0.9',  delay: 0,   duration: 20 },
  { top: '25%', left: '30%', rotate: '4deg',  scale: '1.0',  delay: 2,   duration: 25 },
  { top: '55%', left: '5%',  rotate: '-3deg', scale: '0.85', delay: 4,   duration: 30 },
  { top: '60%', left: '38%', rotate: '7deg',  scale: '0.95', delay: 1.5, duration: 18 },
]

interface TmdbItem {
  id: number
  title?: string
  name?: string
  backdrop_path: string | null
  poster_path: string | null
  vote_average?: number
}

interface TmdbResponse {
  results?: TmdbItem[]
}

export default function AuthPage({ mode = 'login' }: { mode?: 'login' | 'register' }) {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const isRegister = mode === 'register'

  const [items, setItems] = useState<TmdbItem[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailFocused, setEmailFocused] = useState(false)
  const [pwFocused, setPwFocused] = useState(false)

  // Fetch trending backdrops
  useEffect(() => {
    tmdbApi.trending('day').then((data: unknown) => {
      const d = data as TmdbResponse
      if (d.results) {
        const filtered = d.results.filter((r: TmdbItem) => r.backdrop_path && r.poster_path)
        setItems(filtered.slice(0, 8))
      }
    }).catch(() => {})
  }, [])

  // Auto-cycle backdrop every 5s
  useEffect(() => {
    if (items.length < 2) return
    const t = setInterval(() => setActiveIdx(i => (i + 1) % items.length), 5000)
    return () => clearInterval(t)
  }, [items.length])

  const fillDemo = async (d: typeof DEMOS[0]) => {
    // Fill the visual fields for feedback, though we use d.username/d.password for the API call
    setEmail(d.username) 
    setPassword(d.password)
    setError('')
    setLoading(true)
    try {
      const res = await authApi.login(d.username, d.password)
      if (res.token) setToken(res.token)
      if (res.user) setUser(res.user)
      router.push('/home')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo login failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = isRegister
        ? await authApi.register({ email, password, username, displayName })
        : await authApi.login(email, password)
      if (res.token) setToken(res.token)
      if (res.user) setUser(res.user)
      router.push('/home')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  const active = items[activeIdx]

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--void)' }}>

      {/* ═══════════════════════════════════════
          LEFT: "THE THEATRE" (58%)
         ═══════════════════════════════════════ */}
      <div className="relative hidden md:block" style={{ width: '58%' }}>
        {/* Crossfading Backdrops */}
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <Image
                src={backdrop(active.backdrop_path) || ''}
                alt={active.title || active.name || ''}
                fill
                className="object-cover"
                priority
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Film Grain + Gradient overley */}
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 noise pointer-events-none" />

        {/* Floating Poster Cards */}
        {items.length > 0 && POSTER_POSITIONS.map((pos, i) => {
          const it = items[i % items.length]
          if (!it?.poster_path) return null
          return (
            <motion.div
              key={i}
              className="absolute z-10"
              style={{
                top: pos.top,
                left: pos.left,
                rotate: pos.rotate,
                scale: pos.scale,
                width: '100px',
              }}
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: pos.duration, delay: pos.delay, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div
                className="rounded overflow-hidden border border-[var(--border-gold)]"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.8)' }}
              >
                <div className="relative aspect-[2/3]">
                  <Image src={poster(it.poster_path) || ''} alt={it.title || it.name || ''} fill className="object-cover" />
                </div>
                <div className="bg-[rgba(4,4,10,0.95)] px-2 py-1.5">
                  <p className="text-[10px] font-sans text-[var(--text-1)] line-clamp-1">{it.title || it.name}</p>
                  {it.vote_average && (
                    <p className="text-[9px] font-mono text-gold">★ {it.vote_average.toFixed(1)}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}

        {/* Now Showing label (bottom-left) */}
        {active && (
          <motion.div
            key={activeIdx + '-label'}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-10 left-10 z-20"
          >
            <p className="font-accent text-[10px] text-gold tracking-widest uppercase mb-2">Now Showing</p>
            <h2 className="font-display text-4xl font-light text-[var(--text-1)] leading-tight" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.9)' }}>
              {active.title || active.name}
            </h2>
          </motion.div>
        )}

        {/* Vertical gold separator line */}
        <div className="absolute inset-y-0 right-0 w-px bg-[var(--border-gold)]" />
      </div>

      {/* ═══════════════════════════════════════
          RIGHT: "THE DOOR" (42%)
         ═══════════════════════════════════════ */}
      <div
        className="flex-1 flex items-center justify-center px-8 md:px-12 lg:px-16 overflow-y-auto"
        style={{ background: 'var(--bg-1)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <svg viewBox="0 0 32 32" className="w-9 h-9 text-gold">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <circle cx="16" cy="16" r="3" fill="currentColor"/>
              <circle cx="16" cy="8"  r="2" fill="currentColor" opacity="0.7"/>
              <circle cx="16" cy="24" r="2" fill="currentColor" opacity="0.7"/>
              <circle cx="8"  cy="16" r="2" fill="currentColor" opacity="0.7"/>
              <circle cx="24" cy="16" r="2" fill="currentColor" opacity="0.7"/>
              <circle cx="10" cy="10" r="1.5" fill="currentColor" opacity="0.4"/>
              <circle cx="22" cy="22" r="1.5" fill="currentColor" opacity="0.4"/>
              <circle cx="22" cy="10" r="1.5" fill="currentColor" opacity="0.4"/>
              <circle cx="10" cy="22" r="1.5" fill="currentColor" opacity="0.4"/>
            </svg>
            <span className="font-display text-2xl text-[var(--text-1)]">CineVerse</span>
          </div>

          <h1 className="font-display text-4xl font-light text-[var(--text-1)] mb-1">
            {isRegister ? 'Begin your story.' : 'Welcome back.'}
          </h1>
          <p className="font-display italic text-lg text-[var(--text-2)] mb-1">Every frame tells a story.</p>

          <div className="h-px bg-[var(--border-gold)] my-6" />

          {/* Error */}
          {error && (
            <div className="mb-4 px-3 py-2 rounded border border-crimson/40 bg-crimson/10 text-sm font-sans text-[var(--text-1)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Register-only fields */}
            {isRegister && (
              <>
                <FloatInput label="Display Name" value={displayName} onChange={setDisplayName} required />
                <FloatInput label="Username" value={username} onChange={setUsername} required />
              </>
            )}

            {/* Email */}
            <FloatInput
              type="email"
              label="Email address"
              value={email}
              onChange={setEmail}
              focused={emailFocused}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              required
            />

            {/* Password */}
            <div className="relative">
              <FloatInput
                type={showPw ? 'text' : 'password'}
                label="Password"
                value={password}
                onChange={setPassword}
                focused={pwFocused}
                onFocus={() => setPwFocused(true)}
                onBlur={() => setPwFocused(false)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-[var(--text-3)] hover:text-gold transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
              </button>
            </div>

            {/* Primary: Sign In */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full h-12 flex items-center justify-center gap-2 font-sans font-medium text-[15px] rounded transition-all duration-300 disabled:opacity-60"
              style={{ background: 'var(--gold)', color: 'var(--void)', boxShadow: '0 4px 20px rgba(191,155,48,0.2)' }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isRegister ? 'Create Account' : 'Sign In'}
            </motion.button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[var(--border-1)]" />
              <span className="text-[11px] font-sans text-[var(--text-3)]">or</span>
              <div className="flex-1 h-px bg-[var(--border-1)]" />
            </div>

            {/* Google OAuth */}
            <button
              type="button"
              className="w-full h-12 flex items-center justify-center gap-3 font-sans text-[14px] text-[var(--text-2)] rounded border border-[var(--border-2)] hover:border-[var(--border-gold)] hover:text-[var(--text-1)] transition-all duration-300"
              style={{ background: 'transparent' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </form>

          {/* Demo accounts */}
          {!isRegister && (
            <div className="mt-7">
              <p className="font-accent text-[10px] tracking-widest uppercase text-[var(--text-3)] mb-3">Try a demo account</p>
              <div className="flex flex-wrap gap-2">
                {DEMOS.map(d => (
                  <button
                    key={d.username}
                    type="button"
                    onClick={() => fillDemo(d)}
                    className="text-[11px] font-sans px-3 py-1.5 rounded border border-[var(--border-gold)] text-gold hover:bg-gold/10 transition-colors duration-200"
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Switch mode link */}
          <p className="mt-8 text-center text-sm font-sans text-[var(--text-3)]">
            {isRegister ? 'Already a member? ' : "Don't have an account? "}
            <Link href={isRegister ? '/login' : '/register'} className="text-gold hover:text-gold-light transition-colors duration-200">
              {isRegister ? 'Sign in' : 'Create one'}
            </Link>
          </p>
          <div className="mt-3 text-center">
            <Link href="/home" className="text-xs font-sans text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors duration-200">
              Browse as guest →
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  )
}

// ── Floating Label Input Component ──────────────────────────────────────────
interface FloatInputProps {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  required?: boolean
  focused?: boolean
  onFocus?: () => void
  onBlur?: () => void
}

function FloatInput({ label, value, onChange, type = 'text', required, focused, onFocus, onBlur }: FloatInputProps) {
  const hasValue = value.length > 0
  const isLifted = focused || hasValue

  return (
    <div className="relative group">
      <label
        className={`absolute left-0 pointer-events-none font-sans transition-all duration-200 ${
          isLifted
            ? 'top-0 text-[10px] text-gold'
            : 'top-3 text-sm text-[var(--text-3)]'
        }`}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        required={required}
        className="w-full bg-transparent outline-none pt-5 pb-2 text-[15px] font-sans text-[var(--text-1)] border-0 border-b transition-colors duration-200"
        style={{
          borderBottom: `1px solid ${isLifted ? 'var(--gold)' : 'var(--border-2)'}`,
        }}
      />
    </div>
  )
}
