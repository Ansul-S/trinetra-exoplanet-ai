import type { Metadata } from 'next'
import { Space_Grotesk, Space_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Navbar } from '@/components/layout/Navbar'
import { StarfieldCanvas } from '@/components/layout/StarfieldCanvas'

const spaceGrotesk = Space_Grotesk({
  subsets : ['latin'],
  variable: '--font-display',
  weight  : ['300', '400', '500', '600'],
})

const spaceMono = Space_Mono({
  subsets : ['latin'],
  variable: '--font-mono',
  weight  : ['400', '700'],
})

export const metadata: Metadata = {
  title      : 'TRINETRA — AI Exoplanet Discovery',
  description: '6 Earth-Like Planets Found in NASA Kepler Data using Deep Learning + Astrophysical Modeling',
  keywords   : ['exoplanet', 'NASA', 'Kepler', 'AI', 'habitability', 'machine learning'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
      <body className="bg-space-950 text-white antialiased min-h-screen">
        <StarfieldCanvas />
        <div className="relative z-10">
          <Providers>
            <Navbar />
            <main className="min-h-[calc(100vh-64px)]">
              {children}
            </main>
          </Providers>
        </div>
      </body>
    </html>
  )
}
