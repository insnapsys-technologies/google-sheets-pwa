export type Row = string[]

export interface DirectoryClientProps {
  tab: string
}

export type Table = {
  headers: string[]
  rows: Row[]
  rowHyperlinks: (string | null)[][]
}

export type RecordItem = {
  headers: string[]
  row: Row
  hyperlinks: (string | null)[]
}
