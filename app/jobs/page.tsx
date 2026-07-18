'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { JobMatch, CandidateProfile } from '@/types'
import { Loader2, Zap, Briefcase, CheckCircle, Search, X, ExternalLink } from 'lucide-react'

// ── Skeleton card ────────────────────────────────────────────────────────────
function JobCardSkeleton() {
  return (
    <div style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
        <div className="skeleton" style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)' }} />
        <div className="skeleton" style={{ width: 72, height: 22, borderRadius: 'var(--radius-full)' }} />
      </div>
      <div className="skeleton" style={{ width: '65%', height: 14, borderRadius: 'var(--radius-sm)', marginBottom: 8 }} />
      <div className="skeleton" style={{ width: '40%', height: 12, borderRadius: 'var(--radius-sm)', marginBottom: 12 }} />
      <div className="skeleton" style={{ width: '100%', height: 42, borderRadius: 'var(--radius-sm)', marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[60, 70, 55, 65].map(w => (
          <div key={w} className="skeleton" style={{ width: w, height: 22, borderRadius: 'var(--radius-full)' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ width: 80, height: 32, borderRadius: 'var(--radius-sm)' }} />
      </div>
    </div>
  )
}

// ── Score chip following design system spec ───────────────────────────────────
function ScoreChip({ score }: { score: number }) {
  const high = score >= 80
  const mid = score >= 50 && score < 80
  const style: React.CSSProperties = high
    ? { background: 'linear-gradient(135deg, var(--score-high-from), var(--score-high-to))', color: 'var(--bg)', boxShadow: 'var(--glow-success)' }
    : mid
      ? { background: 'linear-gradient(135deg, var(--score-mid-from), var(--score-mid-to))', color: '#18181B' }
      : { background: 'var(--score-low-bg)', color: 'var(--score-low-text)' }
  return (
    <span style={{ ...style, borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 800, padding: '3px 10px', letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums' }}>
      {score}%
    </span>
  )
}

export default function JobsPage() {
  const supabase = createClient()
  const router = useRouter()
  const [matches, setMatches] = useState<JobMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [matching, setMatching] = useState(false)
  const [filter, setFilter] = useState<'all' | 'remote' | 'internship'>('all')
  const [search, setSearch] = useState('')
  const [profile, setProfile] = useState<CandidateProfile | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [jobStatuses, setJobStatuses] = useState<Record<string, string>>({})
  const [applying, setApplying] = useState<string | null>(null)
  const [withdrawing, setWithdrawing] = useState<string | null>(null)
  const [confirmWithdraw, setConfirmWithdraw] = useState<string | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      setUserId(session.user.id)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
      const { data: c } = await supabase.from('candidate_profiles').select('*').eq('id', session.user.id).maybeSingle()
      const candidate = { ...(p ?? {}), ...(c ?? {}) } as CandidateProfile
      setProfile(candidate)
      const { data: apps } = await supabase.from('applications').select('job_id, status').eq('candidate_id', session.user.id)
      if (apps) {
        const map: Record<string, string> = {}
        apps.forEach((a: any) => { map[a.job_id] = a.status })
        setJobStatuses(map)
      }
      const { data: jobs } = await supabase.from('jobs').select('*').eq('is_active', true).limit(20)
      if (!jobs?.length) { setLoading(false); return }
      setMatching(true)
      const res = await fetch('/api/match-jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ candidate, jobs }) })
      const { matches: m } = await res.json()
      setMatches(m || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false); setMatching(false) }
  }

  const handleApply = async (jobId: string) => {
    if (!userId || jobStatuses[jobId]) return
    setApplying(jobId)
    try {
      const { error } = await supabase.from('applications').insert({ candidate_id: userId, job_id: jobId, status: 'applied' })
      if (error && error.code !== '23505') throw error
      setJobStatuses(prev => ({ ...prev, [jobId]: 'applied' }))
    } catch (err: any) { alert('Failed to apply: ' + (err?.message || 'Please try again')) }
    finally { setApplying(null) }
  }

  const handleWithdraw = async (jobId: string) => {
    if (!userId) return
    setWithdrawing(jobId); setConfirmWithdraw(null)
    try {
      const { error } = await supabase.from('applications').delete().eq('candidate_id', userId).eq('job_id', jobId).eq('status', 'applied')
      if (error) throw error
      setJobStatuses(prev => { const next = { ...prev }; delete next[jobId]; return next })
    } catch (err: any) { alert('Failed to withdraw: ' + (err?.message || 'Please try again')) }
    finally { setWithdrawing(null) }
  }

  const filtered = matches.filter(m => {
    if (filter === 'remote') return m.job.job_type === 'remote'
    if (filter === 'internship') return m.job.job_type === 'internship'
    if (search) return m.job.title.toLowerCase().includes(search.toLowerCase()) || m.job.required_skills?.some((s: string) => s.toLowerCase().includes(search.toLowerCase()))
    return true
  })

  const appliedCount = Object.keys(jobStatuses).length
  const colors: Record<string, string> = { G: '#4285f4', R: '#2563eb', S: '#f97316', Z: '#8b5cf6', T: '#059669', F: '#dc2626', A: '#d97706', M: '#0891b2' }

  return (
    <>
      <Navbar userRole="candidate" />
      <style>{`
        .job-card { transition: border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease; }
        .job-card:hover { border-color: var(--accent-border) !important; transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .filter-pill { transition: background-color 150ms ease, border-color 150ms ease, color 150ms ease; }
        @media (max-width: 640px) { .jobs-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* AI banner */}
        {profile && (
          <div style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-md)', padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {matching ? <Loader2 size={16} color="#fff" style={{ animation: 'spin 600ms linear infinite' }} /> : <Zap size={16} color="#fff" />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                {matching ? 'AI is matching jobs for you…' : `${matches.length} jobs matched to your profile`}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile.skills?.length ? 'Based on: ' + profile.skills.slice(0, 4).join(', ') : 'Add skills to your profile for better matches'}
              </div>
            </div>
            {appliedCount > 0 && (
              <a href="/applications" style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--success)', fontWeight: 600, background: 'var(--success-subtle)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-full)', padding: '4px 12px' }}>
                  <CheckCircle size={12} />{appliedCount} applied — View →
                </div>
              </a>
            )}
            <a href="/profile" style={{ textDecoration: 'none' }}>
              <button style={{ padding: '6px 12px', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                Update profile
              </button>
            </a>
          </div>
        )}

        {/* Filters + search */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          {(['all', 'remote', 'internship'] as const).map(f => (
            <button key={f} className="filter-pill" onClick={() => setFilter(f)} style={{ padding: '7px 16px', borderRadius: 'var(--radius-full)', border: '1px solid', borderColor: filter === f ? 'var(--accent)' : 'var(--border)', background: filter === f ? 'var(--accent)' : 'transparent', color: filter === f ? '#fff' : 'var(--text-secondary)', fontSize: 13, fontWeight: filter === f ? 600 : 500, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search roles or skills…" style={{ paddingLeft: 32, width: 220, fontSize: 13 }} />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="jobs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <Briefcase size={36} style={{ color: 'var(--text-tertiary)', opacity: 0.4, marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No jobs found</p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
              {search ? 'Try a different search term' : 'Complete your profile to get AI-matched jobs'}
            </p>
            <a href="/profile" style={{ textDecoration: 'none' }}>
              <button style={{ padding: '9px 20px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Complete profile →
              </button>
            </a>
          </div>
        ) : (
          <div className="jobs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {filtered.map(({ job, match_score, match_reason }) => {
              const status = jobStatuses[job.id]
              const isApplied = !!status
              const canWithdraw = status === 'applied'
              const isApplying = applying === job.id
              const isWithdrawing = withdrawing === job.id
              const showConfirm = confirmWithdraw === job.id
              const initial = job.title[0].toUpperCase()
              const color = colors[initial] || 'var(--accent)'

              return (
                <div
                  key={job.id}
                  className="job-card"
                  onClick={() => router.push(`/jobs/${job.id}`)}
                  style={{ background: 'var(--surface-0)', border: `1px solid ${isApplied ? 'var(--success-border)' : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', padding: 20, cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color, fontSize: 16 }}>{initial}</div>
                    <ScoreChip score={match_score} />
                  </div>

                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, letterSpacing: '-0.01em' }}>{job.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>{job.location} · <span style={{ textTransform: 'capitalize' }}>{job.job_type}</span></div>

                  {/* AI reason */}
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12, background: 'var(--surface-1)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', borderLeft: '2px solid var(--accent-border)' }}>
                    {match_reason}
                  </div>

                  {/* Skills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
                    {job.required_skills?.slice(0, 4).map((s: string) => (
                      <span key={s} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-full)', fontSize: 11, padding: '3px 8px', fontWeight: 500 }}>{s}</span>
                    ))}
                  </div>

                  {/* Bottom: salary + action */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em' }}>{job.salary_range || 'Salary not listed'}</span>

                    {showConfirm ? (
                      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', padding: '5px 10px' }}>
                        <span style={{ fontSize: 11, color: 'var(--danger)', fontWeight: 600 }}>Withdraw?</span>
                        <button onClick={() => handleWithdraw(job.id)} style={{ fontSize: 11, fontWeight: 700, color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Yes</button>
                        <button onClick={() => setConfirmWithdraw(null)} style={{ display: 'flex', alignItems: 'center', color: 'var(--text-tertiary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }}><X size={12} /></button>
                      </div>
                    ) : isApplied ? (
                      <div onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--success-subtle)', border: '1px solid var(--success-border)', color: 'var(--success)', fontSize: 12, fontWeight: 700 }}>
                          {isWithdrawing ? <Loader2 size={12} style={{ animation: 'spin 600ms linear infinite' }} /> : <CheckCircle size={12} />}
                          {status === 'shortlisted' ? 'Shortlisted' : status === 'rejected' ? 'Rejected' : 'Applied'}
                        </div>
                        {canWithdraw && !isWithdrawing && (
                          <button onClick={() => setConfirmWithdraw(job.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 'var(--radius-sm)', background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', color: 'var(--danger)', cursor: 'pointer', flexShrink: 0 }}>
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ) : (
                      <button onClick={e => { e.stopPropagation(); handleApply(job.id) }} disabled={isApplying} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: isApplying ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: isApplying ? 0.7 : 1 }}>
                        {isApplying ? <Loader2 size={13} style={{ animation: 'spin 600ms linear infinite' }} /> : null}
                        {isApplying ? 'Applying…' : 'Apply →'}
                      </button>
                    )}
                  </div>

                  <div style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>View details <ExternalLink size={10} /></span>
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
