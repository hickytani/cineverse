'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Flame, Star, Award, ChevronRight } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'

export default function TrendingPage() {
  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh', color: 'var(--text-1)' }}>
      <Navbar />
      
      <div className="pt-32 max-w-screen-xl mx-auto px-6 md:px-10 pb-20">
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="mb-16"
        >
          <p className="font-accent text-[11px] tracking-widest uppercase text-gold mb-3 flex items-center gap-2">
            <Flame className="w-4 h-4 fill-gold" />
            Vanguard
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-light mb-4 text-glow-gold">The Trending Pulse</h1>
          <p className="font-sans text-[var(--text-3)] text-lg italic max-w-xl">
            A real-time curation of the world's most captivating media, refined by the CineVerse elite.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main List */}
          <div className="lg:col-span-8 space-y-6">
            {[1, 2, 3, 4, 5].map(i => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 rounded-lg border border-border-1 bg-bg-2 flex gap-8 hover:border-gold/40 transition-all duration-500 cursor-pointer"
              >
                <div className="font-display text-4xl text-void text-outline-gold opacity-10 shrink-0 select-none">
                  {i < 10 ? `0${i}` : i}
                </div>
                <div className="w-20 aspect-[2/3] rounded bg-bg-3 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-gold mb-1 uppercase tracking-tighter">
                    <Star className="w-3 h-3 fill-gold" />
                    Top Rated This Week
                  </div>
                  <h3 className="font-display text-2xl text-text-1 mb-2 group-hover:text-gold transition-colors">Rising Star Project {i}</h3>
                  <p className="font-sans text-xs text-text-3 line-clamp-2 italic mb-4">
                    The latest sensation that's sweeping the global charts with its unique blend of traditional and modern luxury...
                  </p>
                  <div className="flex items-center gap-4 text-[9px] font-accent uppercase tracking-widest text-text-3">
                    <span>9.2 Rating</span>
                    <span>1.2M Views</span>
                    <span className="text-green-500/60">+15% Spike</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gold opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0 self-center" />
              </motion.div>
            ))}
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-4 space-y-8">
             <div className="p-8 rounded-lg border border-gold/20 bg-gradient-to-br from-bg-2 to-void relative overflow-hidden">
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-gold/5 rounded-full blur-2xl" />
                <h3 className="font-display text-xl text-text-1 mb-6 flex items-center gap-3">
                   <Award className="w-5 h-5 text-gold" />
                   Hall of Fame
                </h3>
                <div className="space-y-6">
                   {[1, 2, 3].map(i => (
                     <div key={i} className="flex gap-4 items-center">
                        <div className="w-10 h-10 rounded bg-bg-3 border border-border-1" />
                        <div>
                          <p className="text-sm font-sans font-medium text-text-2 italic">Legendary Curation {i}</p>
                          <p className="text-[10px] font-mono text-gold uppercase tracking-tighter">Gold Tier Status</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
