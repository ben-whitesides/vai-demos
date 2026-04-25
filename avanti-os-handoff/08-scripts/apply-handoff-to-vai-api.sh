#!/usr/bin/env bash
# AVANTI OS Brain — Apply handoff files into vai-api.
# Usage:
#   VAI_API_ROOT="/abs/path/to/vai-api" bash 08-scripts/apply-handoff-to-vai-api.sh
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
pass() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; exit 1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VAI_API_ROOT="${VAI_API_ROOT:-/Users/benjaminwhitesides/Desktop/VAI DEV/vai-club-os-build/vai-api}"

[ -d "$VAI_API_ROOT" ] || fail "VAI_API_ROOT not found: $VAI_API_ROOT"
[ -d "$VAI_API_ROOT/Features" ] || fail "Invalid vai-api root (missing Features/): $VAI_API_ROOT"

BACKUP_ROOT="$PKG_ROOT/.backup/$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_ROOT"

echo ""
echo "Applying AVANTI handoff files into:"
echo "  $VAI_API_ROOT"
echo "Backup snapshot:"
echo "  $BACKUP_ROOT"
echo ""

copy_file() {
  local src="$1"
  local dst="$2"
  local dst_dir
  dst_dir="$(dirname "$dst")"
  mkdir -p "$dst_dir"

  if [ -f "$dst" ]; then
    local rel
    rel="${dst#$VAI_API_ROOT/}"
    mkdir -p "$BACKUP_ROOT/$(dirname "$rel")"
    cp "$dst" "$BACKUP_ROOT/$rel"
    warn "Backed up existing: $rel"
  fi

  cp "$src" "$dst"
  pass "Copied: ${dst#$VAI_API_ROOT/}"
}

# Core interfaces + service/controller pieces
copy_file "$PKG_ROOT/04-core-interfaces/IAvantiFeatureAdapter.cs" \
  "$VAI_API_ROOT/Features/Avanti/Core/IAvantiFeatureAdapter.cs"
copy_file "$PKG_ROOT/04-core-interfaces/IAvantiActionService.cs" \
  "$VAI_API_ROOT/Features/Avanti/Core/IAvantiActionService.cs"
copy_file "$PKG_ROOT/04-core-interfaces/AvantiActionService.cs" \
  "$VAI_API_ROOT/Features/Avanti/Core/AvantiActionService.cs"
copy_file "$PKG_ROOT/04-core-interfaces/AvantiActionRunWriter.cs" \
  "$VAI_API_ROOT/Features/Avanti/Core/AvantiActionRunWriter.cs"
copy_file "$PKG_ROOT/04-core-interfaces/AvantiProactiveScanWriter.cs" \
  "$VAI_API_ROOT/Features/Avanti/Core/AvantiProactiveScanWriter.cs"
copy_file "$PKG_ROOT/04-core-interfaces/AvantiActionV1Controller.cs" \
  "$VAI_API_ROOT/Features/Avanti/AvantiActionV1Controller.cs"
copy_file "$PKG_ROOT/04-core-interfaces/AvantiDependencyResolution.cs" \
  "$VAI_API_ROOT/Features/Avanti/AvantiDependencyResolution.cs"
copy_file "$PKG_ROOT/04-core-interfaces/AuthorizeAnyScopesAttribute.cs" \
  "$VAI_API_ROOT/Infrastructure/Attributes/AuthorizeAnyScopesAttribute.cs"
copy_file "$PKG_ROOT/04-core-interfaces/AnyScopeAuthorizationHandler.cs" \
  "$VAI_API_ROOT/Infrastructure/Auth/AnyScopeAuthorizationHandler.cs"

# Club OS adapters
copy_file "$PKG_ROOT/07-club-os-adapters/PlayStatusAvantiAdapter.cs" \
  "$VAI_API_ROOT/Features/ClubOS/Avanti/Adapters/PlayStatusAvantiAdapter.cs"
copy_file "$PKG_ROOT/07-club-os-adapters/RosterAvantiAdapter.cs" \
  "$VAI_API_ROOT/Features/ClubOS/Avanti/Adapters/RosterAvantiAdapter.cs"
copy_file "$PKG_ROOT/07-club-os-adapters/TournamentAvantiAdapter.cs" \
  "$VAI_API_ROOT/Features/ClubOS/Avanti/Adapters/TournamentAvantiAdapter.cs"
copy_file "$PKG_ROOT/07-club-os-adapters/StandingsAvantiAdapter.cs" \
  "$VAI_API_ROOT/Features/ClubOS/Avanti/Adapters/StandingsAvantiAdapter.cs"
copy_file "$PKG_ROOT/07-club-os-adapters/ExceptionsAvantiAdapter.cs" \
  "$VAI_API_ROOT/Features/ClubOS/Avanti/Adapters/ExceptionsAvantiAdapter.cs"

echo ""
pass "Handoff file application completed."
echo "Next:"
echo "  1) Register AvantiDependencyResolution.Configure(...) in central DI"
echo "  2) Run migration 061"
echo "  3) Run 08-scripts/pr-ready-verify.sh"
echo ""
