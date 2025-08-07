// Direct test of webhook admin API call
// Run with: node test-webhook-admin-call.js

require('dotenv').config();

async function testWebhookAdminCall() {
  console.log('🧪 Testing webhook admin API call...');
  
  const adminApiUrl = process.env.ADMIN_API_URL;
  const adminApiToken = process.env.ADMIN_API_TOKEN;
  
  console.log('🔧 Environment:');
  console.log('  - ADMIN_API_URL:', adminApiUrl);
  console.log('  - ADMIN_API_TOKEN:', adminApiToken ? 'SET' : 'NOT SET');
  
  // Simulate the exact webhook call
  const subscriptionData = {
    email: 'dmitry@vexa.ai',
    botCount: 12,
    subscriptionId: 'sub_1RtDhkFYKA8urbwFHTgidoId',
    tier: 'Startup',
    status: 'active',
    nextPaymentDate: '2025-08-31T16:42:37.000Z',
    preserveBotCount: false
  };
  
  console.log('📋 Subscription data to process:', subscriptionData);
  
  try {
    // Step 1: Find/create user
    console.log('\n🔍 Step 1: Find/create user...');
    const userResponse = await fetch(`${adminApiUrl}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-API-Key': adminApiToken,
      },
      body: JSON.stringify({
        email: subscriptionData.email,
        name: subscriptionData.email.split('@')[0],
      }),
    });
    
    console.log('📊 User response status:', userResponse.status);
    
    if (!userResponse.ok) {
      const errorBody = await userResponse.text();
      throw new Error(`Failed to find/create user: ${userResponse.status} ${errorBody}`);
    }
    
    const user = await userResponse.json();
    console.log('✅ User found/created:', user.id, user.email);
    console.log('📊 Current bot count:', user.max_concurrent_bots);
    
    // Step 2: Update user with new bot count
    console.log('\n🔄 Step 2: Update user bot count...');
    const updatePayload = {
      ...(subscriptionData.preserveBotCount ? {} : { max_concurrent_bots: subscriptionData.botCount }),
      data: {
        stripe_subscription_id: subscriptionData.subscriptionId,
        subscription_tier: subscriptionData.tier,
        subscription_status: subscriptionData.status,
        subscription_end_date: subscriptionData.nextPaymentDate,
        updated_by_webhook: new Date().toISOString(),
      },
    };
    
    console.log('📋 Update payload:', JSON.stringify(updatePayload, null, 2));
    
    const updateResponse = await fetch(`${adminApiUrl}/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-API-Key': adminApiToken,
      },
      body: JSON.stringify(updatePayload),
    });
    
    console.log('📊 Update response status:', updateResponse.status);
    
    if (!updateResponse.ok) {
      const errorBody = await updateResponse.text();
      throw new Error(`Failed to update user: ${updateResponse.status} ${errorBody}`);
    }
    
    const updatedUser = await updateResponse.json();
    console.log('✅ User updated successfully!');
    console.log('📊 New bot count:', updatedUser.max_concurrent_bots);
    console.log('📊 Updated data:', JSON.stringify(updatedUser.data, null, 2));
    
    // Verify the update
    if (updatedUser.max_concurrent_bots === subscriptionData.botCount) {
      console.log('🎉 SUCCESS: Bot count updated correctly!');
    } else {
      console.log('❌ FAILURE: Bot count not updated correctly');
      console.log('   Expected:', subscriptionData.botCount);
      console.log('   Actual:', updatedUser.max_concurrent_bots);
    }
    
  } catch (error) {
    console.error('❌ Error in webhook admin call test:', error.message);
    console.error('📋 Full error:', error);
  }
}

testWebhookAdminCall();