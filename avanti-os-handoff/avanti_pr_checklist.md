## AVANTI OS Brain — PR Verification Checklist

### Preflight & Automation
- [ ] Ran `08-scripts/pr-ready-all-in-one.sh` (or applied files manually and ran `apply-handoff-to-vai-api.sh`).
- [ ] Confirmed `VAI_API_ROOT` points to the correct `vai-api` destination.
- [ ] Migration `061_home_screen_grid.sql` successfully applied to the target database.

### Compilation & Tests
- [ ] `dotnet build` succeeds with zero compile errors.
- [ ] Ran `08-scripts/pr-ready-verify.sh` and it exited with success.
- [ ] **Optional:** Ran `08-scripts/validate-avanti-endpoints.sh` against the deployed/local API to verify endpoint connectivity.

### Code Master Audit Pass Criteria
- [ ] **Security:** No `ex.Message` leakage in AVANTI service exception handling paths.
- [ ] **Security:** Tier fallback logic uses safe `TryGetActorTier` rather than throwing `InvalidOperationException`.
- [ ] **Logic:** Mobile caller provides stable `idempotencyKey` per user intent (no `Date.now()` logic without UI state stability).
- [ ] **Logic:** Adapter resolution uses guarded lists instead of crashing via `SingleOrDefault(...)`.
- [ ] **Logic:** Red action blocking logic strictly enforced by service code and schema.
- [ ] **Quality:** At least 5 `IAvantiFeatureAdapter` implementations registered correctly in Dependency Injection.
- [ ] **Quality:** JSON string inputs (`strip_context`) are fully validated before Postgres JSONB insertions.

### Manual Reviewer Checks
- [ ] Verified `AvantiDependencyResolution.Configure(configuration, services)` is invoked in central DI setup.
- [ ] Validated JWT claim key for user tiers matches deployed Auth0/IdP configuration.
- [ ] Checked that no legacy "Green Line" text leaks into client-visible logic (must use "PLAY Status").
