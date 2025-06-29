import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// --- WEBHOOK HANDLER ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured.')
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )

    console.log(`[Webhook] DEBUG: Received event type: ${event.type}`)
    console.log(`[Webhook] DEBUG: Event data:`, JSON.stringify(event.data, null, 2))

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        console.log(`[Webhook] DEBUG: Processing checkout.session.completed`)
        await handleSuccessfulPayment(event.data.object as Stripe.Checkout.Session)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_failed':
        handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error.message)
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 })
  }
}

// --- ADMIN API INTEGRATION ---
export async function updateUserInAdminApi(subscriptionData: {
  email: string
  botCount: number
  subscriptionId?: string
  tier?: string
  status: string
  nextPaymentDate?: string | null
}) {
  const adminApiUrl = process.env.ADMIN_API_URL
  const adminApiToken = process.env.ADMIN_API_TOKEN

  if (!adminApiUrl || !adminApiToken) {
    throw new Error('Admin API URL or Token is not configured.')
  }

  // 1. Find or create the user by email to get their ID
  const userResponse = await fetch(`${adminApiUrl}/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-API-Key': adminApiToken,
    },
    body: JSON.stringify({
      email: subscriptionData.email,
      name: subscriptionData.email.split('@')[0],
    }),
  })

  if (!userResponse.ok) {
    const errorBody = await userResponse.text()
    throw new Error(`Failed to find/create user: ${userResponse.status} ${errorBody}`)
  }

  const user = await userResponse.json()
  console.log(`[Webhook] Found/created user: ${user.email} (ID: ${user.id})`)

  // 2. Update the user's bot count and subscription data
  const updatePayload = {
    max_concurrent_bots: subscriptionData.botCount,
    data: {
      stripe_subscription_id: subscriptionData.subscriptionId,
      subscription_tier: subscriptionData.tier,
      subscription_status: subscriptionData.status,
      subscription_end_date: subscriptionData.nextPaymentDate,
      updated_by_webhook: new Date().toISOString(),
    },
  }

  const updateResponse = await fetch(`${adminApiUrl}/admin/users/${user.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-API-Key': adminApiToken,
    },
    body: JSON.stringify(updatePayload),
  })

  if (!updateResponse.ok) {
    const errorBody = await updateResponse.text()
    throw new Error(`Failed to update user: ${updateResponse.status} ${errorBody}`)
  }

  const updatedUser = await updateResponse.json()
  console.log(`[Webhook] ✅ User ${updatedUser.email} updated successfully. Bots: ${updatedUser.max_concurrent_bots}, Status: ${subscriptionData.status}`)
}

// --- EVENT HANDLERS ---
async function handleSuccessfulPayment(session: Stripe.Checkout.Session) {
  console.log(`[Webhook] DEBUG: Full session object:`, JSON.stringify(session, null, 2))
  
  const { userEmail, botCount, tier } = session.metadata || {}
  
  console.log(`[Webhook] DEBUG: Extracted metadata - userEmail: ${userEmail}, botCount: ${botCount}, tier: ${tier}`)

  if (!userEmail || !botCount) {
    console.error('[Webhook] Missing userEmail or botCount in session metadata.')
    console.error('[Webhook] DEBUG: Available metadata:', session.metadata)
    return
  }

  // Retrieve the subscription to get next payment date
  let nextPaymentDate: string | null = null
  if (session.subscription) {
    const subscriptionRes = await stripe.subscriptions.retrieve(session.subscription as string)
    const currentPeriodEnd = (subscriptionRes as any).current_period_end as number | undefined
    nextPaymentDate = currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null
  }

  console.log(`[Webhook] Handling successful payment for ${userEmail}.`)
  await updateUserInAdminApi({
    email: userEmail,
    botCount: parseInt(botCount, 10),
    subscriptionId: session.subscription as string,
    tier,
    status: 'active',
    nextPaymentDate,
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string)
  if (customer.deleted || !customer.email) return

  const item = subscription.items.data[0]
  if (!item) return

  const nextPaymentDate = (subscription as any).current_period_end
    ? new Date((subscription as any).current_period_end * 1000).toISOString()
    : null

  console.log(`[Webhook] Handling subscription update for ${customer.email}.`)
  await updateUserInAdminApi({
    email: customer.email,
    botCount: item.quantity || 0, // Assuming quantity represents bot count
    subscriptionId: subscription.id,
    tier: item.price.nickname || undefined,
    status: subscription.status,
    nextPaymentDate,
  })
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string)
  if (customer.deleted || !customer.email) return

  console.log(`[Webhook] Handling subscription cancellation for ${customer.email}.`)
  await updateUserInAdminApi({
    email: customer.email,
    botCount: 0, // Set bot count to 0 on cancellation
    subscriptionId: subscription.id,
    status: 'canceled',
    nextPaymentDate: null,
  })
}

function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Webhook] Payment failed for invoice: ${invoice.id}`)
  // Optional: Add logic to notify user or suspend service after multiple failures
} 