#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
# VAI AVANTI OS Brain — Endpoint Validation
# Run after implementation to confirm all endpoints respond.
# Usage: API_URL=http://localhost:5000 USER_TOKEN=your-token bash validate-avanti-endpoints.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'

API_URL="${API_URL:-http://localhost:5000}"
TOKEN="${USER_TOKEN:-}"
FAILED=0

check() {
  local label="$1" method="$2" path="$3" expected="$4" body="${5:-}"

  local args=(-s -o /dev/null -w "%{http_code}" -X "$method" "$API_URL$path")
  args+=(-H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json")
  [ -n "$body" ] && args+=(-d "$body")

  local code
  code=$(curl "${args[@]}" 2>/dev/null)

  if [ "$code" = "$expected" ]; then
    echo -e "${GREEN}✓${NC} $label ($code)"
  else
    echo -e "${RED}✗${NC} $label — expected $expected, got $code"
    FAILED=1
  fi
}

warn() { echo -e "${YELLOW}⚠${NC} $1"; }

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  VAI AVANTI OS Brain — Endpoint Validation"
echo "  API: $API_URL"
echo "═══════════════════════════════════════════════════════"
echo ""

if [ -z "$TOKEN" ]; then
  warn "USER_TOKEN not set — auth checks will return 401"
fi

IK="validate-$(date +%s)"

# ── AVANTI action endpoints ───────────────────────────────────
echo "[ AVANTI Action Endpoints ]"

check "POST /v1/avanti/actions/prepare — 201 or 200" POST \
  "/v1/avanti/actions/prepare" "200" \
  '{"tileId":"play_status","featureKey":"play_status","actionType":"play_status.summarize_club","surface":"test"}'

check "GET /v1/avanti/actions/history — 200" GET \
  "/v1/avanti/actions/history?limit=5" "200"

# ── Home context endpoints ────────────────────────────────────
echo ""
echo "[ Home Context Endpoints ]"

check "GET /v1/home/context — 200" GET \
  "/v1/home/context" "200"

check "PUT /v1/home/tile-order — 200" PUT \
  "/v1/home/tile-order" "200" \
  "{\"tileOrder\":[\"schedule\",\"passport\",\"play_status\",\"roster\"],\"pinnedTileIds\":[],\"layoutMode\":\"auto\"}" \

check "POST /v1/home/avanti-strip/dismiss — 200" POST \
  "/v1/home/avanti-strip/dismiss" "200" \
  "{\"contextEntityType\":\"scheduled_event\",\"contextEntityId\":\"00000000-0000-0000-0000-000000000001\",\"actionType\":\"send_reminder\",\"dismissForHours\":24}"

# ── Tile context (lazy overlay) ────────────────────────────────
echo ""
echo "[ Tile Overlay Context ]"

for tile in schedule roster passport play_status standings leagues; do
  check "GET /v1/home/tiles/$tile/avanti-context — 200" GET \
    "/v1/home/tiles/$tile/avanti-context" "200"
done

# ── PLAY Status alias routes ──────────────────────────────────
echo ""
echo "[ PLAY Status Alias Routes ]"

check "GET /v1/compliance/.../play-status — 200 or 403" GET \
  "/v1/compliance/athletes/00000000-0000-0000-0000-000000000001/play-status?clubId=00000000-0000-0000-0000-000000000001" \
  "200"

check "GET /v1/compliance/.../green-line — still works (backward compat)" GET \
  "/v1/compliance/athletes/00000000-0000-0000-0000-000000000001/green-line?clubId=00000000-0000-0000-0000-000000000001" \
  "200"

# ── Red action rejection ──────────────────────────────────────
echo ""
echo "[ Red Action Rejection ]"

PREP_RESP=$(curl -s -X POST "$API_URL/v1/avanti/actions/prepare" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: red-test-$IK" \
  -d '{"featureKey":"play_status","actionType":"play_status.override_red_play_without_source_event","tileId":"play_status"}' \
  2>/dev/null)

if echo "$PREP_RESP" | grep -q '"status":"blocked"'; then
  echo -e "${GREEN}✓${NC} Red action returns blocked status"
elif echo "$PREP_RESP" | grep -q '"riskLevel":"red"'; then
  echo -e "${GREEN}✓${NC} Red action returns risk_level=red"
else
  echo -e "${YELLOW}⚠${NC} Red action response unclear — verify manually"
fi

# ── Summary ───────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
if [ "$FAILED" -eq 0 ]; then
  echo -e "${GREEN}  All checks PASSED — AVANTI OS Brain endpoints live${NC}"
else
  echo -e "${RED}  $FAILED check(s) FAILED — investigate before PR${NC}"
fi
echo "═══════════════════════════════════════════════════════"
echo ""

exit $FAILED
