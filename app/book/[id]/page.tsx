'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Star, Share2, List, BookOpen, Calendar, Clock, User } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { jikanApi, openLibraryApi } from '@/lib/external'
import { useParams } from 'next/navigation'

interface BookDetail {
  id: string
  title: string
  type: 'BOOK' | 'MANGA'
  description?: string
  posterUrl?: string
  releaseYear?: string
  author?: string
  genres: string[]
  rating?: number
}

export default function BookDetailPage() {
  const { id } = useParams()
  const [book, setBook] = useState<BookDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [hoveredStar, setHoveredStar] = useState(0)

  useEffect(() => {
    if (!id) return
    const idStr = Array.isArray(id) ? id[0] : id
    
    const fetchData = async () => {
      try {
        setLoading(true)
        // If ID starts with 'OL', it's Open Library
        if (idStr.startsWith('OL')) {
          const data = (await openLibraryApi.book(idStr)) as any
          setBook({
            id: idStr,
            title: data.title,
            type: 'BOOK',
            description: typeof data.description === 'string' ? data.description : data.description?.value,
            posterUrl: data.covers?.[0] ? openLibraryApi.cover(data.covers[0], 'L') : undefined,
            releaseYear: data.first_publish_date,
            author: data.authors?.[0] ? 'Open Library Author' : undefined, 
            genres: data.subjects?.slice(0, 5) || []
          })
        } else {
          // Assume Jikan Manga (numeric ID)
          const data = (await jikanApi.manga(parseInt(idStr))) as any
          const manga = data.data
          setBook({
            id: idStr,
            title: manga.title,
            type: 'MANGA',
            description: manga.synopsis,
            posterUrl: manga.images?.webp?.large_image_url,
            releaseYear: String(manga.published?.from?.split('-')[0] || ''),
            author: manga.authors?.[0]?.name,
            genres: manga.genres?.map((g: any) => g.name) || []
          })
        }
      } catch (e) {
        console.error("Failed to fetch book details:", e)
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

  if (!book) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-void">
          <p className="font-display text-2xl text-gold/30">Volume not found.</p>
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
              className="relative aspect-[2/3] rounded-lg overflow-hidden border border-gold/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            >
              {book.posterUrl ? (
                <Image src={book.posterUrl} alt={book.title} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-bg-2 flex items-center justify-center">
                   <BookOpen className="w-20 h-20 text-gold/10" />
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
                      mediaId: book.id, 
                      action: 'watchlist',
                      metadata: { title: book.title, poster: book.posterUrl, type: book.type }
                    })
                  })
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gold text-void font-accent uppercase text-[11px] font-bold tracking-[0.2em] rounded-sm hover:bg-gold/90 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add to Library
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
                              mediaId: book.id, 
                              action: 'rate', 
                              rating: s,
                              metadata: { title: book.title, poster: book.posterUrl, type: book.type }
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
                {book.genres.map(g => (
                  <span key={g} className="text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm border border-gold/40 text-gold bg-gold/5 backdrop-blur-sm font-accent">
                    {g}
                  </span>
                ))}
              </div>

              <h1 className="font-display text-5xl md:text-7xl font-light mb-4 leading-tight">
                {book.title}
              </h1>

              <div className="flex flex-wrap items-center gap-8 text-white/50 text-[11px] font-sans tracking-widest uppercase mb-10">
                {book.author && <span className="flex items-center gap-2 text-gold"><User className="w-3.5 h-3.5" /> {book.author}</span>}
                {book.releaseYear && <span className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {book.releaseYear}</span>}
                <span className="flex items-center gap-2"><BookOpen className="w-3.5 h-3.5" /> {book.type}</span>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-[1px] w-12 bg-gold" />
                  <span className="font-accent text-xs uppercase tracking-[0.3em] text-gold/60">Prelude</span>
                </div>
                <p className="font-sans text-lg text-white/80 leading-relaxed max-w-3xl first-letter:text-5xl first-letter:font-display first-letter:text-gold first-letter:mr-3 first-letter:float-left">
                  {book.description || "The archives are silent on this work's specific narrative, yet its legacy resonates through the collection."}
                </p>
              </div>

              <div className="mt-16 pt-8 border-t border-border-1 flex items-center gap-6">
                 <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text-3 hover:text-gold transition-colors">
                   <Share2 className="w-4 h-4" /> Share
                 </button>
                 <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-text-3 hover:text-gold transition-colors">
                   <List className="w-4 h-4" /> Add to Post
                 </button>
              </div>
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  )
}
