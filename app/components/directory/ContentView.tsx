'use client'

import React from 'react'
import type { RecordItem } from './types'

interface Props {
  records: RecordItem[]
}

function Linked({
  link,
  children,
}: {
  link: string | null
  children: React.ReactNode
}) {
  if (!link) return <>{children}</>
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: 'var(--neon-blue)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
    >
      {children}
    </a>
  )
}

export default function ContentView({ records }: Props) {
  return (
    <div className="max-w-3xl space-y-0.5">
      {records.map((rec, i) => {
        const raw = String(rec.row[0] ?? '')
        const text = raw.trim()
        const link = rec.hyperlinks[0] ?? null

        // Empty row → spacer
        if (!text) return <div key={i} style={{ height: '1rem' }} />

        // 1. ALL-CAPS title row (e.g. "INDEPENDENT PIGMENT MIXER COMPLIANCE CHECKLIST")
        const isAllCaps =
          text === text.toUpperCase() && /[A-Z]{3,}/.test(text) && !text.startsWith('"')
        if (isAllCaps) {
          return (
            <div key={i} className="pt-2 pb-4" style={{ borderBottom: 'var(--border-thick)' }}>
              <h1
                className="text-xl font-black tracking-wide t-title"
                style={{ color: 'var(--foreground)' }}
              >
                <Linked link={link}>{text}</Linked>
              </h1>
            </div>
          )
        }

        // 2. Numbered section heading (e.g. "1. Claim Your Federal Identity (Cost: $0)")
        const numberedMatch = text.match(/^(\d+\.\s)(.+)$/)
        if (numberedMatch) {
          return (
            <div
              key={i}
              className="mt-8 mb-2 py-2.5 px-3 flex gap-2.5 items-center"
              style={{
                background: 'var(--card)',
                border: 'var(--border-thick)',
                borderRadius: 'var(--card-radius)',
              }}
            >
              <span
                className="text-xs font-black flex-shrink-0 tabular-nums"
                style={{ color: 'var(--neon-blue)', fontFamily: 'var(--font-mono)' }}
              >
                {numberedMatch[1]}
              </span>
              <h2 className="text-sm font-black t-title" style={{ color: 'var(--foreground)' }}>
                <Linked link={link}>{numberedMatch[2]}</Linked>
              </h2>
            </div>
          )
        }

        // 3. Labeled item row (Action:, Fact:, Method:, Benefit:, Efficiency:, etc.)
        const labelMatch = text.match(
          /^(Action|Fact|Method|Benefit|Efficiency|Note|Submit via Email|Submit via|Download Form|Fill it out|Section [A-Z]|COST|OWNERSHIP):\s*/i
        )
        if (labelMatch) {
          const label = labelMatch[1]
          const rest = text.slice(labelMatch[0].length)
          return (
            <div
              key={i}
              className="ml-5 mb-1 text-sm flex flex-wrap gap-x-1.5 gap-y-0.5 items-baseline"
            >
              <span
                className="font-bold t-upper text-[10px] flex-shrink-0 px-1.5 py-0.5"
                style={{
                  background: 'var(--accent)',
                  color: 'var(--accent-foreground)',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                }}
              >
                {label}
              </span>
              <span style={{ color: link ? 'var(--neon-blue)' : 'var(--foreground)' }}>
                <Linked link={link}>{rest}</Linked>
              </span>
            </div>
          )
        }

        // 4. Template label rows (RESPONSIBLE PERSON:, CONTACT FOR ADVERSE EVENTS:, PHONE:, ADDRESS:)
        const templateMatch = text.match(
          /^(RESPONSIBLE PERSON|CONTACT FOR ADVERSE EVENTS|PHONE|ADDRESS|FOR PROFESSIONAL USE ONLY)/
        )
        if (templateMatch) {
          return (
            <div
              key={i}
              className="ml-5 py-1.5 px-3 text-sm font-mono"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                color: 'var(--foreground)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
              }}
            >
              <Linked link={link}>{text}</Linked>
            </div>
          )
        }

        // 5. Quote/block rows (start with ")
        if (text.startsWith('"')) {
          return (
            <div
              key={i}
              className="ml-5 my-2 pl-3 py-2 text-sm"
              style={{
                borderLeft: '3px solid var(--neon-blue)',
                color: 'var(--muted)',
                fontStyle: 'italic',
                lineHeight: '1.65',
              }}
            >
              <Linked link={link}>{text}</Linked>
            </div>
          )
        }

        // 6. Sub-bullet rows (start with •, -, –, —)
        if (/^[•\-–—]/.test(text)) {
          return (
            <div key={i} className="ml-8 text-sm flex gap-2 items-baseline">
              <span style={{ color: 'var(--neon-blue)' }}>•</span>
              <span style={{ color: link ? 'var(--neon-blue)' : 'var(--foreground)' }}>
                <Linked link={link}>{text.replace(/^[•\-–—]\s*/, '')}</Linked>
              </span>
            </div>
          )
        }

        // 7. Section heading (short, no colon, starts with uppercase)
        const isSectionHeading =
          !text.includes(':') &&
          text.length < 80 &&
          /^[A-Z]/.test(text) &&
          !text.startsWith('"') &&
          !link
        if (isSectionHeading && i > 2) {
          return (
            <div
              key={i}
              className="mt-6 mb-2 py-2 px-3"
              style={{
                background: 'var(--card)',
                border: 'var(--border-thick)',
                borderRadius: 'var(--card-radius)',
              }}
            >
              <h3 className="text-sm font-bold t-title" style={{ color: 'var(--foreground)' }}>
                {text}
              </h3>
            </div>
          )
        }

        // 8. Generic short label: "Label: content" (catches items like "No 'Stealth' Fees: …")
        const genericColonPos = text.indexOf(': ')
        if (
          !text.startsWith('(') &&
          !text.startsWith('http') &&
          genericColonPos > 0 &&
          genericColonPos <= 40
        ) {
          const genericLabel = text.slice(0, genericColonPos)
          const genericRest = text.slice(genericColonPos + 2)
          if (genericRest.trim()) {
            return (
              <div
                key={i}
                className="ml-5 mb-1 text-sm flex flex-wrap gap-x-1.5 gap-y-0.5 items-baseline"
              >
                <span
                  className="font-bold t-upper text-[10px] flex-shrink-0 px-1.5 py-0.5"
                  style={{
                    background: 'var(--accent)',
                    color: 'var(--accent-foreground)',
                    borderRadius: '4px',
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.06em',
                  }}
                >
                  {genericLabel}
                </span>
                <span style={{ color: link ? 'var(--neon-blue)' : 'var(--foreground)' }}>
                  <Linked link={link}>{genericRest}</Linked>
                </span>
              </div>
            )
          }
        }

        // 9. Default paragraph
        return (
          <p
            key={i}
            className="ml-5 text-sm leading-relaxed"
            style={{ color: link ? 'var(--neon-blue)' : 'var(--muted)' }}
          >
            <Linked link={link}>{text}</Linked>
          </p>
        )
      })}
    </div>
  )
}
