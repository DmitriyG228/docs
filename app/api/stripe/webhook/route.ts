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
        console.log(`[Webhook] DEBUG: Processing customer.subscription.updated`)
        console.log(`[Webhook] DEBUG: Full subscription object:`, JSON.stringify(event.data.object, null, 2))
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted':
        console.log(`[Webhook] DEBUG: Processing customer.subscription.deleted`)
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
        break
      case 'invoice.payment_failed':
        console.log(`[Webhook] DEBUG: Processing invoice.payment_failed`)
        handlePaymentFailed(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_succeeded':
        console.log(`[Webhook] DEBUG: Processing invoice.payment_succeeded`)
        // Payment succeeded - no action needed as subscription updates are handled by subscription events
        break
      case 'invoiceitem.created':
        console.log(`[Webhook] DEBUG: Processing invoiceitem.created`)
        // Invoice item created (usually for prorations) - no action needed
        break
      default:
        console.log(`[Webhook] DEBUG: Unhandled event type: ${event.type}`)
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
  originalBotCount?: number
  preserveBotCount?: boolean
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
    ...(subscriptionData.preserveBotCount ? {} : { max_concurrent_bots: subscriptionData.botCount }),
    data: {
      stripe_subscription_id: subscriptionData.subscriptionId,
      subscription_tier: subscriptionData.tier,
      subscription_status: subscriptionData.status,
      subscription_end_date: subscriptionData.nextPaymentDate,
      updated_by_webhook: new Date().toISOString(),
      ...(subscriptionData.originalBotCount && { original_bot_count: subscriptionData.originalBotCount }),
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

  // Get bot count from subscription metadata first, then fall back to item quantity
  const botCountFromMetadata = subscription.metadata?.botCount ? parseInt(subscription.metadata.botCount, 10) : null
  const botCountFromItem = item.quantity || 0
  const actualBotCount = botCountFromMetadata || botCountFromItem || 1 // Default to 1 if nothing found

  // Determine the correct status and bot count based on subscription state
  const isFullyCanceled = subscription.status === 'canceled'
  const isCancelledAtPeriodEnd = subscription.cancel_at_period_end
  const isActive = subscription.status === 'active'
  
  // Calculate the effective status and bot count
  let effectiveStatus: string
  let effectiveBotCount: number
  
  if (isFullyCanceled) {
    // Subscription is fully cancelled - no access (grace period ended)
    effectiveStatus = 'canceled'
    effectiveBotCount = 0
  } else if (isCancelledAtPeriodEnd && isActive) {
    // Cancelled but still active until period end - keep access (grace period)
    effectiveStatus = 'cancelling'
    effectiveBotCount = actualBotCount // Keep original bot count during grace period
  } else if (isActive) {
    // Normal active subscription
    effectiveStatus = 'active'
    effectiveBotCount = actualBotCount
  } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
    // Payment issues - no access
    effectiveStatus = subscription.status
    effectiveBotCount = 0
  } else {
    // Other statuses - keep current bot count unless explicitly cancelled
    effectiveStatus = subscription.status
    effectiveBotCount = actualBotCount
  }
  
  console.log(`[Webhook] DEBUG: Subscription details for ${customer.email}:`)
  console.log(`  - Status: ${subscription.status}`)
  console.log(`  - Cancel at period end: ${subscription.cancel_at_period_end}`)
  console.log(`  - Canceled at: ${subscription.canceled_at}`)
  console.log(`  - Current period end: ${(subscription as any).current_period_end}`)
  console.log(`  - Item quantity: ${item.quantity}`)
  console.log(`  - Bot count from metadata: ${botCountFromMetadata}`)
  console.log(`  - Bot count from item: ${botCountFromItem}`)
  console.log(`  - Actual bot count: ${actualBotCount}`)
  console.log(`  - Is fully canceled: ${isFullyCanceled}`)
  console.log(`  - Is cancelled at period end: ${isCancelledAtPeriodEnd}`)
  console.log(`  - Effective status: ${effectiveStatus}`)
  console.log(`  - Effective bot count: ${effectiveBotCount}`)
  console.log(`  - Subscription metadata:`, JSON.stringify(subscription.metadata, null, 2))
  
  // Log the transition if this is the end of grace period
  if (isFullyCanceled && subscription.canceled_at) {
    const canceledAt = new Date(subscription.canceled_at * 1000)
    console.log(`[Webhook] INFO: Grace period ended for ${customer.email} at ${canceledAt.toISOString()}`)
  }
  
  await updateUserInAdminApi({
    email: customer.email,
    botCount: effectiveBotCount,
    subscriptionId: subscription.id,
    tier: item.price.nickname || undefined,
    status: effectiveStatus,
    nextPaymentDate: effectiveStatus === 'active' ? nextPaymentDate : null,
    // Store original bot count in metadata for grace period display
    originalBotCount: isCancelledAtPeriodEnd ? actualBotCount : undefined,
    // Don't update bot count during grace period - keep existing value
    preserveBotCount: isCancelledAtPeriodEnd,
  })
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customer = await stripe.customers.retrieve(subscription.customer as string)
  if (customer.deleted || !customer.email) return

  console.log(`[Webhook] DEBUG: Handling subscription cancellation for ${customer.email}.`)
  console.log(`[Webhook] DEBUG: Subscription ID: ${subscription.id}, Status: ${subscription.status}`)
  
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