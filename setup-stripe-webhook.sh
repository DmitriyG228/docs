#!/bin/bash

# Setup Stripe Webhook Configuration
# This script sets up a proper webhook endpoint in Stripe Dashboard

echo "🔧 Setting up Stripe Webhook Configuration"
echo "=========================================="

# Check if ngrok is available
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed. Please install ngrok first."
    echo "   Download from: https://ngrok.com/download"
    exit 1
fi

# Check if Next.js app is running
if ! curl -s http://localhost:3001 > /dev/null; then
    echo "❌ Next.js app is not running on localhost:3001"
    echo "   Please start your app with: npm run dev"
    exit 1
fi

echo "✅ Next.js app is running on localhost:3001"

# Start ngrok to expose the webhook
echo "🚀 Starting ngrok to expose webhook endpoint..."
ngrok http 3001 > ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
echo "⏳ Waiting for ngrok to start..."
sleep 5

# Get the ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url')

if [ -z "$NGROK_URL" ] || [ "$NGROK_URL" = "null" ]; then
    echo "❌ Failed to get ngrok URL"
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

WEBHOOK_URL="${NGROK_URL}/api/stripe/webhook"
echo "✅ ngrok URL: $NGROK_URL"
echo "✅ Webhook URL: $WEBHOOK_URL"

# List of events that your webhook handles
EVENTS=(
    "checkout.session.completed"
    "customer.subscription.created"
    "customer.subscription.updated"
    "customer.subscription.deleted"
    "customer.subscription.trial_will_end"
    "customer.updated"
    "payment_method.attached"
    "payment_method.detached"
    "invoice.payment_failed"
    "invoice.payment_succeeded"
    "invoice.upcoming"
)

echo ""
echo "📋 Events to configure:"
for event in "${EVENTS[@]}"; do
    echo "   - $event"
done

echo ""
echo "🔧 Creating webhook endpoint in Stripe Dashboard..."

# Create webhook endpoint using Stripe CLI
WEBHOOK_RESPONSE=$(stripe webhook_endpoints create \
    --url "$WEBHOOK_URL" \
    --events "${EVENTS[@]}" \
    --description "Local development webhook for Customer Portal testing" \
    2>&1)

if [ $? -eq 0 ]; then
    echo "✅ Webhook endpoint created successfully!"
    echo "$WEBHOOK_RESPONSE" | jq .
    
    # Extract webhook secret
    NEW_WEBHOOK_SECRET=$(echo "$WEBHOOK_RESPONSE" | jq -r '.secret')
    
    if [ "$NEW_WEBHOOK_SECRET" != "null" ] && [ "$NEW_WEBHOOK_SECRET" != "" ]; then
        echo ""
        echo "🔐 New webhook secret: $NEW_WEBHOOK_SECRET"
        echo ""
        echo "📝 Update your .env file with:"
        echo "STRIPE_WEBHOOK_SECRET=$NEW_WEBHOOK_SECRET"
        echo ""
        echo "⚠️  IMPORTANT: This webhook secret is different from the Stripe CLI secret!"
        echo "   - Stripe CLI secret: for local testing only"
        echo "   - Dashboard webhook secret: for real events from your app"
    fi
else
    echo "❌ Failed to create webhook endpoint:"
    echo "$WEBHOOK_RESPONSE"
fi

echo ""
echo "🧪 Testing webhook endpoint..."

# Test the webhook endpoint
TEST_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
    -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d '{"test": "connectivity"}')

HTTP_STATUS=$(echo "$TEST_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
RESPONSE_BODY=$(echo "$TEST_RESPONSE" | grep -v "HTTP_STATUS")

echo "📊 Test response status: $HTTP_STATUS"
echo "📋 Test response body: $RESPONSE_BODY"

if [ "$HTTP_STATUS" = "400" ]; then
    echo "✅ Webhook endpoint is reachable (400 expected - signature verification)"
else
    echo "❌ Webhook endpoint test failed"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Update your .env file with the new webhook secret"
echo "2. Test real events from your app (Customer Portal, etc.)"
echo "3. Monitor webhook logs in your application"
echo ""
echo "💡 To stop ngrok: kill $NGROK_PID"
echo "💡 To view ngrok logs: tail -f ngrok.log"
echo "💡 To view webhook logs: tail -f stripe-cli.log" 