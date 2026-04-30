import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Nav from "./components/Nav";
import ThemeProvider from "./components/ThemeProvider";
import InstallPromptModal from "./components/InstallPromptModal";
import SplashScreen from "./components/SplashScreen";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "True line",
  description: "True line",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'True line',
    startupImage: [
      // iPhone SE 1st gen
      { url: '/splash/640/1136', media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      // iPhone 6/7/8
      { url: '/splash/750/1334', media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      // iPhone 6/7/8 Plus
      { url: '/splash/1242/2208', media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      // iPhone X / XS / 11 Pro
      { url: '/splash/1125/2436', media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      // iPhone XR / 11
      { url: '/splash/828/1792', media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      // iPhone XS Max / 11 Pro Max
      { url: '/splash/1242/2688', media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      // iPhone 12 mini
      { url: '/splash/1080/2340', media: '(device-width: 360px) and (device-height: 780px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      // iPhone 12 / 13 / 14
      { url: '/splash/1170/2532', media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      // iPhone 12 Pro Max / 13 Pro Max / 14 Plus
      { url: '/splash/1284/2778', media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      // iPhone 14 Pro
      { url: '/splash/1179/2556', media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      // iPhone 14 Pro Max / 15 Pro Max
      { url: '/splash/1290/2796', media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)' },
      // iPad mini / iPad Air 9.7"
      { url: '/splash/1536/2048', media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      // iPad Pro 10.5"
      { url: '/splash/1668/2224', media: '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      // iPad Pro 11"
      { url: '/splash/1668/2388', media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
      // iPad Pro 12.9"
      { url: '/splash/2048/2732', media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

const isProd = process.env.NODE_ENV === "production";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`} data-theme="glass" suppressHydrationWarning>
      <head>
        <Script id="app-bootstrap" strategy="beforeInteractive">
          {`try{var t=localStorage.getItem('theme');if(t==='glass')document.documentElement.setAttribute('data-theme',t)}catch(e){}
if('serviceWorker' in navigator){try{if(${isProd}){navigator.serviceWorker.register('/sw.js').then(function(){},function(){}).catch(function(){})}else{navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister()})}).catch(function(){});if('caches' in window){caches.keys().then(function(keys){keys.forEach(function(k){caches.delete(k)})}).catch(function(){})}}}catch(e){}}
window.__pwaPrompt=null;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__pwaPrompt=e})`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col relative z-[1]">
        <SplashScreen />
        <ThemeProvider>
          <Nav />
          {children}
          <InstallPromptModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
