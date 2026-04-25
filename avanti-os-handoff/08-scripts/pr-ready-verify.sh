#!/usr/bin/env bash
# AVANTI OS Brain — PR readiness verifier (compile + checks + optional API smoke tests).
# Usage:
#   VAI_API_ROOT="/abs/path/to/vai-api" bash 08-scripts/pr-ready-verify.sh
# Optional:
#   API_URL=http://localhost:5000 USER_TOKEN=... bash 08-scripts/pr-ready-verify.sh
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
pass() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; FAILED=1; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VAI_API_ROOT="${VAI_API_ROOT:-/Users/benjaminwhitesides/Desktop/VAI DEV/vai-club-os-build/vai-api}"
FAILED=0

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  AVANTI OS Brain — PR Readiness Verify"
echo "═══════════════════════════════════════════════════════"
echo ""

[ -d "$VAI_API_ROOT" ] || { echo "VAI_API_ROOT not found: $VAI_API_ROOT"; exit 1; }

echo "[ 1/6 ] Tooling"
if command -v dotnet >/dev/null 2>&1; then
  pass "dotnet found: $(dotnet --version)"
else
  fail "dotnet not found in PATH"
fi
if command -v rg >/dev/null 2>&1; then
  pass "rg found"
else
  fail "rg not found in PATH"
fi

echo ""
echo "[ 2/6 ] Required files present in vai-api"
required=(
  "Features/Avanti/Core/IAvantiFeatureAdapter.cs"
  "Features/Avanti/Core/IAvantiActionService.cs"
  "Features/Avanti/Core/AvantiActionService.cs"
  "Features/Avanti/Core/AvantiActionRunWriter.cs"
  "Features/Avanti/Core/AvantiProactiveScanWriter.cs"
  "Features/Avanti/AvantiActionV1Controller.cs"
)
for rel in "${required[@]}"; do
  if [ -f "$VAI_API_ROOT/$rel" ]; then
    pass "$rel"
  else
    fail "Missing $rel"
  fi
done

echo ""
echo "[ 3/6 ] Static policy checks"
if rg -n "ex\\.Message" "$VAI_API_ROOT/Features/Avanti" >/dev/null 2>&1; then
  fail "Found raw ex.Message exposure in Avanti feature"
else
  pass "No raw ex.Message exposure in Avanti feature"
fi

if rg -n 'Date\\.now\\(' "$PKG_ROOT/05-mobile-package/src/features/avanti/actionsApi.ts" >/dev/null 2>&1; then
  fail "actionsApi.ts still uses Date.now() for idempotency keys"
else
  pass "actionsApi.ts does not use Date.now() idempotency keys"
fi

if rg -n 'SingleOrDefault\(' "$VAI_API_ROOT/Features/Avanti/Core/AvantiActionService.cs" >/dev/null 2>&1; then
  fail "SingleOrDefault still used for adapter resolution"
else
  pass "Adapter resolution avoids SingleOrDefault crash path"
fi

if rg -n 'Tier \?\? "free"' "$VAI_API_ROOT/Features/Avanti/AvantiActionV1Controller.cs" >/dev/null 2>&1; then
  fail "Hardcoded free-tier fallback detected"
else
  pass "No hardcoded free-tier fallback"
fi

echo ""
echo "[ 4/6 ] dotnet build"
if command -v dotnet >/dev/null 2>&1; then
  if [ -f "$VAI_API_ROOT/../Vai.sln" ]; then
    if dotnet build "$VAI_API_ROOT/../Vai.sln" >/tmp/avanti-dotnet-build.log 2>&1; then
      pass "dotnet build succeeded (Vai.sln)"
    else
      fail "dotnet build failed (Vai.sln). See /tmp/avanti-dotnet-build.log"
    fi
  else
    warn "Vai.sln not found at expected location; skipping build step"
  fi
fi

echo ""
echo "[ 5/6 ] Adapter registration count"
adapter_regs="$(rg -n "AddScoped<IAvantiFeatureAdapter" "$VAI_API_ROOT" --glob "*.cs" | wc -l | tr -d ' ')"
if [ "${adapter_regs:-0}" -ge 5 ]; then
  pass "Found $adapter_regs IAvantiFeatureAdapter DI registrations"
else
  fail "Expected at least 5 IAvantiFeatureAdapter DI registrations, found ${adapter_regs:-0}"
fi

echo ""
echo "[ 6/6 ] Optional live endpoint validation"
if [ -n "${API_URL:-}" ] && [ -n "${USER_TOKEN:-}" ]; then
  if bash "$PKG_ROOT/08-scripts/validate-avanti-endpoints.sh"; then
    pass "Live endpoint validation passed"
  else
    fail "Live endpoint validation failed"
  fi
else
  warn "Skipping live endpoint validation (set API_URL and USER_TOKEN to run it)"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}PR readiness checks passed.${NC}"
else
  echo -e "${RED}PR readiness checks failed. Fix issues above.${NC}"
fi
echo "═══════════════════════════════════════════════════════"
echo ""

exit "$FAILED"
