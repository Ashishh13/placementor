import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { ThemeProvider } from 'next-themes'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PlaceMentor — AI Placement Coach',
  description: 'AI-powered placement preparation platform. Analyze your resume, track GitHub & LeetCode, and get company-specific prep plans.',
  keywords: ['placement preparation', 'AI resume analyzer', 'LeetCode tracker', 'campus placement', 'interview preparation'],
  openGraph: {
    title: 'PlaceMentor — AI Placement Coach',
    description: 'AI-powered placement preparation for students',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
