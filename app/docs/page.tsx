import Link from "next/link"
import { ArrowRight, Book, Code, FileAudio } from "lucide-react"
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

