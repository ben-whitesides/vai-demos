# AVANTI OS Handoff Install Guide

## 1) Run migration 061
- Apply `02-data-model/061_home_screen_grid.sql` after migration 060, or as the first AVANTI migration.
- Run in DEV first and verify all 3 tables exist:
  - `user_preferences`
  - `avanti_action_runs`
  - `avanti_proactive_scan_runs`
- Promote to PROD only after DEV verification.

## 2) Wire AVANTI DI
- In central `DependencyResolution.cs`, call:
  - `AvantiDependencyResolution.Configure(configuration, services);`
- Do not inline AVANTI service registrations outside this feature configure method.

## 3) Register authorization handler
- Ensure `AnyScopeAuthorizationHandler` is registered as singleton.
- If your stack uses dynamic authorization policy resolution, wire `DynamicAuthorizationPolicyProvider` as referenced in `AnyScopeAuthorizationHandler.cs`.

## 4) Verify actor tier resolution before deploy
- `AvantiActionV1Controller.GetActorTier()` must resolve a real tier from trusted identity context.
- Current handoff implementation resolves from claims (`subscription_tier`, `tier`, `vai_tier`) and throws if missing/invalid.
- Do not deploy any hardcoded fallback tier.

## 5) Register pg_cron retention job
- After migration, register the 90-day purge for `avanti_proactive_scan_runs`.
- The SQL stub is already included as comments in `061_home_screen_grid.sql`.

## 6) Adapter registration
- Five Club OS adapters are already wired in `AvantiDependencyResolution.Configure()`.
- For Phase 2 adapters (example: `ClubFinancialsAvantiAdapter`), register additional `IAvantiFeatureAdapter` entries in the same configure method.

## 7) Smoke test
- Execute:
  - `POST /v1/avanti/actions/prepare`
- Body should include:
  - `featureKey = "play_status"`
  - `actionType = "play_status.summarize_club"`
- Expect 200 response with `actionRunId` in payload.
