import BlogUpdatesView from '@/app/components/BlogUpdatesView'

export const revalidate = process.env.NEXT_PUBLIC_CACHE_REVALIDATE_TIME || 30;

const BLOG_TAB = process.env.BLOG_TAB_NAME || 'Blog'

export default async function BlogPage() {
  return <BlogUpdatesView tab={BLOG_TAB} />
}
