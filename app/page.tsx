import Link from "next/link"
import { ArrowRight, Bot, FileAudio, Key, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-16 py-12">
      {/* Hero Section */}
      <section className="container space-y-6 py-12 md:py-24 lg:py-32">
        <div className="mx-auto flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Meeting Intelligence API
          </h1>
          <p className="max-w-[42rem] text-xl text-muted-foreground">
            Add smart meeting automation and analytics to your applications with our powerful API.
          </p>
          <div className="flex gap-4">
            <Link href="/docs">
              <Button size="lg" className="gap-2">
                Get Started
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
      </section>

      {/* Features */}
      <section className="container py-12">
        <div className="mx-auto max-w-5xl space-y-12">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Powerful Meeting Features
            </h2>
            <p className="mx-auto max-w-[42rem] text-lg text-muted-foreground">
              Integrate advanced meeting capabilities into your applications
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Meeting Bots</h3>
              <p className="text-muted-foreground">
                Create automated meeting attendees that join, record, and analyze meetings across platforms.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <FileAudio className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Audio Processing</h3>
              <p className="text-muted-foreground">
                Record, download, and analyze meeting audio with advanced transcription and analytics.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Real-time Analytics</h3>
              <p className="text-muted-foreground">
                Get actionable insights from meeting content, participants, and engagement metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* API */}
      <section className="container py-12 bg-muted/50 rounded-lg">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight">Simple API Integration</h2>
            <p className="text-lg text-muted-foreground">
              Easy-to-use REST API with comprehensive documentation
            </p>
          </div>
          
          <div className="rounded-lg bg-background p-6 shadow">
            <pre className="text-sm language-javascript"><code>{`// Create a meeting bot
const response = await fetch('https://api.vexa.ai/v1/bots', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    meeting_url: 'https://meet.google.com/abc-defg-hij',
    name: 'Recording Bot',
    capabilities: ['record', 'transcribe']
  })
});

const bot = await response.json();
console.log('Bot created:', bot.id);`}</code></pre>
          </div>
          
          <div className="flex justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="gap-2">
                <Key className="h-4 w-4" />
                Get API Key
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container">
        <div className="mx-auto max-w-5xl rounded-lg bg-primary p-8 text-primary-foreground">
          <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Ready to get started?</h2>
              <p>
                Create an account and start using our API in minutes.
              </p>
            </div>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="w-full md:w-auto">
                Sign Up Free
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

