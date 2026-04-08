'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Film, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/lib/api'

const DEMO_ACCOUNTS = [
  { email: 'demo@cineverse.io',       password: 'Demo@1234',   label: 'Demo User' },
  { email: 'cinefan@cineverse.io',    password: 'CineFan@99',  label: 'Cine Fan' },
  { email: 'animeuser@cineverse.io',  password: 'Anime@2024',  label: 'Anime Fan' },
]


export function LoginForm({ isRegister = false }: { isRegister?: boolean }) {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fillDemo = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email)
    setPassword(acc.password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = isRegister
        ? await authApi.register({ email, password, username, displayName })
        : await authApi.login(email, password)
      if (res.token)  setToken(res.token)
      if (res.user)   setUser(res.user)
      router.push('/home')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const goldInputClass = `
    w-full bg-transparent border-0 border-b border-border-default text-cv-text placeholder:text-cv-muted
    py-3 text-sm outline-none transition-colors duration-200 font-sans
    focus:border-gold
  `.trim()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-sm"
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div className="w-8 h-8 rounded-sm bg-gradient-gold flex items-center justify-center">
          <Film className="w-5 h-5 text-void" strokeWidth={2} />
        </div>
        <span className="font-display text-2xl font-semibold text-cv-text tracking-wide">CineVerse</span>
      </div>

      <h1 className="font-display text-4xl font-light text-cv-text mb-1">
        {isRegister ? 'Join the story.' : 'Welcome back.'}
      </h1>
      <p className="font-display text-base italic text-cv-secondary mb-8">
        Every frame tells a story.
      </p>

      {/* Demo accounts */}
      {!isRegister && (
        <div className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-cv-muted mb-2">Quick demo access</p>
          <div className="flex flex-wrap gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc)}
                className="text-[11px] px-3 py-1.5 rounded border border-gold/30 text-gold hover:bg-gold/10 transition-colors"
              >
                {acc.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {isRegister && (
          <>
            <input
              className={goldInputClass}
              placeholder="Display Name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
            />
            <input
              className={goldInputClass}
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </>
        )}
        <input
          type="email"
          className={goldInputClass}
          placeholder="Email address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            className={`${goldInputClass} pr-10`}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-cv-muted hover:text-cv-text"
          >
            {showPw ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
          </button>
        </div>

        {error && (
          <p className="text-crimson-bright text-sm">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-gold text-void text-sm font-medium font-sans rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isRegister ? 'Create Account' : 'Sign In'}
        </button>

        {/* Google OAuth (placeholder for now) */}
        <button
          type="button"
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-elevated border border-border-default text-cv-secondary text-sm font-sans rounded-lg hover:border-border-default hover:text-cv-text transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-cv-muted">
        {isRegister ? 'Already have an account? ' : "Don't have an account? "}
        <Link
          href={isRegister ? '/login' : '/register'}
          className="text-gold hover:text-gold-bright transition-colors"
        >
          {isRegister ? 'Sign in' : 'Create one'}
        </Link>
      </p>

      {/* Guest preview */}
      <div className="mt-4 text-center">
        <Link href="/home" className="text-xs text-cv-muted hover:text-cv-secondary transition-colors">
          Browse as guest →
        </Link>
      </div>
    </motion.div>
  )
}
