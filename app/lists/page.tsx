'use client'

import { motion } from 'framer-motion'
import { List, Bookmark, Star, Filter, Share2, Plus } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'

const COLLECTIONS = [
  { title: 'Modern Masterpieces', items: 24, type: 'Films', author: 'CineVerse Official' },
  { title: 'Rainy Night Jazz', items: 42, type: 'Music', author: 'MelodyExpert' },
  { title: 'Dark Academia Books', items: 15, type: 'Books', author: 'LibrarianX' },
  { title: 'Sci-Fi Future-Realism', items: 56, type: 'Mixed', author: 'Dreamer_22' },
]

export default function ListsPage() {
  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh', color: 'var(--text-1)' }}>
      <Navbar />
      
      <div className="pt-32 max-w-screen-xl mx-auto px-6 md:px-10 pb-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-accent text-[11px] tracking-widest uppercase text-gold mb-3">Curation</p>
            <h1 className="font-display text-5xl md:text-6xl font-light">The Collections</h1>
          </motion.div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-3 px-6 py-3 bg-gold text-void font-accent text-xs uppercase tracking-widest rounded-sm self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Create New Collection
          </motion.button>
        </div>

        <div className="flex items-center gap-6 mb-12 border-b border-border-1 pb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {['All Collections', 'Public Lists', 'My Curations', 'Shared with Me', 'Archived'].map((tab, i) => (
            <button key={tab} className={`font-sans text-sm tracking-wide ${i === 0 ? 'text-gold' : 'text-text-3 hover:text-text-1'} transition-colors`}>
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {COLLECTIONS.map((list, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-8 rounded-lg border border-border-1 bg-bg-2 overflow-hidden flex flex-col md:flex-row gap-8 hover:border-gold/50 transition-all duration-700"
            >
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-gold/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
              
              <div className="relative w-full md:w-48 aspect-video md:aspect-[4/3] rounded-md bg-void overflow-hidden border border-border-1 shrink-0">
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-50">
                  <div className="bg-bg-3 m-0.5" /><div className="bg-bg-3 m-0.5" />
                  <div className="bg-bg-3 m-0.5" /><div className="bg-bg-3 m-0.5" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <List className="w-8 h-8 text-gold opacity-20" />
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-[10px] font-mono text-gold mb-2 uppercase tracking-widest">
                  <Bookmark className="w-3 h-3" />
                  {list.type} Collection
                </div>
                <h3 className="font-display text-2xl text-text-1 mb-2 group-hover:text-gold transition-colors">{list.title}</h3>
                <p className="font-sans text-sm text-text-3 mb-6">Curated by <span className="text-text-2">{list.author}</span> • {list.items} items</p>
                
                <div className="flex items-center gap-4 text-[10px] font-accent uppercase tracking-widest text-text-3 mt-auto">
                  <button className="flex items-center gap-2 hover:text-gold transition-colors">
                    <Star className="w-3 h-3" /> Save list
                  </button>
                  <button className="flex items-center gap-2 hover:text-gold transition-colors">
                    <Share2 className="w-3 h-3" /> Share
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
