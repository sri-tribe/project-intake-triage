FROM node:20-bookworm-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

COPY . .

# Needed for `prisma generate` during build (overridden at runtime in Compose)
ENV DATABASE_URL="file:./prisma/build.db"

RUN npm run test:gate
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# prestart runs test:gate before next start
CMD sh -c "mkdir -p /app/data && npx prisma db push --accept-data-loss && npm run start -- --hostname 0.0.0.0 --port 3000"
