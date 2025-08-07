# Stripe Webhook Production Setup

## Problem
Stripe CLI `listen` only forwards triggered test events, not real Customer Portal or API subscription changes.

## Solution
Configure a proper webhook endpoint in Stripe Dashboard.

## Steps

### 1. Expose Your Local Webhook (for testing)
```bash
# Install ngrok if you don't have it
sudo snap install ngrok

# Expose your local Next.js server
ngrok http 3001
```

This will give you a public URL like: `https://abc123.ngrok.io`

### 2. Configure Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add Endpoint"
3. Set Endpoint URL to: `https://abc123.ngrok.io/api/stripe/webhook`
4. Select these events:
   - `customer.subscription.created`
   - `customer.subscription.updated` ⭐ **MOST IMPORTANT**
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add Endpoint"

### 3. Update Webhook Secret

Copy the webhook signing secret from the new endpoint and update your `.env`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_NEW_SECRET_FROM_DASHBOARD
```

### 4. Test Real Customer Portal

1. Start ngrok: `ngrok http 3001`
2. Update webhook endpoint URL in Stripe Dashboard
3. Go to Customer Portal and change subscription
4. Check webhook logs for real events

## Alternative for Production

For production, you'll need:
1. Public domain/server for your webhook endpoint
2. HTTPS certificate
3. Webhook endpoint configured in Stripe Dashboard

## Verification

Once configured, subscription changes via Customer Portal will trigger real webhooks that update bot counts correctly.