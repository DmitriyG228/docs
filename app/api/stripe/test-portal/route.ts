import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function GET(request: NextRequest) {
  try {
    console.log('[Test Portal] Checking Stripe configuration...')
    
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log(`[Test Portal] User email: ${session.user.email}`)

    // Test 1: Check if we can list customers
    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    })

    console.log(`[Test Portal] Found ${customers.data.length} customers`)

    if (!customers.data.length) {
      return NextResponse.json({
        error: 'No customer found',
        message: 'You need to create a subscription first to access the billing portal',
        userEmail: session.user.email
      }, { status: 404 })
    }

    const customer = customers.data[0]
    console.log(`[Test Portal] Customer ID: ${customer.id}`)

    // Test 2: Check if customer has any subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 1,
    })

    console.log(`[Test Portal] Found ${subscriptions.data.length} subscriptions`)

    // Test 3: Try to create a portal session
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customer.id,
        return_url: `${request.headers.get('origin') || 'http://localhost:3001'}/dashboard`,
      })

      console.log(`[Test Portal] Successfully created portal session`)
      
      return NextResponse.json({
        success: true,
        customerId: customer.id,
        customerEmail: customer.email,
        subscriptionCount: subscriptions.data.length,
        portalUrl: portalSession.url,
        message: 'Portal is working correctly!'
      })

    } catch (portalError) {
      console.error('[Test Portal] Portal creation failed:', portalError)
      
      return NextResponse.json({
        error: 'Portal creation failed',
        message: 'The Stripe Customer Portal may not be enabled in your Stripe Dashboard',
        details: portalError instanceof Error ? portalError.message : 'Unknown error',
        customerId: customer.id,
        customerEmail: customer.email,
        subscriptionCount: subscriptions.data.length
      }, { status: 500 })
    }

  } catch (error) {
    console.error('[Test Portal] General error:', error)
    
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 