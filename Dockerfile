# ============================================
# Base Stage: Setup Node.js and pnpm
# ============================================
FROM node:22-alpine AS base

# Enable pnpm package manager via corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# ============================================
# Dependencies Stage: Install all dependencies
# ============================================
FROM base AS dependencies

WORKDIR /app

# Copy package manager files first for better layer caching
COPY pnpm-lock.yaml ./
COPY package.json ./

# Install all dependencies (including devDependencies for build stage)
RUN pnpm install --frozen-lockfile

# ============================================
# Builder Stage: Compile TypeScript and generate Prisma client
# ============================================
FROM base AS builder

WORKDIR /app

# Copy entire source code
COPY . .

# Copy node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Generate Prisma client (outputs to src/generated/prisma)
# Note: DATABASE_URL is required by prisma.config.ts but not actually used during generation
ARG DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
ENV DATABASE_URL=${DATABASE_URL}
RUN pnpm dlx prisma generate

# Build TypeScript to JavaScript (outputs to dist/)
RUN pnpm build

# Remove devDependencies, keep only production dependencies
RUN pnpm prune --prod

# ============================================
# Runtime Stage: Final production image
# ============================================
FROM base AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy production dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy compiled application
COPY --from=builder /app/dist ./dist

# Copy Prisma schema and migrations (needed for runtime)
COPY --from=builder /app/prisma ./prisma

# Copy package.json for metadata
COPY --from=builder /app/package.json ./package.json

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port (can be overridden by APP_PORT env var at runtime)
EXPOSE 3000

# Health check using the application's health endpoint
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.APP_PORT || 3000) + (process.env.APP_BASE_PATH || '/api/v1') + '/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/app/server.js"]
