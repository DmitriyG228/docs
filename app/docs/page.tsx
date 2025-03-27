import Link from "next/link"
import { ArrowRight, Book, Code, FileAudio, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DocsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">API Documentation</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Complete reference documentation for the Vexa API.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Book className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Authentication</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Learn how to authenticate your API requests using API keys.
          </p>
          <Link href="/docs/api/authentication">
            <Button variant="outline" size="sm" className="gap-1">
              View Authentication
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <Code className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Bots</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Manage automated meeting attendance bots for various platforms.
          </p>
          <Link href="/docs/api/bots">
            <Button variant="outline" size="sm" className="gap-1">
              View Bots API
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>

        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileAudio className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Meeting Audio</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Manage audio recordings and transcriptions from meetings.
          </p>
          <Link href="/docs/api/meeting-audio">
            <Button variant="outline" size="sm" className="gap-1">
              View Audio API
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-lg border p-6 bg-muted/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Community Support</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Join our vibrant community on Discord to get help, share your projects, and connect with other Vexa developers.
          Our team is active on Discord to provide support and answer your questions.
        </p>
        <Link href="https://discord.com/invite/Ga9duGkVz9" target="_blank" rel="noopener noreferrer">
          <Button className="gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="h-4 w-4"
            >
              <circle cx="9" cy="12" r="1"/>
              <circle cx="15" cy="12" r="1"/>
              <path d="M7.5 7.2c3.5-1 5.5-1 9 0"/>
              <path d="M7 16.2c3.5 1 6.5 1 10 0"/>
              <path d="M15.5 17c0 1 1.5 3 2 3 1.5 0 2.833-1.667 3.5-3 .667-1.667.5-5.833-1.5-11.5-1.457-1.015-3-1.34-4.5-1.5l-1 2.5"/>
              <path d="M8.5 17c0 1-1.356 3-1.832 3-1.429 0-2.698-1.667-3.333-3-.635-1.667-.48-5.833 1.428-11.5C6.151 4.485 7.545 4.16 9 4l1 2.5"/>
            </svg>
            Join our Discord Community
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Getting Started</h2>
        <div className="space-y-2">
          <p className="text-muted-foreground">To get started with the Vexa API:</p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Sign up for a Vexa account at <Link href="https://vexa.ai" className="text-primary hover:underline">vexa.ai</Link></li>
            <li>Generate an API key from your dashboard</li>
            <li>Use the API key to authenticate your requests</li>
            <li>Start making API calls to the desired endpoints</li>
          </ol>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Base URL</h2>
        <p className="text-muted-foreground">
          All API endpoints are relative to:
        </p>
        <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
          https://api.vexa.ai/v1
        </code>
      </div>
    </div>
  )
}

