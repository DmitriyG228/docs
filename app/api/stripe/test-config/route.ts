import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function GET(request: NextRequest) {
  try {
    console.log('[Test Config] Testing Stripe configuration...')
    console.log('[Test Config] Secret key starts with:', process.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...')
    
    // Test 1: Try to list customers to verify API key works
    const customers = await stripe.customers.list({
      limit: 1,
    })

    console.log('[Test Config] Successfully listed customers:', customers.data.length)

    // Test 2: Try to create a test customer
    const testCustomer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test Customer',
      metadata: {
        test: 'true',
        timestamp: new Date().toISOString(),
      },
    })

    console.log('[Test Config] Created test customer:', testCustomer.id)

    // Test 3: Try to create a portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: testCustomer.id,
      return_url: 'http://localhost:3001/dashboard',
    })

    console.log('[Test Config] Created portal session:', portalSession.url)

    // Clean up: Delete the test customer
    await stripe.customers.del(testCustomer.id)
    console.log('[Test Config] Deleted test customer')

    return NextResponse.json({
      success: true,
      message: 'Stripe configuration is working correctly!',
      customerCount: customers.data.length,
      portalUrl: portalSession.url,
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...',
    })

  } catch (error) {
    console.error('[Test Config] Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 20) + '...',
    }, { status: 500 })
  }
} 