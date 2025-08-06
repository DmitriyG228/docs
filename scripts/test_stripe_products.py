#!/usr/bin/env python3
"""
Test script to verify Stripe products created by stripe_sync.py
"""

import os
import sys
import stripe
from typing import Any, Dict, List

# Initialize Stripe
api_key = os.getenv("STRIPE_API_KEY")
if not api_key:
    sys.exit("❌  STRIPE_API_KEY env var is required")

stripe.api_key = api_key
stripe.api_version = "2023-10-16"

def test_products():
    print("🧪 Testing Stripe products created by sync script...\n")
    
    # List all active products
    products = stripe.Product.list(active=True, limit=100)
    print(f"📦 Found {len(products.data)} active products:")
    
    for product in products.data:
        print(f"\n  Product: {product.name} ({product.id})")
        print(f"    Type: {product.type}")
        print(f"    Active: {product.active}")
        
        # Get prices for this product
        prices = stripe.Price.list(product=product.id, active=True, limit=100)
        print(f"    Prices: {len(prices.data)}")
        
        for price in prices.data:
            print(f"      - {price.id}")
            print(f"        Nickname: {getattr(price, 'nickname', 'N/A')}")
            print(f"        Currency: {price.currency}")
            print(f"        Type: {price.type}")
            print(f"        Billing Scheme: {price.billing_scheme}")
            
            if price.type == 'recurring':
                print(f"        Interval: {price.recurring.interval}")
                if hasattr(price.recurring, 'trial_period_days') and price.recurring.trial_period_days:
                    print(f"        Trial Days: {price.recurring.trial_period_days}")
            
            if price.billing_scheme == 'per_unit':
                print(f"        Unit Amount: ${price.unit_amount / 100:.2f}")
            elif price.billing_scheme == 'tiered':
                print(f"        Tiers Mode: {price.tiers_mode}")
                if hasattr(price, 'tiers') and price.tiers:
                    print(f"        Tiers: {len(price.tiers)}")
                    for i, tier in enumerate(price.tiers):
                        print(f"          Tier {i+1}: Up to {tier.up_to} at ${tier.unit_amount / 100:.2f}")

def test_specific_product():
    print("\n🔍 Testing specific 'Bot subscription' product...")
    
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
    
    # Get prices
    prices = stripe.Price.list(product=bot_product.id, active=True, limit=100)
    print(f"📊 Found {len(prices.data)} active prices:")
    
    for price in prices.data:
        print(f"\n  Price: {price.id}")
        print(f"    Nickname: {getattr(price, 'nickname', 'N/A')}")
        print(f"    Currency: {price.currency}")
        print(f"    Type: {price.type}")
        print(f"    Billing Scheme: {price.billing_scheme}")
        
        if price.billing_scheme == 'per_unit':
            print(f"    Amount: ${price.unit_amount / 100:.2f}")
        elif price.billing_scheme == 'tiered':
            print(f"    Tiers Mode: {price.tiers_mode}")
            if hasattr(price, 'tiers') and price.tiers:
                for i, tier in enumerate(price.tiers):
                    print(f"      Tier {i+1}: Up to {tier.up_to} at ${tier.unit_amount / 100:.2f}")

if __name__ == "__main__":
    test_products()
    test_specific_product()
    print("\n✅ Test completed!") 