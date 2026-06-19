# syntax=docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript -> dist
RUN npx tsc --project tsconfig.json --outDir dist

ENV PORT=5000
EXPOSE 5000

CMD ["node", "dist/index.js"]

