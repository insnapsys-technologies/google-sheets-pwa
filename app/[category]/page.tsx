import { getSheetTabs } from '@/lib/sheets'
import DirectoryClient from '../components/DirectoryClient'
import BlogUpdatesView from '../components/BlogUpdatesView'
import { notFound } from 'next/navigation'

export const revalidate = process.env.NEXT_PUBLIC_CACHE_REVALIDATE_TIME || 30;

function toSlug(tab: string) {
 return tab
    .toLowerCase()
    .replace(/\//g, '')        // remove all slashes
    .replace(/\s+/g, '-')     // convert spaces to hyphens
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

  // Detect blog/newsletter tab by env var OR by name keywords
  // Handles: "Blog", "Blog Updates", "News Letter Blog Updates", "Newsletter" etc.
  const isBlogTab =
    tab === (process.env.BLOG_TAB_NAME || 'Blog') ||
    /news.{0,3}letter|blog.{0,5}update/i.test(tab)

  if (isBlogTab) {
    return <BlogUpdatesView tab={tab} />
  }

  return <DirectoryClient tab={tab} />
}
