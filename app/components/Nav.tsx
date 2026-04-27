'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'

const navLinks = [
  { href: '/', label: 'Directory' },
]

export default function Nav() {
  const pathname = usePathname()
  const { theme, toggle } = useTheme()

  return (
    <nav
      className="sticky top-0 z-30"
      style={{
        background: 'var(--nav-bg)',
        backdropFilter: 'var(--nav-blur)',
        WebkitBackdropFilter: 'var(--nav-blur)',
        borderBottom: 'var(--nav-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
        <Link
          href="/"
          className="text-base font-black t-title"
          style={{ color: 'var(--foreground)' }}
        >
          True Line
        </Link>
        <div className="flex items-center gap-4">
          {navLinks.map(({ href, label }) => {
            const active =
              href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="text-xs font-bold t-upper py-1"
                style={{
                  color: active ? 'var(--accent)' : 'var(--muted)',
                  borderBottom: active
                    ? '2px solid var(--accent)'
                    : '2px solid transparent',
                  transition: 'color var(--transition-speed) ease, border-color var(--transition-speed) ease',
                }}
              >
                {label}
              </Link>
            )
          })}
          <button
            onClick={toggle}
            className="ml-2 flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold t-upper cursor-pointer"
            style={{
              color: 'var(--muted)',
              border: 'var(--border-thick)',
              borderRadius: 'var(--pill-radius)',
              background: 'var(--card)',
              transition: 'all var(--transition-speed) ease',
            }}
            title={`Switch to ${theme === 'brutalist' ? 'Glass' : 'Brutalist'} theme`}
          >
            {theme === 'brutalist' ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" opacity="0.5" />
                </svg>
                Glass
              </>
            ) : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" />
                </svg>
                Brutal
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  )
}
