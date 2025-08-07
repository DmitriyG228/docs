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

    // Get customer by email
    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    })

    if (!customers.data.length) {
      return NextResponse.json(
        { error: 'No customer found. Please create a subscription first.' },
        { status: 404 }
      )
    }

    const customer = customers.data[0]

    // Get user's subscription status to customize portal experience
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 5,
    })

    const activeSubscription = subscriptions.data.find(sub => 
      sub.status === 'active' || sub.status === 'trialing'
    )

    console.log(`[Portal Session] Customer ${customer.id} has ${subscriptions.data.length} subscriptions, active/trialing: ${activeSubscription ? activeSubscription.status : 'none'}`)

    // Create enhanced portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${request.headers.get('origin') || 'http://localhost:3001'}/dashboard`,
      // For trial users, direct them to payment method setup
      ...(activeSubscription?.status === 'trialing' && {
        flow_data: {
          type: 'payment_method_update',
        },
      }),
    })

    return NextResponse.json({ url: portalSession.url })

  } catch (error) {
    console.error('Error creating portal session:', error)
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    )
  }
} 