'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { Message, Profile } from '@/types'
import { Send, Loader2, ArrowLeft } from 'lucide-react'

export default function ChatPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const [messages, setMessages] = useState<Message[]>([])
  const [otherUser, setOtherUser] = useState<Profile | null>(null)
  const [currentUser, setCurrentUser] = useState<Profile | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChat()
    const unsub = subscribeToMessages()
    return () => { unsub() }
  }, [params.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadChat = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: me } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    setCurrentUser(me)
    const { data: conv } = await supabase.from('conversations').select('*').eq('id', params.id).single()
    const otherId = conv?.candidate_id === user.id ? conv?.company_id : conv?.candidate_id
    const { data: other } = await supabase.from('profiles').select('*').eq('id', otherId).single()
    setOtherUser(other)
    const { data: msgs } = await supabase.from('messages').select('*').eq('conversation_id', params.id).order('created_at', { ascending: true })
    setMessages(msgs || [])
    setLoading(false)
  }

  const subscribeToMessages = () => {
    const channel = supabase.channel(`messages:${params.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${params.id}` },
        payload => { setMessages(prev => [...prev, payload.new as Message]) })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }

  const sendMessage = async () => {
    if (!text.trim() || sending || !currentUser) return
    setSending(true)
    const content = text.trim()
    setText('')
    await supabase.from('messages').insert({ conversation_id: params.id, sender_id: currentUser.id, content })
    setSending(false)
  }

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  if (loading) return (
    <>
      <Navbar userRole={currentUser?.role || null} />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Header skeleton */}
        <div className="skeleton" style={{ height: 68, borderRadius: 'var(--radius-md)' }} />
        {/* Message skeletons */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
          {[40, 60, 35, 55, 45].map((w, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end' }}>
              <div className="skeleton" style={{ width: `${w}%`, height: 38, borderRadius: 12 }} />
            </div>
          ))}
        </div>
        {/* Input skeleton */}
        <div className="skeleton" style={{ height: 56, borderRadius: 'var(--radius-md)' }} />
      </div>
    </>
  )

  return (
    <>
      <Navbar userRole={currentUser?.role || null} />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>

        {/* Chat header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, padding: '12px 16px', background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
          <button
            onClick={() => history.back()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, display: 'flex', borderRadius: 'var(--radius-sm)' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff', flexShrink: 0 }}>
            {otherUser?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, letterSpacing: '-0.01em' }}>{otherUser?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>HireWise member</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, padding: '4px 0', marginBottom: 12 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13, padding: '3rem 2rem' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>👋</div>
              Start the conversation
            </div>
          )}
          {messages.map((msg, i) => {
            const isMe = msg.sender_id === currentUser?.id
            const showTime = i === messages.length - 1 || messages[i + 1]?.sender_id !== msg.sender_id
            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '72%',
                  padding: '10px 14px',
                  borderRadius: isMe ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  background: isMe ? 'var(--accent)' : 'var(--surface-1)',
                  border: isMe ? 'none' : '1px solid var(--border)',
                  color: isMe ? '#fff' : 'var(--text-primary)',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}>
                  {msg.content}
                </div>
                {showTime && (
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4, padding: '0 4px' }}>
                    {formatTime(msg.created_at)}
                  </div>
                )}
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', flexShrink: 0 }}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type a message…"
            style={{ flex: 1, background: 'transparent', border: 'none', padding: '4px 0', fontSize: 14, boxShadow: 'none' }}
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            style={{
              width: 36, height: 36, borderRadius: 'var(--radius-sm)',
              background: text.trim() ? 'var(--accent)' : 'var(--surface-2)',
              border: 'none',
              cursor: text.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: text.trim() ? 'var(--glow-accent)' : 'none',
              transition: 'background-color 150ms ease, box-shadow 150ms ease',
            }}
          >
            {sending
              ? <Loader2 size={15} color={text.trim() ? '#fff' : 'var(--text-tertiary)'} style={{ animation: 'spin 600ms linear infinite' }} />
              : <Send size={15} color={text.trim() ? '#fff' : 'var(--text-tertiary)'} />}
          </button>
        </div>
      </div>
    </>
  )
}
