#!/usr/bin/env bash
# Builds dashboard/, merges the export into web_dist/ (never touching the
# site/ landing page's index.html), commits+pushes, then deploys via wrangler.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Building dashboard/ ..."
cd dashboard
rm -rf out
npm run build
cd ..

echo "==> Syncing build output into web_dist/ (keeping index.html/index.txt untouched) ..."
rsync -a --exclude 'index.html' --exclude 'index.txt' dashboard/out/ web_dist/
rm -rf dashboard/out

git add web_dist

if git diff --cached --quiet; then
  echo "==> No changes to deploy."
else
  read -r -p "Commit message [Deploy: dashboard update]: " msg
  msg=${msg:-"Deploy: dashboard update"}
  git commit -m "$msg"
  git push origin main
fi

echo "==> Deploying to Cloudflare Workers ..."
npx wrangler deploy

echo "✅ Done: https://johnyos.sj-siwat.workers.dev"
