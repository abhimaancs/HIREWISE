'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { ProfileForm } from '@/types'
import { X, Loader2, CheckCircle, Upload, TrendingUp, FileText, ExternalLink, Sparkles } from 'lucide-react'

export default function ProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<ProfileForm>({})
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [resumeFileName, setResumeFileName] = useState<string | null>(null)

  // Auto-fill state
  const [parsing, setParsing] = useState(false)
  const [autoFilled, setAutoFilled] = useState<Set<string>>(new Set())
  const [parseError, setParseError] = useState('')

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      setUserId(session.user.id)
      setUserEmail(session.user.email ?? '')
      loadProfile(session.user.id)
    }
    checkAuth()
  }, [])

  const loadProfile = async (uid: string) => {
    try {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
      const { data: c } = await supabase.from('candidate_profiles').select('*').eq('id', uid).maybeSingle()
      setProfile({ ...(p ?? {}), ...(c ?? {}) })
      setSkills(c?.skills || [])
      if (c?.resume_url) {
        setResumeUrl(c.resume_url)
        const parts = c.resume_url.split('/')
        setResumeFileName(decodeURIComponent(parts[parts.length - 1]))
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const strength = () => {
    let s = 0
    if (profile.name) s += 20
    if (profile.college) s += 20
    if (profile.bio) s += 20
    if (skills.length >= 3) s += 20
    if (profile.location) s += 20
    return s
  }

  // ── Extract text from PDF using pdf.js ──────────────────────────────────
  const extractTextFromPDF = async (file: File): Promise<string> => {
    // Dynamically import pdfjs to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    let fullText = ''
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map((item: any) => item.str).join(' ')
      fullText += pageText + '\n'
    }
    return fullText.trim()
  }

  // ── Parse resume and auto-fill form ─────────────────────────────────────
  const parseAndFill = async (file: File, currentProfile: ProfileForm, currentSkills: string[]) => {
    setParsing(true)
    setParseError('')
    setAutoFilled(new Set())
    try {
      const resumeText = await extractTextFromPDF(file)
      if (!resumeText) { setParseError('Could not read text from PDF. Try a text-based PDF.'); return }

      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      })
      if (!res.ok) throw new Error('Parse API failed')
      const { data } = await res.json()
      if (!data) throw new Error('No data returned')

      // Only fill fields that are currently empty
      const filled = new Set<string>()
      setProfile(prev => {
        const next = { ...prev }
        if (!prev.name && data.name) { next.name = data.name; filled.add('name') }
        if (!prev.college && data.education) { next.college = data.education; filled.add('college') }
        if (!prev.bio && data.bio) { next.bio = data.bio; filled.add('bio') }
        if (!prev.location && data.location) { next.location = data.location; filled.add('location') }
        if ((!prev.experience_years || prev.experience_years === 0) && data.experience_years) {
          next.experience_years = data.experience_years; filled.add('experience_years')
        }
        return next
      })

      // Add new skills that aren't already in the list
      if (data.skills?.length) {
        setSkills(prev => {
          const existing = new Set(prev.map((s: string) => s.toLowerCase()))
          const newSkills = data.skills.filter((s: string) => !existing.has(s.toLowerCase()))
          if (newSkills.length) { filled.add('skills') }
          return [...prev, ...newSkills]
        })
      }

      setAutoFilled(filled)
    } catch (err: any) {
      console.error('Parse error:', err)
      setParseError('Could not parse resume. You can still fill in your details manually.')
    } finally {
      setParsing(false)
    }
  }

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    e.target.value = ''
    setUploading(true); setUploadError(''); setUploadSuccess(false)
    try {
      const filePath = `${userId}/resume.pdf`
      const { error: storageError } = await supabase.storage.from('resumes').upload(filePath, file, { upsert: true, contentType: 'application/pdf' })
      if (storageError) { setUploadError('Upload failed: ' + storageError.message); return }
      const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl
      const { error: dbError } = await supabase.from('candidate_profiles').upsert({ id: userId, resume_url: publicUrl, skills: [], experience_years: 0 }, { onConflict: 'id' })
      if (dbError) { setUploadError('Saved to storage but failed to update profile: ' + dbError.message); return }
      setResumeUrl(publicUrl); setResumeFileName(file.name); setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)

      // ── Auto-parse after successful upload ──
      await parseAndFill(file, profile, skills)

    } catch (err: any) { console.error(err); setUploadError('Something went wrong. Please try again.') }
    finally { setUploading(false) }
  }

  const addSkill = () => {
    const t = newSkill.trim()
    if (t && !skills.includes(t)) { setSkills([...skills, t]); setNewSkill('') }
  }

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)
    try {
      const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle()
      if (!existingProfile) {
        const { error: insertError } = await supabase.from('profiles').insert({ id: userId, name: profile.name || '', role: 'candidate', email: userEmail })
        if (insertError) throw new Error('profiles insert: ' + insertError.message)
      } else {
        const { error: updateError } = await supabase.from('profiles').update({ name: profile.name || '' }).eq('id', userId)
        if (updateError) throw new Error('profiles update: ' + updateError.message)
      }
      const { error: candidateError } = await supabase.from('candidate_profiles').upsert({ id: userId, college: profile.college || '', skills, experience_years: profile.experience_years || 0, bio: profile.bio || '', location: profile.location || '' }, { onConflict: 'id' })
      if (candidateError) throw new Error('candidate_profiles: ' + candidateError.message)
      setSaved(true)
      setAutoFilled(new Set()) // clear highlights after save
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) { console.error(err); alert('Failed to save: ' + (err?.message || JSON.stringify(err))) }
    finally { setSaving(false) }
  }

  const s = strength()
  const sLabel = s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Needs work'
  const sColor = s >= 80 ? 'var(--success)' : s >= 60 ? 'var(--accent)' : s >= 40 ? 'var(--warning)' : 'var(--danger)'
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }

  // Auto-fill highlight style for a field
  const fieldStyle = (field: string): React.CSSProperties =>
    autoFilled.has(field)
      ? { outline: '2px solid var(--accent)', outlineOffset: 2, borderRadius: 'var(--radius-sm)', background: 'var(--accent-subtle)' }
      : {}

  if (loading) return (
    <>
      <Navbar userRole="candidate" />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 14 }}>
          <div>
            <div className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-lg)', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 140, borderRadius: 'var(--radius-md)' }} />
          </div>
          <div>
            <div className="skeleton" style={{ height: 180, borderRadius: 'var(--radius-lg)', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 120, borderRadius: 'var(--radius-lg)' }} />
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <Navbar userRole="candidate" />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: translateY(0) } }
        .profile-grid { display: grid; grid-template-columns: 220px 1fr; gap: 14px; }
        @media (max-width: 640px) { .profile-grid { grid-template-columns: 1fr !important; } }
        .auto-fill-badge { animation: fadeIn 0.3s ease forwards; }
      `}</style>
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 4, fontFamily: 'var(--font-syne), sans-serif' }}>My Profile</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Complete your profile for better AI matches</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: saved ? 'var(--success-subtle)' : 'var(--accent)', border: saved ? '1px solid var(--success-border)' : 'none', borderRadius: 'var(--radius-sm)', color: saved ? 'var(--success)' : '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? <Loader2 size={14} style={{ animation: 'spin 600ms linear infinite' }} /> : saved ? <CheckCircle size={14} /> : null}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save profile'}
          </button>
        </div>

        {/* ── AI parse status banners ── */}
        {parsing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-md)', marginBottom: 16, animation: 'fadeIn 0.3s ease' }}>
            <Loader2 size={16} color="var(--accent)" style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>Reading your resume and filling in your profile…</span>
          </div>
        )}

        {!parsing && autoFilled.size > 0 && (
          <div className="auto-fill-badge" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--success-subtle)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', marginBottom: 16 }}>
            <Sparkles size={16} color="var(--success)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600, flex: 1 }}>
              Resume parsed — we auto-filled {autoFilled.size} field{autoFilled.size > 1 ? 's' : ''} ({[...autoFilled].join(', ')}). Review and hit Save.
            </span>
            <button onClick={() => setAutoFilled(new Set())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)', padding: 2, display: 'flex', opacity: 0.7 }}>
              <X size={14} />
            </button>
          </div>
        )}

        {parseError && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--warning-subtle)', border: '1px solid var(--warning-border)', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 13, color: 'var(--warning)' }}>
            ⚠ {parseError}
          </div>
        )}

        <div className="profile-grid">
          {/* Sidebar */}
          <div>
            {/* Profile card */}
            <div style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 12, textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: 72, height: 72, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 26, fontWeight: 800 }}>
                {profile.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 3, letterSpacing: '-0.01em' }}>{profile.name || 'Your name'}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 16 }}>{profile.college || 'Add your college'}</div>
              <div style={{ height: 1, background: 'var(--border)', marginBottom: 14 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}><TrendingUp size={12} />Strength</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: sColor }}>{sLabel}</span>
              </div>
              <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: `${s}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))', borderRadius: 'var(--radius-full)', transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>{s}% complete</div>
            </div>

            {/* Resume widget */}
            <div style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 16, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Resume</div>
              {resumeUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '7px 10px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', marginBottom: 10 }}>
                  <FileText size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--accent)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{resumeFileName || 'resume.pdf'}</span>
                  <a href={resumeUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', flexShrink: 0 }}>
                    View <ExternalLink size={10} />
                  </a>
                </div>
              )}
              <label
                style={{ display: 'block', border: `1px dashed ${uploadError ? 'var(--danger-border)' : uploadSuccess ? 'var(--success-border)' : 'var(--accent-border)'}`, borderRadius: 'var(--radius-sm)', padding: '14px 12px', cursor: (uploading || parsing) ? 'not-allowed' : 'pointer', textAlign: 'center', transition: 'background-color 150ms ease' }}
                onMouseEnter={e => { if (!uploading && !parsing) (e.currentTarget as HTMLElement).style.background = 'var(--accent-subtle)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {(uploading || parsing)
                  ? <Loader2 size={18} style={{ color: 'var(--accent)', animation: 'spin 600ms linear infinite', margin: '0 auto 6px', display: 'block' }} />
                  : uploadSuccess
                    ? <CheckCircle size={18} style={{ color: 'var(--success)', margin: '0 auto 6px', display: 'block' }} />
                    : <Upload size={18} style={{ color: uploadError ? 'var(--danger)' : 'var(--accent)', margin: '0 auto 6px', display: 'block' }} />
                }
                <div style={{ fontSize: 12, fontWeight: 600, color: uploadError ? 'var(--danger)' : uploadSuccess ? 'var(--success)' : 'var(--accent)' }}>
                  {uploading ? 'Uploading…' : parsing ? 'Reading resume…' : uploadSuccess ? 'Uploaded!' : resumeUrl ? 'Replace resume' : 'Upload resume'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>
                  {parsing ? 'AI is extracting your info' : 'PDF · auto-fills your profile'}
                </div>
                <input type="file" accept=".pdf" onChange={handleResumeUpload} disabled={uploading || parsing} style={{ display: 'none' }} />
              </label>
              {uploadError && (
                <div style={{ marginTop: 8, padding: '7px 10px', background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--danger)', lineHeight: 1.5 }}>
                  {uploadError}
                </div>
              )}
            </div>
          </div>

          {/* Main form */}
          <div>
            <div style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 12, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Basic Info</span>
                {autoFilled.size > 0 && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-full)', fontSize: 10, fontWeight: 700, padding: '2px 8px' }}>
                    <Sparkles size={9} /> AI filled
                  </span>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ ...lbl, marginBottom: 0 }}>Full name</label>
                    {autoFilled.has('name') && <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><Sparkles size={9} />Auto-filled</span>}
                  </div>
                  <input value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Your name" style={fieldStyle('name')} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ ...lbl, marginBottom: 0 }}>Location</label>
                    {autoFilled.has('location') && <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><Sparkles size={9} />Auto-filled</span>}
                  </div>
                  <input value={profile.location || ''} onChange={e => setProfile({ ...profile, location: e.target.value })} placeholder="Chennai, India" style={fieldStyle('location')} />
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ ...lbl, marginBottom: 0 }}>College / University</label>
                  {autoFilled.has('college') && <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><Sparkles size={9} />Auto-filled</span>}
                </div>
                <input value={profile.college || ''} onChange={e => setProfile({ ...profile, college: e.target.value })} placeholder="Anna University, Chennai" style={fieldStyle('college')} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ ...lbl, marginBottom: 0 }}>Experience (yrs)</label>
                    {autoFilled.has('experience_years') && <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><Sparkles size={9} />Auto-filled</span>}
                  </div>
                  <input type="number" min="0" value={profile.experience_years || 0} onChange={e => setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })} style={fieldStyle('experience_years')} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <label style={{ ...lbl, marginBottom: 0 }}>Bio</label>
                    {autoFilled.has('bio') && <span style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}><Sparkles size={9} />Auto-filled</span>}
                  </div>
                  <input value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="2–3 sentences about yourself…" style={fieldStyle('bio')} />
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Skills <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-tertiary)' }}>— used for AI matching</span>
                </span>
                {autoFilled.has('skills') && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-full)', fontSize: 10, fontWeight: 700, padding: '2px 8px' }}>
                    <Sparkles size={9} /> Auto-filled from resume
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14, minHeight: 36 }}>
                {skills.map(skill => (
                  <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-full)', fontSize: 12, padding: '5px 11px', fontWeight: 600 }}>
                    {skill}<X size={11} style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => setSkills(skills.filter(s => s !== skill))} />
                  </span>
                ))}
                {!skills.length && <span style={{ fontSize: 13, color: 'var(--text-tertiary)', padding: '4px 0' }}>No skills added yet</span>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()} placeholder="Type a skill and press Enter (e.g. React, C++, DSA)" />
                <button onClick={addSkill} style={{ padding: '0 16px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', cursor: 'pointer', flexShrink: 0, fontWeight: 700, fontSize: 18 }}>+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
