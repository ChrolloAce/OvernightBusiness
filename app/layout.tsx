import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Sidebar } from '@/components/sidebar'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Overnight Biz - Premium Business Management',
  description: 'Elite business management platform for Google Business Profiles, content creation, and analytics.',
  keywords: 'business management, google business profile, content creation, analytics, reviews',
  authors: [{ name: 'Overnight Biz' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          defaultTheme="system"
          storageKey="overnight-biz-theme"
        >
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 relative">
            {/* Premium Background Effects */}
            <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-30" />
            <div className="fixed inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
            
            {/* Floating Orbs */}
            <div className="fixed top-20 left-20 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float pointer-events-none" />
            <div className="fixed top-40 right-20 w-72 h-72 bg-gradient-to-r from-yellow-400 to-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float animation-delay-2000 pointer-events-none" />
            <div className="fixed -bottom-8 left-40 w-72 h-72 bg-gradient-to-r from-blue-400 to-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-float animation-delay-4000 pointer-events-none" />
            
            <div className="flex min-h-screen">
              {/* Premium Sidebar */}
              <div className="fixed inset-y-0 left-0 z-50 w-72">
                <div className="h-full glass-card border-r border-white/20 dark:border-white/10">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-white/5 dark:from-black/20 dark:to-black/10" />
                  <div className="relative h-full">
                    <Sidebar />
                  </div>
                </div>
              </div>
              
              {/* Main Content Area */}
              <div className="flex-1 ml-72">
                <main className="min-h-screen">
                  {children}
                </main>
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
} 