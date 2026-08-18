export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'

export default function HomePage() {
  return (
    <>
      <Navbar userRole={null} />

      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.9)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 25px rgba(13,148,136,.3)}50%{box-shadow:0 0 40px rgba(13,148,136,.5)}}
        @keyframes barGrow{from{width:0}to{width:var(--w)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .fade-up{animation:fadeUp .6s ease forwards}
        .fade-up-1{animation:fadeUp .6s .1s ease both}
        .fade-up-2{animation:fadeUp .6s .2s ease both}
        .fade-up-3{animation:fadeUp .6s .3s ease both}
        .fade-up-4{animation:fadeUp .6s .4s ease both}
        .fade-up-5{animation:fadeUp .6s .5s ease both}
        .glow-btn{animation:glow 3s ease-in-out infinite}
        .badge-dot{width:6px;height:6px;background:var(--accent);border-radius:50%;display:inline-block;animation:pulse 2s infinite;margin-right:6px;vertical-align:middle}
        .ai-item{animation:slideIn .4s ease forwards;opacity:0}
        .ai-item:nth-child(1){animation-delay:.2s}
        .ai-item:nth-child(2){animation-delay:.5s}
        .ai-item:nth-child(3){animation-delay:.8s}
        .ai-item:nth-child(4){animation-delay:1.1s}
        .bar-fill{animation:barGrow .9s .3s ease forwards;width:0}
        .btn-hero{transition:background-color 150ms ease,box-shadow 150ms ease,transform 150ms ease}
        .btn-hero:hover{transform:translateY(-2px);box-shadow:var(--glow-accent)}
        .btn-outline-hero{transition:background-color 150ms ease,border-color 150ms ease,transform 150ms ease}
        .btn-outline-hero:hover{background:var(--surface-2)!important;transform:translateY(-1px)}
        .feature-card{transition:border-color 200ms ease,transform 200ms ease,box-shadow 200ms ease}
        .feature-card:hover{border-color:var(--accent-border)!important;transform:translateY(-3px);box-shadow:var(--shadow-md)}
        .step-card{transition:border-color 200ms ease,transform 200ms ease}
        .step-card:hover{border-color:var(--accent-border)!important;transform:translateY(-2px)}
        .cta-btn{transition:background-color 150ms ease,transform 150ms ease}
        .cta-btn:hover{transform:translateY(-2px)}
        .db-link-h:hover{background:var(--surface-2)!important;color:var(--text-secondary)!important}
        [data-force-theme="dark"]{color-scheme:dark}

        @media(max-width:768px){
          .hero-grid{grid-template-columns:1fr!important;gap:2rem!important;padding:3rem 1.25rem 2rem!important}
          .dashboard{display:none!important}
          .features-grid{grid-template-columns:1fr 1fr!important}
          .split-cta{grid-template-columns:1fr!important}
          .steps-grid{grid-template-columns:1fr!important}
          .hero-title{font-size:2.5rem!important;letter-spacing:-1.5px!important}
          .hero-pills{flex-wrap:wrap!important}
          .hero-pill{min-width:calc(50% - 5px)!important}
        }
        @media(max-width:480px){
          .features-grid{grid-template-columns:1fr!important}
          .hero-title{font-size:2rem!important}
          .nav-links-desktop{display:none!important}
        }
      `}</style>

      {/* Background glow */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '30%', width: 600, height: 600, background: 'radial-gradient(circle,var(--accent-subtle) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', top: '40%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(circle,var(--accent-subtle) 0%,transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '10%', width: 400, height: 400, background: 'radial-gradient(circle,var(--success-subtle) 0%,transparent 70%)' }} />
      </div>

      {/* HERO */}
      <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', padding: '5rem 2.5rem 3rem', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Left */}
        <div>
          <div className="fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1.5px' }}>Hire<span style={{ color: 'var(--accent)' }}>Wise</span></span>
          </div>

          <div className="fade-up-1" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 999, padding: '5px 14px', fontSize: 12, color: 'var(--accent)', fontWeight: 700, marginBottom: '1.5rem' }}>
            <span className="badge-dot" />AI-Powered Hiring Platform
          </div>

          <h1 className="hero-title fade-up-2" style={{ fontSize: 'clamp(2.2rem,4vw,3.5rem)', fontWeight: 900, lineHeight: 1.05, color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '-2px' }}>
            Hire Smarter<br />
            <span style={{ color: 'var(--accent)' }}>with AI</span>
          </h1>

          <p className="fade-up-3" style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '2rem', maxWidth: 400 }}>
            HireWise uses AI to match the right talent to the right roles, and help companies build amazing teams — faster.
          </p>

          <div className="fade-up-4" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: '2.5rem' }}>
            <Link href="/signup">
              <button className="btn-hero glow-btn" style={{ padding: '13px 28px', background: 'var(--accent)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', boxShadow: '0 4px 14px rgba(13,148,136,0.3)' }}>
                Find Jobs →
              </button>
            </Link>
            <Link href="/signup?role=company">
              <button className="btn-outline-hero" style={{ padding: '13px 28px', background: 'transparent', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text-secondary)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                Post a Job
              </button>
            </Link>
          </div>

          {/* Feature pills */}
          <div className="hero-pills fade-up-5" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['📄', 'PDF Resume Upload', 'Store your resume securely'], ['🎯', 'Semantic Matching', 'Beyond keyword search'], ['💬', 'Direct Messaging', 'No recruiters needed']].map(([ic, tt, dc]) => (
              <div key={tt as string} className="hero-pill" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 120 }}>
                <span style={{ fontSize: 15 }}>{ic as string}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 1 }}>{tt as string}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{dc as string}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview */}
        <div>
          <div className="dashboard dashboard-card fade-up-5" style={{ border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, overflow: 'hidden', position: 'relative', boxShadow: '0 8px 48px var(--dashboard-glow), 0 2px 12px var(--dashboard-glow)' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle,rgba(255,255,255,.06) 0%,transparent 70%)', pointerEvents: 'none' }} />
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,.15)', position: 'relative', zIndex: 1, background: 'rgba(0,0,0,.10)' }}>
              <div style={{ width: 26, height: 26, background: 'rgba(255,255,255,.25)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 12, color: '#fff' }}>H</div>
              <div style={{ flex: 1, marginLeft: '.875rem' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Welcome back, Abhimaan 👋</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.65)' }}>3 new job matches since yesterday</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ position: 'relative', width: 24, height: 24, background: 'rgba(255,255,255,.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>🔔<div style={{ position: 'absolute', top: 3, right: 3, width: 5, height: 5, background: '#ef4444', borderRadius: '50%' }} /></div>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 9 }}>AC</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.65)' }}><div style={{ color: '#ffffff', fontWeight: 600, fontSize: 11 }}>Abhimaan C S</div>SDE Intern · Chennai</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', position: 'relative', zIndex: 1 }}>
              {/* Sidebar */}
              <div style={{ background: 'rgba(0,0,0,.12)', borderRight: '1px solid rgba(255,255,255,.12)', padding: '.875rem .625rem' }}>
                {[['🏠', 'Overview', true], ['🎯', 'My Matches', false], ['📄', 'Applications', false], ['💬', 'Messages', false], ['👤', 'Profile', false], ['⚙️', 'Settings', false]].map(([ic, lb, ac]) => (
                  <div key={lb as string} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 8px', borderRadius: 7, fontSize: 10, color: ac ? '#ffffff' : 'rgba(255,255,255,.60)', background: ac ? 'rgba(255,255,255,.20)' : 'transparent', fontWeight: ac ? 700 : 400, cursor: 'pointer', marginBottom: 2 }}>
                    <span>{ic as string}</span><span>{lb as string}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '.875rem' }}>
                {/* Stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: '.875rem' }}>
                  {[['🎯', 'Matches', '12', '↑ 3 today'], ['📄', 'Applied', '4', '↑ 1 this week'], ['💬', 'Messages', '2', '1 unread'], ['⭐', 'Shortlisted', '1', 'By Razorpay']].map(([ic, lb, vl, tr]) => (
                    <div key={lb as string} style={{ background: 'rgba(0,0,0,.12)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '.625rem .75rem' }}>
                      <div style={{ fontSize: 13, marginBottom: 4 }}>{ic as string}</div>
                      <div style={{ fontSize: 8, color: 'rgba(255,255,255,.60)', marginBottom: 3 }}>{lb as string}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', letterSpacing: '-.5px' }}>{vl as string}</div>
                      <div style={{ fontSize: 8, color: '#a7f3d0', marginTop: 2 }}>{tr as string}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Match Distribution */}
                    <div style={{ background: 'rgba(0,0,0,.12)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '.75rem' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#ffffff', marginBottom: '.625rem' }}>Your Match Scores</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <svg width="56" height="56" viewBox="0 0 56 56">
                          <circle cx="28" cy="28" r="22" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="8" />
                          <circle cx="28" cy="28" r="22" fill="none" stroke="#ffffff" strokeWidth="8" strokeDasharray="46 83" strokeDashoffset="0" strokeLinecap="round" />
                          <circle cx="28" cy="28" r="22" fill="none" stroke="#a7f3d0" strokeWidth="8" strokeDasharray="33 83" strokeDashoffset="-46" strokeLinecap="round" />
                          <circle cx="28" cy="28" r="22" fill="none" stroke="#fde68a" strokeWidth="8" strokeDasharray="4 83" strokeDashoffset="-79" strokeLinecap="round" />
                          <text x="28" y="26" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="800">12</text>
                          <text x="28" y="34" textAnchor="middle" fill="rgba(255,255,255,.65)" fontSize="6">Jobs</text>
                        </svg>
                        <div style={{ flex: 1 }}>
                          {[['#ffffff', '80–100%', '5 jobs'], ['#a7f3d0', '60–80%', '4 jobs'], ['#fde68a', '40–60%', '3 jobs']].map(([c, l, v]) => (
                            <div key={l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: c as string }} /><span style={{ fontSize: 8, color: 'rgba(255,255,255,.65)' }}>{l}</span></div>
                              <span style={{ fontSize: 8, fontWeight: 700, color: '#ffffff' }}>{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* My Skills */}
                    <div style={{ background: 'rgba(0,0,0,.12)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '.75rem' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#ffffff', marginBottom: '.625rem' }}>Skill Match Rate</div>
                      {[['React', '92%', 'rgba(255,255,255,.90)'], ['Node.js', '85%', '#a7f3d0'], ['TypeScript', '78%', 'rgba(255,255,255,.75)'], ['DSA', '60%', '#fde68a']].map(([sk, pct, bg]) => (
                        <div key={sk} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                          <span style={{ fontSize: 9, color: 'rgba(255,255,255,.65)', width: 48, textAlign: 'right', flexShrink: 0 }}>{sk}</span>
                          <div style={{ flex: 1, height: 5, background: 'rgba(0,0,0,.15)', borderRadius: 3, overflow: 'hidden' }}>
                            <div className="bar-fill" style={{ height: '100%', borderRadius: 3, background: bg, '--w': pct } as any} />
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 700, color: '#ffffff', width: 26 }}>{pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {/* Top Job Matches */}
                    <div style={{ background: 'rgba(0,0,0,.12)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.625rem' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#ffffff' }}>Top Job Matches</span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,.70)' }}>View all</span>
                      </div>
                      {[
                        ['RZ', 'Razorpay', 'SDE Intern', '94%', 'rgba(255,255,255,.25)', '#ffffff', 'rgba(255,255,255,.18)'],
                        ['SW', 'Swiggy', 'Full Stack Intern', '88%', 'rgba(255,255,255,.20)', '#ffffff', 'rgba(255,255,255,.15)'],
                        ['ZP', 'Zepto', 'Backend Intern', '76%', 'rgba(255,255,255,.15)', 'rgba(255,255,255,.85)', 'rgba(0,0,0,.12)']
                      ].map(([i, n, r, s, bg, sc, sbg]) => (
                        <div key={n as string} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                          <div style={{ width: 24, height: 24, borderRadius: 6, background: bg as string, border: '1px solid rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 8, flexShrink: 0 }}>{i as string}</div>
                          <div style={{ flex: 1 }}><div style={{ fontSize: 10, fontWeight: 600, color: '#ffffff' }}>{n as string}</div><div style={{ fontSize: 8, color: 'rgba(255,255,255,.60)' }}>{r as string}</div></div>
                          <div style={{ background: sbg as string, color: sc as string, border: '1px solid rgba(255,255,255,.20)', borderRadius: 6, fontSize: 10, fontWeight: 800, padding: '1px 6px' }}>{s as string}</div>
                        </div>
                      ))}
                    </div>
                    {/* AI Activity */}
                    <div style={{ background: 'rgba(0,0,0,.12)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 10, padding: '.75rem' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#ffffff', marginBottom: '.625rem' }}>Recent Activity</div>
                      {[
                        ['#a7f3d0', 'Resume Parsed', 'Skills auto-filled · React, Node.js, TS'],
                        ['rgba(255,255,255,.80)', '94% Match', 'Razorpay · SDE Intern role'],
                        ['#fde68a', 'Shortlisted', 'Razorpay moved you to shortlist'],
                        ['#a7f3d0', 'Cover Letter', 'AI generated for Swiggy role'],
                      ].map(([dot, title, desc], i) => (
                        <div key={i} className="ai-item" style={{ display: 'flex', alignItems: 'flex-start', gap: 6, padding: '5px 6px', background: 'rgba(0,0,0,.10)', border: '1px solid rgba(255,255,255,.10)', borderRadius: 7, marginBottom: 5 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: dot as string, marginTop: 2, flexShrink: 0 }} />
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.65)', lineHeight: 1.4 }}><strong style={{ fontWeight: 600, color: '#ffffff' }}>{title}</strong> — {desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS - Interactive Flow */}
      <div style={{ padding: '4rem 2.5rem', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--success-subtle)', border: '1px solid var(--success-border)', borderRadius: 999, padding: '4px 12px', fontSize: 11, color: 'var(--success)', fontWeight: 700, marginBottom: 12 }}>
            ✦ See it in action
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: 8 }}>How HireWise works</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Three steps to your perfect match</div>
        </div>

        <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, position: 'relative' }}>
          {/* Connector lines */}
          <div style={{ position: 'absolute', top: 40, left: 'calc(33% - 10px)', width: 'calc(34% + 20px)', height: 2, background: 'linear-gradient(90deg,var(--accent-border),var(--accent-border))', zIndex: 0, display: 'none' }} />

          {[
            {
              step: '01', icon: '👤', color: 'var(--accent)', bg: 'var(--accent-subtle)', border: 'var(--accent-border)',
              title: 'Build Your Profile',
              desc: 'Add your skills, experience, and education manually. Upload your PDF resume for companies to view directly.',
              demo: (
                <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', marginTop: 12 }}>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 6 }}>Profile completed</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {['React', 'Node.js', 'TypeScript', 'DSA', 'MongoDB'].map(s => (
                      <span key={s} style={{ background: 'var(--accent-subtle)', color: 'var(--accent)', border: '1px solid var(--accent-border)', borderRadius: 20, fontSize: 10, padding: '2px 8px', fontWeight: 600 }}>{s}</span>
                    ))}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 10, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, background: 'var(--success)', borderRadius: '50%', display: 'inline-block' }} />
                    Profile ready — 5 skills added
                  </div>
                </div>
              )
            },
            {
              step: '02', icon: '🤖', color: 'var(--accent)', bg: 'var(--accent-subtle)', border: 'var(--accent-border)',
              title: 'AI Scores Your Matches',
              desc: 'Our AI semantically understands your profile and scores every job from 0–100 based on real fit — not just keywords.',
              demo: (
                <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', marginTop: 12 }}>
                  {[['Razorpay · SDE Intern', '94%', 'var(--accent)', 'var(--accent-subtle)'], ['Swiggy · Full Stack Dev', '88%', 'var(--accent)', 'var(--accent-subtle)'], ['Zepto · Backend Eng.', '71%', 'var(--accent)', 'var(--accent-subtle)']].map(([job, score, sc, sbg]) => (
                    <div key={job} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{job}</span>
                      <span style={{ background: sbg, color: sc, borderRadius: 6, fontSize: 10, fontWeight: 800, padding: '1px 7px' }}>{score}</span>
                    </div>
                  ))}
                </div>
              )
            },
            {
              step: '03', icon: '💬', color: 'var(--accent)', bg: 'var(--accent-subtle)', border: 'var(--accent-border)',
              title: 'Connect Directly',
              desc: 'Chat directly with hiring managers for your top matches. No recruiters, no spam, no gatekeepers.',
              demo: (
                <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 12px', marginTop: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 6 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8, fontWeight: 800, flexShrink: 0 }}>R</div>
                    <div style={{ background: 'var(--surface-0)', borderRadius: '8px 8px 8px 2px', padding: '5px 8px', fontSize: 10, color: 'var(--text-primary)', lineHeight: 1.4 }}>Hi! You matched 94% with our SDE Intern role 🎉</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, justifyContent: 'flex-end' }}>
                    <div style={{ background: 'var(--accent)', borderRadius: '8px 8px 2px 8px', padding: '5px 8px', fontSize: 10, color: '#fff', lineHeight: 1.4 }}>Excited to learn more! When can we chat?</div>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 8, fontWeight: 800, flexShrink: 0 }}>A</div>
                  </div>
                </div>
              )
            }
          ].map((s, i) => (
            <div key={s.step} className="step-card" style={{ background: 'var(--surface-0)', border: `1px solid ${s.border}`, borderRadius: 18, padding: '1.5rem', position: 'relative', zIndex: 1, boxShadow: `0 0 30px ${s.bg}, var(--shadow-sm)` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{s.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: s.color, letterSpacing: '.1em' }}>{s.step}</div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-.2px' }}>{s.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{s.desc}</div>
              {s.demo}
              {i < 2 && <div style={{ position: 'absolute', top: '50%', right: '-28px', width: 20, height: 20, background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--accent)', zIndex: 2, transform: 'translateY(-50%)' }}>→</div>}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Link href="/signup">
            <button className="btn-hero glow-btn" style={{ padding: '13px 32px', background: 'var(--accent)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', boxShadow: '0 4px 14px rgba(13,148,136,0.3)' }}>
              Try it yourself — it's free →
            </button>
          </Link>
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ padding: '3rem 2.5rem', maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px', marginBottom: 8 }}>Everything you need to get hired</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Built for candidates and companies who want a smarter way to connect</div>
        </div>
        <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14 }}>
          {[
            ['👤', 'var(--accent-subtle)', 'Manual Profile Builder', 'Add your skills, experience, education and bio. Your profile drives AI matching — no parsing needed.'],
            ['🎯', 'var(--accent-subtle)', 'Semantic Matching', 'Goes beyond keywords — understands context. React matches ReactJS, Backend matches Node.js.'],
            ['💬', 'rgba(6,182,212,.15)', 'Direct Messaging', 'Real-time chat with hiring managers. No middlemen, no delays, no spam.'],
            ['📊', 'rgba(245,158,11,.15)', 'Match Scores', 'See exactly why you matched a job and which of your skills align. Full transparency.'],
            ['📄', 'rgba(16,185,129,.15)', 'Cover Letter AI', 'One-click AI-generated cover letters tailored specifically to each job you apply for.'],
            ['🔒', 'rgba(239,68,68,.15)', 'Secure & Private', 'Your data is yours. Row-level security ensures only you can see your profile and applications.'],
          ].map(([ic, bg, tt, dc]) => (
            <div key={tt as string} className="feature-card" style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 18, padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: bg as string, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{ic as string}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-.2px' }}>{tt as string}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{dc as string}</div>
            </div>
          ))}
        </div>
      </div>

      {/* SPLIT CTA */}
      <div className="split-cta" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 1200, margin: '0 auto', padding: '0 2.5rem 4rem', position: 'relative', zIndex: 1 }}>
        <div className="big-card-teal" style={{ background: 'var(--accent)', border: 'none', borderRadius: 22, padding: '2.25rem', boxShadow: '0 8px 32px rgba(13,148,136,.25)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>For Candidates</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', marginBottom: 10, letterSpacing: '-.8px', lineHeight: 1.2 }}>Find your perfect role faster</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, marginBottom: '1.5rem' }}>Complete your profile, add your skills, and let AI find the jobs where you're genuinely the best fit. Apply in one click.</div>
          <Link href="/signup">
            <button className="cta-btn" style={{ padding: '11px 24px', background: '#ffffff', border: 'none', borderRadius: 10, color: 'var(--accent)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>Get started →</button>
          </Link>
        </div>
        <div className="big-card-teal" style={{ background: 'var(--accent-hover)', border: 'none', borderRadius: 22, padding: '2.25rem', boxShadow: '0 8px 32px rgba(13,148,136,.2)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14 }}>For Companies</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', marginBottom: 10, letterSpacing: '-.8px', lineHeight: 1.2 }}>Find the right candidate fast</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.8, marginBottom: '1.5rem' }}>Post a job and AI instantly ranks all candidates by how well they match. Message top candidates directly.</div>
          <Link href="/signup?role=company">
            <button className="cta-btn" style={{ padding: '11px 24px', background: '#ffffff', border: 'none', borderRadius: 10, color: 'var(--accent-hover)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>Post a job →</button>
          </Link>
        </div>
      </div>

      {/* FINAL CTA */}
      <div style={{ textAlign: 'center', padding: '5rem 2rem', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden', zIndex: 1 }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle,var(--accent-subtle) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ fontSize: 30, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1.5px', marginBottom: 8, position: 'relative', zIndex: 1 }}>Ready to hire smarter?</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}>Join HireWise and let AI do the hard work</div>
        <Link href="/signup">
          <button className="btn-hero glow-btn" style={{ padding: '14px 40px', background: 'var(--accent)', border: 'none', borderRadius: 14, color: '#fff', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter,sans-serif', position: 'relative', zIndex: 1 }}>
            Get started free →
          </button>
        </Link>
      </div>
    </>
  )
}
