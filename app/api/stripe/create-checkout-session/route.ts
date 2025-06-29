import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route' // Adjust path if needed

import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      )
    }

    const { botCount } = await request.json()

    // Validate input
    if (!botCount || botCount < 5 || botCount > 1000) {
      return NextResponse.json(
        { error: 'Invalid bot count. Must be between 5 and 1000.' },
        { status: 400 }
      )
    }

    // Check for required environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe configuration missing. Please contact support.' },
        { status: 500 }
      )
    }

    const price = calculatePrice(botCount)
    const tier = getPricingTier(botCount)
    const origin = request.headers.get('origin') || 'http://localhost:3001'
    const userEmail = session.user.email

    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail, // Force the authenticated user's email
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Vexa AI Bots - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Plan`,
              description: `${botCount} concurrent bots for ${userEmail}`,
              metadata: {
                botCount: botCount.toString(),
                tier,
                userEmail, // Also store in metadata for the webhook
              },
            },
            unit_amount: price * 100, // Stripe expects cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing`,
      metadata: {
        botCount: botCount.toString(),
        tier,
        pricePerBot: (price / botCount).toFixed(2),
        userEmail, // Store the authenticated email in the session metadata
      },
      allow_promotion_codes: true,
    })

    console.log(`Created checkout session for ${userEmail}: ${botCount} bots (${tier} tier)`)

    return NextResponse.json({ 
      sessionId: stripeSession.id,
      url: stripeSession.url 
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 