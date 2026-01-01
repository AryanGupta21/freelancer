// src/app/layout.tsx - Root Layout
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '../components/SessionProvider'
import Navbar from '../components/ui/NavBar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FreelancePlatform - Connect Talent with Opportunity',
  description: 'Find skilled freelancers or offer your expertise to clients worldwide. Start your journey in the freelance economy today.',
  keywords: 'freelance, freelancers, hire talent, remote work, projects, skills',
  authors: [{ name: 'FreelancePlatform Team' }],
  openGraph: {
    title: 'FreelancePlatform - Connect Talent with Opportunity',
    description: 'Find skilled freelancers or offer your expertise to clients worldwide.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-black" suppressHydrationWarning>
        <SessionProvider>
        <Navbar />
        <div id="root">
          {children}
        </div>
        </SessionProvider>
      </body>
    </html>
  )
}
