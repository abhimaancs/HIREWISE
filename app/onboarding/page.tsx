'use client'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isCompany = searchParams.get('role') === 'company'

  const steps = isCompany ? [
    { num: 1, icon: '🏢', title: 'Complete company profile', desc: 'Add your company details and description', href: '/company/profile' },
    { num: 2, icon: '💼', title: 'Post your first job', desc: 'Add required skills and job description', href: '/company/jobs' },
    { num: 3, icon: '🤖', title: 'Find top candidates', desc: 'AI ranks the best candidates for your role', href: '/company/candidates' },
  ] : [
    { num: 1, icon: '👤', title: 'Complete your profile', desc: 'Add your skills, college and bio', href: '/profile' },
    { num: 2, icon: '📄', title: 'Upload your resume', desc: 'Upload your PDF resume so companies can view it directly', href: '/profile' },
    { num: 3, icon: '✨', title: 'Browse AI matches', desc: 'See jobs ranked by your fit score', href: '/jobs' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <style>{`
        .onboard-step { transition: border-color 200ms ease, background-color 200ms ease; }
        .onboard-step:hover { border-color: var(--accent-border) !important; background: var(--accent-subtle) !important; }
      `}</style>
      <div style={{ width: '100%', maxWidth: 500 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 20 }}>
              Hire<span style={{ color: 'var(--accent)' }}>Wise</span>
            </div>
          </Link>
          <div style={{ width: 64, height: 64, background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', borderRadius: 'var(--radius-xl)', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>🎉</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: 8 }}>Welcome to HireWise!</div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 320, margin: '0 auto' }}>
            {isCompany ? "You're 3 steps away from finding perfect candidates" : "You're 3 steps away from finding your perfect job match"}
          </div>
        </div>

        {/* Steps */}
        <div style={{ marginBottom: '1.5rem' }}>
          {steps.map((step) => (
            <Link key={step.num} href={step.href} style={{ textDecoration: 'none' }}>
              <div
                className="onboard-step"
                style={{ background: 'var(--surface-0)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)', background: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>{step.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{step.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{step.desc}</div>
                </div>
                <span style={{ color: 'var(--accent)', fontSize: 16 }}>→</span>
              </div>
            </Link>
          ))}
        </div>

        <button
          onClick={() => router.push(steps[0].href)}
          style={{ width: '100%', padding: 13, background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter,sans-serif', marginBottom: 10, boxShadow: 'var(--glow-accent)' }}
        >
          {isCompany ? 'Complete company profile →' : 'Complete my profile →'}
        </button>

        <button
          onClick={() => router.push(isCompany ? '/company/jobs' : '/jobs')}
          style={{ width: '100%', padding: 12, background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return <Suspense><OnboardingContent /></Suspense>
}
