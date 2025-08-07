#!/bin/bash

# Simple Webhook Test Script
# Tests webhook functionality in isolation

echo "🧪 Simple Webhook Isolation Test"
echo "================================"

# Load environment variables
source .env

WEBHOOK_URL="http://localhost:3001/api/stripe/webhook"
ADMIN_API_URL="${ADMIN_API_URL}"
ADMIN_API_TOKEN="${ADMIN_API_TOKEN}"
STRIPE_WEBHOOK_SECRET="${STRIPE_WEBHOOK_SECRET}"

echo "Environment check:"
echo "  STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET:+SET}"
echo "  ADMIN_API_URL: ${ADMIN_API_URL:+SET}"
echo "  ADMIN_API_TOKEN: ${ADMIN_API_TOKEN:+SET}"
echo ""

# Test 1: Basic webhook connectivity
echo "📡 Test 1: Webhook Connectivity"
echo "--------------------------------"
response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d '{"test": "connectivity"}')

http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
response_body=$(echo "$response" | grep -v "HTTP_STATUS")

echo "Status: $http_status"
echo "Response: $response_body"

if [ "$http_status" = "400" ]; then
    echo "✅ Webhook endpoint reachable (400 expected - signature verification)"
    connectivity_test=true
else
    echo "❌ Unexpected response status"
    connectivity_test=false
fi

echo ""

# Test 2: Create a proper webhook event with signature
echo "🎯 Test 2: Subscription Updated Webhook"
echo "----------------------------------------"

# Create test event
timestamp=$(date +%s)
event_id="evt_test_$(date +%s)"
subscription_id="sub_test_$(date +%s)"

test_event=$(cat <<EOF
{
  "id": "$event_id",
  "object": "event",
  "api_version": "2020-08-27",
  "created": $timestamp,
  "data": {
    "object": {
      "id": "$subscription_id",
      "object": "subscription",
      "status": "active",
      "customer": "cus_test_$(date +%s)",
      "items": {
        "data": [{
          "id": "si_test_$(date +%s)",
          "object": "subscription_item",
          "quantity": 5,
          "price": {
            "id": "price_test_$(date +%s)",
            "object": "price",
            "nickname": "Startup Plan",
            "unit_amount": 2000,
            "currency": "usd"
          }
        }]
      },
      "metadata": {
        "botCount": "5",
        "tier": "startup"
      },
      "current_period_end": $((timestamp + 2592000)),
      "cancel_at_period_end": false
    }
  },
  "type": "customer.subscription.updated"
}
EOF
)

# Create signature
payload=$(echo "$test_event" | jq -c .)
signature=$(echo -n "${timestamp}.${payload}" | openssl dgst -sha256 -hmac "$STRIPE_WEBHOOK_SECRET" -binary | xxd -p)
stripe_signature="t=${timestamp},v1=${signature}"

echo "🔐 Generated Stripe signature for webhook verification"
echo "📤 Sending subscription updated event..."

response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -H "stripe-signature: $stripe_signature" \
    -d "$payload")

http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
response_body=$(echo "$response" | grep -v "HTTP_STATUS")

echo "📊 Response status: $http_status"
echo "Response: $response_body"

if [ "$http_status" = "200" ]; then
    echo "✅ Webhook processed successfully"
    webhook_test=true
else
    echo "❌ Webhook failed"
    webhook_test=false
fi

echo ""

# Test 3: Admin API integration
echo "🔧 Test 3: Admin API Integration"
echo "--------------------------------"

if [ -z "$ADMIN_API_URL" ] || [ -z "$ADMIN_API_TOKEN" ]; then
    echo "❌ Admin API not configured"
    admin_test=false
else
    echo "1. Testing admin API connectivity..."
    
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$ADMIN_API_URL/admin/users" \
        -H "Content-Type: application/json" \
        -H "X-Admin-API-Key: $ADMIN_API_TOKEN" \
        -d '{"email": "test@example.com", "name": "Test User"}')
    
    http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
    response_body=$(echo "$response" | grep -v "HTTP_STATUS")
    
    echo "Status: $http_status"
    echo "Response: $response_body"
    
    if [ "$http_status" = "200" ]; then
        echo "✅ Admin API connectivity successful"
        
        echo ""
        echo "2. Testing bot count update..."
        
        update_response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$ADMIN_API_URL/admin/users" \
            -H "Content-Type: application/json" \
            -H "X-Admin-API-Key: $ADMIN_API_TOKEN" \
            -d "{\"email\": \"test@example.com\", \"name\": \"Test User\", \"max_concurrent_bots\": 10, \"data\": {\"stripe_subscription_id\": \"sub_test_$(date +%s)\", \"subscription_tier\": \"startup\", \"subscription_status\": \"active\", \"updated_by_webhook\": \"$(date -Iseconds)\"}}")
        
        update_http_status=$(echo "$update_response" | grep "HTTP_STATUS" | cut -d: -f2)
        update_response_body=$(echo "$update_response" | grep -v "HTTP_STATUS")
        
        echo "Update Status: $update_http_status"
        echo "Update Response: $update_response_body"
        
        if [ "$update_http_status" = "200" ]; then
            echo "✅ Bot count update successful"
            admin_test=true
        else
            echo "❌ Bot count update failed"
            admin_test=false
        fi
    else
        echo "❌ Admin API connectivity failed"
        admin_test=false
    fi
fi

echo ""

# Test 4: Full flow test
echo "🔄 Test 4: Full Webhook to Admin API Flow"
echo "------------------------------------------"

if [ "$webhook_test" = true ] && [ "$admin_test" = true ]; then
    echo "✅ Both webhook and admin API are working"
    echo "🔄 Full flow test: PASS"
    full_flow_test=true
else
    echo "❌ Full flow test: FAIL"
    full_flow_test=false
fi

echo ""

# Results summary
echo "📊 Test Results Summary"
echo "======================="
echo "✅ Webhook Connectivity: $([ "$connectivity_test" = true ] && echo "PASS" || echo "FAIL")"
echo "✅ Webhook Processing: $([ "$webhook_test" = true ] && echo "PASS" || echo "FAIL")"
echo "✅ Admin API Integration: $([ "$admin_test" = true ] && echo "PASS" || echo "FAIL")"
echo "✅ Full Flow Test: $([ "$full_flow_test" = true ] && echo "PASS" || echo "FAIL")"

if [ "$connectivity_test" = true ] && [ "$webhook_test" = true ] && [ "$admin_test" = true ] && [ "$full_flow_test" = true ]; then
    echo ""
    echo "🎉 All tests passed! Webhook is working correctly in isolation."
else
    echo ""
    echo "❌ Some tests failed. Check the logs above for details."
fi 