/**
 * Shared Drive URL utilities — safe to use on both client and server.
 * No Node.js or googleapis imports.
 */

/**
 * Extracts the Google Drive file ID from common share/view/embed URL formats.
 * Returns null if the URL is not a recognised Drive link.
 */
export function extractDriveFileId(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null
  // https://drive.google.com/file/d/FILE_ID/view[?...]
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/)
  if (fileMatch) return fileMatch[1]
  // https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/drive\.google\.com\/open[?&]id=([A-Za-z0-9_-]+)/)
  if (openMatch) return openMatch[1]
  // https://drive.google.com/uc?id=FILE_ID
  const ucMatch = url.match(/drive\.google\.com\/uc[?&](?:.*&)?id=([A-Za-z0-9_-]+)/)
  if (ucMatch) return ucMatch[1]
  return null
}

/**
 * If the URL is a Google Drive share/view link, converts it to /api/image?id=FILE_ID.
 * Returns null if not a Drive link (so callers can use `driveProxyUrl(url) ?? url`).
 */
export function driveProxyUrl(url: string | null | undefined): string | null {
  const id = extractDriveFileId(url)
  return id ? `/api/image?id=${id}` : null
}
