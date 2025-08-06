#!/usr/bin/env python3
"""
Cleanup script to remove extra prices and keep only MVP Monthly and Startup
"""

import os
import sys
import stripe

# Initialize Stripe
api_key = os.getenv("STRIPE_API_KEY")
if not api_key:
    sys.exit("❌  STRIPE_API_KEY env var is required")

stripe.api_key = api_key
stripe.api_version = "2023-10-16"

def cleanup_extra_prices():
    print("🧹 Cleaning up extra prices...\n")
    
    # Find the Bot subscription product
    products = stripe.Product.list(active=True, limit=100)
    bot_product = None
    
    for product in products.data:
        if product.name == "Bot subscription":
            bot_product = product
            break
    
    if not bot_product:
        print("❌ Bot subscription product not found")
        return
    
    print(f"✅ Found Bot subscription: {bot_product.id}")
    
    # Get all prices for this product
    prices = stripe.Price.list(product=bot_product.id, active=True, limit=100)
    print(f"📊 Found {len(prices.data)} active prices:")
    
    # Define the prices we want to keep
    keep_prices = {
        "MVP Monthly": {"unit_amount": 1200, "trial_days": 7},
        "Startup": {"unit_amount": 12000, "trial_days": 0}
    }
    
    prices_to_archive = []
    
    for price in prices.data:
        nickname = getattr(price, 'nickname', None)
        unit_amount = price.unit_amount
        trial_days = price.recurring.trial_period_days if price.recurring else 0
        
        print(f"\n  Price: {price.id}")
        print(f"    Nickname: {nickname}")
        if unit_amount:
            print(f"    Amount: ${unit_amount / 100:.2f}")
        else:
            print(f"    Amount: Tiered pricing")
        print(f"    Trial Days: {trial_days}")
        
        # Check if this price should be kept
        should_keep = False
        for keep_nickname, keep_spec in keep_prices.items():
            if (nickname == keep_nickname and 
                unit_amount == keep_spec["unit_amount"] and
                trial_days == keep_spec["trial_days"]):
                should_keep = True
                print(f"    ✅ KEEPING - matches {keep_nickname}")
                break
        
        if not should_keep:
            prices_to_archive.append(price)
            print(f"    ❌ ARCHIVING - doesn't match our specs")
    
    # Archive the extra prices
    if prices_to_archive:
        print(f"\n🗑️  Archiving {len(prices_to_archive)} extra prices...")
        for price in prices_to_archive:
            try:
                stripe.Price.modify(price.id, active=False)
                print(f"  ✅ Archived {price.id} ({getattr(price, 'nickname', 'No nickname')})")
            except Exception as e:
                print(f"  ❌ Failed to archive {price.id}: {e}")
    else:
        print("\n✅ No extra prices to archive!")
    
    # Verify final state
    print("\n🔍 Final verification:")
    final_prices = stripe.Price.list(product=bot_product.id, active=True, limit=100)
    print(f"📊 Final active prices: {len(final_prices.data)}")
    
    for price in final_prices.data:
        nickname = getattr(price, 'nickname', 'No nickname')
        unit_amount = price.unit_amount
        trial_days = price.recurring.trial_period_days if price.recurring else 0
        print(f"  - {nickname}: ${unit_amount / 100:.2f} (trial: {trial_days} days)")
    
    if len(final_prices.data) == 2:
        print("\n✅ SUCCESS: Exactly 2 active prices as requested!")
    else:
        print(f"\n⚠️  WARNING: Found {len(final_prices.data)} prices, expected 2")

if __name__ == "__main__":
    cleanup_extra_prices() 