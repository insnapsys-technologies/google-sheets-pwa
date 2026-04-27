import Link from 'next/link'

export function toSlug(tab: string) {
  return tab.toLowerCase().replace(/\s+/g, '-')
}

const CARD_COLORS = [
  '#FF2D7B',
  '#0055FF',
  '#FF6B00',
  '#00CC88',
  '#9B59B6',
  '#E74C3C',
  '#27AE60',
  '#F39C12',
]

interface Props {
  tabs: string[]
}

export default function CategoryGrid({ tabs }: Props) {
  return (
    <main className="min-h-screen" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1
            className="text-3xl font-black t-title mb-2"
            style={{ color: 'var(--foreground)' }}
          >
            Directory
          </h1>
          <p
            className="text-sm"
            style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}
          >
            {tabs.length} {tabs.length === 1 ? 'category' : 'categories'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {tabs.map((tab, i) => {
            const color = CARD_COLORS[i % CARD_COLORS.length]
            return (
              <Link key={tab} href={`/${toSlug(tab)}`} className="group block">
                <div
                  className="p-5 flex flex-col gap-3"
                  style={{
                    minHeight: '150px',
                    background: 'var(--card)',
                    border: 'var(--border-thick)',
                    borderRadius: 'var(--card-radius)',
                    backdropFilter: 'var(--card-blur)',
                    WebkitBackdropFilter: 'var(--card-blur)',
                    boxShadow: 'var(--card-shadow)',
                    transition: 'transform var(--transition-speed) ease, box-shadow var(--transition-speed) ease',
                  }}
                >
                  {/* Colored initial icon */}
                  <div
                    className="w-10 h-10 flex items-center justify-center font-black text-lg flex-shrink-0"
                    style={{
                      background: color,
                      color: '#fff',
                      borderRadius: 'var(--card-radius)',
                    }}
                  >
                    {tab[0]?.toUpperCase() ?? '?'}
                  </div>

                  <div>
                    <p
                      className="font-bold text-sm leading-snug t-title"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {tab}
                    </p>
                    <p
                      className="text-[10px] t-upper font-bold mt-1"
                      style={{ color: 'var(--neon-blue)' }}
                    >
                      View →
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
