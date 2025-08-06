#!/usr/bin/env node

/**
 * Advanced Stripe Cleanup Script
 * 
 * This script will properly clean up all products and prices from your Stripe account.
 * It handles default prices and user-created prices that can't be directly deleted.
 * 
 * WARNING: This is destructive and will permanently delete products and deactivate prices.
 * Make sure you want to do this before running the script.
 * 
 * Usage:
 * 1. Set your STRIPE_SECRET_KEY environment variable
 * 2. Run: node scripts/stripe-cleanup-advanced.js
 */

const Stripe = require('stripe');

// Check for Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY environment variable is required');
  console.error('Please set it with: export STRIPE_SECRET_KEY=sk_test_...');
  process.exit(1);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function advancedCleanupStripe() {
  console.log('🧹 Starting advanced Stripe cleanup...');
  
  const results = {
    productsDeleted: 0,
    pricesDeactivated: 0,
    productsArchived: 0,
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

        // First, try to deactivate all non-default prices
        for (const price of prices.data) {
          try {
            // Skip default prices - they can't be deactivated
            if (price.id === product.default_price) {
              console.log(`  ⚠️  Skipping default price ${price.id} (cannot be deactivated)`);
              continue;
            }
            
            await stripe.prices.update(price.id, { active: false });
            console.log(`  ✅ Deactivated price ${price.id} (${price.unit_amount} ${price.currency})`);
            results.pricesDeactivated++;
          } catch (error) {
            const errorMsg = `Failed to deactivate price ${price.id}: ${error.message}`;
            console.error(`  ❌ ${errorMsg}`);
            results.errors.push(errorMsg);
          }
        }

        // Try to delete the product
        try {
          await stripe.products.del(product.id);
          console.log(`  ✅ Deleted product ${product.id}`);
          results.productsDeleted++;
        } catch (error) {
          // If deletion fails, try to archive the product
          if (error.message.includes('cannot be deleted because it has one or more user-created prices')) {
            try {
              await stripe.products.update(product.id, { active: false });
              console.log(`  ✅ Archived product ${product.id} (could not delete due to user-created prices)`);
              results.productsArchived++;
            } catch (archiveError) {
              const errorMsg = `Failed to archive product ${product.id}: ${archiveError.message}`;
              console.error(`  ❌ ${errorMsg}`);
              results.errors.push(errorMsg);
            }
          } else {
            const errorMsg = `Failed to delete product ${product.id}: ${error.message}`;
            console.error(`  ❌ ${errorMsg}`);
            results.errors.push(errorMsg);
          }
        }

      } catch (error) {
        const errorMsg = `Failed to process product ${product.id}: ${error.message}`;
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
    console.log('\n📊 Advanced Cleanup Summary:');
    console.log(`✅ Products deleted: ${results.productsDeleted}`);
    console.log(`✅ Products archived: ${results.productsArchived}`);
    console.log(`✅ Prices deactivated: ${results.pricesDeactivated}`);
    
    if (results.errors.length > 0) {
      console.log(`❌ Errors encountered: ${results.errors.length}`);
      console.log('\nError details:');
      results.errors.forEach(error => console.log(`  - ${error}`));
    }

    console.log('\n🎉 Advanced Stripe cleanup completed!');
    console.log('\n💡 Note: Some products may have been archived instead of deleted');
    console.log('   due to user-created prices. You can manually delete them from');
    console.log('   the Stripe dashboard if needed.');

  } catch (error) {
    console.error('❌ Fatal error during cleanup:', error.message);
    process.exit(1);
  }
}

// Confirmation prompt
console.log('⚠️  WARNING: This will permanently delete/archive all products and deactivate all prices in your Stripe account.');
console.log('⚠️  This action cannot be undone.');
console.log('');
console.log('Are you sure you want to continue? (y/N)');

process.stdin.once('data', (data) => {
  const input = data.toString().trim().toLowerCase();
  
  if (input === 'y' || input === 'yes') {
    advancedCleanupStripe();
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