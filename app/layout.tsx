import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ThemeProvider } from '@/components/theme-provider'
import { ModeToggle } from '@/components/mode-toggle'
import { Github, Linkedin } from 'lucide-react'
import { CookieConsent } from '@/components/cookie-consent'
import AuthProvider from "@/components/AuthProvider";
import AuthButtons from "@/components/AuthButtons";
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth/next';
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vexa | Meeting Transcription API with Bot Integration',
  description: 'Multilingual real-time transcription across all major meeting platforms. Integrate meeting bots, streaming audio processing, and knowledge extraction with our API.',
  icons: {
    icon: [
      {
        url: '/logodark.svg',
        href: '/logodark.svg',
      }
    ],
    apple: [
      {
        url: '/logodark.svg',
        href: '/logodark.svg',
      }
    ]
  }
}

// Google Analytics Measurement ID from environment variable
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);

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
        
        {/* Google Analytics - Inline script for better detection */}
        {GA_MEASUREMENT_ID && GA_MEASUREMENT_ID !== 'G-MEASUREMENT_ID' && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} />
            <script dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `
            }} />
          </>
        )}
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex flex-col min-h-screen">
              <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link href="/" className="flex items-center gap-2">
                      <Image
                        src="/logodark.svg"
                        alt="Vexa Logo"
                        width={32}
                        height={32}
                        className="h-8 w-8"
                      />
                      <span className="font-bold text-xl">Vexa</span>
                    </Link>
                  </div>
                  <nav className="hidden md:flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
                      Home
                    </Link>
                    <Link href="/get-started" className="text-sm font-medium transition-colors hover:text-primary">
                      Get Started
                    </Link>
                    <Link 
                      href="https://github.com/Vexa-ai/vexa/blob/feature/traefik/docs/user_api_guide.md" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium transition-colors hover:text-primary"
                    >
                      API Docs
                    </Link>
                    <Link href="/pricing" className="text-sm font-medium transition-colors hover:text-primary">
                      Pricing
                    </Link>
                    <Link href="/blog" className="text-sm font-medium transition-colors hover:text-primary">
                      Blog
                    </Link>
                    {session && (
                      <Link href="/dashboard/api-keys" className="text-sm font-medium transition-colors hover:text-primary">
                        API Keys
                      </Link>
                    )}
                    {session && (
                      <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
                        Dashboard
                      </Link>
                    )}
                  </nav>
                  <div className="flex items-center gap-2">
                    <Link 
                      href="https://github.com/Vexa-ai/vexa" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-center transition-colors"
                    >
                      <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="currentColor" 
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385c.6.105.825-.255.825-.57c0-.285-.015-1.23-.015-2.235c-3.015.555-3.795-.735-4.035-1.41c-.135-.345-.72-1.41-1.23-1.695c-.42-.225-1.02-.78-.015-.795c.945-.015 1.62.87 1.845 1.23c1.08 1.815 2.805 1.305 3.495.99c.105-.78.42-1.305.765-1.605c-2.67-.3-5.46-1.335-5.46-5.925c0-1.305.465-2.385 1.23-3.225c-.12-.3-.54-1.53.12-3.18c0 0 1.005-.315 3.3 1.23c.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23c.66 1.65.24 2.88.12 3.18c.765.84 1.23 1.905 1.23 3.225c0 4.605-2.805 5.625-5.475 5.925c.435.375.81 1.095.81 2.22c0 1.605-.015 2.895-.015 3.3c0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      <span className="sr-only">GitHub</span>
                    </Link>
                    <ModeToggle />
                    <AuthButtons />
                  </div>
                </div>
              </header>
              <main className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
              <footer className="w-full border-t py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 md:flex-row">
                  <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    © {new Date().getFullYear()} Vexa.ai Inc. All rights reserved.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-4">
                      <Link href="https://github.com/Vexa-ai/vexa" className="text-muted-foreground hover:text-foreground">
                        <Github className="h-5 w-5" />
                        <span className="sr-only">GitHub</span>
                      </Link>
                      <Link href="https://discord.gg/Ga9duGkVz9" className="text-muted-foreground hover:text-foreground">
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
              <CookieConsent />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
