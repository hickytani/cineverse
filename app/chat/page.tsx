'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, User, Loader2, Sparkles, ChevronRight } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { useAuthStore } from '@/store/authStore'
import { chatApi } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'

interface ChatListItem {
  id: string
  lastMessage: {
    text: string
    createdAt: number
    senderId: string
  }
  recipient: {
    id: string
    username: string
    displayName: string
    avatar?: string
  }
  unreadCount: number
}

export default function ChatDashboard() {
  const { user } = useAuthStore()
  const [chats, setChats] = useState<ChatListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchChats() {
      try {
        const res = await chatApi.list()
        if (res.success) setChats(res.list)
      } catch (e) {
        console.error("Failed to fetch chats", e)
      } finally {
        setLoading(false)
      }
    }
    fetchChats()
  }, [])

  if (!user) return null

  return (
    <div style={{ background: 'var(--void)', minHeight: '100vh' }}>
      <Navbar />
      <div className="pt-24 max-w-4xl mx-auto px-6 md:px-10 pb-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="font-accent text-[10px] tracking-widest uppercase text-gold mb-1">Direct Encounters</p>
            <h1 className="font-display text-4xl font-light text-[var(--text-1)]">Identified DMs</h1>
          </div>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 bg-gold/5"
          >
            <Sparkles className="w-3 h-3 text-gold" />
            <span className="font-mono text-[9px] text-gold uppercase tracking-tighter">Real-time Node Active</span>
          </motion.div>
        </div>

        <div className="rounded-lg border border-[var(--border-1)] bg-[var(--bg-2)] overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 noise pointer-events-none opacity-20" />
          
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-gold animate-spin mb-4" />
              <p className="font-display italic text-text-3">Scanning the frequency...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center px-6">
              <MessageSquare className="w-12 h-12 text-gold/20 mb-4" strokeWidth={1} />
              <p className="font-display text-xl text-text-2 italic mb-2">The Silence is Absolute</p>
              <p className="text-sm text-text-3 font-sans max-w-xs">Visit a profile to initiate your first direct encounter.</p>
              <Link href="/community" className="mt-6 text-xs text-gold uppercase font-mono tracking-widest border-b border-gold/20 hover:border-gold transition-colors pb-1">
                Explore Community
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border-1">
              {chats.map(chat => (
                <Link 
                  key={chat.id} 
                  href={`/chat/${chat.id}`}
                  className="group flex items-center gap-4 p-5 hover:bg-void/40 transition-all"
                >
                  <div className="relative w-12 h-12 rounded bg-bg-3 border border-border-1 overflow-hidden">
                    {chat.recipient.avatar ? (
                      <Image src={chat.recipient.avatar} alt="" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gold opacity-30">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-display text-lg text-text-1 group-hover:text-gold transition-colors truncate">
                        {chat.recipient.displayName || chat.recipient.username}
                      </h3>
                      <span className="text-[9px] font-mono text-text-3 uppercase">
                        {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`text-xs font-sans truncate ${chat.unreadCount > 0 ? 'text-text-1 font-medium' : 'text-text-3'}`}>
                      {chat.lastMessage.senderId === user.id ? 'You: ' : ''}{chat.lastMessage.text}
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-3">
                    {chat.unreadCount > 0 && (
                      <div className="w-5 h-5 rounded-full bg-gold text-void text-[10px] font-bold flex items-center justify-center shadow-lg shadow-gold/20">
                        {chat.unreadCount}
                      </div>
                    )}
                    <ChevronRight className="w-4 h-4 text-text-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
