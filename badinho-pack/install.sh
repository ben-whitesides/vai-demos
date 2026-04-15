#!/usr/bin/env bash
#
# VAI Public Profile Template — Badinho Install Script
#
# Installs the template + Next.js page + types + OG route into a vai-game-day
# checkout at the correct paths. Idempotent (safe to re-run). Creates a feature
# branch so nothing clobbers main.
#
# Usage:
#   cd ~/code/vai-game-day
#   ~/vai-demos/badinho-pack/install.sh
#
# What it does:
#   1. Checks you're in a git repo
#   2. Creates a feature branch: feat/public-profile-redesign-<date>
#   3. Creates app/public-profile/[id]/ directory
#   4. Copies route.ts, types.ts, template.html
#   5. Creates app/api/og/[id]/ directory and copies og-route.tsx → route.tsx
#   6. Installs @vercel/og if missing
#   7. Prints next steps (TODO markers to wire your fetcher)

set -euo pipefail

# Resolve the pack directory (where this script lives) — works regardless of cwd
PACK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(pwd)"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "VAI Public Profile — install.sh"
echo "Pack source: $PACK_DIR"
echo "Repo target: $REPO_ROOT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# --- Guard: must be a git repo AND look like vai-game-day (prevents dropping files in the wrong project)
if [ ! -d ".git" ]; then
  echo "ERROR: not inside a git repo. cd into vai-game-day first."
  exit 1
fi

REMOTE_URL="$(git remote get-url origin 2>/dev/null || echo '')"
PKG_NAME="$(node -p "require('./package.json').name" 2>/dev/null || echo '')"
if [[ "$REMOTE_URL" != *"vai-game-day"* ]] && [[ "$PKG_NAME" != *"vai"* ]] && [[ "$PKG_NAME" != *"game-day"* ]]; then
  echo "ERROR: this does not look like the vai-game-day repo."
  echo "  git remote origin: $REMOTE_URL"
  echo "  package.json name: $PKG_NAME"
  echo "  Refusing to install — you probably cd'd into the wrong project."
  echo "  Override with: VAI_INSTALL_FORCE=1 $0"
  [ "${VAI_INSTALL_FORCE:-}" != "1" ] && exit 1
fi

# --- Guard: uncommitted changes?
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
  echo "WARNING: repo has uncommitted changes. Commit or stash before installing."
  echo "Run: git status"
  exit 1
fi

# --- Step 1: feature branch
BRANCH="feat/public-profile-redesign-$(date +%Y%m%d)"
echo
echo "[1/6] Creating feature branch: $BRANCH"
if git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
  echo "  Branch already exists — switching to it"
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
fi

# --- Step 2: directories
echo
echo "[2/6] Creating directory structure..."
mkdir -p "app/public-profile/[id]"
mkdir -p "app/api/og/[id]"
echo "  ✓ app/public-profile/[id]/"
echo "  ✓ app/api/og/[id]/"

# --- Step 3: copy template HTML
echo
echo "[3/6] Copying template.html..."
if [ -f "$PACK_DIR/../vai-profile-public-redesign.html" ]; then
  cp "$PACK_DIR/../vai-profile-public-redesign.html" "app/public-profile/[id]/template.html"
  echo "  ✓ app/public-profile/[id]/template.html"
else
  echo "  ERROR: vai-profile-public-redesign.html not found at $PACK_DIR/.."
  exit 1
fi

# --- Step 4: copy route.ts + types.ts
echo
echo "[4/6] Copying route.ts and types.ts..."
cp "$PACK_DIR/route.ts" "app/public-profile/[id]/route.ts"
cp "$PACK_DIR/types.ts" "app/public-profile/[id]/types.ts"
echo "  ✓ app/public-profile/[id]/route.ts    (Next.js Route Handler — returns raw HTML)"
echo "  ✓ app/public-profile/[id]/types.ts    (VaiProfile TypeScript contract)"

# --- Step 5: copy og route
echo
echo "[5/6] Copying OG image route..."
cp "$PACK_DIR/og-route.tsx" "app/api/og/[id]/route.tsx"
echo "  ✓ app/api/og/[id]/route.tsx"

# --- Step 6: install @vercel/og if missing
echo
echo "[6/6] Checking @vercel/og dependency..."
if grep -q '"@vercel/og"' package.json 2>/dev/null; then
  echo "  ✓ @vercel/og already in package.json"
else
  echo "  Installing @vercel/og..."
  npm install @vercel/og
fi

# --- Summary
echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ INSTALL COMPLETE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
echo "Files installed:"
echo "  app/public-profile/[id]/route.ts       ← Next.js Route Handler (WIRE TODO #1)"
echo "  app/public-profile/[id]/types.ts       ← VaiProfile TypeScript contract"
echo "  app/public-profile/[id]/template.html  ← Self-hydrating template (no changes needed)"
echo "  app/api/og/[id]/route.tsx              ← OG image generator (WIRE TODO #1)"
echo
echo "Next steps:"
echo "  1. Edit app/public-profile/[id]/route.ts   — wire getVaiProfile() to your fetcher"
echo "  2. Edit app/api/og/[id]/route.tsx          — wire same fetcher (lighter display fields)"
echo "  3. Run: ~/vai-demos/badinho-pack/find-redirect.sh"
echo "       → surfaces any legacy /profile → /highlights redirect to remove"
echo "  4. Run: ~/vai-demos/badinho-pack/chat-route-probe.sh"
echo "       → confirms /chat/[id] app route status"
echo "  5. npm run dev                             — verify template renders at /public-profile/<any-id>?public=<any-token>"
echo "  6. git add . && git commit -m 'feat: public profile redesign (template + OG route)'"
echo "  7. git push -u origin $BRANCH"
echo "  8. gh pr create — title: 'Public Profile Redesign v2'"
echo
echo "Spec + template audit trail:"
echo "  https://github.com/ben-whitesides/vai-demos/blob/main/BADINHO-PROFILE-SPEC.md"
echo
