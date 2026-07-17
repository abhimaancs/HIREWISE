'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { CandidateProfile, Job, EnrichedApplicant, CandidateMatch, ApplicationStatus, StatusStyle } from '@/types'
import { Loader2, MessageSquare, Star, ChevronDown, Users, Briefcase, CheckCircle, X, XCircle } from 'lucide-react'

function CandidatesContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const jobId = searchParams.get('job')
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [matches, setMatches] = useState<CandidateMatch[]>([])
  const [applicants, setApplicants] = useState<EnrichedApplicant[]>([])
  const [loading, setLoading] = useState(true)
  const [matching, setMatching] = useState(false)
  const [tab, setTab] = useState<'applicants' | 'ai'>('applicants')
  const [startingChat, setStartingChat] = useState<string | null>(null)
  // appId showing inline reject confirmation
  const [confirmReject, setConfirmReject] = useState<string | null>(null)
  // appId currently being updated — shows spinner on card
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  useEffect(() => { loadJobs() }, [])
  useEffect(() => { if (selectedJob) { matchCandidates(selectedJob) } }, [selectedJob])

  const loadJobs = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { window.location.href = '/login'; return }
    const { data } = await supabase.from('jobs').select('*').eq('company_id', session.user.id).order('created_at', { ascending: false })
    setJobs(data || [])
    const target = data?.find(j => j.id === jobId) || data?.[0]
    if (target) {
      setSelectedJob(target)
      loadApplicants(target.id)
    } else {
      setLoading(false)
    }
  }

  const loadApplicants = async (jid: string) => {
    try {
      const { data: apps } = await supabase.from('applications').select('*').eq('job_id', jid).order('applied_at', { ascending: false })
      if (!apps?.length) { setApplicants([]); return }
      const enriched = await Promise.all(apps.map(async (app: EnrichedApplicant) => {
        const { data: candidate } = await supabase.from('profiles').select('*').eq('id', app.candidate_id).single()
        const { data: details } = await supabase.from('candidate_profiles').select('*').eq('id', app.candidate_id).single()
        return { ...app, candidate, candidate_details: details } as EnrichedApplicant
      }))
      setApplicants((enriched ?? []).filter(
        (app, index, self) => self.findIndex(a => a.id === app.id) === index
      ))
    } catch (err) { console.error(err) }
  }

  const matchCandidates = async (job: Job) => {
    setMatching(true); setMatches([])
    try {
      const { data: profiles } = await supabase.from('profiles').select('*').eq('role', 'candidate')
      const { data: details } = await supabase.from('candidate_profiles').select('*')
      if (!profiles?.length) { setMatching(false); setLoading(false); return }
      const candidates: CandidateProfile[] = profiles.map(p => ({ ...p, ...(details?.find(c => c.id === p.id) || {}) }))
      const res = await fetch('/api/match-candidates', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job, candidates }) })
      const { matches: m } = await res.json()
      setMatches(m || [])
    } catch (err) { console.error(err) }
    finally { setMatching(false); setLoading(false) }
  }

  const startChat = async (candidateId: string) => {
    setStartingChat(candidateId)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data: existing } = await supabase.from('conversations').select('id').eq('candidate_id', candidateId).eq('company_id', session.user.id).maybeSingle()
    let convId = existing?.id
    if (!convId) {
      const { data: newConv } = await supabase.from('conversations').insert({ candidate_id: candidateId, company_id: session.user.id, job_id: selectedJob?.id }).select('id').single()
      convId = newConv?.id
    }
    window.location.href = `/chat/${convId}`
    setStartingChat(null)
  }

  // Wrapped to track in-flight updates per card
  const updateStatus = async (appId: string, status: string) => {
    setUpdatingStatus(appId)
    setConfirmReject(null)
    await supabase.from('applications').update({ status }).eq('id', appId)
    if (selectedJob) await loadApplicants(selectedJob.id)
    setUpdatingStatus(null)
  }

  // ── Style helpers ─────────────────────────────────────────────────────────
  const scoreColor = (s: number) => s >= 85 ? '#34d399' : s >= 70 ? '#818cf8' : '#9ca3af'
  const scoreBg = (s: number) => s >= 85 ? 'rgba(16,185,129,0.15)' : s >= 70 ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)'
  const scoreBorder = (s: number) => s >= 85 ? 'rgba(16,185,129,0.3)' : s >= 70 ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.1)'

  const statusColors: Record<ApplicationStatus, StatusStyle> = {
    applied: { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', border: 'rgba(99,102,241,0.25)' },
    shortlisted: { bg: 'rgba(16,185,129,0.12)', color: '#34d399', border: 'rgba(16,185,129,0.25)' },
    rejected: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', border: 'rgba(239,68,68,0.25)' },
  }

  const statusLabel: Record<ApplicationStatus, string> = {
    applied: 'Applied',
    shortlisted: 'Shortlisted',
    rejected: 'Rejected',
  }

  const statusIcon: Record<ApplicationStatus, React.ReactNode> = {
    applied: null,
    shortlisted: <CheckCircle size={11} />,
    rejected: <XCircle size={11} />,
  }

  return (
    <>
      <Navbar userRole="company" />

      <style>{`
        @media (max-width: 768px) {
          .cand-card { flex-direction: column !important; align-items: flex-start !important; }
          .cand-actions { flex-direction: row !important; flex-wrap: wrap !important; width: 100% !important; }
          .cand-actions button { flex: 1 !important; justify-content: center !important; }
        }
        @media (max-width: 480px) {
          .cand-actions { flex-direction: column !important; }
        }
      `}</style>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', marginBottom: 4 }}>Candidates</h1>
            <p style={{ fontSize: 13, color: '#6b7280' }}>View applicants and AI-ranked matches</p>
          </div>
          {jobs.length > 0 && (
            <div style={{ position: 'relative' }}>
              <select
                value={selectedJob?.id || ''}
                onChange={e => { const j = jobs.find(j => j.id === e.target.value); if (j) { setSelectedJob(j); loadApplicants(j.id) } }}
                style={{ paddingRight: '2rem', appearance: 'none', cursor: 'pointer', minWidth: 220, color: '#f1f1f1' }}
              >
                {jobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7280', pointerEvents: 'none' }} />
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 4, width: 'fit-content', marginBottom: '1.5rem' }}>
          {[
            { id: 'applicants', label: `Applicants (${applicants.length})`, icon: <Users size={13} /> },
            { id: 'ai', label: 'AI Ranked', icon: <Star size={13} /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as 'applicants' | 'ai')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: 'none', background: tab === t.id ? 'rgba(99,102,241,0.2)' : 'transparent', color: tab === t.id ? '#818cf8' : '#6b7280', fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.15s' }}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          </div>

          /* ── Applicants tab ── */
        ) : tab === 'applicants' ? (
          applicants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
              <Users size={40} style={{ marginBottom: 12, opacity: 0.2 }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: '#e5e7eb', marginBottom: 6 }}>No applicants yet</p>
              <p style={{ fontSize: 13 }}>Candidates who apply will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {applicants.map((app: EnrichedApplicant) => {
                const sc = statusColors[app.status]
                const isUpdating = updatingStatus === app.id
                const showConfirm = confirmReject === app.id
                const isShortlisted = app.status === 'shortlisted'
                const isRejected = app.status === 'rejected'
                const isApplied = app.status === 'applied'

                return (
                  <div
                    key={app.id}
                    className="cand-card"
                    style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${isShortlisted ? 'rgba(16,185,129,0.2)' : isRejected ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 16, padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'border-color 0.2s' }}
                    onMouseEnter={e => { if (!isRejected) (e.currentTarget as HTMLElement).style.borderColor = isShortlisted ? 'rgba(16,185,129,0.35)' : 'rgba(99,102,241,0.3)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = isShortlisted ? 'rgba(16,185,129,0.2)' : isRejected ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)' }}
                  >
                    {/* Avatar */}
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: isRejected ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isRejected ? '#6b7280' : '#fff', fontWeight: 800, fontSize: 17, flexShrink: 0, opacity: isRejected ? 0.6 : 1 }}>
                      {app.candidate?.name?.[0]?.toUpperCase() || '?'}
                    </div>

                    {/* Main content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Name + status badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: isRejected ? '#6b7280' : '#f1f1f1', letterSpacing: '-0.2px' }}>
                          {app.candidate?.name || 'Unknown'}
                        </span>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>
                          {statusIcon[app.status]}{statusLabel[app.status]}
                        </div>
                      </div>

                      {/* Meta */}
                      <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                        Applied {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {app.candidate_details?.college && ` · 🎓 ${app.candidate_details.college}`}
                        {app.candidate_details?.experience_years === 0 ? ' · 💼 Fresher' : app.candidate_details?.experience_years ? ` · 💼 ${app.candidate_details.experience_years}y exp` : ''}
                      </div>

                      {/* Skills */}
                      {app.candidate_details?.skills?.length ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                          {app.candidate_details.skills.slice(0, 5).map((s: string) => (
                            <span key={s} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af', borderRadius: 7, fontSize: 11, padding: '3px 8px', fontWeight: 500 }}>{s}</span>
                          ))}
                        </div>
                      ) : null}

                      {/* Inline reject confirmation */}
                      {showConfirm && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 9, padding: '8px 12px', marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: '#f87171', fontWeight: 600, flex: 1 }}>
                            Reject this candidate? This cannot be undone.
                          </span>
                          <button
                            onClick={() => updateStatus(app.id, 'rejected')}
                            style={{ fontSize: 12, fontWeight: 700, color: '#f87171', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, padding: '4px 12px', cursor: 'pointer', fontFamily: 'Inter,sans-serif', whiteSpace: 'nowrap' }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmReject(null)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4 }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions column */}
                    <div className="cand-actions" style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, minWidth: 120 }}>
                      {isUpdating ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}>
                          <Loader2 size={18} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />
                        </div>

                      ) : isShortlisted ? (
                        <>
                          {/* Message still available when shortlisted */}
                          <button
                            onClick={() => startChat(app.candidate_id)}
                            disabled={startingChat === app.candidate_id}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, color: '#818cf8', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
                          >
                            {startingChat === app.candidate_id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <MessageSquare size={12} />}
                            Message
                          </button>
                          {/* Locked shortlisted badge */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 12px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, color: '#34d399', fontSize: 12, fontWeight: 700 }}>
                            <CheckCircle size={12} /> Shortlisted
                          </div>
                        </>

                      ) : isRejected ? (
                        /* Locked rejected badge — no actions */
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', fontSize: 12, fontWeight: 700 }}>
                          <XCircle size={12} /> Rejected
                        </div>

                      ) : (
                        /* Applied — full action set */
                        <>
                          {/* Message — secondary */}
                          <button
                            onClick={() => startChat(app.candidate_id)}
                            disabled={startingChat === app.candidate_id}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 8, color: '#818cf8', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.15s' }}
                          >
                            {startingChat === app.candidate_id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <MessageSquare size={12} />}
                            Message
                          </button>

                          {/* Shortlist — primary green */}
                          <button
                            onClick={() => updateStatus(app.id, 'shortlisted')}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, color: '#34d399', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.15s' }}
                          >
                            <CheckCircle size={12} /> Shortlist
                          </button>

                          {/* Reject — destructive, triggers inline confirmation */}
                          {!showConfirm && (
                            <button
                              onClick={() => setConfirmReject(app.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'all 0.15s' }}
                            >
                              <X size={12} /> Reject
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )

          /* ── AI Ranked tab ── */
        ) : matching ? (
          <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Loader2 size={18} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 14, color: '#818cf8', fontWeight: 600 }}>AI is ranking candidates...</span>
          </div>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
            <Briefcase size={40} style={{ marginBottom: 12, opacity: 0.2 }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: '#e5e7eb' }}>No candidates found yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {matches.map(({ job: candidate, match_score, match_reason }: CandidateMatch, i: number) => (
              <div
                key={candidate.id}
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.3)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)' }}
              >
                {/* Rank badge */}
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: i === 0 ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: i === 0 ? '#fbbf24' : '#6b7280', flexShrink: 0, marginTop: 8 }}>
                  {i === 0 ? <Star size={13} fill="#fbbf24" color="#fbbf24" /> : `#${i + 1}`}
                </div>

                {/* Avatar */}
                <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 17, flexShrink: 0 }}>
                  {candidate.name?.[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: '#f1f1f1', letterSpacing: '-0.2px' }}>{candidate.name}</span>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: scoreBg(match_score), color: scoreColor(match_score), border: `1px solid ${scoreBorder(match_score)}`, borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>
                      {match_score}% match
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                    {candidate.college && `🎓 ${candidate.college} · `}
                    {candidate.experience_years === 0 ? '💼 Fresher' : `💼 ${candidate.experience_years}y exp`}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '6px 10px', marginBottom: 8, borderLeft: '2px solid rgba(99,102,241,0.4)', lineHeight: 1.6 }}>
                    ✦ {match_reason}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {candidate.skills?.slice(0, 5).map((s: string) => (
                      <span key={s} style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 7, fontSize: 11, padding: '3px 8px', fontWeight: 500 }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Message button */}
                <button
                  onClick={() => startChat(candidate.id)}
                  disabled={startingChat === candidate.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, cursor: startingChat === candidate.id ? 'not-allowed' : 'pointer', fontFamily: 'Inter,sans-serif', flexShrink: 0, fontWeight: 600, opacity: startingChat === candidate.id ? 0.7 : 1, transition: 'all 0.15s' }}
                >
                  {startingChat === candidate.id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <MessageSquare size={12} />}
                  Message
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default function CandidatesPage() {
  return <Suspense><CandidatesContent /></Suspense>
}
