'use client'

import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

interface GetStartedButtonProps {
  buttonText?: string
  buttonVariant?: 'default' | 'outline'
  isPopular?: boolean
  isEnterprise?: boolean
  isLoading?: boolean
  planType?: 'mvp' | 'dynamic' | 'enterprise' | 'local' | 'community' | 'nomad' | 'dedicated'
}

export function GetStartedButton({
  buttonText = 'Get Started',
  buttonVariant = 'default',
  isPopular = false,
  isEnterprise = false,
  isLoading = false,
  planType = 'dynamic',
}: GetStartedButtonProps) {
  const { data: session } = useSession()
  const [isSubscribing, setIsSubscribing] = useState(false)

  const handleMvpSubscription = async () => {
    if (!session) {
      signIn('google', { callbackUrl: '/pricing' })
      return
    }

    setIsSubscribing(true)
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planType: 'mvp',
          botCount: 1, // MVP has 1 concurrent meeting
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

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error(data.error || 'Failed to start checkout')
      }
    } catch (error) {
      console.error('Error creating MVP checkout session:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setIsSubscribing(false)
    }
  }

  const handleButtonClick = () => {
    if (isEnterprise) {
      // Enterprise buttons should link to a contact form/page
      window.location.href = '/contact-sales' // Or your specific contact URL
      return
    }

    if (planType === 'mvp') {
      handleMvpSubscription()
      return
    }

    if (!session) {
      // If user is not logged in, initiate Google sign-in
      signIn('google', { callbackUrl: '/pricing' })
    } else {
      // If user is logged in, redirect them to the dashboard or a checkout page
      // For a simple "Get Started", redirecting to the dashboard makes sense.
      window.location.href = '/dashboard'
    }
  }

  const getButtonText = () => {
    if (isEnterprise) return 'Contact Sales'
    if (planType === 'mvp' && session) return 'Start Free Trial - No Credit Card'
    if (!session) return 'Sign in to Get Started'
    return buttonText // e.g., 'Go to Dashboard' or the original 'Get Started'
  }

  return (
    <Button
      className={`${isPopular ? 'w-full' : 'w-full'} ${buttonVariant === 'outline' ? 'border-primary text-primary hover:bg-primary hover:text-primary-foreground' : ''}`}
      variant={buttonVariant}
      size="lg"
      onClick={handleButtonClick}
      disabled={isLoading || isSubscribing}
    >
      {isSubscribing ? 'Loading...' : getButtonText()}
    </Button>
  )
} 