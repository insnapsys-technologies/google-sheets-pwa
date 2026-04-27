'use client'

import { useState, useRef } from 'react'
import { subscribeToNewsletter } from '@/app/actions'

export default function NewsletterForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const formData = new FormData(e.currentTarget)
    const result = await subscribeToNewsletter(formData)

    if (result.success) {
      setStatus('success')
      setMessage('You\'re subscribed! Thanks for signing up.')
      formRef.current?.reset()
    } else {
      setStatus('error')
      setMessage(result.error ?? 'Something went wrong.')
    }
  }

  return (
    <div
      className="p-6 mb-12"
      style={{
        background: 'var(--card)',
        border: 'var(--border-thick)',
        borderRadius: 'var(--card-radius)',
        backdropFilter: 'var(--card-blur)',
        WebkitBackdropFilter: 'var(--card-blur)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <h2
        className="text-xl font-black t-title mb-1"
        style={{ color: 'var(--foreground)' }}
      >
        Newsletter
      </h2>
      <p
        className="text-sm mb-5"
        style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
      >
        Stay in the loop. Get updates delivered to your inbox.
      </p>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="name"
          placeholder="Your name (optional)"
          className="w-full px-4 py-2.5 text-sm"
          style={{
            background: 'var(--background)',
            color: 'var(--foreground)',
            border: 'var(--border-thick)',
            borderRadius: 'var(--card-radius)',
            fontFamily: 'var(--font-mono)',
            outline: 'none',
          }}
        />
        <div className="flex gap-3">
          <input
            type="email"
            name="email"
            required
            placeholder="your@email.com"
            className="flex-1 px-4 py-2.5 text-sm"
            style={{
              background: 'var(--background)',
              color: 'var(--foreground)',
              border: 'var(--border-thick)',
              borderRadius: 'var(--card-radius)',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="px-5 py-2.5 text-xs font-bold t-upper cursor-pointer"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'var(--border-thick)',
              borderRadius: 'var(--card-radius)',
              opacity: status === 'loading' ? 0.6 : 1,
              transition: 'opacity var(--transition-speed) ease',
              whiteSpace: 'nowrap',
            }}
          >
            {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
          </button>
        </div>

        {message && (
          <p
            className="text-xs font-bold"
            style={{
              color: status === 'success' ? 'var(--neon-blue)' : 'var(--accent)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
