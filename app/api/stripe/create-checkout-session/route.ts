import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

// Helper function to find existing product and price
async function findExistingProductAndPrice() {
  // Find the "Bot subscription" product
  const products = await stripe.products.list({
    active: true,
    limit: 100,
  })
  
  const botProduct = products.data.find(p => p.name === "Bot subscription")
  if (!botProduct) {
    throw new Error("Bot subscription product not found. Please run the stripe_sync.py script first.")
  }

  // Find the "Startup" price for this product
  const prices = await stripe.prices.list({
    product: botProduct.id,
    active: true,
    limit: 100,
  })

  const startupPrice = prices.data.find(p => p.nickname === "Startup")
  if (!startupPrice) {
    throw new Error("Startup price not found. Please run the stripe_sync.py script first.")
  }

  return { product: botProduct, price: startupPrice }
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

    const { botCount, planType = 'dynamic' } = await request.json()

    // Handle MVP plan - Use Checkout with trial and no payment collection
    if (planType === 'mvp') {
      const origin = request.headers.get('origin') || 'http://localhost:3001'
      const userEmail = session.user.email

      try {
        // Find existing product and price
        const { product, price } = await findExistingProductAndPrice()

        // Create Checkout Session with trial and no upfront payment collection
        const stripeSession = await stripe.checkout.sessions.create({
          mode: 'subscription',
          customer_email: userEmail,
          line_items: [
            {
              price: price.id,
              quantity: 1,
            },
          ],
          // Key parameters for no-payment-required trial
          subscription_data: {
            trial_period_days: 7,
            trial_settings: {
              end_behavior: {
                missing_payment_method: 'cancel',
              },
            },
            metadata: {
              botCount: '1',
              tier: 'mvp',
              pricePerBot: '12.00',
              userEmail,
            },
          },
          payment_method_collection: 'if_required', // This is the key!
          success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&trial_started=true`,
          cancel_url: `${origin}/pricing`,
          metadata: {
            botCount: '1',
            tier: 'mvp',
            pricePerBot: '12.00',
            userEmail,
          },
          allow_promotion_codes: true,
        })

        console.log(`Created MVP trial checkout session ${stripeSession.id} for ${userEmail}`)

        return NextResponse.json({ 
          sessionId: stripeSession.id,
          url: stripeSession.url 
        })

      } catch (error) {
        console.error('Error creating MVP trial checkout:', error)
        return NextResponse.json(
          { error: 'Failed to start trial. Please try again.' },
          { status: 500 }
        )
      }
    }

    // Validate input for dynamic plans
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

    const origin = request.headers.get('origin') || 'http://localhost:3001'
    const userEmail = session.user.email

    try {
      // Find existing product and price
      const { product, price } = await findExistingProductAndPrice()

      // Create checkout session using existing price
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: userEmail,
        line_items: [
          {
            price: price.id,
            quantity: botCount, // Use quantity to specify bot count for tiered pricing
          },
        ],
        mode: 'subscription',
        success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing`,
        metadata: {
          botCount: botCount.toString(),
          tier: 'startup',
          userEmail,
        },
        allow_promotion_codes: true,
      })

      console.log(`Created checkout session for ${userEmail}: ${botCount} bots using existing price`)

      return NextResponse.json({ 
        sessionId: stripeSession.id,
        url: stripeSession.url 
      })

    } catch (error) {
      console.error('Error creating checkout session:', error)
      return NextResponse.json(
        { error: 'Failed to create checkout session. Please try again.' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 