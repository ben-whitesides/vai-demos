# AVANTI PR-Ready Verification

This runbook is designed so a developer can complete AVANTI handoff integration with minimal judgment and low error risk.

## Fast path (recommended)

```bash
cd "/Users/benjaminwhitesides/Desktop/VAI DEV/vai-avanti-os-handoff-package"
bash 08-scripts/pr-ready-all-in-one.sh
```

With migration:

```bash
cd "/Users/benjaminwhitesides/Desktop/VAI DEV/vai-avanti-os-handoff-package"
DATABASE_URL="<postgres-url>" APPLY_MIGRATION=1 bash 08-scripts/pr-ready-all-in-one.sh
```

## Step-by-step path

1) **Preflight**

```bash
bash 08-scripts/setup-avanti-feature.sh
```

2) **Copy handoff into `vai-api`**

```bash
VAI_API_ROOT="/Users/benjaminwhitesides/Desktop/VAI DEV/vai-club-os-build/vai-api" \
  bash 08-scripts/apply-handoff-to-vai-api.sh
```

3) **Run compile and static checks**

```bash
VAI_API_ROOT="/Users/benjaminwhitesides/Desktop/VAI DEV/vai-club-os-build/vai-api" \
  bash 08-scripts/pr-ready-verify.sh
```

4) **Run live endpoint checks** (optional but strongly recommended)

```bash
API_URL="http://localhost:5000" USER_TOKEN="<jwt>" \
  bash 08-scripts/validate-avanti-endpoints.sh
```

## Required pass criteria before PR

- `dotnet build` succeeds with zero compile errors.
- No `ex.Message` leakage in AVANTI service response paths.
- No `Date.now()`-derived idempotency keys in `actionsApi.ts`.
- No `SingleOrDefault(...)` crash path for adapter resolution.
- No hardcoded tier fallback in controller.
- At least 5 `IAvantiFeatureAdapter` registrations in DI.
- Red action blocked behavior still enforced by service and DB constraint.

## Manual checks still required

- Central DI invokes: `AvantiDependencyResolution.Configure(configuration, services)`.
- JWT claim key for tier is valid in deployed auth environment.
- Mobile callers provide stable idempotency key per user intent (retry-safe).
- Migration `061_home_screen_grid.sql` applied in DEV before PROD.

