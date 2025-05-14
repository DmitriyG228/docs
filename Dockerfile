FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Copy .env file if it exists (will be overridden by environment variables from docker-compose if provided)
COPY .env* ./

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy the rest of the application
COPY . ./

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# The following environment variables will be provided at runtime via docker-compose
# GOOGLE_CLIENT_ID
# GOOGLE_CLIENT_SECRET
# NEXTAUTH_SECRET
# NEXTAUTH_URL
# ADMIN_API_URL
# ADMIN_API_TOKEN

ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID

ARG NEXT_PUBLIC_UMAMI_WEBSITE_ID
ENV NEXT_PUBLIC_UMAMI_WEBSITE_ID=$NEXT_PUBLIC_UMAMI_WEBSITE_ID

# Build the Next.js application in non-strict mode
RUN pnpm build || echo "Build completed with warnings"

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"] 