'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { LogOut, User, Search, Briefcase, MessageSquare, LayoutDashboard, X, Menu, Sun, Moon } from 'lucide-react'
import { NavLink } from '@/types'
import { useTheme } from '@/components/ThemeProvider'

interface NavbarProps {
  userRole?: 'candidate' | 'company' | null
}

export default function Navbar({ userRole }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const supabase = createClient()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer()
    }
    if (drawerOpen) {
      document.addEventListener('keydown', onKeyDown)
      document.body.style.overflow = 'hidden'
      setTimeout(() => closeButtonRef.current?.focus(), 50)
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  const openDrawer = () => setDrawerOpen(true)
  const closeDrawer = () => setDrawerOpen(false)

  const handleSignOut = async () => {
    closeDrawer()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

  const navLink = (href: string): React.CSSProperties => ({
    fontSize: '13px',
    textDecoration: 'none',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    background: isActive(href) ? 'var(--accent)' : 'var(--accent-subtle)',
    color: isActive(href) ? '#ffffff' : 'var(--accent)',
    border: '1px solid var(--accent-border)',
    transition: 'background-color 150ms ease, color 150ms ease, box-shadow 150ms ease',
  })

  const drawerLink = (href: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '11px 16px',
    borderRadius: 'var(--radius-sm)',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: isActive(href) ? 700 : 500,
    color: isActive(href) ? 'var(--text-primary)' : 'var(--text-secondary)',
    background: isActive(href) ? 'var(--accent-subtle)' : 'transparent',
    borderLeft: isActive(href) ? '2px solid var(--accent)' : '2px solid transparent',
    transition: 'background-color 150ms ease, color 150ms ease, border-color 150ms ease',
  })

  const publicLinks = [
    { href: '/browse-jobs', label: 'Jobs' },
    { href: '/companies', label: 'Companies' },
    { href: '/how-it-works', label: 'How it Works' },
    { href: '/about', label: 'About' },
  ]

  const candidateLinks = [
    { href: '/jobs', label: 'Find Jobs', icon: <Search size={15} /> },
    { href: '/applications', label: 'Applications', icon: <Briefcase size={15} /> },
    { href: '/conversations', label: 'Messages', icon: <MessageSquare size={15} /> },
  ]

  const companyLinks = [
    { href: '/company/jobs', label: 'My Jobs', icon: <LayoutDashboard size={15} /> },
    { href: '/company/candidates', label: 'Candidates', icon: <Search size={15} /> },
    { href: '/conversations', label: 'Messages', icon: <MessageSquare size={15} /> },
  ]

  const activeLinks = userRole === 'candidate'
    ? candidateLinks
    : userRole === 'company'
      ? companyLinks
      : publicLinks

  const profileHref = userRole === 'candidate' ? '/profile' : '/company/profile'

  return (
    <>
      <style>{`
        .hw-desktop-links { display: flex; }
        .hw-hamburger      { display: none; }
        @media (max-width: 768px) {
          .hw-desktop-links { display: none !important; }
          .hw-hamburger      { display: flex !important; }
        }
        .hw-nav-link { color: var(--accent); text-decoration: none; }
        .hw-nav-link:hover,
        .hw-nav-link:hover * { background: var(--accent) !important; color: #fff !important; border-color: var(--accent) !important; }
        .hw-nav-link[data-active="true"] { color: #fff; }
        .hw-nav-link[data-active="true"]:hover { background: var(--accent-hover) !important; }
        .hw-profile-btn:hover { background: var(--surface-2) !important; }
        .hw-signout-btn:hover { color: var(--danger) !important; border-color: var(--danger-border) !important; }
        .hw-login-btn:hover { color: var(--text-primary) !important; border-color: var(--border-strong) !important; }
        .hw-signup-btn:hover { transform: translateY(-1px); box-shadow: var(--glow-accent); }
        .hw-drawer-link:hover { background: var(--surface-1) !important; color: var(--text-primary) !important; }
        .hw-signout-drawer:hover { background: var(--danger-subtle) !important; }
      `}</style>

      {/* Main nav bar */}
      <nav
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2.5rem', height: '60px',
          background: 'var(--nav-bg, rgba(8,8,18,0.95))', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(8px)',
        }}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: 'white' }}>H</div>
          <span style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
            Hire<span style={{ color: 'var(--accent)' }}>Wise</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hw-desktop-links" style={{ alignItems: 'center', gap: '1.25rem' }}>
          {!userRole && publicLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="hw-nav-link"
              data-active={isActive(href) ? 'true' : 'false'}
              style={navLink(href)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = '#ffffff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isActive(href) ? 'var(--accent)' : 'var(--accent-subtle)'; (e.currentTarget as HTMLElement).style.color = isActive(href) ? '#ffffff' : 'var(--accent)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)'; }}
            >
              {label}
            </Link>
          ))}
          {userRole === 'candidate' && candidateLinks.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="hw-nav-link"
              data-active={isActive(href) ? 'true' : 'false'}
              style={navLink(href)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = '#ffffff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isActive(href) ? 'var(--accent)' : 'var(--accent-subtle)'; (e.currentTarget as HTMLElement).style.color = isActive(href) ? '#ffffff' : 'var(--accent)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)'; }}
            >
              {icon}{label}
            </Link>
          ))}
          {userRole === 'company' && companyLinks.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="hw-nav-link"
              data-active={isActive(href) ? 'true' : 'false'}
              style={navLink(href)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = '#ffffff'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isActive(href) ? 'var(--accent)' : 'var(--accent-subtle)'; (e.currentTarget as HTMLElement).style.color = isActive(href) ? '#ffffff' : 'var(--accent)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-border)'; }}
            >
              {icon}{label}
            </Link>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="hw-desktop-links" style={{ gap: 8, alignItems: 'center' }}>
          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34, borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {userRole ? (
            <>
              <Link href={profileHref} style={{ textDecoration: 'none' }}>
                <button
                  className="hw-profile-btn"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', background: 'var(--surface-1)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
                    fontFamily: 'Inter,sans-serif', fontWeight: 500,
                    transition: 'background-color 150ms ease',
                  }}
                >
                  <User size={13} /> Profile
                </button>
              </Link>
              <button
                onClick={handleSignOut}
                className="hw-signout-btn"
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 12px', background: 'transparent',
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
                  fontFamily: 'Inter,sans-serif',
                  transition: 'color 150ms ease, border-color 150ms ease',
                }}
                aria-label="Sign out"
              >
                <LogOut size={13} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login">
                <button
                  className="hw-login-btn"
                  style={{
                    padding: '7px 18px', background: 'transparent',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
                    fontFamily: 'Inter,sans-serif', fontWeight: 500,
                    transition: 'color 150ms ease, border-color 150ms ease',
                  }}
                >
                  Log in
                </button>
              </Link>
              <Link href="/signup">
                <button
                  className="hw-signup-btn"
                  style={{
                    padding: '7px 18px', background: 'var(--accent)',
                    border: 'none', borderRadius: 'var(--radius-sm)', color: 'white',
                    fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif',
                    fontWeight: 700, boxShadow: 'var(--glow-accent)',
                    transition: 'transform 150ms ease, box-shadow 150ms ease',
                  }}
                >
                  Get started
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Hamburger (mobile only) */}
        <button
          className="hw-hamburger"
          onClick={openDrawer}
          aria-label="Open navigation menu"
          aria-expanded={drawerOpen}
          aria-controls="mobile-drawer"
          style={{
            alignItems: 'center', justifyContent: 'center',
            width: 38, height: 38,
            background: 'var(--surface-1)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-secondary)',
            flexShrink: 0,
          }}
        >
          <Menu size={18} />
        </button>
      </nav>

      {/* Backdrop */}
      {drawerOpen && (
        <div
          onClick={closeDrawer}
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(2px)',
            zIndex: 200,
            transition: 'opacity 250ms ease',
          }}
        />
      )}

      {/* Slide-in drawer */}
      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        style={{
          position: 'fixed', top: 0, right: 0,
          width: 280, height: '100dvh',
          background: 'var(--surface-0)',
          borderLeft: '1px solid var(--border)',
          backdropFilter: 'blur(24px)',
          zIndex: 300,
          display: 'flex', flexDirection: 'column',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms cubic-bezier(0.4,0,0.2,1)',
          overflowY: 'auto',
        }}
      >
        {/* Drawer header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px', height: 60,
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <Link href="/" onClick={closeDrawer} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 28, height: 28, background: 'linear-gradient(135deg, var(--accent), var(--accent-hover))', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, color: 'white' }}>H</div>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Hire<span style={{ color: 'var(--accent)' }}>Wise</span>
            </span>
          </Link>
          <button
            ref={closeButtonRef}
            onClick={closeDrawer}
            aria-label="Close navigation menu"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34,
              background: 'var(--surface-1)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-secondary)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav links */}
        <div style={{ padding: '12px 12px 0', flex: 1 }}>
          {activeLinks.map(({ href, label, icon }: NavLink) => (
            <Link
              key={href}
              href={href}
              onClick={closeDrawer}
              className="hw-drawer-link"
              style={drawerLink(href)}
            >
              {icon && <span style={{ color: isActive(href) ? 'var(--accent)' : 'var(--text-tertiary)', display: 'flex' }}>{icon}</span>}
              {label}
            </Link>
          ))}
        </div>

        {/* Bottom actions */}
        <div style={{ padding: '12px 12px 24px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
          {/* Theme toggle */}
          <button
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', marginBottom: 8,
              padding: '10px 16px', borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
              fontSize: 14, fontWeight: 500,
              cursor: 'pointer', fontFamily: 'Inter,sans-serif',
            }}
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          {userRole ? (
            <>
              <Link
                href={profileHref}
                onClick={closeDrawer}
                className="hw-drawer-link"
                style={drawerLink(profileHref)}
              >
                <span style={{ color: isActive(profileHref) ? 'var(--accent)' : 'var(--text-tertiary)', display: 'flex' }}>
                  <User size={15} />
                </span>
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="hw-signout-drawer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', marginTop: 6,
                  padding: '11px 16px', borderRadius: 'var(--radius-sm)',
                  background: 'transparent',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger)', fontSize: 14, fontWeight: 500,
                  cursor: 'pointer', fontFamily: 'Inter,sans-serif',
                  transition: 'background-color 150ms ease',
                  textAlign: 'left',
                }}
                aria-label="Sign out"
              >
                <LogOut size={15} />Sign out
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/login" onClick={closeDrawer} style={{ textDecoration: 'none' }}>
                <button style={{
                  width: '100%', padding: '11px 0',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'Inter,sans-serif',
                }}>
                  Log in
                </button>
              </Link>
              <Link href="/signup" onClick={closeDrawer} style={{ textDecoration: 'none' }}>
                <button style={{
                  width: '100%', padding: '11px 0',
                  background: 'var(--accent)',
                  border: 'none', borderRadius: 'var(--radius-sm)', color: 'white',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'Inter,sans-serif',
                  boxShadow: 'var(--glow-accent)',
                }}>
                  Get started →
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
