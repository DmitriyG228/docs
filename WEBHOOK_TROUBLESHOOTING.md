# 🔍 Webhook Troubleshooting Analysis

## Current Status
- ✅ **Next.js app running** on localhost:3001
- ✅ **Admin API running** on localhost:18056  
- ✅ **Admin API authentication** working
- ✅ **Bot count updates** work via admin API
- ✅ **Stripe CLI** triggering events successfully
- ❓ **Webhook events reaching app** - NEEDS VERIFICATION

## 🚨 Primary Issues to Check

### 1. **Are webhooks reaching your app?**

**Check your Next.js application logs** when you trigger webhooks. You should see:

```bash
🔔 [Webhook] === WEBHOOK CALL RECEIVED ===
🔔 [Webhook] Timestamp: 2025-08-06T20:33:06.000Z
🔔 [Webhook] Body length: 1234
🔔 [Webhook] Has signature: true
```

**If you DON'T see these logs:**
- Your Stripe CLI is not forwarding to the correct URL
- Your Next.js app is not running
- There's a routing issue

### 2. **Is webhook signature verification working?**

If webhooks reach your app, you should see:
```bash
✅ [Webhook] Signature verified successfully
🔔 [Webhook] Event type: customer.subscription.updated
```

**If signature verification fails:**
- Wrong webhook secret in .env
- Stripe CLI using different secret

### 3. **Is subscription processing working?**

For subscription updates, you should see:
```bash
🎯 [Webhook] === SUBSCRIPTION UPDATED EVENT ===
🎯 [Webhook] Subscription ID: sub_xxx
[Webhook] DEBUG: Subscription details for customer@example.com:
[Webhook] DEBUG: Actual bot count: 5
[Webhook] ✅ User updated successfully. Current bot limit: 5
```

## 🔧 **Immediate Debug Steps**

### Step 1: Monitor Application Logs
```bash
# In your Next.js terminal, watch for webhook logs
# Trigger a webhook and see if ANY logs appear:
stripe trigger customer.subscription.updated
```

### Step 2: Verify Stripe CLI Setup
```bash
# Check if Stripe CLI is forwarding correctly
stripe listen --forward-to localhost:3001/api/stripe/webhook
# Should show: "Ready! Your webhook signing secret is whsec_..."
```

### Step 3: Test Direct Webhook Call
```bash
# Test if webhook endpoint responds at all
curl -X POST http://localhost:3001/api/stripe/webhook-debug \
  -H "Content-Type: application/json" \
  -d '{"type": "test", "id": "debug_test"}'
```

## 🎯 **Most Likely Issues**

### Issue 1: Stripe CLI Not Forwarding
**Symptoms:** No webhook logs in Next.js app
**Solution:** 
- Restart Stripe CLI: `stripe listen --forward-to localhost:3001/api/stripe/webhook`
- Verify correct port (3001)
- Check Stripe CLI shows "Ready!"

### Issue 2: Wrong Webhook Secret
**Symptoms:** Webhook received but signature verification fails
**Solution:**
- Copy webhook secret from Stripe CLI output
- Update STRIPE_WEBHOOK_SECRET in .env
- Restart Next.js app

### Issue 3: Webhook Processing But Not Calling Admin API
**Symptoms:** Webhook logs appear but no admin API calls
**Solution:**
- Check for errors in updateUserInAdminApi function
- Verify admin API URL/token in logs
- Check for try-catch errors

### Issue 4: Admin API Calls Failing
**Symptoms:** Webhook processes but bot count doesn't update
**Solution:**
- Check admin API logs for incoming requests
- Verify user exists and is being updated
- Check database for actual bot count changes

## 🧪 **Test Sequence**

1. **Terminal 1:** Run Stripe CLI
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```

2. **Terminal 2:** Monitor Next.js logs
   ```bash
   # Watch for webhook processing logs
   ```

3. **Terminal 3:** Trigger webhook
   ```bash
   stripe trigger customer.subscription.updated
   ```

4. **Check Results:**
   - Stripe CLI shows event forwarded (200 status)
   - Next.js shows webhook received and processed
   - Admin API shows user updated
   - Database shows new bot count

## 🎯 **Expected Complete Flow**

```bash
# Stripe CLI
--> customer.subscription.updated [evt_xxx]
<-- [200] POST http://localhost:3001/api/stripe/webhook

# Next.js Logs
🔔 [Webhook] === WEBHOOK CALL RECEIVED ===
✅ [Webhook] Signature verified successfully
🎯 [Webhook] === SUBSCRIPTION UPDATED EVENT ===
[Webhook] DEBUG: Actual bot count: 5
[Webhook] DEBUG: Admin API update response status: 200
[Webhook] ✅ User updated successfully. Current bot limit: 5

# Admin API Logs (if visible)
POST /admin/users - 200
PATCH /admin/users/123 - 200
```

---

## 🚀 **Next Action**

**Monitor your Next.js application console** and trigger a webhook:

```bash
stripe trigger customer.subscription.updated
```

**Look for the emoji logs** (🔔, 🎯, ✅) to see exactly where the chain breaks!