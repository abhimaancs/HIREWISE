'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { CandidateProfile, Profile } from '@/types'
import {
  Loader2, ArrowLeft, MapPin, Briefcase, GraduationCap,
  FileText, MessageSquare, ExternalLink, User, Code, Star
} from 'lucide-react'

const supabase = createClient()

export default function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [details, setDetails] = useState<CandidateProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [startingChat, setStartingChat] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const [{ data: p }, { data: d }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).eq('role', 'candidate').maybeSingle(),
        supabase.from('candidate_profiles').select('*').eq('id', id).maybeSingle(),
      ])

      setProfile(p)
      setDetails(d)
      setLoading(false)
    }
    init()
  }, [id])

  const startChat = async () => {
    setStartingChat(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data: existing } = await supabase.from('conversations')
      .select('id').eq('candidate_id', id).eq('company_id', session.user.id).maybeSingle()
    let convId = existing?.id
    if (!convId) {
      const { data: newConv } = await supabase.from('conversations')
        .insert({ candidate_id: id, company_id: session.user.id }).select('id').single()
      convId = newConv?.id
    }
    router.push(`/chat/${convId}`)
  }

  const initials = profile?.name
    ? profile.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  if (loading) {
    return (
      <>
        <Navbar userRole="company" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <Loader2 size={28} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <Navbar userRole="company" />
        <div style={{ maxWidth: 600, margin: '4rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
          <User size={48} style={{ color: 'var(--text-tertiary)', opacity: 0.3, marginBottom: 16 }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Candidate not found</p>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>This profile may have been removed.</p>
          <Link href="/company/candidates">
            <button style={{ padding: '9px 20px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Back to Candidates
            </button>
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar userRole="company" />
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .4s ease forwards}
        .skill-tag:hover{background:var(--accent)!important;color:#fff!important;border-color:var(--accent)!important}
        .action-btn:hover{opacity:0.85;transform:translateY(-1px)}
        .section-card{transition:border-color 200ms ease,box-shadow 200ms ease}
        .section-card:hover{border-color:var(--accent-border)!important;box-shadow:var(--shadow-md)!important}
        @media(max-width:640px){
          .profile-header{flex-direction:column!important;align-items:flex-start!important}
          .action-row{flex-direction:column!important}
          .action-row button,.action-row a{width:100%!important;justify-content:center!important}
        }
      `}</style>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Back button */}
        <Link href="/company/candidates" style={{ textDecoration: 'none' }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', marginBottom: '1.5rem', transition: 'border-color 150ms ease, color 150ms ease' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
          >
            <ArrowLeft size={14} /> Back to Candidates
          </button>
        </Link>

        {/* ── Profile header card ── */}
        <div className="fade-up section-card" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2rem', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <div className="profile-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Avatar */}
            <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg,var(--accent),var(--accent-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 26, flexShrink: 0, boxShadow: '0 4px 16px var(--accent-border)' }}>
              {initials}
            </div>

            {/* Name + meta */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 6 }}>
                {profile.name}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
                {details?.college && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <GraduationCap size={13} color="var(--accent)" />
                    {details.college}
                  </span>
                )}
                {details?.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <MapPin size={13} color="var(--accent)" />
                    {details.location}
                  </span>
                )}
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Briefcase size={13} color="var(--accent)" />
                  {details?.experience_years === 0 ? 'Fresher' : details?.experience_years ? `${details.experience_years} yr${details.experience_years > 1 ? 's' : ''} experience` : 'Experience not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="action-row" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="action-btn"
              onClick={startChat}
              disabled={startingChat}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: startingChat ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'opacity 150ms ease, transform 150ms ease', opacity: startingChat ? 0.7 : 1 }}
            >
              {startingChat
                ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
                : <MessageSquare size={15} />
              }
              {startingChat ? 'Opening chat…' : 'Message candidate'}
            </button>

            {details?.resume_url && (
              <a
                href={details.resume_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <button
                  className="action-btn"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--success-subtle)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-sm)', color: 'var(--success)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'opacity 150ms ease, transform 150ms ease' }}
                >
                  <FileText size={15} /> View Resume
                  <ExternalLink size={12} style={{ opacity: 0.7 }} />
                </button>
              </a>
            )}
          </div>
        </div>

        {/* ── Bio ── */}
        {details?.bio && (
          <div className="fade-up section-card" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <User size={15} color="var(--accent)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>About</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, margin: 0 }}>{details.bio}</p>
          </div>
        )}

        {/* ── Skills ── */}
        {details?.skills?.length ? (
          <div className="fade-up section-card" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Code size={15} color="var(--accent)" />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Skills</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {details.skills.map(skill => (
                <span
                  key={skill}
                  className="skill-tag"
                  style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-full)', fontSize: 13, padding: '5px 14px', fontWeight: 600, cursor: 'default', transition: 'background-color 150ms ease, color 150ms ease, border-color 150ms ease' }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* ── Resume section ── */}
        <div className="fade-up section-card" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <FileText size={15} color="var(--accent)" />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resume</span>
          </div>

          {details?.resume_url ? (
            <div>
              {/* Embedded PDF viewer */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 12, background: 'var(--surface-1)' }}>
                <iframe
                  src={`${details.resume_url}#toolbar=0`}
                  width="100%"
                  height="560"
                  style={{ display: 'block', border: 'none' }}
                  title={`${profile.name}'s resume`}
                />
              </div>
              <a href={details.resume_url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                  <ExternalLink size={13} /> Open in new tab
                </button>
              </a>
            </div>
          ) : details?.resume_text ? (
            /* Parsed resume text fallback */
            <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', maxHeight: 400, overflowY: 'auto' }}>
              {details.resume_text}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
              <FileText size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>No resume uploaded yet</p>
            </div>
          )}
        </div>

        {/* ── Quick stats ── */}
        <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Skills', value: details?.skills?.length ?? 0, icon: <Star size={16} color="var(--accent)" /> },
            { label: 'Experience', value: details?.experience_years === 0 ? 'Fresher' : details?.experience_years ? `${details.experience_years}y` : '—', icon: <Briefcase size={16} color="var(--accent)" /> },
            { label: 'Email', value: profile.email, icon: <User size={16} color="var(--accent)" />, small: true },
          ].map(stat => (
            <div key={stat.label} style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                {stat.icon}
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: stat.small ? 12 : 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', wordBreak: 'break-all' }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

      </div>
    </>
  )
}
