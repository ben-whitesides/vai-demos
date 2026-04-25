# VAI AVANTI OS Brain — Christmas Package
**For:** Francis (`vai-api`) · Badinho (`vai-mobile`) · GAMEDAY web builder  
**From:** Tommy (orchestrator) + Council (GPT 5.5 · Cursor · Gemini · Haiku)  
**Date:** April 25, 2026  
**Status:** MASTERS AUDIT PASSED — ready to build

---

## READ IN THIS ORDER

| # | File / Folder | Who | Why |
|---|---|---|---|
| 1 | This file | Everyone | What you're building and why |
| 2 | `02-data-model/061_home_screen_grid.sql` | Francis | Run this first — creates the 3 foundation tables |
| 3 | `04-core-interfaces/IAvantiFeatureAdapter.cs` | Francis | The core contract everything registers into |
| 4 | `04-core-interfaces/AvantiActionV1Controller.cs` | Francis | 4 endpoints — prepare / confirm / execute / history |
| 5 | `04-core-interfaces/AuthorizeAnyScopesAttribute.cs` | Francis | OR-scope auth attribute (new — AND-only was insufficient) |
| 6 | `04-core-interfaces/AnyScopeAuthorizationHandler.cs` | Francis | Dynamic policy handler for OR-scope policies |
| 7 | `07-club-os-adapters/*.cs` | Francis | 5 typed feature adapters (Play Status, Roster, Tournaments, Standings, Exceptions) |
| 8 | `05-mobile-package/src/features/avanti/actionsApi.ts` | Badinho | Shared TS client — every AVANTI surface calls these 4 functions |
| 9 | `08-scripts/setup-avanti-feature.sh` | Francis | Preflight check — run before implementing |
| 10 | `08-scripts/generate-adapter-stubs.sh` | Francis | Outputs DI registration block + step-by-step wiring guide |
| 11 | `08-scripts/validate-avanti-endpoints.sh` | Francis | Run after implementation — confirms all endpoints live |
| 12 | `08-scripts/apply-handoff-to-vai-api.sh` | Francis | Copies AVANTI handoff files into `vai-api` with backups |
| 13 | `08-scripts/pr-ready-verify.sh` | Francis | Compile + static policy checks for PR readiness |
| 14 | `08-scripts/pr-ready-all-in-one.sh` | Francis | One-command preflight + apply + verify flow |
| 15 | `VERIFY.md` | Francis + reviewer | Pass/fail checklist and exact commands |
| 16 | `avanti_pr_checklist.md` | Francis + reviewer | Ready-to-paste GitHub PR checklist artifact |
| 17 | Spec: `~/Desktop/2026-04-24-VAI-HOME-SCREEN-GRID-BUILD-SPEC.md` v1.1 | Francis + Badinho | Full product spec — every endpoint, screen, gate |
| 18 | Pre-PR patch: `~/Desktop/VAI Master/specs/2026-04-24-VAI-CLUB-OS-PRE-PR-PATCH-SPEC.md` | Francis | Club OS pre-PR patch — apply after OS Core is live |

---

## WHAT AVANTI OS BRAIN IS

AVANTI is not a chatbot. AVANTI is the JARVIS of VAI: an ambient operating intelligence that scans every feature, surfaces what matters, prepares the next safe action, and executes only through typed API boundaries — never free-form.

```
Feature Screen → AVANTI Context Adapter → Risk Classifier → Action Registry
                                                                    ↓
                                        Human Confirmation Gate (Yellow only)
                                                                    ↓
                                             Feature API Execution → Outbox + Audit
```

**The three rules:**
- **Green** = read, explain, summarize. No confirmation. No mutation.
- **Yellow** = create, send, charge, promote, cancel. Exact preview shown. Human confirms.
- **Red** = blocked. Explainable. Never executable. Enforced at DB constraint level too.

---

## WHAT FRANCIS BUILDS (PR 1)

### Migration
Run `02-data-model/061_home_screen_grid.sql` first.

Creates:
- `user_preferences` — home tile order, pinned tiles, dismissed strip state
- `avanti_action_runs` — every AVANTI action (audit, idempotent, Red-blocked at DB)
- `avanti_proactive_scan_runs` — background scan history (90-day retention)

### API
Wire `AvantiActionV1Controller.cs` — 4 endpoints shared by ALL VAI surfaces:

| Endpoint | Rate limit | Purpose |
|---|---|---|
| `POST /v1/avanti/actions/prepare` | 20/min | Create or reuse action run |
| `POST /v1/avanti/actions/{id}/confirm` | 10/min | Confirm Yellow action |
| `POST /v1/avanti/actions/{id}/execute` | 5/min | Execute confirmed action |
| `GET /v1/avanti/actions/history` | — | Actor-scoped audit trail |

### Home context API (from Home Grid spec §5)
- `GET /v1/home/context` — personalized tile bundle, 5-min cache
- `GET /v1/home/tiles/{tileId}/avanti-context` — lazy overlay content
- `PUT /v1/home/tile-order` — save user's grid layout
- `POST /v1/home/avanti-strip/dismiss` — dismiss strip with expiry

### Adapters (Club OS Pre-PR — also in PR 1)
Register all 5 in DI:
```csharp
services.AddScoped<IAvantiFeatureAdapter, PlayStatusAvantiAdapter>();
services.AddScoped<IAvantiFeatureAdapter, RosterAvantiAdapter>();
services.AddScoped<IAvantiFeatureAdapter, TournamentAvantiAdapter>();
services.AddScoped<IAvantiFeatureAdapter, StandingsAvantiAdapter>();
services.AddScoped<IAvantiFeatureAdapter, ExceptionsAvantiAdapter>();
```

Place adapter files in: `vai-api/Features/ClubOS/Avanti/Adapters/`

### Auth new attribute
`AuthorizeAnyScopesAttribute` — OR semantics — required for compliance endpoints.  
`AnyScopeAuthorizationHandler` — dynamic policy resolver.  
Register the handler + implement `DynamicAnyScopePolicyProvider` or register named policies per endpoint.

---

## WHAT BADINHO BUILDS (PR 1 + PR 2)

### Shared AVANTI action client
Copy `05-mobile-package/src/features/avanti/actionsApi.ts` to `features/avanti/actionsApi.ts`.

All mobile AVANTI chips call this. No chip invents its own AI text.

### Home Grid screens (full spec in Home Grid v1.1)
- Replace `app/index.tsx` redirect with `HomeScreen`
- Add `AvantiStrip`, `FeatureTile`, `AvantiOverlay`, `UpgradeSheet`
- Hooks: `useHomeContext`, `useUpdateTileOrder`, `useTileAvantiContext`
- Edit mode: drag-to-reorder, save only on Done

### Club OS pre-PR patch (from patch spec)
Replace all hardcoded AVANTI chips/mock text with `avantiActionsApi.prepare(...)`.  
Yellow chips show confirmation sheet. Green chips show inline result. M13 never writes score directly.

---

## WHAT GAMEDAY WEB BUILDER BUILDS (PR 2 — after PR 1 lands)

From `2026-04-24-VAI-GAMEDAY-AVANTI-COMMAND-GRID-BUILD-SPEC.md`:

- `AvantiCommandRail` — persistent right sidebar, priority items
- `AvantiSidePanel` — contextual to module/row/selection
- `BulkActionBar` — all AVANTI bulk actions call `POST /v1/avanti/actions/prepare`
- `ActionRunTimeline` — prepared/confirmed/executed/failed states per action

---

## SCRIPTS — RUN IN ORDER

```bash
# 1. Run preflight
bash 08-scripts/setup-avanti-feature.sh

# 2. Apply migration
psql $DATABASE_URL < 02-data-model/061_home_screen_grid.sql

# 3. See wiring guide
bash 08-scripts/generate-adapter-stubs.sh

# 4. Implement IAvantiActionService + adapters

# 5. Validate endpoints
API_URL=http://localhost:5000 USER_TOKEN=<token> bash 08-scripts/validate-avanti-endpoints.sh
```

---

## STUBS STILL NEEDED (Francis implements these)

| Interface | Purpose |
|---|---|
| `IAvantiActionService` | Resolves adapters by FeatureKey, writes action runs, enforces Red/Yellow gates |
| `IAvantiActionRunWriter` | Dapper write to `avanti_action_runs` in the same transaction |
| `IComplianceService.GetPlayStatusSummaryAsync` | New method on existing service |
| `IComplianceService.GetTopBlockerAsync` | New method — top actionable compliance blocker |
| `IComplianceService.SendComplianceNudgeAsync` | Dispatch comms via outbox |
| `ITeamsService.GetRosterHealthAsync` | GREEN/YELLOW/RED counts |
| `ITeamsService.GetBlockedAthletesAsync` | List of blocked athletes for Yellow action |
| `ITeamsService.SendRosterNudgesAsync` | Comms via outbox |
| `ITournamentService.GetBracketHealthAsync` | Conflict summary |
| `ITournamentService.GetBracketConflictsAsync` | Conflict list for Yellow |
| `ITournamentService.ApplyBracketEditAsync` | Write via outbox |
| `IStandingsService.GetStandingsSummaryAsync` | Rank + record + season |
| `IScoringService.GetPendingCorrectionAsync` | Pending score correction |
| `IScoringService.ApplyScoreCorrectionAsync` | Append-only via game events |
| `IAvantiService.GetExceptionsQueueSummaryAsync` | Open/urgent count |
| `IAvantiService.GetActionableExceptionsAsync` | Yellow-ready items |
| `ICommsService.SendBulkExceptionNudgesAsync` | Comms via outbox |

---

## KEY DECISIONS (already locked — do not re-open)

| Decision | Choice |
|---|---|
| AVANTI architecture | OS Brain through typed adapters — not standalone chatbot |
| Action pipeline | prepare → confirm → execute (same for mobile, web, admin) |
| Red actions | Blocked at service + DB constraint (`chk_avanti_action_red_not_executable`) |
| Proactive scans | Allowed to prepare actions, never to execute Yellow |
| Model routing | deterministic → fast_model → strong_model (Haiku default, Sonnet on escalation) |
| Bedrock quota | Dave submits 500K TPM increase request to AWS before PR 1 ships |
| Scan jitter | 100-500ms random delay on scan fan-out (Dave adds to vai-ai) |
| Free tier cost | $0.0018/user/month — 2-scope scan only, deterministic-first |

---

## QUALITY GATES (all must pass before PR merges)

1. Migration 061 applies cleanly to DEV first
2. `avanti_action_runs` Red constraint verified — Red cannot reach `executing` at DB level
3. Yellow action requires confirmation before execute — test with unconfirmed execute attempt
4. All 5 Club OS adapters registered and returning valid context
5. `AuthorizeAnyScopesAttribute` returns 200 for `compliance:read:self` token on PLAY alias route
6. Green actions complete at prepare time with status=succeeded, no confirmation needed
7. Tile order mutation is idempotent (same array = same stored value)
8. Home context p95 < 1500ms cold cache
9. validate-avanti-endpoints.sh passes all checks
10. No "Green Line" strings in user-facing vai-api responses (rg scan clean)
