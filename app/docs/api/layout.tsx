import { ReactNode } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface ApiDocsLayoutProps {
  children: ReactNode
}

export default function ApiDocsLayout({ children }: ApiDocsLayoutProps) {
  return (
    <div className="flex flex-1">
      <aside className="hidden lg:flex w-64 flex-col border-r p-6 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search API docs..."
              className="w-full appearance-none bg-background pl-8 shadow-none"
            />
          </div>
        </div>
        <nav className="grid gap-4">
          <div>
            <h4 className="mb-2 text-sm font-semibold">Authentication</h4>
            <div className="grid gap-2">
              <Link href="/docs/api/authentication" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                API Key Authentication
              </Link>
              <Link href="/docs/api/authentication#managing-keys" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                Managing API Keys
              </Link>
              <Link href="/docs/api/authentication#token-types" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                Token Types
              </Link>
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold">Bots</h4>
            <div className="grid gap-2">
              <Link href="/docs/api/bots#send" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                Send Bots
              </Link>
              <Link href="/docs/api/bots#remove" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                Remove Bot
              </Link>
              <Link href="/docs/api/bots#web-module" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                Web Module
              </Link>
            </div>
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold">Meeting Audio</h4>
            <div className="grid gap-2">
              <Link href="/docs/api/meeting-audio#download" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                Download Audio
              </Link>
              <Link href="/docs/api/meeting-audio#delete" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                Delete Audio
              </Link>
              <Link href="/docs/api/meeting-audio#recordings" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                Recordings
              </Link>
              <Link href="/docs/api/meeting-audio#transcription" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                Transcription
              </Link>
            </div>
          </div>
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-10">
        <div className="mx-auto max-w-3xl">
          {children}
        </div>
      </main>
    </div>
  )
} 