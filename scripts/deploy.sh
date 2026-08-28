#!/usr/bin/env bash
# Builds the app into web_dist/ and deploys the Worker.
# web_dist/ is a build artifact — gitignored and rebuilt from scratch each run.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Building ..."
npm run build
cp server/headers web_dist/_headers

echo "==> Deploying to Cloudflare Workers ..."
npx wrangler deploy -c server/wrangler.toml

echo "✅ Done: https://johnyos.sj-siwat.workers.dev"
