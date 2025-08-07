"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Bot, Clock, CreditCard } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function TrialCheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // If user is not authenticated, redirect to login
    if (status === "unauthenticated") {
      router.push("/")
      return
    }

    // If user is authenticated but not a new user, redirect to dashboard
    if (status === "authenticated" && session && !(session.user as any)?.isNewUser) {
      router.push("/dashboard")
      return
    }
  }, [session, status, router])

  const handleStartTrial = async () => {
    if (!session?.user?.email) {
      toast({
        title: "Error",
        description: "Please sign in to start your trial",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: 'mvp', // This will create the trial subscription
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        const errorData = await response.json()
        if (errorData.error === 'You already have an active subscription') {
          // User already has subscription, redirect to billing portal
          toast({
            title: "Already Subscribed",
            description: "You already have an active subscription. Redirecting to billing portal...",
          })
          
          // Redirect to billing portal after a short delay
          setTimeout(async () => {
            try {
              const portalResponse = await fetch('/api/stripe/create-portal-session', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
              })
              
              const portalData = await portalResponse.json()
              if (portalData.url) {
                window.location.href = portalData.url
              } else {
                window.location.href = '/dashboard'
              }
            } catch (portalError) {
              console.error('Error opening portal:', portalError)
              window.location.href = '/dashboard'
            }
          }, 2000)
          
          return
        }
        
        throw new Error(errorData.error || 'Failed to create trial checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Error creating trial checkout session:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to start trial. Please try again.',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (status !== "authenticated" || !(session?.user as any)?.isNewUser) {
    return null
  }

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to Vexa!</h1>
          <p className="text-muted-foreground">
            Start your 7-day free trial and experience the power of AI meeting bots
          </p>
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Bot className="h-5 w-5" />
              Free Trial - 1 Bot
            </CardTitle>
            <CardDescription>
              Get started with 1 concurrent bot for 7 days, no credit card required
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Trial Period</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  7 Days Free
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Concurrent Bots</span>
                <Badge variant="secondary">1 Bot</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">After Trial</span>
                <span className="text-sm text-muted-foreground">$12/month or cancel anytime</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>No credit card required to start</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Cancel anytime during trial</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Full access to all features</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>API keys and dashboard access</span>
              </div>
            </div>

            <Button 
              onClick={handleStartTrial}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Starting Trial...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Start Free Trial
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            By starting your trial, you agree to our{" "}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
} 