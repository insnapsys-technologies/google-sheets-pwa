import { getSheetTabs } from '@/lib/sheets'
import DirectoryClient from '../components/DirectoryClient'
import { notFound } from 'next/navigation'

export const revalidate = 30

function toSlug(tab: string) {
  return tab.toLowerCase().replace(/\s+/g, '-')
}

export async function generateStaticParams() {
  try {
    const tabs = await getSheetTabs()
    return tabs.map((tab) => ({ category: toSlug(tab) }))
  } catch {
    return []
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params

  let tabs: string[] = []
  try {
    tabs = await getSheetTabs()
  } catch (e) {
    console.error('Failed to load sheet tabs:', e)
  }

  const tab = tabs.find((t) => toSlug(t) === category)
  if (!tab) return notFound()

  return <DirectoryClient tab={tab} />
}
