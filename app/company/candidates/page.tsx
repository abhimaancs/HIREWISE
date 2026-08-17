'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { CandidateProfile, Job, EnrichedApplicant, CandidateMatch, ApplicationStatus, StatusStyle } from '@/types'
import { Loader2, MessageSquare, Star, ChevronDown, Users, Briefcase, CheckCircle, X, XCircle, RotateCcw } from 'lucide-react'

// Singleton client — not recreated on every render/remount
const supabase = createClient()

function CandidatesContent() {
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
  // toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  // guard: tracks the active fetch so stale results from previous job selections are discarded
  const loadApplicantsTokenRef = useRef(0)

  useEffect(() => {
    let cancelled = false
    loadJobs(cancelled)
    return () => { cancelled = true }
  }, [])

  const loadJobs = async (cancelled = false) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (cancelled || !session) { if (!session) window.location.href = '/login'; return }
    const { data } = await supabase.from('jobs').select('*').eq('company_id', session.user.id).order('created_at', { ascending: false })
    if (cancelled) return
    setJobs(data || [])
    const target = data?.find(j => j.id === jobId) || data?.[0]
    if (target) {
      setSelectedJob(target)
      loadApplicants(target.id)
      matchCandidates(target)
    } else {
      setLoading(false)
    }
  }

  const loadApplicants = async (jid: string) => {
    // Increment token — any in-flight call with an older token will discard its result
    const token = ++loadApplicantsTokenRef.current
    try {
      const { data: apps } = await supabase
        .from('applications')
        .select('*')
        .eq('job_id', jid)
        .order('applied_at', { ascending: false })

      // Discard result if a newer call has already started
      if (token !== loadApplicantsTokenRef.current) return

      if (!apps?.length) { setApplicants([]); return }

      const enriched = await Promise.all(apps.map(async (app: EnrichedApplicant) => {
        const { data: candidate } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', app.candidate_id)
          .eq('role', 'candidate')
          .maybeSingle()
        const { data: details } = await supabase
          .from('candidate_profiles')
          .select('*')
          .eq('id', app.candidate_id)
          .maybeSingle()
        // Skip if profile is missing or not a candidate role
        if (!candidate) return null
        return { ...app, candidate, candidate_details: details } as EnrichedApplicant
      }))

      // Final staleness check after the inner Promise.all
      if (token !== loadApplicantsTokenRef.current) return

      setApplicants(
        enriched
          .filter((app): app is EnrichedApplicant => app !== null)
          .filter((app, index, self) => self.findIndex(a => a.id === app.id) === index)
      )
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

  // Optimistic update — updates local state immediately, syncs to DB, shows toast
  const updateStatus = async (appId: string, status: ApplicationStatus) => {
    setUpdatingStatus(appId)
    setConfirmReject(null)
    setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
    const { error } = await supabase.from('applications').update({ status }).eq('id', appId)
    setUpdatingStatus(null)
    if (error) {
      if (selectedJob) await loadApplicants(selectedJob.id)
      showToast('Failed to update status. Please try again.', 'error')
    } else {
      const labels: Record<ApplicationStatus, string> = {
        applied: 'Moved back to Applied',
        shortlisted: 'Candidate shortlisted',
        rejected: 'Candidate rejected',
      }
      showToast(labels[status], 'success')
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Style helpers ─────────────────────────────────────────────────────────
  const scoreColor = (s: number) => s >= 85 ? 'var(--success)' : s >= 70 ? 'var(--accent)' : 'var(--text-tertiary)'
  const scoreBg = (s: number) => s >= 85 ? 'var(--success-subtle)' : s >= 70 ? 'var(--accent-subtle)' : 'var(--surface-2)'
  const scoreBorder = (s: number) => s >= 85 ? 'var(--success-border)' : s >= 70 ? 'var(--accent-border)' : 'var(--border)'

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

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          zIndex: 500, display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 20px', borderRadius: 12,
          background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)'}`,
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          fontSize: 13, fontWeight: 600,
          color: toast.type === 'success' ? '#34d399' : '#f87171',
          whiteSpace: 'nowrap',
          animation: 'fadeUp 0.2s ease',
        }}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <XCircle size={15} />}
          {toast.message}
        </div>
      )}

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translate(-50%,8px) } to { opacity:1; transform:translate(-50%,0) } }
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
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 4, fontFamily: 'var(--font-syne), sans-serif' }}>Candidates</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>View applicants and AI-ranked matches</p>
          </div>
          {jobs.length > 0 && (
            <div style={{ position: 'relative' }}>
              <select
                value={selectedJob?.id || ''}
                onChange={e => { const j = jobs.find(j => j.id === e.target.value); if (j) { setSelectedJob(j); loadApplicants(j.id); matchCandidates(j) } }}
                style={{ paddingRight: '2rem', appearance: 'none', cursor: 'pointer', minWidth: 220, color: 'var(--text-primary)' }}
              >
                {jobs.map(job => <option key={job.id} value={job.id}>{job.title}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: 4, width: 'fit-content', marginBottom: '1.5rem' }}>
          {[
            { id: 'applicants', label: `Applicants (${applicants.length})`, icon: <Users size={13} /> },
            { id: 'ai', label: 'AI Ranked', icon: <Star size={13} /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as 'applicants' | 'ai')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 'var(--radius-sm)', border: 'none', background: tab === t.id ? 'var(--accent)' : 'transparent', color: tab === t.id ? '#fff' : 'var(--text-secondary)', fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer', fontFamily: 'inherit', transition: 'background-color 150ms ease, color 150ms ease' }}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* ── Loading ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          </div>

          /* ── Applicants tab ── */
        ) : tab === 'applicants' ? (
          applicants.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              <Users size={40} style={{ marginBottom: 12, opacity: 0.2 }} />
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>No applicants yet</p>
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
                    onClick={() => window.location.href = `/company/candidates/${app.candidate_id}`}
                    style={{ background: 'var(--surface-0)', border: `1px solid ${isShortlisted ? 'var(--success-border)' : isRejected ? 'var(--danger-border)' : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; if (!isRejected) el.style.borderColor = isShortlisted ? 'var(--success-border)' : 'var(--accent-border)'; el.style.boxShadow = 'var(--shadow-md)'; el.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = isShortlisted ? 'var(--success-border)' : isRejected ? 'var(--danger-border)' : 'var(--border)'; el.style.boxShadow = 'var(--shadow-sm)'; el.style.transform = 'translateY(0)' }}
                  >
                    {/* Avatar */}
                    <div style={{ width: 46, height: 46, borderRadius: 'var(--radius-full)', background: isRejected ? 'var(--surface-2)' : 'linear-gradient(135deg,var(--accent),var(--accent-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 17, flexShrink: 0, opacity: isRejected ? 0.6 : 1 }}>
                      {app.candidate?.name?.[0]?.toUpperCase() || '?'}
                    </div>

                    {/* Main content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Name + status badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                        <span style={{ fontWeight: 700, fontSize: 15, color: isRejected ? 'var(--text-tertiary)' : 'var(--text-primary)', letterSpacing: '-0.2px' }}>
                          {app.candidate?.name || 'Unknown'}
                        </span>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>
                          {statusIcon[app.status]}{statusLabel[app.status]}
                        </div>
                      </div>

                      {/* Meta */}
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                        Applied {new Date(app.applied_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {app.candidate_details?.college && ` · 🎓 ${app.candidate_details.college}`}
                        {app.candidate_details?.experience_years === 0 ? ' · 💼 Fresher' : app.candidate_details?.experience_years ? ` · 💼 ${app.candidate_details.experience_years}y exp` : ''}
                      </div>

                      {/* Skills */}
                      {app.candidate_details?.skills?.length ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                          {app.candidate_details.skills.slice(0, 5).map((s: string) => (
                            <span key={s} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)', fontSize: 11, padding: '3px 8px', fontWeight: 500 }}>{s}</span>
                          ))}
                        </div>
                      ) : null}

                      {/* Inline reject confirmation */}
                      {showConfirm && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', padding: '8px 12px', marginTop: 4 }}>
                          <span style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600, flex: 1 }}>
                            Reject this candidate? They can be moved back to Applied.
                          </span>
                          <button
                            onClick={() => updateStatus(app.id, 'rejected')}
                            style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)', background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', padding: '4px 12px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmReject(null)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4 }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions column */}
                    <div className="cand-actions" onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, minWidth: 120 }}>
                      {isUpdating ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}>
                          <Loader2 size={18} color="#818cf8" style={{ animation: 'spin 1s linear infinite' }} />
                        </div>

                      ) : isShortlisted ? (
                        <>
                          <button
                            onClick={() => startChat(app.candidate_id)}
                            disabled={startingChat === app.candidate_id}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                          >
                            {startingChat === app.candidate_id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <MessageSquare size={12} />}
                            Message
                          </button>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 12px', background: 'var(--success-subtle)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-sm)', color: 'var(--success)', fontSize: 12, fontWeight: 700 }}>
                            <CheckCircle size={12} /> Shortlisted
                          </div>
                          <button
                            onClick={() => updateStatus(app.id, 'applied')}
                            title="Undo shortlist — move back to Applied"
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'border-color 150ms ease, color 150ms ease' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
                          >
                            <RotateCcw size={11} /> Undo
                          </button>
                        </>

                      ) : isRejected ? (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '7px 12px', background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 12, fontWeight: 700 }}>
                            <XCircle size={12} /> Rejected
                          </div>
                          <button
                            onClick={() => updateStatus(app.id, 'applied')}
                            title="Undo rejection — move back to Applied"
                            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter,sans-serif', transition: 'border-color 150ms ease, color 150ms ease' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
                          >
                            <RotateCcw size={11} /> Undo
                          </button>
                        </>

                      ) : (
                        <>
                          <button
                            onClick={() => startChat(app.candidate_id)}
                            disabled={startingChat === app.candidate_id}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background-color 150ms ease' }}
                          >
                            {startingChat === app.candidate_id ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <MessageSquare size={12} />}
                            Message
                          </button>
                          <button
                            onClick={() => updateStatus(app.id, 'shortlisted')}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'var(--success-subtle)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-sm)', color: 'var(--success)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'background-color 150ms ease' }}
                          >
                            <CheckCircle size={12} /> Shortlist
                          </button>
                          {!showConfirm && (
                            <button
                              onClick={() => setConfirmReject(app.id)}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'background-color 150ms ease' }}
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
          <div style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
            <Loader2 size={18} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: 14, color: 'var(--accent)', fontWeight: 600 }}>AI is ranking candidates...</span>
          </div>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <Briefcase size={40} style={{ marginBottom: 12, opacity: 0.2 }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>No candidates found yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {matches.map(({ job: candidate, match_score, match_reason }: CandidateMatch, i: number) => (
              <div
                key={candidate.id}
                onClick={() => window.location.href = `/company/candidates/${candidate.id}`}
                style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'border-color 200ms ease, box-shadow 200ms ease, transform 200ms ease', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--accent-border)'; el.style.boxShadow = 'var(--shadow-md)'; el.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.boxShadow = 'var(--shadow-sm)'; el.style.transform = 'translateY(0)' }}
              >
                {/* Rank badge */}
                <div style={{ width: 28, height: 28, borderRadius: 'var(--radius-full)', background: i === 0 ? 'rgba(245,158,11,0.15)' : 'var(--surface-2)', border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: i === 0 ? '#f59e0b' : 'var(--text-tertiary)', flexShrink: 0, marginTop: 8 }}>
                  {i === 0 ? <Star size={13} fill="#fbbf24" color="#fbbf24" /> : `#${i + 1}`}
                </div>

                {/* Avatar */}
                <div style={{ width: 46, height: 46, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg,var(--accent),var(--accent-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 17, flexShrink: 0 }}>
                  {candidate.name?.[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>{candidate.name}</span>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: scoreBg(match_score), color: scoreColor(match_score), border: `1px solid ${scoreBorder(match_score)}`, borderRadius: 20, fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>
                      {match_score}% match
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    {candidate.college && `🎓 ${candidate.college} · `}
                    {candidate.experience_years === 0 ? '💼 Fresher' : `💼 ${candidate.experience_years}y exp`}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--surface-1)', borderRadius: 'var(--radius-sm)', padding: '6px 10px', marginBottom: 8, borderLeft: '2px solid var(--accent-border)', lineHeight: 1.6 }}>
                    ✦ {match_reason}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {candidate.skills?.slice(0, 5).map((s: string) => (
                      <span key={s} style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', fontSize: 11, padding: '3px 8px', fontWeight: 500 }}>{s}</span>
                    ))}
                  </div>
                </div>

                {/* Message button */}
                <button
                  onClick={(e) => { e.stopPropagation(); startChat(candidate.id) }}
                  disabled={startingChat === candidate.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: 12, cursor: startingChat === candidate.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit', flexShrink: 0, fontWeight: 600, opacity: startingChat === candidate.id ? 0.7 : 1, transition: 'background-color 150ms ease' }}
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
