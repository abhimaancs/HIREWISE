'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { EnrichedApplication, ApplicationStatus, StatusConfig } from '@/types'
import { Loader2, Briefcase, MessageSquare, CheckCircle, Clock, XCircle, X } from 'lucide-react'

function AppRowSkeleton() {
  return (
    <div style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', gap: 14, boxShadow: 'var(--shadow-sm)' }}>
      <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <div className="skeleton" style={{ width: '45%', height: 14, borderRadius: 'var(--radius-sm)' }} />
          <div className="skeleton" style={{ width: 70, height: 20, borderRadius: 'var(--radius-full)' }} />
        </div>
        <div className="skeleton" style={{ width: '35%', height: 12, borderRadius: 'var(--radius-sm)', marginBottom: 8 }} />
        <div style={{ display: 'flex', gap: 5 }}>
          {[50, 60, 55].map(w => <div key={w} className="skeleton" style={{ width: w, height: 20, borderRadius: 'var(--radius-full)' }} />)}
        </div>
      </div>
    </div>
  )
}

export default function ApplicationsPage() {
  const supabase = createClient()
  const [applications, setApplications] = useState<EnrichedApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | ApplicationStatus>('all')
  const [userId, setUserId] = useState<string | null>(null)
  const [startingChat, setStartingChat] = useState<string | null>(null)
  const [confirmWithdraw, setConfirmWithdraw] = useState<string | null>(null)
  const [withdrawing, setWithdrawing] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      setUserId(session.user.id)
      loadApplications(session.user.id)
    }
    checkAuth()
  }, [])

  const loadApplications = async (uid: string) => {
    try {
      const { data: enriched } = await supabase
        .from('applications')
        .select(`*, job:jobs (id, company_id, title, description, required_skills, location, salary_range, job_type, is_active, created_at, company:profiles ( name ))`)
        .eq('candidate_id', uid)
        .order('applied_at', { ascending: false })
      setApplications((enriched ?? []) as EnrichedApplication[])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleWithdraw = async (appId: string, jobId: string) => {
    if (!userId) return
    setWithdrawing(appId); setConfirmWithdraw(null)
    try {
      const { error } = await supabase.from('applications').delete().eq('id', appId).eq('candidate_id', userId).eq('status', 'applied')
      if (error) throw error
      setApplications(prev => prev.filter(a => a.id !== appId))
    } catch (err: any) { alert('Failed to withdraw: ' + (err?.message || 'Please try again')) }
    finally { setWithdrawing(null) }
  }

  const startChat = async (companyId: string, jobId: string) => {
    if (!userId) return
    setStartingChat(companyId)
    try {
      const { data: existing } = await supabase.from('conversations').select('id').eq('candidate_id', userId).eq('company_id', companyId).maybeSingle()
      let convId = existing?.id
      if (!convId) {
        const { data: newConv } = await supabase.from('conversations').insert({ candidate_id: userId, company_id: companyId, job_id: jobId }).select('id').single()
        convId = newConv?.id
      }
      window.location.href = `/chat/${convId}`
    } catch (err) { console.error(err) }
    finally { setStartingChat(null) }
  }

  const filtered = applications.filter(a => filter === 'all' || a.status === filter)

  const statusConfig: Record<ApplicationStatus, StatusConfig> = {
    applied: { icon: <Clock size={11} />, bg: 'var(--accent-subtle)', color: 'var(--accent)', border: 'var(--accent-border)', label: 'Applied' },
    shortlisted: { icon: <CheckCircle size={11} />, bg: 'var(--success-subtle)', color: 'var(--success)', border: 'var(--success-border)', label: 'Shortlisted' },
    rejected: { icon: <XCircle size={11} />, bg: 'var(--danger-subtle)', color: 'var(--danger)', border: 'var(--danger-border)', label: 'Rejected' },
  }

  const counts = {
    all: applications.length,
    applied: applications.filter(a => a.status === 'applied').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  }

  const statColors = { all: 'var(--accent)', applied: 'var(--accent)', shortlisted: 'var(--success)', rejected: 'var(--danger)' }

  return (
    <>
      <Navbar userRole="candidate" />
      <style>{`
        .app-row { transition: border-color 200ms ease, box-shadow 200ms ease; }
        .app-row:hover { border-color: var(--accent-border) !important; box-shadow: var(--shadow-md); }
        .filter-pill { transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease; }
      `}</style>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 4, fontFamily: 'var(--font-syne), sans-serif' }}>My Applications</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Track the status of all your job applications</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 24 }}>
          {(['all', 'applied', 'shortlisted', 'rejected'] as const).map(k => (
            <div key={k} style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '14px 16px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: statColors[k], marginBottom: 4, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums' }}>{counts[k]}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{k}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {(['all', 'applied', 'shortlisted', 'rejected'] as const).map(f => (
            <button key={f} className="filter-pill" onClick={() => setFilter(f)} style={{ padding: '7px 14px', borderRadius: 'var(--radius-full)', border: '1px solid', borderColor: filter === f ? 'var(--accent)' : 'var(--border)', background: filter === f ? 'var(--accent)' : 'transparent', color: filter === f ? '#fff' : 'var(--text-secondary)', fontSize: 12, fontWeight: filter === f ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
              {f}{f !== 'all' && ` (${counts[f]})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 4 }).map((_, i) => <AppRowSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <Briefcase size={36} style={{ color: 'var(--text-tertiary)', opacity: 0.4, marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
              {filter === 'all' ? 'No applications yet' : `No ${filter} applications`}
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              {filter === 'all' ? 'Start applying to jobs to track them here' : `You have no ${filter} applications`}
            </p>
            {filter === 'all' && (
              <a href="/jobs" style={{ textDecoration: 'none' }}>
                <button style={{ padding: '9px 20px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Browse jobs →
                </button>
              </a>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((app: EnrichedApplication) => {
              const status = statusConfig[app.status]
              const canWithdraw = app.status === 'applied'
              const isWithdrawing = withdrawing === app.id
              const showConfirm = confirmWithdraw === app.id
              const job = app.job

              return (
                <div key={app.id} className="app-row" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', alignItems: 'flex-start', gap: 14, boxShadow: 'var(--shadow-sm)' }}>
                  {/* Avatar */}
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--accent)', fontSize: 16, flexShrink: 0 }}>
                    {app.job?.title[0] || '?'}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                        {app.job?.title || 'Job no longer available'}
                      </span>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: status.bg, color: status.color, border: `1px solid ${status.border}`, borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>
                        {status.icon}{status.label}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                      {app.job?.company?.name && `${app.job.company.name} · `}
                      {app.job?.location && `${app.job.location} · `}
                      {app.job?.job_type}
                      {app.job?.salary_range && ` · ${app.job.salary_range}`}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                      {app.job?.required_skills?.slice(0, 4).map((s: string) => (
                        <span key={s} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-full)', fontSize: 11, padding: '2px 8px' }}>{s}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                      Applied {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    {app.status === 'shortlisted' && (
                      <div style={{ marginTop: 10, background: 'var(--success-subtle)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 13, color: 'var(--success)', fontWeight: 500 }}>
                        🎉 You've been shortlisted! The company may reach out soon.
                      </div>
                    )}
                    {app.status === 'rejected' && (
                      <div style={{ marginTop: 10, background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', fontSize: 13, color: 'var(--danger)' }}>
                        This application was not selected. Keep applying!
                      </div>
                    )}
                    {showConfirm && (
                      <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px' }}>
                        <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600, flex: 1 }}>Withdraw this application? You can reapply later.</span>
                        <button onClick={() => handleWithdraw(app.id, app.job_id)} style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Withdraw</button>
                        <button onClick={() => setConfirmWithdraw(null)} style={{ display: 'flex', color: 'var(--text-tertiary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}><X size={14} /></button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    {job && app.status !== 'rejected' && (
                      <button onClick={() => startChat(job.company_id, app.job_id)} disabled={startingChat === job.company_id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {startingChat === job.company_id ? <Loader2 size={12} style={{ animation: 'spin 600ms linear infinite' }} /> : <MessageSquare size={12} />}
                        Message
                      </button>
                    )}
                    {canWithdraw && !showConfirm && (
                      <button onClick={() => setConfirmWithdraw(app.id)} disabled={isWithdrawing} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                        {isWithdrawing ? <Loader2 size={12} style={{ animation: 'spin 600ms linear infinite' }} /> : <X size={12} />}
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
