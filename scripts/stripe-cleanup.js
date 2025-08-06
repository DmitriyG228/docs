#!/usr/bin/env node

/**
 * Stripe Cleanup Script
 * 
 * This script will remove all products and deactivate all prices from your Stripe account.
 * 
 * WARNING: This is destructive and will permanently delete products and deactivate prices.
 * Make sure you want to do this before running the script.
 * 
 * Usage:
 * 1. Set your STRIPE_SECRET_KEY environment variable
 * 2. Run: node scripts/stripe-cleanup.js
 */

const Stripe = require('stripe');

// Check for Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  console.error('Please set it with: export STRIPE_SECRET_KEY=sk_test_...');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function cleanupStripe() {
  console.log('🧹 Starting Stripe cleanup...');
  
  const results = {
    productsDeleted: 0,
    pricesDeactivated: 0,
    errors: []
  };

  try {
    // First, get all products
    console.log('📋 Fetching all products...');
    const products = await stripe.products.list({ limit: 100 });
    console.log(`Found ${products.data.length} products`);

    // Process each product
    for (const product of products.data) {
      console.log(`\n🔄 Processing product: ${product.name} (${product.id})`);
      
      try {
        // Get all prices for this product
        const prices = await stripe.prices.list({ 
          product: product.id,
          limit: 100 
        });
        
        console.log(`  Found ${prices.data.length} prices for this product`);

        // Deactivate all prices for this product
        for (const price of prices.data) {
          try {
            await stripe.prices.update(price.id, { active: false });
            console.log(`  ✅ Deactivated price ${price.id} (${price.unit_amount} ${price.currency})`);
            results.pricesDeactivated++;
          } catch (error) {
            const errorMsg = `Failed to deactivate price ${price.id}: ${error.message}`;
            console.error(`  ❌ ${errorMsg}`);
            results.errors.push(errorMsg);
          }
        }

        // Delete the product
        await stripe.products.del(product.id);
        console.log(`  ✅ Deleted product ${product.id}`);
        results.productsDeleted++;

      } catch (error) {
        const errorMsg = `Failed to delete product ${product.id}: ${error.message}`;
        console.error(`  ❌ ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    }

    // Also clean up any orphaned prices (prices without products)
    console.log('\n🔍 Checking for orphaned prices...');
    const allPrices = await stripe.prices.list({ limit: 100 });
    const orphanedPrices = allPrices.data.filter(price => !price.product);
    
    if (orphanedPrices.length > 0) {
      console.log(`Found ${orphanedPrices.length} orphaned prices`);
      
      for (const price of orphanedPrices) {
        try {
          await stripe.prices.update(price.id, { active: false });
          console.log(`  ✅ Deactivated orphaned price ${price.id}`);
          results.pricesDeactivated++;
        } catch (error) {
          const errorMsg = `Failed to deactivate orphaned price ${price.id}: ${error.message}`;
          console.error(`  ❌ ${errorMsg}`);
          results.errors.push(errorMsg);
        }
      }
    } else {
      console.log('No orphaned prices found');
    }

    // Print summary
    console.log('\n📊 Cleanup Summary:');
    console.log(`✅ Products deleted: ${results.productsDeleted}`);
    console.log(`✅ Prices deactivated: ${results.pricesDeactivated}`);
    
    if (results.errors.length > 0) {
      console.log(`❌ Errors encountered: ${results.errors.length}`);
      console.log('\nError details:');
      results.errors.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n🎉 Stripe cleanup completed!');

  } catch (error) {
    console.error('❌ Fatal error during cleanup:', error.message);
    process.exit(1);
  }
}

// Confirmation prompt
console.log('⚠️  WARNING: This will permanently delete all products and deactivate all prices in your Stripe account.');
console.log('⚠️  This action cannot be undone.');
console.log('');
console.log('Are you sure you want to continue? (y/N)');

process.stdin.once('data', (data) => {
  const input = data.toString().trim().toLowerCase();
  
  if (input === 'y' || input === 'yes') {
    cleanupStripe();
  } else {
    console.log('❌ Cleanup cancelled.');
    process.exit(0);
  }
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n❌ Cleanup interrupted.');
  process.exit(0);
}); 