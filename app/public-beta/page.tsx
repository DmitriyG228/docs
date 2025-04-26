"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default function PublicBetaPage() {
  return (
    <div className="container max-w-2xl mx-auto py-10">
      <div className="bg-muted p-6 rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Free Public Beta</h2>
          <p className="text-muted-foreground mt-2">
            Vexa is now available to everyone in public beta, completely free of charge.
          </p>
        </div>
        
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-3">Current Limitations</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Limited to one concurrent bot per user account</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Currently supports Google Meet, with more platforms coming soon</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Need more bots? Contact us on our <a href="https://discord.gg/Ga9duGkVz9" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Discord server</a></span>
            </li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Ready to Get Started?</h3>
          <p className="text-sm text-muted-foreground">
            Follow our starting guide and view API documentation to get started with Vexa.
          </p>
          
          <div className="flex flex-col gap-3 mt-4">
            <a href="/get-started">
              <Button className="w-full">Starting Guide</Button>
            </a>
            <a href="https://github.com/Vexa-ai/vexa/blob/feature/traefik/docs/user_api_guide.md" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="w-full">View API Documentation</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 
 
 
 