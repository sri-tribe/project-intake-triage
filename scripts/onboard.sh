#!/usr/bin/env bash
# One-shot local setup: .env, Docker dev container, DB schema, seed data.
# Usage: from repo root, run:  bash scripts/onboard.sh
#   or:   chmod +x scripts/onboard.sh && ./scripts/onboard.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "== Intake triage — onboarding =="
echo ""

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed or not on your PATH."
  echo "Install Docker Desktop: https://www.docker.com/products/docker-desktop/"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker is installed but the daemon is not running."
  echo "Start Docker Desktop and wait until it is ready, then run this script again."
  exit 1
fi

if [ ! -f .env ]; then
  if [ ! -f .env.example ]; then
    echo "Missing .env.example — are you in the project root?"
    exit 1
  fi
  cp .env.example .env
  echo "Created .env from .env.example"
  echo "  → Add OPENAI_API_KEY to .env for AI summaries and the chat assistant (optional)."
  echo ""
else
  echo "Using existing .env (not overwritten)."
  echo ""
fi

echo "Starting dev container (first run may download/build for several minutes)..."
docker compose up -d dev

echo "Waiting until the container accepts commands..."
ready=0
for i in $(seq 1 90); do
  if docker compose exec -T dev true >/dev/null 2>&1; then
    ready=1
    break
  fi
  sleep 2
done

if [ "$ready" -ne 1 ]; then
  echo "Timed out waiting for the dev container. Check: docker compose logs dev"
  exit 1
fi

echo "Ensuring dependencies in the container (needed the first time because of the node_modules volume)..."
# Named volume overlays /app/node_modules; Prisma seed needs tsx (devDependency), not only next.
if docker compose exec -T dev sh -c "test -x node_modules/.bin/next && test -x node_modules/.bin/tsx" 2>/dev/null; then
  echo "  node_modules looks complete — skipping npm install."
else
  echo "  Running npm install inside the container..."
  docker compose exec -T dev npm install
fi

echo "Applying database schema..."
docker compose exec -T dev npx prisma db push

echo "Seeding demo users, intakes, and (if OPENAI_API_KEY is set) AI metadata..."
docker compose exec -T dev npm run db:seed

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Done. Open:  http://localhost:3000"
echo ""
echo "Try logging in as admin:"
echo "  Email:    admin@intake.local"
echo "  Password: ChangeMeAdmin!23"
echo ""
echo "Demo users share password DemoUserPass!23 — see README or .env.example."
echo ""
echo "The app is running in the background. To view logs:  docker compose logs -f dev"
echo "To stop:                                              docker compose down"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
