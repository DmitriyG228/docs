import Link from "next/link"
import { ArrowRight, Code, FileText, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ApiReferencePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">API Reference</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Complete reference documentation for the Vexa API.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link 
          href="/docs/api/authentication" 
          className="group rounded-lg border p-4 hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lock className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Authentication</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Learn how to authenticate your API requests.
          </p>
          <span className="text-sm text-primary group-hover:underline inline-flex items-center gap-1">
            View docs
            <ArrowRight className="h-3 w-3" />
          </span>
        </Link>

        <Link 
          href="/docs/api/bots" 
          className="group rounded-lg border p-4 hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <Code className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Bots</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Manage automated meeting attendance bots.
          </p>
          <span className="text-sm text-primary group-hover:underline inline-flex items-center gap-1">
            View docs
            <ArrowRight className="h-3 w-3" />
          </span>
        </Link>

        <Link 
          href="/docs/api/meeting-audio" 
          className="group rounded-lg border p-4 hover:border-primary transition-colors"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Meeting Audio</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Handle audio recordings and transcriptions.
          </p>
          <span className="text-sm text-primary group-hover:underline inline-flex items-center gap-1">
            View docs
            <ArrowRight className="h-3 w-3" />
          </span>
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Base URL</h2>
        <p className="text-muted-foreground">
          All API endpoints are relative to:
        </p>
        <pre className="rounded-md bg-muted p-4 overflow-x-auto">
          <code className="text-sm font-mono">https://api.vexa.ai/v1</code>
        </pre>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Response Format</h2>
        <p className="text-muted-foreground">
          All responses are returned in JSON format. Successful responses include the requested data 
          in the <code className="text-sm font-mono">data</code> field. Error responses include an 
          <code className="text-sm font-mono">error</code> object with details about what went wrong.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold mb-2">Success Response</h3>
            <pre className="rounded-md bg-muted p-4 overflow-x-auto">
              <code className="text-sm font-mono">{`{
  "data": {
    "id": "bot_123",
    "name": "Meeting Bot",
    "status": "active"
  }
}`}</code>
            </pre>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Error Response</h3>
            <pre className="rounded-md bg-muted p-4 overflow-x-auto">
              <code className="text-sm font-mono">{`{
  "error": {
    "code": "unauthorized",
    "message": "Invalid API key"
  }
}`}</code>
            </pre>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Rate Limiting</h2>
        <p className="text-muted-foreground">
          The API implements rate limiting to ensure fair usage. Rate limits vary by plan tier.
          Current rate limit status is returned in the headers of each response:
        </p>
        <pre className="rounded-md bg-muted p-4 overflow-x-auto">
          <code className="text-sm font-mono">{`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 98
X-RateLimit-Reset: 1625169710`}</code>
        </pre>
      </div>

      <div className="flex justify-center mt-10">
        <Button asChild>
          <Link href="/dashboard">Get Your API Key</Link>
        </Button>
      </div>
    </div>
  )
} 