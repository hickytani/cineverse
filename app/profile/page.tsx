'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Settings, Bookmark, Star, MessageSquare, ShieldCheck } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { useAuthStore } from '@/store/authStore'
import { watchlistApi, ratingApi } from '@/lib/api'
import Image from 'next/image'

type ProfileTab = 'watchlist' | 'ratings' | 'reviews' | 'activity'

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

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<ProfileTab>('watchlist')
  const [watchlist, setWatchlist] = useState<ProfileMovie[]>([])
  const [ratings, setRatings] = useState<ProfileRating[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    const fetchProfileData = async () => {
      setLoading(true)
      try {
        const [wData, rData] = await Promise.all([
          watchlistApi.get(user.id, 'watchlist'),
          ratingApi.getForUser(user.id)
        ])
        
        if (wData.success) setWatchlist(wData.movies || [])
        if (rData.success) setRatings(rData.ratings || [])
      } catch (e) {
        console.error("Failed to fetch profile state", e)
      } finally {
        setLoading(false)
      }
    }
    fetchProfileData()
  }, [user?.id])

  const watchlistCount = watchlist.length
  const ratingsCount = ratings.length

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-void text-gold font-display italic">
        The Archive is restricted. Please identify yourself.
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
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.username} fill className="object-cover" />
                ) : (
                  <User className="w-16 h-16 text-gold/30" />
                )}
             </div>
             <div className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-gold flex items-center justify-center border-2 border-void">
                <ShieldCheck className="w-4 h-4 text-void" />
             </div>
          </motion.div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
              <h1 className="font-display text-4xl font-light text-gold">{user.displayName || user.username}</h1>
              <button className="p-2 rounded-full border border-border-1 hover:border-gold transition-colors">
                <Settings className="w-4 h-4 text-text-3" />
              </button>
            </div>
            <p className="font-sans text-text-3 italic mb-4 max-w-2xl">
              {user.bio || "Crafting a unique cinematic legacy in the Verse."}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-6 font-mono text-[10px] uppercase tracking-widest text-gold">
              <div><span className="text-text-1 text-base block font-sans">{watchlistCount}</span> Watchlist</div>
              <div><span className="text-text-1 text-base block font-sans">{ratingsCount}</span> Ratings</div>
              <div><span className="text-text-1 text-base block font-sans">1.2K</span> Credits</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="sticky top-16 z-20 border-b border-border-1" style={{ background: 'rgba(4,4,10,0.85)', backdropFilter: 'blur(16px)' }}>
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 flex items-center justify-between">
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
        {loading ? (
          <div className="flex items-center justify-center py-20">
             <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="min-h-[400px]"
            >
              {activeTab === 'watchlist' && (
                  watchlistCount > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
                      {watchlist.map(movie => (
                          <motion.div 
                            layoutId={`item-${movie.id}`}
                            key={movie.id} 
                            className="group relative aspect-[2/3] rounded-md overflow-hidden border border-border-1 bg-bg-2"
                          >
                             {movie.poster ? (
                               <Image src={movie.poster} alt={movie.title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                             ) : (
                               <div className="absolute inset-0 flex items-center justify-center p-4 bg-void/40">
                                  <p className="text-[10px] text-gold font-mono uppercase tracking-tighter text-center">{movie.title}</p>
                               </div>
                             )}
                             <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                <p className="text-[10px] text-gold font-accent uppercase tracking-widest truncate">{movie.title}</p>
                             </div>
                          </motion.div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-20 opacity-30">
                       <Bookmark className="w-12 h-12 mx-auto mb-4" />
                       <p className="font-display text-xl italic">The Gallery is Empty</p>
                    </div>
                  )
              )}

              {activeTab === 'ratings' && (
                  ratingsCount > 0 ? (
                    <div className="space-y-4 max-w-2xl mx-auto">
                      {ratings.map((r, idx) => (
                          <div key={`${r.movie.id}-${idx}`} className="flex items-center gap-6 p-4 rounded-lg border border-border-1 bg-bg-2 hover:border-gold/30 transition-all">
                             <div className="relative w-12 h-18 aspect-[2/3] rounded overflow-hidden border border-border-1">
                                {r.movie.poster && <Image src={r.movie.poster} alt="" fill className="object-cover" />}
                             </div>
                             <div className="flex-1">
                                <h3 className="font-display text-lg text-text-1">{r.movie.title}</h3>
                                {r.reviewText && (
                                  <p className="text-text-3 text-xs italic line-clamp-1 mt-1">"{r.reviewText}"</p>
                                )}
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
                          <div className="flex gap-0.5 mb-3">
                             {[...Array(10)].map((_, s) => (
                               <Star key={s} className={`w-2.5 h-2.5 ${s < r.score ? 'fill-gold' : 'opacity-10'}`} strokeWidth={0} />
                             ))}
                          </div>
                          <p className="font-serif italic text-text-2 text-lg leading-relaxed">
                            "{r.reviewText}"
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center py-20 text-center opacity-40">
                      <MessageSquare className="w-12 h-12 mb-4" />
                      <p className="font-display text-xl italic mb-2">The Archive is Silent</p>
                    </div>
                  )
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
