# ⚠️ SUPERSEDED — Historical Reference Only

> **This document is SUPERSEDED as of 2026-04-11.**
>
> The `activation_prompt_*` isolation fix described below is **still correct** and **is already applied in the sandbox** at `~/Desktop/vai-api-sep`. However, between 2026-04-10 and 2026-04-11, the sandbox picked up a full remediation layer PLUS Phase 4 Send Money that this document does not describe.
>
> **Do NOT build a PR from this document alone.** It covers only the activation_prompt isolation fix (~4 lines of code) as it existed on 2026-04-10. The current sandbox has hundreds of additional lines of code spanning the remediation layer and Phase 4.
>
> **Canonical source of truth:** [`vai-wallet-super-spec-v4.2-FINAL.md`](./vai-wallet-super-spec-v4.2-FINAL.md)
>
> **What changed after this document was written:**
>
> | Layer | Added 2026-04-10 → 2026-04-11 | Affects |
> |-------|-------------------------------|---------|
> | **Remediation layer** | `status_display` field on transactions; notification field renames (DB `notify_commission_available` → API `new_earnings`, DB `notify_clawback` → API `earning_reversed` via `WalletSettingsMapper.cs`); cashout error messages formatted in dollars not raw cents; `RecentRecipientsService`; `RecipientResolutionService`; `WalletPayQrPayloadValidator`; `GetReservedCentsAsync` includes `SEND_PAYMENT` holds; `WRITTEN_OFF` filtered from commission transaction union; `WalletUsd.Format` helper; full Section 8.7 jargon scrub (no "commission"/"clawback"/"KYC" in user-facing strings); migration 056 | Phases 1-3 code (transactions, settings, cashout, activation) |
> | **Phase 4 Send Money** | `SendMoneyService` + `ISendMoneyService`; `WalletPaymentRepository` + `IWalletPaymentRepository`; `WalletSendMoneyController` with `POST /v1/wallet/send` + `POST /v1/wallet/send/{id}/confirm`; `GET /v1/wallet/recent-recipients`; `GET /v1/wallet/resolve-recipient`; `WalletException` with structured extras; `SendMoneyStatusDisplay`; 4 new DTOs under `DTOs/SendMoney/`; 4 new Stripe SDK methods in `StripeService` (Treasury `OutboundPayment`, `PaymentIntent` with `TransferData`/`ApplicationFeeAmount`/`SetupFutureUsage`, `EphemeralKeyService`, `GetPlatformPaymentIntentAsync`); migrations 057 + 058 (the second drops and recreates the anonymous CHECK constraint on `wallet_holds.hold_type` to add `SEND_PAYMENT`); `GetReservedCentsAsync` already includes `SEND_PAYMENT` | New Phase 4 surface |
> | **Option B push notifications** | 2 new constants in `NotificationActivityType.cs` (`PaymentSent`, `PaymentReceived`); `IUserActivityEventService` injected into `SendMoneyService`; 2 private helpers `FirePaymentSentNotificationAsync` + `FirePaymentReceivedNotificationAsync`; fires at both COMPLETED branches (wallet-only in `SendAsync`, card-confirmed in `ConfirmAsync`); matches `PaymentsService.cs:1320-1352` precedent exactly; wrapped in try/catch with `LogWarning` only — never rolls back money movement | New on top of Phase 4 |
>
> **Audit history (14 rounds, 15 blockers found, 15 blockers fixed):**
> - Masters R1: FAIL → 6 blockers fixed
> - Haiku R1: FAIL → 3 blockers fixed
> - Cursor R1: FAIL → 4 blockers fixed
> - Masters R2: FAIL → 2 new blockers fixed (migration 058 for SEND_PAYMENT hold_type, sweep clobber race fixed via `TryExpireAwaitingCardAsync`)
> - Cursor R3: PASS + 1 follow-up fixed (confirm hold-release ordering)
> - Haiku R3: PASS + 2 advisories fixed (PI metadata validation on replay, sweep LIMIT 25 → 100)
> - **Masters R3 (BINDING): PASS — Security 9.0 / Logic 8.5 / Quality 9.0**
> - Backend plug-in compatibility: SEAMLESS (within snapshot)
> - Mobile + infra plug-in compatibility: MINOR FRICTION with 1 blocker (push notifications, fixed via Option B) + 1 ops gate (Stripe Dashboard Payment Methods, Ben handling)
> - Option B push notifications build: +124 LOC, 0 compile errors, matches PaymentsService precedent
> - Masters lightweight re-audit on Option B: PASS — Security 8.8 / Logic 9.2 / Quality 9.0
>
> **Francis's build workflow (per Appendix F of the v4.2 super-spec):**
>
> 1. Run the pre-merge `git diff` command against your live `main` for 7 shared files
> 2. Copy new files from `~/Desktop/vai-api-sep` to your live `vai-api` repo
> 3. Apply minimal diffs to shared files (additive only)
> 4. Run migrations 057 + 058 in order (057 FIRST — 058 depends on `wallet_holds` existing)
> 5. `dotnet build` — should be 0 errors
> 6. Open PR on feature branch (NOT main)
>
> **Everything below this banner describes the 2026-04-10 isolation fix as originally written. It is retained for audit trail but does NOT reflect the current sandbox state.**

---

# VAI Wallet Activation Prompt Flag — PR Spec for Francis (2026-04-10 Historical)

**Status:** Audit-approved (9.5/9.0/8.0 across Security/Logic/Quality) — HISTORICAL
**Source:** Cursor Phases 1-3 delivery + isolation fix
**Target:** vai-app main repo
**Date:** 2026-04-10
**Spec version (current):** [`vai-wallet-super-spec-v4.2-FINAL.md`](./vai-wallet-super-spec-v4.2-FINAL.md) — Stripe SDK-first, audit-remediated
**Superseded:** 2026-04-11 — see banner above

---

## CONSTRAINTS

**DO:**
- Merge all commission engine logic from Phases 1-3 (webhook, ledger, hold-release, settlement)
- Merge activation prompt flag implementation with isolation fix applied
- Run Code Masters audit locally before PR submission
- Update main schema migrations (run 054 + 055)
- Ensure all new services are dependency-injected

**DON'T:**
- Touch SubscriptionsService beyond single-writer gate
- Modify DI/folder structure (add wallet to existing Features/Wallet/)
- Add Phase 4-7 logic (reserved for future)
- Change ReferralCompensationService (shadows handle old logic)
- Break backward compatibility on existing endpoints

---

## BIBLE

### Commission Engine (Phase 1)

**What it does:**
- Listens to Stripe webhooks (invoice.paid, charge.succeeded, charge.refunded, disputes, subscription lifecycle)
- Applies Appendix C commission math (5-tier affiliate structure)
- Accrues commissions in ACCRUED_PENDING state
- Holds for 7-10 days, then releases via Treasury OutboundTransfer
- Marks AVAILABLE when transfer succeeds
- Handles disputes, clawbacks, and refunds idempotently

**Key files from vai-api-sep:**
- `WalletCommissionCalculator.cs` — math engine
- `WalletStripeEventProcessor.cs` — webhook handlers
- `WalletHostedService.cs` — cron-based hold-release + settlement
- `Commission_*` tables in 054_WalletTreasurySchema.sql

**Integration point:**
- SubscriptionsService calls WalletEventQueue.EnqueueInvoicePaidAsync after subscription created
- CommissionEngineActive flag controls shadow vs production mode

### Wallet Onboarding APIs (Phase 2)

**Endpoints:**
- `POST /v1/wallet/activate` — provision Express + Financial Account, clear activation prompt
- `GET /v1/wallet/status` — check onboarding state
- `GET /v1/wallet/transactions` — paginated transaction history (commissions + cashouts)
- `GET /v1/wallet/summary` — earnings this month + lifetime
- `GET /v1/wallet/settings` — user preferences + activation prompt state
- `PUT /v1/wallet/settings` — update auto-pay, auto-cashout, notifications
- `GET /v1/wallet/payout-accounts` — list bank/venmo/paypal methods
- `POST/PUT/DELETE /v1/wallet/payout-accounts/{id}` — manage payout methods

**Database:**
- `wallet_accounts` — user's Stripe Connect account + onboarding status
- `wallet_user_settings` — auto-pay, cashout prefs, activation prompt (read-only on settings POST)
- `wallet_payout_accounts` — encrypted Venmo/PayPal/Bank details

### Cashout Engine (Phase 3)

**What it does:**
- Validates user has no holds and meets $25 minimum
- Enforces 24-hour cashout limit per user
- Supports 3 payout methods: Bank (Stripe Connect), Venmo, PayPal
- Tracks requests in wallet_payout_requests (PROCESSING → COMPLETED/FAILED)
- Queues liquidity for PayPal/Venmo (async processing)

**Key files:**
- `PaypalWalletPayoutService.cs` — PayPal Payouts API integration
- `WalletCashoutService.cs` — orchestration + validation
- `wallet_payout_requests` table

### Activation Prompt Flag (NEW)

**Purpose:** JIT trigger to prompt users to complete wallet setup when pending reaches 500+ cents

**Implementation:**
- Migration 055 adds 4 columns to wallet_user_settings:
  - `activation_prompt_required` (BOOLEAN, default false)
  - `activation_prompt_reason` (VARCHAR 100, nullable)
  - `activation_prompt_set_at` (TIMESTAMPTZ)
  - `activation_prompt_cleared_at` (TIMESTAMPTZ)

- Repository methods:
  - `SetActivationPromptRequiredAsync(userId, reason)` — idempotent via ON CONFLICT
  - `ClearActivationPromptAsync(userId)` — idempotent, preserves history

- Trigger logic (WalletStripeEventProcessor):
  - After invoice.paid webhook processes commissions
  - For each referrer: if pending >= 500 AND no wallet_accounts → set flag with reason "PENDING_GE_500_CENTS" (backend-only; user sees "Verify your identity to start cashing out")

- Endpoint integration:
  - `GET /v1/wallet/settings` returns `activation_prompt` object (read-only)
  - `POST /v1/wallet/activate` calls `ClearActivationPromptAsync` immediately after account provisioning

**Audit Results:**
- Security: 9.5/10 (fully parameterized, idempotent)
- Logic: 9.0/10 (single-writer pattern enforced via fix)
- Quality: 8.0/10 (clean integration, no regressions)

---

## CHANGES

### File 1: Database Migrations

**054_WalletTreasurySchema.sql** (existing, copy from vai-api-sep)
- commission_ledger (10 columns: status tracking, hold logic, dispute flags, idempotency)
- debt_records (clawback tracking)
- wallet_accounts (Stripe Connect + Financial Account)
- wallet_holds (cashout reserves, subscription bridges)
- wallet_payout_accounts (encrypted Venmo/PayPal/Bank)
- wallet_payout_requests (transaction tracking)
- webhook_events (queue for Stripe events)

**055_AddWalletActivationPromptFlag.sql** (new, from vai-api-sep)
- ALTER wallet_user_settings ADD 4 columns (activation_prompt_*)
- CREATE filtered index on activation_prompt_required

### File 2: C# Services (from vai-api-sep)

**WalletCommissionCalculator.cs**
- Implements Appendix C math
- 5-tier affiliate rates (2500, 1000, 500, 300, 200 bps)
- Mentor vs affiliate threshold logic

**WalletStripeEventProcessor.cs**
- invoice.paid → commission accrual + hold scheduling
- charge.succeeded → webhook dedup
- charge.refunded → clawback + reversal
- disputes.created → dispute hold
- subscription canceled → full reversal
- payout.created → mark available
- Includes activation prompt trigger (>= 500 cents)

**WalletHostedService.cs**
- Cron task: release holds to RELEASE_SCHEDULED state
- Cron task: batch Treasury OutboundTransfers for RELEASE_SCHEDULED commissions
- Uses Cronos for Denver timezone (America/Denver)

**WalletCashoutService.cs**
- Validation: $25 minimum, no holds, 24-hour limit
- Routes to bank/venmo/paypal handlers
- Creates wallet_payout_requests record

**PaypalWalletPayoutService.cs**
- PayPal Payouts API integration
- Handles Venmo & PayPal method routing
- Marks QUEUED_LIQUIDITY for async processing

**WalletRepository.cs**
- All data access methods (commission, hold, payout, activation prompt)
- Idempotent inserts/updates via ON CONFLICT
- **IMPORTANT:** UpsertWalletSettingsAsync does NOT touch activation_prompt_* (isolated to set/clear methods)

### File 3: Controllers

**WalletV1Controller.cs** (new)
- All endpoints listed under Wallet Onboarding APIs (Phase 2)
- All endpoints for Cashout Engine (Phase 3)
- Calls WalletActivationService for POST /v1/wallet/activate
- Returns activation_prompt in GET /v1/wallet/settings (read-only)

**WalletAdminController.cs** (new, admin-only)
- `GET /v1/admin/wallet/health` — debug endpoint for health checks
- Requires VaiAdmin role

### File 4: DTOs & Models

**WalletUserSettingsRow** — includes activation_prompt_* fields (read-only on POST)
**CommissionLedgerRow** — status, hold dates, dispute flag, shadow flag
**WalletTransactionRow** — unified view of commissions + cashouts
**WalletMonthlySummaryRow** — earned + cashed-out this month
**Others:** WalletAccountRow, WalletHoldRow, PayoutAccountRow, PayoutRequestRow

### File 5: Dependency Injection

**WalletDependencyResolution.cs** (new)
```csharp
services.AddScoped<WalletRepository>();
services.AddScoped<WalletCommissionCalculator>();
services.AddScoped<WalletStripeEventProcessor>();
services.AddScoped<WalletCashoutService>();
services.AddScoped<PaypalWalletPayoutService>();
services.AddSingleton<HostedService, WalletHostedService>();
```

---

## VERIFICATION CHECKLIST

Before creating PR:

- [ ] **Schema migrations run without error**
  ```bash
  dotnet ef database update
  ```

- [ ] **Build passes**
  ```bash
  dotnet build
  # No errors, no warnings in Wallet feature
  ```

- [ ] **Activation prompt isolation confirmed**
  - [ ] UpsertWalletSettingsAsync does NOT include activation_prompt_* columns
  - [ ] SetActivationPromptRequiredAsync uses COALESCE for set_at
  - [ ] ClearActivationPromptAsync nulls reason and sets cleared_at

- [ ] **Webhook integration verified**
  - [ ] SubscriptionsService calls EnqueueInvoicePaidAsync
  - [ ] WalletStripeEventProcessor handles all 6 event types
  - [ ] Webhook queue is processed async (not inline)

- [ ] **Shadow mode tested**
  - [ ] CommissionEngineActive = false → shadow rows created
  - [ ] CommissionEngineActive = true → production rows created
  - [ ] Shadow rows excluded from user-facing balance/settlement

- [ ] **500-cent trigger tested**
  - [ ] Pending >= 500 → activation prompt flag set
  - [ ] Pending < 500 → flag not set
  - [ ] Flag only set if no wallet_accounts row

- [ ] **Cashout limits tested**
  - [ ] $25 minimum enforced
  - [ ] 24-hour limit enforced
  - [ ] Holds prevent cashout

- [ ] **Integration tests pass**
  ```bash
  dotnet test
  ```

- [ ] **No regressions**
  - [ ] Existing referral logic still works (shadow mode)
  - [ ] No breaking changes to subscriptions endpoints
  - [ ] Stripe webhook endpoint still accessible

---

## MASTERS AUDIT GATE

**Code Masters audit required before PR submission.**

Auditor checks:
- Security: SQL injection, data isolation, concurrency
- Logic: Idempotency, state transitions, shadow isolation, 500-cent trigger
- Quality: Code style, endpoint wiring, async patterns

Scores must be:
- Security ≥ 8.0
- Logic ≥ 8.0
- Quality ≥ 8.0

**Current audit results:**
- Security: 9.5/10 ✅
- Logic: 9.0/10 ✅
- Quality: 8.0/10 ✅

If building from vai-api-sep directly, these scores apply. If making changes, re-audit locally before PR.

---

## SUBMISSION

**PR Title:** `feat: VAI Wallet Phases 1-3 (Commission Engine, Onboarding, Cashout)`

**PR Body:**
```
## Summary

Implements VAI Wallet system in three phases:

**Phase 1: Commission Engine**
- Listens to Stripe webhooks (invoice.paid, charge.succeeded, refunds, disputes)
- Applies Appendix C 5-tier affiliate math
- 7-10 day hold period, then Treasury OutboundTransfer
- Idempotent processing + deduplication
- Dispute handling + clawback recovery

**Phase 2: Onboarding APIs**
- POST /v1/wallet/activate — Express + Financial Account provisioning
- GET /v1/wallet/{status, transactions, summary, settings}
- PUT /v1/wallet/settings — user preferences
- Payout account CRUD (bank, venmo, paypal)

**Phase 3: Cashout Engine**
- $25 minimum, 24-hour limit, hold validation
- Routes to Stripe Connect (bank), Venmo, PayPal
- Async processing for PayPal/Venmo
- Full reconciliation + liquidity queue

**JIT Activation Prompt**
- Flags users when pending reaches 500+ cents
- Cleared immediately on activation
- Idempotent, timestamp-preserving design

## Test Plan

- [ ] Schema migrations apply cleanly
- [ ] dotnet build passes
- [ ] Integration tests pass (commission accrual, hold release, cashout)
- [ ] Shadow mode isolation verified
- [ ] 500-cent trigger fires correctly
- [ ] Webhook processing is idempotent
- [ ] No regressions on existing endpoints

## Audit

Code Masters audit passed:
- Security: 9.5/10
- Logic: 9.0/10
- Quality: 8.0/10

All axes ≥ 8.0. Ready for merge.
```

---

## NOTES FOR FRANCIS

1. **Copy from vai-api-sep:** All C# files exist in ~/Desktop/vai-api-sep/. Copy structure + code as-is.
2. **Schema migrations:** Run 054 first, then 055. Both idempotent (IF NOT EXISTS).
3. **Dependency injection:** Add WalletDependencyResolution to Startup.cs.
4. **Stripe webhooks:** Ensure webhook endpoint is registered (POST /v1/wallet/webhooks/stripe).
5. **HostedService:** WalletHostedService uses Cronos + DI. Add to IHostedService collection.
6. **Backward compatibility:** CommissionEngineActive flag keeps old ReferralCompensationService running if needed. Flip the flag to enable wallet.
7. **Ask Ben:** Any questions on architecture or integration — reach out before building.

---

## ADJUSTMENTS PENDING

Waiting for AG audit results. If AG disagrees on any axis score or finds issues:
- [ ] Update this spec with AG findings
- [ ] Apply any recommended fixes
- [ ] Re-audit if needed
- [ ] Confirm all axes still ≥ 8.0 before PR submission

**Current status:** Ready to build if Ben approves. Will adjust if AG audit differs.
