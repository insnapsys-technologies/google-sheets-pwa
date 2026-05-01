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

        // First column is always the name/title
        const nameIdxLocal = 0
        const urlIdxLocal = rowHeaders.findIndex((h) =>
          /url|link|website|^web$/i.test(String(h).trim())
        )

        const isImageUrl = (val: unknown): boolean => {
          if (!val || typeof val !== 'string') return false
          const v = val.trim()
          // Our own Drive proxy URL (relative path)
          if (/^\/api\/image\?id=[A-Za-z0-9_-]+/.test(v)) return true
          if (!v.startsWith('http')) return false
          // Strip query string and fragment, then check extension at end of path
          const pathPart = v.replace(/[?#].*$/, '')
          if (/\.(png|jpe?g|gif|webp|svg|bmp|ico)$/i.test(pathPart)) return true
          // Wix-style CDN: extension appears mid-path before /v1/fill/... segments
          if (/\.(png|jpe?g|gif|webp|svg|bmp|ico)[/?]/i.test(v)) return true
          // Known image CDN domains or path patterns (Shopify, Wix, BigCartel, etc.)
          return /imgur\.com|cloudinary\.com|googleusercontent\.com|twimg\.com|githubusercontent\.com|wixstatic\.com|bigcartel\.com|\/cdn\/shop\/files\//i.test(v)
        }

        // Check both cell value and hyperlink URL for image URL detection
        const isImageAtIdx = (idx: number): boolean =>
          isImageUrl(row[idx]) || isImageUrl(rowHyperlinks[idx])

        let logoIdxLocal = rowHeaders.findIndex((h) => /logo|image|icon/i.test(String(h)))
        if (logoIdxLocal === -1) {
          // Scan all columns (including headerless ones beyond rowHeaders length)
          const maxLen = Math.max(row.length, rowHeaders.length)
          for (let idx = 0; idx < maxLen; idx++) {
            if (idx !== nameIdxLocal && idx !== urlIdxLocal && isImageAtIdx(idx)) {
              logoIdxLocal = idx
              break
            }
          }
        }

        const name = nameIdxLocal >= 0 ? row[nameIdxLocal] : row[0]
        // Prefer the hyperlink URL if it's an image, otherwise use cell value
        const logoRaw = logoIdxLocal >= 0 ? row[logoIdxLocal] : null
        const logoHyperlinkRaw = logoIdxLocal >= 0 ? (rowHyperlinks[logoIdxLocal] ?? null) : null
        const logo = isImageUrl(logoHyperlinkRaw) ? logoHyperlinkRaw : (isImageUrl(logoRaw) ? logoRaw : logoHyperlinkRaw ?? logoRaw)

        const rawUrlValue = urlIdxLocal >= 0 ? String(row[urlIdxLocal] ?? '') : ''
        const urlHyperlink = urlIdxLocal >= 0 ? (rowHyperlinks[urlIdxLocal] ?? null) : null
        const url = urlHyperlink ?? (rawUrlValue.startsWith('http') ? rawUrlValue : null)

        if (!name || String(name).trim() === '') return null

        // Skip repeated header rows (rows whose values contain header keywords)
        const HEADER_KEYWORDS = /^(address|social|web|website|phone|email|name|logo|url|link)$/i
        const isHeaderRow = row.some((v) => v && HEADER_KEYWORDS.test(String(v).trim()))
        if (isHeaderRow) return null

        // Pick the most relevant cell formatting: name cell first, then any non-null in the row
        const rowFmt = rec.formatting ?? []
        const nameFmt = nameIdxLocal >= 0 ? (rowFmt[nameIdxLocal] ?? null) : null
        const fmt = nameFmt ?? rowFmt.find((f) => f != null) ?? null
        const accentColor = fmt?.bgColor ? `#${fmt.bgColor}` : null
        const titleColor = fmt?.textColor ? `#${fmt.textColor}` : 'var(--foreground)'

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
                ...(accentColor && { borderLeft: `4px solid ${accentColor}` }),
              }}
            >
              <div>
                <h3
                  className="font-bold text-sm leading-snug line-clamp-2 t-title"
                  style={{ color: titleColor }}
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

              {logo && (
                <div
                  className="w-full overflow-hidden"
                  style={{
                    borderRadius: 'calc(var(--card-radius) / 2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <img
                    src={logo}
                    alt={name ?? ''}
                    loading="lazy"
                    decoding="async"
                    className="w-full object-contain max-h-20"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement
                      const wrapper = img.parentElement
                      if (wrapper) wrapper.style.display = 'none'
                    }}
                  />
                </div>
              )}

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
