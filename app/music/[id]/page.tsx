'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Music, Plus, Star, Share2, List, User, Mic2, Disc } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { lastfmApi } from '@/lib/external'
import { useParams } from 'next/navigation'

interface MusicDetail {
  id: string
  title: string
  type: 'MUSIC'
  description?: string
  posterUrl?: string
  genre?: string
  playcount?: string
  listeners?: string
  tags: string[]
}

export default function MusicDetailPage() {
  const { id } = useParams()
  const [data, setData] = useState<MusicDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredStar, setHoveredStar] = useState(0)

  useEffect(() => {
    if (!id) return
    const idStr = decodeURIComponent(Array.isArray(id) ? id[0] : id)
    
    const fetchData = async () => {
      try {
        setLoading(true)
        // Default to artist info for now
        const res = (await lastfmApi.artistInfo(idStr)) as any
        const artist = res.artist

        if (artist) {
          setData({
            id: idStr,
            title: artist.name,
            type: 'MUSIC',
            description: artist.bio?.summary,
            posterUrl: artist.image?.find((img: any) => img.size === 'mega')?.['#text'] || 
                       artist.image?.find((img: any) => img.size === 'extralarge')?.['#text'],
            listeners: artist.stats?.listeners,
            playcount: artist.stats?.playcount,
            tags: artist.tags?.tag?.map((t: any) => t.name) || []
          })
        }
      } catch (e) {
        console.error("Failed to fetch music details:", e)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-void">
          <p className="font-display text-2xl text-gold/30">Artist not found.</p>
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-void text-text-1">
      <Navbar />
      
      <main className="pt-24 pb-20 max-w-screen-xl mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row gap-12">
          
          {/* ── Left Side: Poster & Actions ── */}
          <div className="w-full md:w-80 shrink-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-full overflow-hidden border border-gold/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            >
              {data.posterUrl ? (
                <Image src={data.posterUrl} alt={data.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-bg-2 flex items-center justify-center">
                   <Mic2 className="w-20 h-20 text-gold/10" />
                </div>
              )}
            </motion.div>

            <div className="mt-8 flex flex-col gap-3">
              <button
                onClick={async () => {
                  await fetch('/api/user/state', {
                    method: 'POST',
                    body: JSON.stringify({ 
                      userId: 'demo-user', 
                      mediaId: data.id, 
                      action: 'watchlist',
                      metadata: { title: data.title, poster: data.posterUrl, type: 'MUSIC' }
                    })
                  })
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-void border border-gold/40 text-gold font-accent uppercase text-[11px] font-bold tracking-[0.2em] rounded-sm hover:bg-gold hover:text-void transition-all shadow-[0_0_20px_rgba(191,155,48,0.1)]"
              >
                <Plus className="w-4 h-4" /> Add to Collection
              </button>
              
              <div className="flex items-center gap-2 px-4 py-3 bg-bg-2 border border-border-1 rounded-sm">
                 <span className="font-accent text-[9px] uppercase tracking-widest text-gold/50">Rate</span>
                 <div className="flex gap-1">
                   {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                     <button
                       key={s}
                       onMouseEnter={() => setHoveredStar(s)}
                       onMouseLeave={() => setHoveredStar(0)}
                       onClick={async () => {
                         await fetch('/api/user/state', {
                            method: 'POST',
                            body: JSON.stringify({ 
                              userId: 'demo-user', 
                              mediaId: data.id, 
                              action: 'rate', 
                              rating: s,
                              metadata: { title: data.title, poster: data.posterUrl, type: 'MUSIC' }
                            })
                         })
                       }}
                       className="transition-all"
                     >
                       <Star 
                         className={`w-3.5 h-3.5 ${s <= hoveredStar ? 'text-gold fill-gold' : 'text-text-3'}`} 
                         strokeWidth={1} 
                       />
                     </button>
                   ))}
                 </div>
              </div>
            </div>
          </div>

          {/* ── Right Side: Metadata ── */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {data.tags.slice(0, 5).map(t => (
                  <span key={t} className="text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm border border-gold/40 text-gold bg-gold/5 backdrop-blur-sm font-accent">
                    {t}
                  </span>
                ))}
              </div>

              <h1 className="font-display text-5xl md:text-8xl font-light mb-6 leading-none">
                {data.title}
              </h1>

              <div className="flex flex-wrap items-center gap-10 text-white/50 text-[11px] font-sans tracking-widest uppercase mb-12">
                <div className="flex flex-col gap-1">
                   <span className="text-[9px] text-gold/40">Listeners</span>
                   <span className="text-white text-lg font-mono">{(parseInt(data.listeners || '0') / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[9px] text-gold/40">Playcount</span>
                   <span className="text-white text-lg font-mono">{(parseInt(data.playcount || '0') / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex flex-col gap-1">
                   <span className="text-[9px] text-gold/40">Medium</span>
                   <span className="text-white text-lg font-accent">Digital Archive</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-[1px] w-12 bg-gold" />
                  <span className="font-accent text-xs uppercase tracking-[0.3em] text-gold/60">Biography</span>
                </div>
                <p className="font-sans text-lg text-white/80 leading-relaxed max-w-3xl first-letter:text-5xl first-letter:font-display first-letter:text-gold first-letter:mr-3 first-letter:float-left" dangerouslySetInnerHTML={{ __html: data.description || "The biography of this artist remains unwritten in the current archives." }}>
                </p>
              </div>

              <div className="mt-16 pt-8 border-t border-border-1 flex items-center gap-8">
                 <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text-3 hover:text-gold transition-colors">
                   <Mic2 className="w-4 h-4" /> Artist Bio
                 </button>
                 <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text-3 hover:text-gold transition-colors">
                   <Disc className="w-4 h-4" /> Top Tracks
                 </button>
                 <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text-3 hover:text-gold transition-colors">
                   <Share2 className="w-4 h-4" /> Share
                 </button>
              </div>
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  )
}
