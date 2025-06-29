import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Exact same pricing formula from DynamicPricingCard
function calculatePrice(bots: number): number {
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

function getPricingTier(bots: number): 'startup' | 'growth' | 'scale' {
  if (bots < 30) return 'startup'
  if (bots < 180) return 'growth'
  return 'scale'
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { subscriptionId, newBotCount } = await request.json()
    
    if (!subscriptionId || !newBotCount) {
      return NextResponse.json(
        { error: 'Subscription ID and new bot count are required' },
        { status: 400 }
      )
    }

    // Validate bot count
    if (newBotCount < 5 || newBotCount > 1000) {
      return NextResponse.json(
        { error: 'Invalid bot count. Must be between 5 and 1000.' },
        { status: 400 }
      )
    }

    // Calculate new price and tier
    const price = calculatePrice(newBotCount)
    const tier = getPricingTier(newBotCount)

    // Get current subscription to find the price item
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    if (!subscription.items.data.length) {
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      )
    }

    // Create new price for the updated bot count
    const newPrice = await stripe.prices.create({
      currency: 'usd',
      unit_amount: price * 100, // Stripe expects cents
      recurring: { interval: 'month' },
      product_data: {
        name: `Vexa AI Bots - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
        description: `${newBotCount} concurrent bots for ${session.user.email}`,
        metadata: {
          botCount: newBotCount.toString(),
          tier,
          userEmail: session.user.email,
        },
      },
    })

    // Update the subscription with the new price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPrice.id,
      }],
      proration_behavior: 'create_prorations', // Prorate the change immediately
      metadata: {
        botCount: newBotCount.toString(),
        tier,
        pricePerBot: (price / newBotCount).toFixed(2),
        userEmail: session.user.email,
      },
    })

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      newBotCount,
      newPrice: price,
      tier,
      message: 'Subscription updated successfully'
    })

  } catch (error) {
    console.error('Error modifying subscription:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to modify subscription' },
      { status: 500 }
    )
  }
} 