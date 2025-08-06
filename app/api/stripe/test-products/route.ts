import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function GET(request: NextRequest) {
  try {
    console.log('[Test Products] Checking existing Stripe products and prices...')
    
    // Find the "Bot subscription" product
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    })
    
    console.log(`[Test Products] Found ${products.data.length} active products`)
    
    const botProduct = products.data.find(p => p.name === "Bot subscription")
    if (!botProduct) {
      return NextResponse.json({
        error: 'Bot subscription product not found',
        message: 'Please run the stripe_sync.py script first',
        availableProducts: products.data.map(p => ({ id: p.id, name: p.name }))
      }, { status: 404 })
    }

    console.log(`[Test Products] Found Bot subscription product: ${botProduct.id}`)

    // Find the "Startup" price for this product
    const prices = await stripe.prices.list({
      product: botProduct.id,
      active: true,
      limit: 100,
    })

    console.log(`[Test Products] Found ${prices.data.length} prices for Bot subscription product`)
    
    const startupPrice = prices.data.find(p => p.nickname === "Startup")
    if (!startupPrice) {
      return NextResponse.json({
        error: 'Startup price not found',
        message: 'Please run the stripe_sync.py script first',
        availablePrices: prices.data.map(p => ({ id: p.id, nickname: p.nickname, unit_amount: p.unit_amount }))
      }, { status: 404 })
    }

    console.log(`[Test Products] Found Startup price: ${startupPrice.id}`)

    // Test creating a checkout session
    try {
      const testSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: 'test@example.com',
        line_items: [
          {
            price: startupPrice.id,
            quantity: 5, // Test with 5 bots
          },
        ],
        mode: 'subscription',
        success_url: 'http://localhost:3001/dashboard',
        cancel_url: 'http://localhost:3001/pricing',
        metadata: {
          test: 'true',
          botCount: '5',
        },
      })

      console.log(`[Test Products] Successfully created test checkout session: ${testSession.id}`)

      return NextResponse.json({
        success: true,
        message: 'Products and prices are working correctly!',
        product: {
          id: botProduct.id,
          name: botProduct.name,
        },
        price: {
          id: startupPrice.id,
          nickname: startupPrice.nickname,
          unit_amount: startupPrice.unit_amount,
          billing_scheme: startupPrice.billing_scheme,
          tiers: startupPrice.tiers,
        },
        testSession: {
          id: testSession.id,
          url: testSession.url,
        }
      })

    } catch (sessionError) {
      console.error('[Test Products] Session creation failed:', sessionError)
      
      return NextResponse.json({
        error: 'Session creation failed',
        message: 'Checkout session creation failed',
        details: sessionError instanceof Error ? sessionError.message : 'Unknown error',
        product: {
          id: botProduct.id,
          name: botProduct.name,
        },
        price: {
          id: startupPrice.id,
          nickname: startupPrice.nickname,
        }
      }, { status: 500 })
    }

  } catch (error) {
    console.error('[Test Products] General error:', error)
    
    return NextResponse.json({
      error: 'Test failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 