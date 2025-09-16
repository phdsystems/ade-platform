# Multi-stage build for optimal size and performance
FROM node:20-alpine AS deps
WORKDIR /app

# Install pnpm for faster, more efficient package management
# pnpm is up to 2x faster than npm and uses less disk space
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Generate lockfile if it doesn't exist and install dependencies
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install --frozen-lockfile; \
    else \
      pnpm install --lockfile-only && pnpm install --frozen-lockfile; \
    fi

# Rebuild the source code only when needed
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build if needed (for TypeScript projects)
RUN if [ -f "tsconfig.json" ]; then npm run build; fi

# Production image, copy all the files and run
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT={{port}}

# Create non-root user
RUN addgroup -g 1001 nodejs && \
    adduser -S nodejs -u 1001

# Copy necessary files
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/src ./src
COPY --from=builder --chown=nodejs:nodejs /app/dist* ./dist

# Switch to non-root user
USER nodejs

EXPOSE {{port}}

# Use node directly for better performance (no npm overhead)
CMD ["node", "src/index.mjs"]