'use client'

import { useState, useEffect } from 'react'
import type { Row, Table, RecordItem } from './types'

export function useSheetData(tab: string, isContentView: boolean) {
  const [tables, setTables] = useState<Table[]>([])
  const [records, setRecords] = useState<RecordItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!tab) return
    setLoading(true)
    setRecords([])
    setTables([])

    fetch(`/api/sheets/${encodeURIComponent(tab)}`)
      .then((r) => r.json())
      .then(({ data, hyperlinks: rawHyperlinks }) => {
        if (!data || data.length === 0) return

        // Content view: every row is a content row — section headings must NOT be
        // consumed as table headers, so skip parseTables entirely.
        if (isContentView) {
          const contentRecords: RecordItem[] = (data as any[][]).map(
            (row: any[], idx: number) => ({
              headers: [],
              row: (row as any[]).map((cell: any) => String(cell ?? '')),
              hyperlinks: (rawHyperlinks ?? [])[idx] ?? [],
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
          allHyperlinks: (string | null)[][]
        ): Table[] => {
          const out: Table[] = []
          let i = 0
          while (i < allRows.length) {
            while (i < allRows.length && rowIsEmpty(allRows[i])) i++
            if (i >= allRows.length) break

            const headersRow = allRows[i].map((h) => String(h ?? ''))
            i++

            const rows: Row[] = []
            const rowHyperlinks: (string | null)[][] = []
            while (i < allRows.length && !rowIsEmpty(allRows[i])) {
              rows.push(allRows[i])
              rowHyperlinks.push(allHyperlinks[i] ?? [])
              i++
            }

            const filteredRows: Row[] = []
            const filteredHyperlinks: (string | null)[][] = []
            rows.forEach((row, idx) => {
              if (!rowIsEmpty(row)) {
                filteredRows.push(row)
                filteredHyperlinks.push(rowHyperlinks[idx] ?? [])
              }
            })

            out.push({ headers: headersRow, rows: filteredRows, rowHyperlinks: filteredHyperlinks })
          }
          return out
        }

        const parsed = parseTables(data, rawHyperlinks ?? [])
        setTables(parsed)

        const allRecords: RecordItem[] = parsed.flatMap((t) =>
          t.rows.map((r, idx) => ({
            headers: t.headers,
            row: r,
            hyperlinks: t.rowHyperlinks[idx] ?? [],
          }))
        )
        setRecords(allRecords)
      })
      .finally(() => setLoading(false))
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
