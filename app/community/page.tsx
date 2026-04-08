'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Send, Loader2, Sparkles, MessageSquare } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { useAuthStore } from '@/store/authStore'
import { groupApi } from '@/lib/api'
import { io, Socket } from 'socket.io-client'
import Image from 'next/image'

interface Message {
  id: string
  type: 'user' | 'system'
  userId?: string
  name?: string
  avatar?: string
  text: string
  time: number
}

interface Member {
  id: string
  name: string
  avatar?: string
  role: string
}

interface Group {
  id: string
  name: string
  topic: string
  members: Member[]
}

export default function CommunityPage() {
  const { user, token } = useAuthStore()
  const [group, setGroup] = useState<Group | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState<Socket | null>(null)
  
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. Fetch group and history
  useEffect(() => {
    async function init() {
      try {
        const found = await groupApi.getCommunityGroup()
        if (found) {
          setGroup(found)
          const history = await groupApi.getMessages(found.id)
          setMessages(history.messages)
        }
      } catch (err) {
        console.error('Failed to init community:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // 2. Setup Socket.io
    useEffect(() => {
      if (!group || !token) return
  
      const s = io('http://localhost:4000', {
        path: '/socket.io',
        auth: { token }
      })

    s.on('connect', () => {
      console.log('Connected to sanctuary')
      s.emit('group:join', group.id)
    })

    s.on('group:message', (msg: Message) => {
      setMessages(prev => [...prev, msg])
    })

    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, [group, token])

  // 3. Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim() || !group) return

    try {
      await groupApi.send(group.id, inputValue)
      setInputValue('')
    } catch (err) {
      console.error('Failed to send:', err)
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-void">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--void)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="pt-24 flex-1 flex flex-col max-w-screen-xl mx-auto w-full px-4 md:px-10 pb-6 overflow-hidden">
        
        {/* Header Section */}
        <div className="flex items-end justify-between mb-6 shrink-0">
          <div>
            <p className="font-accent text-[10px] tracking-widest uppercase text-gold mb-1">Live Discourse</p>
            <h1 className="font-display text-3xl md:text-4xl font-light text-[var(--text-1)]">
              {group?.name || 'Cinematic Collective'}
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 bg-gold/5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[9px] text-gold uppercase tracking-tighter">
              {group?.members?.length || 0} Sentient Beings Active
            </span>
          </div>
        </div>

        <div className="flex-1 flex gap-6 min-h-0">
          
          {/* Chat Pane */}
          <div className="flex-1 flex flex-col rounded-lg border border-[var(--border-1)] bg-[var(--bg-2)] overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 noise pointer-events-none opacity-20" />
            
            {/* Messages Scroll Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                  <Sparkles className="w-10 h-10 mb-4 text-gold" strokeWidth={1} />
                  <p className="font-display italic text-lg text-[var(--text-2)]">The sanctuary awaits your first word.</p>
                </div>
              )}
              
              {messages.map((msg) => {
                const isMe = msg.userId === user?.id
                const isSystem = msg.type === 'system'
                
                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-4">
                      <span className="px-3 py-1 rounded-full bg-void/50 border border-border-1 font-mono text-[9px] text-[var(--text-3)] uppercase tracking-widest">
                        {msg.text}
                      </span>
                    </div>
                  )
                }

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isMe && (
                        <div className="w-8 h-8 rounded shrink-0 bg-void border border-gold/10 overflow-hidden relative">
                          <Image 
                            src={msg.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.name || 'user'}`} 
                            alt="avatar" 
                            fill 
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        {!isMe && <p className="text-[10px] font-accent text-gold mb-1 ml-1">{msg.name}</p>}
                        <div 
                          className={`px-4 py-2.5 rounded-lg text-[13px] font-sans leading-relaxed shadow-lg ${
                            isMe 
                              ? 'bg-gold text-void rounded-tr-none' 
                              : 'bg-void border border-border-1 text-[var(--text-2)] rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                          <p className={`text-[8px] mt-1 font-mono uppercase tracking-tighter opacity-60 ${isMe ? 'text-void text-right' : 'text-[var(--text-3)] text-left'}`}>
                            {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSendMessage}
              className="p-4 bg-void/50 border-t border-[var(--border-1)] flex gap-3 items-center backdrop-blur-xl"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Share your thoughts on the unfolding cinema..."
                className="flex-1 bg-bg-3 border border-border-1 rounded-md px-4 py-2.5 text-sm font-sans focus:border-gold/50 outline-none transition-all placeholder:text-[var(--text-3)] italic"
              />
              <button
                type="submit"
                className="w-10 h-10 flex items-center justify-center rounded-md bg-gold text-void hover:scale-105 transition-all shadow-gold/20"
                style={{ boxShadow: '0 0 20px rgba(191,155,48,0.1)' }}
              >
                <Send className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </form>
          </div>

          {/* Members Sidebar */}
          <div className="hidden lg:flex w-72 flex-col gap-6 shrink-0">
            <div className="p-5 rounded-lg border border-gold/30 bg-gold/5 backdrop-blur-md">
              <h3 className="font-display text-lg text-gold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                The Collective
              </h3>
              <div className="space-y-4">
                {(group?.members || []).map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="relative w-9 h-9 rounded bg-void border border-gold/20 overflow-hidden">
                      {m.avatar ? (
                        <Image src={m.avatar} alt={m.name} fill className="object-cover" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center bg-gold/5 text-gold font-bold">
                            {m.name?.[0]}
                         </div>
                      )}
                      <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-void" />
                    </div>
                    <div>
                      <p className="text-[12px] font-sans font-medium text-[var(--text-1)]">{m.name}</p>
                      <p className="text-[9px] font-accent text-gold/60 uppercase tracking-widest">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 rounded-lg border border-border-1 bg-void/50 flex-1 overflow-hidden flex flex-col">
              <h3 className="font-display text-lg text-text-1 mb-4 flex items-center gap-2 shrink-0">
                <MessageSquare className="w-4 h-4 text-gold" />
                Live Discourse
              </h3>
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                <p className="text-[11px] font-sans text-[var(--text-3)] leading-relaxed italic">
                  "Architecture is frozen music. Cinema is music that has found a home in the visual domain. Every frame in our collective archive is a testament to this union."
                </p>
                <div className="h-px bg-border-1 w-1/2" />
                <p className="text-[11px] font-sans text-[var(--text-3)] leading-relaxed italic">
                  "Bong Joon-ho once said: 'The cinema is a cemetery, but it's a cemetery that speaks.' We are the voices that keep that flame alive."
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
