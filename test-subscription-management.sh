#!/bin/bash

# Subscription Management Testing Script
# Usage: ./test-subscription-management.sh

echo "🔄 Testing Subscription Management Bot Count Updates"
echo "================================================="

# Check if Stripe CLI is available
if ! command -v stripe &> /dev/null; then
    echo "❌ Stripe CLI not found. Please install from: https://stripe.com/docs/stripe-cli"
    exit 1
fi

echo "📡 Testing subscription management webhook scenarios..."

# Test 1: Subscription quantity update (simulates plan upgrade)
echo ""
echo "1️⃣ Testing subscription quantity update..."
echo "   Simulating user changing bot count via Customer Portal"
stripe trigger customer.subscription.updated --add subscription:quantity=10

echo ""
echo "2️⃣ Testing subscription plan change..."
echo "   Simulating user switching between plans"
stripe trigger customer.subscription.updated --add subscription:plan=startup

echo ""
echo "3️⃣ Testing subscription cancellation..."
echo "   Simulating user cancelling subscription"
stripe trigger customer.subscription.updated --add subscription:cancel_at_period_end=true

echo ""
echo "4️⃣ Testing subscription reactivation..."
echo "   Simulating user reactivating cancelled subscription"
stripe trigger customer.subscription.updated --add subscription:cancel_at_period_end=false

echo ""
echo "5️⃣ Testing subscription status change..."
echo "   Simulating trial to active conversion"
stripe trigger customer.subscription.updated --add subscription:status=active

echo ""
echo "✅ All subscription management tests triggered!"
echo ""
echo "📋 What to check:"
echo "1. Monitor your application logs for webhook processing"
echo "2. Look for bot count calculations in webhook logs"
echo "3. Verify bot count updates in your admin API/database"
echo "4. Check that users can create the correct number of bots"
echo ""
echo "🔍 Expected webhook logs:"
echo "   [Webhook] DEBUG: Subscription details for user@example.com:"
echo "   [Webhook] DEBUG: Actual bot count: X"
echo "   [Webhook] DEBUG: Effective bot count: X"
echo "   [Webhook] ✅ User updated successfully. Current bot limit: X"
echo ""
echo "📊 Bot count should match:"
echo "   - API key trial: 1 bot"
echo "   - MVP plan: 1 bot"
echo "   - Startup plan (5 bots): 5 bots"
echo "   - Startup plan (10 bots): 10 bots"
echo "   - Cancelled: 0 bots"