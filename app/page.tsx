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
              <Link href="/docs">
                <Button size="lg" className="gap-2">
                  Get Started in 5 Minutes
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/docs/api">
                <Button size="lg" variant="outline">
                  View API Docs
                </Button>
              </Link>
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
                <pre className="text-sm font-mono language-bash overflow-auto"><code>{`curl -X POST https://api.vexa.ai/v1/bots \\
  -d '{
    "meeting_url": "https://meet.google.com/abc-defg-hij",
    "platform": "google_meet"
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
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Get API Key
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="space-y-3 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Enterprise-Grade Features
            </h2>
            <p className="mx-auto max-w-[42rem] text-lg text-muted-foreground">
              Built for secure corporate environments where data security and compliance are non-negotiable
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-4 transition-all group-hover:bg-primary/20">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-1">Meeting Bots</h3>
              <p className="text-sm text-muted-foreground">
                Automated bots that join your meetings on Google Meet, Zoom, Microsoft Teams, and more.
              </p>
            </div>
            
            <div className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-4 transition-all group-hover:bg-primary/20">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-1">Multilingual Support</h3>
              <p className="text-sm text-muted-foreground">
                Real-time transcription in 99 languages with Whisper and real-time translation between languages.
              </p>
            </div>
            
            <div className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 mb-4 transition-all group-hover:bg-primary/20">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-1">Knowledge Extraction</h3>
              <p className="text-sm text-muted-foreground">
                Meeting knowledge extraction with RAG (Retrieval Augmented Generation) for finished meetings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scalability */}
      <section className="container py-10">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="space-y-3 text-center">
            <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium mx-auto">
              <span className="text-primary">High Performance</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Designed for Scale</h2>
            <p className="mx-auto max-w-[42rem] text-lg text-muted-foreground">
              High-performance, scalable multiuser service supporting thousands of simultaneous users
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Server className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Microservice Architecture</h3>
              </div>
              <p className="text-sm text-muted-foreground">Distributed processing of transcription workloads with horizontal scaling.</p>
            </div>
            
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Low Latency</h3>
              </div>
              <p className="text-sm text-muted-foreground">5-10 second processing time even at scale, with queue-based audio processing.</p>
            </div>
            
            <div className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <FileAudio className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Multi-tenant Design</h3>
              </div>
              <p className="text-sm text-muted-foreground">Secure data isolation between organizations for enterprise compliance.</p>
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
                <Link href="/signup" onClick={handleSignupClick}>
                  <Button size="lg" variant="secondary" className="w-full md:w-auto">
                    Sign Up Free
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

