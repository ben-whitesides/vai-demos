#!/usr/bin/env bash
#
# Email Drip PR #490 — One-shot status snapshot
# Shows: CI checks, mergeability, review threads, what's left.
#
# Usage:
#   ~/path/to/vai-demos/francis-drip-pack/pr-status.sh

set -euo pipefail

REPO="vai-app/vai-api"
PR="490"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "PR #$PR — Status snapshot"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# --- Headline
echo
echo "📋 Title + state:"
gh pr view $PR --repo $REPO --json title,state,reviewDecision,mergeable,url 2>/dev/null \
  | python3 -c '
import json, sys
d = json.load(sys.stdin)
print(f"  Title:    {d[\"title\"]}")
print(f"  State:    {d[\"state\"]}")
print(f"  Review:   {d[\"reviewDecision\"]}")
print(f"  Merge:    {d[\"mergeable\"]}")
print(f"  URL:      {d[\"url\"]}")
'

# --- CI checks
echo
echo "🔧 CI checks:"
gh pr checks $PR --repo $REPO 2>/dev/null | sed 's/^/  /'

# --- Open review threads
echo
echo "💬 Outstanding review threads:"
gh api "repos/$REPO/pulls/$PR/comments" --paginate 2>/dev/null \
  | python3 -c '
import json, sys
comments = json.load(sys.stdin)
unresolved = [c for c in comments if not c.get("in_reply_to_id")]
if not unresolved:
    print("  (none)")
else:
    for c in unresolved[-10:]:
        path = c.get("path", "?")
        line = c.get("line") or c.get("original_line", "?")
        author = c.get("user", {}).get("login", "?")
        body = (c.get("body", "") or "").splitlines()[0][:100]
        print(f"  {author} on {path}:{line}")
        print(f"    > {body}")
' 2>/dev/null || echo "  (could not fetch — check gh auth)"

# --- Branch / commit info
echo
echo "🌿 Branch:"
gh pr view $PR --repo $REPO --json headRefName,headRefOid,commits 2>/dev/null \
  | python3 -c '
import json, sys
d = json.load(sys.stdin)
print(f"  Head:     {d[\"headRefName\"]}")
print(f"  HEAD SHA: {d[\"headRefOid\"][:12]}")
print(f"  Commits:  {len(d[\"commits\"])}")
print(f"  Latest:   {d[\"commits\"][-1][\"messageHeadline\"]}")
'

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "What's left to merge (typical):"
echo "  1. SonarCloud passes (apply-refactor.sh + push)"
echo "  2. CHANGES_REQUESTED → resolved (re-request review after push)"
echo "  3. Mergeable: MERGEABLE (no conflicts with main)"
echo "  4. Ben approval"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
