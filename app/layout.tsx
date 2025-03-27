import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeProvider } from '@/components/theme-provider'
import { ModeToggle } from '@/components/mode-toggle'
import { Github, Linkedin } from 'lucide-react'
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
                  © {new Date().getFullYear()} Vexa.ai Inc. All rights reserved.
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-4">
                    <Link href="https://github.com/Vexa-ai/vexa" className="text-muted-foreground hover:text-foreground">
                      <Github className="h-5 w-5" />
                      <span className="sr-only">GitHub</span>
                    </Link>
                    <Link href="https://discord.com/invite/Ga9duGkVz9" className="text-muted-foreground hover:text-foreground">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="h-5 w-5"
                      >
                        <circle cx="9" cy="12" r="1"/>
                        <circle cx="15" cy="12" r="1"/>
                        <path d="M7.5 7.2c3.5-1 5.5-1 9 0"/>
                        <path d="M7 16.2c3.5 1 6.5 1 10 0"/>
                        <path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.833-1.667 3.5-3 .667-1.667.5-5.833-1.5-11.5-1.457-1.015-3-1.34-4.5-1.5l-1 2.5"/>
                        <path d="M8.5 17c0 1-1.356 3-1.832 3-1.429 0-2.698-1.667-3.333-3-.635-1.667-.48-5.833 1.428-11.5C6.151 4.485 7.545 4.16 9 4l1 2.5"/>
                      </svg>
                      <span className="sr-only">Discord</span>
                    </Link>
                    <Link href="https://www.linkedin.com/in/dmitry-grankin/" className="text-muted-foreground hover:text-foreground">
                      <Linkedin className="h-5 w-5" />
                      <span className="sr-only">LinkedIn</span>
                    </Link>
                    <Link href="https://x.com/grankin_d" className="text-muted-foreground hover:text-foreground">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 1200 1227" 
                        fill="none" 
                        stroke="currentColor" 
                        className="h-5 w-5"
                      >
                        <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="currentColor"/>
                      </svg>
                      <span className="sr-only">X (Twitter)</span>
                    </Link>
                  </div>
                  <div className="hidden md:flex gap-4">
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
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
