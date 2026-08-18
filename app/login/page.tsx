'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Loader2, ArrowRight, Zap, Shield, Users } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true); setError('')
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
      router.push(profile?.role === 'company' ? '/company/jobs' : '/jobs')
      router.refresh()
    } catch (err: any) { setError(err.message || 'Invalid email or password') }
    finally { setLoading(false) }
  }

  const lbl: React.CSSProperties = { fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 7, display: 'block' }

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        .fade-up { animation: fadeUp .5s ease forwards; }
        .fade-up-1 { animation: fadeUp .5s .1s ease both; }
        .fade-up-2 { animation: fadeUp .5s .2s ease both; }
        .auth-input:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 3px var(--accent-subtle) !important; }
        .sign-in-btn:hover { background: var(--accent-hover) !important; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(13,148,136,0.35) !important; }
        .auth-left { background: #0D9488; }
        [data-theme="dark"] .auth-left { background: #141417; border-right: 1px solid rgba(255,255,255,0.08); }
        @media (max-width: 768px) { .auth-split { grid-template-columns: 1fr !important; } .auth-left { display: none !important; } }
      `}</style>

      <div className="auth-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '100vh' }}>

        {/* ── Left panel — brand ── */}
        <div className="auth-left" style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '3rem' }}>
          {/* Background decoration */}
          <div style={{ position: 'absolute', top: -80, right: -80, width: 300, height: 300, background: 'rgba(255,255,255,0.06)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -60, left: -60, width: 250, height: 250, background: 'rgba(255,255,255,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '40%', left: '60%', width: 150, height: 150, background: 'rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none' }} />

          {/* Logo */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.20)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 17, color: '#fff' }}>H</div>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>HireWise</span>
            </Link>
          </div>

          {/* Centre content */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 'clamp(1.8rem,3vw,2.5rem)', fontWeight: 900, color: '#ffffff', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: '1.25rem' }}>
              Your next opportunity<br />starts here
            </div>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.80)', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: 340 }}>
              AI matches you to roles where you genuinely fit — based on your skills, not just keywords.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                [<Zap size={16} />, 'Instant AI matching', 'See your fit score for every job'],
                [<Users size={16} />, 'Direct to companies', 'No recruiters, no gatekeepers'],
                [<Shield size={16} />, 'Your data stays yours', 'Row-level security, always private'],
              ].map(([icon, title, desc], i) => (
                <div key={i as number} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>{icon as React.ReactNode}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>{title as string}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)' }}>{desc as string}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ position: 'relative', zIndex: 1, fontSize: 12, color: 'rgba(255,255,255,0.50)' }}>
            © 2026 HireWise · Built with AI
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div style={{ background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>

            {/* Mobile logo */}
            <div style={{ display: 'none', textAlign: 'center', marginBottom: '2rem' }} className="mobile-logo">
              <Link href="/" style={{ textDecoration: 'none' }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                  Hire<span style={{ color: 'var(--accent)' }}>Wise</span>
                </span>
              </Link>
            </div>

            <div className="fade-up" style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', marginBottom: 8 }}>Welcome back</h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Sign in to your HireWise account</p>
            </div>

            <div className="fade-up-1" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={lbl}>Email address</label>
                <input
                  className="auth-input"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{ fontSize: 15, padding: '12px 14px' }}
                />
              </div>
              <div>
                <label style={lbl}>Password</label>
                <input
                  className="auth-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{ fontSize: 15, padding: '12px 14px' }}
                />
              </div>

              {error && (
                <div style={{ background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)', padding: '11px 14px', color: 'var(--danger)', fontSize: 13, fontWeight: 500 }}>
                  {error}
                </div>
              )}

              <button
                className="sign-in-btn"
                onClick={handleLogin}
                disabled={loading}
                style={{ width: '100%', padding: '13px 0', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.75 : 1, boxShadow: '0 4px 14px rgba(13,148,136,0.25)', transition: 'background-color 150ms ease, transform 150ms ease, box-shadow 150ms ease', marginTop: 4 }}
              >
                {loading ? <Loader2 size={17} style={{ animation: 'spin 600ms linear infinite' }} /> : <ArrowRight size={17} />}
                {loading ? 'Signing in…' : 'Sign in'}
              </button>
            </div>

            <div className="fade-up-2">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500 }}>New to HireWise?</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>

              <Link href="/signup" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', padding: '12px 0', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 150ms ease, color 150ms ease' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)' }}
                >
                  Create an account →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
