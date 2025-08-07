#!/bin/bash

# Webhook Testing Script
# Usage: ./test-webhook.sh [test_type]

BASE_URL="http://localhost:3001"
WEBHOOK_URL="$BASE_URL/api/stripe/webhook"
TEST_WEBHOOK_URL="$BASE_URL/api/stripe/test-webhook"

echo "🔧 Webhook Testing Script"
echo "=========================="

# Function to test webhook connectivity
test_connectivity() {
    echo "📡 Testing webhook endpoint connectivity..."
    
    response=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d '{"test": "connectivity"}')
    
    http_status=$(echo "$response" | grep "HTTP_STATUS" | cut -d: -f2)
    
    if [ "$http_status" = "400" ]; then
        echo "✅ Webhook endpoint reachable (400 expected - signature verification)"
    else
        echo "❌ Webhook endpoint issue (status: $http_status)"
        echo "$response"
    fi
}

# Function to test environment variables
test_environment() {
    echo "🔍 Checking environment variables..."
    
    # Load .env file if it exists
    if [ -f ".env" ]; then
        echo "📄 Loading .env file..."
        export $(grep -v '^#' .env | xargs)
    fi
    
    if [ -n "$STRIPE_WEBHOOK_SECRET" ]; then
        echo "✅ STRIPE_WEBHOOK_SECRET configured"
    else
        echo "❌ STRIPE_WEBHOOK_SECRET not found"
    fi
    
    if [ -n "$ADMIN_API_URL" ]; then
        echo "✅ ADMIN_API_URL configured: $ADMIN_API_URL"
    else
        echo "❌ ADMIN_API_URL not found"
    fi
    
    if [ -n "$ADMIN_API_TOKEN" ]; then
        echo "✅ ADMIN_API_TOKEN configured"
    else
        echo "❌ ADMIN_API_TOKEN not found"
    fi
    
    if [ -n "$STRIPE_SECRET_KEY" ]; then
        echo "✅ STRIPE_SECRET_KEY configured"
    else
        echo "❌ STRIPE_SECRET_KEY not found"
    fi
}

# Function to test webhook simulation
test_simulation() {
    echo "🧪 Testing webhook simulation endpoint..."
    
    # Test trial creation
    echo "Testing trial creation simulation..."
    curl -s -X POST "$TEST_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d '{"eventType": "test_trial_creation"}' | jq .
    
    echo ""
    
    # Test payment method attachment
    echo "Testing payment method attachment..."
    curl -s -X POST "$TEST_WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d '{"eventType": "test_payment_method_attached"}' | jq .
}

# Function to test admin API integration
test_admin_integration() {
    echo "🔧 Testing admin API integration..."
    
    ADMIN_TEST_URL="$BASE_URL/api/stripe/test-admin"
    
    # Test admin API connectivity
    echo "1. Testing admin API connectivity..."
    curl -s -X POST "$ADMIN_TEST_URL" \
        -H "Content-Type: application/json" \
        -d '{"testType": "test_admin_connectivity"}' | jq .
    
    echo ""
    
    # Test user find/create
    echo "2. Testing user find/create..."
    curl -s -X POST "$ADMIN_TEST_URL" \
        -H "Content-Type: application/json" \
        -d '{"testType": "test_find_create_user"}' | jq .
    
    echo ""
    
    # Test bot count update
    echo "3. Testing bot count update..."
    curl -s -X POST "$ADMIN_TEST_URL" \
        -H "Content-Type: application/json" \
        -d '{"testType": "test_update_bot_count", "botCount": 5}' | jq .
    
    echo ""
    
    # Test full webhook simulation
    echo "4. Testing full webhook simulation..."
    curl -s -X POST "$ADMIN_TEST_URL" \
        -H "Content-Type: application/json" \
        -d '{"testType": "test_full_webhook_simulation", "botCount": 1}' | jq .
}

# Function to check Stripe CLI
check_stripe_cli() {
    echo "⚡ Checking Stripe CLI..."
    
    if command -v stripe &> /dev/null; then
        echo "✅ Stripe CLI installed"
        echo "💡 To test webhooks with Stripe CLI:"
        echo "   stripe login"
        echo "   stripe listen --forward-to localhost:3001/api/stripe/webhook"
    else
        echo "❌ Stripe CLI not installed"
        echo "💡 Install from: https://stripe.com/docs/stripe-cli"
    fi
}

# Main execution
case "$1" in
    "connectivity")
        test_connectivity
        ;;
    "environment")
        test_environment
        ;;
    "simulation")
        test_simulation
        ;;
    "admin")
        test_admin_integration
        ;;
    "stripe-cli")
        check_stripe_cli
        ;;
    "all"|"")
        test_environment
        echo ""
        test_connectivity
        echo ""
        check_stripe_cli
        echo ""
        echo "💡 To test webhook simulation (requires authentication):"
        echo "   ./test-webhook.sh simulation"
        echo ""
        echo "💡 To test admin API integration (requires authentication):"
        echo "   ./test-webhook.sh admin"
        ;;
    *)
        echo "Usage: $0 [connectivity|environment|simulation|admin|stripe-cli|all]"
        echo ""
        echo "Options:"
        echo "  connectivity  - Test webhook endpoint reachability"
        echo "  environment   - Check environment variables"
        echo "  simulation    - Test webhook simulation endpoint"
        echo "  admin         - Test admin API integration (bot count updates)"
        echo "  stripe-cli    - Check Stripe CLI installation"
        echo "  all           - Run all tests (default)"
        ;;
esac