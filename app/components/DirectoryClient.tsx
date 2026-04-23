'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import BottomSheet from './BottomSheet'

type Row = string[]

interface Props {
  initialTabs: string[]
}

interface SelectedCard {
  name: string | null
  logo: string | null
  url: string | null
  fields: { label: string; value: string }[]
}

export default function DirectoryClient({ initialTabs }: Props) {
  const [activeTab, setActiveTab] = useState(initialTabs[0] ?? '')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<SelectedCard | null>(null)

  useEffect(() => {
    if (!activeTab) return
    setLoading(true)
    setRows([])
    setHeaders([])
    fetch(`/api/sheets/${encodeURIComponent(activeTab)}`)
      .then((r) => r.json())
      .then(({ data }) => {
        if (data && data.length > 0) {
          setHeaders(data[0])
          setRows(data.slice(1))
        }
      })
      .finally(() => setLoading(false))
  }, [activeTab])

  useEffect(() => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
  }
}, [])

  // Detect special column indices by header name
  const nameIdx = headers.findIndex((h) => /^name$/i.test(h.trim()))
  const logoIdx = headers.findIndex((h) => /logo|image|icon/i.test(h))
  const urlIdx = headers.findIndex((h) => /url|link|website/i.test(h))
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return rows.filter((row) => {
      return q === '' || row.some((cell) => cell?.toLowerCase().includes(q))
    })
  }, [rows, search])

  const handleTabClick = useCallback((tab: string) => {
    setActiveTab(tab)
    setSearch('')
  }, [])

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Tab bar — underlined style */}
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
          <div className="flex items-center justify-between">
            <div className="flex gap-0 overflow-x-auto scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6">
              {initialTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className="px-4 py-3 text-xs font-bold t-upper whitespace-nowrap"
                  style={{
                    color:
                      activeTab === tab
                        ? 'var(--foreground)'
                        : 'var(--muted)',
                    borderBottom:
                      activeTab === tab
                        ? '2px solid var(--neon-blue)'
                        : '2px solid transparent',
                    transition: 'color var(--transition-speed) ease, border-color var(--transition-speed) ease',
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            {!loading && filtered.length > 0 && (
              <span
                className="text-xs tabular-nums ml-3 flex-shrink-0"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
              >
                {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
              </span>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
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
              placeholder={`Search ${activeTab}…`}
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

        {/* Cards grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((row, i) => {
              const name = nameIdx >= 0 ? row[nameIdx] : row[0]
              const logo = logoIdx >= 0 ? row[logoIdx] : null
              const url = urlIdx >= 0 ? row[urlIdx] : null

              const otherFields = headers
                .map((h, idx) => ({ label: h, value: row[idx] }))
                .filter(
                  (_, idx) =>
                    idx !== nameIdx && idx !== logoIdx && idx !== urlIdx
                )
                .filter((f) => f.value)

              return (
                <div
                  key={i}
                  className="h-full"
                  onClick={() =>
                    setSelected({ name, logo, url, fields: otherFields })
                  }
                >
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
                      {otherFields.slice(0, 3).map((f) => (
                        <p
                          key={f.label}
                          className="text-xs line-clamp-1"
                          style={{
                            color: 'var(--muted)',
                            fontFamily: 'var(--font-mono)',
                          }}
                        >
                          <span
                            className="font-bold t-upper"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {f.label}:{' '}
                          </span>
                          {f.value}
                        </p>
                      ))}
                    </div>

                    {url && (
                      <button  onClick={(e)=>{e.preventDefault(); e.stopPropagation(); window.open(url, '_blank') }} className="flex items-center gap-1.5 pt-1">
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
                : `No data in "${activeTab}"`}
            </p>
            {search && (
              <button
                onClick={() => {
                  setSearch('')
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

      <BottomSheet
        open={selected !== null}
        onClose={() => setSelected(null)}
        name={selected?.name ?? null}
        logo={selected?.logo ?? null}
        url={selected?.url ?? null}
        fields={selected?.fields ?? []}
      />
    </div>
  )
}
