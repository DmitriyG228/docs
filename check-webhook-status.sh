#!/bin/bash
# Webhook endpoint status checker
source .env

echo "🔍 WEBHOOK ENDPOINT STATUS CHECK"
echo "================================="

# 1. Check if Next.js is running
echo "1. Next.js Server Status:"
if curl -s http://localhost:3001/api/stripe/webhook >/dev/null 2>&1; then
    echo "   ✅ Next.js server responding on port 3001"
else
    echo "   ❌ Next.js server not responding on port 3001"
fi

# 2. Check webhook endpoint specifically
echo "2. Webhook Endpoint Status:"
WEBHOOK_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/api/stripe/webhook -H "Content-Type: application/json" -d '{}')
if [ "$WEBHOOK_RESPONSE" = "400" ]; then
    echo "   ✅ Webhook endpoint working (returns 400 - needs Stripe signature)"
else
    echo "   ❌ Webhook endpoint issue (returned: $WEBHOOK_RESPONSE)"
fi

# 3. Check Stripe CLI listener
echo "3. Stripe CLI Listener:"
if pgrep -f "stripe listen" > /dev/null; then
    echo "   ✅ Stripe CLI listener is running"
else
    echo "   ❌ Stripe CLI listener is not running"
fi

# 4. Check environment variables
echo "4. Environment Configuration:"
[ -n "$STRIPE_SECRET_KEY" ] && echo "   ✅ STRIPE_SECRET_KEY configured" || echo "   ❌ STRIPE_SECRET_KEY missing"
[ -n "$STRIPE_WEBHOOK_SECRET" ] && echo "   ✅ STRIPE_WEBHOOK_SECRET configured" || echo "   ❌ STRIPE_WEBHOOK_SECRET missing"
[ -n "$ADMIN_API_URL" ] && echo "   ✅ ADMIN_API_URL configured ($ADMIN_API_URL)" || echo "   ❌ ADMIN_API_URL missing"
[ -n "$ADMIN_API_TOKEN" ] && echo "   ✅ ADMIN_API_TOKEN configured" || echo "   ❌ ADMIN_API_TOKEN missing"

# 5. Test admin API connectivity
echo "5. Admin API Status:"
if curl -s -o /dev/null -w "%{http_code}" -X POST "$ADMIN_API_URL/admin/users" -H "Content-Type: application/json" -H "X-Admin-API-Key: $ADMIN_API_TOKEN" -d '{"email": "test@test.com", "name": "test"}' | grep -q "200"; then
    echo "   ✅ Admin API reachable and authenticated"
else
    echo "   ❌ Admin API connection issue"
fi

echo ""
echo "🎯 WEBHOOK CHAIN STATUS:"
if [ -n "$STRIPE_WEBHOOK_SECRET" ] && pgrep -f "stripe listen" > /dev/null && [ "$WEBHOOK_RESPONSE" = "400" ]; then
    echo "   🎉 FULLY OPERATIONAL - Ready to process webhooks!"
else
    echo "   ⚠️  ISSUES DETECTED - Check above for problems"
fi