'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { Job, CandidateProfile, CompanyInfo } from '@/types'
import {
    Loader2, ArrowLeft, MapPin, Briefcase, DollarSign,
    Calendar, CheckCircle, X, Zap, Users
} from 'lucide-react'

// Score chip following design system spec
function ScoreChip({ score }: { score: number }) {
    const high = score >= 80
    const mid = score >= 50 && score < 80
    const style: React.CSSProperties = high
        ? { background: 'linear-gradient(135deg, var(--score-high-from), var(--score-high-to))', color: 'var(--bg)', boxShadow: 'var(--glow-success)' }
        : mid
            ? { background: 'linear-gradient(135deg, var(--score-mid-from), var(--score-mid-to))', color: '#18181B' }
            : { background: 'var(--score-low-bg)', color: 'var(--score-low-text)' }
    return (
        <span style={{ ...style, borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 800, padding: '3px 10px', letterSpacing: '-0.01em', fontVariantNumeric: 'tabular-nums', display: 'inline-block' }}>
            {score}%
        </span>
    )
}

const JOB_TYPE_LABEL: Record<string, string> = {
    'full-time': 'Full-time',
    'part-time': 'Part-time',
    'internship': 'Internship',
    'remote': 'Remote',
}

export default function JobDetailPage() {
    const params = useParams()
    const router = useRouter()
    const jobId = params?.id as string
    const supabase = createClient()

    const [job, setJob] = useState<Job | null>(null)
    const [company, setCompany] = useState<CompanyInfo | null>(null)
    const [profile, setProfile] = useState<CandidateProfile | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const [pageLoading, setPageLoading] = useState(true)
    const [notFound, setNotFound] = useState(false)

    const [matchScore, setMatchScore] = useState<number | null>(null)
    const [matchReason, setMatchReason] = useState<string | null>(null)
    const [matchedSkills, setMatchedSkills] = useState<string[]>([])
    const [loadingMatch, setLoadingMatch] = useState(false)

    const [appStatus, setAppStatus] = useState<string | null>(null)
    const [applying, setApplying] = useState(false)
    const [withdrawing, setWithdrawing] = useState(false)
    const [confirmWithdraw, setConfirmWithdraw] = useState(false)

    useEffect(() => {
        if (jobId) load()
    }, [jobId])

    const load = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) { window.location.href = '/login'; return }
            setUserId(session.user.id)

            const { data: jobData, error: jobErr } = await supabase
                .from('jobs').select('*').eq('id', jobId).single()
            if (jobErr || !jobData) { setNotFound(true); setPageLoading(false); return }
            setJob(jobData)

            const { data: companyData } = await supabase
                .from('profiles').select('name, email').eq('id', jobData.company_id).single()
            setCompany(companyData)

            const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
            const { data: c } = await supabase.from('candidate_profiles').select('*').eq('id', session.user.id).maybeSingle()
            const candidate = { ...(p ?? {}), ...(c ?? {}) } as CandidateProfile
            setProfile(candidate)

            const { data: appData } = await supabase
                .from('applications').select('status')
                .eq('candidate_id', session.user.id).eq('job_id', jobId).maybeSingle()
            if (appData) setAppStatus(appData.status)

            setPageLoading(false)

            if (candidate?.skills?.length) {
                fetchMatch(candidate, jobData)
            }
        } catch (err) {
            console.error(err)
            setPageLoading(false)
        }
    }

    const fetchMatch = async (candidate: CandidateProfile, jobData: Job) => {
        setLoadingMatch(true)
        try {
            const res = await fetch('/api/match-jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ candidate, jobs: [jobData] })
            })
            const { matches } = await res.json()
            if (matches?.[0]) {
                setMatchScore(matches[0].match_score)
                setMatchReason(matches[0].match_reason)
                const matched = candidate.skills?.filter(s =>
                    jobData.required_skills?.map(r => r.toLowerCase()).includes(s.toLowerCase())
                ) || []
                setMatchedSkills(matched)
            }
        } catch (err) {
            console.error('match fetch failed:', err)
        } finally {
            setLoadingMatch(false)
        }
    }

    const handleApply = async () => {
        if (!userId || appStatus) return
        setApplying(true)
        try {
            const { error } = await supabase
                .from('applications')
                .insert({ candidate_id: userId, job_id: jobId, status: 'applied' })
            if (error && error.code !== '23505') throw error
            setAppStatus('applied')
        } catch (err: any) {
            alert('Failed to apply: ' + (err?.message || 'Please try again'))
        } finally {
            setApplying(false)
        }
    }

    const handleWithdraw = async () => {
        if (!userId) return
        setWithdrawing(true)
        setConfirmWithdraw(false)
        try {
            const { error } = await supabase
                .from('applications').delete()
                .eq('candidate_id', userId).eq('job_id', jobId).eq('status', 'applied')
            if (error) throw error
            setAppStatus(null)
        } catch (err: any) {
            alert('Failed to withdraw: ' + (err?.message || 'Please try again'))
        } finally {
            setWithdrawing(false)
        }
    }

    const card: React.CSSProperties = {
        background: 'var(--surface-0)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-sm)',
    }
    const label: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }

    const statusCfg: Record<string, { label: string }> = {
        applied: { label: 'Applied' },
        shortlisted: { label: 'Shortlisted 🎉' },
        rejected: { label: 'Not selected' },
    }
    const statusStyle: Record<string, React.CSSProperties> = {
        applied: { background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)' },
        shortlisted: { background: 'var(--success-subtle)', color: 'var(--success)', border: '1px solid var(--success-border)' },
        rejected: { background: 'var(--danger-subtle)', color: 'var(--danger)', border: '1px solid var(--danger-border)' },
    }

    if (pageLoading) return (
        <>
            <Navbar userRole="candidate" />
            <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem' }}>
                <div className="skeleton" style={{ width: 80, height: 32, borderRadius: 'var(--radius-sm)', marginBottom: 20 }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
                    <div>
                        <div className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-md)', marginBottom: 12 }} />
                        <div className="skeleton" style={{ height: 200, borderRadius: 'var(--radius-md)', marginBottom: 12 }} />
                        <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-md)' }} />
                    </div>
                    <div>
                        <div className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-md)', marginBottom: 12 }} />
                        <div className="skeleton" style={{ height: 160, borderRadius: 'var(--radius-md)' }} />
                    </div>
                </div>
            </div>
        </>
    )

    if (notFound || !job) return (
        <>
            <Navbar userRole="candidate" />
            <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                <Briefcase size={48} style={{ color: 'var(--text-tertiary)', opacity: 0.4, marginBottom: 16 }} />
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Job not found</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>This job may no longer be available.</p>
                <button
                    onClick={() => router.push('/jobs')}
                    style={{ padding: '9px 20px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
                >
                    ← Back to jobs
                </button>
            </div>
        </>
    )

    const canWithdraw = appStatus === 'applied'
    const postedDate = new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })

    return (
        <>
            <Navbar userRole="candidate" />
            <style>{`
        @media (max-width: 768px) {
          .job-detail-grid { grid-template-columns: 1fr !important; }
          .job-detail-sidebar { position: static !important; top: auto !important; }
        }
      `}</style>

            <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem' }}>
                <button
                    onClick={() => router.back()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Inter,sans-serif', marginBottom: '1.5rem' }}
                >
                    <ArrowLeft size={14} /> Back
                </button>

                <div className="job-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'start' }}>

                    {/* LEFT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {/* Header card */}
                        <div style={{ ...card, padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: '1.25rem' }}>
                                <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'var(--accent)', fontSize: 22, flexShrink: 0 }}>
                                    {job.title[0].toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 4 }}>
                                        {job.title}
                                    </h1>
                                    <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>
                                        {company?.name || 'Company'}
                                    </div>
                                </div>
                            </div>

                            {/* Meta pills */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', fontSize: 12, color: 'var(--text-secondary)', padding: '5px 11px', fontWeight: 500 }}>
                                    <MapPin size={12} />{job.location}
                                </span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', fontSize: 12, color: 'var(--text-secondary)', padding: '5px 11px', fontWeight: 500 }}>
                                    <Briefcase size={12} />{JOB_TYPE_LABEL[job.job_type] || job.job_type}
                                </span>
                                {job.salary_range && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-full)', fontSize: 12, color: 'var(--accent)', padding: '5px 11px', fontWeight: 700 }}>
                                        <DollarSign size={12} />{job.salary_range}
                                    </span>
                                )}
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-full)', fontSize: 12, color: 'var(--text-tertiary)', padding: '5px 11px' }}>
                                    <Calendar size={12} />Posted {postedDate}
                                </span>
                            </div>
                        </div>

                        {/* Description card */}
                        <div style={{ ...card, padding: '1.5rem' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Job Description</div>
                            {job.description ? (
                                <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                                    {job.description}
                                </div>
                            ) : (
                                <div style={{ fontSize: 13, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No description provided.</div>
                            )}
                        </div>

                        {/* Required skills card */}
                        <div style={{ ...card, padding: '1.5rem' }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Required Skills</div>
                            {job.required_skills?.length ? (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                                    {job.required_skills.map(s => {
                                        const isMatched = matchedSkills.includes(s)
                                        return (
                                            <span key={s} style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 4,
                                                background: isMatched ? 'var(--success-subtle)' : 'var(--surface-1)',
                                                border: `1px solid ${isMatched ? 'var(--success-border)' : 'var(--border)'}`,
                                                color: isMatched ? 'var(--success)' : 'var(--text-secondary)',
                                                borderRadius: 'var(--radius-sm)', fontSize: 12, padding: '5px 10px', fontWeight: isMatched ? 600 : 500
                                            }}>
                                                {isMatched && <CheckCircle size={11} />}
                                                {s}
                                            </span>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div style={{ fontSize: 13, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No specific skills listed.</div>
                            )}
                            {matchedSkills.length > 0 && (
                                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--success)' }}>
                                    ✓ You match {matchedSkills.length} of {job.required_skills?.length} required skills
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="job-detail-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: '1.5rem' }}>

                        {/* Apply / status card */}
                        <div style={{ ...card, padding: '1.25rem' }}>
                            <div style={{ ...label, marginBottom: 12 }}>Application</div>

                            {appStatus && statusStyle[appStatus] && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...statusStyle[appStatus], borderRadius: 'var(--radius-sm)', padding: '9px 12px', marginBottom: 10 }}>
                                    <CheckCircle size={14} />
                                    <span style={{ fontSize: 13, fontWeight: 700 }}>
                                        {statusCfg[appStatus]?.label}
                                    </span>
                                </div>
                            )}

                            {appStatus === 'shortlisted' && (
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>
                                    🎉 You&apos;ve been shortlisted. The company may reach out soon.
                                </p>
                            )}
                            {appStatus === 'rejected' && (
                                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>
                                    This application was not selected. You can apply to other roles.
                                </p>
                            )}

                            {confirmWithdraw && (
                                <div style={{ background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginBottom: 10 }}>
                                    <p style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600, marginBottom: 8 }}>
                                        Withdraw this application? You can reapply later.
                                    </p>
                                    <div style={{ display: 'flex', gap: 7 }}>
                                        <button
                                            onClick={handleWithdraw}
                                            style={{ flex: 1, padding: '7px 0', background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
                                        >
                                            Yes, withdraw
                                        </button>
                                        <button
                                            onClick={() => setConfirmWithdraw(false)}
                                            style={{ flex: 1, padding: '7px 0', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!appStatus && (
                                <button
                                    onClick={handleApply}
                                    disabled={applying}
                                    style={{ width: '100%', padding: '11px 0', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'white', fontSize: 14, fontWeight: 700, cursor: applying ? 'not-allowed' : 'pointer', fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: applying ? 0.7 : 1, boxShadow: 'var(--glow-accent)' }}
                                >
                                    {applying
                                        ? <><Loader2 size={14} style={{ animation: 'spin 600ms linear infinite' }} />Applying…</>
                                        : 'Apply →'}
                                </button>
                            )}

                            {canWithdraw && !confirmWithdraw && (
                                <button
                                    onClick={() => setConfirmWithdraw(true)}
                                    disabled={withdrawing}
                                    style={{ width: '100%', marginTop: 8, padding: '9px 0', background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', color: 'var(--danger)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                                >
                                    {withdrawing
                                        ? <Loader2 size={13} style={{ animation: 'spin 600ms linear infinite' }} />
                                        : <X size={13} />}
                                    Withdraw application
                                </button>
                            )}

                            <a href="/applications" style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--text-tertiary)', textDecoration: 'none' }}>
                                View all applications →
                            </a>
                        </div>

                        {/* AI match card */}
                        <div style={{ ...card, padding: '1.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                                <Zap size={13} color="var(--accent)" />
                                <div style={{ ...label }}>AI Match</div>
                            </div>

                            {loadingMatch ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-tertiary)', fontSize: 12 }}>
                                    <Loader2 size={14} style={{ animation: 'spin 600ms linear infinite' }} />
                                    Calculating match…
                                </div>
                            ) : matchScore !== null ? (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                        <div style={{ flexShrink: 0 }}>
                                            <ScoreChip score={matchScore} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 13, fontWeight: 700, color: matchScore >= 80 ? 'var(--success)' : matchScore >= 50 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                                                {matchScore >= 80 ? 'Strong match' : matchScore >= 50 ? 'Good match' : 'Low match'}
                                            </div>
                                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>based on your profile</div>
                                        </div>
                                    </div>

                                    {matchReason && (
                                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, background: 'var(--surface-1)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', borderLeft: '2px solid var(--accent-border)', marginBottom: matchedSkills.length ? 10 : 0 }}>
                                            ✦ {matchReason}
                                        </div>
                                    )}

                                    {matchedSkills.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6, marginTop: 4 }}>Your matching skills</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                                {matchedSkills.map(s => (
                                                    <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'var(--success-subtle)', border: '1px solid var(--success-border)', color: 'var(--success)', borderRadius: 'var(--radius-sm)', fontSize: 11, padding: '3px 8px', fontWeight: 600 }}>
                                                        <CheckCircle size={9} />{s}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    <a href="/profile" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Add skills to your profile</a> to see your AI match score.
                                </div>
                            )}
                        </div>

                        {/* Job summary card */}
                        <div style={{ ...card, padding: '1.25rem' }}>
                            <div style={{ ...label, marginBottom: 12 }}>Job Summary</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Briefcase size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{JOB_TYPE_LABEL[job.job_type] || job.job_type}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <MapPin size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{job.location}</span>
                                </div>
                                {job.salary_range && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <DollarSign size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                        <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}>{job.salary_range}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Users size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{company?.name || '—'}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Calendar size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{postedDate}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}
