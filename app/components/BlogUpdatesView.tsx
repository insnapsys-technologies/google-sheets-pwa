'use client'

import { useState, useEffect } from 'react'
import NewsletterForm from './NewsletterForm'

interface BlogPost {
  title: string
  slug: string
  date: string
  content: string
  image: string
  tags: string[]
}

interface Props {
  tab: string
}

function makeSlug(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function parsePostsFromRaw(data: string[][]): BlogPost[] {
  if (!data || data.length < 2) return []
  const headers = data[0].map((h) => String(h ?? '').trim().toLowerCase())
  const titleIdx   = headers.findIndex((h) => /title/i.test(h))
  const slugIdx    = headers.findIndex((h) => /^slug$/i.test(h))
  const dateIdx    = headers.findIndex((h) => /date|published/i.test(h))
  const contentIdx = headers.findIndex((h) => /content|body|description/i.test(h))
  const imageIdx   = headers.findIndex((h) => /image|photo|featured|thumbnail/i.test(h))
  const tagsIdx    = headers.findIndex((h) => /tags?|categor/i.test(h))
  if (titleIdx === -1) return []
  return data
    .slice(1)
    .filter((row) => row[titleIdx]?.trim())
    .map((row) => ({
      title:   row[titleIdx] || '',
      slug:    (slugIdx >= 0 && row[slugIdx]) ? row[slugIdx] : makeSlug(row[titleIdx] || ''),
      date:    (dateIdx >= 0 && row[dateIdx]) ? row[dateIdx] : '',
      content: (contentIdx >= 0 && row[contentIdx]) ? row[contentIdx] : '',
      image:   (imageIdx >= 0 && row[imageIdx]) ? row[imageIdx] : '',
      tags:    (tagsIdx >= 0 && row[tagsIdx])
        ? row[tagsIdx].split(',').map((t: string) => t.trim()).filter(Boolean)
        : [],
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function PostCard({ post }: { post: BlogPost }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="blog-card"
      style={{
        background: 'var(--card)',
        border: 'var(--border-thick)',
        borderRadius: 'var(--card-radius)',
        backdropFilter: 'var(--card-blur)',
        WebkitBackdropFilter: 'var(--card-blur)',
        boxShadow: 'var(--card-shadow)',
        overflow: 'hidden',
        transition: 'box-shadow var(--transition-speed) ease',
      }}
    >
      {/* Summary row — always visible, click to expand */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left"
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <div className="flex gap-4 p-5">
          {post.image && !expanded && (
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
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-2 py-0.5 font-bold t-upper"
                    style={{
                      background: 'var(--accent)',
                      color: '#fff',
                      borderRadius: 'var(--pill-radius)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h2
              className={`font-bold text-base leading-snug mb-1 t-title${expanded ? '' : ' line-clamp-2'}`}
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

            {!expanded && post.content && (
              <p
                className="text-sm line-clamp-2"
                style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
              >
                {post.content.slice(0, 200)}
              </p>
            )}

            <p
              className="text-[10px] t-upper font-bold mt-3"
              style={{ color: 'var(--neon-blue)' }}
            >
              {expanded ? '\u2190 Show less' : 'Read more \u2192'}
            </p>
          </div>
        </div>
      </button>

      {/* Expanded full content */}
      {expanded && (
        <div style={{ borderTop: 'var(--border-thick)' }}>
          {post.image && (
            <img
              src={post.image}
              alt={post.title}
              loading="lazy"
              decoding="async"
              className="w-full"
              style={{ maxHeight: '360px', objectFit: 'cover', display: 'block' }}
            />
          )}
          <div className="p-5 pt-4">
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--foreground)', fontFamily: 'var(--font-mono)' }}
            >
              {post.content}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

const BLOG_CACHE_PREFIX = 'blog_cache_'
const CACHE_TTL_MS = (Number(process.env.NEXT_PUBLIC_CACHE_TTL_SECONDS) || 60) * 1000

export default function BlogUpdatesView({ tab }: Props) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    // Show cached posts immediately if still within TTL
    let cacheValid = false
    try {
      const raw = localStorage.getItem(BLOG_CACHE_PREFIX + tab)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Date.now() - (parsed.cachedAt ?? 0) <= CACHE_TTL_MS) {
          setPosts(parsePostsFromRaw(parsed.data))
          cacheValid = true
        }
      }
    } catch {
      // ignore
    }

    // Skip network fetch if cache is still fresh
    if (cacheValid) {
      setLoading(false)
      return
    }

    fetch(`/api/sheets/${encodeURIComponent(tab)}`)
      .then((r) => r.json())
      .then(({ data }) => {
        if (data && data.length > 0) {
          try { localStorage.setItem(BLOG_CACHE_PREFIX + tab, JSON.stringify({ data, cachedAt: Date.now() })) } catch { /* quota exceeded */ }
        }
        setPosts(parsePostsFromRaw(data))
      })
      .catch(() => {
        // Network failed — cached data already shown above
      })
      .finally(() => setLoading(false))
  }, [tab])

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">

        <div className="mb-8">
          <h1 className="text-3xl font-black t-title mb-1" style={{ color: 'var(--foreground)' }}>
            {tab}
          </h1>
          {!loading && (
            <p className="text-sm" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </p>
          )}
        </div>

        <NewsletterForm />

        {loading && (
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse p-5"
                style={{
                  background: 'var(--card)',
                  border: 'var(--border-thick)',
                  borderRadius: 'var(--card-radius)',
                  height: '120px',
                }}
              />
            ))}
          </div>
        )}

        {!loading && posts.length > 0 && (
          <div className="my-8 flex items-center gap-4">
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
            <span className="text-[10px] font-bold t-upper" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              Latest Posts
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          </div>
        )}

        {!loading && posts.length === 0 && (
          <p className="text-sm font-bold t-upper mt-8" style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            No posts yet.
          </p>
        )}

        <div className="space-y-5">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

      </div>
    </div>
  )
}
