'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { Loader2, CheckCircle } from 'lucide-react'

export default function CompanyProfilePage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string>('')

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
      const { data: c } = await supabase.from('company_profiles').select('*').eq('id', uid).maybeSingle()
      setProfile({ ...(p ?? {}), ...(c ?? {}) })
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    if (!userId) return
    setSaving(true)
    try {
      const { error: profileError } = await supabase.from('profiles').upsert({ id: userId, name: profile.name || '', role: 'company', email: userEmail }, { onConflict: 'id' })
      if (profileError) throw profileError
      const { error: companyError } = await supabase.from('company_profiles').upsert({ id: userId, company_name: profile.company_name || '', website: profile.website || '', description: profile.description || '', location: profile.location || '' }, { onConflict: 'id' })
      if (companyError) throw companyError
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } catch (err) { console.error(err); alert('Failed to save') }
    finally { setSaving(false) }
  }

  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }

  if (loading) return (
    <>
      <Navbar userRole="company" />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div className="skeleton" style={{ height: 320, borderRadius: 'var(--radius-lg)', marginTop: 60 }} />
      </div>
    </>
  )

  return (
    <>
      <Navbar userRole="company" />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 4, fontFamily: 'var(--font-syne), sans-serif' }}>Company Profile</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Update your company details</p>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: saved ? 'var(--success-subtle)' : 'var(--accent)', border: saved ? '1px solid var(--success-border)' : 'none', borderRadius: 'var(--radius-sm)', color: saved ? 'var(--success)' : '#fff', fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}>
            {saving ? <Loader2 size={14} style={{ animation: 'spin 600ms linear infinite' }} /> : saved ? <CheckCircle size={14} /> : null}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save profile'}
          </button>
        </div>

        <div style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Company Info</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={lbl}>Contact name</label><input value={profile.name || ''} onChange={e => setProfile({ ...profile, name: e.target.value })} placeholder="Your name" /></div>
            <div><label style={lbl}>Company name</label><input value={profile.company_name || ''} onChange={e => setProfile({ ...profile, company_name: e.target.value })} placeholder="Acme Corp" /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={lbl}>Location</label><input value={profile.location || ''} onChange={e => setProfile({ ...profile, location: e.target.value })} placeholder="Bangalore, India" /></div>
            <div><label style={lbl}>Website</label><input value={profile.website || ''} onChange={e => setProfile({ ...profile, website: e.target.value })} placeholder="https://yourcompany.com" /></div>
          </div>
          <div>
            <label style={lbl}>Company description</label>
            <textarea value={profile.description || ''} onChange={e => setProfile({ ...profile, description: e.target.value })} placeholder="Tell candidates about your company, culture, and what you're building…" rows={4} style={{ resize: 'vertical' }} />
          </div>
        </div>
      </div>
    </>
  )
}
