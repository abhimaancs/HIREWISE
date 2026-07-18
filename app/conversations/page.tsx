'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'

function ConvSkeleton() {
  return (
    <div style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <div className="skeleton" style={{ width: 46, height: 46, borderRadius: 'var(--radius-full)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton" style={{ width: '40%', height: 13, borderRadius: 'var(--radius-sm)', marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '65%', height: 11, borderRadius: 'var(--radius-sm)' }} />
      </div>
      <div className="skeleton" style={{ width: 40, height: 11, borderRadius: 'var(--radius-sm)' }} />
    </div>
  )
}

export default function ConversationsPage() {
  const supabase = createClient()
  const [convs, setConvs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<'candidate' | 'company' | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      setAuthChecked(true)
      loadConvs(session.user.id)
    }
    checkAuth()
  }, [])

  const loadConvs = async (uid: string) => {
    try {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', uid).single()
      setUserRole(profile?.role)
      const { data: conversations } = await supabase.from('conversations').select('*').or(`candidate_id.eq.${uid},company_id.eq.${uid}`).order('created_at', { ascending: false })
      if (!conversations?.length) { setLoading(false); return }
      const enriched = await Promise.all(conversations.map(async (conv: any) => {
        const otherId = conv.candidate_id === uid ? conv.company_id : conv.candidate_id
        const { data: other } = await supabase.from('profiles').select('*').eq('id', otherId).single()
        const { data: lastMsg } = await supabase.from('messages').select('content,created_at').eq('conversation_id', conv.id).order('created_at', { ascending: false }).limit(1).single()
        return { ...conv, other: other || null, last_message: lastMsg?.content || null, last_time: lastMsg?.created_at || conv.created_at }
      }))
      setConvs(enriched)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return new Date(ts).toLocaleDateString()
  }

  if (!authChecked) return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 80 }}>
        {Array.from({ length: 4 }).map((_, i) => <ConvSkeleton key={i} />)}
      </div>
    </div>
  )

  return (
    <>
      <Navbar userRole={userRole} />
      <style>{`
        .conv-row { transition: border-color 200ms ease, background-color 200ms ease, box-shadow 200ms ease; }
        .conv-row:hover { border-color: var(--accent-border) !important; background: var(--surface-1) !important; box-shadow: var(--shadow-md); }
      `}</style>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 4, fontFamily: 'var(--font-syne), sans-serif' }}>Messages</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Your conversations with {userRole === 'candidate' ? 'companies' : 'candidates'}
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 5 }).map((_, i) => <ConvSkeleton key={i} />)}
          </div>
        ) : convs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <MessageSquare size={36} style={{ color: 'var(--text-tertiary)', opacity: 0.4, marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No messages yet</p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              {userRole === 'candidate' ? 'Apply to jobs to start conversations' : 'Message candidates from the candidates page'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {convs.map((conv: any) => (
              <Link key={conv.id} href={`/chat/${conv.id}`} style={{ textDecoration: 'none' }}>
                <div className="conv-row" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 'var(--radius-full)', flexShrink: 0, background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white', fontSize: 17 }}>
                    {conv.other?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14, marginBottom: 3, letterSpacing: '-0.01em' }}>{conv.other?.name || 'Unknown'}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.last_message || 'Start the conversation!'}
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', flexShrink: 0 }}>{timeAgo(conv.last_time)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
