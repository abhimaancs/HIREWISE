'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { ProfileForm } from '@/types'
import { X, Loader2, CheckCircle, Upload, TrendingUp, FileText, ExternalLink } from 'lucide-react'

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
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (err: any) { console.error(err); alert('Failed to save: ' + (err?.message || JSON.stringify(err))) }
    finally { setSaving(false) }
  }

  const s = strength()
  const sLabel = s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Needs work'
  const sColor = s >= 80 ? 'var(--success)' : s >= 60 ? 'var(--accent)' : s >= 40 ? 'var(--warning)' : 'var(--danger)'
  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }

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
        .profile-grid { display: grid; grid-template-columns: 220px 1fr; gap: 14px; }
        @media (max-width: 640px) { .profile-grid { grid-template-columns: 1fr !important; } }
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
              <label style={{ display: 'block', border: `1px dashed ${uploadError ? 'var(--danger-border)' : uploadSuccess ? 'var(--success-border)' : 'var(--accent-border)'}`, borderRadius: 'var(--radius-sm)', padding: '14px 12px', cursor: uploading ? 'not-allowed' : 'pointer', textAlign: 'center', transition: 'background-color 150ms ease' }}
                onMouseEnter={e => { if (!uploading) (e.currentTarget as HTMLElement).style.background = 'var(--accent-subtle)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                {uploading ? <Loader2 size={18} style={{ color: 'var(--accent)', animation: 'spin 600ms linear infinite', margin: '0 auto 6px', display: 'block' }} />
                  : uploadSuccess ? <CheckCircle size={18} style={{ color: 'var(--success)', margin: '0 auto 6px', display: 'block' }} />
                    : <Upload size={18} style={{ color: uploadError ? 'var(--danger)' : 'var(--accent)', margin: '0 auto 6px', display: 'block' }} />}
                <div style={{ fontSize: 12, fontWeight: 600, color: uploadError ? 'var(--danger)' : uploadSuccess ? 'var(--success)' : 'var(--accent)' }}>
                  {uploading ? 'Uploading…' : uploadSuccess ? 'Uploaded!' : resumeUrl ? 'Replace resume' : 'Upload resume'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>PDF only</div>
                <input type="file" accept=".pdf" onChange={handleResumeUpload} disabled={uploading} style={{ display: 'none' }} />
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
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, letterSpacing: '-0.01em' }}>Basic Info</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div><label style={lbl}>Full name</label><input value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Your name" /></div>
                <div><label style={lbl}>Location</label><input value={profile.location || ''} onChange={e => setProfile({ ...profile, location: e.target.value })} placeholder="Chennai, India" /></div>
              </div>
              <div style={{ marginBottom: 12 }}><label style={lbl}>College / University</label><input value={profile.college || ''} onChange={e => setProfile({ ...profile, college: e.target.value })} placeholder="Anna University, Chennai" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <div><label style={lbl}>Experience (yrs)</label><input type="number" min="0" value={profile.experience_years || 0} onChange={e => setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })} /></div>
                <div><label style={lbl}>Bio</label><input value={profile.bio || ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} placeholder="2–3 sentences about yourself…" /></div>
              </div>
            </div>

            <div style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 14, letterSpacing: '-0.01em' }}>Skills <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-tertiary)' }}>— used for AI matching</span></div>
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
