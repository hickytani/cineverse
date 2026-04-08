'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Plus, Heart } from 'lucide-react'
import { useCinematicEntry } from '@/hooks/useCinematicEntry'

export interface MuseumMediaItem {
  id: string
  title: string
  posterUrl?: string
  backdropUrl?: string
  releaseYear?: number
  languageEmoji?: string
  mainGenre?: string
  rating?: number
  isNew?: boolean
  isUpcoming?: boolean
  link: string
}

interface MediaCardProps {
  item: MuseumMediaItem
  variant?: 'poster' | 'landscape' | 'square'
  index?: number
}

export function MediaCard({ item, variant = 'poster', index = 0 }: MediaCardProps) {
  const [hovered, setHovered] = useState(false)
  const { itemVariants } = useCinematicEntry()

  const customVariants = {
    ...itemVariants,
    visible: {
      ...itemVariants.visible,
      transition: {
        ...((itemVariants.visible as { transition?: Record<string, unknown> })?.transition || {}),
        delay: index * 0.05,
      },
    },
  }

  // Dimension mapping
  const aspectClass = 
    variant === 'landscape' ? 'aspect-video w-72 md:w-80' : 
    variant === 'square' ? 'aspect-square w-48 md:w-56' : 
    'aspect-[2/3] w-36 md:w-44'

  const imgSrc = variant === 'landscape' ? item.backdropUrl : item.posterUrl

  return (
    <motion.div
      variants={customVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -100px 0px" }}
      className={`shrink-0 group cursor-pointer ${aspectClass.split(' ').slice(1).join(' ')}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={item.link} className="block w-full h-full relative">
        <div className={`relative ${aspectClass.split(' ')[0]} rounded-md overflow-hidden bg-bg-2 border border-border-1 group-hover:border-gold transition-colors duration-500 shadow-[0_8px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.8),_0_0_20px_rgba(191,155,48,0.15)] group-hover:-translate-y-1 transform ease-[cubic-bezier(0.22,1,0.36,1)]`}>
          
          {/* Image Layer */}
          {imgSrc ? (
            <div className="absolute inset-0 w-full h-full">
              <Image
                src={imgSrc}
                alt={item.title}
                fill
                className="object-cover transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] group-hover:opacity-40"
                sizes="(max-width: 768px) 250px, 350px"
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-bg-2">
              <span className="font-display text-4xl text-text-3">{item.title[0]}</span>
            </div>
          )}

          {/* Top Left Badge */}
          {(item.isNew || item.isUpcoming) && (
            <div className="absolute top-2 left-2 z-20">
              <span className={`font-accent text-[10px] tracking-widest px-1.5 py-0.5 rounded-sm uppercase ${item.isNew ? 'bg-crimson text-text-1' : 'bg-ice text-void'}`}>
                {item.isUpcoming ? 'Soon' : 'New'}
              </span>
            </div>
          )}

          {/* Top Right Rating Badge */}
          {item.rating && item.rating > 0 && variant !== 'square' && (
            <div className="absolute top-2 right-2 z-20 bg-void/80 backdrop-blur border border-border-1 rounded-full px-1.5 py-0.5 flex items-center gap-1 shadow-lg">
              <Star className="w-2.5 h-2.5 text-gold fill-gold" strokeWidth={0} />
              <span className="font-mono text-[10px] text-text-1">{item.rating.toFixed(1)}</span>
            </div>
          )}

          {/* Bottom Sliding Darkroom Metadata Overlay */}
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-0 bottom-0 p-3 pt-12 bg-grad-card flex flex-col justify-end border-t border-border-1/50"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(4,4,10,0.95) 0%, rgba(4,4,10,0.6) 60%, transparent 100%), url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`
                }}
              >
                <div className="flex items-center gap-2 mt-auto">
                  {/* Rating Big */}
                  {item.rating && item.rating > 0 ? (
                    <div className="flex flex-col items-center justify-center bg-void border border-border-1 rounded px-2 py-1">
                      <Star className="w-3 h-3 text-gold fill-gold mb-0.5" strokeWidth={0} />
                      <span className="font-mono text-xs text-text-1">{item.rating.toFixed(1)}</span>
                    </div>
                  ) : null}

                  {/* Quick Actions */}
                  <div className="flex flex-col gap-1 w-full">
                    <button
                      onClick={async (e) => {
                        e.preventDefault(); e.stopPropagation()
                        const type = item.link.includes('/book/') ? 'BOOK' : item.link.includes('/music/') ? 'MUSIC' : 'MOVIE'
                        await fetch('/api/user/state', {
                          method: 'POST',
                          body: JSON.stringify({ 
                            userId: 'demo-user', 
                            mediaId: item.id, 
                            action: 'watchlist',
                            metadata: { title: item.title, poster: item.posterUrl, type } 
                          })
                        })
                      }}
                      className="flex items-center justify-center gap-1.5 w-full bg-void/50 hover:bg-gold hover:text-void text-text-1 border border-border-1 hover:border-gold transition-all duration-300 py-1 rounded-sm text-[10px] uppercase tracking-wider font-accent group/btn"
                    >
                      <Plus className="w-3.5 h-3.5 group-hover/btn:scale-110" /> Add List
                    </button>
                    <button
                      onClick={async (e) => {
                        e.preventDefault(); e.stopPropagation()
                        const type = item.link.includes('/book/') ? 'BOOK' : item.link.includes('/music/') ? 'MUSIC' : 'MOVIE'
                        await fetch('/api/user/state', {
                          method: 'POST',
                          body: JSON.stringify({ 
                            userId: 'demo-user', 
                            mediaId: item.id, 
                            action: 'watchlist',
                            metadata: { title: item.title, poster: item.posterUrl, type }
                          })
                        })
                      }}
                      className="flex items-center justify-center gap-1.5 w-full bg-void/50 hover:bg-crimson hover:text-text-1 text-text-1 border border-border-1 hover:border-crimson transition-all duration-300 py-1 rounded-sm text-[10px] uppercase tracking-wider font-accent"
                    >
                      <Heart className="w-3.5 h-3.5" /> Watch
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Global Metadata below the card */}
        <div className="mt-2 text-left">
          <h3 className="text-sm font-sans font-medium text-text-1 group-hover:text-gold transition-colors duration-300 line-clamp-1">
            {item.title}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] font-sans text-text-3">
            {item.releaseYear && <span className="font-mono">{item.releaseYear}</span>}
            {item.releaseYear && item.languageEmoji && <span>·</span>}
            {item.languageEmoji && <span>{item.languageEmoji}</span>}
            {(item.releaseYear || item.languageEmoji) && item.mainGenre && <span>·</span>}
            {item.mainGenre && <span className="line-clamp-1">{item.mainGenre}</span>}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
