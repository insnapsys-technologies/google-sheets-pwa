'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import type { DirectoryClientProps } from './directory/types'
import { useSheetData, generateTableName } from './directory/useSheetData'
import ContentView from './directory/ContentView'
import CardsGrid from './directory/CardsGrid'

const ADDRESS_RE = /address|location|city|state|region/i

export default function DirectoryClient({ tab }: DirectoryClientProps) {
  const [search, setSearch] = useState('')
  const [activeTableIdx, setActiveTableIdx] = useState<number | null>(null)
  const [locationFilter, setLocationFilter] = useState('')

  // Single-column content view: only plain text + hyperlinks, no card grid
  const isContentView = tab.toLowerCase().includes('pigment')

  const { records, tables, loading } = useSheetData(tab, isContentView)

  // Derive location column name + values grouped by country (parsed from "City, Country" format)
  const { locationColName, locationGroups } = useMemo(() => {
    for (const rec of records) {
      const idx = rec.headers.findIndex((h) => ADDRESS_RE.test(String(h).trim()))
      if (idx >= 0) {
        const colName = rec.headers[idx]
        const allValues = Array.from(
          new Set(
            records
              .map((r) => {
                const ci = r.headers.findIndex((h) => ADDRESS_RE.test(String(h).trim()))
                return ci >= 0 ? String(r.row[ci] ?? '').trim() : ''
              })
              .filter(Boolean)
          )
        ).sort()

        const grouped: Record<string, string[]> = {}
        for (const val of allValues) {
          const parts = val.split(',').map((p) => p.trim()).filter(Boolean)
          const country = parts.length >= 2 ? parts[0] : ''
          const key = country || '__ungrouped__'
          if (!grouped[key]) grouped[key] = []
          grouped[key].push(val)
        }

        const groups = Object.entries(grouped)
          .sort(([a], [b]) => {
            if (a === '__ungrouped__') return 1
            if (b === '__ungrouped__') return -1
            return a.localeCompare(b)
          })
          .map(([country, values]) => ({
            country: country === '__ungrouped__' ? '' : country,
            values,
          }))

        return { locationColName: colName, locationGroups: groups }
      }
    }
    return {
      locationColName: null as string | null,
      locationGroups: [] as { country: string; values: string[] }[],
    }
  }, [records])

  // Filter/search over per-row records AND by selected table + location
  const filtered = useMemo(() => {
    let result = records

    if (activeTableIdx !== null && tables.length > 0) {
      const selectedTable = tables[activeTableIdx]
      result = result.filter(
        (rec) => JSON.stringify(rec.headers) === JSON.stringify(selectedTable.headers)
      )
    }

    if (locationFilter) {
      result = result.filter((rec) => {
        const ci = rec.headers.findIndex((h) => ADDRESS_RE.test(String(h).trim()))
        return ci >= 0 && String(rec.row[ci] ?? '').trim() === locationFilter
      })
    }

    const q = search.toLowerCase()
    return result.filter(({ row }) =>
      q === '' || row.some((cell) => String(cell ?? '').toLowerCase().includes(q))
    )
  }, [records, search, activeTableIdx, tables, locationFilter])

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Category header with back link */}
      <div
        className="sticky top-14 z-10"
        style={{
          background: 'var(--nav-bg)',
          backdropFilter: 'var(--nav-blur)',
          WebkitBackdropFilter: 'var(--nav-blur)',
          borderBottom: 'var(--nav-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-11">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1 text-xs font-bold t-upper"
                style={{ color: 'var(--muted)', transition: 'color var(--transition-speed) ease' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                All
              </Link>
              <span style={{ color: 'var(--border)' }}>{'/'}</span>
              <span className="text-xs font-bold t-upper" style={{ color: 'var(--foreground)' }}>
                {tab}
              </span>
            </div>
            {!loading && filtered.length > 0 && (
              <span
                className="text-xs tabular-nums"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
              >
                {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search bar and table filter */}
        <div className="mb-6 flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3">
          {/* Search bar - full width on mobile */}
          <div className="relative w-full sm:flex-1 sm:max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: 'var(--muted)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <input
              type="search"
              placeholder={`Search ${tab}…`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm focus:outline-none"
              style={{
                background: 'var(--card)',
                border: 'var(--border-thick)',
                color: 'var(--foreground)',
                fontFamily: 'var(--font-mono)',
                borderRadius: 'var(--input-radius)',
                backdropFilter: 'var(--card-blur)',
                WebkitBackdropFilter: 'var(--card-blur)',
              }}
            />
          </div>

          {/* Location + Table filter dropdowns — side-by-side row on both mobile and desktop */}
          {!isContentView && (
          <div className="flex gap-3">
            {/* Location filter — shown only when an address-like column exists */}
            {locationGroups.length > 0 && (
          <div className="relative flex-1 min-w-0">
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2.5 pr-8 text-sm font-bold focus:outline-none appearance-none"
              style={{
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: 'var(--border-thick)',
                borderRadius: 'var(--input-radius)',
                backdropFilter: 'var(--card-blur)',
                WebkitBackdropFilter: 'var(--card-blur)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <option value="" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
                All {locationColName ?? 'Locations'}
              </option>
              {locationGroups.map(({ country, values }) =>
                country ? (
                  <optgroup key={country} label={country}>
                    {values.map((val) => {
                      const area = val.split(',').slice(1).join(',').trim()
                      return (
                        <option key={val} value={val} style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
                          {area || val}
                        </option>
                      )
                    })}
                  </optgroup>
                ) : (
                  values.map((val) => (
                    <option key={val} value={val} style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
                      {val}
                    </option>
                  ))
                )
              )}
            </select>
            <svg
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'var(--foreground)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
          )}

          {/* Table filter dropdown */}
          <div className="relative flex-1 min-w-0">
            <select
              value={tables.length === 0 ? 'all' : activeTableIdx === null ? 'all' : String(activeTableIdx)}
              onChange={(e) =>
                setActiveTableIdx(e.target.value === 'all' ? null : parseInt(e.target.value))
              }
              disabled={loading || tables.length === 0}
              className="w-full px-3 py-2.5 pr-8 text-sm font-bold focus:outline-none appearance-none"
              style={{
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: 'var(--border-thick)',
                borderRadius: 'var(--input-radius)',
                backdropFilter: 'var(--card-blur)',
                WebkitBackdropFilter: 'var(--card-blur)',
                cursor: loading || tables.length === 0 ? 'not-allowed' : 'pointer',
                opacity: loading || tables.length === 0 ? 0.7 : 1,
              }}
            >
              {loading && <option value="all" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>Loading tables...</option>}
              {!loading && tables.length === 0 && <option value="all" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>No tables found</option>}
              {!loading && tables.length > 0 && <option value="all" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>All Records</option>}
              {!loading && tables.map((table, idx) => (
                <option key={idx} value={String(idx)} style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
                  {generateTableName(table.headers)}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: 'var(--foreground)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
              </svg>
            </div>
          </div>
          )} {/* end !isContentView filters */}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse"
                style={{
                  background: 'var(--card)',
                  border: 'var(--border-thick)',
                  borderRadius: 'var(--card-radius)',
                  height: '170px',
                }}
              >
                <div className="p-5 flex items-center gap-3">
                  <div
                    className="w-10 h-10"
                    style={{
                      background: 'var(--card-hover)',
                      borderRadius: 'var(--card-radius)',
                    }}
                  />
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-3 w-3/4"
                      style={{ background: 'var(--card-hover)', borderRadius: '4px' }}
                    />
                    <div
                      className="h-2.5 w-1/2"
                      style={{ background: 'var(--card-hover)', borderRadius: '4px' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Document view for single-column compliance/content tabs */}
        {!loading && isContentView && filtered.length > 0 && (
          <ContentView records={filtered} />
        )}

        {/* Cards grid */}
        {!loading && !isContentView && filtered.length > 0 && (
          <CardsGrid records={filtered} />
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <svg
              className="w-12 h-12"
              style={{ color: 'var(--muted)' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
              />
            </svg>
            <p
              className="text-sm font-bold t-upper"
              style={{ color: 'var(--muted)' }}
            >
              {search
                ? `No results for "${search}"`
                : locationFilter
                ? `No results in "${locationFilter}"`
                : `No data in "${tab}"`}
            </p>
            {(search || locationFilter) && (
              <button
                onClick={() => {
                  setSearch('')
                  setLocationFilter('')
                }}
                className="text-xs font-bold t-upper px-4 py-2"
                style={{
                  color: 'var(--accent-foreground)',
                  background: 'var(--accent)',
                  border: 'var(--border-thick)',
                  borderRadius: 'var(--pill-radius)',
                  transition: 'all var(--transition-speed) ease',
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </main>

    </div>
  )
}
