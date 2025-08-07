import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log(`[Test Trial] Creating trial subscription for ${session.user.email}`)
    
    // Find existing product and price
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    })
    
    const botProduct = products.data.find(p => p.name === "Bot subscription")
    if (!botProduct) {
      return NextResponse.json({
        error: 'Bot subscription product not found',
        message: 'Please run the stripe_sync.py script first'
      }, { status: 404 })
    }

    const prices = await stripe.prices.list({
      product: botProduct.id,
      active: true,
      limit: 100,
    })

    const startupPrice = prices.data.find(p => p.nickname === "Startup")
    if (!startupPrice) {
      return NextResponse.json({
        error: 'Startup price not found',
        message: 'Please run the stripe_sync.py script first'
      }, { status: 404 })
    }

    // Create or get customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log(`[Test Trial] Found existing customer: ${customer.id}`);
    } else {
      customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          test: 'true',
        },
      });
      console.log(`[Test Trial] Created new customer: ${customer.id}`);
    }

    // Check if customer already has an active subscription
    const existingSubscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 10,
    });

    if (existingSubscriptions.data.length > 0) {
      console.log(`[Test Trial] Customer already has ${existingSubscriptions.data.length} active subscription(s)`);
      return NextResponse.json({
        success: false,
        error: 'Customer already has an active subscription',
        message: 'Cannot create multiple subscriptions for the same customer',
        existingSubscriptions: existingSubscriptions.data.map(sub => ({
          id: sub.id,
          status: sub.status,
          trial_end: sub.trial_end,
          created: sub.created,
        }))
      }, { status: 400 });
    }

    // Create subscription with trial
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: startupPrice.id,
          quantity: 1, // 1 bot for trial
        },
      ],
      trial_period_days: 7,
      trial_settings: {
        end_behavior: {
          missing_payment_method: 'cancel',
        },
      },
      metadata: {
        test: 'true',
        botCount: '1',
        tier: 'trial',
        userEmail: session.user.email,
      },
    });

    console.log(`[Test Trial] Created trial subscription: ${subscription.id}`)

    return NextResponse.json({
      success: true,
      message: 'Trial subscription created successfully!',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        trial_end: subscription.trial_end,
        customer_id: customer.id,
      },
      customer: {
        id: customer.id,
        email: customer.email,
      },
      product: {
        id: botProduct.id,
        name: botProduct.name,
      },
      price: {
        id: startupPrice.id,
        nickname: startupPrice.nickname,
      }
    })

  } catch (error) {
    console.error('[Test Trial] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 