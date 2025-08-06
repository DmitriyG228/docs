# Stripe Sync Scripts Documentation

This directory contains two powerful scripts for managing Stripe products and prices:

1. **JavaScript Version** (`stripe-product-sync.js`) - Simple tier-based pricing
2. **Python Version** (`stripe_sync.py`) - Advanced tiered pricing with volume discounts

## 🚀 Customer Portal Integration

This project now uses Stripe's Customer Portal for subscription management instead of custom interfaces.

### Features
- **Stripe Customer Portal** for all subscription management
- **Automatic billing updates** through Stripe's interface
- **Standard Stripe experience** for customers
- **Reduced custom code** and maintenance

### Usage
Customers can manage their subscriptions by clicking "Open Billing Portal" in their dashboard.

### API Endpoint
- **POST** `/api/stripe/create-portal-session` - Creates a Stripe Customer Portal session

## 🚀 JavaScript Sync Script

### Features
- **Simple tier-based pricing** (MVP, Startup, Growth, Scale)
- **Dynamic price calculation** using your application's formula
- **Product archiving** for auto-created products that can't be updated
- **Metadata support** with bot count, tier, and price per bot

### Usage

```bash
# Set your Stripe secret key
export STRIPE_SECRET_KEY=sk_test_your_key_here

# List current products
node scripts/stripe-product-sync.js list

# Test a specific tier
node scripts/stripe-product-sync.js test mvp
node scripts/stripe-product-sync.js test startup
node scripts/stripe-product-sync.js test growth
node scripts/stripe-product-sync.js test scale

# Sync all products
node scripts/stripe-product-sync.js sync
```

### Pricing Tiers (JavaScript)
- **MVP**: $12/month for 1 bot (with 7-day trial)
- **Startup**: $120/month for 5 bots
- **Growth**: $550/month for 30 bots  
- **Scale**: $1,884/month for 180 bots

## 🐍 Python Sync Script

### Features
- **Advanced tiered pricing** with volume discounts
- **Lookup key support** for easy product identification
- **Sophisticated price comparison** with tier validation
- **Trial period support** for MVP tier
- **Volume-based billing** for scalable pricing

### Usage

```bash
# Set your Stripe API key
export STRIPE_API_KEY=sk_test_your_key_here

# Run the sync
python scripts/stripe_sync.py
```

### Pricing Structure (Python)

#### MVP Tier
- **Price**: $12/month
- **Bots**: 1 concurrent
- **Trial**: 7-day free trial
- **Billing**: Per-unit

#### Startup Tiered Pricing
- **5 bots minimum**: $24 each ($120 for 5 bots)
- **6-50 bots**: $20 each
- **51-200 bots**: $15 each  
- **201+ bots**: $10 each
- **Billing**: Volume-based tiered pricing
- **Minimum**: 5 bots required

## 📊 Comparison

| Feature | JavaScript | Python |
|---------|------------|--------|
| **Pricing Model** | Fixed tiers | Volume-based tiered |
| **Trial Support** | ❌ | ✅ (7-day trial) |
| **Lookup Keys** | ❌ | ✅ |
| **Price Comparison** | Basic | Advanced |
| **Volume Discounts** | ❌ | ✅ |
| **Ease of Use** | ✅ | ✅ |

## 🔧 Configuration

### JavaScript Configuration
The pricing is calculated dynamically using your application's formula:

```javascript
function calculatePrice(bots) {
  const perBotCost = 10 + 14 * Math.exp(-bots / 100);
  let basePrice = Math.round(bots * Math.max(10, perBotCost));
  basePrice = Math.max(120, basePrice);
  
  // Apply tier discounts
  if (bots >= 180) basePrice = Math.round(basePrice * 0.85);
  else if (bots >= 30) basePrice = Math.round(basePrice * 0.90);
  else if (bots >= 5) basePrice = Math.round(basePrice * 0.95);
  
  return Math.max(120, Math.max(bots * 10, basePrice));
}
```

### Python Configuration
The pricing is defined in the `CONFIG` dictionary:

```python
CONFIG = {
    "product": {
        "name": "Bot subscription",
        "type": "service",
    },
    "prices": [
        {
            "nickname": "MVP Monthly",
            "unit_amount": 1200,  # $12.00
            "currency": "usd",
            "recurring": {
                "interval": "month",
                "trial_period_days": 7,
            },
        },
        {
            "nickname": "Startup",
            "currency": "usd",
            "recurring": {"interval": "month"},
            "billing_scheme": "tiered",
            "tiers_mode": "volume",
            "tiers": [
                {"up_to": 5, "unit_amount": 2400},   # 5 bots minimum → $24 each
                {"up_to": 50, "unit_amount": 2000},  # $20 each
                {"up_to": 200, "unit_amount": 1500}, # $15 each
                {"up_to": "inf", "unit_amount": 1000}, # $10 each
            ],
            "metadata": {
                "min_bots": "5",
                "pricing_model": "tiered_volume",
                "description": "Startup plan with 5 bot minimum and volume discounts"
            },
        },
    ],
}
```

## 🧪 Testing

### Test Scripts
Both scripts include testing capabilities:

```bash
# JavaScript - Test specific tier
node scripts/stripe-product-sync.js test mvp

# Python - Test products
python scripts/test_stripe_products.py
```

### Verification
After running either sync script, you can verify the results:

1. **Check Stripe Dashboard** - Products and prices should be active
2. **Use test script** - `python scripts/test_stripe_products.py`
3. **List products** - `node scripts/stripe-product-sync.js list`

## 🔄 Sync Behavior

### JavaScript Script
- **Finds existing products** by name
- **Updates products** if they can be modified
- **Creates new products** if existing ones can't be updated
- **Archives old prices** and creates new ones
- **Sets default prices** automatically

### Python Script
- **Uses lookup keys** for precise product identification
- **Compares price specifications** in detail
- **Handles tiered pricing** with volume discounts
- **Supports trial periods** for specific tiers
- **Archives outdated prices** and creates new ones

## ⚠️ Important Notes

### Environment Variables
- **JavaScript**: Uses `STRIPE_SECRET_KEY`
- **Python**: Uses `STRIPE_API_KEY`

### API Versions
- **JavaScript**: Uses default Stripe API version
- **Python**: Uses `2023-10-16` API version

### Error Handling
Both scripts include comprehensive error handling:
- **Graceful degradation** for unsupported features
- **Detailed logging** of all operations
- **Safe archiving** of outdated products/prices
- **Exception handling** for API errors

## 🚀 Production Usage

### JavaScript Script
Best for:
- Simple tier-based pricing
- Quick setup and testing
- Integration with existing Node.js applications

### Python Script
Best for:
- Complex tiered pricing
- Volume-based discounts
- Advanced Stripe features
- Production-grade product management

## 📝 Best Practices

1. **Always test in test mode first** with `sk_test_` keys
2. **Backup existing products** before running sync scripts
3. **Review pricing configuration** before production deployment
4. **Monitor sync results** and verify in Stripe dashboard
5. **Use version control** for configuration changes

## 🔗 Integration

Both scripts can be integrated into your deployment pipeline:

```bash
# Pre-deployment sync
export STRIPE_API_KEY=sk_test_xxx
python scripts/stripe_sync.py

# Production sync
export STRIPE_API_KEY=sk_live_xxx
python scripts/stripe_sync.py
```

## 📞 Support

For issues or questions:
1. Check the script output for error messages
2. Verify your Stripe API key is correct
3. Ensure you have the required permissions
4. Test with a fresh Stripe test account if needed 