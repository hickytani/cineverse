'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Send, Loader2, Sparkles, ChevronLeft, ShieldCheck } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { useAuthStore } from '@/store/authStore'
import { chatApi } from '@/lib/api'
import { io, Socket } from 'socket.io-client'
import Image from 'next/image'
import Link from 'next/link'

interface Message {
  id: string
  senderId: string
  text: string
  createdAt: number
  read: boolean
}

interface ChatPartner {
  id: string
  username: string
  displayName: string
  avatar?: string
}

export default function ChatPage() {
  const { chatId } = useParams() as { chatId: string }
  const router = useRouter()
  const { user, token } = useAuthStore()
  
  const [partner, setPartner] = useState<ChatPartner | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)

  // 1. Fetch chat history and partner info
  useEffect(() => {
    if (!chatId || !user) return

    async function initChat() {
      try {
          const res = await chatApi.getMessages(chatId)
          if (res.success) {
            setMessages(res.messages)
            setPartner(res.partner)
          }
      } catch (err) {
          console.error('Failed to init chat:', err)
          router.push('/chat')
      } finally {
          setLoading(false)
      }
    }
    initChat()
  }, [chatId, user])

  // 2. Setup Socket.io
  useEffect(() => {
    if (!chatId || !token) return

    const s = io('http://localhost:4000', {
      path: '/socket.io',
      auth: { token }
    })

    s.on('connect', () => {
      s.emit('chat:join', chatId)
    })

    s.on('chat:message', ({ message }: { message: Message }) => {
      setMessages(prev => {
          if (prev.some(m => m.id === message.id)) return prev
          return [...prev, message]
      })
    })

    s.on('chat:typing', ({ userId }) => {
      if (userId !== user?.id) {
          setIsTyping(true)
          setTimeout(() => setIsTyping(false), 3000)
      }
    })

    setSocket(s)

    return () => {
      s.disconnect()
    }
  }, [chatId, token])

  // 3. Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!inputValue.trim() || !chatId) return

    const text = inputValue.trim()
    setInputValue('')
    
    try {
      await chatApi.send(chatId, text)
    } catch (err) {
      console.error('Failed to send:', err)
    }
  }

  const handleTyping = () => {
    socket?.emit('chat:typing', { chatId })
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-void text-gold">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!partner) return null

  return (
    <div style={{ background: 'var(--void)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      
      <div className="pt-24 flex-1 flex flex-col max-w-screen-md mx-auto w-full px-4 md:px-0 pb-6 overflow-hidden">
        
        {/* Chat Header */}
        <div className="flex items-center gap-4 mb-6 shrink-0 relative px-4">
          <Link href="/chat" className="p-2 hover:bg-gold/10 rounded-full transition-colors">
            <ChevronLeft className="w-5 h-5 text-gold" />
          </Link>
          <div className="flex items-center gap-3">
             <div className="relative w-10 h-10 rounded-full bg-bg-3 border border-border-1 overflow-hidden">
                {partner.avatar ? (
                  <Image src={partner.avatar} alt="" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gold/30">
                    <User className="w-6 h-6" />
                  </div>
                )}
             </div>
             <div>
                <h2 className="font-display text-xl text-text-1">{partner.displayName || partner.username}</h2>
                <div className="flex items-center gap-1.5">
                   <div className="w-1 h-1 rounded-full bg-emerald-500" />
                   <p className="text-[9px] font-mono text-text-3 tracking-widest uppercase">Verified Nexus Channel</p>
                </div>
             </div>
          </div>
        </div>

        {/* Message Container */}
        <div className="flex-1 flex flex-col rounded-lg border border-[var(--border-1)] bg-[var(--bg-2)] overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 noise pointer-events-none opacity-20" />
            
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar"
            >
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                  <Sparkles className="w-10 h-10 mb-4 text-gold" strokeWidth={1} />
                  <p className="font-display italic text-lg text-text-2">This channel is open for encrypted discourse.</p>
                </div>
              )}
              
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <div 
                        className={`px-4 py-2.5 rounded-lg text-[13px] font-sans leading-relaxed shadow-lg ${
                          isMe 
                            ? 'bg-gold text-void rounded-tr-none' 
                            : 'bg-bg-3 border border-border-1 text-text-2 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <p className="text-[8px] mt-1 font-mono uppercase tracking-tighter opacity-40">
                         {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
              {isTyping && (
                <div className="flex justify-start">
                   <div className="bg-bg-3 border border-border-1 px-4 py-2 rounded-full flex gap-1 items-center">
                      <div className="w-1 h-1 bg-gold rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-gold rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-gold rounded-full animate-bounce [animation-delay:0.4s]" />
                   </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form 
              onSubmit={handleSend}
              className="p-4 bg-void/50 border-t border-[var(--border-1)] flex gap-3 items-center backdrop-blur-xl"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                    setInputValue(e.target.value)
                    handleTyping()
                }}
                placeholder="Compose a message..."
                className="flex-1 bg-bg-3 border border-border-1 rounded-md px-4 py-2.5 text-sm font-sans focus:border-gold/50 outline-none transition-all placeholder:text-text-3 italic"
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
      </div>
    </div>
  )
}
