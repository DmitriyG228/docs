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
  const daysLeft = trialEndDate ? Math.ceil((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
          <AlertTriangle className="h-5 w-5" />
          Trial Period Active
        </CardTitle>
        <CardDescription className="text-orange-700 dark:text-orange-300">
          You're currently on a 7-day free trial. {daysLeft > 0 ? `${daysLeft} days remaining.` : 'Trial ending soon.'}
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