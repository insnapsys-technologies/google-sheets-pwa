'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Field {
  label: string
  value: string
}

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  name: string | null
  logo: string | null
  url: string | null
  fields: Field[]
}

export default function BottomSheet({ open, onClose, name, logo, url, fields }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  // Open / close lifecycle
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  // Detect description field
  const descField = fields.find(f => /desc|about|summary|bio|overview/i.test(f.label))
  const tagField = fields.find(f => /tag|categor|type|industry/i.test(f.label))
  const metaFields = fields.filter(f => f !== descField && f !== tagField).slice(0, 4)

  const tags = tagField?.value
    ? tagField.value.split(/[,;|]/).map(t => t.trim()).filter(Boolean)
    : []

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{
          background: 'rgba(0,0,0,0.5)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 250ms ease',
        }}
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={name ?? 'Details'}
        className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
        style={{
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 300ms cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        <div
          className="w-full flex flex-col"
          style={{
            maxWidth: '720px',
            maxHeight: '90vh',
            background: 'var(--background)',
            borderTop: 'var(--nav-border)',
            borderLeft: 'var(--nav-border)',
            borderRight: 'var(--nav-border)',
            borderRadius: 'var(--card-radius) var(--card-radius) 0 0',
            backdropFilter: 'var(--card-blur)',
            WebkitBackdropFilter: 'var(--card-blur)',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.25)',
          }}
        >
          {/* Handle + close */}
          <div className="flex-shrink-0 flex items-center justify-center pt-3 pb-2 relative">
            <div
              className="w-10 h-1 rounded-full"
              style={{ background: 'var(--muted)', opacity: 0.5 }}
            />
            <button
              onClick={onClose}
              className="absolute right-4 top-2 w-8 h-8 flex items-center justify-center cursor-pointer"
              style={{
                color: 'var(--muted)',
                border: 'var(--border-thick)',
                borderRadius: 'var(--pill-radius)',
                background: 'var(--card)',
                transition: 'all var(--transition-speed) ease',
              }}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content — auto-sized */}
          <div className="px-5 pb-4">
            {/* Top: Logo + Name + Description */}
            <div className="flex items-start gap-4 mb-5">
              {logo ? (
                <img
                  src={logo}
                  alt={name ?? ''}
                  width={56}
                  height={56}
                  className="w-14 h-14 object-contain flex-shrink-0"
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'calc(var(--card-radius) / 2)',
                  }}
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div
                  className="w-14 h-14 flex-shrink-0 flex items-center justify-center font-black text-lg"
                  style={{
                    background: 'var(--card)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                    borderRadius: 'calc(var(--card-radius) / 2)',
                  }}
                >
                  {name?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2
                  className="text-lg font-black t-title leading-tight mb-1"
                  style={{ color: 'var(--foreground)' }}
                >
                  {name}
                </h2>
                {descField && (
                  <p
                    className="text-sm line-clamp-2"
                    style={{ color: 'var(--muted)', lineHeight: '1.6' }}
                  >
                    {descField.value}
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2.5 py-1 font-bold t-upper"
                    style={{
                      color: 'var(--neon-blue)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--pill-radius)',
                      background: 'var(--card)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Metadata fields */}
            {metaFields.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-5">
                {metaFields.map((f) => {
                  const isInsta = /instagram|insta|social/i.test(f.label)
                  if (isInsta) {
                    const handles = String(f.value ?? '')
                      .split(/[\s,;\/\n]+/)
                      .map((h) => h.trim())
                      .filter(Boolean)
                      .map((h) => h.replace(/^@/, ''))
                      .filter(Boolean)
                    return (
                      <div
                        key={f.label}
                        className="p-3"
                        style={{
                          background: 'var(--card)',
                          border: 'var(--border-thick)',
                          borderRadius: 'var(--card-radius)',
                        }}
                      >
                        <p className="text-[10px] font-bold t-upper mb-2" style={{ color: 'var(--muted)' }}>
                          {f.label}
                        </p>
                        <div className="flex flex-col gap-1">
                          {handles.map((h, i) => (
                            <a
                              key={i}
                              href={`https://instagram.com/${h}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm font-bold"
                              style={{ color: '#E1306C', textDecoration: 'none' }}
                            >
                              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                <circle cx="12" cy="12" r="4" />
                                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                              </svg>
                              @{h}
                            </a>
                          ))}
                        </div>
                      </div>
                    )
                  }
                  return (
                    <div
                      key={f.label}
                      className="p-3"
                      style={{
                        background: 'var(--card)',
                        border: 'var(--border-thick)',
                        borderRadius: 'var(--card-radius)',
                      }}
                    >
                      <p
                        className="text-[10px] font-bold t-upper mb-1"
                        style={{ color: 'var(--muted)' }}
                      >
                        {f.label}
                      </p>
                      <p
                        className="text-sm font-bold line-clamp-2"
                        style={{ color: 'var(--foreground)', fontFamily: 'var(--font-mono)' }}
                      >
                        {f.value}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Sticky bottom CTA */}
          <div
            className="flex-shrink-0 px-5 py-4 flex gap-3"
            style={{
              borderTop: 'var(--nav-border)',
              background: 'var(--background)',
            }}
          >
            {url ? (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold t-upper"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                  border: 'var(--border-thick)',
                  borderRadius: 'var(--pill-radius)',
                  transition: 'all var(--transition-speed) ease',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 3h7m0 0v7m0-7L10 14" />
                </svg>
                Visit Website
              </a>
            ) : (
              <div className="flex-1" />
            )}
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: name ?? '', url: url ?? window.location.href }).catch(() => {})
                } else if (url) {
                  navigator.clipboard.writeText(url).catch(() => {})
                }
              }}
              className="w-12 h-12 flex items-center justify-center flex-shrink-0 cursor-pointer"
              style={{
                border: 'var(--border-thick)',
                borderRadius: 'var(--pill-radius)',
                background: 'var(--card)',
                color: 'var(--muted)',
                transition: 'all var(--transition-speed) ease',
              }}
              aria-label="Share"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
