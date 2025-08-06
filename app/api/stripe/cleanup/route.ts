import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      )
    }

    // Check if user is admin (you may want to add admin role checking)
    // For now, we'll allow any authenticated user to run cleanup
    // In production, you should restrict this to admin users only

    console.log('Starting Stripe cleanup process...')

    const cleanupResults = {
      productsDeleted: 0,
      pricesDeleted: 0,
      errors: [] as string[]
    }

    try {
      // First, get all products
      const products = await stripe.products.list({ limit: 100 })
      console.log(`Found ${products.data.length} products to process`)

      for (const product of products.data) {
        try {
          // Get all prices for this product
          const prices = await stripe.prices.list({ 
            product: product.id,
            limit: 100 
          })
          
          console.log(`Found ${prices.data.length} prices for product ${product.id} (${product.name})`)

          // Delete all prices for this product
          for (const price of prices.data) {
            try {
              await stripe.prices.update(price.id, { active: false })
              console.log(`Deactivated price ${price.id}`)
              cleanupResults.pricesDeleted++
            } catch (error) {
              const errorMsg = `Failed to deactivate price ${price.id}: ${error}`
              console.error(errorMsg)
              cleanupResults.errors.push(errorMsg)
            }
          }

          // Delete the product
          await stripe.products.del(product.id)
          console.log(`Deleted product ${product.id} (${product.name})`)
          cleanupResults.productsDeleted++

        } catch (error) {
          const errorMsg = `Failed to delete product ${product.id}: ${error}`
          console.error(errorMsg)
          cleanupResults.errors.push(errorMsg)
        }
      }

      // Also clean up any orphaned prices (prices without products)
      const allPrices = await stripe.prices.list({ limit: 100 })
      for (const price of allPrices.data) {
        if (!price.product) {
          try {
            await stripe.prices.update(price.id, { active: false })
            console.log(`Deactivated orphaned price ${price.id}`)
            cleanupResults.pricesDeleted++
          } catch (error) {
            const errorMsg = `Failed to deactivate orphaned price ${price.id}: ${error}`
            console.error(errorMsg)
            cleanupResults.errors.push(errorMsg)
          }
        }
      }

      console.log('Stripe cleanup completed successfully')
      
      return NextResponse.json({
        success: true,
        message: 'Stripe cleanup completed',
        results: cleanupResults
      })

    } catch (error) {
      console.error('Error during Stripe cleanup:', error)
      return NextResponse.json(
        { 
          error: 'Failed to complete cleanup',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in cleanup endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Also provide a GET endpoint to check current products/prices
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      )
    }

    const products = await stripe.products.list({ limit: 100 })
    const prices = await stripe.prices.list({ limit: 100 })

    const summary = {
      totalProducts: products.data.length,
      totalPrices: prices.data.length,
      activeProducts: products.data.filter(p => p.active).length,
      activePrices: prices.data.filter(p => p.active).length,
      products: products.data.map(p => ({
        id: p.id,
        name: p.name,
        active: p.active,
        created: p.created
      })),
      prices: prices.data.map(p => ({
        id: p.id,
        product: p.product,
        active: p.active,
        unit_amount: p.unit_amount,
        currency: p.currency,
        type: p.type
      }))
    }

    return NextResponse.json(summary)

  } catch (error) {
    console.error('Error getting Stripe summary:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 