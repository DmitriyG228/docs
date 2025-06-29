"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Bot, Calendar, AlertCircle, Key, ArrowRight, Settings, Loader2 } from "lucide-react"

interface UserData {
  id: number
  email: string
  name?: string
  max_concurrent_bots: number
  data?: {
    subscription_end_date?: string
    subscription_status?: string
    subscription_tier?: string
    stripe_subscription_id?: string
  }
}

export default function DashboardPage() {
  const { data: session, status: sessionStatus } = useSession()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newBotCount, setNewBotCount] = useState([25]) // Default to 25 bots
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false)
  const [isCancelingSubscription, setIsCancelingSubscription] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      if (sessionStatus !== "authenticated" || !session?.user?.id) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/admin/tokens?userId=${session.user.id}`)
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.detail || errorData.error || 'Failed to fetch user data')
        }
        
        const data = await response.json()
        setUserData(data)
        // Initialize bot count slider with current value
        setNewBotCount([data.max_concurrent_bots || 1])
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError(err instanceof Error ? err.message : 'Failed to load user data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [sessionStatus, session])

  // Pricing calculation functions (same as in DynamicPricingCard)
  const calculatePrice = (bots: number): number => {
    const perBotCost = 10 + 14 * Math.exp(-bots / 100);
    let basePrice = Math.round(bots * Math.max(10, perBotCost));
    basePrice = Math.max(120, basePrice);
    
    if (bots >= 180) {
      basePrice = Math.round(basePrice * 0.85);
    } else if (bots >= 30) {
      basePrice = Math.round(basePrice * 0.90);
    } else if (bots >= 5) {
      basePrice = Math.round(basePrice * 0.95);
    }
    
    return Math.max(120, Math.max(bots * 10, basePrice));
  }

  const getPricingTier = (bots: number): 'startup' | 'growth' | 'scale' => {
    if (bots < 30) return 'startup'
    if (bots < 180) return 'growth'
    return 'scale'
  }

  const handleUpdateSubscription = async () => {
    if (!userData?.data?.stripe_subscription_id) {
      toast({
        title: "Error",
        description: "No active subscription found",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingSubscription(true)
    try {
      const response = await fetch('/api/stripe/modify-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: userData.data.stripe_subscription_id,
          newBotCount: newBotCount[0],
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update subscription')
      }

      toast({
        title: "Subscription Updated",
        description: `Your subscription has been updated to ${newBotCount[0]} bots`,
      })

      // Refresh user data
      window.location.reload()
    } catch (error) {
      console.error('Error updating subscription:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update subscription',
        variant: "destructive",
      })
    } finally {
      setIsUpdatingSubscription(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!userData?.data?.stripe_subscription_id) {
      toast({
        title: "Error",
        description: "No active subscription found",
        variant: "destructive",
      })
      return
    }

    setIsCancelingSubscription(true)
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: userData.data.stripe_subscription_id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel subscription')
      }

      toast({
        title: "Subscription Canceled",
        description: data.message || "Your subscription will be canceled at the end of the current billing period",
      })

      // Refresh user data
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      console.error('Error canceling subscription:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to cancel subscription',
        variant: "destructive",
      })
    } finally {
      setIsCancelingSubscription(false)
    }
  }

  const formatPaymentDueDate = (dateString?: string) => {
    if (!dateString) return "No active subscription"
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return "Invalid date"
    }
  }

  const getSubscriptionStatus = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>
      default:
        return <Badge variant="secondary">Free Plan</Badge>
    }
  }

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Your current plan and usage</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-24" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-48" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (sessionStatus !== "authenticated") {
    return (
      <div className="container py-10">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to view your dashboard.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Your current plan and usage</p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <Toaster />
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {userData?.name || userData?.email || 'User'}
        </p>
            </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Current Bot Limit */}
                <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Bot Limit</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userData?.max_concurrent_bots || 1} bot{(userData?.max_concurrent_bots || 1) > 1 ? 's' : ''}
                    </div>
            <p className="text-xs text-muted-foreground">
              {userData?.data?.subscription_tier ? 
                `${userData.data.subscription_tier.charAt(0).toUpperCase() + userData.data.subscription_tier.slice(1)} Plan` : 
                'Free Plan'
              }
            </p>
                  </CardContent>
                </Card>

        {/* Next Payment Due */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
              <div className="space-y-2">
              <div className="flex items-center gap-2">
                {getSubscriptionStatus(userData?.data?.subscription_status)}
              </div>
              <div className="text-sm text-muted-foreground">
                {userData?.data?.subscription_end_date ? (
                  <>
                    Next payment due: {formatPaymentDueDate(userData.data.subscription_end_date)}
                  </>
                ) : (
                  "No active subscription"
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys Quick Access */}
        <Card className="lg:col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Manage your API keys for bot integration
              </p>
              <Link href="/dashboard/api-keys">
                <Button className="w-full" variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Manage API Keys
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Management Section */}
      {userData?.data?.subscription_status === 'active' && userData?.data?.stripe_subscription_id && (
        <div className="mt-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Subscription Management</h2>
            <p className="text-muted-foreground text-sm">
              Manage your subscription and bot limits
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Change Bot Limit
              </CardTitle>
              <CardDescription>
                Adjust your concurrent bot limit. Changes are prorated and take effect immediately.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="bot-count-slider">
                  Bot Count: {newBotCount[0]} bots
                </Label>
                <Slider
                  id="bot-count-slider"
                  min={5}
                  max={200}
                  step={1}
                  value={newBotCount}
                  onValueChange={setNewBotCount}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>5 bots</span>
                  <span>200 bots</span>
                  </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm font-medium">
                    New Price: ${calculatePrice(newBotCount[0])}/month
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getPricingTier(newBotCount[0]).charAt(0).toUpperCase() + getPricingTier(newBotCount[0]).slice(1)} tier
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleUpdateSubscription}
                  disabled={isUpdatingSubscription || newBotCount[0] === userData?.max_concurrent_bots}
                  className="flex-1"
                >
                  {isUpdatingSubscription ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Subscription'
                  )}
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period ({formatPaymentDueDate(userData?.data?.subscription_end_date)}).
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleCancelSubscription}
                        disabled={isCancelingSubscription}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isCancelingSubscription ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Canceling...
                          </>
                        ) : (
                          'Yes, Cancel Subscription'
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                  </div>
                </CardContent>
              </Card>
      </div>
      )}

      {/* Subscription Info */}
      {userData?.data?.stripe_subscription_id && (
        <div className="mt-6">
        <Card>
          <CardHeader>
              <CardTitle className="text-lg">Subscription Details</CardTitle>
          </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subscription ID:</span>
                <span className="text-sm font-mono">{userData.data.stripe_subscription_id}</span>
              </div>
              {userData.data.subscription_tier && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Plan:</span>
                  <span className="text-sm">{userData.data.subscription_tier}</span>
                </div>
              )}
          </CardContent>
        </Card>
        </div>
      )}
    </div>
  )
}

