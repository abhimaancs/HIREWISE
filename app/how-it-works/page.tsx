export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export default function HowItWorksPage() {
  return (
    <>
      <Navbar userRole={null} />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .fade-up{animation:fadeUp .5s ease forwards}
        .fade-up-1{animation:fadeUp .5s .1s ease both}
        .fade-up-2{animation:fadeUp .5s .2s ease both}
        .fade-up-3{animation:fadeUp .5s .3s ease both}
        .fade-up-4{animation:fadeUp .5s .4s ease both}
        .step-card{transition:border-color 200ms ease,box-shadow 200ms ease,transform 200ms ease}
        .step-card:hover{transform:translateY(-3px)!important;box-shadow:var(--shadow-md)!important}
        .faq-item{transition:border-color 200ms ease,background-color 200ms ease}
        .faq-item:hover{border-color:var(--accent-border)!important;background:var(--surface-1)!important}
        .cta-btn{transition:background-color 150ms ease,transform 150ms ease}
        .cta-btn:hover{transform:translateY(-2px)!important}
        .back-btn{transition:border-color 150ms ease,color 150ms ease}
        .back-btn:hover{color:var(--text-primary)!important;border-color:var(--accent-border)!important}
        .ai-item{animation:slideIn .4s ease both}
        .ai-item:nth-child(1){animation-delay:.1s}
        .ai-item:nth-child(2){animation-delay:.3s}
        .ai-dot{animation:pulse 2s infinite}
        @media(max-width:768px){
          .steps-grid{grid-template-columns:1fr!important}
          .roles-grid{grid-template-columns:1fr!important}
        }
      `}</style>

      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '20%', width: 500, height: 500, background: 'radial-gradient(circle,rgba(13,148,136,.04) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400, background: 'radial-gradient(circle,rgba(5,150,105,.03) 0%,transparent 70%)' }} />
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 2rem', position: 'relative', zIndex: 1 }}>

        {/* Back button */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <button className="back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', marginBottom: '2rem', boxShadow: 'var(--shadow-sm)' }}>
            ← Back
          </button>
        </Link>

        {/* Header */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 999, padding: '5px 14px', fontSize: 12, color: 'var(--accent)', fontWeight: 700, marginBottom: 16 }}>
            ✦ See how it works
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem,4vw,3rem)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1.5px', marginBottom: 12 }}>
            From profile to<br />
            <span style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent-hover))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>hired in 3 steps</span>
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>
            HireWise uses AI to do what takes hours manually — in seconds. Here's exactly how it works.
          </p>
        </div>

        {/* Steps */}
        <div className="steps-grid fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: '5rem' }}>
          {[
            {
              step: '01', icon: '📄', color: 'var(--accent)', bg: 'var(--accent-subtle)', border: 'var(--accent-border)',
              title: 'Build your profile',
              desc: 'Add your skills, experience, and education manually — or upload your PDF resume for companies to view directly. Your profile drives the AI matching engine.',
              demo: (
                <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginTop: 14 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 8 }}>📎 resume.pdf uploaded</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>Skills added:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
                    {['React', 'Node.js', 'TypeScript', 'DSA', 'MongoDB', 'C++'].map(s => (
                      <span key={s} style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)', borderRadius: 20, fontSize: 10, padding: '2px 8px', fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span className="ai-dot" style={{ width: 6, height: 6, background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }} />
                    Profile ready — 6 skills added
                  </div>
                </div>
              )
            },
            {
              step: '02', icon: '🤖', color: '#8b5cf6', bg: 'rgba(139,92,246,.12)', border: 'rgba(139,92,246,.25)',
              title: 'AI scores your matches',
              desc: 'Our AI semantically understands your profile — not just keywords. It scores every available job from 0 to 100 based on how well your skills, experience, and context match the role.',
              demo: (
                <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginTop: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Your top matches:</div>
                  {[['Razorpay · SDE Intern', '94%', 'var(--success)', 'var(--success-subtle)'], ['Swiggy · Full Stack Dev', '88%', 'var(--success)', 'var(--success-subtle)'], ['Zepto · Backend Eng.', '71%', 'var(--accent)', 'var(--accent-subtle)']].map(([job, score, sc, sbg]) => (
                    <div key={job} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{job}</span>
                      <span style={{ background: sbg, color: sc, borderRadius: 6, fontSize: 10, fontWeight: 800, padding: '1px 7px' }}>{score}</span>
                    </div>
                  ))}
                  <div style={{ fontSize: 10, color: 'var(--accent)', marginTop: 8 }}>✦ Matched on: React, Node.js, MongoDB</div>
                </div>
              )
            },
            {
              step: '03', icon: '💬', color: '#10b981', bg: 'rgba(16,185,129,.12)', border: 'rgba(16,185,129,.25)',
              title: 'Apply & connect directly',
              desc: 'Apply with one click and chat directly with hiring managers. No recruiters, no gatekeepers, no waiting weeks. Real conversations that lead to real offers.',
              demo: (
                <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', marginTop: 14 }}>
                  <div className="ai-item" style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent-hover))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8, fontWeight: 800, flexShrink: 0 }}>R</div>
                    <div style={{ background: 'var(--surface-0)', borderRadius: '8px 8px 8px 2px', padding: '5px 8px', fontSize: 10, color: 'var(--text-primary)', lineHeight: 1.4, border: '1px solid var(--border)' }}>Hi! You matched 94% with our SDE Intern role 🎉</div>
                  </div>
                  <div className="ai-item" style={{ display: 'flex', alignItems: 'flex-start', gap: 6, justifyContent: 'flex-end' }}>
                    <div style={{ background: 'var(--accent)', borderRadius: '8px 8px 2px 8px', padding: '5px 8px', fontSize: 10, color: '#fff', lineHeight: 1.4 }}>Excited! When can we schedule a call?</div>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8, fontWeight: 800, flexShrink: 0 }}>A</div>
                  </div>
                </div>
              )
            }
          ].map((s, i) => (
            <div key={s.step} className="step-card" style={{ background: 'var(--surface-0)', border: `1px solid ${s.border}`, borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
                <span style={{ fontSize: 11, fontWeight: 800, color: s.color, letterSpacing: '.1em' }}>{s.step}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-.3px' }}>{s.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{s.desc}</div>
              {s.demo}
            </div>
          ))}
        </div>

        {/* For candidates vs companies */}
        <div className="fade-up-2" style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-.5px', marginBottom: 8 }}>Built for both sides</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Whether you're looking for a job or looking to hire</div>
          </div>
          <div className="roles-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>For Candidates</div>
              {['Build your profile and upload your PDF resume', 'Get matched to jobs with a 0–100 AI score', 'See why you matched — which skills align', 'Apply in one click', 'Chat directly with hiring managers', 'Track all your applications in one place'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                  <span style={{ color: 'var(--success)', fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
              <Link href="/signup">
                <button className="cta-btn" style={{ marginTop: 16, padding: '10px 22px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(13,148,136,.25)' }}>
                  Get started as candidate →
                </button>
              </Link>
            </div>
            <div style={{ background: 'var(--success-subtle)', border: '1px solid var(--success-border)', borderRadius: 'var(--radius-lg)', padding: '2rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 16 }}>For Companies</div>
              {['Post jobs with required skills', 'AI ranks all candidates by fit score automatically', "See each candidate's match reason and skills", 'Message top candidates directly', 'Manage applications with shortlist / reject', 'Track your hiring pipeline in real time'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                  <span style={{ color: 'var(--success)', fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item}</span>
                </div>
              ))}
              <Link href="/signup?role=company">
                <button className="cta-btn" style={{ marginTop: 16, padding: '10px 22px', background: 'var(--success)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(5,150,105,.25)' }}>
                  Get started as company →
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="fade-up-3" style={{ marginBottom: '4rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-.5px', marginBottom: 8 }}>Frequently asked questions</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['How does AI matching work?', 'Our AI reads your profile skills, then scores each job from 0–100 based on semantic similarity — meaning it understands context, not just exact keywords. React experience will match a ReactJS job even if the words differ.'],
              ['Is HireWise free to use?', 'Yes — signing up and finding AI matches is completely free for candidates. Companies can post jobs and access the candidate ranking features.'],
              ['How accurate is the AI matching?', 'The match score is a strong signal but not a guarantee. It considers skill overlap, experience level, and role context. We recommend applying to jobs with 70%+ match scores for best results.'],
              ['How is this different from LinkedIn or Naukri?', 'LinkedIn and Naukri use keyword-based search. HireWise uses semantic AI — it understands what you can do, not just what words appear on your resume. You get ranked results with explanations, not a sea of irrelevant listings.'],
              ['Can companies see my profile without me applying?', 'No — companies can only see your profile after you apply to their job posting.'],
            ].map(([q, a]) => (
              <div key={q} className="faq-item" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>{q}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{a}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="fade-up-4" style={{ textAlign: 'center', padding: '3rem', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-xl)', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 400, height: 400, background: 'radial-gradient(circle,rgba(13,148,136,.06) 0%,transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: 8 }}>Ready to try it?</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>Sign up in 30 seconds. No credit card required.</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/signup">
                <button className="cta-btn" style={{ padding: '12px 28px', background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(13,148,136,.3)' }}>
                  Find my matches →
                </button>
              </Link>
              <Link href="/signup?role=company">
                <button className="cta-btn" style={{ padding: '12px 28px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', boxShadow: 'var(--shadow-sm)' }}>
                  Post a job
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
