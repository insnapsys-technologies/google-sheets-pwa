'use client'

import Link from 'next/link'
import { TILE_IMAGES, TILE_FALLBACK_COLORS } from '@/app/config/tile-images'

export function toSlug(tab: string) {
  return tab.toLowerCase().replace(/\//g, '').replace(/\s+/g, '-')
}

interface Props {
  tabs: string[]
}

// 2-col uniform dashboard grid — all breakpoints including mobile

export default function CategoryGrid({ tabs }: Props) {
  return (
    <main style={{ background: 'var(--background)', minHeight: '100vh' }}>
      {/* ── Header: Mission Statement ─────────────────────────── */}
      <section
        style={{
          paddingTop: 'clamp(2rem, 5vw, 4rem)',
          paddingBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
          paddingLeft: 'max(1.25rem, env(safe-area-inset-left))',
          paddingRight: 'max(1.25rem, env(safe-area-inset-right))',
        }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          {/* Brand eyebrow */}
          <p
            style={{
              fontFamily: 'var(--font-jetbrains)',
              fontWeight: 400,
              fontSize: '0.72rem',
              letterSpacing: '0.18em',
              color: 'rgba(255,255,255,0.35)',
              textTransform: 'uppercase',
              margin: '0 0 0.75rem 0',
            }}
          >
            True Line
          </p>

          {/* Mission statement — primary heading */}
          <h1
            style={{
              fontFamily: 'var(--font-inter)',
              fontWeight: 700,
              fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
              lineHeight: 1.4,
              letterSpacing: '-0.02em',
              color: '#ffffff',
              maxWidth: '64ch',
              margin: '0 0 1.25rem 0',
            }}
          >
            A directory dedicated to artist-owned, artist-made, artist-created
            independent brands and makers that stand to push tattooing forward
            as a trade and a craft—not part of the PE or conglomerate industry.
          </h1>

          {/* Supporting text */}
          <div
            style={{
              borderLeft: '1px solid rgba(255,255,255,0.18)',
              paddingLeft: '1.25rem',
              maxWidth: '52ch',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-jetbrains)',
                fontWeight: 400,
                fontSize: 'clamp(0.72rem, 1.1vw, 0.875rem)',
                lineHeight: 1.8,
                color: '#bbbbbb',
                margin: 0,
              }}
            >
              Make your money count. This is an unbiased directory of independent brands
              and makers. If you belong here and are not yet included, submit your
              information to be added. Keep the money earned within our trade and off their
              spreadsheets.
            </p>
          </div>
        </div>
      </section>

      {/* ── Divider ──────────────────────────────────────────── */}
      <div
        style={{
          height: '1px',
          background: 'rgba(255,255,255,0.1)',
          margin: '0 max(1.25rem, env(safe-area-inset-left))',
        }}
      />

      {/* ── 2×4 Dashboard Grid ───────────────────────────────── */}
      <section
        style={{
          padding: 'clamp(1.25rem, 3vw, 2rem) max(1.25rem, env(safe-area-inset-left))',
        }}
      >
        <div
          className="gateway-grid"
          style={{
            maxWidth: '72rem',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '3px',
          }}
        >
          {tabs.slice(0, 8).map((tab, i) => {
            const imageUrl = TILE_IMAGES[tab] || ''
            const fallbackColor = TILE_FALLBACK_COLORS[i % TILE_FALLBACK_COLORS.length]
            const index = String(i + 1).padStart(2, '0')

            return (
              <Link
                key={tab}
                href={`/${toSlug(tab)}`}
                className="gateway-tile"
                style={{
                  minHeight: '220px',
                  position: 'relative',
                  display: 'block',
                  overflow: 'hidden',
                  background: imageUrl ? 'transparent' : fallbackColor,
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                {/* Background image */}
                {imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageUrl}
                    alt=""
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  />
                )}

                {/* Dark overlay — always present */}
                <div
                  className="tile-overlay"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: imageUrl
                      ? 'rgba(0,0,0,0.55)'
                      : 'linear-gradient(160deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 100%)',
                    transition: 'background 280ms ease',
                  }}
                />

                {/* Subtle top edge line */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '1px',
                    background: 'rgba(255,255,255,0.08)',
                  }}
                />

                {/* Tile content */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: 'clamp(0.875rem, 2.5vw, 1.5rem)',
                  }}
                >
                  {/* Index */}
                  <p
                    style={{
                      fontFamily: 'var(--font-jetbrains)',
                      fontWeight: 400,
                      fontSize: '0.7rem',
                      color: 'rgba(255,255,255,0.4)',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      margin: '0 0 0.4rem 0',
                    }}
                  >
                    {index}
                  </p>

                  {/* Name + arrow */}
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <p
                      style={{
                        fontFamily: 'var(--font-inter)',
                        fontWeight: 900,
                        fontSize: 'clamp(1rem, 2vw, 1.4rem)',
                        lineHeight: 1.05,
                        letterSpacing: '-0.03em',
                        color: '#ffffff',
                        textTransform: 'uppercase',
                        margin: 0,
                      }}
                    >
                      {tab}
                    </p>
                    <span
                      className="tile-arrow"
                      style={{
                        fontFamily: 'var(--font-inter)',
                        fontWeight: 700,
                        fontSize: '1rem',
                        color: 'rgba(255,255,255,0.5)',
                        flexShrink: 0,
                        transition: 'color 280ms ease, transform 280ms ease',
                        display: 'inline-block',
                      }}
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Overflow tabs (>8) — simple list */}
        {tabs.length > 8 && (
          <div
            style={{
              maxWidth: '72rem',
              margin: '3px auto 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '3px',
            }}
          >
            {tabs.slice(8).map((tab, i) => {
              const fallbackColor = TILE_FALLBACK_COLORS[(i + 8) % TILE_FALLBACK_COLORS.length]
              const index = String(i + 9).padStart(2, '0')
              return (
                <Link
                  key={tab}
                  href={`/${toSlug(tab)}`}
                  className="gateway-tile"
                  style={{
                    minHeight: '140px',
                    position: 'relative',
                    display: 'block',
                    overflow: 'hidden',
                    background: fallbackColor,
                    cursor: 'pointer',
                    textDecoration: 'none',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(160deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0) 100%)',
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1rem' }}>
                    <p style={{ fontFamily: 'var(--font-jetbrains)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 0.3rem 0' }}>{index}</p>
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                      <p style={{ fontFamily: 'var(--font-inter)', fontWeight: 900, fontSize: '1rem', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#ffffff', textTransform: 'uppercase', margin: 0 }}>{tab}</p>
                      <span style={{ fontFamily: 'var(--font-inter)', fontWeight: 700, fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', flexShrink: 0 }} aria-hidden="true">→</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* ── Divider ──────────────────────────────────────────── */}
      <div
        style={{
          height: '1px',
          background: 'rgba(255,255,255,0.1)',
          margin: '0 max(1.25rem, env(safe-area-inset-left))',
        }}
      />

      {/* ── Footer tagline ───────────────────────────────────── */}
      <section
        style={{
          paddingTop: 'clamp(1.5rem, 3vw, 2.5rem)',
          paddingBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
          paddingLeft: 'max(1.25rem, env(safe-area-inset-left))',
          paddingRight: 'max(1.25rem, env(safe-area-inset-right))',
        }}
      >
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontWeight: 900,
              fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.85)',
              margin: 0,
            }}
          >
            Put your money where your mouth is.
          </p>
        </div>
      </section>

    </main>
  )
}
