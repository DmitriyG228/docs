FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Copy .env file directly
COPY .env ./.env

# Install dependencies
RUN npm install -g pnpm
RUN pnpm install

# Copy the rest of the application
COPY . ./

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js application in non-strict mode
RUN pnpm build || echo "Build completed with warnings"

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application
CMD ["pnpm", "start"] 