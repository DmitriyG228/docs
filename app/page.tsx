'use client';

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Bot, FileAudio, Zap, Server, Globe, RefreshCw, CheckCircle2, Clock, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { trackEvent } from '@/lib/analytics'
import PageViewTracker from '@/components/analytics/PageViewTracker';
import { useEffect } from "react";

export default function LandingPage() {
  const handleSignupClick = () => {
    // Track signup button click
    trackEvent('signup_button_click', { location: 'home_cta' });
  };

  const handleDiscordClick = () => {
    // Track discord join click
    trackEvent('discord_join_click', { location: 'home_cta' });
  };

  // Track page view manually on component mount instead of using PageViewTracker component
  useEffect(() => {
    if (typeof window !== 'undefined') {
      trackEvent('page_view', { page: 'home' });
    }
  }, []);

  return (
    <div className="flex flex-col gap-10 py-8">
      {/* Hero Section */}
      <section className="relative">
        <div className="container space-y-6 py-10 md:py-16">
          <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium">
              <span className="text-primary">Enterprise ready</span>

            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              API for <span className="text-primary">Real-Time Meeting Transcription</span>
            </h1>
            
            <div className="flex items-center justify-center space-x-8 mt-2">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" aria-hidden="true" />
                <span>Meeting bots</span>
              </div>
              <div className="flex items-center gap-2">
                <FileAudio className="h-5 w-5" aria-hidden="true" />
                <span>Web/mobile streaming</span>
              </div>

            </div>

      {/* Platform Logos - simplified */}
      <section className="container py-2">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex flex-col items-center">
              <Image 
                src="/google-meet-logo.png" 
                alt="Google Meet Logo" 
                width={45} 
                height={45}
                className="object-contain"
              />

            </div>
            
            <div className="flex flex-col items-center">
              <Image 
                src="/zoom-logo.png" 
                alt="Zoom Logo" 
                width={45} 
                height={45}
                className="object-contain"
              />

            </div>
            
            <div className="flex flex-col items-center">
              <Image 
                src="/microsoft-teams-logo.png" 
                alt="Microsoft Teams Logo" 
                width={45} 
                height={45}
                className="object-contain"
              />

            </div>
          </div>
        </div>
      </section>
            

            
            <div className="flex flex-wrap gap-4 justify-center mt-4">
              <Link href="/get-started">
                <Button size="lg" className="gap-2">
                  Get Started in 5 Minutes
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            

          </div>
        </div>
      </section>

      {/* n8n Integration Banner */}
      <section className="container py-3">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <Image 
                  src="/n8n-logo.svg" 
                  alt="n8n Logo" 
                  width={50} 
                  height={50}
                  className="object-contain"
                />
              </div>
              <div className="flex-grow">
                <h3 className="text-lg font-semibold mb-1">New: Easy n8n Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Get Google Meet transcripts in n8n with our simple 2-node setup. No complex configuration required.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Link href="/blog/google-meet-transcription-n8n-workflow" className="inline-flex items-center gap-1 text-primary hover:underline">
                  <span>Learn more</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* API Example */}
      <section className="container py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border bg-card shadow-lg overflow-hidden">
            <div className="bg-muted p-4 border-b">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight">Simple API Integration</h2>
                <p className="text-lg text-muted-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Set up and running in under 5 minutes</span>
                </p>
              </div>
            </div>
            
            <div className="p-4">
              <div className="rounded-lg bg-background p-4 border">
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="font-mono text-muted-foreground">POST /v1/bots</div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">request</span>
                  </div>
                </div>
                <pre className="text-sm font-mono language-bash overflow-auto"><code>{`curl -X POST https://gateway.dev.vexa.ai \
  -d '{
    "platform": "google_meet",
    "native_meeting_id": "abc-defg-hij",
    "bot_name": "MyMeetingBot"
  }'`}</code></pre>
              </div>
              
              <div className="rounded-lg bg-background p-4 border mt-3">
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="font-mono text-muted-foreground">GET /v1/transcripts/{'{meeting_id}'}</div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-xs font-medium">response</span>
                  </div>
                </div>
                <pre className="text-sm font-mono language-json overflow-auto"><code>{`{
  "data": {
    "meeting_id": "meet_abc123",
    "transcripts": [
      {
        "time": "00:01:15",
        "speaker": "John Smith",
        "text": "Let's discuss the quarterly results."
      },
      {
        "time": "00:01:23",
        "speaker": "Sarah Johnson",
        "text": "The Q3 revenue exceeded our projections by 15%."
      },
      {
        "time": "00:01:42",
        "speaker": "Michael Chen",
        "text": "Customer acquisition costs decreased by 12% from last quarter."
      }
    ]
  }
}`}</code></pre>
              </div>
            </div>
            
            <div className="p-4 border-t bg-muted flex justify-center">
              <Link href="/get-started">
                <Button size="lg" className="gap-2">
                  Starting Guide
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-4 transition-all group-hover:bg-primary/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 text-primary">
                  <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-1">Open Source</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Fully open source and community-driven development. Customize, extend, and contribute to the project.
              </p>
              <Link 
                href="https://github.com/Vexa-ai/vexa" 
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Star us on GitHub
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            
            <div className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-4 transition-all group-hover:bg-primary/20">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-1">Invisible Latency</h3>
              <p className="text-sm text-muted-foreground">
                Real-time transcription with imperceptible delay, keeping your conversations flowing naturally without interruption.
              </p>
            </div>
            
            <div className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-4 transition-all group-hover:bg-primary/20">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-1">99 Languages Supported</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive language coverage with high-quality transcription for meetings in virtually any language.
              </p>
            </div>
            
            <div className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-4 transition-all group-hover:bg-primary/20">
                <Video className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-1">Real-Time Translation</h3>
              <p className="text-sm text-muted-foreground">
                Seamless translation between any language pair in real-time, breaking down communication barriers instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-10">
        <div className="mx-auto max-w-5xl rounded-2xl border shadow-lg overflow-hidden">
          <div className="bg-primary p-6 md:p-8 text-primary-foreground">
            <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
              <div className="space-y-3 max-w-lg">
                <h2 className="text-2xl font-bold">Ready to get started?</h2>
                <p className="text-primary-foreground/80">
                  From signup to your first API call in just 5 minutes. Start transcribing meetings today.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/api/auth/signin">
                  <Button size="lg" variant="secondary" className="w-full md:w-auto flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      <path fill="none" d="M1 1h22v22H1z" />
                    </svg>
                    Log in with Google
                  </Button>
                </Link>
                <Link 
                  href="https://discord.gg/Ga9duGkVz9" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={handleDiscordClick}
                >
                  <Button size="lg" variant="outline" className="w-full md:w-auto border-primary-foreground/20 bg-primary-foreground/10 hover:bg-primary-foreground/20">
                    Join Discord
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

