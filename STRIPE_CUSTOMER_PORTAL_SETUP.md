# Stripe Customer Portal Setup Guide

## Overview

You already have Stripe Customer Portal integration in your code, but it needs to be properly configured in your Stripe Dashboard to allow users to create and modify subscriptions directly.

## Current Implementation Status ✅

Your app already has:
- ✅ **Portal Session Creation**: `/api/stripe/create-portal-session`
- ✅ **Dashboard Integration**: Button to open portal 
- ✅ **Authentication**: Only authenticated users can access
- ✅ **Return URL**: Users return to dashboard after portal

## Required Stripe Dashboard Configuration

### 1. Enable Customer Portal in Stripe Dashboard

**Steps:**
1. **Login to Stripe Dashboard**: https://dashboard.stripe.com
2. **Navigate to Settings** → **Billing** → **Customer Portal**
3. **Click "Activate" or "Enable Customer Portal"**

### 2. Configure Portal Features

**Essential Features to Enable:**

#### **A. Subscription Management**
```
✅ Update subscriptions
✅ Cancel subscriptions  
✅ Switch plans
✅ Pause subscriptions (optional)
✅ Resume subscriptions (optional)
```

#### **B. Payment Methods**
```
✅ Update payment methods
✅ Add payment methods
✅ Remove payment methods
✅ Set default payment method
```

#### **C. Billing History**
```
✅ View invoices
✅ Download invoices
✅ View payment history
```

#### **D. Customer Information**
```
✅ Update customer details
✅ Update billing address
✅ Update tax ID (if needed)
```

### 3. Configure Portal Settings

#### **A. Business Settings**
- **Business Name**: "Vexa.ai" or your company name
- **Support Email**: Your support email
- **Support Phone**: Your support phone (optional)
- **Privacy Policy URL**: Your privacy policy URL
- **Terms of Service URL**: Your terms of service URL

#### **B. Appearance**
- **Portal Theme**: Choose colors that match your brand
- **Logo**: Upload your company logo
- **Primary Color**: Match your app's primary color

#### **C. Features Configuration**

**Subscription Changes:**
```
✅ Allow customers to switch plans
✅ Allow customers to update quantities  
✅ Allow customers to cancel subscriptions
✅ Enable proration (recommended)
✅ Allow immediate changes (vs end of period)
```

**Payment Methods:**
```
✅ Allow customers to update payment methods
✅ Require payment method for trials
✅ Allow multiple payment methods
```

**Invoices:**
```
✅ Allow customers to view invoices
✅ Allow customers to download invoices
✅ Show payment history
```

### 4. Configure Return URLs

In the Portal settings, set:
- **Default Return URL**: `https://yourdomain.com/dashboard`
- **Allow Custom Return URLs**: ✅ (your code already sets this)

### 5. Test Portal Configuration

#### **Option 1: Using Your Test Endpoint**
```bash
# Test portal configuration
curl -X GET "http://localhost:3001/api/stripe/test-config"
```

#### **Option 2: Using Stripe CLI**
```bash
# Test with Stripe CLI
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

#### **Option 3: Manual Testing**
1. Create a test customer with subscription
2. Use your dashboard to open billing portal
3. Verify all features work as expected

## Enhanced Portal Integration Options

### 1. Add Subscription Creation to Portal

**Current Limitation**: Your portal currently only works for existing customers. To allow new subscriptions:

#### **Option A: Use Stripe Checkout for New Subscriptions**
Keep your current pricing page that redirects to Stripe Checkout for new subscriptions.

#### **Option B: Enhanced Portal Configuration**
Configure portal to allow subscription creation:

```javascript
// Enhanced portal session creation
const portalSession = await stripe.billingPortal.sessions.create({
  customer: customer.id,
  return_url: `${request.headers.get('origin')}/dashboard`,
  flow_data: {
    type: 'subscription_update_confirm',
    subscription_update_confirm: {
      subscription: subscriptionId,
      items: [
        {
          id: subscriptionItemId,
          quantity: newQuantity,
        },
      ],
    },
  },
})
```

### 2. Configure Portal for Different User Types

#### **For Trial Users**
```javascript
// Portal configuration for trial users
const portalSession = await stripe.billingPortal.sessions.create({
  customer: customer.id,
  return_url: `${request.headers.get('origin')}/dashboard`,
  flow_data: {
    type: 'payment_method_update',
  },
})
```

#### **For Active Subscribers**
```javascript
// Full portal access for active subscribers
const portalSession = await stripe.billingPortal.sessions.create({
  customer: customer.id,
  return_url: `${request.headers.get('origin')}/dashboard`,
  // Full access to all portal features
})
```

## Webhook Configuration

To keep your app synchronized with portal changes:

### 1. Configure Webhooks in Stripe Dashboard

**Essential Events:**
```
✅ customer.subscription.created
✅ customer.subscription.updated  
✅ customer.subscription.deleted
✅ customer.subscription.trial_will_end
✅ invoice.payment_succeeded
✅ invoice.payment_failed
✅ customer.updated
```

### 2. Update Your Webhook Handler

Your existing webhook at `/api/stripe/webhook` should handle these events to sync portal changes with your database.

## Testing Checklist

### ✅ **Portal Access**
- [ ] Trial users can access portal
- [ ] Active subscribers can access portal  
- [ ] Portal denies access to non-customers

### ✅ **Subscription Management**
- [ ] Users can upgrade/downgrade plans
- [ ] Users can change bot quantities
- [ ] Users can cancel subscriptions
- [ ] Users can reactivate cancelled subscriptions

### ✅ **Payment Methods**
- [ ] Users can add payment methods
- [ ] Users can update payment methods
- [ ] Users can set default payment method
- [ ] Trial users can add payment method to continue

### ✅ **Billing History**
- [ ] Users can view invoices
- [ ] Users can download invoices
- [ ] Payment history is accurate

### ✅ **Integration**
- [ ] Portal returns to dashboard correctly
- [ ] Changes sync with your app database
- [ ] UI updates reflect portal changes

## Common Issues & Solutions

### Issue 1: "Portal Not Configured"
**Solution**: Enable Customer Portal in Stripe Dashboard settings

### Issue 2: "Customer Cannot Access Portal"
**Solution**: Ensure customer has at least one subscription or payment method

### Issue 3: "Portal Missing Features"
**Solution**: Check portal feature configuration in Stripe Dashboard

### Issue 4: "Styling Doesn't Match"
**Solution**: Customize portal appearance in Stripe Dashboard

### Issue 5: "Changes Not Reflected in App"
**Solution**: Ensure webhooks are properly configured and handled

## Next Steps

1. **Configure Portal in Stripe Dashboard** (most important)
2. **Test with real/test data**
3. **Customize portal appearance**
4. **Configure webhooks for synchronization**
5. **Test all user flows**

Once configured, users will be able to:
- **Create new subscriptions** (via your pricing page + Stripe Checkout)
- **Modify existing subscriptions** (via Customer Portal)
- **Add payment methods** (via Customer Portal)
- **View billing history** (via Customer Portal)
- **Manage account details** (via Customer Portal)

This creates a complete self-service experience for your users! 🚀