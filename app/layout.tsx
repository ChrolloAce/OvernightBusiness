import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ProfileProvider } from '@/contexts/profile-context'
import { ClientProvider } from '@/contexts/client-context'
import { TaskProvider } from '@/contexts/task-context'
import { ConditionalLayout } from '@/components/conditional-layout'
import { ClientInitializer } from '@/components/client-initializer'
import { ClientDataInitializer } from '@/components/client-data-initializer'
import { AutoLogin } from '@/components/auto-login'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Overnight Business Dashboard',
  description: 'Manage your Google Business Profile with advanced analytics and automation',
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3B82F6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light">
      <body className={`${inter.className} bg-gray-50`}>
        <ProfileProvider>
          <ClientProvider>
            <TaskProvider>
              <AutoLogin>
                <div className="min-h-screen bg-gray-50">
                  <ConditionalLayout>
                    {children}
                  </ConditionalLayout>
                </div>
              </AutoLogin>
              
              <ClientInitializer />
              <ClientDataInitializer />
            </TaskProvider>
          </ClientProvider>
        </ProfileProvider>
      </body>
    </html>
  )
} 