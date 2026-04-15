# OneSignal Journeys Phase 1 API Scaffold

## Overview
This is the **contract-locked** API scaffold for OneSignal Journeys Phase 1. The spec is 100% complete with all 11 journey templates defined, timing locked, and security policies locked (XSS prevention). This scaffold provides the backend orchestration that Francis will implement.

**All business logic lives here.** OneSignal is delivery-only.

---

## Scaffold Audit Status ✅

**Code Masters Audit (Sonnet 4.6 + Cursor 4.5) — PASSED**
- Security: 8.5/10 ✅
- Logic: 8.0/10 ✅ (fixed from 7.0 after corrections)
- Quality: 8.0/10 ✅

**Corrections Applied (Apr 13):**
1. Column name: `event_payload` → `event_payload_json` (TriggerJourneyAsync stub)
2. DI Lifetime: Switched from `IHostedService` + direct injection to `BackgroundService` + `IServiceScopeFactory` (prevents startup crash when using scoped DbContext)
3. Timer Concurrency: Switched from `Timer` (fire-and-forget) to `PeriodicTimer` (waits for completion, prevents overlapping executions)
4. Journey Timing: Fixed `tier_upgraded` step 4 delay from 2880 → 1440 minutes (delivers Day 3, not Day 4)

## Architecture Pattern
- **Services:** `IJourneyOrchestrationService` interface + stub implementation
- **Models:** Journey state, templates, delivery events
- **Database:** 2 migrations creating journey_templates and notification_journey_states tables with 11 seed templates
- **Background Job:** `ProcessPendingJourneyStepsHostedService` (runs every 5 minutes)
- **Integration:** Event emission stubs in 6 existing services (PaymentService, CommissionService, etc.)

## The 11 Journey Templates

| # | Event | Category | Steps | Timing |
|----|-------|----------|-------|--------|
| 1 | payment_received | MONEY | Push + Email | Immediate + 45min |
| 2 | referral_welcome | MONEY | Push + Email | Immediate + 45min |
| 3 | affiliate_earnings | MONEY | Push + Email | Immediate + 60min |
| 4 | earnings_milestone | EARNINGS | Push + Email | Immediate + 120min |
| 5 | referral_commission | AFFILIATE | Push | Immediate |
| 6 | monthly_stats | WALLET | Push + Email | Immediate + 60min |
| 7 | affiliate_invite | AFFILIATE | Push + Email | Immediate + 60min |
| 8 | brief_delivery | AVANTI | Push + Email | Immediate + 45min |
| 9 | coach_message | AVANTI CONNECT | Push + Email | Immediate + 60min |
| 10 | tier_upgraded | MENTOR | Push + 2x Email + In-App | Day 1 + Day 2 + Day 3 |
| 11 | onboarding_complete | ONBOARDING | Push + Email + In-App | Day 1 + Day 3 |

**Total:** 11 journeys, 29 messages (11 push, 14 email, 4 in-app)

## File Structure
```
Vai.Api/Features/Notifications/
├── README.md (this file)
├── INTEGRATION_POINTS.md (where to add event emission)
├── Services/
│   ├── IJourneyOrchestrationService.cs (interface)
│   └── JourneyOrchestrationService.cs (stub implementation)
├── Models/
│   └── JourneyModels.cs (all DTOs)
├── Jobs/
│   └── ProcessPendingJourneyStepsHostedService.cs (5-minute background job)
└── Scripts/
    ├── setup-onesignal-feature.sh (pre-flight checks)
    ├── generate-method-stubs.sh (SQL hints)
    ├── test-journey-integration.sh (integration test)
    └── validate-onesignal-config.sh (config validation)

Vai.Database/Scripts/
├── 055_JourneyTemplatesAndStates.sql (journey tables + seed 11 templates)
└── 056_NotificationDeliveryTracking.sql (optional: delivery event logging)
```

## Helper Scripts

Francis can use these scripts to accelerate implementation:

### `setup-onesignal-feature.sh`
Verifies the scaffold is properly set up and dependencies are installed.
```bash
bash Vai.Api/Features/Notifications/Scripts/setup-onesignal-feature.sh
```
Checks: database connectivity, required files present, DI registration in Program.cs.

### `generate-method-stubs.sh`
Generates C# method stubs for all 6 JourneyOrchestrationService methods with SQL hints.
```bash
bash Vai.Api/Features/Notifications/Scripts/generate-method-stubs.sh > JourneyOrchestrationService.stubs.cs
```
Output includes: method signatures, TODO comments, SQL query hints for each method.

### `test-journey-integration.sh`
Tests OneSignal journey integration end-to-end.
```bash
API_URL=http://localhost:5000 AUTH_TOKEN=your-token bash Vai.Api/Features/Notifications/Scripts/test-journey-integration.sh
```
Tests: database tables, journey triggers, state retrieval, step processing.

### `INTEGRATION_POINTS.md`
Documents where to add event emission in 6 existing services.
- PaymentService (payment_received)
- CommissionService (affiliate_earnings, earnings_milestone, referral_commission)
- ReferralsService (referral_welcome)
- StatsService (monthly_stats)
- AffiliateService (affiliate_invite)
- AVANTIService (brief_delivery)
- AVANTIConnectService (coach_message)
- SubscriptionsService (tier_upgraded)
- OnboardingService (onboarding_complete)

## Implementation Checklist for Francis

### Phase 1: Implement IJourneyOrchestrationService Methods
Each method has a `throw new NotImplementedException()` with a comment indicating what to implement:

1. **TriggerJourneyAsync** - Check idempotency, insert journey state, queue first step
2. **ProcessPendingStepsAsync** - Process all pending steps using SELECT FOR UPDATE SKIP LOCKED
3. **AbandonJourneyAsync** - Mark journey as ABANDONED
4. **GetJourneyStateAsync** - Retrieve current journey state for a user
5. **GetUserJourneysAsync** - Get all active journeys for a user
6. **VerifyOneSignalConfigAsync** - Test OneSignal API connectivity

### Phase 2: Wire Up Dependency Injection
In `Program.cs`, register the service:
```csharp
builder.Services.AddScoped<IJourneyOrchestrationService, JourneyOrchestrationService>();
builder.Services.AddHostedService<ProcessPendingJourneyStepsHostedService>();
```

### Phase 3: Add Event Emission to 6 Services
Review INTEGRATION_POINTS.md for each service that needs to emit journey events. Each integration:
- Calls `_journeyService.TriggerJourneyAsync(userId, eventType, payload)`
- **HtmlEncode all user data** to prevent XSS injection into OneSignal templates

### Phase 4: Database Migrations
Run both migrations to create tables and seed 11 journey templates:
```bash
psql -U postgres -d vai_api -f Vai.Database/Scripts/055_JourneyTemplatesAndStates.sql
psql -U postgres -d vai_api -f Vai.Database/Scripts/056_NotificationDeliveryTracking.sql
```

### Phase 5: Testing
Run the integration test script:
```bash
bash Vai.Api/Features/Notifications/Scripts/test-journey-integration.sh
```

## Security Rules (MANDATORY)

1. **HTML Encode All User Data:** `System.Net.WebUtility.HtmlEncode(userString)`
   - Prevents XSS injection in OneSignal email/push templates
   - Example: `System.Net.WebUtility.HtmlEncode(user.FirstName)`

2. **Prevent Race Conditions:** Use `SELECT FOR UPDATE SKIP LOCKED` when processing pending steps
   - Allows multiple cron instances to safely process different journeys in parallel

3. **Idempotency Pattern:** Unique constraint on (user_id, journey_template_id) for active journeys
   - Prevents duplicate journey triggers for the same user/template combo

## Frontend Contract Reference
The frontend (vai-app) expects journey state models with specific fields. Do not modify without approval.

## Testing Strategy
- Unit tests for service methods (mock database layer)
- Integration tests calling actual endpoints once implemented
- Manual testing via test script with real database

## Notes for Future PRs
- No changes to models without approval (breaking change)
- Services can be swapped for different implementations (Stripe, Twilio, etc.)
- Controllers inherit from VaiSecureControllerBase (Auth0 integration)
- All endpoints require Auth0 authentication

---

**Status:** Scaffold complete, audit-ready. Awaiting Francis implementation.
