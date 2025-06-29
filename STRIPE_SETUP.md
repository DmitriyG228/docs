# Stripe Integration Setup Guide

This guide will help you set up Stripe integration for the Vexa pricing page with dynamic bot-based subscriptions.

## Prerequisites

1. A Stripe account ([sign up here](https://dashboard.stripe.com/register))
2. Node.js and npm/pnpm installed

## Installation Steps

### 1. Install Stripe SDK

```bash
cd docs
npm install stripe
# or
pnpm add stripe
```

### 2. Get Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com/)
2. Go to **Developers** → **API keys**
3. Copy your keys:
   - **Publishable key** (starts with `pk_test_` for test mode)
   - **Secret key** (starts with `sk_test_` for test mode)

### 3. Set Up Environment Variables

Create a `.env.local` file in the `docs/` directory:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Existing variables
NEXTAUTH_URL=http://localhost:3001
ADMIN_API_URL=http://localhost:8056
```

### 4. Enable Stripe Integration in Code

Uncomment the Stripe-related code in these files:

#### `/app/api/stripe/create-checkout-session/route.ts`
- Uncomment the Stripe import and initialization
- Uncomment the checkout session creation logic
- Comment out the mock response

#### `/app/api/stripe/webhook/route.ts`
- Uncomment the Stripe import and webhook verification
- Uncomment the event handling logic

### 5. Set Up Webhook Endpoint

1. In your Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set the endpoint URL to: `https://yourdomain.com/api/stripe/webhook`
   - For local development: Use ngrok or similar to expose localhost
4. Select these events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Copy the **Signing secret** and add it to your `.env.local` as `STRIPE_WEBHOOK_SECRET`

### 6. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/pricing` and test the dynamic pricing card
3. Click "Subscribe Now" to test the checkout flow
4. Use Stripe's test card numbers:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

## Pricing Formula

The integration uses this exact pricing formula:

```javascript
function calculatePrice(bots) {
  // Per-bot cost: 10 + 14 * e^(-bots/100)
  const perBotCost = 10 + 14 * Math.exp(-bots / 100);
  let basePrice = Math.round(bots * Math.max(10, perBotCost));
  basePrice = Math.max(120, basePrice);
  
  // Tier discounts
  if (bots >= 180) basePrice = Math.round(basePrice * 0.85); // 15%
  else if (bots >= 30) basePrice = Math.round(basePrice * 0.90); // 10%
  else if (bots >= 5) basePrice = Math.round(basePrice * 0.95); // 5%
  
  return Math.max(120, Math.max(bots * 10, basePrice));
}
```

## Database Integration (TODO)

You'll need to implement subscription management:

1. Store subscription details when `checkout.session.completed` webhook fires
2. Update subscription status when `customer.subscription.updated` fires
3. Handle cancellations when `customer.subscription.deleted` fires
4. Manage failed payments when `invoice.payment_failed` fires

## Production Considerations

1. **Use live keys** in production (start with `pk_live_` and `sk_live_`)
2. **Secure webhook endpoint** with proper signature verification
3. **Database integration** for subscription management
4. **Error handling** and user notifications
5. **Compliance** with PCI DSS requirements (handled by Stripe Checkout)

## Support

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Webhook Testing](https://stripe.com/docs/webhooks/test) 