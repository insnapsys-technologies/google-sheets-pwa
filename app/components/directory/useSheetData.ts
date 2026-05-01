'use client'

import { useState, useEffect, useRef } from 'react'
import { getIDBEntry, setIDBEntry } from '@/lib/idb'
import { driveProxyUrl } from '@/lib/drive-utils'
import type { Row, Table, RecordItem } from './types'

/**
 * Client-side safety net: converts any raw Google Drive URLs that slipped through
 * (e.g. stale IDB cache written before server-side conversion was deployed).
 */
function sanitiseDriveUrls(
  data: (string | null)[][],
  hyperlinks: (string | null)[][]
): { data: (string | null)[][]; hyperlinks: (string | null)[][] } {
  const convertCell = (cell: string | null) => {
    if (!cell) return cell
    const proxy = driveProxyUrl(cell)
    return proxy ?? cell
  }
  return {
    data: data.map((row) => row.map(convertCell)),
    hyperlinks: hyperlinks.map((row) => row.map(convertCell)),
  }
}

const CACHE_TTL_MS = (Number(process.env.NEXT_PUBLIC_CACHE_TTL_SECONDS) || 60) * 1000

export function useSheetData(tab: string, isContentView: boolean) {
  const [tables, setTables] = useState<Table[]>([])
  const [records, setRecords] = useState<RecordItem[]>([])
  const [loading, setLoading] = useState(false)
  const cachedAtRef = useRef<number>(0)

  const applyData = (data: any[][], rawHyperlinks: (string | null)[][], rawFormatting: (any | null)[][]) => {
    if (!data || data.length === 0) return

    // Content view: every row is a content row — section headings must NOT be
    // consumed as table headers, so skip parseTables entirely.
    if (isContentView) {
      const contentRecords: RecordItem[] = (data as any[][]).map(
        (row: any[], idx: number) => ({
          headers: [],
          row: (row as any[]).map((cell: any) => String(cell ?? '')),
          hyperlinks: (rawHyperlinks ?? [])[idx] ?? [],
          formatting: (rawFormatting ?? [])[idx] ?? [],
        })
      )
      setRecords(contentRecords)
      setTables([])
      return
    }

    const rowIsEmpty = (row: any[]) =>
      !row.some((cell) => cell != null && String(cell).trim() !== '')

    const parseTables = (
      allRows: any[][],
      allHyperlinks: (string | null)[][],
      allFormatting: (any | null)[][]
    ): Table[] => {
      // The header is ALWAYS the first non-empty row of the sheet.
      // All subsequent non-empty rows are data rows — empty rows between
      // data rows are ignored and do NOT start a new header block.
      let i = 0
      while (i < allRows.length && rowIsEmpty(allRows[i])) i++
      if (i >= allRows.length) return []

      const headersRow = allRows[i].map((h) => String(h ?? ''))
      i++

      const filteredRows: Row[] = []
      const filteredHyperlinks: (string | null)[][] = []
      const filteredFormatting: (any | null)[][] = []

      for (; i < allRows.length; i++) {
        if (rowIsEmpty(allRows[i])) continue
        filteredRows.push(allRows[i])
        filteredHyperlinks.push(allHyperlinks[i] ?? [])
        filteredFormatting.push(allFormatting[i] ?? [])
      }

      if (filteredRows.length === 0) return []
      return [{ headers: headersRow, rows: filteredRows, rowHyperlinks: filteredHyperlinks, rowFormatting: filteredFormatting }]
    }

    const parsed = parseTables(data, rawHyperlinks ?? [], rawFormatting ?? [])
    setTables(parsed)

    const allRecords: RecordItem[] = parsed.flatMap((t) =>
      t.rows.map((r, idx) => ({
        headers: t.headers,
        row: r,
        hyperlinks: t.rowHyperlinks[idx] ?? [],
        formatting: t.rowFormatting[idx] ?? [],
      }))
    )
    setRecords(allRecords)
  }

  useEffect(() => {
    if (!tab) return
    let cancelled = false
    setRecords([])
    setTables([])
    cachedAtRef.current = 0

    ;(async () => {
      let hadCache = false

      // Step 1: Read IDB and render immediately (stale-while-revalidate)
      const cached = await getIDBEntry(tab)
      if (cancelled) return

      if (cached) {
        hadCache = true
        const safe = sanitiseDriveUrls(cached.data, cached.hyperlinks ?? [])
        applyData(safe.data, safe.hyperlinks, cached.formatting ?? [])
        cachedAtRef.current = cached.cachedAt
      } else {
        setLoading(true)
      }

      // Step 2: Always background-fetch — goes through SW which serves from cache
      // and simultaneously triggers its own background network update
      try {
        const r = await fetch(`/api/sheets/${encodeURIComponent(tab)}`)
        if (cancelled) return
        const { data, hyperlinks: rawHyperlinks, formatting: rawFormatting } = await r.json()
        if (data && data.length > 0) {
          await setIDBEntry(tab, data, rawHyperlinks ?? [], rawFormatting ?? [])
          if (!cancelled) {
            const now = Date.now()
            // Only re-render if no prior cache existed, or the TTL has expired.
            // CACHE_UPDATED from SW handles the truly-fresh re-render case.
            const shouldUpdate = !hadCache || now - cachedAtRef.current > CACHE_TTL_MS
            cachedAtRef.current = now
            if (shouldUpdate) {
              const safe = sanitiseDriveUrls(data, rawHyperlinks ?? [])
              applyData(safe.data, safe.hyperlinks, rawFormatting ?? [])
            }
          }
        }
      } catch {
        // Network failed — IDB data already displayed, nothing more to do
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, isContentView])

  // SW CACHE_UPDATED listener: reads fresh data directly from Cache Storage.
  // Reading from caches.open() bypasses the SW fetch event, so there is no
  // risk of triggering another background network fetch and looping.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const handler = (event: MessageEvent) => {
      if (event.data?.type !== 'CACHE_UPDATED') return

      let msgPathname: string
      try {
        msgPathname = new URL(event.data.url as string).pathname
      } catch {
        return
      }
      if (msgPathname !== `/api/sheets/${encodeURIComponent(tab)}`) return

      ;(async () => {
        try {
          const cache = await caches.open(process.env.API_CACHE_NAME as string)
          const response = await cache.match(event.data.url as string)
          // console.log(`[SW] CACHE_UPDATED for ${tab}:`, { msgPathname, eventData: event.data, response }, cache)
          if (!response) return
          const { data, hyperlinks: rawHyperlinks, formatting: rawFormatting } = await response.json()
          if (!data || data.length === 0) return
          await setIDBEntry(tab, data, rawHyperlinks ?? [], rawFormatting ?? [])
          cachedAtRef.current = Date.now()
          const safe = sanitiseDriveUrls(data, rawHyperlinks ?? [])
          applyData(safe.data, safe.hyperlinks, rawFormatting ?? [])
        } catch {
          // Cache Storage unavailable or malformed — silently ignore
        }
      })()
    }

    navigator.serviceWorker.addEventListener('message', handler)
    return () => navigator.serviceWorker.removeEventListener('message', handler)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, isContentView])

  // Register service worker once
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' })
    }
  }, [])

  return { records, tables, loading }
}

export function generateTableName(headers: string[]): string {
  if (headers.length === 0) return 'Table'
  const firstColumn = headers.find((h) => h && String(h).trim().length > 0)
  return firstColumn ? String(firstColumn).trim() : 'Table'
}
