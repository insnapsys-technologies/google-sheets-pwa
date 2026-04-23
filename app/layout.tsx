import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav";
import ThemeProvider from "./components/ThemeProvider";
import InstallPromptModal from "./components/InstallPromptModal";

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
  title: "Directory",
  description: "Company directory powered by Google Sheets",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`} data-theme="brutalist" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `try{var t=localStorage.getItem('theme');if(t==='glass'||t==='brutalist')document.documentElement.setAttribute('data-theme',t)}catch(e){}
if('serviceWorker' in navigator){try{navigator.serviceWorker.register('/sw.js').then(function(){},function(){}).catch(function(){})}catch(e){}}
window.__pwaPrompt=null;window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__pwaPrompt=e})`
        }} />
      </head>
      <body className="min-h-full flex flex-col relative z-[1]">
        <ThemeProvider>
          <Nav />
          {children}
          <InstallPromptModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
