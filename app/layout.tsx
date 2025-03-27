import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeProvider } from '@/components/theme-provider'
import { ModeToggle } from '@/components/mode-toggle'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vexa - Meeting Intelligence API',
  description: 'Smart meeting automation and analytics for your applications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              // Make all sidebars sticky
              const sidebars = document.querySelectorAll('aside');
              sidebars.forEach(sidebar => {
                if (!sidebar.className.includes('sticky')) {
                  sidebar.classList.add('sticky', 'top-16', 'h-[calc(100vh-4rem)]', 'overflow-y-auto');
                }
              });
            });
          `
        }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link href="/" className="flex items-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8">
                      <rect width="32" height="32" rx="16" fill="hsl(var(--primary))" />
                      <path d="M10 8L16 24L22 8" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M8 16H24" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span className="font-bold text-xl">Vexa</span>
                  </Link>
                </div>
                <nav className="hidden md:flex items-center gap-6">
                  <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                    Home
                  </Link>
                  <Link href="/docs" className="text-sm font-medium transition-colors hover:text-primary">
                    Documentation
                  </Link>
                  <Link href="/pricing" className="text-sm font-medium transition-colors hover:text-primary">
                    Pricing
                  </Link>
                  <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                    Dashboard
                  </Link>
                </nav>
                <div className="flex items-center gap-2">
                  <ModeToggle />
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="sm">Sign up</Button>
                  </Link>
                </div>
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
            <footer className="w-full border-t py-6">
              <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  © {new Date().getFullYear()} Vexa. All rights reserved.
                </p>
                <div className="flex gap-4">
                  <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
                    Terms
                  </Link>
                  <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
                    Privacy
                  </Link>
                  <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
                    Contact
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
