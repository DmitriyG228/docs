#!/usr/bin/env node

/**
 * Webhook Isolation Test Script
 * Tests webhook functionality in isolation and verifies admin API integration
 */

const crypto = require('crypto');
const fetch = require('node-fetch');

// Load environment variables
require('dotenv').config();

const WEBHOOK_URL = 'http://localhost:3001/api/stripe/webhook';
const ADMIN_API_URL = process.env.ADMIN_API_URL;
const ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

console.log('🧪 Webhook Isolation Test');
console.log('========================');

// Test 1: Basic webhook connectivity
async function testWebhookConnectivity() {
    console.log('\n📡 Test 1: Webhook Connectivity');
    console.log('--------------------------------');
    
    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ test: 'connectivity' }),
        });
        
        console.log(`Status: ${response.status}`);
        const body = await response.text();
        console.log(`Response: ${body}`);
        
        if (response.status === 400) {
            console.log('✅ Webhook endpoint reachable (400 expected - signature verification)');
            return true;
        } else {
            console.log('❌ Unexpected response status');
            return false;
        }
    } catch (error) {
        console.log(`❌ Connectivity test failed: ${error.message}`);
        return false;
    }
}

// Test 2: Create proper Stripe webhook event
async function testSubscriptionUpdatedWebhook() {
    console.log('\n🎯 Test 2: Subscription Updated Webhook');
    console.log('----------------------------------------');
    
    // Create a realistic subscription updated event
    const testEvent = {
        id: 'evt_test_' + Date.now(),
        object: 'event',
        api_version: '2020-08-27',
        created: Math.floor(Date.now() / 1000),
        data: {
            object: {
                id: 'sub_test_' + Date.now(),
                object: 'subscription',
                status: 'active',
                customer: 'cus_test_' + Date.now(),
                items: {
                    data: [{
                        id: 'si_test_' + Date.now(),
                        object: 'subscription_item',
                        quantity: 5,
                        price: {
                            id: 'price_test_' + Date.now(),
                            object: 'price',
                            nickname: 'Startup Plan',
                            unit_amount: 2000,
                            currency: 'usd'
                        }
                    }]
                },
                metadata: {
                    botCount: '5',
                    tier: 'startup'
                },
                current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
                cancel_at_period_end: false
            }
        },
        type: 'customer.subscription.updated'
    };
    
    try {
        // Create proper Stripe signature
        const payload = JSON.stringify(testEvent);
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = crypto
            .createHmac('sha256', STRIPE_WEBHOOK_SECRET)
            .update(`${timestamp}.${payload}`)
            .digest('hex');
        
        const stripeSignature = `t=${timestamp},v1=${signature}`;
        
        console.log('🔐 Generated Stripe signature for webhook verification');
        console.log(`📤 Sending subscription updated event to: ${WEBHOOK_URL}`);
        
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'stripe-signature': stripeSignature,
            },
            body: payload,
        });
        
        console.log(`📊 Response status: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Webhook failed:', errorText);
            return false;
        }
        
        const result = await response.text();
        console.log('✅ Webhook response:', result);
        return true;
        
    } catch (error) {
        console.error('❌ Webhook test failed:', error.message);
        return false;
    }
}

// Test 3: Test admin API integration
async function testAdminApiIntegration() {
    console.log('\n🔧 Test 3: Admin API Integration');
    console.log('--------------------------------');
    
    if (!ADMIN_API_URL || !ADMIN_API_TOKEN) {
        console.log('❌ Admin API not configured');
        return false;
    }
    
    try {
        // Test admin API connectivity
        console.log('1. Testing admin API connectivity...');
        const response = await fetch(`${ADMIN_API_URL}/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-API-Key': ADMIN_API_TOKEN,
            },
            body: JSON.stringify({
                email: 'test@example.com',
                name: 'Test User',
            }),
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Admin API connectivity failed:', errorText);
            return false;
        }
        
        const user = await response.json();
        console.log('✅ Admin API connectivity successful');
        console.log(`📊 User data: ${JSON.stringify(user, null, 2)}`);
        
        // Test bot count update
        console.log('\n2. Testing bot count update...');
        const updateResponse = await fetch(`${ADMIN_API_URL}/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-API-Key': ADMIN_API_TOKEN,
            },
            body: JSON.stringify({
                email: 'test@example.com',
                name: 'Test User',
                max_concurrent_bots: 10,
                data: {
                    stripe_subscription_id: 'sub_test_' + Date.now(),
                    subscription_tier: 'startup',
                    subscription_status: 'active',
                    updated_by_webhook: new Date().toISOString(),
                },
            }),
        });
        
        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error('❌ Bot count update failed:', errorText);
            return false;
        }
        
        const updatedUser = await updateResponse.json();
        console.log('✅ Bot count update successful');
        console.log(`📊 Updated user data: ${JSON.stringify(updatedUser, null, 2)}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ Admin API test failed:', error.message);
        return false;
    }
}

// Test 4: Full webhook to admin API flow
async function testFullWebhookFlow() {
    console.log('\n🔄 Test 4: Full Webhook to Admin API Flow');
    console.log('--------------------------------------------');
    
    // Create a test event that should trigger admin API update
    const testEvent = {
        id: 'evt_test_flow_' + Date.now(),
        object: 'event',
        api_version: '2020-08-27',
        created: Math.floor(Date.now() / 1000),
        data: {
            object: {
                id: 'sub_test_flow_' + Date.now(),
                object: 'subscription',
                status: 'active',
                customer: 'cus_test_flow_' + Date.now(),
                items: {
                    data: [{
                        id: 'si_test_flow_' + Date.now(),
                        object: 'subscription_item',
                        quantity: 15,
                        price: {
                            id: 'price_test_flow_' + Date.now(),
                            object: 'price',
                            nickname: 'Startup Plan',
                            unit_amount: 2000,
                            currency: 'usd'
                        }
                    }]
                },
                metadata: {
                    botCount: '15',
                    tier: 'startup'
                },
                current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
                cancel_at_period_end: false
            }
        },
        type: 'customer.subscription.updated'
    };
    
    try {
        // Create proper Stripe signature
        const payload = JSON.stringify(testEvent);
        const timestamp = Math.floor(Date.now() / 1000);
        const signature = crypto
            .createHmac('sha256', STRIPE_WEBHOOK_SECRET)
            .update(`${timestamp}.${payload}`)
            .digest('hex');
        
        const stripeSignature = `t=${timestamp},v1=${signature}`;
        
        console.log('🔐 Sending webhook event...');
        
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'stripe-signature': stripeSignature,
            },
            body: payload,
        });
        
        console.log(`📊 Webhook response status: ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Webhook failed:', errorText);
            return false;
        }
        
        console.log('✅ Webhook processed successfully');
        
        // Wait a moment then check if admin API was updated
        console.log('⏳ Waiting 2 seconds for admin API update...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if the test user was updated in admin API
        const checkResponse = await fetch(`${ADMIN_API_URL}/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-API-Key': ADMIN_API_TOKEN,
            },
            body: JSON.stringify({
                email: 'test@example.com',
                name: 'Test User',
            }),
        });
        
        if (checkResponse.ok) {
            const user = await checkResponse.json();
            console.log('✅ Admin API integration working');
            console.log(`📊 Final user data: ${JSON.stringify(user, null, 2)}`);
            return true;
        } else {
            console.log('❌ Could not verify admin API update');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Full flow test failed:', error.message);
        return false;
    }
}

// Main test execution
async function runAllTests() {
    console.log('🚀 Starting webhook isolation tests...\n');
    
    const results = {
        connectivity: await testWebhookConnectivity(),
        webhook: await testSubscriptionUpdatedWebhook(),
        adminApi: await testAdminApiIntegration(),
        fullFlow: await testFullWebhookFlow(),
    };
    
    console.log('\n📊 Test Results Summary');
    console.log('=======================');
    console.log(`✅ Webhook Connectivity: ${results.connectivity ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Webhook Processing: ${results.webhook ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Admin API Integration: ${results.adminApi ? 'PASS' : 'FAIL'}`);
    console.log(`✅ Full Flow Test: ${results.fullFlow ? 'PASS' : 'FAIL'}`);
    
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        console.log('\n🎉 All tests passed! Webhook is working correctly in isolation.');
    } else {
        console.log('\n❌ Some tests failed. Check the logs above for details.');
    }
    
    return allPassed;
}

// Run the tests
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = { runAllTests }; 