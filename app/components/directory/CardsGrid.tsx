'use client'

import React from 'react'
import type { RecordItem } from './types'

interface Props {
  records: RecordItem[]
}

export default function CardsGrid({ records }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {records.map((rec, i) => {
        const row = rec.row
        const rowHeaders = rec.headers
        const rowHyperlinks = rec.hyperlinks ?? []

        const nameIdxLocal = rowHeaders.findIndex((h) => /^name$/i.test(String(h).trim()))
        const logoIdxLocal = rowHeaders.findIndex((h) => /logo|image|icon/i.test(String(h)))
        const urlIdxLocal = rowHeaders.findIndex((h) =>
          /url|link|website|^web$/i.test(String(h).trim())
        )

        const name = nameIdxLocal >= 0 ? row[nameIdxLocal] : row[0]
        const logo = logoIdxLocal >= 0 ? row[logoIdxLocal] : null

        const rawUrlValue = urlIdxLocal >= 0 ? String(row[urlIdxLocal] ?? '') : ''
        const urlHyperlink = urlIdxLocal >= 0 ? (rowHyperlinks[urlIdxLocal] ?? null) : null
        const url = urlHyperlink ?? (rawUrlValue.startsWith('http') ? rawUrlValue : null)

        if (!name || String(name).trim() === '') return null

        const otherFields = rowHeaders
          .map((h, idx) => ({ label: h, value: row[idx] }))
          .filter((_, idx) => idx !== nameIdxLocal && idx !== logoIdxLocal && idx !== urlIdxLocal)
          .filter((f) => f.value)

        return (
          <div key={i} className="h-full">
            <div
              className="dir-card group p-5 flex flex-col gap-3 h-full cursor-pointer"
              style={{
                background: 'var(--card)',
                border: 'var(--border-thick)',
                borderRadius: 'var(--card-radius)',
                backdropFilter: 'var(--card-blur)',
                WebkitBackdropFilter: 'var(--card-blur)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <div className="flex items-center gap-3">
                {logo ? (
                  <img
                    src={logo}
                    alt={name ?? ''}
                    width={40}
                    height={40}
                    loading="lazy"
                    decoding="async"
                    className="w-10 h-10 object-contain flex-shrink-0"
                    style={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: 'calc(var(--card-radius) / 2)',
                    }}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      img.style.display = 'none'
                      const fallback = img.nextElementSibling as HTMLElement
                      if (fallback) fallback.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div
                  className="w-10 h-10 flex-shrink-0 items-center justify-center font-black text-sm"
                  style={{
                    display: logo ? 'none' : 'flex',
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                    borderRadius: 'calc(var(--card-radius) / 2)',
                  }}
                >
                  {name?.[0]?.toUpperCase() ?? '?'}
                </div>
                <h3
                  className="font-bold text-sm leading-snug line-clamp-2 t-title"
                  style={{ color: 'var(--foreground)' }}
                >
                  {name}
                </h3>
              </div>

              <div className="flex-1 space-y-1.5">
                {otherFields.slice(0, 3).map((f) => {
                  const isInsta = /instagram|insta|social/i.test(f.label)
                  if (isInsta) {
                    const handles = String(f.value ?? '')
                      .split(/[\s,;/\n]+/)
                      .map((h) => h.trim())
                      .filter(Boolean)
                      .map((h) => h.replace(/^@/, ''))
                      .filter(Boolean)
                    return (
                      <p
                        key={f.label}
                        className="text-xs flex items-center gap-1 flex-wrap"
                        style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                      >
                        <span className="font-bold t-upper" style={{ color: 'var(--foreground)' }}>
                          {f.label}:{' '}
                        </span>
                        {handles.map((h, hi) => (
                          <a
                            key={hi}
                            href={`https://instagram.com/${h}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-0.5"
                            style={{ color: '#E1306C', textDecoration: 'none' }}
                          >
                            <svg
                              className="w-3 h-3 flex-shrink-0"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                              <circle cx="12" cy="12" r="4" />
                              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                            </svg>
                            @{h}
                          </a>
                        ))}
                      </p>
                    )
                  }
                  return (
                    <p
                      key={f.label}
                      className="text-xs line-clamp-1 flex items-center gap-1"
                      style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      <span className="font-bold t-upper" style={{ color: 'var(--foreground)' }}>
                        {f.label}:{' '}
                      </span>
                      {f.value}
                    </p>
                  )
                })}
              </div>

              {url && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    window.open(url, '_blank')
                  }}
                  className="flex items-center gap-1.5 pt-1"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    style={{ color: 'var(--neon-blue)' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M14 3h7m0 0v7m0-7L10 14"
                    />
                  </svg>
                  <span
                    className="text-[10px] t-upper font-bold underline"
                    style={{ color: 'var(--neon-blue)' }}
                  >
                    Visit
                  </span>
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
