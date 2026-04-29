export type Row = string[]

export interface DirectoryClientProps {
  tab: string
}

export type Table = {
  headers: string[]
  rows: Row[]
  rowHyperlinks: (string | null)[][]
  rowFormatting: (import('@/lib/sheets').CellFormatting | null)[][]
}

export type RecordItem = {
  headers: string[]
  row: Row
  hyperlinks: (string | null)[]
  formatting: (import('@/lib/sheets').CellFormatting | null)[]
}
