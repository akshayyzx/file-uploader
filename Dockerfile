# syntax=docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript -> dist
# Set rootDir explicitly to satisfy TS5011.
RUN npx tsc --project tsconfig.json --rootDir ./src --outDir dist

ENV PORT=5000
EXPOSE 5000

CMD ["node", "dist/index.js"]

