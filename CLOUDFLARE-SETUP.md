# Vexa.ai Cloudflare Setup

This document provides detailed instructions for setting up Vexa.ai with Cloudflare Pages to serve both the new portal and the legacy application.

## Architecture

We're using Cloudflare Pages and Functions to implement a reverse proxy pattern:

```
vexa.ai/          → New Portal (served directly from Cloudflare Pages)
vexa.ai/app/*     → Old App (proxied to old site, preserving the /app path)
vexa.ai/assistant/* → Old Assistant (proxied to old site, preserving the /assistant path)
```

## Setup Steps

### 1. Clone and Configure Repository

The repository already contains all necessary configuration files:
- `/functions/_middleware.js` - Main routing logic
- `/functions/app/[[path]].js` - Handler for /app routes
- `/functions/assistant/[[path]].js` - Handler for /assistant routes
- `wrangler.toml` - Cloudflare configuration

### 2. Deploy to Cloudflare Pages

1. **Connect to GitHub:**
   - Log in to Cloudflare Dashboard
   - Go to Workers & Pages
   - Click "Create application" → "Pages" → "Connect to Git"
   - Select the portal repository

2. **Configure Build Settings:**
   - Build command: `pnpm run pages:build`
   - Build output directory: `.vercel/output/static`
   - Root directory: Leave empty (default)
   - Environment variables:
     - `NODE_VERSION`: `20.12.2` (or any Node 20.x)
     - `OLD_SITE_URL`: **CRITICAL PREREQUISITE:** This MUST be the direct, stable URL of your existing Google Cloud deployment (the OLD site). **Do NOT use `https://vexa.ai`**. Use the default Google Cloud service URL like `https://vexa-new-dashboard-733104961366.us-central1.run.app/` OR a dedicated, non-proxied subdomain you create (e.g., `gcloud-origin.vexa.ai`) that points directly to your Google Cloud IPs.

3. **Deploy:**
   - Click "Save and Deploy"
   - Wait for the build to complete

### 3. Update DNS Configuration

1. **Access Cloudflare DNS Settings:**
   - Go to Cloudflare Dashboard → `vexa.ai` zone → DNS → Records.

2. **Remove Existing Apex Records:**
   - Delete **ALL** existing `A` records for Name `@` (or `vexa.ai`).
   - Delete **ALL** existing `AAAA` records for Name `@` (or `vexa.ai`).
   *(These are the records currently pointing to Google Cloud).* 

3. **Add Placeholder Apex Record:**
   - Click "Add record".
   - Type: `A`
   - Name: `@` (Represents `vexa.ai`)
   - IPv4 address: `192.0.2.1` (This is a placeholder, the actual IP doesn't matter)
   - Proxy status: **Proxied (Orange Cloud ON)** - This is crucial!
   - TTL: Auto (usually 1 min is fine).
   - Save.

4. **Ensure `www` is Proxied:**
   - Find the existing `CNAME` record for `www` that points to `@` (or `vexa.ai`).
   - Ensure its **Proxy status** is set to **Proxied (Orange Cloud ON)**.
   - Save if changes were made.

5. **Keep Other Records:**
   - Leave your `MX` records (for email) and `TXT` records (for verification, SPF) as they are.
   - Review other subdomains (`dashboard`, `ext-dev`, etc.). Keep them if needed, ensuring their proxy status is appropriate (usually OFF/Grey Cloud unless you specifically need Cloudflare proxying for them).

6. **(No DNS for OLD_SITE_URL):** Remember, `OLD_SITE_URL` needs a *stable direct URL* to your Google Cloud deployment (see Step 2). This value is configured as an **Environment Variable** in Cloudflare Pages settings, **not** as one of the main `vexa.ai` proxied DNS records.

### 4. Set up Custom Domain in Pages

*   Go to Workers & Pages → Your "portal" project → Custom domains.
*   Add custom domain: `vexa.ai`.
*   Cloudflare should guide you through verification if needed (usually automatic if DNS is managed in the same account).
*   Also add `www.vexa.ai` as a custom domain.

### 5. Pre-Flight: Testing with a Subdomain (`test.vexa.ai`)

Before modifying your live `vexa.ai` DNS, you can fully test the Cloudflare Pages setup using a dedicated subdomain. This verifies the entire routing and proxying mechanism.

1.  **Ensure Previous Steps Completed:**
    *   Your `@portal` code is deployed to Cloudflare Pages (you have a `your-project.pages.dev` URL).
    *   The `OLD_SITE_URL` environment variable is correctly set in Pages settings to your live Google Cloud URL.
    *   You've tested basic functionality and proxying via the `*.pages.dev` URL as described in the next section (Minimizing Downtime).

2.  **Add Test Subdomain to Pages:**
    *   Go to Workers & Pages → Your "portal" project → Custom domains.
    *   Add custom domain: `test.vexa.ai`.
    *   Follow Cloudflare's validation steps if prompted.

3.  **Add Test DNS Record:**
    *   Go to Cloudflare Dashboard → `vexa.ai` zone → DNS → Records.
    *   Click "Add record".
    *   Type: `A`
    *   Name: `test`
    *   IPv4 address: `192.0.2.1` (placeholder)
    *   Proxy status: **Proxied (Orange Cloud ON)**
    *   TTL: Auto.
    *   Save.

4.  **Wait and Verify `test.vexa.ai`:**
    *   Allow a few minutes for DNS to propagate and Cloudflare Pages to activate the `test.vexa.ai` custom domain.
    *   Thoroughly test all routes using `https://test.vexa.ai`:
        *   `https://test.vexa.ai/` → Should show NEW portal.
        *   `https://test.vexa.ai/app/*` → Should proxy to OLD app.
        *   `https://test.vexa.ai/assistant/*` → Should proxy to OLD assistant.
        *   Check browser console, network requests, and application behavior.

5.  **Proceed to Production Switch (Step 7) ONLY when `test.vexa.ai` is working perfectly.**

### 6. Minimizing Downtime & Testing `*.pages.dev`

*(This step can be done before or alongside Step 5)*

1.  **Pre-Deployment Checks (Before DNS Change):**
    *   **Deploy `@portal`:** Ensure your application is deployed to Cloudflare Pages via GitHub.
    *   **Verify Pages URL:** Access your site via its `*.pages.dev` URL (e.g., `your-portal-project.pages.dev`). Ensure the new portal loads.
    *   **Set Environment Variables:** Double-check that the `OLD_SITE_URL` environment variable is correctly set in the Pages project settings to the **direct, stable URL** of your live Google Cloud application (e.g., `https://vexa-new-dashboard-733104961366.us-central1.run.app/`, NOT `https://vexa.ai`).
    *   **Test Proxying via `*.pages.dev`:** Use the `*.pages.dev` URL to specifically test the function proxying. Open developer tools (Network tab) and visit:
        *   `https://your-portal-project.pages.dev/app/some-test-path`
        *   `https://your-portal-project.pages.dev/assistant/another-test-path`
        Verify these load content from your OLD site. This confirms the *function code* works.

### 7. Execution: Production DNS Switch for `vexa.ai`

**Perform this step ONLY after successfully testing with `test.vexa.ai` (Step 5).**

1.  **Add Production Domains to Pages:**
    *   Go to Workers & Pages → Your "portal" project → Custom domains.
    *   Add custom domain: `vexa.ai`.
    *   Add custom domain: `www.vexa.ai`.

2.  **Low Traffic Window:** If possible, perform the DNS changes during lower user activity.

3.  **Perform DNS Changes for `@` and `www`:**
    *   Go to Cloudflare Dashboard → `vexa.ai` zone → DNS → Records.
    *   **Delete Old:** Delete ALL existing `A` and `AAAA` records for Name `@`.
    *   **Add New:** Add the single placeholder `A` record for Name `@` (`192.0.2.1`) with **Proxy ON**.
    *   **Update `www`:** Ensure the `CNAME` record for Name `www` points to `@` and has **Proxy ON**.

4.  **Post-Deployment Checks:**
    *   Wait 1-5 minutes for Cloudflare's edge propagation.
    *   Test `https://vexa.ai/`, `https://vexa.ai/app/*`, `https://vexa.ai/assistant/*` live.

### 8. Testing (Live)

After DNS propagation is complete for `vexa.ai`:

1.  `https://vexa.ai/` - Should show new portal.
2.  `https://vexa.ai/app/*` - Should route to the old app on Google Cloud.
3.  `https://vexa.ai/assistant/*` - Should route to the old assistant on Google Cloud.

### 9. Cleanup (Optional)

Once `vexa.ai` is confirmed stable for a day or two:
*   Go to Cloudflare DNS and delete the `A` record for `test`.
*   Go to your Pages project settings → Custom domains and remove `test.vexa.ai`.

## Troubleshooting

### Common Issues

1. **404 Errors:** 
   - Verify your Cloudflare Pages Functions are deployed
   - Check environment variables in Cloudflare dashboard

2. **CORS Errors:**
   - If the old site returns CORS errors, you may need to modify the proxy handlers to preserve Origin headers

3. **Worker Error Logs:**
   - Check Workers & Pages → Your "portal" project → Logs

## Maintenance

To update the routing logic:

1. Modify files in the `/functions` directory
2. Commit and push changes to GitHub
3. Cloudflare Pages will automatically deploy the updated functions

## Security

- All traffic is proxied through Cloudflare, providing DDoS protection
- The chrome extension continues to work without changes since the /app path is preserved
- Both sites remain on the same origin (vexa.ai), avoiding CORS issues 