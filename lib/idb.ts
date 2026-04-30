const DB_NAME = 'pwa-sheets-cache'
const STORE_NAME = 'sheets'
const DB_VERSION = 1

export interface IDBEntry {
  tab: string
  data: (string | null)[][]
  hyperlinks: (string | null)[][]
  formatting: (Record<string, unknown> | null)[][]
  cachedAt: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'tab' })
      }
    }
    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result)
    request.onerror = () => reject(request.error)
  })
}

export async function getIDBEntry(tab: string): Promise<IDBEntry | null> {
  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(tab)
      req.onsuccess = () => resolve((req.result as IDBEntry) ?? null)
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

export async function setIDBEntry(
  tab: string,
  data: (string | null)[][],
  hyperlinks: (string | null)[][],
  formatting: (Record<string, unknown> | null)[][] = []
): Promise<void> {
  try {
    const db = await openDB()
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      tx.objectStore(STORE_NAME).put({ tab, data, hyperlinks, formatting, cachedAt: Date.now() })
      tx.oncomplete = () => resolve()
      tx.onerror = () => resolve()
    })
  } catch {
    // Silently ignore — private browsing, quota errors, IDB unavailable
  }
}
