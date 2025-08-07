// Test what happens when subscription is updated via Customer Portal
// Run with: node test-customer-portal-simulation.js

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testCustomerPortalSimulation() {
  console.log('🧪 Testing Customer Portal subscription update simulation...');
  
  try {
    // Get your current customer and subscription
    const customers = await stripe.customers.list({
      email: 'dmitry@vexa.ai',
      limit: 1
    });
    
    if (customers.data.length === 0) {
      console.log('❌ No customer found with email dmitry@vexa.ai');
      return;
    }
    
    const customer = customers.data[0];
    console.log(`✅ Found customer: ${customer.id} (${customer.email})`);
    
    // Get current subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 5
    });
    
    console.log(`📊 Found ${subscriptions.data.length} subscriptions:`);
    subscriptions.data.forEach((sub, i) => {
      const item = sub.items.data[0];
      console.log(`  ${i+1}. ${sub.id} - Status: ${sub.status} - Quantity: ${item?.quantity || 'N/A'} - Price: ${item?.price?.nickname || 'N/A'}`);
    });
    
    if (subscriptions.data.length === 0) {
      console.log('❌ No subscriptions found');
      return;
    }
    
    // Get the active subscription
    const activeSubscription = subscriptions.data.find(sub => 
      sub.status === 'active' || sub.status === 'trialing'
    );
    
    if (!activeSubscription) {
      console.log('❌ No active subscription found');
      return;
    }
    
    console.log(`🎯 Testing with subscription: ${activeSubscription.id}`);
    
    const currentItem = activeSubscription.items.data[0];
    const currentQuantity = currentItem.quantity;
    const newQuantity = currentQuantity + 1; // Simulate increasing by 1
    
    console.log(`📈 Simulating quantity change: ${currentQuantity} → ${newQuantity}`);
    
    // Update the subscription quantity (like what Customer Portal would do)
    console.log('🔄 Updating subscription...');
    const updatedSubscription = await stripe.subscriptions.update(activeSubscription.id, {
      items: [{
        id: currentItem.id,
        quantity: newQuantity
      }]
    });
    
    console.log(`✅ Subscription updated successfully!`);
    console.log(`📊 New quantity: ${updatedSubscription.items.data[0].quantity}`);
    
    // Wait a moment then check the webhook logs
    console.log('\n⏳ Waiting 3 seconds for webhook processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Check if user was updated in database
    console.log('🔍 Checking user in database...');
    const adminApiUrl = process.env.ADMIN_API_URL;
    const adminApiToken = process.env.ADMIN_API_TOKEN;
    
    const userResponse = await fetch(`${adminApiUrl}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-API-Key': adminApiToken,
      },
      body: JSON.stringify({
        email: 'dmitry@vexa.ai',
        name: 'Dmitry',
      }),
    });
    
    if (userResponse.ok) {
      const user = await userResponse.json();
      console.log(`📊 Current user bot count: ${user.max_concurrent_bots}`);
      console.log(`📊 Expected bot count: ${newQuantity}`);
      
      if (user.max_concurrent_bots === newQuantity) {
        console.log('🎉 SUCCESS: Bot count updated correctly via webhook!');
      } else {
        console.log('❌ FAILURE: Bot count not updated by webhook');
        console.log('   This suggests the webhook is not processing subscription.updated events correctly');
      }
      
      console.log('📋 User subscription data:');
      console.log(JSON.stringify(user.data, null, 2));
    } else {
      console.error('❌ Failed to retrieve user data from admin API');
    }
    
    // Revert the change
    console.log('\n↩️ Reverting subscription quantity...');
    await stripe.subscriptions.update(activeSubscription.id, {
      items: [{
        id: currentItem.id,
        quantity: currentQuantity
      }]
    });
    console.log(`✅ Reverted quantity back to ${currentQuantity}`);
    
  } catch (error) {
    console.error('❌ Error in Customer Portal simulation:', error.message);
    console.error('📋 Full error:', error);
  }
}

testCustomerPortalSimulation();