'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

type Platform = 'android' | 'ios' | 'windows' | 'other'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function getPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent

  // iOS detection — must be Safari (not CriOS / FxiOS)
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
  if (isIOS) {
    const isSafari = !/CriOS|FxiOS/.test(ua)
    return isSafari ? 'ios' : 'other'
  }

  if (/Win/.test(ua)) return 'windows'
  if (/Android/.test(ua)) return 'android'
  return 'other'
}

function getFlag(): boolean {
  try {
    return localStorage.getItem('pwa-prompt-dismissed') === 'true'
  } catch {
    return true // fail closed — don't show modal
  }
}

function setFlag() {
  try {
    localStorage.setItem('pwa-prompt-dismissed', 'true')
    localStorage.setItem('pwa-installed', 'true')
  } catch { /* ignore */ }
}

function clearFlags() {
  try {
    localStorage.removeItem('pwa-prompt-dismissed')
    localStorage.removeItem('pwa-installed')
  } catch { /* ignore */ }
}

export default function InstallPromptModal() {
  const [showModal, setShowModal] = useState(false)
  const [platform, setPlatform] = useState<Platform>('other')
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  const close = useCallback((permanent: boolean) => {
    setShowModal(false)
    if (permanent) setFlag()
  }, [])

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches

    // Already standalone — bail
    if (isStandalone) return

    // Detect uninstall: was installed before but no longer running standalone
    try {
      if (localStorage.getItem('pwa-installed') === 'true') {
        clearFlags()
      }
    } catch { /* ignore */ }

    // Already dismissed
    if (getFlag()) return

    const detected = getPlatform()
    setPlatform(detected)

    if (detected === 'ios') {
      setShowModal(true)
      return
    }

    if (detected === 'android' || detected === 'windows') {
      // Check if the event was already captured globally before React mounted
      const earlyPrompt = (window as any).__pwaPrompt as BeforeInstallPromptEvent | null
      if (earlyPrompt) {
        deferredPrompt.current = earlyPrompt
        ;(window as any).__pwaPrompt = null
        setShowModal(true)
      }

      const onBeforeInstall = (e: Event) => {
        e.preventDefault()
        deferredPrompt.current = e as BeforeInstallPromptEvent
        ;(window as any).__pwaPrompt = null
        setShowModal(true)
      }

      const onAppInstalled = () => {
        close(true)
      }

      window.addEventListener('beforeinstallprompt', onBeforeInstall)
      window.addEventListener('appinstalled', onAppInstalled)
      return () => {
        window.removeEventListener('beforeinstallprompt', onBeforeInstall)
        window.removeEventListener('appinstalled', onAppInstalled)
      }
    }
    // 'other' — do nothing
  }, [close])

  const handleInstall = async () => {
    const prompt = deferredPrompt.current
    if (!prompt) return
    await prompt.prompt()
    const choice = await prompt.userChoice
    if (choice.outcome === 'accepted') {
      close(true)
    } else {
      close(false)
    }
    deferredPrompt.current = null
  }

  if (!showModal) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      onClick={() => close(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 rounded-[var(--card-radius)] border-[var(--border)] bg-[var(--card)] p-6 shadow-lg animate-in slide-in-from-bottom duration-300"
        style={{ border: 'var(--border-thick)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-black tracking-tight mb-2">Install Our App</h2>

        {platform === 'ios' && (
          <>
            <p className="text-[var(--muted)] text-sm mb-4">
              Install this app on your iPhone for a better experience:
            </p>
            <ol className="text-sm space-y-3 mb-6 list-decimal list-inside">
              <li>
                Tap the <strong>Share</strong> button{' '}
                <span className="inline-block" aria-label="share icon">
                  <svg className="inline w-5 h-5 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </span>{' '}
                in Safari&apos;s toolbar
              </li>
              <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></li>
              <li>Tap <strong>&quot;Add&quot;</strong> in the top right corner</li>
            </ol>
            <button
              onClick={() => close(true)}
              className="w-full py-2.5 font-bold text-[var(--accent-foreground)] bg-[var(--accent)] rounded-[var(--pill-radius)] transition-opacity hover:opacity-90 cursor-pointer"
            >
              Done
            </button>
          </>
        )}

        {(platform === 'android' || platform === 'windows') && (
          <>
            <p className="text-[var(--muted)] text-sm mb-6">
              {platform === 'android'
                ? 'Tap Install to add this app to your home screen for quick access.'
                : 'Click Install to add this app to your desktop and Start menu.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => close(false)}
                className="flex-1 py-2.5 font-bold border rounded-[var(--pill-radius)] transition-opacity hover:opacity-80 cursor-pointer"
                style={{ borderColor: 'var(--border)' }}
              >
                Not Now
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 py-2.5 font-bold text-[var(--accent-foreground)] bg-[var(--accent)] rounded-[var(--pill-radius)] transition-opacity hover:opacity-90 cursor-pointer"
              >
                Install
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
