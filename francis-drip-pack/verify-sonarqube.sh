#!/usr/bin/env bash
#
# Email Drip PR #490 — SonarCloud verifier
# Polls PR #490 checks until SonarCloud completes, then reports the new ratings.
#
# Usage:
#   ~/path/to/vai-demos/francis-drip-pack/verify-sonarqube.sh
#
# Requires: gh CLI authenticated for vai-app/vai-api access.

set -euo pipefail

REPO="vai-app/vai-api"
PR="490"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PR #$PR SonarCloud verifier"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# --- Quick auth + access sanity
if ! gh auth status >/dev/null 2>&1; then
  echo "ERROR: gh CLI not authenticated. Run: gh auth login"
  exit 1
fi

# --- Show current state immediately
echo
echo "Current PR #$PR check status:"
gh pr checks $PR --repo $REPO 2>&1 | head -10

# --- Fuzzy-match the Sonar check name (GitHub display name may drift)
SONAR_NAME="$(gh pr checks $PR --repo $REPO --json name \
  --jq '.[] | select(.name | test("(?i)sonar")) | .name' 2>/dev/null | head -1)"

if [ -z "$SONAR_NAME" ]; then
  echo
  echo "⚠  Could not find a Sonar* check on PR #$PR. Available check names:"
  gh pr checks $PR --repo $REPO --json name --jq '.[].name' 2>/dev/null | sed 's/^/    /'
  echo
  echo "Either Sonar hasn't started yet, or the check name changed. Re-run in a minute."
  exit 1
fi
echo
echo "Watching check: \"$SONAR_NAME\""

# --- Poll for SonarCloud to settle (max 5 min)
echo
echo "Waiting for SonarCloud to complete (timeout: 5 min)..."
DEADLINE=$(( $(date +%s) + 300 ))
LAST_STATE=""
while [ "$(date +%s)" -lt "$DEADLINE" ]; do
  STATE="$(gh pr checks $PR --repo $REPO --json name,state \
    --jq --arg n "$SONAR_NAME" '.[] | select(.name==$n) | .state' 2>/dev/null || echo unknown)"
  if [ "$STATE" != "$LAST_STATE" ]; then
    echo "  $SONAR_NAME: $STATE"
    LAST_STATE="$STATE"
  fi
  case "$STATE" in
    SUCCESS|FAILURE|ERROR|CANCELLED|TIMED_OUT|ACTION_REQUIRED)
      break
      ;;
  esac
  sleep 10
done

# --- Final state
FINAL_STATE="$(gh pr checks $PR --repo $REPO --json name,state \
  --jq --arg n "$SONAR_NAME" '.[] | select(.name==$n) | .state' 2>/dev/null || echo unknown)"

echo
case "$FINAL_STATE" in
  SUCCESS)
    echo "✅ SonarCloud PASSED — gate is green"
    ;;
  FAILURE|ERROR)
    echo "❌ SonarCloud FAILED — open the report at:"
    gh pr checks $PR --repo $REPO --json name,link \
      --jq --arg n "$SONAR_NAME" '.[] | select(.name==$n) | .link' 2>/dev/null
    echo
    echo "Common remaining flags after this refactor:"
    echo "  • Cognitive complexity in BuildViewModel — split if needed"
    echo "  • Magic-number 4000 in TruncateErr — extract as const"
    echo "  • Magic-number 90 (cooldown days) in WinBackUrgentCooldownActiveAsync"
    ;;
  *)
    echo "⏱  Status: $FINAL_STATE — check again in a minute"
    ;;
esac

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Full PR status: gh pr view $PR --repo $REPO --web"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
