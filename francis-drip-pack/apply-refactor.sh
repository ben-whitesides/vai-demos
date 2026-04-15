#!/usr/bin/env bash
#
# Email Drip PR #490 — SonarQube Quality Gate Refactor
# Applies the consolidated repository + job refactor and verifies the build.
#
# What it does (idempotent):
#   1. Verifies you're inside the vai-app/vai-api repo on feature/drip-email-backend
#   2. Backs up the originals to .bak
#   3. Drops in the refactored DripSendLogRepository.cs + DripSendJob.cs
#   4. Runs `dotnet build` to confirm zero new errors
#   5. Runs `dotnet test --filter Drip` to confirm tests still pass
#   6. Prints a diff summary so you can eyeball before committing
#
# Usage:
#   cd ~/code/vai-api
#   git checkout feature/drip-email-backend
#   ~/path/to/vai-demos/francis-drip-pack/apply-refactor.sh
#
# Override branch check:
#   VAI_DRIP_BRANCH_OVERRIDE=1 ./apply-refactor.sh

set -euo pipefail

PACK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(pwd)"
TARGET_DIR="Vai.Api/Infrastructure/Drip"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Email Drip PR #490 — SonarQube refactor installer"
echo "Pack source: $PACK_DIR"
echo "Repo target: $REPO_ROOT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# --- Guard: vai-api repo
if [ ! -d ".git" ]; then
  echo "ERROR: not inside a git repo. cd into vai-api first."
  exit 1
fi

REMOTE_URL="$(git remote get-url origin 2>/dev/null || echo '')"
if [[ "$REMOTE_URL" != *"vai-api"* ]]; then
  echo "ERROR: this does not look like the vai-api repo (origin: $REMOTE_URL)"
  echo "Override: VAI_INSTALL_FORCE=1 $0"
  [ "${VAI_INSTALL_FORCE:-}" != "1" ] && exit 1
fi

# --- Guard: feature/drip-email-backend branch (PR #490)
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$CURRENT_BRANCH" != "feature/drip-email-backend" ] && [ "${VAI_DRIP_BRANCH_OVERRIDE:-}" != "1" ]; then
  echo "ERROR: expected branch 'feature/drip-email-backend' (currently on '$CURRENT_BRANCH')"
  echo "Override: VAI_DRIP_BRANCH_OVERRIDE=1 $0"
  exit 1
fi

# --- Guard: target files exist (sanity check before backup/replace)
for f in DripSendLogRepository.cs DripSendJob.cs; do
  if [ ! -f "$TARGET_DIR/$f" ]; then
    echo "ERROR: $TARGET_DIR/$f not found. Are you sure this is vai-api with PR #490 applied?"
    exit 1
  fi
done

# --- Step 1: backup
echo
echo "[1/5] Backing up originals to .bak..."
TS="$(date +%Y%m%d-%H%M%S)"
for f in DripSendLogRepository.cs DripSendJob.cs; do
  cp "$TARGET_DIR/$f" "$TARGET_DIR/$f.bak.$TS"
  echo "  ✓ $TARGET_DIR/$f.bak.$TS"
done

# --- Step 2: copy refactored files in
echo
echo "[2/5] Installing refactored files..."
cp "$PACK_DIR/DripSendLogRepository.cs" "$TARGET_DIR/DripSendLogRepository.cs"
cp "$PACK_DIR/DripSendJob.cs"           "$TARGET_DIR/DripSendJob.cs"
echo "  ✓ $TARGET_DIR/DripSendLogRepository.cs"
echo "  ✓ $TARGET_DIR/DripSendJob.cs"

# --- Step 3: dotnet build
echo
echo "[3/5] Running dotnet build (this may take a minute)..."
if dotnet build --nologo --verbosity minimal 2>&1 | tee /tmp/drip-build.log | tail -20; then
  ERROR_COUNT="$(grep -cE '^.+: error ' /tmp/drip-build.log || echo 0)"
  WARNING_COUNT="$(grep -cE '^.+: warning ' /tmp/drip-build.log || echo 0)"
  echo "  ✓ Build OK (errors: $ERROR_COUNT, warnings: $WARNING_COUNT)"
else
  echo "  ✗ Build FAILED — restore originals with:"
  echo "    cp $TARGET_DIR/DripSendLogRepository.cs.bak.$TS $TARGET_DIR/DripSendLogRepository.cs"
  echo "    cp $TARGET_DIR/DripSendJob.cs.bak.$TS $TARGET_DIR/DripSendJob.cs"
  exit 1
fi

# --- Step 4: dotnet test (Drip-only filter for speed)
echo
echo "[4/5] Running drip tests..."
set -o pipefail
if dotnet test --no-build --nologo --verbosity minimal --filter "FullyQualifiedName~Drip" 2>&1 | tee /tmp/drip-test.log | tail -10; then
  echo "  ✓ Drip tests pass"
else
  echo "  ✗ Drip tests FAILED — review /tmp/drip-test.log"
  echo "    (Pre-existing EventServiceTests flake is unrelated and excluded by the filter.)"
  echo "    Restore originals with:"
  echo "      cp $TARGET_DIR/DripSendLogRepository.cs.bak.$TS $TARGET_DIR/DripSendLogRepository.cs"
  echo "      cp $TARGET_DIR/DripSendJob.cs.bak.$TS $TARGET_DIR/DripSendJob.cs"
  exit 1
fi

# --- Step 5: diff summary
echo
echo "[5/5] Diff summary vs HEAD:"
git --no-pager diff --stat -- "$TARGET_DIR/DripSendLogRepository.cs" "$TARGET_DIR/DripSendJob.cs"

echo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ INSTALL COMPLETE — review the diff, then commit + push to re-trigger SonarCloud:"
echo "  git add $TARGET_DIR/DripSendLogRepository.cs $TARGET_DIR/DripSendJob.cs"
echo "  git commit -m 'refactor(drip): consolidate connection helpers + extract job context'"
echo "  git push origin feature/drip-email-backend"
echo
echo "Then run:"
echo "  ~/path/to/vai-demos/francis-drip-pack/verify-sonarqube.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
