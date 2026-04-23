import { fetchBlogPosts } from '@/lib/sheets'
import Link from 'next/link'

export const revalidate = 30;

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof fetchBlogPosts>> = []
  try {
    posts = await fetchBlogPosts()
  } catch (e) {
    console.error('Failed to load blog posts:', e)
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1
          className="text-3xl font-black t-title mb-10"
          style={{ color: 'var(--foreground)' }}
        >
          Blog
        </h1>

        {posts.length === 0 && (
          <p
            className="text-sm font-bold t-upper"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
          >
            No posts yet.
          </p>
        )}

        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${encodeURIComponent(post.slug)}`}
              className="block p-5 blog-card"
              style={{
                background: 'var(--card)',
                border: 'var(--border-thick)',
                borderRadius: 'var(--card-radius)',
                backdropFilter: 'var(--card-blur)',
                WebkitBackdropFilter: 'var(--card-blur)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <div className="flex gap-4">
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    width={120}
                    height={80}
                    loading="lazy"
                    decoding="async"
                    className="w-28 h-20 object-cover flex-shrink-0 hidden sm:block"
                    style={{
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: 'calc(var(--card-radius) / 2)',
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h2
                    className="font-bold text-base leading-snug mb-1 line-clamp-2 t-title"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {post.title}
                  </h2>
                  {post.date && (
                    <time
                      className="text-xs block mb-2"
                      style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  )}
                  {post.content && (
                    <p
                      className="text-sm line-clamp-2"
                      style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      {post.content.slice(0, 200)}
                    </p>
                  )}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 font-bold t-upper"
                          style={{
                            background: 'var(--background)',
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
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
