'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Navbar from '@/components/layout/Navbar'
import { Job } from '@/types'
import { Plus, Loader2, Briefcase, Users, X } from 'lucide-react'

function JobRowSkeleton() {
  return (
    <div style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div className="skeleton" style={{ width: '40%', height: 14, borderRadius: 'var(--radius-sm)' }} />
          <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 'var(--radius-full)' }} />
        </div>
        <div className="skeleton" style={{ width: '30%', height: 12, borderRadius: 'var(--radius-sm)', marginBottom: 8 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {[50, 60, 55].map(w => <div key={w} className="skeleton" style={{ width: w, height: 20, borderRadius: 'var(--radius-full)' }} />)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="skeleton" style={{ width: 90, height: 32, borderRadius: 'var(--radius-sm)' }} />
        <div className="skeleton" style={{ width: 70, height: 32, borderRadius: 'var(--radius-sm)' }} />
      </div>
    </div>
  )
}

export default function CompanyJobsPage() {
  const supabase = createClient()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [posting, setPosting] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', location: '', salary_range: '', job_type: 'full-time', skills: '' })

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      loadJobs(session.user.id)
    }
    checkAuth()
  }, [])

  const loadJobs = async (uid: string) => {
    const { data } = await supabase.from('jobs').select('*').eq('company_id', uid).order('created_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }

  const handlePost = async () => {
    if (!form.title || !form.description || !form.location) { alert('Please fill in title, description and location'); return }
    setPosting(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from('jobs').insert({ company_id: session.user.id, title: form.title, description: form.description, location: form.location, salary_range: form.salary_range, job_type: form.job_type, required_skills: form.skills.split(',').map(s => s.trim()).filter(Boolean), is_active: true })
    setShowForm(false)
    setForm({ title: '', description: '', location: '', salary_range: '', job_type: 'full-time', skills: '' })
    loadJobs(session.user.id)
    setPosting(false)
  }

  const toggleJob = async (job: Job) => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from('jobs').update({ is_active: !job.is_active }).eq('id', job.id)
    loadJobs(session.user.id)
  }

  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block' }

  return (
    <>
      <Navbar userRole="company" />
      <style>{`
        .job-row { transition: border-color 200ms ease, box-shadow 200ms ease; }
        .job-row:hover { border-color: var(--accent-border) !important; box-shadow: var(--shadow-md); }
      `}</style>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 4, fontFamily: 'var(--font-syne), sans-serif' }}>My Job Posts</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>AI matches candidates to your jobs automatically</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'var(--glow-accent)' }}
          >
            <Plus size={15} /> Post a job
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div style={{ background: 'var(--surface-0)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 20, boxShadow: 'var(--shadow-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>New job post</span>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', display: 'flex', padding: 4 }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ marginBottom: 12 }}><label style={lbl}>Job title *</label><input placeholder="e.g. Frontend Engineer" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
              <div style={{ marginBottom: 12 }}><label style={lbl}>Location *</label><input placeholder="Bangalore / Remote" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
              <div style={{ marginBottom: 12 }}><label style={lbl}>Salary range</label><input placeholder="e.g. ₹12–18 LPA" value={form.salary_range} onChange={e => setForm({ ...form, salary_range: e.target.value })} /></div>
              <div style={{ marginBottom: 12 }}>
                <label style={lbl}>Job type</label>
                <select value={form.job_type} onChange={e => setForm({ ...form, job_type: e.target.value })}>
                  <option value="full-time">Full-time</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                  <option value="part-time">Part-time</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}><label style={lbl}>Required skills (comma separated)</label><input placeholder="React, TypeScript, Node.js" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} /></div>
            <div style={{ marginBottom: 16 }}><label style={lbl}>Job description *</label><textarea rows={4} placeholder="Describe the role, responsibilities, and requirements…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ resize: 'vertical' }} /></div>
            <button onClick={handlePost} disabled={posting || !form.title} style={{ width: '100%', padding: '11px 0', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: posting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: posting ? 0.7 : 1 }}>
              {posting && <Loader2 size={15} style={{ animation: 'spin 600ms linear infinite' }} />}
              {posting ? 'Posting…' : 'Post job'}
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 3 }).map((_, i) => <JobRowSkeleton key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
            <Briefcase size={36} style={{ color: 'var(--text-tertiary)', opacity: 0.4, marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>No jobs posted yet</p>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>Post your first job to start finding candidates</p>
            <button onClick={() => setShowForm(true)} style={{ padding: '9px 20px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              Post a job →
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {jobs.map(job => (
              <div key={job.id} className="job-row" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 20, boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{job.title}</span>
                    <span style={{ background: job.is_active ? 'var(--success-subtle)' : 'var(--surface-2)', color: job.is_active ? 'var(--success)' : 'var(--text-tertiary)', border: `1px solid ${job.is_active ? 'var(--success-border)' : 'var(--border)'}`, borderRadius: 'var(--radius-full)', fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>
                      {job.is_active ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    {job.location} · {job.job_type}{job.salary_range ? ` · ${job.salary_range}` : ''}
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {job.required_skills?.slice(0, 5).map(s => (
                      <span key={s} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-full)', fontSize: 11, padding: '2px 8px', fontWeight: 500 }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <a href={`/company/candidates?job=${job.id}`} style={{ textDecoration: 'none' }}>
                    <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-sm)', color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      <Users size={13} /> Candidates
                    </button>
                  </a>
                  <button onClick={() => toggleJob(job)} style={{ padding: '7px 14px', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {job.is_active ? 'Pause' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
