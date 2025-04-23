#!/bin/bash
# Cloudflare Pages CLI deployment script

# Ensure wrangler is installed
if ! command -v wrangler &> /dev/null; then
  echo "Installing Wrangler CLI..."
  npm install -g wrangler
fi

# Ensure we're authenticated
echo "Ensuring Cloudflare authentication..."
wrangler whoami || (echo "Not authenticated. Please login with:" && wrangler login)

# Configure environment variables
echo "Setting environment variables..."
OLD_SITE_URL="${OLD_SITE_URL:-https://vexa-new-dashboard-733104961366.us-central1.run.app/}"
NODE_VERSION="${NODE_VERSION:-20.12.2}"

# Set the environment variables in Cloudflare
echo "Setting Cloudflare environment variables..."
wrangler pages project env set OLD_SITE_URL "$OLD_SITE_URL" --project-name portal
wrangler pages project env set NODE_VERSION "$NODE_VERSION" --project-name portal

# Build and deploy
echo "Building and deploying to Cloudflare Pages..."
wrangler pages deploy --project-name portal .

# For setting up custom domains through CLI
if [ ! -z "$DOMAIN" ]; then
  echo "Adding custom domain: $DOMAIN"
  wrangler pages domain add "$DOMAIN" --project-name portal
fi

echo "Deployment completed! Check the Cloudflare dashboard for details."
echo "Don't forget to set up DNS records as described in the CLOUDFLARE_deploy.md document." 