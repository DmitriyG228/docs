#!/usr/bin/env python3
"""
stripe_sync.py – one‑file "upsert" script to keep Product & Prices in sync with Stripe
---------------------------------------------------------------------------
Usage (test mode):
  STRIPE_API_KEY=sk_test_xxx python stripe_sync.py

Requires: `pip install stripe` (v8.0+)
---------------------------------------------------------------------------
"""

from __future__ import annotations
import os
import sys
import stripe
from typing import Any, Dict, List

# ---- Configuration ---------------------------------------------------------
CONFIG: Dict[str, Any] = {
    "product": {
        "name": "Bot subscription",
        "type": "service",  # keeps the product in the recurring‑service category
    },
    "prices": [
        # {
        #     # MVP – single concurrent bot, $12 / month, 7‑day free trial
        #     "nickname": "MVP Monthly",
        #     "unit_amount": 1200,  # cents
        #     "currency": "usd",
        #     "recurring": {
        #         "interval": "month",
        #         "trial_period_days": 7,
        #     },
        # },
        {
            # Startup – tiered per‑bot pricing (volume) with 5 bot minimum
            "nickname": "Startup",
            "currency": "usd",
            "recurring": {
                "interval": "month",
                "trial_period_days": 7,
            },
            "billing_scheme": "tiered",
            "tiers_mode": "volume",
            "tiers": [
                {"up_to": 1, "unit_amount": 1200},
                {"up_to": 5, "unit_amount": 2400},   # 5 bots minimum → $24 ea (5 ⇒ $120)
                {"up_to": 50, "unit_amount": 2000},  # 6–50 bots → $20 ea
                {"up_to": 200, "unit_amount": 1500}, # 51–200 bots → $15 ea
                {"up_to": "inf", "unit_amount": 1000},  # 201+ → $10 ea
            ],
        },
    ],
}

# ---- Stripe initialisation -------------------------------------------------
api_key = os.getenv("STRIPE_SECRET_KEY")
if not api_key:
    sys.exit("❌  STRIPE_SECRET_KEY env var is required")

stripe.api_key = api_key
stripe.api_version = "2023-10-16"

# ---- Helper functions ------------------------------------------------------

def find_product_by_name(name: str):
    """Return the first active product with the given name, or None."""
    resp = stripe.Product.list(active=True, limit=100)
    for product in resp.data:
        if product.name == name:
            return product
    return None


def find_price_by_nickname(product_id: str, nickname: str):
    """Return the first active price with the given nickname for the product, or None."""
    resp = stripe.Price.list(product=product_id, active=True, limit=100)
    for price in resp.data:
        if hasattr(price, 'nickname') and price.nickname == nickname:
            return price
    return None


def product_matches_config(product: stripe.Product, spec: Dict[str, Any]) -> bool:
    return product.name == spec["name"] and product.type == spec.get("type", "service")


def price_matches_spec(price: stripe.Price, spec: Dict[str, Any]) -> bool:
    # Compare critical fields; ignore those Stripe sets automatically.
    if price.currency != spec["currency"]:
        return False
    if price.recurring and spec.get("recurring"):
        if price.recurring["interval"] != spec["recurring"]["interval"]:
            return False
        # trial_period_days lives on the Price in API v2024‑08‑16.
        trial_spec = spec["recurring"].get("trial_period_days")
        if (price.recurring.get("trial_period_days") or 0) != (trial_spec or 0):
            return False
    if price.billing_scheme != spec.get("billing_scheme", "per_unit"):
        return False

    # For tiered prices, just check the nickname to avoid complex tier comparison
    if price.billing_scheme == "tiered":
        price_nickname = getattr(price, 'nickname', None)
        spec_nickname = spec.get('nickname')
        return price_nickname == spec_nickname
    else:
        # Per‑unit price
        if price.unit_amount != spec["unit_amount"]:
            return False
    return True


async def ensure_product() -> stripe.Product:
    prod_spec = CONFIG["product"]
    existing = find_product_by_name(prod_spec["name"])
    if existing and product_matches_config(existing, prod_spec):
        print(f"✔  Product '{prod_spec['name']}' already up‑to‑date ({existing.id})")
        return existing
    if existing:
        print(f"↺  Archiving outdated product {existing.id}")
        stripe.Product.modify(existing.id, active=False)

    print("➕  Creating product")
    return stripe.Product.create(**prod_spec)


async def ensure_price(product_id: str, spec: Dict[str, Any]):
    price = find_price_by_nickname(product_id, spec["nickname"])
    if price and price_matches_spec(price, spec):
        print(f"✔  Price '{spec['nickname']}' up‑to‑date ({price.id})")
        return price

    if price:
        print(f"↺  Archiving outdated price {price.id}")
        stripe.Price.modify(price.id, active=False)

    print(f"➕  Creating price '{spec['nickname']}'")
    return stripe.Price.create(product=product_id, **spec)


# ---- Main runner -----------------------------------------------------------
import asyncio

async def main():
    try:
        product = await ensure_product()
        for price_spec in CONFIG["prices"]:
            await ensure_price(product.id, price_spec)
        print("\n✅  Stripe catalog is synced")
    except Exception as exc:
        print("❌  Sync failed:", exc)
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 