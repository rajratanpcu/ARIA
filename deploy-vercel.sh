#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  ARIA - Vercel Production Deployment Helper"
echo "========================================================"
echo ""

if command -v vercel &> /dev/null; then
  echo "Vercel CLI found. Initiating production deployment..."
  vercel --prod
else
  echo "Vercel CLI not installed globally. Using npx vercel..."
  npx --yes vercel --prod
fi

echo ""
echo "========================================================"
echo "  [SUCCESS] Deployment complete!"
echo "========================================================"
