// Test direct webhook function call
// Run with: node test-direct-webhook-function.js

require('dotenv').config();

async function testDirectWebhookFunction() {
  console.log('🧪 Testing direct handleSubscriptionUpdated function...');
  
  // We need to import the function from our webhook file
  // Since it's not exported, we'll simulate calling updateUserInAdminApi directly
  
  const subscriptionData = {
    email: 'dmitry@vexa.ai',
    botCount: 500, // Change from current 12 to 500
    subscriptionId: 'sub_1RqzYxFLC53EHCR62nO5pVeW',
    tier: 'Startup',
    status: 'active',
    nextPaymentDate: '2025-08-31T16:42:37.000Z',
    preserveBotCount: false
  };
  
  console.log('📋 Direct admin API call with subscription data:', subscriptionData);
  
  try {
    const adminApiUrl = process.env.ADMIN_API_URL;
    const adminApiToken = process.env.ADMIN_API_TOKEN;
    
    if (!adminApiUrl || !adminApiToken) {
      throw new Error('Admin API configuration missing');
    }
    
    console.log('🔍 Step 1: Find/create user...');
    
    // 1. Find or create the user by email to get their ID
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
    
    if (!userResponse.ok) {
      const errorBody = await userResponse.text();
      throw new Error(`Failed to find/create user: ${userResponse.status} ${errorBody}`);
    }
    
    const user = await userResponse.json();
    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);
    console.log(`📊 Current bot count: ${user.max_concurrent_bots}`);
    console.log(`📊 Current subscription ID: ${user.data?.stripe_subscription_id}`);
    
    // Show what the old logic would do
    if (subscriptionData.subscriptionId && user.data?.stripe_subscription_id && 
        user.data.stripe_subscription_id !== subscriptionData.subscriptionId) {
      console.log(`⚠️ OLD LOGIC WOULD IGNORE: User subscription ID ${user.data.stripe_subscription_id} !== new ${subscriptionData.subscriptionId}`);
      console.log(`✅ NEW LOGIC ALLOWS: This is a subscription update, not a duplicate`);
    }
    
    console.log('\n🔄 Step 2: Update user with new bot count...');
    
    // 2. Update the user's bot count and subscription data
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
    
    console.log(`📊 Update response status: ${updateResponse.status}`);
    
    if (!updateResponse.ok) {
      const errorBody = await updateResponse.text();
      throw new Error(`Failed to update user: ${updateResponse.status} ${errorBody}`);
    }
    
    const updatedUser = await updateResponse.json();
    console.log('✅ User updated successfully!');
    console.log(`📊 New bot count: ${updatedUser.max_concurrent_bots}`);
    console.log('📋 Updated user data:', JSON.stringify(updatedUser.data, null, 2));
    
    // Verify the update
    if (updatedUser.max_concurrent_bots === subscriptionData.botCount) {
      console.log(`🎉 SUCCESS: Bot count updated correctly from ${user.max_concurrent_bots} to ${subscriptionData.botCount}!`);
    } else {
      console.log('❌ FAILURE: Bot count not updated correctly');
      console.log('   Expected:', subscriptionData.botCount);
      console.log('   Actual:', updatedUser.max_concurrent_bots);
    }
    
  } catch (error) {
    console.error('❌ Error in direct webhook function test:', error.message);
    console.error('📋 Full error:', error);
  }
}

testDirectWebhookFunction();