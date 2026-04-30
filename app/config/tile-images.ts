/**
 * Optional background image for each category tile.
 * Key = exact tab name from Google Sheets (case-sensitive).
 * Value = absolute URL or root-relative path to an image.
 *
 * Leave a key absent (or set to empty string '') to use the solid-color fallback.
 *
 * Example:
 *   'Machines': 'https://images.unsplash.com/photo-xxx?w=1200&q=80',
 *   'Ink': '/images/ink-tile.jpg',
 */
export const TILE_IMAGES: Record<string, string> = {
  // 'Tab Name': 'https://...',
}

/**
 * Solid-color fallbacks used when no image is configured for a tile.
 * Industrial monochrome scale — 8 shades cycling from near-black to near-white.
 */
export const TILE_FALLBACK_COLORS: string[] = [
  '#0a0a0a',
  '#141414',
  '#1c1c1c',
  '#242424',
  '#2c2c2c',
  '#363636',
  '#404040',
  '#111111',
]
