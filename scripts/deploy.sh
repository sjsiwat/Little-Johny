#!/usr/bin/env bash
# Builds both Next.js apps into a clean web_dist/, then deploys the Worker.
#
# web_dist/ is a build artifact and is NOT tracked in git — it is rebuilt from
# scratch every run, so no orphaned chunks can accumulate.
#
#   site/       → /            /about  /signup
#   dashboard/  → /dashboard   /tasks  /notes  /expenses  /calendar  /review
set -euo pipefail

cd "$(dirname "$0")/.."
OUT=web_dist

echo "==> Cleaning $OUT ..."
rm -rf "$OUT" site/out dashboard/out
mkdir -p "$OUT"

echo "==> Building site/ (landing) ..."
npm --prefix site run build
cp -R site/out/. "$OUT"/

echo "==> Building dashboard/ (app) ..."
npm --prefix dashboard run build
# The landing page owns / — keep its index.html and skip the dashboard's.
rsync -a --exclude 'index.html' --exclude 'index.txt' dashboard/out/ "$OUT"/

echo "==> Adding security headers ..."
cp server/headers "$OUT"/_headers

rm -rf site/out dashboard/out

echo "==> Deploying to Cloudflare Workers ..."
npx wrangler deploy -c server/wrangler.toml

echo "✅ Done: https://johnyos.sj-siwat.workers.dev"
