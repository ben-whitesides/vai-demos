# VAI Wallet Backend Build Prompt -- Cursor

## THIS IS A BUILD TASK, NOT A DESIGN TASK

The spec is done. The architecture is locked. Your job is to BUILD the C#/.NET backend implementation. Do not redesign, do not question architectural decisions, do not propose alternatives. Implement exactly what the spec says.

---

## Reference Documents

1. **Spec (source of truth):** `/Users/benjaminwhitesides/Desktop/specs/vai-wallet-super-spec-v4.2-FINAL.md`
   - Version 4.2 | STRIPE SDK-FIRST | Audit-Remediated
   - Read this FIRST. Every section. Do not skim.
   - **CRITICAL CHANGE from v4.0:** Section 5 completely rewritten. Stripe SDK handles payment orchestration. No custom sagas. No compensating transactions. Thin orchestration layer only.

2. **Build Bible (codebase patterns):** `/Users/benjaminwhitesides/Desktop/specs/vai-codebase-recon-report.md`
   - This documents the EXACT patterns Francis uses in vai-api.
   - Match these patterns precisely. Do not invent your own conventions.

---

## Build Rules -- NON-NEGOTIABLE

### Sandbox Build
- Build in a SANDBOX directory: `~/Desktop/vai-wallet-build/`
- Do NOT modify any existing vai-api files. All wallet code is ADDITIVE in new feature folders.
- When done, the contents of this sandbox can be copied into the vai-api repo as a PR.

### Match Codebase Patterns (from Build Bible)
- **Feature folders:** All wallet code lives under `Features/Wallet/` following the existing Features/ folder convention.
- **DI registration:** Use the existing `DependencyResolution.cs` pattern for registering wallet services.
- **Infrastructure layer:** Stripe wrappers go in `Infrastructure/Stripe/` ONLY. Business logic never calls Stripe directly.
- **Clean Architecture:** Follow Francis's convention -- Controllers -> Services -> Repositories. No business logic in controllers.

### Monetary Values
- ALL new code uses **integer cents** (int). No decimals. No floats. `1995` = $19.95.
- Bridge functions `CentsFromDecimal(decimal)` and `DecimalFromCents(int)` must be created in `Infrastructure/Stripe/` for touchpoints with the existing `ReferralCompensationService` which uses `decimal` (dollars) from Stripe's `UnitAmountDecimal`.
- Never mix decimal dollars and integer cents in the same calculation.

### Database Migrations
- Use the existing migration pattern from the codebase.
- All 10 tables from Appendix B of the spec.
- Tables are ADDED -- no existing tables are modified.

### Webhook Queue Pattern (NEW)
- Existing payment/subscription webhook handlers remain UNCHANGED (inline in PaymentsV1Controller, SubscriptionsV1Controller).
- Only NEW wallet/treasury webhook events use the queue pattern (webhook_events table + IHostedService background worker).
- Clearly separate new wallet webhook controller from existing controllers.

### Commission Engine
- Runs ALONGSIDE the existing `ReferralCompensationService` -- does NOT replace it.
- Shadow mode first (feature flag `wallet_commission_engine_active` = false).
- When flag = true, new system is the sole writer. Single writer rule -- never both.

### Stripe Treasury
- ALL Treasury operations via v1 StripeClient SDK. Treasury is NOT available on v2.
- Connect onboarding can use the existing v2 preview HTTP pattern already in the codebase.
- Treasury is 100% greenfield. No existing Treasury code exists. Build from scratch.

### Push Notifications
- Use **OneSignal + Firebase Cloud Messaging (FCM)** via the existing `react-native-onesignal` integration. NOT Expo Push.

### Cron Jobs
- ALL wallet cron jobs run in **America/Denver** timezone (matching existing LedgerHostedService pattern).
- Job 1 (release holds): 1:00 AM MT
- Job 2 (process transfers): 1:30 AM MT
- Job 3 (reconciliation): 2:00 AM MT
- Job 4 (notifications): 2:30 AM MT
- Job 5 (debt recovery): 2:30 AM MT
- Fee assessment: 3:00 AM MT on 1st of each month

### Redis
- `wallet_provider_status` is a NEW Redis key. Does not exist yet. Default on deploy: `stripe_primary`.

---

## Build Order -- Follow This Exactly

### Phase 0: Infrastructure Foundation
Build the plumbing everything else depends on.

1. **webhook_events table** + migration
2. **IHostedService background worker** that polls webhook_events and dispatches to handlers
3. **Treasury FinancialAccount provisioning service** (JIT activation at $5 threshold)
4. **Cents/decimal bridge functions** in Infrastructure/Stripe/
5. **wallet_accounts table** + migration
6. **Feature flag service** for `wallet_commission_engine_active`
7. **DependencyResolution** registration for all wallet services

**Quality gate:** Project compiles. Bridge functions have unit tests. Worker starts and polls (no-op with empty table).

### Phase 1: Commission Engine
The core earning logic.

1. **commission_ledger table** + migration with all indexes and constraints from spec Appendix B
2. **Commission calculation service** -- 5-level affiliate math, CEILING rounding, integer cents
3. **State machine** -- all 9 states + 2 terminal states, all transitions from spec Section 2.4
4. **Webhook handlers** for: `invoice.paid` (primary trigger), `charge.succeeded` (fallback), `charge.refunded`, `charge.dispute.created`, `charge.dispute.closed`, `customer.subscription.deleted`, `customer.subscription.updated`, `invoice.payment_failed`
5. **4 daily cron jobs** -- release holds, process transfers, reconciliation scan, debt recovery
6. **debt_records table** + garnishment logic
7. **Idempotency** on `(source_invoice_id, builder_user_id, affiliate_level)`

**Quality gate:** Compiles. Unit tests for commission math (all 5 levels, Plus and Mentor). State machine transition tests. Idempotency tests (duplicate webhook = no-op).

### Phase 2: Wallet API
Endpoints from spec Section 9 (updated with send money + recipient resolution).

1. **WalletController** -- balance, transactions, summary, settings, status, activate
2. **CashoutController** -- POST cashout, GET/POST/DELETE/PUT payout-accounts
3. **SendMoneyController** -- POST send, POST send/{id}/confirm, GET recent-recipients, GET resolve-recipient
4. **InvoiceController** -- CRUD + pay + cancel (pay uses same Stripe SDK flow as send)
5. **AdminController** -- payouts list/approve/reject, audit-log, health
6. **Authorization rules** from spec Section 9.9 -- IDOR prevention, JWT scoping, admin role checks
7. **wallet_holds table** + partial unique index for bridge dedup
8. **payout_accounts table** + payout_requests table + wallet_payments table
9. **StatusDisplayMapper** -- shared static helper, applied to ALL response DTOs
10. **Notification settings mapping** -- DB columns (notify_commission_available, notify_clawback) → API fields (new_earnings, earning_reversed)

**Quality gate:** Compiles. All endpoints return correct response shapes including `status_display`. GET/PUT settings use same field names. Authorization tests.

### Phase 3: Cashout Processing
Getting users paid.

1. **Venmo/PayPal routing** via PayPal Payouts API
2. **Bank/ACH routing** via Stripe Treasury OutboundTransfer to ExternalAccount
3. **Cashout validation** -- $25 minimum, balance check, rate limit (1/24h), debt check
4. **CASHOUT_RESERVE hold** management
5. **Platform liquidity buffer** check (spec Section 4.5)
6. **QUEUED_LIQUIDITY** status for insufficient platform funds

**Quality gate:** Compiles. Unit tests for validation rules. Cashout routing tests (Venmo vs PayPal vs Bank).

### Phase 4: Send Money + Payments (Stripe SDK-First)
Stripe does the money movement. We do the orchestration and record-keeping.

**CRITICAL: NO CUSTOM SAGAS.** Read spec Section 5 carefully. Stripe SDK handles all payment orchestration.

1. **SendMoneyService** -- thin orchestrator for `POST /v1/wallet/send`:
   - Resolve recipient (handle → Connected Account + FA)
   - If wallet covers full amount: call `Treasury.OutboundPayment` (FA-to-FA). Done.
   - If card needed: create `PaymentIntent` with `automatic_payment_methods: { enabled: true }` + `transfer_data.destination` + `application_fee_amount` + `customer: stripe_customer_id` + `setup_future_usage: 'off_session'`. Return `client_secret` + `customer_id` + `ephemeral_key` to mobile.
   - **Ephemeral Key:** Generate via existing `StripeService` pattern (already in codebase for payment flows). This enables PaymentSheet to show saved cards from previous VAI payments.
   - **setup_future_usage:** Saves new cards for future one-tap payments.
   - Record transaction in `wallet_payments` table
2. **SendMoneyController** -- `POST /v1/wallet/send`, `POST /v1/wallet/send/{id}/confirm`
3. **RecipientService** -- `GET /v1/wallet/recent-recipients` (DB query, cached 5 min), `GET /v1/wallet/resolve-recipient?handle={handle}` (DB + wallet_accounts check)
4. **QR payload validation** -- strict regex `^https://vai\.app/pay/@[a-zA-Z0-9_]+$`
5. **Invoice payment** -- `POST /v1/invoices/{id}/pay` uses same Stripe SDK flow as send money
6. **`category` field** -- add to vai_invoices table + wallet_payments table. Migration 056.
7. **Platform fee** via `application_fee_amount` on PaymentIntent (card) or deducted pre-transfer (wallet)
8. **`status_display` mapping** -- shared static helper `StatusDisplayMapper.GetDisplay(status, holdUntil)` applied to ALL transaction/invoice responses
9. **Saved cards / ephemeral key** -- when PaymentIntent needed, also return `stripe_customer_id` + `stripe_ephemeral_key` so PaymentSheet shows saved cards. Use existing `EphemeralKeyService` pattern from `StripeService.cs`.

**What Stripe handles (do NOT build):**
- Split payment logic (wallet + card)
- Apple Pay / Google Pay / Apple Cash presentation (React Native SDK config only)
- Saved card retrieval and display (via Customer + Ephemeral Key)
- Card tokenization / PCI compliance
- Card scanning (camera-based card input in PaymentSheet)
- Transfer routing to connected accounts
- 3D Secure / SCA authentication
- Failure handling and automatic rollback
- Biometric authentication (Face ID / Touch ID / Fingerprint — OS handles)

**Quality gate:** Compiles. Tests for: wallet-only send, card-needed send (returns client_secret), confirm after PaymentSheet, recent-recipients returns correct order, resolve-recipient returns 404 for unknown handle, QR validation rejects bad payloads.

### Phase 5: Subscription Bridge
The flywheel -- pay subscription from wallet earnings.

1. **T-48h pre-billing worker** (IHostedService or cron)
2. **Treasury OutboundTransfer** from User FA to Platform FA
3. **Stripe Customer balance credit** (negative value = credit)
4. **Single Leader Rule** -- cron owns orchestration, webhook is monitoring only
5. **Idempotency** via wallet_holds with SUBSCRIPTION_BRIDGE type
6. **Opt-in toggle** (default OFF)

**Quality gate:** Compiles. Tests for: sufficient balance path, insufficient balance (card fallback), partial balance, duplicate prevention.

### Phase 6: Fee Engine
The $14.95/mo fee for heavy-earning free users.

1. **fee_policies table** + seed initial policy
2. **fee_assessments table**
3. **Monthly assessment cron** (3:00 AM MT, 1st of month)
4. **Recurring earnings calculation** (subscriptions active 2+ months)
5. **Waiver logic** (Plus/Mentor users exempt)
6. **Deferral + freeze** at 3+ months outstanding
7. **Upgrade nudge** response data

**Quality gate:** Compiles. Tests for: fee assessed, fee waived (Plus user), fee deferred (low balance), freeze at 3 months.

### Phase 7: Provider Abstraction
PayPal failover for cashouts.

1. **IPayoutFailover interface** -- InitiateExternalPayout, GetPayoutStatus, HealthCheck
2. **Stripe implementation** (primary)
3. **PayPal implementation** (failover, cashout-only)
4. **Redis provider flag** (`wallet_provider_status`) routing
5. **Health probe** (every 30s, 3 consecutive failures = read_only)
6. **Manual failover switch** (ops sets Redis key)

**Quality gate:** Compiles. Tests for: Stripe primary path, PayPal failover path, health probe failure detection, routing logic.

---

## Directory Structure

```
~/Desktop/vai-wallet-build/
  Features/
    Wallet/
      Controllers/
        WalletController.cs
        CashoutController.cs
        SendMoneyController.cs
        InvoiceController.cs
        AdminWalletController.cs
        WalletWebhookController.cs
      Services/
        CommissionService.cs
        CommissionStateMachine.cs
        CashoutService.cs
        SendMoneyService.cs
        RecipientService.cs
        SubscriptionBridgeService.cs
        FeeAssessmentService.cs
        WalletActivationService.cs
        TreasuryService.cs
        PayoutRoutingService.cs
        WalletHealthService.cs
        StatusDisplayMapper.cs
      Models/
        CommissionLedger.cs
        DebtRecord.cs
        PayoutAccount.cs
        PayoutRequest.cs
        WalletPayment.cs
        VaiInvoice.cs
        FeePolicy.cs
        FeeAssessment.cs
        WalletAccount.cs
        WalletHold.cs
        WebhookEvent.cs
      Workers/
        WebhookProcessingWorker.cs
        CommissionReleaseWorker.cs
        TransferProcessingWorker.cs
        ReconciliationWorker.cs
        DebtRecoveryWorker.cs
        NotificationWorker.cs
        SubscriptionBridgeWorker.cs
        FeeAssessmentWorker.cs
        HealthProbeWorker.cs
      Repositories/
        ICommissionRepository.cs
        CommissionRepository.cs
        IPayoutRepository.cs
        PayoutRepository.cs
        IInvoiceRepository.cs
        InvoiceRepository.cs
        IWalletRepository.cs
        WalletRepository.cs
      DTOs/
        WalletBalanceResponse.cs
        TransactionHistoryResponse.cs
        CashoutRequest.cs
        CashoutResponse.cs
        SendMoneyRequest.cs
        SendMoneyResponse.cs
        SendMoneyConfirmRequest.cs
        RecentRecipientResponse.cs
        ResolveRecipientResponse.cs
        InvoiceRequest.cs
        InvoiceResponse.cs
        WalletSettingsDto.cs
        WalletSettingsUpdateDto.cs
      DependencyResolution.cs
  Infrastructure/
    Stripe/
      CentsDecimalBridge.cs
      TreasuryClient.cs
      WalletWebhookSignatureValidator.cs
    PayPal/
      PayPalPayoutClient.cs
    Notifications/
      WalletNotificationService.cs
  Migrations/
    YYYYMMDD_001_CreateCommissionLedger.cs
    YYYYMMDD_002_CreatePayoutAccounts.cs
    YYYYMMDD_003_CreatePayoutRequests.cs
    YYYYMMDD_004_CreateDebtRecords.cs
    YYYYMMDD_005_CreateVaiInvoices.cs
    YYYYMMDD_006_CreateFeePolicies.cs
    YYYYMMDD_007_CreateFeeAssessments.cs
    YYYYMMDD_008_CreateWalletAccounts.cs
    YYYYMMDD_009_CreateWalletHolds.cs
    YYYYMMDD_010_CreateWebhookEvents.cs
    YYYYMMDD_011_CreateWebhookLog.cs
    YYYYMMDD_012_SeedFeePolicy.cs
    YYYYMMDD_013_CreateWalletPayments.cs
    YYYYMMDD_014_AddInvoiceCategory.cs
```

---

## What NOT To Do

- Do NOT modify existing controllers (PaymentsV1Controller, SubscriptionsV1Controller).
- Do NOT modify existing ReferralCompensationService.
- Do NOT modify existing Stripe integration code.
- Do NOT modify existing database tables.
- Do NOT use Expo Push -- use OneSignal.
- Do NOT use floats or decimals for money in new code.
- Do NOT use UTC for cron schedules -- use America/Denver.
- Do NOT auto-switch provider failover -- manual only.
- Do NOT create Treasury calls using v2 API -- use v1 StripeClient SDK.
- Do NOT process webhook business logic inline in the new wallet webhook controller.
- Do NOT build custom payment sagas or compensating transactions -- Stripe SDK handles payment orchestration.
- Do NOT build Apple Pay or Google Pay backend code -- mobile SDK handles this via PaymentSheet config.
- Do NOT show PayPal as a cashout option in any response -- it is infrastructure failover only, never in UI.
- Do NOT expose raw status enum values to mobile -- ALL responses must include `status_display` via StatusDisplayMapper.
- Do NOT use "commission", "clawback", "KYC", "CIP" in any user-facing string (error messages, descriptions, push notifications). See spec Section 8.7.
- Do NOT format amounts as raw cents in error messages -- always format as dollars ("$75.00" not "7500 cents").

---

## Quality Gates Summary

Every phase must pass before moving to the next:

1. **Compiles** -- zero build errors
2. **Unit tests pass** -- cover the math, state machines, and validation rules
3. **Pattern compliance** -- follows Build Bible conventions (feature folders, DI, Clean Architecture)
4. **No existing file modifications** -- `git diff` on vai-api should show only additions

---

*This prompt targets the C#/.NET backend only. Mobile (React Native/Expo) is a separate build scope for Badinho.*
