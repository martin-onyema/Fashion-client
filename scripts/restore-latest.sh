#!/usr/bin/env bash
# Restore latest workspace from the persistent /tmp mirror.
# The environment sometimes resets /home/z/my-project to an older snapshot;
# /tmp/my-project holds the latest state and survives resets.
# Usage: bash /tmp/my-project/scripts/restore-latest.sh
set -e

SRC=/tmp/my-project
DST=/home/z/my-project

echo "==> Stopping any running dev server..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "bun run dev" 2>/dev/null || true
sleep 2

echo "==> Rsyncing mirror -> workspace..."
rsync -a --no-group --no-owner \
  --exclude node_modules --exclude .next --exclude dev.log \
  --exclude .turbo --exclude .git \
  "$SRC/" "$DST/"

echo "==> Syncing deliverable zips..."
mkdir -p "$DST/public/downloads"
cp "$DST"/download/*.zip "$DST"/public/downloads/ 2>/dev/null || true

echo "==> Prisma generate (sqlite schema)..."
cd "$DST"
bunx prisma generate --schema=prisma/schema.sqlite.prisma

echo "==> Starting dev server..."
setsid bash -c "cd $DST && nohup bun run dev > dev.log 2>&1 &"

echo "==> Restore complete. Waiting for first compile..."
sleep 12
curl -s -o /dev/null -w "HOME: %{http_code}\n" http://localhost:3000 --max-time 90 || true
