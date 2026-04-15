# Francis Drip Pack — PR #490 SonarQube Refactor

**Status:** Drop-in pack for the Email Drip PR. Cuts your SonarQube remediation from ~30 min → ~5 min.

**PR:** [vai-app/vai-api #490](https://github.com/vai-app/vai-api/pull/490) (`feature/drip-email-backend`)

---

## TL;DR

Two refactored files + three helper scripts. Run install → push → run verifier. SonarCloud should clear.

```bash
cd ~/code/vai-api
git checkout feature/drip-email-backend
~/path/to/vai-demos/francis-drip-pack/apply-refactor.sh
git add Vai.Api/Infrastructure/Drip/DripSendLogRepository.cs Vai.Api/Infrastructure/Drip/DripSendJob.cs
git commit -m "refactor(drip): consolidate connection helpers + extract job context"
git push origin feature/drip-email-backend
~/path/to/vai-demos/francis-drip-pack/verify-sonarqube.sh
```

---

## What's in the pack

| File | Purpose |
|---|---|
| `DripSendLogRepository.cs` | Refactored repository. Five helpers (`QuerySingleAsync<T>`, `ExecuteScalarAsync<T>`, `QueryListAsync<T>`, `ExecuteAsync`, `ExecuteInTransactionAsync<T>`) consolidate the `using var conn` boilerplate that was repeated across all 11 public methods. Public API signatures unchanged. Transaction handling on `InsertSchedulesAsync` preserved exactly. |
| `DripSendJob.cs` | Refactored job. `DripJobContext` factory record extracts service-locator boilerplate. `ProcessRowAsync` splits the hot loop's per-row pipeline (lower cyclomatic complexity). `HandleSendFailureAsync` + `CalculateBackoff` extracted. Single catch + always-log preserved from original. Behavior unchanged. |
| `apply-refactor.sh` | Idempotent installer. Backs up originals to `.bak.<timestamp>`, drops in refactored files, runs `dotnet build`, runs `dotnet test --filter Drip`, prints diff summary. Refuses to run outside vai-api repo or off the `feature/drip-email-backend` branch (override: `VAI_DRIP_BRANCH_OVERRIDE=1`). |
| `verify-sonarqube.sh` | Polls `gh pr checks 490` until SonarCloud completes (5 min timeout). Reports pass/fail + link to the report if it fails. |
| `pr-status.sh` | One-shot snapshot of PR #490: title, state, review decision, mergeability, CI checks, outstanding review threads, latest commit. Run it any time to see where the PR stands. |

---

## Why this works

SonarQube's 64.2% duplication was driven by:

1. **`using var conn = _db.GetConnection();`** repeated in 11 methods of `DripSendLogRepository.cs` — same shape every time, just with different SQL and params. Five helper methods absorb it. Each public method is now 1-3 lines of "build the params, call the helper."
2. **Service resolution boilerplate** at the top of `DripSendJob.ProcessDueAsync` (resolving 4 scoped services from the DI container) — extracted to `DripJobContext.From(IServiceProvider)`.
3. **Cyclomatic complexity** in the foreach loop of `ProcessDueAsync` (rate-limit check + step lookup + user lookup + view-model build + send + retry/fail) — split into `ProcessRowAsync`, `HandleSendFailureAsync`, `BuildViewModel`, and `CalculateBackoff` helpers.

**What's preserved exactly:**
- All public method signatures (interfaces unchanged → no consumer breaks)
- Transaction semantics on `InsertSchedulesAsync` (atomic multi-row insert with `ON CONFLICT DO NOTHING`)
- Retry budget logic + exponential backoff math (2^attempt minutes)
- Error-message truncation at 4000 chars
- WinBack 90-day cooldown
- AVANTI catchup query (audit_runs join)
- All Hangfire attributes (`[AutomaticRetry(Attempts = 0)]`)
- **Logging:** every send failure still emits `_logger.LogWarning(ex, "Drip send failed for log {Id}", row.Id)` before the retry/fail decision — unchanged from original

**What changed (semantically):**
- Nothing. Pure mechanical de-duplication. Every `using var conn` callsite now routes through a helper that does the same thing. Exception handling is a single catch + log + `HandleSendFailureAsync(ctx, row, ex)` — matches the original's catch block shape.

---

## Expected SonarQube result

- **Code Duplication: 64.2% → ~5-15%** (helpers absorb the repetition; some unavoidable patterns remain in SQL strings)
- **Maintainability: B → A** (lower cognitive complexity in the job; smaller, single-purpose methods in the repo)
- **Reliability: C → A** (smaller methods with single responsibilities; duplication reduction also lifts Sonar's reliability score)
- **Security Hotspot:** Already addressed in PR; this refactor doesn't touch it

If a finding still trips after this lands, common residuals to address:
- Magic numbers (`4000`, `90`) → extract as `private const int`
- `BuildViewModel` cognitive complexity → split if SonarQube still flags it (it shouldn't — single linear builder)

---

## Rollback

```bash
# Find your backup timestamp
ls Vai.Api/Infrastructure/Drip/*.bak.*

# Restore
cp Vai.Api/Infrastructure/Drip/DripSendLogRepository.cs.bak.<TS> Vai.Api/Infrastructure/Drip/DripSendLogRepository.cs
cp Vai.Api/Infrastructure/Drip/DripSendJob.cs.bak.<TS> Vai.Api/Infrastructure/Drip/DripSendJob.cs
```

---

## Audit posture

This pack was authored by Tommy under the Tommy PRs Only protocol. **It has NOT been through a formal Cursor + Gemini Code Masters audit** — Ben opted to ship faster on this round since:

1. The refactor is pure mechanical de-duplication (no behavior change, no new logic surface)
2. `dotnet test --filter Drip` validates behavior preservation
3. SonarCloud is itself the binding gate
4. You (Francis) review the diff before merging

If you want a binding audit pass before pushing, ping Ben — Cursor + Gemini takes ~10 min.

---

## Out of scope (PR-side decisions, not refactor)

- The two open clarifications (audit_runs semantics, WinBack mild→urgent supersession) — already answered in your Apr 9 PR comments
- Smart routing / A/B testing / unsubscribe flows (deferred to v2 per PR description)
- The pre-existing `EventServiceTests.GetMyUpcomingEventsAsync_ReturnsUpdatedRepeatingEvents` flake (unrelated to drip)

Ping Ben with anything that feels off in the diff before pushing.
