#!/bin/bash

# Webhook Chain Debug Script
# Tests the complete webhook → admin API chain

echo "🔍 DEBUGGING WEBHOOK CHAIN"
echo "=========================="

# Load environment variables
if [ -f ".env" ]; then
    echo "📄 Loading .env file..."
    export $(grep -v '^#' .env | xargs)
fi

echo ""
echo "📋 ENVIRONMENT CHECK:"
echo "- ADMIN_API_URL: ${ADMIN_API_URL:-'NOT SET'}"
echo "- ADMIN_API_TOKEN: ${ADMIN_API_TOKEN:-'NOT SET'}"
echo "- STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET:-'NOT SET'}"
echo "- Next.js app should be running on: http://localhost:3001"
echo "- Admin API should be running on: ${ADMIN_API_URL:-'NOT SET'}"

echo ""
echo "🧪 STEP 1: Test Webhook Endpoint Accessibility"
echo "------------------------------------------------"
webhook_response=$(curl -s -w "HTTP_STATUS:%{http_code}" -X POST http://localhost:3001/api/stripe/webhook \
    -H "Content-Type: application/json" \
    -d '{"test": "connectivity"}')

http_status=$(echo "$webhook_response" | grep "HTTP_STATUS" | cut -d: -f2)
if [ "$http_status" = "400" ]; then
    echo "✅ Webhook endpoint accessible (400 expected - missing signature)"
else
    echo "❌ Webhook endpoint issue (status: $http_status)"
    echo "$webhook_response"
fi

echo ""
echo "🧪 STEP 2: Test Admin API Accessibility"
echo "----------------------------------------"
if [ -n "$ADMIN_API_URL" ]; then
    admin_response=$(curl -s -w "HTTP_STATUS:%{http_code}" "${ADMIN_API_URL}/docs")
    admin_status=$(echo "$admin_response" | grep "HTTP_STATUS" | cut -d: -f2)
    
    if [ "$admin_status" = "200" ]; then
        echo "✅ Admin API accessible"
    else
        echo "❌ Admin API not accessible (status: $admin_status)"
    fi
else
    echo "❌ ADMIN_API_URL not configured"
fi

echo ""
echo "🧪 STEP 3: Test Admin API Authentication"
echo "-----------------------------------------"
if [ -n "$ADMIN_API_URL" ] && [ -n "$ADMIN_API_TOKEN" ]; then
    # Test creating a user
    auth_response=$(curl -s -w "HTTP_STATUS:%{http_code}" -X POST "${ADMIN_API_URL}/admin/users" \
        -H "Content-Type: application/json" \
        -H "X-Admin-API-Key: ${ADMIN_API_TOKEN}" \
        -d '{"email": "webhook-test@example.com", "name": "Webhook Test User"}')
    
    auth_status=$(echo "$auth_response" | grep "HTTP_STATUS" | cut -d: -f2)
    
    if [ "$auth_status" = "201" ]; then
        echo "✅ Admin API authentication works"
        
        # Extract user ID for bot count test
        user_data=$(echo "$auth_response" | sed 's/HTTP_STATUS.*$//')
        user_id=$(echo "$user_data" | jq -r '.id' 2>/dev/null)
        
        if [ "$user_id" != "null" ] && [ -n "$user_id" ]; then
            echo "✅ Created test user with ID: $user_id"
            
            # Test updating bot count
            echo ""
            echo "🧪 STEP 4: Test Bot Count Update"
            echo "---------------------------------"
            update_response=$(curl -s -w "HTTP_STATUS:%{http_code}" -X PATCH "${ADMIN_API_URL}/admin/users/${user_id}" \
                -H "Content-Type: application/json" \
                -H "X-Admin-API-Key: ${ADMIN_API_TOKEN}" \
                -d '{"max_concurrent_bots": 10}')
            
            update_status=$(echo "$update_response" | grep "HTTP_STATUS" | cut -d: -f2)
            
            if [ "$update_status" = "200" ]; then
                echo "✅ Bot count update works"
                
                # Verify the update
                updated_data=$(echo "$update_response" | sed 's/HTTP_STATUS.*$//')
                new_bot_count=$(echo "$updated_data" | jq -r '.max_concurrent_bots' 2>/dev/null)
                echo "✅ New bot count: $new_bot_count"
            else
                echo "❌ Bot count update failed (status: $update_status)"
                echo "$update_response"
            fi
        else
            echo "❌ Could not extract user ID from response"
        fi
    else
        echo "❌ Admin API authentication failed (status: $auth_status)"
        echo "$auth_response"
    fi
else
    echo "❌ Admin API URL or Token not configured"
fi

echo ""
echo "🧪 STEP 5: Test Webhook Debug Endpoint"
echo "---------------------------------------"
debug_response=$(curl -s -w "HTTP_STATUS:%{http_code}" -X POST http://localhost:3001/api/stripe/webhook-debug \
    -H "Content-Type: application/json" \
    -d '{"type": "customer.subscription.updated", "id": "test_debug", "data": {"object": {"id": "sub_test", "customer": "cus_test", "status": "active"}}}')

debug_status=$(echo "$debug_response" | grep "HTTP_STATUS" | cut -d: -f2)
if [ "$debug_status" = "200" ]; then
    echo "✅ Webhook debug endpoint works"
else
    echo "❌ Webhook debug endpoint failed (status: $debug_status)"
fi

echo ""
echo "🧪 STEP 6: Trigger Real Webhook Event"
echo "--------------------------------------"
if command -v stripe &> /dev/null; then
    echo "🔔 Triggering customer.subscription.updated event..."
    stripe trigger customer.subscription.updated
    echo ""
    echo "📋 CHECK YOUR APPLICATION LOGS FOR:"
    echo "   🔔 [Webhook] === WEBHOOK CALL RECEIVED ==="
    echo "   🎯 [Webhook] === SUBSCRIPTION UPDATED EVENT ==="
    echo "   [Webhook] DEBUG: Updating user in admin API"
    echo "   [Webhook] ✅ User updated successfully"
    echo ""
    echo "📋 IF YOU DON'T SEE THESE LOGS:"
    echo "   1. Check if Next.js app is running (npm run dev)"
    echo "   2. Check if Stripe CLI is forwarding to correct URL"
    echo "   3. Check webhook signature verification"
else
    echo "❌ Stripe CLI not available for webhook testing"
fi

echo ""
echo "🎯 SUMMARY"
echo "=========="
echo "✅ = Working correctly"
echo "❌ = Needs attention"
echo ""
echo "If all steps show ✅ but bot counts still don't update:"
echo "1. Check your application logs during webhook triggers"
echo "2. Verify Stripe CLI is forwarding to http://localhost:3001/api/stripe/webhook"
echo "3. Check that handleSubscriptionUpdated function is being called"
echo "4. Verify updateUserInAdminApi function completes successfully"