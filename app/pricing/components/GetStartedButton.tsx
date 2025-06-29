'use client'

import { useSession, signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

interface GetStartedButtonProps {
  buttonText?: string
  buttonVariant?: 'default' | 'outline'
  isPopular?: boolean
  isEnterprise?: boolean
  isLoading?: boolean // Added for consistency
}

export function GetStartedButton({
  buttonText = 'Get Started',
  buttonVariant = 'default',
  isPopular = false,
  isEnterprise = false,
  isLoading = false,
}: GetStartedButtonProps) {
  const { data: session } = useSession()

  const handleButtonClick = () => {
    if (isEnterprise) {
      // Enterprise buttons should link to a contact form/page
      window.location.href = '/contact-sales' // Or your specific contact URL
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
    if (!session) return 'Sign in to Get Started'
    return buttonText // e.g., 'Go to Dashboard' or the original 'Get Started'
  }

  return (
    <Button
      className={`${isPopular ? 'w-full' : 'w-full'} ${buttonVariant === 'outline' ? 'border-primary text-primary hover:bg-primary hover:text-primary-foreground' : ''}`}
      variant={buttonVariant}
      size="lg"
      onClick={handleButtonClick}
      disabled={isLoading}
    >
      {getButtonText()}
    </Button>
  )
} 