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
            Sign up for an account, get your API key, and start using Vexa in minutes.
          </p>
          
          <div className="flex flex-col gap-3 mt-4">
            <a href="/api/auth/signin">
              <Button className="w-full flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  <path fill="none" d="M1 1h22v22H1z" />
                </svg>
                Log in with Google
              </Button>
            </a>
            <a href="/get-started">
              <Button variant="outline" className="w-full">Starting Guide</Button>
            </a>
            <a href="https://github.com/Vexa-ai/vexa/blob/main/docs/user_api_guide.md" target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" className="w-full">View API Documentation</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 
 
 
 