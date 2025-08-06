import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    console.log('[Portal] Starting portal session creation...')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.log('[Portal] No session or email found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log(`[Portal] Looking for customer with email: ${session.user.email}`)

    // Get customer by email
    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    })

    console.log(`[Portal] Found ${customers.data.length} customers`)

    if (!customers.data.length) {
      console.log('[Portal] No customer found')
      return NextResponse.json(
        { error: 'No customer found. Please create a subscription first.' },
        { status: 404 }
      )
    }

    const customer = customers.data[0]
    console.log(`[Portal] Using customer ID: ${customer.id}`)

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${request.headers.get('origin') || 'http://localhost:3001'}/dashboard`,
    })

    console.log(`[Portal] Created portal session with URL: ${portalSession.url}`)
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