export const dynamic = 'force-dynamic'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export default function AboutPage() {
  return (
    <>
      <Navbar userRole={null} />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp .5s ease forwards}
        .fade-up-1{animation:fadeUp .5s .1s ease both}
        .fade-up-2{animation:fadeUp .5s .2s ease both}
        .fade-up-3{animation:fadeUp .5s .3s ease both}
        .value-card{transition:border-color 200ms ease,transform 200ms ease,box-shadow 200ms ease}
        .value-card:hover{border-color:var(--accent-border)!important;transform:translateY(-3px)!important;box-shadow:var(--shadow-md)!important}
        .back-btn{transition:color 150ms ease,border-color 150ms ease}
        .back-btn:hover{color:var(--text-primary)!important;border-color:var(--border-strong)!important}
        .cta-btn{transition:background-color 150ms ease,transform 150ms ease,box-shadow 150ms ease}
        .cta-btn:hover{transform:translateY(-2px)!important;box-shadow:0 6px 20px rgba(13,148,136,.3)!important}
        @media(max-width:768px){.values-grid{grid-template-columns:1fr 1fr!important}.compare-grid{grid-template-columns:1fr!important}}
        @media(max-width:480px){.values-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* Background glow */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '20%', width: 500, height: 500, background: 'radial-gradient(circle,var(--accent-subtle) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '0', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle,var(--success-subtle) 0%,transparent 70%)' }} />
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 2rem', position: 'relative', zIndex: 1 }}>

        {/* Back button */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <button className="back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', marginBottom: '2rem' }}>
            ← Back
          </button>
        </Link>

        {/* Header */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 999, padding: '5px 14px', fontSize: 12, color: 'var(--accent)', fontWeight: 700, marginBottom: 16 }}>
            ✦ About HireWise
          </div>
          <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1.5px', marginBottom: 14 }}>
            Built to fix hiring
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 560, margin: '0 auto', lineHeight: 1.8 }}>
            HireWise was built because the current hiring process is broken. Candidates apply to hundreds of jobs blindly. Companies wade through hundreds of irrelevant resumes. AI can fix this.
          </p>
        </div>

        {/* Mission */}
        <div className="fade-up-1" style={{ background: 'var(--surface-0)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-xl)', padding: '2.5rem', marginBottom: '3rem', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Our Mission</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-.5px', marginBottom: 14, lineHeight: 1.3 }}>
            Match the right people to the right roles — using AI, not luck.
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            We believe your next job shouldn't depend on knowing the right person or optimising your resume for a keyword scanner. It should depend on your actual skills, your real experience, and your genuine fit for a role. That's what HireWise is built to achieve.
          </p>
        </div>

        {/* Values */}
        <div className="fade-up-2" style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-.5px', marginBottom: '1.5rem', textAlign: 'center' }}>What we believe in</div>
          <div className="values-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
            {[
              ['🎯', 'Accuracy over volume', 'One great match beats 100 irrelevant ones. We optimise for fit, not engagement.'],
              ['🔍', 'Transparency', 'You should know why you matched a job. We show you the reasons, not just the score.'],
              ['⚡', 'Speed', 'The hiring process takes too long. AI can compress weeks of work into seconds.'],
              ['🔒', 'Privacy', 'Your resume and data belong to you. We never sell or share your profile.'],
            ].map(([ic, tt, dc]) => (
              <div key={tt as string} className="value-card" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: 22, marginBottom: 10 }}>{ic as string}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{tt as string}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{dc as string}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div className="fade-up-2" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2rem', marginBottom: '3rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Built with</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>HireWise is a full-stack web application built with modern, production-grade tools.</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[
              ['Next.js 14', 'var(--text-primary)'],
              ['Supabase', 'var(--success)'],
              ['OpenRouter AI', 'var(--accent)'],
              ['TypeScript', '#3b82f6'],
              ['Vercel', 'var(--text-primary)'],
              ['PostgreSQL', 'var(--success)'],
              ['Lucide Icons', 'var(--warning)'],
            ].map(([tech, color]) => (
              <span key={tech} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', fontSize: 12, padding: '5px 12px', color, fontWeight: 600 }}>{tech}</span>
            ))}
          </div>
        </div>

        {/* What makes it different */}
        <div className="fade-up-3" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', padding: '2rem', marginBottom: '3rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>How it's different from LinkedIn / Naukri</div>
          <div className="compare-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>Old way</div>
              {['Keyword-based search only', 'Apply to 100s of jobs blindly', 'No explanation for why you matched', 'Recruiter gatekeeping', 'Weeks of silence after applying'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: 'var(--danger)', fontSize: 13, flexShrink: 0 }}>✕</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--success-subtle)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>HireWise way</div>
              {['Semantic AI understands context', 'See only jobs you genuinely fit', 'Match score + reason for every job', 'Direct chat with hiring managers', 'Apply in one click, respond fast'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <span style={{ color: 'var(--success)', fontSize: 13, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', padding: '2.5rem', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-xl)' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-.5px', marginBottom: 8 }}>Want to try it?</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>Sign up free and see your AI job matches in under 2 minutes.</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup">
              <button className="cta-btn" style={{ padding: '11px 24px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(13,148,136,0.25)' }}>
                Get started →
              </button>
            </Link>
            <Link href="/how-it-works">
              <button className="cta-btn" style={{ padding: '11px 24px', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                How it works
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
