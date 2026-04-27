import { getSheetTabs } from '@/lib/sheets'
import CategoryGrid from './components/CategoryGrid'

export const revalidate = 30

const BLOG_TAB = process.env.BLOG_TAB_NAME || 'Blog'

export default async function Page() {
  let tabs: string[] = []

  try {
    tabs = await getSheetTabs()
  } catch (e) {
    console.error('Failed to load sheet tabs:', e)
  }

  const directoryTabs = tabs.filter((t) => t !== BLOG_TAB)

  return <CategoryGrid tabs={directoryTabs} />
}
