#!/usr/bin/env bash
#
# VAI Chat Route Probe
#
# Open question from the spec: "Does app.vai.app/chat/[USER_ID] route exist?"
# The universal link fires regardless (AASA whitelists /*), but the app needs
# the route to land cleanly after the OS hands the URL back to the app.
#
# This script probes a handful of path patterns and reports what's live.
#
# Usage:
#   ./chat-route-probe.sh                  # uses default test UUID
#   ./chat-route-probe.sh <user_uuid>      # specify user UUID
#
# Requires: curl

set -euo pipefail

USER_ID="${1:-a812b6d8-b406-439b-9d6b-fc1d8a3313cd}"
BASE="https://app.vai.app"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "VAI Chat Route Probe"
echo "Target user: $USER_ID"
echo "Base:        $BASE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo

probe() {
  local path="$1"
  local label="$2"
  local url="${BASE}${path}"
  # -L follows redirects, -o sinkhole body, -w captures status + final URL + redirect count
  read -r STATUS FINAL_URL REDIRECTS < <(
    curl -sSL -o /dev/null \
      -w "%{http_code} %{url_effective} %{num_redirects}" \
      --max-time 10 \
      "$url" || echo "000 $url 0"
  )
  printf "%-40s → HTTP %s  (redirects: %s)\n" "$label" "$STATUS" "$REDIRECTS"
  if [ "$url" != "$FINAL_URL" ]; then
    printf "  final: %s\n" "$FINAL_URL"
  fi
}

probe "/chat/${USER_ID}"                  "/chat/[id]              "
probe "/chat?user=${USER_ID}"             "/chat?user=             "
probe "/messages/${USER_ID}"              "/messages/[id]          "
probe "/dm/${USER_ID}"                    "/dm/[id]                "

echo
echo "AASA manifest (confirms universal link coverage for all /* paths):"
curl -sSL "https://app.vai.app/.well-known/apple-app-site-association" \
  | head -c 400
echo
echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Interpretation guide:"
echo "  HTTP 200 on /chat/[id]     → route live, template can link to it as-is"
echo "  HTTP 404 on /chat/[id]     → Badinho needs to add the route"
echo "  HTTP 3xx + final = app     → existing redirect handles the deep link"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
