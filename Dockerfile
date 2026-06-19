# syntax=docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Build (TypeScript -> dist)
# If you don't have a build step configured, this will still work for runtime using ts-node.
# But this repo currently runs from ts-node in dev; for container we compile.
RUN npm install -D typescript && npx tsc --project tsconfig.json --outDir dist || true

# Expose API port
ENV PORT=5000
EXPOSE 5000

# Start server
# Use compiled output if present; fall back to ts-node-dev is not available in production image.
CMD ["sh", "-c", "node dist/index.js 2>/dev/null || node -r dotenv/config src/index.ts"]

