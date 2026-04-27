import BlogUpdatesView from '@/app/components/BlogUpdatesView'

export const revalidate = 30;

const BLOG_TAB = process.env.BLOG_TAB_NAME || 'Blog'

export default async function BlogPage() {
  return <BlogUpdatesView tab={BLOG_TAB} />
}
