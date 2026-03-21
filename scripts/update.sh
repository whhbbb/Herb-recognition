#!/usr/bin/env bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BRANCH="${1:-main}"

cd "$PROJECT_DIR"

echo "[frontend] project: $PROJECT_DIR"
echo "[frontend] branch:  $BRANCH"

if [ -d .git ] && command -v git >/dev/null 2>&1; then
  echo "[frontend] pulling latest code..."
  git fetch origin
  git checkout "$BRANCH"
  git pull --ff-only origin "$BRANCH"
else
  echo "[frontend] git not found or .git missing, skip pull"
fi

if [ -f package-lock.json ]; then
  PM="npm"
elif [ -f pnpm-lock.yaml ]; then
  PM="pnpm"
else
  PM="npm"
fi

echo "[frontend] package manager: $PM"
if [ "$PM" = "pnpm" ]; then
  if ! command -v pnpm >/dev/null 2>&1; then
    echo "[frontend] pnpm not found, installing via npm..."
    npm install -g pnpm
  fi
  pnpm install --frozen-lockfile
  pnpm run build
else
  npm install
  npm run build
fi

echo "[frontend] done. dist updated at: $PROJECT_DIR/dist"
