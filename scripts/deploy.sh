#!/usr/bin/env bash
# Builds the app into web_dist/ and deploys the Worker.
# Pushing to main does the same thing via Cloudflare Workers Builds;
# this is the manual path for deploying without a commit.
# web_dist/ is a build artifact — gitignored and rebuilt from scratch each run.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Building ..."
npm run build

echo "==> Deploying to Cloudflare Workers ..."
npx wrangler deploy

echo "✅ Done: https://johnyos.sj-siwat.workers.dev"
