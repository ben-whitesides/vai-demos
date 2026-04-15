#!/usr/bin/env bash
#
# VAI Legacy Redirect Finder
#
# Open question: "Current prod redirects /profile/[id]?public=[token] → /profile/[id]/highlights?public=[token].
#                 Kill or preserve?"
# Recommendation: KILL IT. Template handles the single canonical URL cleanly;
# the redirect is legacy cruft from the prior Material-UI implementation.
#
# This script locates the redirect in your repo so you know exactly what to remove.
# Run from the root of the vai-game-day repo (or wherever the app.vai.app source lives).
#
# Usage:
#   cd ~/code/vai-game-day
#   ~/vai-demos/badinho-pack/find-redirect.sh
#

set -euo pipefail

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Legacy /profile → /highlights redirect finder"
echo "Scan root: $(pwd)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

echo "[1/4] Searching for /highlights redirect logic..."
grep -rn --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' \
  -E '(redirect|router\.push|router\.replace).{0,40}highlights' \
  . 2>/dev/null | grep -v node_modules | grep -v '\.next' || echo "  (none found — good)"
echo

echo "[2/4] Searching for meta-refresh redirect tags..."
grep -rn --include='*.html' --include='*.tsx' --include='*.jsx' \
  -E 'http-equiv=.refresh.*highlights' \
  . 2>/dev/null | grep -v node_modules || echo "  (none found)"
echo

echo "[3/4] Searching for middleware.ts redirect rules..."
if [ -f "middleware.ts" ]; then
  grep -n -E 'profile|highlights' middleware.ts || echo "  (middleware.ts exists but no profile/highlights rules)"
else
  echo "  (no root middleware.ts — check app/middleware.ts or pages/_middleware.ts)"
fi
echo

echo "[4/4] Checking for Next.js config redirects..."
if [ -f "next.config.js" ] || [ -f "next.config.mjs" ] || [ -f "next.config.ts" ]; then
  grep -n -A 5 'redirects' next.config.* 2>/dev/null | head -40 || echo "  (no redirects() export)"
else
  echo "  (no next.config.* found)"
fi
echo

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Remediation:"
echo "  • If the redirect lives in middleware.ts, delete the matching rule"
echo "  • If it lives in app/profile/[id]/page.tsx as a router.replace(), remove"
echo "    it and let app/public-profile/[id]/page.tsx serve the canonical URL"
echo "  • If it lives in next.config.js redirects(), remove the matching entry"
echo "  • After removal: verify /profile/[id]?public=[token] renders the template"
echo "    directly (no redirect), and /profile/[id]/highlights still 200s (keep"
echo "    the sub-route for backward compat with existing shared links)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
