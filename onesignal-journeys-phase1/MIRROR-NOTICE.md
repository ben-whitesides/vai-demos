# Mirror Notice

This directory is a **read-only mirror** of OneSignal Journeys Phase 1 documentation from `vai-app/vai-api`.

**Source of truth:** `Vai.Api/Features/Notifications/` in the vai-api repo (currently on Ben's local working tree, branch TBD when pushed).

**Why mirror:** The vai-api repo is private. Mirroring the docs to `ben-whitesides/vai-demos` (public) gives reviewers a phone-readable URL without needing GitHub auth on the vai-app org.

**Includes:**
- `README.md` — overview + architecture
- `IMPLEMENTATION_REFERENCE.md` — 6 method specs with SQL hints + testing checklist
- `INTEGRATION_POINTS.md` — where to add event emission in 6 existing services
- `scripts/setup-onesignal-feature.sh` — pre-flight checks
- `scripts/generate-method-stubs.sh` — C# stub generator with SQL hints
- `scripts/test-journey-integration.sh` — end-to-end integration test

**Excludes:**
- `Services/JourneyOrchestrationService.cs` — the actual code stubs to implement (in vai-api)
- `Services/IJourneyOrchestrationService.cs` — interface (in vai-api)
- `Models/JourneyModels.cs` — DTOs (in vai-api)
- `Jobs/ProcessPendingJourneyStepsHostedService.cs` — background job (in vai-api)
- `Vai.Database/Scripts/055_*.sql` + `056_*.sql` — DB migrations (in vai-api)

**Implementation work happens in vai-api** — Francis pulls from vai-api branch when ready.
