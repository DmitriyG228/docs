'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CreditCard } from 'lucide-react'

interface TrialStatusProps {
  subscriptionId?: string
  status?: string
  trialEnd?: string
  onAddPaymentMethod?: () => void
}

export function TrialStatus({ 
  subscriptionId, 
  status, 
  trialEnd, 
  onAddPaymentMethod 
}: TrialStatusProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAddPaymentMethod = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to open billing portal')
      }
      
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error) {
      console.error('Error opening billing portal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (status !== 'trialing') {
    return null
  }

  const trialEndDate = trialEnd ? new Date(trialEnd) : null
  const timeLeft = trialEndDate ? trialEndDate.getTime() - Date.now() : 0
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24))
  const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60))
  const minutesLeft = Math.ceil(timeLeft / (1000 * 60))

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <AlertTriangle className="h-5 w-5" />
          Trial Period Active
        </CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          You're currently on a free trial. {
            timeLeft <= 0 ? 'Trial has ended.' :
            daysLeft >= 1 ? `${daysLeft} day${daysLeft > 1 ? 's' : ''} remaining.` :
            hoursLeft >= 1 ? `${hoursLeft} hour${hoursLeft > 1 ? 's' : ''} remaining.` :
            `${minutesLeft} minute${minutesLeft > 1 ? 's' : ''} remaining.`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-orange-700 dark:text-orange-300">
            To continue using Vexa after your trial ends, please add a payment method through the billing portal.
          </p>
          <Button 
            onClick={handleAddPaymentMethod}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            {isLoading ? 'Processing...' : 'Open Billing Portal'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 