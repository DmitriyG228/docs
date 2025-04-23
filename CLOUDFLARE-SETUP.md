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
     - `OLD_SITE_URL`: Your current Google Cloud URL (e.g., `https://old-vexa-app.com`)

3. **Deploy:**
   - Click "Save and Deploy"
   - Wait for the build to complete

### 3. Update DNS Configuration

1. **Access Cloudflare DNS Settings:**
   - Go to Cloudflare Dashboard → vexa.ai → DNS

2. **Remove Existing Records:**
   - Remove all existing A/AAAA records for vexa.ai (the Google Cloud ones)

3. **Add New DNS Record:**
   - Type: A
   - Name: @ (apex domain)
   - IPv4 address: 192.0.2.1 (placeholder - the actual IP doesn't matter)
   - Proxy status: Proxied (toggle orange cloud ON)

4. **Set up Custom Domain:**
   - Go to Workers & Pages → Your "portal" project → Custom domains
   - Add custom domain: vexa.ai

### 4. Testing

After DNS propagation (usually 5-10 minutes), verify:

1. `https://vexa.ai/` - Should show new portal
2. `https://vexa.ai/app/` - Should route to old app 
3. `https://vexa.ai/assistant/` - Should route to old assistant

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