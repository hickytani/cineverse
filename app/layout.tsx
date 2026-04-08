import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans, Cinzel, DM_Mono } from 'next/font/google'
import { AmbientProvider } from '@/contexts/AmbientContext'
import { CursorSpotlight } from '@/components/ui/CursorSpotlight'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-display',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
})

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-accent',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'CineVerse — Every frame tells a story',
  description: 'Discover movies, anime, K-drama, web series and more. Rate, review, discuss.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${cormorant.variable} ${dmSans.variable} ${cinzel.variable} ${dmMono.variable}`}>
      <body className="bg-void text-text-1 font-sans antialiased selection:bg-gold/30">
        <AmbientProvider>
          {children}
          <CursorSpotlight />
        </AmbientProvider>
      </body>
    </html>
  )
}
