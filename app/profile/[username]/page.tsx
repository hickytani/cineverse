'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User as UserIcon, Bookmark, Star, MessageSquare, ShieldCheck, UserPlus, UserMinus, Send, Loader2 } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { useAuthStore } from '@/store/authStore'
import { userApi, chatApi, watchlistApi, ratingApi } from '@/lib/api'
import Image from 'next/image'

type ProfileTab = 'watchlist' | 'ratings' | 'reviews'

interface ProfileMovie {
  id: string
  title: string
  poster: string
  type?: string
}

interface ProfileRating {
  movie: ProfileMovie
  score: number
  reviewText?: string
}

interface ProfileData {
  id: string
  username: string
  displayName: string
  avatar?: string
  bio?: string
  reviewCount: number
  watchedCount: number
  watchlistCount: number
  ratingCount: number
  isFollowing: boolean
}

export default function UserProfilePage() {
  const { username } = useParams() as { username: string }
  const router = useRouter()
  const { user: currentUser } = useAuthStore()
  
  const [activeTab, setActiveTab] = useState<ProfileTab>('watchlist')
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [watchlist, setWatchlist] = useState<ProfileMovie[]>([])
  const [ratings, setRatings] = useState<ProfileRating[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const isMe = currentUser?.username === username

  useEffect(() => {
    if (!username) return

    const fetchAllData = async () => {
      setLoading(true)
      try {
        const pRes = await userApi.getProfile(username)
        if (pRes.success) {
          const p = pRes.user
          setProfile(p)
          
          const [wData, rData] = await Promise.all([
            watchlistApi.get(p.id, 'watchlist'),
            ratingApi.getForUser(p.id)
          ])
          
          if (wData.success) setWatchlist(wData.movies || [])
          if (rData.success) setRatings(rData.ratings || [])
        }
      } catch (e) {
        console.error("Failed to fetch profile", e)
      } finally {
        setLoading(false)
      }
    }
    fetchAllData()
  }, [username])

  const handleFollowToggle = async () => {
    if (!profile || !currentUser) return
    setActionLoading(true)
    try {
      if (profile.isFollowing) {
        await userApi.unfollow(profile.id)
        setProfile({ ...profile, isFollowing: false })
      } else {
        await userApi.follow(profile.id)
        setProfile({ ...profile, isFollowing: true })
      }
    } catch (e) {
      console.error("Follow action failed", e)
    } finally {
      setActionLoading(false)
    }
  }

  const handleMessage = async () => {
    if (!profile) return
    try {
      const res = await chatApi.getOrCreate(profile.id)
      if (res.success) {
        router.push(`/chat/${res.chat.id}`)
      }
    } catch (e) {
      console.error("Failed to start chat", e)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-void">
        <Loader2 className="w-10 h-10 text-gold animate-spin mb-4" />
        <p className="font-display italic text-gold/60">Fetching the Archive...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-void text-gold">
        <Navbar />
        <p className="font-display text-2xl italic">This soul hasn't joined the Verse yet.</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh', color: 'var(--text-1)' }}>
      <Navbar />

      {/* ── Profile Header ── */}
      <div className="relative pt-32 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold/5 to-transparent opacity-30 pointer-events-none" />
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center md:items-end gap-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-gold p-1 bg-void shadow-[0_0_30px_rgba(191,155,48,0.2)]"
          >
             <div className="w-full h-full rounded-full bg-bg-3 border border-border-1 flex items-center justify-center overflow-hidden relative">
                {profile.avatar ? (
                  <Image src={profile.avatar} alt={profile.username} fill className="object-cover" />
                ) : (
                  <UserIcon className="w-16 h-16 text-gold/30" />
                )}
             </div>
             <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-gold flex items-center justify-center border-2 border-void">
                <ShieldCheck className="w-4 h-4 text-void" />
             </div>
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
              <h1 className="font-display text-4xl font-light text-gold">{profile.displayName || profile.username}</h1>
              {!isMe && (
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <button 
                    onClick={handleFollowToggle}
                    disabled={actionLoading}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all ${
                      profile.isFollowing 
                        ? 'bg-transparent border border-gold text-gold hover:bg-gold/10' 
                        : 'bg-gold text-void hover:scale-105 active:scale-95'
                    }`}
                  >
                    {actionLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : (profile.isFollowing ? <UserMinus className="w-3 h-3" /> : <UserPlus className="w-3 h-3" />)}
                    {profile.isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button 
                    onClick={handleMessage}
                    className="p-2 rounded-full bg-bg-3 border border-border-1 hover:border-gold group transition-all"
                  >
                    <Send className="w-4 h-4 text-text-3 group-hover:text-gold" />
                  </button>
                </div>
              )}
            </div>
            <p className="font-sans text-text-3 italic mb-4 max-w-2xl">
              {profile.bio || "Observing the patterns of the cinematic universe."}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-6 font-mono text-[10px] uppercase tracking-widest text-gold text-center md:text-left">
              <div><span className="text-text-1 text-base block font-sans">{profile.watchlistCount}</span> Watchlist</div>
              <div><span className="text-text-1 text-base block font-sans">{profile.ratingCount}</span> Ratings</div>
              <div><span className="text-text-1 text-base block font-sans">{profile.reviewCount}</span> Reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="sticky top-16 z-20 border-b border-border-1" style={{ background: 'rgba(4,4,10,0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-10">
           <div className="flex gap-8">
              {[
                { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
                { id: 'ratings',   label: 'Ratings',   icon: Star },
                { id: 'reviews',   label: 'Reviews',   icon: MessageSquare },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ProfileTab)}
                  className={`relative py-4 flex items-center gap-2 font-sans text-sm transition-colors duration-300 ${
                    activeTab === tab.id ? 'text-gold' : 'text-text-3 hover:text-text-1'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-px bg-gold" />
                  )}
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-screen-xl mx-auto px-6 md:px-10 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="min-h-[400px]"
          >
            {activeTab === 'watchlist' && (
                watchlist.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
                    {watchlist.map(movie => (
                        <div key={movie.id} className="group relative aspect-[2/3] rounded-md overflow-hidden border border-border-1 bg-bg-2">
                           {movie.poster ? (
                             <Image src={movie.poster} alt={movie.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                           ) : (
                             <div className="absolute inset-0 flex items-center justify-center p-4 bg-void/40">
                                <p className="text-[10px] text-gold font-mono uppercase tracking-tighter text-center">{movie.title}</p>
                             </div>
                           )}
                        </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 opacity-30">
                     <Bookmark className="w-12 h-12 mx-auto mb-4" />
                     <p className="font-display text-xl italic">The Archive is Empty</p>
                  </div>
                )
            )}

            {activeTab === 'ratings' && (
                ratings.length > 0 ? (
                  <div className="space-y-4 max-w-2xl mx-auto">
                    {ratings.map((r, idx) => (
                        <div key={idx} className="flex items-center gap-6 p-4 rounded-lg border border-border-1 bg-bg-2">
                           <div className="relative w-12 h-18 aspect-[2/3] rounded overflow-hidden border border-border-1 shrink-0">
                              {r.movie.poster && <Image src={r.movie.poster} alt="" fill className="object-cover" />}
                           </div>
                           <div className="flex-1">
                              <h3 className="font-display text-lg text-text-1">{r.movie.title}</h3>
                              {r.reviewText && <p className="text-text-3 text-xs italic line-clamp-1 mt-1">"{r.reviewText}"</p>}
                           </div>
                           <div className="flex flex-col items-end gap-1">
                              <div className="flex gap-0.5 text-gold">
                                 {[...Array(10)].map((_, s) => (
                                   <Star key={s} className={`w-3 h-3 ${s < r.score ? 'fill-gold' : 'opacity-20'}`} strokeWidth={0} />
                                 ))}
                              </div>
                              <span className="font-mono text-sm text-gold">{r.score}.0</span>
                           </div>
                        </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 opacity-30">
                     <Star className="w-12 h-12 mx-auto mb-4" />
                     <p className="font-display text-xl italic">No Accolades Yet</p>
                  </div>
                )
            )}

            {activeTab === 'reviews' && (
                ratings.some(r => r.reviewText) ? (
                  <div className="space-y-8 max-w-3xl mx-auto">
                    {ratings.filter(r => r.reviewText).map((r, idx) => (
                      <div key={idx} className="border-l border-gold/30 pl-6 relative">
                        <div className="absolute -left-1 top-0 w-2 h-2 rounded-full bg-gold" />
                        <h4 className="font-display text-xl text-gold mb-2">{r.movie.title}</h4>
                        <p className="font-serif italic text-text-2 text-lg leading-relaxed">"{r.reviewText}"</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 opacity-30">
                     <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                     <p className="font-display text-xl italic">The Archive is Silent</p>
                  </div>
                )
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
