import { getSheetTabs, fetchHeaderLogos, HeaderLogoEntry } from '@/lib/sheets'
import CategoryGrid from './components/CategoryGrid'

export const revalidate: number = parseInt(process.env.NEXT_PUBLIC_CACHE_REVALIDATE_TIME || '30', 10);

export default async function Page() {
  let tabs: string[] = []
  let logoMap: Record<string, HeaderLogoEntry> = {}

  try {
    ;[tabs, logoMap] = await Promise.all([getSheetTabs(), fetchHeaderLogos()])
    // console.log('[page.tsx] tabs:', tabs)
    // console.log('[page.tsx] logoMap keys:', Object.keys(logoMap))
  } catch (e) {
    console.error('Failed to load sheet data:', e)
  }

  return <CategoryGrid tabs={tabs} logoMap={logoMap} />
}
