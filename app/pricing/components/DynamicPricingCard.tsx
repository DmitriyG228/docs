'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { CheckCircle2, Zap, Globe, Server } from 'lucide-react'
import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'

interface PricingTierInfo {
  name: string
  description: string
  features: string[]
  icon: React.ReactNode
}

export function DynamicPricingCard() {
  const [sliderValue, setSliderValue] = useState([0]) // 0-100 slider value
  const [isLoading, setIsLoading] = useState(false)
  
  const { data: session } = useSession()
  
  // Convert slider position (0-100) to actual bot count
  const sliderToBots = (sliderPos: number): number => {
    if (sliderPos <= 33.33) {
      // First 1/3: Startup tier (5-29 bots)
      const progress = sliderPos / 33.33
      return Math.round(5 + progress * (29 - 5))
    } else if (sliderPos <= 66.66) {
      // Second 1/3: Growth tier (30-179 bots)  
      const progress = (sliderPos - 33.33) / 33.33
      return Math.round(30 + progress * (179 - 30))
    } else {
      // Final 1/3: Scale tier (180-1000 bots)
      const progress = (sliderPos - 66.66) / 33.34
      return Math.round(180 + progress * (1000 - 180))
    }
  }
  
  // Convert bot count back to slider position (for initialization)
  const botsToSlider = (bots: number): number => {
    if (bots < 30) {
      // Startup tier
      const progress = (bots - 5) / (29 - 5)
      return progress * 33.33
    } else if (bots < 180) {
      // Growth tier
      const progress = (bots - 30) / (179 - 30)
      return 33.33 + progress * 33.33
    } else {
      // Scale tier
      const progress = (bots - 180) / (1000 - 180)
      return 66.66 + progress * 33.34
    }
  }
  
  const getPricingTier = (bots: number): 'startup' | 'growth' | 'scale' => {
    if (bots < 30) return 'startup'
    if (bots < 180) return 'growth'
    return 'scale'
  }
  
  const getPricingInfo = (bots: number): PricingTierInfo => {
    const tier = getPricingTier(bots)
    
    switch (tier) {
      case 'startup':
        return {
          name: 'Startup',
          description: 'For early products and internal products for small teams',
          features: ['Unlimited transcription volume', 'Community Slack support'],
          icon: <Zap className="h-4 w-4 text-primary" />
        }
      case 'growth':
        return {
          name: 'Growth',
          description: 'For medium-sized companies and growing conversation-AI vendors',
          features: ['Unlimited transcription volume', '1 h solutions consult / month'],
          icon: <Globe className="h-4 w-4 text-primary" />
        }
      case 'scale':
        return {
          name: 'Scale',
          description: 'For mid-market tooling platforms',
          features: ['24 × 5 e-mail + Slack support', '4 h P1 SLA, quarterly review'],
          icon: <Server className="h-4 w-4 text-primary" />
        }
    }
  }
  
  const calculatePrice = (bots: number): number => {
    // Per-bot cost decreases with volume: starts at $24, approaches $10 minimum
    // Using slower exponential decay: cost = 10 + 14 * e^(-bots/100)
    const perBotCost = 10 + 14 * Math.exp(-bots / 100);
    
    // Base price calculation with $10 minimum per bot
    let basePrice = Math.round(bots * Math.max(10, perBotCost));
    
    // Apply floor of $120
    basePrice = Math.max(120, basePrice);
    
    // Apply tier cliffs (volume discounts for reaching tier thresholds)
    if (bots >= 180) {
      // Scale tier: 15% discount for high volume
      basePrice = Math.round(basePrice * 0.85);
    } else if (bots >= 30) {
      // Growth tier: 10% discount for medium volume
      basePrice = Math.round(basePrice * 0.90);
    } else if (bots >= 5) {
      // Startup tier: 5% discount for minimum viable volume
      basePrice = Math.round(basePrice * 0.95);
    }
    
    // Ensure floor is maintained after discounts and $10/bot minimum
    return Math.max(120, Math.max(bots * 10, basePrice));
  }
  
  const getUserCalc = (bots: number, price: number): string | null => {
    const tier = getPricingTier(bots)
    
    if (tier === 'growth') {
      const users = Math.round(bots * 3.33)
      const costPerUser = Math.round((price / users) * 100) / 100
      return `${bots} bots serve ~${users} users globally at ~$${costPerUser}/user`
    }
    
    if (tier === 'scale') {
      const users = Math.round(bots * 3.25)
      const costPerUser = Math.round((price / users) * 100) / 100
      return `${bots} bots serve ~${users} users globally at ~$${costPerUser}/user`
    }
    
    return null
  }
  
  const currentBots = sliderToBots(sliderValue[0])
  const pricingInfo = getPricingInfo(currentBots)
  const price = calculatePrice(currentBots)
  const userCalc = getUserCalc(currentBots, price)
  const perBotCost = Math.round((price / currentBots) * 100) / 100

  const handleSubscribe = async () => {
    if (!session) {
      // If user is not logged in, initiate Google sign-in.
      signIn('google', { callbackUrl: '/pricing' })
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
          botCount: currentBots,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.error === 'You already have an active subscription') {
          // User already has subscription, redirect to billing portal
          alert('You already have an active subscription. Redirecting to billing portal...')
          
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
        
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout using the URL provided by Stripe
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Card className="relative rounded-xl border bg-card shadow-sm transition-all hover:shadow-md flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          {pricingInfo.icon}
          {pricingInfo.name}
        </CardTitle>
        <CardDescription className="min-h-[2.5rem] flex items-center">
          {pricingInfo.description}
        </CardDescription>
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {currentBots} bots
            </div>
            <div className="text-3xl font-bold">
              ${price}
              <span className="text-base font-normal text-muted-foreground">/mo</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              ${perBotCost} per bot
            </div>
          </div>
          {userCalc && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
              <p className="text-sm font-medium text-primary text-center">
                {userCalc}
              </p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Concurrent bots</span>
              <Badge variant="secondary">{currentBots}</Badge>
            </div>
            <Slider
              value={sliderValue}
              onValueChange={setSliderValue}
              max={100}
              min={0}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5</span>
              <span>1000</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">{currentBots} concurrent meetings</span>
            </div>
            {pricingInfo.features.map((feature: string, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-auto pt-4">
          <Button 
            className="w-full" 
            size="lg" 
            onClick={handleSubscribe}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : (session ? 'Subscribe Now' : 'Sign in to Subscribe')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 