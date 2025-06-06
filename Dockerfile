# ---- Base Stage ----
# Install dependencies
FROM node:20-alpine AS base
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
# Install pnpm and all dependencies (including devDependencies)
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# ---- Builder Stage ----
# Build the application
FROM base AS builder

# Accept ADMIN_API_TOKEN as a build argument
ARG ADMIN_API_TOKEN
# Make it available as an environment variable during this build stage
ENV ADMIN_API_TOKEN=$ADMIN_API_TOKEN

WORKDIR /app
# Copy all source files (respecting .dockerignore or .gitignore for gcloud builds submit)
COPY . .
# Run the build (output: 'standalone' is configured in next.config.mjs)
RUN pnpm run build

# ---- Runner Stage ----
# Create the final, lean production image
FROM node:20-alpine AS runner
WORKDIR /app

# Set environment variables for production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# PORT will be set by Cloud Run, but 3000 is a common default if run locally
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Make ADMIN_API_TOKEN available in the runner stage as well
# It can be overridden by Cloud Run service environment variables at runtime
ARG ADMIN_API_TOKEN
ENV ADMIN_API_TOKEN=$ADMIN_API_TOKEN

# Copy the standalone output from the builder stage.
# This includes the server.js and other necessary files for running the app.
COPY --from=builder /app/.next/standalone ./

# Copy the public assets from the builder stage to the 'public' directory
# in the standalone app directory. The standalone server.js will serve these.
COPY --from=builder /app/public ./public

# Copy the static Next.js assets (JS, CSS chunks) from the builder stage
# to the '.next/static' directory within the standalone app directory.
# The server.js will serve these from .next/static.
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app runs on
EXPOSE 3000

# The command to run the standalone server.
# We are in /app, which now contains the contents of .next/standalone.
CMD ["node", "server.js"] 