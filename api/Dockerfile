# Use the official Node.js 22 alpine image
FROM node:22-alpine AS base

# Enable pnpm via corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Production dependencies stage
FROM base AS prod-deps
RUN pnpm install --prod --frozen-lockfile

# Build stage
FROM base AS build
RUN pnpm install --frozen-lockfile
COPY . .
# Generate Prisma client
RUN pnpm prisma generate
# Build the application
RUN pnpm run build

# Production stage
FROM base AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

WORKDIR /app

# Copy production dependencies from prod-deps stage
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy Prisma schema
COPY --from=build /app/prisma ./prisma

# Generate Prisma client for production
RUN npx -y prisma@6.16.3 generate

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Change ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose the port the app runs on
EXPOSE 3333

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3333/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/server.js"]