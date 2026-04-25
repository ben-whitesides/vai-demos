#!/usr/bin/env bash
# AVANTI OS Brain — one-command PR prep flow.
# Usage:
#   VAI_API_ROOT="/abs/path/to/vai-api" bash 08-scripts/pr-ready-all-in-one.sh
# Optional migration:
#   DATABASE_URL=... APPLY_MIGRATION=1 VAI_API_ROOT=... bash 08-scripts/pr-ready-all-in-one.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VAI_API_ROOT="${VAI_API_ROOT:-/Users/benjaminwhitesides/Desktop/VAI DEV/vai-club-os-build/vai-api}"
APPLY_MIGRATION="${APPLY_MIGRATION:-0}"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  AVANTI OS Brain — PR Ready All-in-One"
echo "═══════════════════════════════════════════════════════"
echo ""

bash "$PKG_ROOT/08-scripts/setup-avanti-feature.sh"
bash "$PKG_ROOT/08-scripts/apply-handoff-to-vai-api.sh"

if [ "$APPLY_MIGRATION" = "1" ]; then
  if [ -z "${DATABASE_URL:-}" ]; then
    echo "DATABASE_URL not set; cannot apply migration."
    exit 1
  fi
  echo "Applying migration 061..."
  psql "$DATABASE_URL" < "$PKG_ROOT/02-data-model/061_home_screen_grid.sql"
fi

bash "$PKG_ROOT/08-scripts/pr-ready-verify.sh"

echo "All-in-one flow complete."
