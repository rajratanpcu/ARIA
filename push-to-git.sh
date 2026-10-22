#!/usr/bin/env bash
set -e

echo "========================================================"
echo "  ARIA - Pushing to GitHub (rajratanpcu/ARIA)"
echo "========================================================"
echo ""

if ! git remote get-url origin &> /dev/null; then
  git remote add origin https://github.com/rajratanpcu/ARIA.git
fi

echo "Remote set to: https://github.com/rajratanpcu/ARIA.git"
echo "Pushing branch 'main' to origin..."
git push -u origin main
echo ""
echo "========================================================"
echo "  [SUCCESS] Code successfully pushed to GitHub!"
echo "========================================================"
