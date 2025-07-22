import type { Metadata } from 'next'
import { Roboto, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from '@/components/ui/sonner'

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-roboto',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
})

export const metadata: Metadata = {
  title: 'LabelX - AI Data Processing with Human Review',
  description: 'AI-powered content moderation with human precision',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Calendly widget assets */}
        <link
          href="https://assets.calendly.com/assets/external/widget.css"
          rel="stylesheet"
        />
        <script
          src="https://assets.calendly.com/assets/external/widget.js"
          type="text/javascript"
          async
        ></script>
      </head>
      <body
        className={`${roboto.className} ${roboto.variable} ${spaceGrotesk.variable}`}
      >
        <Providers>
          <main className="min-h-screen bg-gradient-to-b from-[#191c21] via-[#1e1e1e] to-[#111418] text-gray-200">
            {children}
          </main>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
