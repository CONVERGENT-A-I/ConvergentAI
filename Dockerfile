# syntax=docker/dockerfile:1

FROM node:20-alpine AS base
WORKDIR /app

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# -----------------------------
# Dependencies
# -----------------------------
FROM base AS deps

COPY package*.json ./
RUN npm ci

# -----------------------------
# Builder
# -----------------------------
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js app
RUN npm run build

# -----------------------------
# Runner
# -----------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copy only runtime files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]
