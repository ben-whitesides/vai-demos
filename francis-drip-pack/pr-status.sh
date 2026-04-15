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

# --- Unresolved review threads (proper GraphQL query — checks isResolved flag)
echo
echo "💬 Unresolved review threads:"
gh api graphql -f query='
query($repo_owner: String!, $repo_name: String!, $pr: Int!) {
  repository(owner: $repo_owner, name: $repo_name) {
    pullRequest(number: $pr) {
      reviewThreads(first: 100) {
        nodes {
          isResolved
          isOutdated
          path
          line
          comments(first: 1) {
            nodes { author { login } body }
          }
        }
      }
    }
  }
}' -F repo_owner="$(echo $REPO | cut -d/ -f1)" -F repo_name="$(echo $REPO | cut -d/ -f2)" -F pr="$PR" 2>/dev/null \
  | python3 -c '
import json, sys
try:
    data = json.load(sys.stdin)
    threads = data["data"]["repository"]["pullRequest"]["reviewThreads"]["nodes"]
    unresolved = [t for t in threads if not t.get("isResolved")]
    if not unresolved:
        print("  (all resolved)")
    else:
        for t in unresolved[:10]:
            c = t["comments"]["nodes"][0] if t["comments"]["nodes"] else {}
            author = c.get("author", {}).get("login", "?") if c else "?"
            body = (c.get("body", "") or "").splitlines()[0][:100] if c else ""
            path = t.get("path", "?")
            line = t.get("line", "?")
            stale = " [outdated]" if t.get("isOutdated") else ""
            print(f"  {author} on {path}:{line}{stale}")
            print(f"    > {body}")
        if len(unresolved) > 10:
            print(f"  ... and {len(unresolved) - 10} more")
except Exception as e:
    print(f"  (could not parse review threads: {e})")
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
