# Cloudflare Pages Configuration for Vexa.ai

This document explains how the Vexa.ai site is set up to serve both the new portal and the legacy application.

## Environment Variables

When deploying to Cloudflare Pages, you'll need to set up the following environment variables:

```
OLD_SITE_URL=https://current-vexa-site.com  # Your current Google Cloud URL
```

## DNS Configuration

1. Remove all existing A/AAAA records from Cloudflare DNS settings for vexa.ai
2. Add a single A record:
   - Type: A
   - Name: vexa.ai (apex domain)
   - Value: 192.0.2.1 (placeholder - never actually used)
   - Proxy status: Proxied (orange cloud ON)

## How it Works

The site uses Cloudflare Pages Functions to route requests:

- `vexa.ai/` → New portal site (served directly from Cloudflare Pages)
- `vexa.ai/app/*` → Legacy app (proxied to old site)
- `vexa.ai/assistant/*` → Legacy assistant (proxied to old site)

## Deployment Steps

1. Push this repository to GitHub
2. In Cloudflare Pages:
   - Connect to the GitHub repository
   - Set build command: `npm run build`
   - Set build output directory: `.vercel/output/static`
   - Set Node.js version: 20.x
   - Add required environment variables
3. After deployment, update your DNS settings as described above 