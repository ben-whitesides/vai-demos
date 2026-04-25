#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# VAI AVANTI OS Brain — Setup & Preflight
# Run before implementing: validates prerequisites are in place
# Usage: bash setup-avanti-feature.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

pass() { echo -e "${GREEN}✓${NC} $1"; }
fail() { echo -e "${RED}✗${NC} $1"; FAILED=1; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }

FAILED=0
VAI_API_ROOT="${VAI_API_ROOT:-./vai-api}"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  VAI AVANTI OS Brain — Preflight Check"
echo "═══════════════════════════════════════════════════════"
echo ""

# ── 1. vai-api structure ──────────────────────────────────────
echo "[ vai-api structure ]"

[ -d "$VAI_API_ROOT/Features" ] \
  && pass "Features/ directory exists" \
  || fail "Features/ directory missing — is VAI_API_ROOT set correctly? ($VAI_API_ROOT)"

[ -d "$VAI_API_ROOT/Infrastructure/Attributes" ] \
  && pass "Infrastructure/Attributes/ exists" \
  || warn "Infrastructure/Attributes/ missing — create it for AuthorizeAnyScopesAttribute"

[ -f "$VAI_API_ROOT/Infrastructure/Attributes/AuthorizeScopesAttribute.cs" ] \
  && pass "AuthorizeScopesAttribute.cs found (AND-semantics base)" \
  || warn "AuthorizeScopesAttribute.cs not found — verify attribute location"

[ -f "$VAI_API_ROOT/Infrastructure/Attributes/AuthorizeAnyScopesAttribute.cs" ] \
  && pass "AuthorizeAnyScopesAttribute.cs already present" \
  || warn "AuthorizeAnyScopesAttribute.cs not yet added — copy from 04-core-interfaces/"

# ── 2. Migration check ────────────────────────────────────────
echo ""
echo "[ Migration prerequisites ]"

DB_URL="${DATABASE_URL:-}"
if [ -z "$DB_URL" ]; then
  warn "DATABASE_URL not set — skipping live migration checks"
else
  # Check if migration 061 has been applied
  APPLIED=$(psql "$DB_URL" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='avanti_action_runs';" \
    2>/dev/null | tr -d ' ')

  if [ "$APPLIED" = "1" ]; then
    pass "avanti_action_runs table exists (migration 061 applied)"
  else
    warn "avanti_action_runs not found — run 02-data-model/061_home_screen_grid.sql first"
  fi

  PREFS=$(psql "$DB_URL" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_name='user_preferences';" \
    2>/dev/null | tr -d ' ')

  [ "$PREFS" = "1" ] \
    && pass "user_preferences table exists" \
    || warn "user_preferences not found — migration 061 needed"
fi

# ── 3. Existing Club OS AVANTI interfaces ─────────────────────
echo ""
echo "[ Club OS AVANTI prerequisites ]"

[ -f "$VAI_API_ROOT/Features/ClubOS/Avanti/AvantiService.cs" ] \
  && pass "Legacy AvantiService.cs exists (wrappable by ExceptionsAvantiAdapter)" \
  || warn "AvantiService.cs not found at expected path"

[ -f "$VAI_API_ROOT/Features/ClubOS/Compliance/ComplianceV1Controller.cs" ] \
  && pass "ComplianceV1Controller.cs exists" \
  || fail "ComplianceV1Controller.cs not found — verify vai-api path"

# Check for Green Line string in client-visible files
echo ""
echo "[ Green Line terminology scan ]"
GL_COUNT=$(grep -rn "Green Line\|green line\|green-line" \
  "$VAI_API_ROOT/Features" \
  --include="*.cs" \
  --exclude-dir=".git" \
  2>/dev/null | grep -v "GreenLine\|greenLine\|green_line" | wc -l | tr -d ' ')

if [ "$GL_COUNT" = "0" ]; then
  pass "No visible 'Green Line' strings in vai-api Features"
else
  warn "$GL_COUNT visible 'Green Line' occurrence(s) found — run patch before PR"
  grep -rn "Green Line\|green line\|green-line" \
    "$VAI_API_ROOT/Features" \
    --include="*.cs" \
    --exclude-dir=".git" \
    2>/dev/null | grep -v "GreenLine\|greenLine\|green_line" | head -10
fi

# ── 4. DI registration check ──────────────────────────────────
echo ""
echo "[ DI registration ]"

ADAPTER_REG=$(grep -rn "IAvantiFeatureAdapter" \
  "$VAI_API_ROOT" \
  --include="*.cs" \
  2>/dev/null | grep -c "AddScoped" || true)

if [ "$ADAPTER_REG" -ge 5 ]; then
  pass "$ADAPTER_REG IAvantiFeatureAdapter registrations found in DI"
elif [ "$ADAPTER_REG" -gt 0 ]; then
  warn "$ADAPTER_REG adapter registrations found — expected 5+ (Play Status, Roster, Tournaments, Standings, Exceptions)"
else
  warn "No IAvantiFeatureAdapter DI registrations found — add to DependencyResolution.cs"
fi

# ── Summary ───────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}  Preflight PASSED — ready to implement AVANTI OS Brain${NC}"
else
  echo -e "${RED}  Preflight FAILED — fix errors above before implementing${NC}"
fi
echo "═══════════════════════════════════════════════════════"
echo ""

exit $FAILED
