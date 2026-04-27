import { getSheetTabs } from '@/lib/sheets'
import CategoryGrid from './components/CategoryGrid'

export const revalidate = 30

export default async function Page() {
  let tabs: string[] = []

  try {
    tabs = await getSheetTabs()
  } catch (e) {
    console.error('Failed to load sheet tabs:', e)
  }

  return <CategoryGrid tabs={tabs} />
}
