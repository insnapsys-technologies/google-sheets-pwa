import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Directory',
    short_name: 'Directory',
    description: 'Company directory and blog powered by Google Sheets',
    start_url: '/',
    id: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'window-controls-overlay'],
    background_color: '#fafafa',
    theme_color: '#18181b',
    icons: [
      {
        src: '/android/launchericon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/android/launchericon-72x72.png',
        sizes: '72x72',
        type: 'image/png',
      },
      {
        src: '/android/launchericon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        src: '/android/launchericon-144x144.png',
        sizes: '144x144',
        type: 'image/png',
      },
      {
        src: '/android/launchericon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android/launchericon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/android/launchericon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/ios/180.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/ios/1024.png',
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
  }
}
