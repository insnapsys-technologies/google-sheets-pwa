import { fetchBlogPosts } from '@/lib/sheets'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 30;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  let posts: Awaited<ReturnType<typeof fetchBlogPosts>> = []
  try {
    posts = await fetchBlogPosts()
  } catch (e) {
    console.error('Failed to load blog posts:', e)
  }

  const post = posts.find((p) => p.slug === slug)
  if (!post) return notFound()

  const currentIdx = posts.indexOf(post)
  const prev = currentIdx < posts.length - 1 ? posts[currentIdx + 1] : null
  const next = currentIdx > 0 ? posts[currentIdx - 1] : null

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1 text-xs font-bold t-upper mb-8 underline"
          style={{ color: 'var(--neon-blue)', transition: 'color var(--transition-speed) ease' }}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          All posts
        </Link>

        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            width={720}
            height={400}
            className="w-full object-cover mb-8"
            style={{
              maxHeight: '360px',
              background: 'var(--card)',
              border: 'var(--border-thick)',
              borderRadius: 'var(--card-radius)',
            }}
          />
        )}

        <h1
          className="text-2xl sm:text-3xl font-black t-title leading-tight mb-3"
          style={{ color: 'var(--foreground)' }}
        >
          {post.title}
        </h1>

        <div className="flex items-center gap-3 mb-10">
          {post.date && (
            <time
              className="text-xs"
              style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
            >
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-0.5 font-bold t-upper"
                  style={{
                    background: 'var(--card)',
                    color: 'var(--muted)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--pill-radius)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div
          className="text-sm leading-relaxed whitespace-pre-wrap"
          style={{
            color: 'var(--foreground)',
            fontFamily: 'var(--font-mono)',
            lineHeight: '1.8',
          }}
        >
          {post.content}
        </div>

        {/* Prev / Next navigation */}
        {(prev || next) && (
          <div
            className="mt-12 pt-6 flex justify-between gap-4"
            style={{ borderTop: 'var(--nav-border)' }}
          >
            {prev ? (
              <Link
                href={`/blog/${encodeURIComponent(prev.slug)}`}
                className="text-xs font-bold t-upper underline"
                style={{ color: 'var(--neon-blue)', transition: 'color var(--transition-speed) ease' }}
              >
                ← {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                href={`/blog/${encodeURIComponent(next.slug)}`}
                className="text-xs font-bold t-upper text-right underline"
                style={{ color: 'var(--neon-blue)', transition: 'color var(--transition-speed) ease' }}
              >
                {next.title} →
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}
      </article>
    </div>
  )
}
