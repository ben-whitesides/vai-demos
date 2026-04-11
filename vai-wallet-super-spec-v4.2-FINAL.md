# VAI Wallet System — Merged Architecture Spec
## Version 4.2 FINAL | CODEBASE-ALIGNED | APPROVED FOR BUILD
## Implementation-Ready for C#/.NET Backend + React Native/Expo Mobile

> **Status:** APPROVED SPEC — This document enables correct first-time implementation.
>
> **Audience:** Francis Terrero (C#/.NET backend), Badinho (React Native/Expo mobile), Ben Whitesides (product owner)
>
> **Monetary Convention:** ALL amounts in this spec are **integer cents** with an explicit `currency` field unless otherwise noted. `1995` = $19.95. No floats. No ambiguity.

---

## Table of Contents

1. [Stripe Treasury Architecture](#1-stripe-treasury-architecture)
2. [Commission Lifecycle & State Machine](#2-commission-lifecycle--state-machine)
3. [Clawback Mechanism](#3-clawback-mechanism)
4. [Cashout Flow](#4-cashout-flow)
5. [User-to-Mentor Payment Flow](#5-user-to-mentor-payment-flow)
6. [Subscription-from-Wallet Flow](#6-subscription-from-wallet-flow)
7. [$14.95 Fee Logic](#7-1495-fee-logic)
8. [Mobile App UX](#8-mobile-app-ux)
9. [API Endpoints](#9-api-endpoints)
10. [Webhook Handlers](#10-webhook-handlers)
11. [Security & Edge Cases](#11-security--edge-cases)
12. [Migration Plan](#12-migration-plan)
13. [PayPal Payout Redundancy](#13-paypal-payout-redundancy)

**Appendix:**
- [A. Decision Log](#appendix-a-decision-log)
- [B. Database Schema](#appendix-b-database-schema)
- [C. Commission Math Reference](#appendix-c-commission-math-reference)
- [D. Existing vs New Infrastructure](#appendix-d-existing-vs-new-infrastructure)

---

## 1. Stripe Treasury Architecture

### 1.1 Entity Mapping

| VAI Concept | Stripe Object | Relationship |
|-------------|---------------|-------------|
| VAI User (any tier) | `Stripe.Account` (Connect Express) | 1:1 — created via JIT activation (see 1.5) |
| User Wallet | `Stripe.Treasury.FinancialAccount` | 1:1 per Connect Express account |
| VAI Platform | VAI's main Stripe account | Central routing hub, holds pending commissions |
| Platform Financial Account | `Stripe.Treasury.FinancialAccount` (platform-owned) | Holds all commissions during 14-day period |

> **CRITICAL — Stripe API Version:** The vai-api codebase uses BOTH Stripe API versions: v1 StripeClient SDK for most operations AND v2 preview HTTP (api.stripe.com/v2, 2025-05-28.preview) for Connect account/account-link operations. Treasury FinancialAccount operations MUST use v1 SDK (Treasury is not available on v2 for platforms). New wallet code should use v1 StripeClient for all Treasury and payment operations. Connect onboarding can continue using the existing v2 preview HTTP pattern. Document which API version each operation uses in the implementation.

### 1.2 Balance Architecture

Stripe Treasury IS the monetary source of truth. PostgreSQL tracks orchestration state only.

```
┌─────────────────────────────────────────────────────────────────┐
│                     VAI PLATFORM ACCOUNT                        │
│                                                                 │
│   Platform Financial Account                                    │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │  Holds ALL pending commissions during 14-day hold        │  │
│   │  On release: OutboundTransfer → User's FA                │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│         ┌───────────────┬───────────────┬──────────────┐        │
│         ▼               ▼               ▼              ▼        │
│   User A FA       User B FA       User C FA      User D FA     │
│   (Available)     (Available)     (Available)    (Available)    │
│                                                                 │
│   Each user has a single FinancialAccount                       │
│   attached to their Connect Express account                     │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Balance Definitions

| Balance Type | Where It Lives | Description |
|-------------|----------------|-------------|
| **Pending** | Platform FA + PostgreSQL `commission_ledger` | Commissions in 14-day hold. Money sits in Platform FA. DB tracks which user owns how much. |
| **Available** | User's Treasury FA | Released from hold. User can cashout, pay mentors, or cover subscription. |
| **Reserved** | User's Treasury FA (earmarked in DB) | Locked for a pending cashout request. Still in FA until transfer executes. |

### 1.4 Key Constraint

PostgreSQL is the **orchestration ledger** — it tracks commission lifecycle states, idempotency keys, who owes what, and audit trails. It is NOT a parallel money ledger. You never query PostgreSQL to determine "how much money does a user have." You query Stripe Treasury for that.

The one exception: **Pending balance** is a derived PostgreSQL query because the money is in the Platform FA, not yet in the user's FA. Pending balance = `SUM(commission_amount_cents)` from `commission_ledger` rows where `status IN ('ACCRUED_PENDING', 'HELD_PLATFORM', 'RELEASE_SCHEDULED')` AND `builder_user_id = X` AND `dispute_hold = false`. Rows with `dispute_hold = true` are excluded from the pending balance display.

### 1.5 Just-in-Time Financial Account Activation

**Do NOT provision a Connect Express account + Treasury FA for every user at signup.** The vast majority of users will never earn enough to need one.

**JIT Activation Model:**

| Stage | Trigger | What Happens |
|-------|---------|-------------|
| **Pre-$5** | User earns commissions | Commissions tracked in PostgreSQL `commission_ledger` only. Money sits in Platform FA. No Connect Express account created. No identity verification required. |
| **$5 Threshold** | `SUM(commission_amount_cents) WHERE builder_user_id = X AND status IN ('ACCRUED_PENDING', 'HELD_PLATFORM', 'RELEASE_SCHEDULED')` >= 500 | Trigger wallet activation flow: create Connect Express account, prompt user to verify identity (Stripe-hosted). |
| **Post-Activation** | User completes Stripe identity verification | Create Treasury FA. Begin settling commissions to User FA per normal flow. |

**Why $5?** Avoids identity verification friction for the ~100K users who may sign up, share once, and never earn meaningful commissions. Only users who demonstrate real earning activity are asked to verify identity.

**JIT Activation Cap:** Users who hit $5 in accrued commissions have 30 days to complete identity verification and wallet activation. After 30 days, a reminder is sent weekly. After 90 days with no activation, commissions are frozen (no new accruals) until activation completes. Funds are never forfeited — they remain in Platform FA attributed to the user. The freeze is lifted immediately upon successful activation, and all frozen commissions resume normal state machine progression.

> **IMPORTANT — Identity Verification Requirement:** Stripe Treasury requires identity verification (internally: KYC/CIP — these terms are backend-only, NEVER shown in UI) before a Financial Account can be activated. Users MUST complete this step before their FA is live and money can settle to it. The activation prompt should say: **"Verify your identity to start cashing out"** — never mention KYC, CIP, or compliance terminology.

---

## 2. Commission Lifecycle & State Machine

> **IMPORTANT — Monetary Type Bridge:** The existing ReferralCompensationService uses decimal (dollars) from Stripe's UnitAmountDecimal. All NEW wallet/commission code uses integer cents. A bridge function `cents_from_decimal(decimal)` and `decimal_from_cents(int)` must be created in Infrastructure/Stripe/ for any touchpoint between the existing referral pipeline and the new commission engine. Never mix decimal dollars and integer cents in the same calculation.

### 2.1 VAI Affiliate Structure

ANY VAI user earns commissions. Not just "builders" or paying users. Every account gets a share link (`vai.app/share/HANDLE`).

| Tier | Full Price | Affiliate Discount | Price Paid | Commission Base |
|------|-----------|-------------------|-----------|----------------|
| Basic | $0.00 | N/A | $0.00 | $0 (free, no commission) |
| Plus | $19.95/mo | 50% always | $9.95/mo | 995 cents |
| Mentor | $99.95/mo | 50% always | $49.95/mo | 4995 cents |

ALL referred subscribers get 50% off. Always. No exceptions. Commissions are calculated on the **discounted price actually paid**.

| Level | Rate | Plus (995c base) | Mentor (4995c base) |
|-------|------|-------------------|---------------------|
| L1 | 25% | 249c ($2.49) | 1249c ($12.49) |
| L2 | 10% | 100c ($1.00) | 500c ($5.00) |
| L3 | 5% | 50c ($0.50) | 250c ($2.50) |
| L4 | 3% | 30c ($0.30) | 150c ($1.50) |
| L5 | 2% | 20c ($0.20) | 100c ($1.00) |
| **Total** | **45%** | **449c ($4.49)** | **2249c ($22.49)** |

### 2.2 Commission States

9 primary states, 2 terminal recovery states:

```
ACCRUED_PENDING ──────────────► HELD_PLATFORM
       │                              │
       │ (refund/chargeback           │ (14 days pass,
       │  during hold)                │  payment still valid)
       ▼                              ▼
FULLY_REVERSED              RELEASE_SCHEDULED
                                      │
                                      │ (cron picks up,
                                      │  initiates transfer)
                                      ▼
                                  SETTLING
                                      │
                              ┌───────┴────────┐
                              │                │
                              ▼                ▼
                          AVAILABLE      (transfer failed
                              │           → retry or
                              │            RELEASE_SCHEDULED)
                              │
                 ┌────────────┼────────────┐
                 │            │            │
                 ▼            ▼            ▼
          PARTIALLY    FULLY_REVERSED   GARNISHED
          _REVERSED                     (debt applied
                                        against balance,
                                        see §3.3)
                 │                        │
                 │                 ┌──────┴──────┐
                 │                 ▼             ▼
                 │            AVAILABLE     (cashout
                 │            (debt         flow →
                 │            satisfied)    see §4)
                 │
                 ▼
          CLAWBACK_PENDING
                 │
          ┌──────┴──────┐
          ▼             ▼
    (recovered     WRITTEN_OFF
    from future    (uncollectable
    earnings)      after 90 days)
```

### 2.3 State Definitions

| State | Description | Money Location |
|-------|-------------|---------------|
| `ACCRUED_PENDING` | Commission calculated from webhook. 14-day hold starts. | Platform FA |
| `HELD_PLATFORM` | Synonym/phase of pending — money confirmed in platform FA. Used if two-step accrual needed. | Platform FA |
| `RELEASE_SCHEDULED` | 14 days passed. Queued for transfer to user FA. | Platform FA |
| `SETTLING` | `OutboundTransfer` initiated from Platform FA to User FA. In-flight. | In transit |
| `AVAILABLE` | Money landed in user's Treasury FA. User can act on it. | User FA |
| `PARTIALLY_REVERSED` | Late refund/chargeback after settlement. Partial amount clawed back. | Mixed |
| `FULLY_REVERSED` | Full clawback. Commission nullified. | Platform FA or recovered |
| `GARNISHED` | Commission is AVAILABLE but being applied against an outstanding debt (see Debt Model 3.3). Intermediate state where AVAILABLE funds are being applied against an outstanding debt_record. Returns to AVAILABLE once the specific debt is satisfied. | User FA (deducted) → Platform FA |
| `CLAWBACK_PENDING` | Money was already paid out to user. Debt recorded. Awaiting recovery from future earnings. | Owed by user |
| `WRITTEN_OFF` | Clawback debt deemed uncollectable (90-day threshold). | Loss |

### 2.4 State Transitions

| From | To | Trigger | Action |
|------|----|---------|--------|
| — | `ACCRUED_PENDING` | `invoice.paid` or `charge.succeeded` webhook | Calculate 5-level commissions, insert records with `hold_until = NOW() + 14d` |
| `ACCRUED_PENDING` | `RELEASE_SCHEDULED` | Daily cron: `hold_until <= NOW()` and payment still valid | Mark for transfer batch |
| `ACCRUED_PENDING` | `FULLY_REVERSED` | `charge.refunded` / subscription cancelled during hold | Cancel commission. No money moved to user. |
| `RELEASE_SCHEDULED` | `SETTLING` | Transfer worker picks up batch | Initiate `Treasury.OutboundTransfer` from Platform FA to User FA |
| `SETTLING` | `AVAILABLE` | `treasury.outbound_transfer.posted` webhook | Confirm arrival. Update user's available state. |
| `SETTLING` | `RELEASE_SCHEDULED` | `treasury.outbound_transfer.failed` webhook | Retry (max 3 attempts, then alert) |
| `AVAILABLE` | `PARTIALLY_REVERSED` | Late partial refund after settlement | Initiate reverse transfer from User FA to Platform FA for partial amount |
| `AVAILABLE` | `FULLY_REVERSED` | Late full refund after settlement, user FA has funds | Reverse full amount from User FA |
| `AVAILABLE` | `CLAWBACK_PENDING` | Late refund after settlement, user FA insufficient | Record debt. Future commissions garnished. |
| `CLAWBACK_PENDING` | `FULLY_REVERSED` | Debt recovered from future earnings | Debt reduced by garnished amount. If garnished amount fully satisfies the debt, debt status → RECOVERED. If partial, debt.remaining_cents decremented. |
| `ACCRUED_PENDING` | `HELD_PLATFORM` | Allocation recorded — money confirmed in Platform FA (two-step accrual) | Update status. No money movement. |
| `RELEASE_SCHEDULED` | `FULLY_REVERSED` | Refund/chargeback during Tier 1 window (money still in Platform FA) | Cancel commission. No money moved to user. |
| `AVAILABLE` | `GARNISHED` | Outstanding `debt_record` exists for this user; debt applied against available commission | Debit User FA, credit Platform FA for debt amount. Reduce `debt_record.remaining_cents`. |
| `GARNISHED` | `AVAILABLE` | Debt fully satisfied — no more outstanding `debt_records` | Resume normal flow. Remaining commission amount (if any) stays in User FA. |
| `CLAWBACK_PENDING` | `WRITTEN_OFF` | 90 days elapsed, no recovery | Write off as loss |

**Dispute Hold Interaction:** Any commission in any state can have `dispute_hold = true`, which blocks progression through the state machine until `charge.dispute.closed` resolves the dispute. When `dispute_hold = true`: settlement is blocked (no `RELEASE_SCHEDULED` → `SETTLING`), cashout is blocked (held commissions excluded from available balance), and subscription bridge transfers exclude held commissions. See Section 3.6 for full dispute hold lifecycle.

### 2.5 Commission Trigger — CRITICAL

**Gate commissions on `invoice.paid` (preferred) or `charge.succeeded`. NEVER on `customer.subscription.created`.**

`invoice.paid` is preferred because:
- It fires for every recurring billing cycle, not just the first
- It confirms money actually transferred
- It includes the exact amount paid (after discounts)

`charge.succeeded` is the fallback for one-time charges or edge cases where `invoice.paid` doesn't fire.

**Current bug (P0):** Commissions currently fire on `customer.subscription.created`. This must be the FIRST fix before any wallet work begins.

### 2.6 Idempotency

Every commission record is keyed on the **canonical idempotency key: `(stripe_invoice_id, builder_user_id, affiliate_level)`**. This is the single source of deduplication.

**Mapping from `invoice.paid` webhook:**
1. Receive `invoice.paid` event
2. Extract `invoice.id` (this is `stripe_invoice_id`)
3. Look up referral chain for the subscribing user
4. For each affiliate level (1-5): attempt INSERT with unique constraint on `(stripe_invoice_id, builder_user_id, affiliate_level)`
5. Duplicate webhook = unique constraint violation = no-op

For the `charge.succeeded` fallback (one-time charges without an invoice): use `charge.id` as the `stripe_invoice_id` value (prefixed: `chrg_<charge_id>` to distinguish). The key remains `(stripe_invoice_id, builder_user_id, affiliate_level)` in all cases.

The webhook handler must be idempotent — receiving `invoice.paid` twice for the same invoice must not create duplicate commissions.

### 2.7 Migration from Existing Referral Pipeline

The current codebase processes referral compensation via SubscriptionsV1Controller -> HandleWebhookEventAsync -> TriggerReferralProcessing -> ReferralCompensationService.ProcessReferralCompensationAsync. This pipeline fires on customer.subscription.created (among other events) and uses subscription price/period, not invoice idempotency. The wallet commission engine does NOT replace this pipeline immediately. Migration path: Shadow Phase: New commission engine processes invoice.paid webhooks and writes to commission_ledger with is_shadow=true. These rows are NOT used for money movement — they exist only for comparison against Bruno's manual calculations. The existing ReferralCompensationService continues to handle all real money. Daily comparison job diffs shadow rows against Bruno's outputs. Production Phase: After 14-day validation, commission_ledger becomes the source of truth, ReferralCompensationService is deprecated. The authoritative flip from shadow to production is controlled by the single-writer feature flag defined in Section 12.2 (wallet_commission_engine_active). The Production Phase begins when wallet_commission_engine_active is flipped to true per §12.2 (corresponding to the Phase 3 → Phase 4 boundary in §12.3). The "14-day validation" referenced here corresponds to Section 12.3 Phase 1 exit criteria.

**Shadow promotion:** When transitioning from Shadow Phase to Production Phase, existing shadow rows are promoted via `UPDATE commission_ledger SET is_shadow = false WHERE is_shadow = true AND [criteria]`. This is NOT a delete-and-reinsert — the unique constraint on `(source_invoice_id, builder_user_id, affiliate_level)` prevents duplicate inserts. New rows created after the flag flip are written directly with `is_shadow = false`.

---

## 3. Clawback Mechanism

### 3.1 Three-Tier Clawback Model

The clawback strategy depends on WHERE the money is at the time of the refund/chargeback:

| Tier | Condition | Action | Complexity |
|------|-----------|--------|-----------|
| **Tier 1: Pre-Settlement** | Commission still `ACCRUED_PENDING`, `HELD_PLATFORM`, or `RELEASE_SCHEDULED` | Cancel the commission record. Set status to `FULLY_REVERSED`. No money ever moved to user. | Trivial |
| **Tier 2: Post-Settlement, Pre-Payout** | Commission `AVAILABLE`, money in User FA | Initiate reverse `Treasury.InboundTransfer` from User FA back to Platform FA. | Moderate |
| **Tier 3: Post-Payout** | Commission already cashed out. Money left the system. | Create `DebtRecord`. Future commissions are garnished until debt is repaid. If no future earnings after 90 days, write off. | Complex |

### 3.2 Webhook-Driven Clawback Triggers

> **CANONICAL RULE — Charge-Centric Refund Lookup:** Refunds are charge-centric in Stripe. Always look up by `source_charge_id`, even when the trigger is invoice-related. The lookup path is: `charge.refunded` event → extract `charge.id` → query `commission_ledger` by `source_charge_id` → retrieve all commission rows for that charge. Both `source_charge_id` AND `source_invoice_id` are stored on every `commission_ledger` row to support lookups from either direction, but `source_charge_id` is the canonical join key for refund/clawback operations. This same lookup path is used in Section 10 webhook handlers.

| Stripe Event | Clawback Action |
|-------------|----------------|
| `charge.refunded` | Look up all commissions by `source_charge_id`. Apply appropriate tier. |
| `charge.dispute.created` | **PROVISIONAL HOLD only — NOT immediate clawback.** Set `dispute_hold = true` on all commissions linked to this charge. Commission stays in current state but is blocked from settlement and cashout. Do NOT reverse. See 3.6. |
| `charge.dispute.closed` | If dispute `status = lost`: finalize clawback — apply appropriate tier (see 3.1). If dispute `status = won`: remove `dispute_hold` flag, resume normal flow. |
| `customer.subscription.deleted` | Find all `ACCRUED_PENDING` commissions for this subscription. Reverse them. Do NOT reverse already-`AVAILABLE` commissions (subscriber paid for months they used). |
| `invoice.payment_failed` | Do NOT create commissions. If any were speculatively created, reverse them. |

### 3.3 Debt Model (Tier 3)

```sql
-- debt_records table tracks post-payout clawback debt
-- See Appendix B for full schema
```

When a new commission would transition to `AVAILABLE` for a user with outstanding debt:
1. Check `debt_records` for `user_id` where `status = 'OUTSTANDING'`
2. Apply commission amount against oldest debt first (FIFO)
3. If commission fully consumed by debt: commission goes to `GARNISHED`, debt reduced
4. If commission partially consumed: remainder goes to User FA, debt reduced by garnished amount. If garnished amount fully satisfies the debt, debt status → RECOVERED. If partial, debt.remaining_cents decremented.
5. If no debt: normal flow

### 3.4 Daily Audit Cron

Runs in America/Denver timezone (matching the existing LedgerHostedService pattern). All wallet cron jobs run in America/Denver to match the existing codebase convention. Five jobs:

**Job 1 — Release Holds (1:00 AM MT):**
Find all commissions in `ACCRUED_PENDING` or `HELD_PLATFORM` state where `hold_until <= NOW()` **AND `dispute_hold = false`**. Transition to `RELEASE_SCHEDULED`. SQL: `UPDATE commission_ledger SET status = 'RELEASE_SCHEDULED' WHERE status IN ('ACCRUED_PENDING', 'HELD_PLATFORM') AND hold_until <= NOW() AND dispute_hold = false`. Commissions with `dispute_hold = true` remain in their current state regardless of hold period expiry.

**Job 2 — Process Transfers (1:30 AM MT):**
Find all `RELEASE_SCHEDULED` commissions. Batch into per-user `OutboundTransfer` calls (one transfer per user, summing all their due commissions). Transition to `SETTLING`.

**Job 3 — Late Refund/Dispute Reconciliation Scan (2:00 AM MT):**

**Schedule:** Runs daily at 2:00 AM MT (after Job 1 and Job 2 complete).

**Data source:** Query Stripe API `charges.list` with `created` filter for charges in the last 48 hours, cross-reference against `commission_ledger` rows by `source_charge_id`. Also query `disputes.list` for any disputes closed in the last 48 hours.

**Scope:** Only checks charges from the last 48 hours (overlap with previous run for safety). Does NOT scan the entire Stripe charge history on every run.

**Idempotency:** Each reconciliation run writes a `reconciliation_runs` log entry with `run_id`, `timestamp`, `charges_checked`, `discrepancies_found`. Before processing any charge, check if the corresponding `commission_ledger` row already reflects the refund/dispute status -- if so, skip (idempotent).

**Purpose:** This is a RECONCILIATION safety net -- it catches `charge.refunded` or `charge.dispute.closed` (lost) events that webhook delivery missed for commissions in `AVAILABLE` state. It is NOT a proactive subscription status scanner. Do NOT reverse `AVAILABLE` commissions based on subscription cancellation alone. Cancellation without refund = subscriber used the service for that period = commission is earned. Only reverse on confirmed money-back events (refund, chargeback lost).

**Job 4 — Notifications (2:30 AM MT):**
Send push notifications for commissions that became available, clawbacks processed, and payout completions since the last notification run.

**Job 5 — Debt Recovery (2:30 AM MT):**
For users with `CLAWBACK_PENDING` commissions and `OUTSTANDING` debt older than 90 days with no offsetting earnings, transition to `WRITTEN_OFF`.

**Fee Assessment (3:00 AM MT on 1st of each month):**
Run the $14.95 fee assessment for the previous month (see Section 7).

### 3.5 Notifications

| Event | Notification |
|-------|-------------|
| Earning available | Push: "You have $X.XX available to cash out!" |
| Earning reversed (during hold) | Push: "$X.XX earning reversed — [subscriber name] cancelled" |
| Earning reversed (after settlement) | Push: "$X.XX adjusted from your balance — refund on [subscriber name]'s payment" |
| Balance adjustment | Push: "Your balance has been adjusted. Future earnings will offset $X.XX owed." |
| Payment received | Push: "[Sender Name] sent you $X.XX" |
| Payment sent | Push: "You sent $X.XX to [Recipient Name]" |

> **Language rules:** Push notifications NEVER use: "commission", "clawback", "debt", "saga", "dispute hold". Use plain language: "earning", "reversed", "adjusted", "on hold".

### 3.6 Provisional Dispute Hold

Disputes are NOT immediate clawbacks. A dispute may be won by the merchant, in which case reversing the commission was wrong. The flow:

1. `charge.dispute.created` fires
2. Set `dispute_hold = true` on all commissions linked to the disputed charge
3. Commission stays in its current state (`ACCRUED_PENDING`, `AVAILABLE`, etc.)
4. The hold blocks:
   - Settlement (commission will not move from `RELEASE_SCHEDULED` to `SETTLING`)
   - Cashout (held commissions excluded from available balance for cashout purposes)
   - Subscription bridge (held commissions not counted toward bridge transfer)
5. `charge.dispute.closed` fires:
   - **Dispute lost:** Apply the appropriate clawback tier (Section 3.1). Set `dispute_hold = false`. Transition to `FULLY_REVERSED` or `CLAWBACK_PENDING` as appropriate.
   - **Dispute won:** Set `dispute_hold = false`. Commission resumes normal lifecycle. No reversal.

This prevents wrongful reversal on disputes that are later won by VAI.

---

## 4. Cashout Flow

### 4.1 Supported Rails

| Rail | Integration | Fee | Speed | Tax Reporting | Priority | UI Visibility |
|------|------------|-----|-------|--------------|----------|---------------|
| **Venmo** | PayPal Payouts API (`recipient_type: "PHONE"` or `"EMAIL"`) | $0 to user (VAI absorbs) | Instant to Venmo balance | VAI files 1099-NEC (see 4.6) | **PRIMARY — push users here** | ✅ Front and center |
| **Bank (ACH)** | `Stripe.Treasury.OutboundTransfer` to linked `ExternalAccount` | $0.25/txn | 2-3 business days | Stripe Connect handles 1099 | Secondary | ✅ Shown |
| **Stripe Autopay** | Scheduled automatic `OutboundTransfer` | $0.25/txn | 2-3 business days | Stripe Connect handles 1099 | Optional (user-enabled) | ✅ In settings |
| **PayPal** | PayPal Payouts API | $0.25/txn | Instant to PayPal balance | VAI files 1099-NEC (see 4.6) | **SILENT FAILOVER ONLY** | ❌ NEVER in UI |

> **PayPal = Infrastructure Only.** PayPal integration exists as a redundancy layer if Stripe Connect is ever disrupted. It is NEVER shown as a cashout option in the mobile UI. The integration stays maintained and tested, but invisible to users. If Stripe Connect goes down, PayPal can be activated as a failover via feature flag — no code deployment needed, just config change.

### 4.1.1 PayPal/Venmo Funding Source

PayPal/Venmo payouts are prefunded from Platform FA. Before batch execution, verify Platform FA balance covers all pending PayPal/Venmo payouts. If insufficient, prioritize by request timestamp (FIFO) — oldest requests are processed first until Platform FA balance is exhausted. Remaining requests are queued with status `QUEUED_LIQUIDITY` and retried on the next cron cycle. See also Section 4.5 Platform Liquidity Buffer.

### 4.2 Minimum Cashout

**$25 minimum across all methods.** No exceptions. Micro-commissions accumulate until threshold is met.

### 4.3 Cashout Processing Flow

```
User taps "Cash Out" in wallet tab
    │
    ▼
Select amount (default: full available balance)
    │
    ▼
Select destination: Venmo / PayPal / Bank
    │
    ▼
If no payout account linked → "Link [Method]" flow
    │
    ▼
Backend validation:
  ✓ amount_cents >= 2500 (minimum $25)
  ✓ amount_cents <= user's Treasury FA available balance
  ✓ No outstanding debt (or debt already deducted)
  ✓ Payout account is verified
  ✓ Rate limit: max 1 cashout per 24 hours
  ✓ User account not suspended/flagged
    │
    ▼
Create payout_request record (status: PROCESSING)
Reserve funds: create a wallet_holds row with hold_type=CASHOUT_RESERVE,
  amount_cents=cashout_amount, stripe_reference_id=payout_request_id.
  Release the hold on payout completion or failure.
    │
    ▼
Route to provider:
  Venmo/PayPal → PayPal Payouts API
  Bank → Stripe Treasury OutboundTransfer to ExternalAccount
    │
    ├── Success → payout_request.status = COMPLETED
    │              Push notification: "Money is on the way!"
    │
    └── Failure → payout_request.status = FAILED
                   Un-reserve funds
                   Push notification: "Cashout failed. Try again."
                   Alert ops team if repeated failures
```

### 4.4 Stripe Bank Autopay (Optional Feature)

Users can enable scheduled automatic cashouts:
- Configure threshold amount (e.g., "Cash out when balance exceeds $100")
- Configure frequency (weekly, biweekly, monthly)
- Must have a verified bank account linked
- Cron checks eligible users and initiates `OutboundTransfer` on schedule

### 4.5 Platform Liquidity Buffer

The Platform FA must maintain sufficient funds to cover all pending payouts. Before batch payout execution:

1. Calculate `total_pending = SUM(amount_cents) WHERE status = 'PROCESSING'` across all pending payout requests
2. Query Platform FA available balance
3. If `available_platform_fa_balance < total_pending`:
   - Process payouts in priority order (oldest requests first)
   - Queue remaining payouts with status `QUEUED_LIQUIDITY`
   - Alert ops team
4. Retry queued payouts on next cron cycle

**Timing gap warning:** Venmo instant payouts settle immediately, but Treasury transfers take 2 business days to settle. A batch of Venmo payouts can drain the Platform FA before Treasury settlements arrive. The liquidity buffer must account for this gap — maintain at minimum 2 days' worth of projected Venmo payouts as reserve.

### 4.6 Tax Reporting — 1099-NEC

**VAI is the payor and is responsible for 1099-NEC filing** for cumulative payouts exceeding $600/year per recipient.

| Payout Rail | Tax Handling |
|------------|-------------|
| **Stripe Connect (Bank/ACH)** | Stripe Connect Express handles W-9 collection and 1099-NEC generation automatically. Stripe files on VAI's behalf. |
| **PayPal/Venmo** | VAI must independently track cumulative payout amounts per user per calendar year. When a user's total PayPal/Venmo payouts exceed $600, VAI must collect W-9 information and file 1099-NEC. |

**Recommendation:** Route all payouts through Stripe Connect where possible to consolidate tax reporting. For PayPal/Venmo payouts, maintain tracking logic within the payout processing pipeline that aggregates cumulative payouts per user per calendar year across all rails. Block PayPal/Venmo cashouts at $600 cumulative until W-9 is on file.

> **NOTE:** Venmo does NOT issue 1099-K on behalf of VAI. Venmo's 1099-K obligations apply to Venmo's own users for personal payment volume — not for payouts made via the PayPal Payouts API. VAI is the payor; the 1099-NEC responsibility is VAI's.

---

## 5. Payments — Stripe SDK-First Architecture

### 5.1 Design Philosophy

**Stripe does the money movement. VAI does the UI and record-keeping.**

We do NOT build custom payment sagas, compensating transactions, or split-payment orchestration. Stripe's SDK handles all of this natively through Connect Express + Treasury + PaymentIntent. VAI is a thin orchestration layer that:
1. Resolves recipients
2. Calls the right Stripe SDK method
3. Records the transaction
4. Shows the user a clean result

### 5.2 Payment Methods — What Stripe Gives Us

| Method | Stripe SDK Integration | VAI Code Needed |
|--------|----------------------|-----------------|
| **Wallet-to-Wallet** | `Treasury.OutboundPayment` — FA-to-FA between connected accounts on same platform. Atomic. | Thin wrapper: resolve recipient FA, call SDK, record result |
| **Card** | `PaymentIntent` with `automatic_payment_methods: { enabled: true }` + `transfer_data.destination` | Create PI server-side, return `client_secret` to mobile |
| **Apple Pay** | Built into Stripe React Native SDK. `initPaymentSheet({ applePay: { merchantCountryCode: 'US' } })` — shows Apple Pay button automatically if device supports it | Zero backend code. Mobile config only. |
| **Google Pay** | Built into Stripe React Native SDK. `initPaymentSheet({ googlePay: { merchantCountryCode: 'US', currencyCode: 'USD' } })` — shows Google Pay button automatically | Zero backend code. Mobile config only. |
| **Venmo** | PayPal Payouts API for **cashouts** (primary rail, $0 fee, instant). For incoming P2P payments: users pay via wallet balance, card, Apple Pay, or Google Pay — NOT via Venmo directly. Venmo is a **cashout destination**, not a payment source. | Cashout orchestration only. Venmo = front and center in cashout UI. |

> **Key insight:** Apple Pay and Google Pay are NOT separate payment methods in Stripe. They are card payment methods confirmed through digital wallet UX. When `automatic_payment_methods` is enabled on a PaymentIntent, Stripe's React Native SDK (`@stripe/stripe-react-native`) automatically shows Apple Pay / Google Pay buttons if the device supports them. **Zero additional backend code required.**

### 5.3 Send Money Flow (Screen 5 — Any User to Any User)

```
User taps "Send" on Screen 5
    │
    ▼
POST /v1/wallet/send
  { recipient_handle, amount_cents, category, note }
    │
    ▼
Backend: Resolve recipient → get their Connected Account + FA
    │
    ├── Sender has sufficient wallet balance?
    │       │
    │       ├── YES (full amount covered by wallet)
    │       │     │
    │       │     ▼
    │       │   Stripe SDK: Treasury.OutboundPayment
    │       │     source: sender FA
    │       │     destination: recipient FA
    │       │     amount, currency, statement_descriptor
    │       │     ──────────────────────────────────
    │       │     Stripe handles the atomic transfer.
    │       │     Webhook: treasury.outbound_payment.posted → record COMPLETED
    │       │
    │       └── NO (need card for remainder or full amount)
    │             │
    │             ▼
    │           Stripe SDK: PaymentIntent.create
    │             amount: (total - wallet_portion)
    │             automatic_payment_methods: { enabled: true }
    │             transfer_data: { destination: recipient_connect_id }
    │             application_fee_amount: platform_fee
    │             ──────────────────────────────────
    │             Return client_secret to mobile.
    │             Mobile presents PaymentSheet.
    │             PaymentSheet shows: Card, Apple Pay, Google Pay
    │             (automatically based on device + user's saved methods)
    │             Stripe handles everything from here.
    │
    ▼
Record transaction in wallet_payments table
Return result to mobile
```

**What VAI builds:** ~50 lines of orchestration code. Stripe SDK does the rest.

**What Stripe SDK handles (we do NOT build):**
- Split payment logic (wallet + card)
- Apple Pay / Google Pay presentation and confirmation
- Card tokenization and PCI compliance
- Transfer routing to connected accounts
- Failure handling and automatic rollback
- 3D Secure / SCA authentication
- Receipt generation

### 5.4 Invoice Flow (Mentor-Initiated Requests)

Mentors can still create payment requests. This is a separate flow from Screen 5 "send money."

1. Mentor creates invoice → `POST /v1/invoices`
2. Client gets push notification: "[Mentor Name] requests $XX.XX"
3. Client taps to pay → same Stripe SDK flow as 5.3 (PaymentSheet with Apple Pay / Google Pay / Card)
4. Wallet balance auto-applied first if available

**The payment execution is identical** — only the entry point differs (sender-initiated vs recipient-requested).

### 5.5 Platform Fee

VAI takes a platform fee on payments (configurable, suggest 5-10%):
- **Card payments:** `application_fee_amount` on PaymentIntent — Stripe deducts automatically
- **Wallet-to-wallet:** Fee deducted from transfer amount before crediting recipient FA
- Fee is transparent to sender: "Fee: $X.XX" shown on confirmation screen

### 5.6 Stripe React Native Integration (Badinho)

**Package:** `@stripe/stripe-react-native` (already in vai-app dependencies)

**PaymentSheet setup for Screen 5 (saved cards + Apple Pay + Google Pay):**

```javascript
import { useStripe } from '@stripe/stripe-react-native';

const { initPaymentSheet, presentPaymentSheet } = useStripe();

// After backend returns from POST /v1/wallet/send (AWAITING_CARD response)
const { stripe_client_secret, stripe_customer_id, stripe_ephemeral_key } = sendResponse;

await initPaymentSheet({
  paymentIntentClientSecret: stripe_client_secret,
  customerId: stripe_customer_id,               // ← Shows saved cards
  customerEphemeralKeySecret: stripe_ephemeral_key, // ← Auth for saved cards
  merchantDisplayName: 'VAI',
  applePay: { merchantCountryCode: 'US' },      // ← Apple Pay + Apple Cash
  googlePay: {
    merchantCountryCode: 'US',
    currencyCode: 'USD',
    testEnv: __DEV__,
  },
  defaultBillingDetails: {
    name: currentUser.displayName,               // ← Pre-fill from Auth0 profile
  },
  // PaymentSheet automatically shows in priority order:
  // 1. Apple Pay / Google Pay (if available on device)
  // 2. Saved cards from previous VAI payments
  // 3. New card entry (saved for future via setup_future_usage)
});

const { error } = await presentPaymentSheet();
if (error) {
  // Show error to user: "Payment cancelled" or retry
} else {
  // Call POST /v1/wallet/send/{payment_id}/confirm
  // Then show success screen: "Sent to [Name]!"
}
```

**What shows up on PaymentSheet by platform:**

| Platform | What User Sees | Biometric |
|----------|---------------|-----------|
| **iOS** | Apple Pay button (if configured) → Saved Visa •••• 4242 → Add new card | Face ID / Touch ID |
| **Android** | Google Pay button (if configured) → Saved Visa •••• 4242 → Add new card | Fingerprint / PIN |
| **Both** | Previously used cards from VAI subscription auto-populate | Device biometric |

**Apple Cash note:** If a user has Apple Cash balance in their Apple Wallet, it appears as a funding source when they use Apple Pay. This is controlled entirely by Apple — zero VAI/Stripe code needed. The user sees "Apple Cash" as a payment option inside the Apple Pay sheet.

**Apple Pay button (standalone, optional):**

```javascript
import { PlatformPayButton, usePlatformPay } from '@stripe/stripe-react-native';

const { isPlatformPaySupported, confirmPlatformPayPayment } = usePlatformPay();

// Shows native Apple Pay / Google Pay button
<PlatformPayButton
  type={PlatformPay.ButtonType.Pay}
  onPress={handlePlatformPay}
  style={{ width: '100%', height: 50 }}
/>
```

**What Badinho does NOT build:**
- No custom card input forms
- No Apple Pay certificate management (Stripe handles it)
- No Google Pay merchant registration (Stripe handles it)
- No PCI compliance code
- No 3D Secure handling

### 5.7 Payment Endpoints

| Endpoint | Purpose | Stripe SDK Call |
|----------|---------|----------------|
| `POST /v1/wallet/send` | Screen 5 send money | `Treasury.OutboundPayment` (wallet) or `PaymentIntent.create` (card) |
| `GET /v1/wallet/recent-recipients` | Screen 5 recent contacts | DB query only (no Stripe call) |
| `GET /v1/wallet/resolve-recipient?handle={handle}` | QR code + search resolution | DB query + check `wallet_accounts` |
| `POST /v1/invoices` | Mentor creates payment request | DB only (no Stripe call until paid) |
| `POST /v1/invoices/{id}/pay` | Client pays invoice | Same Stripe flow as `/v1/wallet/send` |
| `GET /v1/invoices` | List sent/received requests | DB query only |
| `POST /v1/invoices/{id}/cancel` | Cancel payment request | DB only |

### 5.8 Native Device Features (Zero Code — Platform Handles)

These features come FREE through Stripe SDK + native OS. No VAI code required.

| Feature | How It Works | VAI Code |
|---------|-------------|----------|
| **Apple Pay** | Stripe PaymentSheet shows Apple Pay if device has cards in Apple Wallet. Confirmed via Face ID / Touch ID. | Config only: `applePay: { merchantCountryCode: 'US' }` |
| **Apple Cash** | If user has Apple Cash balance, it appears as a funding source inside Apple Pay sheet. Apple controls this entirely. | Zero — Apple handles |
| **Google Pay** | Stripe PaymentSheet shows Google Pay if device has cards in Google Pay. Confirmed via fingerprint / PIN. | Config only: `googlePay: { merchantCountryCode: 'US' }` |
| **Google Wallet balance** | If user has Google Wallet balance, it appears as funding inside Google Pay sheet. Google controls this. | Zero — Google handles |
| **Saved cards** | Any card user previously used for VAI subscription/payments shows up in PaymentSheet via Stripe Customer + Ephemeral Key. | Pass `customerId` + `ephemeralKey` — existing pattern in vai-api |
| **Biometric auth** | Face ID (iOS), Touch ID (iOS), Fingerprint (Android) — triggered automatically by Apple Pay / Google Pay flows. | Zero — OS handles |
| **Card scanning** | iOS/Android camera card scan in PaymentSheet "Add new card" flow. | Zero — Stripe PaymentSheet handles |

**Total native features: 7. Total VAI code for all 7: ~4 lines of config.**

### 5.9 Stripe Platform Approval — Pre-Launch Requirements

**Treasury requires Stripe approval before go-live.** This is NOT a post-build concern — it's a pre-launch gate.

| Requirement | Status | Action Needed |
|-------------|--------|---------------|
| **Stripe Connect (Express)** | ✅ Already active in vai-api | None — existing integration |
| **Treasury capability** | ❓ Must be requested | Request `capabilities[treasury][requested]=true` on VAI's platform account. Stripe reviews platform compliance (AML/KYC program, use case). Approval typically 1-2 weeks. |
| **Apple Pay merchant registration** | ❓ Must be configured | Register Apple Pay merchant ID in Stripe Dashboard → Settings → Payment Methods → Apple Pay. Upload Apple Pay certificate. One-time setup, ~30 minutes. |
| **Google Pay merchant registration** | ✅ Automatic via Stripe | Stripe handles Google Pay merchant registration for Connect platforms. No separate registration needed. |
| **Connected account Treasury capability** | 🔄 Per-user at activation | When user hits $5 threshold → `capabilities[treasury][requested]=true` on their Connected Account. Stripe collects identity verification (our "Verify your identity" flow). |
| **PayPal Payouts API** | ✅ Already active in vai-api | None — existing integration |

**Pre-launch checklist for Ben:**
1. [ ] Request Treasury capability on VAI platform account (Stripe Dashboard or API)
2. [ ] Configure Apple Pay merchant ID + certificate in Stripe Dashboard
3. [ ] Verify VAI's Stripe account has `transfers`, `treasury` capabilities active
4. [ ] Test in Stripe test mode before going live (all SDK calls work in test mode)
5. [ ] Submit for Stripe review (they review platform compliance, not code)

**Timeline:** Request Treasury access NOW. Code can be built in parallel. Stripe approval and code completion should converge. No code changes needed after approval — same SDK calls work in test and live mode.

> **Key point:** Stripe does NOT review or approve your code. They review your platform's compliance program (AML/KYC policies, use case description, projected volume). Once approved, the SDK just works. Build now, get approved in parallel.

> **Money Transmitter Licensing Note:** Stripe acts as the settlement agent for all transfers. VAI operates under Stripe's Money Services Business (MSB) license for payments flowing through Connect. This assumption must be validated by legal counsel.

---

## 6. Subscription-from-Wallet Flow

### 6.1 The Flywheel

This is the killer feature. A user shares VAI with 4 people who subscribe to Plus at $9.95/mo. The user earns 4 x $2.49 = $9.96/mo in L1 commissions. Their Plus subscription ($9.95/mo) is fully covered by their wallet. **Their coaching app is free forever, paid by their network.**

### 6.2 The Wallet-to-Subscription Bridge

Stripe Billing does not natively pull from Treasury. The bridge works by pre-crediting the Customer balance:

**Step 1 — Pre-Billing Check (T-48h):**
A scheduled worker runs 48 hours before each user's billing date (T-48h instead of T-24h to account for weekend/holiday bank settlement delays). For each user with an active subscription AND a Treasury FA:
- Query the user's Treasury FA available balance
- Compare against the upcoming invoice amount

**Step 2 — Transfer (if sufficient):**
If Treasury balance >= invoice amount:
- Execute `Treasury.OutboundTransfer` from User FA → Platform FA for the exact invoice amount
- Wait for transfer confirmation

**Step 3 — Credit Customer Balance:**
- Call `Stripe.Customer.update` to credit the user's `balance` (Customer balance) with the invoice amount (as a negative value, which is a credit)
- This is a Stripe Customer Balance credit, not a charge

**Step 4 — Stripe Billing Consumes Credit:**
- When Stripe Billing processes the invoice (T+0), it checks Customer balance first
- Finds the credit, applies it → invoice is paid with $0 card charge
- User's card is not charged

**Step 5 — Fallback:**
If Treasury balance is insufficient:
- Do nothing. Stripe Billing charges the card on file as normal.
- If card also fails, normal Stripe dunning/retry flow applies.

### 6.2.1 Single Leader Rule

The scheduled worker at T-48h is the **SOLE orchestration owner** for the subscription bridge. The `invoice.created` webhook does NOT trigger the bridge — it only logs for monitoring. This prevents race conditions between the cron worker and webhook handler.

**Idempotency key:** `bridge_{invoice_id}`. A `wallet_holds` row with `hold_type = SUBSCRIPTION_BRIDGE` and `stripe_reference_id = {invoice_id}` prevents duplicate transfers. Before initiating any bridge transfer, the worker checks for an existing `wallet_holds` row with that `stripe_reference_id`. If one exists, the transfer is a no-op.

### 6.3 Edge Cases

| Scenario | Handling |
|----------|---------|
| Wallet has partial funds | Transfer what's available, card covers the rest. Partial credit to Customer balance. |
| Transfer fails at T-48h | Retry at T-24h. If still fails, card is charged normally. |
| User disables wallet-pay-subscription | Respect the toggle. Card is charged. |
| User upgrades mid-cycle | Pro-rated invoice. Wallet bridge checks pro-rated amount. |
| User downgrades mid-cycle | Credit issued by Stripe. No wallet interaction needed. |

### 6.4 User Control

Users must explicitly opt-in to "Pay subscription from wallet." This is a toggle in wallet settings. Default: OFF. When enabled, the pre-billing worker includes them.

---

## 7. $14.95 Fee Logic

### 7.1 Purpose

Free users who earn significant recurring commissions use VAI's payment infrastructure without contributing subscription revenue. The $14.95/mo fee ensures VAI captures value from heavy earners who stay on the free tier.

### 7.2 Trigger Conditions

| Condition | Required |
|-----------|----------|
| User tier = Basic (FREE) | Yes |
| Sum of commissions earned in current calendar month > $50.00 (5000 cents) recurring | Yes |
| "Recurring" means commissions from subscriptions active for 2+ consecutive months | Yes |

### 7.3 Fee Schedule

- **Assessment:** 1st of each month for previous month's activity
- **Deduction:** Auto-deducted from wallet balance via `Treasury.OutboundTransfer` from User FA to Platform FA
- **Insufficient balance:** If wallet balance < $14.95, the fee is deferred. It accumulates. Deducted from next available balance or next cashout.
- **Deferral cap:** If a user owes 3+ months of deferred fees ($44.85+), **freeze new commission accrual** until they either upgrade to a paid tier or pay the outstanding fees. Frozen commissions remain in Platform FA but do not progress through the state machine. Display: "Your wallet is on hold due to outstanding fees. Upgrade to Plus to clear your balance and resume earning."

### 7.4 Waiver Rules

| Scenario | Fee Status |
|----------|-----------|
| User subscribes to Plus ($19.95/mo) before month-end | **Waived** for that month |
| User subscribes to Mentor ($99.95/mo) before month-end | **Waived** for that month |
| User upgrades to Plus mid-month (e.g., day 15) | **Waived** for entire month (not pro-rated) |
| User downgrades from Plus to Basic mid-month | Fee assessed if earnings > $50 for that month |
| User earns $50.01 but all from one-time charges (not recurring) | **Not charged** — must be recurring |

### 7.5 Versioned Policy Table

```sql
-- fee_policies table (see Appendix B for full schema)
-- Allows fee amount, threshold, and waiver rules to change over time
-- without code changes. Backend reads active policy by effective_date.
```

| Column | Example Value |
|--------|--------------|
| `id` | 1 |
| `fee_amount_cents` | 1495 |
| `threshold_cents` | 5000 |
| `waiver_tiers` | `["PLUS", "MENTOR"]` |
| `recurring_months_required` | 2 |
| `effective_date` | 2026-05-01 |
| `superseded_date` | NULL (current) |

### 7.6 The Upgrade Nudge

When a free user crosses the $50/mo threshold, the app displays:

> "You're earning $XX.XX/mo from your network. Subscribe to Plus for $9.95/mo and save $5/mo on fees — plus get AVANTI Coach included."

This is a conversion mechanism, not just a fee. The math: $14.95 fee vs $9.95 Plus subscription = user saves $5/mo AND gets AVANTI.

---

## 8. Mobile App UX

### 8.1 Wallet Tab — Home Screen

```
┌──────────────────────────────────────────┐
│              YOUR EARNINGS               │
│                                          │
│   Available        $89.00                │
│   Pending          $38.50                │
│   ───────────────────────                │
│   Lifetime         $1,204.00             │
│                                          │
│   ┌────────────────────────────────────┐ │
│   │  [ CASH OUT $89.00 ]              │ │
│   └────────────────────────────────────┘ │
│                                          │
│   Next available: $38.50 on Apr 23       │
│                                          │
│ ┌────────────────────────────────────┐   │
│ │ ████████████░░░░  $6.46 / $9.95   │   │
│ │ Earn $3.49 more to pay your       │   │
│ │ subscription for free!             │   │
│ └────────────────────────────────────┘   │
│                                          │
├──────────────────────────────────────────┤
│  RECENT ACTIVITY                         │
│                                          │
│  ↑ $4.99  @jake_lifts signed up         │
│    PENDING · Available Apr 23            │
│                                          │
│  ↑ $2.00  L2 from @coach_mike           │
│    AVAILABLE · Cash out now              │
│                                          │
│  ↓ -$1.50 Earning reversed               │
│    @old_subscriber cancelled             │
│                                          │
│  ✓ $45.00 Paid to Venmo                 │
│    Mar 28, 2026                          │
│                                          │
│  ↓ -$9.95 Subscription auto-paid        │
│    From wallet · Apr 1, 2026             │
└──────────────────────────────────────────┘
```

### 8.2 Progress Bar (Retention Feature)

The progress bar shows how close the user is to earning enough to cover their subscription from wallet commissions alone. This is a **killer retention feature** — it gamifies sharing.

**Logic:**
- Numerator: user's average monthly recurring commission (rolling 3-month average, or current month if < 3 months of data)
- Denominator: user's subscription cost (995 for Plus, 4995 for Mentor, or 995 as target for Basic users)
- Display: `"Earn $X.XX more to pay your subscription for free!"`
- When numerator >= denominator: `"Your network pays your subscription! 🎉"` (celebratory state)

**For Basic (free) users:** Show progress toward Plus cost ($9.95). Message: `"Earn $X.XX more to unlock AVANTI Coach — paid by your network!"`

### 8.3 Cashout Flow Screens

**Screen 1 — Amount Input:**
- Pre-filled with full available balance
- User can edit down (min $25.00)
- Shows available balance prominently
- "Cash Out" button

**Screen 2 — Select Destination:**
- Venmo (recommended badge, first position, $0 fee callout)
- Bank Account
- Each shows linked account info or "Link [Method]" if not connected
- **PayPal is NOT shown.** PayPal exists as silent infrastructure failover only (see Section 4.1). Never surfaces in UI.

**Screen 3 — Confirmation:**
- Amount
- Destination with masked identifier
- Fee breakdown ($0 for Venmo, $0.25 for others)
- Net amount received
- "Confirm" button

**Screen 4 — Success:**
- Checkmark animation
- "Money is on the way!"
- Estimated arrival time
- "Done" button returns to wallet

### 8.4 Link Venmo Flow

1. User taps "Link Venmo"
2. Enter Venmo handle (@username) or phone number
3. Backend validates format
4. Small verification payment ($0.01, refunded) to confirm account exists
5. Account saved as payout destination
6. Optional: set as default

### 8.5 Make Payment Flow (Screen 5)

**Design pattern:** Mirrors Venmo/Zelle/Apple Pay simplicity. No invoice complexity visible to user.

**Screen 5 — Make Payment:**

```
┌──────────────────────────────────────────┐
│              MAKE PAYMENT                │
│                                          │
│  RECENT                                  │
│  ┌──────────────────────────────────┐    │
│  │ SJ  Sarah Johnson               │    │
│  │ MC  Marcus Chen                  │    │
│  │ CE  Coach Elite                  │    │
│  └──────────────────────────────────┘    │
│  [ Search ] [ QR Scan ]                  │
│                                          │
│  ─────────────────────────               │
│  Pay @coach_elite                        │
│  Coaching · 4 sessions · Equipment       │
│                                          │
│         $150.00                          │
│                                          │
│  From wallet         $89.00              │
│  From card           $61.00              │
│                                          │
│  Message: Thanks for the coaching!       │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │       [ Review Payment ]          │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

**Screen 5 Flow — Step by Step:**

1. **Pick recipient** — Recent recipients row (big avatars, 1 tap) + search bar + QR scan button
2. **Amount** — Big number input, numeric keypad, no clutter
3. **What's it for?** — Sport emoji category picker (🏀 Coaching / 🏋️ Equipment / ⚽ Snacks / 🏆 Event Fee / 👥 Team Dues / Other) + optional text note
4. **Confirm** — Recipient, amount, category. One "Send" button. Face ID if available.
5. **Done** — "Sent to [Name]" + category emoji. Back to wallet.

**Key patterns stolen from payment apps:**

| From | Pattern | For VAI |
|------|---------|---------|
| Venmo | Recent recipients pinned at top | Coach, teammates, team mom = 1 tap |
| Venmo | Sport emoji memo picker | ✅ Coaching, 🏋️ Snacks, 🏆 Event Fee, 🏋️ Equipment |
| Zelle | QR code scan for sideline payments | In-person team events |
| Apple | Big amount, biometric confirm | 3 taps max for repeat payments |
| All | Minimal confirmation: recipient + amount + note. That's it. | Clean, fast |

**UX Rules:**
- No "mentor" language. No "invoice" complexity. Any user pays any user. Fast.
- Category picker is OPTIONAL — defaults to none if skipped
- Wallet balance auto-applied first, card covers remainder (same saga logic as Section 5.5)
- QR code encodes `vai.app/pay/@handle` deep link

### 8.5.1 Pay Invoice Flow (Mentor-Initiated)

1. User sees payment request notification
2. Taps to view: shows mentor name, amount, description
3. If wallet covers it: "Pay $XX.XX from wallet"
4. If wallet insufficient: "Pay $XX.XX" with wallet + card breakdown shown
5. Confirmation screen
6. Success/failure result

### 8.6 Status Display Mapping (MANDATORY)

Backend status enum values MUST be mapped to user-friendly text before reaching the mobile client. The API returns BOTH fields: `status` (for internal logic) and `status_display` (for UI rendering).

| Backend Status | `status_display` Value | Context |
|----------------|----------------------|---------|
| **Commission States** | | |
| `ACCRUED_PENDING` | `"Pending — available [hold_until date]"` | Earned, in hold period |
| `HELD_PLATFORM` | `"Pending — processing"` | Platform processing |
| `RELEASE_SCHEDULED` | `"Available soon"` | Hold released, transfer queued |
| `SETTLING` | `"Processing"` | Transfer in flight to user wallet |
| `AVAILABLE` | `"Available"` | Ready to cash out |
| `PARTIALLY_REVERSED` | `"Earning adjusted"` | Partial clawback after settlement |
| `FULLY_REVERSED` | `"Earning reversed"` | Full clawback applied |
| `GARNISHED` | `"Applied to balance"` | Funds offset against outstanding debt |
| `CLAWBACK_PENDING` | `"On hold — under review"` | Post-payout debt, awaiting recovery |
| `WRITTEN_OFF` | _(never shown — filter at API level)_ | Debt written off after 90 days |
| **Cashout States** | | |
| `PROCESSING` | `"Processing"` | Cashout in flight |
| `COMPLETED` | `"Completed"` | Cashout/payment done |
| `FAILED` | `"Failed"` | Transaction failed |
| `QUEUED_LIQUIDITY` | `"Processing"` | Queued for next payout batch |
| **Payment States** | | |
| `PAID` | `"Paid"` | Payment settled |
| `AWAITING_CARD` | `"Complete payment"` | Card needed via PaymentSheet |
| `CREATED` | `"Pending"` | Invoice/request awaiting payment |
| `CANCELLED` | `"Cancelled"` | Payment request cancelled |
| **Send Money States** | | |
| `COMPLETED` | `"Sent"` | Send money completed |
| `AWAITING_CARD` | `"Complete payment"` | PaymentSheet needed |

**Mobile client MUST use `status_display`, NEVER render `status` directly.**

### 8.7 UI Language Scrub Rules

The following terms are **BACKEND-ONLY** and must NEVER appear in the mobile UI, push notifications, or user-facing copy:

| Backend Term | User-Facing Replacement |
|-------------|------------------------|
| Commission | "Earning" (always — in push notifications, transaction descriptions, UI copy) |
| KYC / CIP / Know Your Customer | "Verify your identity" |
| Connect Express account | _(invisible — just "your wallet")_ |
| Treasury FA / Financial Account | "Your wallet" or "Your account" |
| OutboundTransfer | _(invisible — "Money is on the way!")_ |
| PaymentIntent | _(invisible — "Payment processing")_ |
| Commission ledger | "Earnings history" |
| Clawback | "Earning reversed" |
| Dispute hold | "On hold" (with "?" learn more) |
| Destination charge | _(invisible — handled by Stripe)_ |
| Saga / compensating transaction | _(invisible — user sees success or failure)_ |
| 1099-NEC | "Tax statement" _(in documents section only)_ |
| W-9 | "Tax information" |
| is_shadow | _(filtered at API level, never exposed)_ |
| SETTLING / GARNISHED / WRITTEN_OFF | See Section 8.6 status_display mapping |
| QUEUED_LIQUIDITY | "Processing" |
| debt_records / DebtRecord | "Balance owed" or never exposed |
| PayPal (in cashout UI) | _(never shown — silent failover only, see Section 4.1)_ |
| Raw cents in error messages | Always format as dollars: "$75.00" not "7500 cents" |

### 8.8 What Each User Type Sees

| User Type | Wallet Tab Content |
|-----------|-------------------|
| Basic, no earnings | "Share your link to start earning!" + share link CTA |
| Basic, earning < $25 | Balance display, pending/available. Cashout button disabled with "$X.XX until cashout minimum" |
| Basic, earning $25+ | Full wallet with cashout enabled. If earning > $50/mo recurring, fee warning + upgrade nudge |
| Plus, earning | Full wallet. Progress bar shows subscription coverage. No fee. |
| Mentor, earning | Full wallet. Progress bar shows subscription coverage. No fee. Invoice creation available. |

---

## 9. API Endpoints

Mobile implementation: use the existing Axios newApiInstance with NEW_API_URL base (per vai-mobile codebase conventions). Do NOT use GraphQL for wallet endpoints — all wallet APIs are REST.

All endpoints are under `/v1/wallet/` prefix. Authentication via existing JWT token. All monetary amounts are **integer cents** with explicit `currency` field.

### 9.1 Balance & Dashboard

#### `GET /v1/wallet/balance`

Returns the user's current wallet state.

**Response 200:**
```json
{
  "available_cents": 8900,
  "pending_cents": 3850,
  "reserved_cents": 0,
  "lifetime_earned_cents": 120400,
  "currency": "USD",
  "next_available_date": "2026-04-23",
  "next_available_cents": 3850,
  "has_outstanding_debt": false,
  "debt_cents": 0,
  "subscription_progress": {
    "monthly_recurring_cents": 646,
    "subscription_cost_cents": 995,
    "remaining_cents": 349,
    "percentage": 64.9,
    "covered": false
  }
}
```

#### `GET /v1/wallet/transactions`

Paginated transaction history.

**Query params:** `page` (default 1), `limit` (default 20, max 100), `type` (optional: `commission`, `cashout`, `payment`, `subscription`, `fee`), `status` (optional)

**Response 200:**
```json
{
  "transactions": [
    {
      "id": "txn_abc123",
      "type": "commission",
      "direction": "credit",
      "amount_cents": 249,
      "currency": "USD",
      "status": "ACCRUED_PENDING",
      "status_display": "Pending — available Apr 23",
      "description": "L1 commission — @jake_lifts subscribed to Plus",
      "source_user_handle": "jake_lifts",
      "affiliate_level": 1,
      "hold_until": "2026-04-23T00:00:00Z",
      "created_at": "2026-04-09T14:30:00Z"
    },
    {
      "id": "txn_def456",
      "type": "cashout",
      "direction": "debit",
      "amount_cents": 4500,
      "currency": "USD",
      "status": "COMPLETED",
      "status_display": "Completed",
      "description": "Cashout to Venmo @yourhandle",
      "payout_method": "venmo",
      "completed_at": "2026-03-28T10:00:00Z",
      "created_at": "2026-03-28T09:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 47,
    "has_more": true
  }
}
```

#### `GET /v1/wallet/summary`

Monthly summary for the dashboard.

**Query params:** `month` (YYYY-MM, default current)

**Response 200:**
```json
{
  "month": "2026-04",
  "earned_cents": 1496,
  "cashed_out_cents": 0,
  "paid_to_mentors_cents": 0,
  "subscription_paid_from_wallet_cents": 995,
  "fee_charged_cents": 0,
  "currency": "USD"
}
```

### 9.2 Cashout

#### `POST /v1/wallet/cashout`

Initiate a cashout request.

**Request:**
```json
{
  "amount_cents": 8900,
  "payout_account_id": "pa_xyz789",
  "idempotency_key": "cashout_user123_20260409_1"
}
```

**Response 201:**
```json
{
  "request_id": "pr_abc123",
  "amount_cents": 8900,
  "fee_cents": 0,
  "net_amount_cents": 8900,
  "currency": "USD",
  "payout_method": "venmo",
  "destination_masked": "@your****",
  "status": "PROCESSING",
  "estimated_arrival": "Instant"
}
```

**Error 400:**
```json
{
  "error": "INSUFFICIENT_BALANCE",
  "message": "Available balance is $75.00. You requested $89.00.",
  "available_cents": 7500
}
```
> **UI rule:** ALL user-facing error messages MUST format amounts as dollars, never raw cents.

**Error 429:**
```json
{
  "error": "RATE_LIMITED",
  "message": "Maximum 1 cashout per 24 hours. Next eligible: 2026-04-10T14:30:00Z",
  "next_eligible_at": "2026-04-10T14:30:00Z"
}
```

### 9.3 Payout Accounts

#### `GET /v1/wallet/payout-accounts`

**Response 200:**
```json
{
  "accounts": [
    {
      "id": "pa_xyz789",
      "method": "venmo",
      "identifier_masked": "@your****",
      "is_default": true,
      "is_verified": true,
      "created_at": "2026-03-15T10:00:00Z"
    }
  ]
}
```

#### `POST /v1/wallet/payout-accounts`

**Request:**
```json
{
  "method": "venmo",
  "identifier": "@yourvenmousername"
}
```

**Response 201:**
```json
{
  "id": "pa_xyz789",
  "method": "venmo",
  "identifier_masked": "@your****",
  "is_default": false,
  "is_verified": false,
  "verification_status": "PENDING"
}
```

#### `DELETE /v1/wallet/payout-accounts/{id}`

**Response 204:** No content.

**Error 409:** Cannot delete default payout account while cashout is processing.

#### `PUT /v1/wallet/payout-accounts/{id}/default`

Set as default payout account.

**Response 200:**
```json
{
  "id": "pa_xyz789",
  "is_default": true
}
```

### 9.4 Send Money (Screen 5)

#### `POST /v1/wallet/send`

Send money to any VAI user. Stripe SDK handles the payment execution.

**Request:**
```json
{
  "recipient_handle": "coach_elite",
  "amount_cents": 15000,
  "currency": "USD",
  "category": "coaching",
  "note": "Thanks for the coaching!",
  "payment_source": "wallet_first",
  "idempotency_key": "send_user123_20260409_1"
}
```

`category` options (optional): `coaching`, `equipment`, `snacks`, `event_fee`, `team_dues`, `other`

`payment_source` options:
- `"wallet_first"` — use wallet balance, card covers remainder (default)
- `"wallet_only"` — fail if wallet balance insufficient
- `"card_only"` — charge card directly, skip wallet

**Amount bounds:**
- Minimum: 100 cents ($1.00)
- Maximum per transaction: 1,000,000 cents ($10,000.00)
- Maximum per 24h per user: 2,500,000 cents ($25,000.00)
- Validation: reject requests outside bounds with 400 error + dollar-formatted message

**Rate limit:** Maximum 20 send requests per 24 hours per user. Returns 429 with `next_eligible_at`.

**Response 201 (wallet-only, no card needed):**
```json
{
  "payment_id": "pay_abc123",
  "status": "COMPLETED",
  "status_display": "Sent",
  "amount_cents": 15000,
  "currency": "USD",
  "recipient": {
    "handle": "coach_elite",
    "display_name": "Coach Elite"
  },
  "payment_breakdown": {
    "wallet_cents": 15000,
    "card_cents": 0,
    "total_cents": 15000,
    "platform_fee_cents": 750
  },
  "category": "coaching",
  "note": "Thanks for the coaching!",
  "created_at": "2026-04-09T10:00:00Z"
}
```

**Response 201 (card needed — return client_secret + saved cards):**
```json
{
  "payment_id": "pay_def456",
  "status": "AWAITING_CARD",
  "status_display": "Complete payment",
  "amount_cents": 15000,
  "currency": "USD",
  "recipient": {
    "handle": "coach_elite",
    "display_name": "Coach Elite"
  },
  "payment_breakdown": {
    "wallet_cents": 8900,
    "card_cents": 6100,
    "total_cents": 15000,
    "platform_fee_cents": 750
  },
  "stripe_client_secret": "pi_xxx_secret_yyy",
  "stripe_customer_id": "cus_xxx",
  "stripe_ephemeral_key": "ek_xxx",
  "category": "coaching",
  "note": "Thanks for the coaching!",
  "created_at": "2026-04-09T10:00:00Z"
}
```

> **Saved Cards + Native Wallets:** When `status` is `AWAITING_CARD`, mobile presents Stripe PaymentSheet with `customerId` + `customerEphemeralKeySecret` + `paymentIntentClientSecret`. This unlocks:
>
> - **Saved cards** — Any card the user previously used for subscription/payments shows up automatically. Zero re-entry.
> - **Apple Pay** — Shows if user has cards in Apple Wallet. Face ID / Touch ID to confirm.
> - **Google Pay** — Shows if user has cards in Google Pay. Fingerprint / PIN to confirm.
> - **Apple Cash** — If user has Apple Cash as a funding source in Apple Wallet, it appears as an Apple Pay option automatically. Stripe does not control this — Apple does. Zero VAI code needed.
> - **New card** — Manual entry as fallback. Saved for future use via `setup_future_usage: 'off_session'`.
>
> **The result: Most users tap once.** Any user who subscribed to VAI already has a card on file. PaymentSheet shows it. One tap + biometric = payment complete.

**Error 400:**
```json
{
  "error": "INSUFFICIENT_BALANCE",
  "message": "Your wallet balance is $89.00. Total payment is $150.00. Card will cover $61.00.",
  "available_cents": 8900
}
```

#### `POST /v1/wallet/send/{payment_id}/confirm`

Called by mobile after Stripe PaymentSheet completes successfully.

**Request:**
```json
{
  "stripe_payment_intent_id": "pi_xxx"
}
```

**Response 200:**
```json
{
  "payment_id": "pay_def456",
  "status": "COMPLETED",
  "status_display": "Sent"
}
```

#### Split Payment Failure & Expiry Path (AWAITING_CARD)

When `POST /v1/wallet/send` returns `AWAITING_CARD`, the wallet portion has already been transferred via Treasury OutboundPayment. If the card portion fails, the wallet portion must be reversed.

**Mechanism:**
1. When `AWAITING_CARD` is returned, create a `wallet_holds` row with `hold_type = 'SEND_PAYMENT'`, `amount_cents = wallet_portion`, `expires_at = NOW() + 30 minutes`.
2. If `POST /v1/wallet/send/{id}/confirm` succeeds → release hold, mark payment COMPLETED.
3. If `POST /v1/wallet/send/{id}/confirm` reports failure → reverse wallet portion via Treasury OutboundPayment (recipient FA → sender FA), release hold, mark payment FAILED, notify sender: "Payment cancelled. Your wallet balance has been restored."
4. If 30 minutes pass with no confirm call (user closed app, lost connection) → background worker detects expired hold, reverses wallet portion, marks payment EXPIRED, notifies sender.

**Key constraint:** The wallet portion Treasury OutboundPayment is NOT truly "spent" until the card portion confirms. The hold prevents the recipient from cashing out the wallet portion during the AWAITING_CARD window.

> **Security note on stripe_client_secret and stripe_ephemeral_key:** These are short-lived, single-use Stripe tokens. stripe_client_secret is scoped to a single PaymentIntent. Ephemeral key TTL: 1 hour (Stripe default). These values MUST NOT be logged server-side or client-side. Transport: HTTPS only.

#### `GET /v1/wallet/recent-recipients`

Returns most recent payment recipients for quick-select on Screen 5.

**Response 200:**
```json
{
  "recipients": [
    {
      "user_id": "user_abc",
      "handle": "coach_elite",
      "display_name": "Coach Elite",
      "avatar_url": "https://cdn.vai.app/avatars/coach_elite.jpg",
      "last_paid_at": "2026-04-05T14:30:00Z"
    }
  ]
}
```

Max 10 results. Ordered by most recent payment. Cached 5 minutes per user.

#### `GET /v1/wallet/resolve-recipient?handle={handle}`

Resolves a @handle to a payable user. Used by QR code scan + search.

**Response 200:**
```json
{
  "user_id": "user_abc",
  "handle": "coach_elite",
  "display_name": "Coach Elite",
  "avatar_url": "https://cdn.vai.app/avatars/coach_elite.jpg",
  "wallet_active": true
}
```

**Response 404:**
```json
{
  "error": "USER_NOT_FOUND",
  "message": "No VAI user found with that handle."
}
```

> **QR Validation:** QR payloads MUST match strict regex `^https://vai\.app/pay/@[a-zA-Z0-9_]+$`. Amount is NEVER extracted from QR — only the recipient handle. Any non-matching payload is rejected.

### 9.5 Payment Requests (Mentor-Initiated)

#### `POST /v1/invoices`

Mentor creates a payment request.

**Request:**
```json
{
  "client_user_id": "user_abc",
  "amount_cents": 15000,
  "currency": "USD",
  "category": "coaching",
  "description": "March coaching — 4 sessions",
  "due_date": "2026-04-15"
}
```

**Response 201:**
```json
{
  "id": "inv_abc123",
  "sender_user_id": "user_mentor",
  "recipient_user_id": "user_abc",
  "amount_cents": 15000,
  "currency": "USD",
  "category": "coaching",
  "description": "March coaching — 4 sessions",
  "status": "CREATED",
  "status_display": "Pending",
  "due_date": "2026-04-15",
  "created_at": "2026-04-09T10:00:00Z"
}
```

#### `GET /v1/invoices`

**Query params:** `role` (`sent` or `received`), `status`, `page`, `limit`

#### `GET /v1/invoices/{id}`

#### `POST /v1/invoices/{id}/pay`

Client pays an invoice.

**Request:**
```json
{
  "payment_source": "wallet_first",
  "idempotency_key": "pay_inv_abc123_1"
}
```

`payment_source` options:
- `"wallet_first"` — use wallet, fallback to card (default)
- `"wallet_only"` — fail if wallet insufficient
- `"card_only"` — charge card directly

**Response 200 (wallet covered full amount):**
```json
{
  "invoice_id": "inv_abc123",
  "status": "PAID",
  "status_display": "Paid",
  "payment_breakdown": {
    "wallet_cents": 15000,
    "card_cents": 0,
    "total_cents": 15000,
    "platform_fee_cents": 750,
    "currency": "USD"
  }
}
```

**Response 200 (card needed — return client_secret):**
```json
{
  "invoice_id": "inv_abc123",
  "status": "AWAITING_CARD",
  "status_display": "Complete payment",
  "stripe_client_secret": "pi_xxx_secret_yyy",
  "payment_breakdown": {
    "wallet_cents": 8900,
    "card_cents": 6100,
    "total_cents": 15000,
    "platform_fee_cents": 750,
    "currency": "USD"
  }
}
```

#### `POST /v1/invoices/{id}/cancel`

Mentor cancels a pending invoice.

**Response 200:**
```json
{
  "id": "inv_abc123",
  "status": "CANCELLED"
}
```

### 9.6 Wallet Settings

#### `GET /v1/wallet/settings`

Returns user's wallet settings and JIT activation prompt state (read-only).

**Response 200:**
```json
{
  "auto_pay_subscription": false,
  "auto_cashout_enabled": false,
  "auto_cashout_threshold_cents": null,
  "auto_cashout_frequency": null,
  "auto_cashout_payout_account_id": null,
  "notifications": {
    "new_earnings": true,
    "earning_reversed": true,
    "cashout_complete": true
  },
  "activation_prompt": {
    "required": false,
    "reason": null,
    "set_at": null,
    "cleared_at": null
  }
}
```

**Note:** `activation_prompt` fields are read-only. They are set automatically when pending commissions reach >= 500 cents (`reason: "PENDING_GE_500_CENTS"`) and cleared immediately on successful `POST /v1/wallet/activate`. Cannot be modified via PUT /v1/wallet/settings.

#### `PUT /v1/wallet/settings`

**Request:** (field names MUST match GET response — `new_earnings`, `earning_reversed`, `cashout_complete`)
```json
{
  "auto_pay_subscription": true,
  "notifications": {
    "new_earnings": true,
    "earning_reversed": true,
    "cashout_complete": true
  }
}
```

> **Backend mapping:** DB columns use `notify_commission_available`, `notify_clawback`, `notify_cashout_complete`. The API DTO layer maps these to the user-friendly names above. Mobile clients ONLY see the friendly names. This mapping lives in `WalletSettingsMapper.cs`.
```

### 9.7 Wallet Onboarding

#### `POST /v1/wallet/activate`

Triggers Connect Express onboarding for the user. Immediately clears any pending JIT activation prompt flag.

**Response 200:**
```json
{
  "onboarding_url": "https://connect.stripe.com/express/onboarding/...",
  "status": "ONBOARDING_STARTED"
}
```

**Side effects:**
- Provisions Stripe Connect Express account
- Provisions Stripe Treasury Financial Account
- Sets `wallet_accounts.onboarding_status = 'IN_PROGRESS'`
- Calls `ClearActivationPromptAsync` to clear any pending activation prompt (sets `activation_prompt_required = false` and records `cleared_at` timestamp)

**Note:** The activation prompt flag is cleared immediately upon API call success, regardless of whether the user completes Connect onboarding. This ensures that once a user has initiated the wallet setup process, they no longer see the prompt in the UI.

#### `GET /v1/wallet/status`

Check wallet activation status.

**Response 200:**
```json
{
  "wallet_active": true,
  "connect_account_id": "acct_xxx",
  "financial_account_id": "fa_xxx",
  "onboarding_complete": true,
  "identity_verified": true
}
```

### 9.8 Admin Endpoints

#### `GET /v1/admin/payouts`

**Query params:** `status` (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`, `QUEUED_LIQUIDITY`), `page`, `limit`

#### `POST /v1/admin/payouts/{id}/approve`

Manual approval for flagged payouts.

#### `POST /v1/admin/payouts/{id}/reject`

**Request:**
```json
{
  "reason": "Suspicious activity detected"
}
```

#### `GET /v1/admin/commissions/audit-log`

**Query params:** `date` (YYYY-MM-DD), `type` (`release`, `clawback`, `debt`)

#### `GET /v1/admin/wallet/health`

System health dashboard for ops.

**Response 200:**
```json
{
  "provider": "stripe",
  "provider_status": "UP",
  "pending_transfers": 47,
  "failed_transfers_24h": 0,
  "total_pending_cents": 234500,
  "total_available_cents": 1890000,
  "total_debt_cents": 0,
  "users_with_wallets": 312,
  "users_onboarding": 8
}
```

### 9.9 Endpoint Summary Table

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/v1/wallet/balance` | User | Current balance breakdown |
| GET | `/v1/wallet/transactions` | User | Transaction history |
| GET | `/v1/wallet/summary` | User | Monthly summary |
| POST | `/v1/wallet/cashout` | User | Initiate cashout |
| GET | `/v1/wallet/payout-accounts` | User | List linked accounts |
| POST | `/v1/wallet/payout-accounts` | User | Add payout account |
| DELETE | `/v1/wallet/payout-accounts/{id}` | User | Remove payout account |
| PUT | `/v1/wallet/payout-accounts/{id}/default` | User | Set default |
| POST | `/v1/invoices` | Mentor | Create invoice |
| GET | `/v1/invoices` | User | List invoices |
| GET | `/v1/invoices/{id}` | User | Get invoice detail |
| POST | `/v1/invoices/{id}/pay` | User | Pay invoice |
| POST | `/v1/invoices/{id}/cancel` | Mentor | Cancel invoice |
| GET | `/v1/wallet/settings` | User | Get wallet settings |
| PUT | `/v1/wallet/settings` | User | Update wallet settings |
| POST | `/v1/wallet/activate` | User | Start wallet onboarding |
| GET | `/v1/wallet/status` | User | Check wallet status |
| GET | `/v1/admin/payouts` | Admin | List payout requests |
| POST | `/v1/admin/payouts/{id}/approve` | Admin | Approve flagged payout |
| POST | `/v1/admin/payouts/{id}/reject` | Admin | Reject payout |
| GET | `/v1/admin/commissions/audit-log` | Admin | Daily audit results |
| GET | `/v1/admin/wallet/health` | Admin | System health |

### 9.10 Authorization Rules

- **GET /v1/invoices:** Returns ONLY invoices where the authenticated user is either the buyer (`user_id`) or the mentor (`mentor_user_id`). Server filters by JWT `user_id`. Returns `403` if user attempts to access an invoice they are not party to.
- **POST /v1/invoices (create):** Only users with active Mentor tier can create invoices. Returns `403` for Basic/Plus users.
- **POST /v1/invoices/:id/pay:** Only the buyer (`user_id` on the invoice) can pay. Returns `403` for anyone else.
- **GET /v1/wallet/* endpoints:** All scoped to authenticated user only. No cross-user access.
- **Admin endpoints (/v1/admin/*):** Require `admin` role claim in JWT. Returns `403` for non-admin users.
- **IDOR prevention:** All queries filter by authenticated `user_id` at the database layer, not just the API layer. Never trust client-supplied user IDs for authorization -- always use the JWT subject.

---

## 10. Webhook Handlers

### 10.1 Stripe Webhook Events

The backend must listen for and handle these 16 events:

| # | Stripe Event | Handler Action |
|---|-------------|---------------|
| 1 | `invoice.paid` | **PRIMARY commission trigger.** Calculate 5-level commissions. Insert `commission_ledger` records with `status = ACCRUED_PENDING`, `hold_until = NOW() + 14d`. Idempotent on `(invoice_id, builder_user_id, level)`. **IMPORTANT:** When processing `invoice.paid`, extract the charge ID from the invoice's `payment_intent.latest_charge` (or `charges.data[0].id` for multi-charge). Always populate `source_charge_id` on the `commission_ledger` row. This enables the `charge.succeeded` dedupe check (row #2) and the charge-centric refund lookup (Section 3.2). |
| 2 | `charge.succeeded` | **SECONDARY commission trigger.** Only process if no corresponding `invoice.paid` was received (one-time charges, edge cases). Same logic as above. **Dedupe rule:** If an `invoice.paid` event has already been processed for this charge (check `commission_ledger` by `source_charge_id`), skip. `charge.succeeded` is the FALLBACK trigger — only fires commission logic when no invoice exists (one-off charges outside Billing). |
| 3 | `charge.refunded` | Find all commissions by `source_charge_id` (canonical charge-centric lookup — see Section 3.2). Apply clawback per tier (see Section 3). |
| 4 | `charge.dispute.created` | **PROVISIONAL HOLD only.** Set `dispute_hold = true` on all linked commissions. Do NOT clawback. Block settlement and cashout. See Section 3.6. |
| 5 | `charge.dispute.closed` | If `status = won`: remove `dispute_hold`, resume normal flow. If `status = lost`: apply clawback per Section 3.1 tier model. |
| 6 | `customer.subscription.deleted` | Find `ACCRUED_PENDING` commissions for this subscription. Transition to `FULLY_REVERSED`. Do NOT touch `AVAILABLE` commissions. |
| 7 | `customer.subscription.updated` | Check for plan changes (upgrade/downgrade). If downgrade, future commissions calculated on new (lower) amount. No retroactive changes. |
| 8 | `invoice.payment_failed` | Do NOT create commissions. If any were speculatively created, mark `FULLY_REVERSED`. |
| 9 | `invoice.created` | **(Monitoring only — does NOT trigger bridge.)** Log that an invoice was created. The scheduled T-48h worker (Section 6.2) is the sole orchestration owner for the subscription bridge. This webhook is for audit/monitoring only. See Section 6.2.1 Single Leader Rule. |
| 10 | `invoice.finalized` | Confirm Customer balance credit was applied. Log result. |
| 11 | `treasury.outbound_transfer.posted` | Commission settlement confirmed. Transition from `SETTLING` to `AVAILABLE`. |
| 12 | `treasury.outbound_transfer.failed` | Transfer failed. Log error. Retry up to 3x. If all fail, alert ops and transition back to `RELEASE_SCHEDULED`. |
| 13 | `treasury.outbound_transfer.returned` | Funds returned (e.g., bank rejected). Handle like failed transfer. |
| 14 | `treasury.inbound_transfer.succeeded` | Confirms clawback reverse transfer landed in Platform FA. |
| 15 | `account.updated` | Connect Express account status changed. Check `charges_enabled` and `payouts_enabled`. Update wallet status. |
| 16 | `payout.paid` | Stripe bank payout delivered. Update payout_request status. |

### 10.2 PayPal/Venmo Webhooks (if using PayPal Payouts API)

| Event | Handler Action |
|-------|---------------|
| `PAYMENT.PAYOUTS-ITEM.SUCCEEDED` | Mark payout_request as COMPLETED. Notify user. |
| `PAYMENT.PAYOUTS-ITEM.FAILED` | Mark payout_request as FAILED. Un-reserve funds. Notify user. Alert ops. |
| `PAYMENT.PAYOUTS-ITEM.BLOCKED` | Same as failed. May indicate compliance issue. |

### 10.3 Webhook Deferral Pattern

**IMPORTANT:** The current vai-api webhook pattern processes events inline in the controller (PaymentsV1Controller, SubscriptionsV1Controller). The wallet feature DELIBERATELY introduces a new pattern: write to webhook_events queue table, return 200 immediately, process via background worker. This is a necessary upgrade for Treasury event volume. Existing payment/subscription webhook handlers remain unchanged (inline). Only NEW wallet/treasury webhook events use the queue pattern. Francis should implement the queue infrastructure (webhook_events table + Hangfire or IHostedService worker) as Phase 0 before any wallet logic. Over time, existing handlers can optionally migrate to the queue pattern.

The new wallet webhook pattern:

1. Receive webhook
2. Verify signature (Stripe-Signature header or PayPal verification endpoint)
3. Write the event to the `webhook_events` queue table (see Appendix B)
4. Return `200 OK` immediately

A **background worker** (Hangfire on .NET, or IHostedService) polls the `webhook_events` table and processes business logic asynchronously. This prevents:
- Stripe timeout/retry loops (Stripe retries if no 200 within 20 seconds)
- Duplicate processing from retries
- Cascading failures when downstream services are slow

The background worker must be idempotent — processing the same event twice produces the same result (enforced by unique constraints on commission records).

### 10.4 Webhook Security

- Verify Stripe webhook signatures using `Stripe-Signature` header
- Verify PayPal webhook signatures using PayPal's verification endpoint
- All webhook handlers must be idempotent (use idempotency keys / unique constraints)
- Log every webhook received with full payload (for audit trail)
- Webhook endpoint must respond within 5 seconds (signature check + queue write only, no business logic)

---

## 11. Security & Edge Cases

### 11.1 Fraud Detection

| Signal | Detection | Action |
|--------|-----------|--------|
| **Affiliate self-referral** | Same device fingerprint, IP, or payment method across referrer and referee | Block commission. Flag for review. |
| **Churn farming** | Abnormally high signup-then-cancel rate in same affiliate tree (>30% cancel within 30 days) | Freeze pending commissions for tree. Manual review. |
| **Velocity abuse** | >10 signups from single referrer in 24 hours | Temporary commission hold. Investigate. |
| **Payout splitting** | User creates multiple accounts to stay under $600 1099-NEC threshold | Flag based on shared payment methods, devices, IPs. |
| **Rapid cashout after earning** | Cashout initiated within minutes of commission becoming available | Delay by 24 hours if first-time cashout or new payout method. |

### 11.2 Rate Limiting

| Action | Limit |
|--------|-------|
| Send money | 20 per 24 hours per user |
| Cashout requests | 1 per 24 hours per user |
| Payout account changes | 3 per 24 hours |
| Invoice creation | 10 per 24 hours per mentor |
| Wallet activation | 1 per user (idempotent) |
| API calls (general) | 60 per minute per user |

### 11.3 Account States

| State | Wallet Behavior |
|-------|----------------|
| Active | Full functionality |
| Suspended | Read-only. No cashouts. No payments. Commissions still accrue (but held). |
| Banned | Wallet frozen. All pending commissions forfeited. Available balance held for 90 days, then released or forfeited per legal review. |
| Deleted | Wallet closed. Outstanding balance paid out to last known payout method within 30 days. Debt written off. Orphaned commissions handled per 11.8. |

### 11.4 Negative Balances

A user's wallet can go "negative" only in the DB tracking sense (debt model). The actual Treasury FA never goes below zero — Stripe prevents that. The negative state means the user owes VAI money, tracked in `debt_records`, recovered from future commissions.

### 11.5 Concurrent Operations

- Cashout + commission release at same time: Use database transactions + pessimistic locking on balance reads
- Two cashout requests simultaneously: Idempotency key + rate limit prevents double-spend
- Clawback during settling: If transfer is in-flight, wait for settlement. Then reverse.

### 11.6 Provider Downtime

If Stripe Treasury is unavailable:
1. Wallet enters **READ-ONLY mode** — users can see balances (cached) but cannot initiate payments
2. Commission accrual continues (writes to DB, transfer deferred)
3. Mentor payments disabled until Stripe restores
4. Subscription bridge falls back to card-on-file
5. If downtime exceeds 4 hours, ops team may enable PayPal payout failover for cashouts only (Section 13)

### 11.7 Data Retention

- Commission records: retained indefinitely (financial records)
- Payout request records: retained 7 years (tax compliance)
- Webhook logs: retained 90 days (debugging), then archived
- Payout account PII (Venmo handles, emails): encrypted at rest, purged 30 days after account deletion

### 11.8 Referrer Account Deletion & Chain Collapse

When a user deletes their account, their position in referral chains must be resolved:

1. **Orphaned commissions** (where the deleted user is in someone's active referral chain):
   - The deleted user's position is **collapsed** — their downstream referrals move up one level
   - Example: A → B → C → D. If B deletes account: A becomes L1 for C (was L2), A becomes L2 for D (was L3). B's L1 commissions from C roll up to the platform.
2. **Pending commissions owed TO the deleted user:**
   - `ACCRUED_PENDING` / `HELD_PLATFORM` / `RELEASE_SCHEDULED`: cancelled, funds stay in Platform FA, rolled up to platform revenue
   - `AVAILABLE`: paid out to last known payout method within 30 days (per account deletion flow)
3. **Future commissions for the deleted user's position:** roll up to the platform. The platform absorbs what the deleted user would have earned.

---

## 12. Migration Plan

### 12.1 Current State

- Bruno currently does semi-automated payouts: reviews in Stripe dashboard, then pushes manually
- Commissions are calculated but gated on `customer.subscription.created` (WRONG — must be `invoice.paid`)
- Stripe Connect is active
- PayPal/Venmo payouts are integrated
- Only Mentor users can pay other Mentors (BROKEN)

### 12.2 Single Writer Rule

**During migration, only ONE system writes commission records at any time.** Feature flag: `wallet_commission_engine_active`.

| Flag Value | Writer | Behavior |
|-----------|--------|----------|
| `false` (default) | Bruno's manual process | New engine writes shadow rows (is_shadow=true) to commission_ledger for comparison only. Existing ReferralCompensationService handles real money. |
| `true` | New wallet commission engine | New engine writes production rows (is_shadow=false). ReferralCompensationService is disabled. Only ONE system moves money at any time. |

**Never both simultaneously.** Dual-write creates reconciliation nightmares, duplicate commissions, and audit failures. The flag is toggled once, at the Phase 3 → Phase 4 boundary, after shadow mode validation passes.

**Clarification:** 'Single writer' means only ONE system produces production-effect commission records and moves money. Shadow rows (`is_shadow = true`) are excluded from balance queries, money movement, and cashout eligibility. The shadow writer and the production writer may run simultaneously — the constraint is that only one system's outputs are treated as real.

### 12.3 Five-Phase Migration

#### Phase 1 — Fix Foundation (Week 1-2)

**No wallet UI yet. Backend fixes only.**

- [ ] Fix commission trigger: move from `subscription.created` to `invoice.paid` / `charge.succeeded`
- [ ] Deploy `commission_ledger` table + migration script
- [ ] Enable shadow writes (is_shadow=true). Compare against Bruno daily.
- [ ] Deploy new Stripe webhook handlers (refund, dispute, cancellation)
- [ ] Deploy daily audit cron (hold release + clawback check)
- [ ] Deploy `GET /v1/wallet/balance` endpoint (read-only)
- [ ] Run parallel: new system writes shadow rows to commission_ledger alongside Bruno's existing process. Daily comparison job diffs shadow rows against Bruno's outputs for 14 days.

**Exit criteria:** New commission calculations match Bruno's manual calculations for 14 consecutive days with zero discrepancies.

#### Phase 2 — Read-Only Wallet + Onboarding Wave (Week 3-4)

**Users can see their wallet. Cannot transact yet.**

- [ ] Deploy wallet tab in mobile app (balance display + transaction history only)
- [ ] Deploy `POST /v1/wallet/activate` endpoint
- [ ] Batch-invite users to "Enable VAI Wallet" — triggers Connect Express onboarding
  - Wave 1: Top 50 earners (highest commission users)
  - Wave 2: All users with pending commissions > $25
  - Wave 3: All remaining users (in-app prompt)
- [ ] Deploy `payout_accounts` and `payout_requests` tables
- [ ] Build "Link Venmo" and "Link Bank Account" flows

**Exit criteria:** 80%+ of active earners have completed wallet onboarding. Balance display matches expected values.

#### Phase 3 — Shadow Cashout Verification (Week 5-6)

**New system processes alongside Bruno. Both produce results. Compare.** (Renamed from "Dual-Write" to avoid confusion with the Single Writer Rule in Section 12.2 — only ONE system writes commission records at any time.)

- [ ] Deploy cashout flow (Venmo, PayPal, Bank)
- [ ] Deploy `POST /v1/wallet/cashout` endpoint
- [ ] Shadow mode: every cashout is also cross-checked against what Bruno would have done
- [ ] Deploy admin dashboard for payout monitoring
- [ ] Enable cashout for Wave 1 users only (top earners, manually monitored)

**Exit criteria:** 50+ cashouts processed with zero errors. Admin dashboard shows clean audit trail.

#### Phase 4 — Full Self-Service (Week 7-8)

**Users are in control. Bruno shifts to oversight.**

- [ ] Enable cashout for all users
- [ ] Deploy user-to-mentor payment flow (invoicing + payment)
- [ ] Deploy subscription-from-wallet bridge
- [ ] Deploy $14.95 fee logic
- [ ] Deploy push notifications
- [ ] Deploy wallet settings (auto-pay subscription toggle, notification preferences)
- [ ] Bruno shifts from "push payouts" to "monitor dashboard + handle edge cases"

**Exit criteria:** Bruno confirms he is no longer manually processing payouts. All 4 flows (Earn, Cash Out, Pay, Subscribe) operational.

#### Phase 5 — Sunset Manual Process (Week 9-10)

**Clean up.**

- [ ] Migrate any remaining "manual audit" balances to user Treasury accounts as `InboundTransfer` from platform
- [ ] Disable Bruno's manual payout process
- [ ] Deploy auto-cashout feature (optional user setting)
- [ ] Deploy Stripe bank autopay option
- [ ] Final reconciliation: verify all legacy balances migrated correctly
- [ ] Deploy PayPal payout failover layer (Section 13)

**Exit criteria:** Manual payout process fully decommissioned. PayPal payout failover tested in staging.

### 12.4 Rollback Plan

Each phase has an independent rollback:
- Phase 1: Revert webhook handlers, keep Bruno's process as primary
- Phase 2: Hide wallet tab via feature flag, no data loss
- Phase 3: Disable cashout endpoint, revert to Bruno for payouts
- Phase 4: Feature flags for each sub-feature (invoicing, subscription bridge, fee)
- Phase 5: Re-enable Bruno's manual process if needed

### 12.5 Balance Cutover

On the cutover date (start of Phase 5):
1. Export all users' "owed" balances from Bruno's manual tracking
2. For each user with a positive balance:
   - Verify Connect Express onboarding is complete
   - Initiate `InboundTransfer` from Platform FA to User FA for the legacy balance
3. Confirm all transfers posted
4. Mark legacy tracking as "MIGRATED"

---

## 13. PayPal Payout Redundancy

### 13.1 Scope Limitation

**PayPal CANNOT replace Stripe Treasury as a full wallet.** PayPal Commerce Platform does NOT provide:
- Treasury-equivalent balance holding (no equivalent to Financial Accounts)
- Customer balance crediting for subscription bridge
- Real-time internal transfers with the same speed as Treasury
- KYC/identity verification infrastructure for connected accounts

PayPal failover is scoped to **CASHOUT ONLY** — getting users paid when Stripe is unavailable.

### 13.2 What Happens During Stripe Outage

| Wallet Flow | Behavior During Stripe Outage |
|------------|-------------------------------|
| **Earn** (commission accrual) | Commissions queue in PostgreSQL `commission_ledger`. No Treasury transfers. Accruals continue in DB only. |
| **Pay** (mentor payments) | **DISABLED.** Mentor invoicing and wallet-to-wallet transfers require Stripe Treasury. Display: "Payments temporarily unavailable." |
| **Subscribe** (wallet bridge) | **FALLS BACK TO CARD.** Pre-billing worker skips wallet debit. Stripe Billing charges card on file as normal. |
| **Cash Out** | **ROUTES TO PAYPAL.** Venmo/PayPal payouts route through PayPal Payouts API. Bank (ACH) payouts are queued until Stripe restores. |

### 13.3 PayPal Payout Interface

The failover interface is intentionally narrow — cashout only:

```
IPayoutFailover
├── InitiateExternalPayout(userId, amountCents, destination, idempotencyKey) → PayoutResult
├── GetPayoutStatus(payoutId) → StatusResult
└── HealthCheck() → HealthResult
```

### 13.4 Provider Routing

```
Cashout request arrives at POST /v1/wallet/cashout
    │
    ▼
WalletService checks Redis: GET wallet_provider_status
    │
    ├── "stripe" (default) → Normal Stripe Treasury flow
    │
    ├── "paypal_failover" → PayPal Payouts API (Venmo/PayPal only, bank queued)
    │
    └── "read_only" → 503: "Cashouts temporarily unavailable"
```

### 13.5 Redis Provider Flag

**Key:** `wallet_provider_status`
**Values:** `"stripe"` (default) | `"paypal_failover"` | `"read_only"`
**TTL:** None (persistent until manually changed)

**Failover trigger:**
- Background health probe runs every 30 seconds against Stripe
- If Stripe health check fails 3 consecutive times (90 seconds):
  - Set `wallet_provider_status = "read_only"` (conservative first step)
  - Alert ops team
  - Ops team manually switches to `"paypal_failover"` after confirming Stripe is genuinely down
- When Stripe recovers: ops team manually switches back to `"stripe"`

**Why not auto-switch?** Provider switches affect in-flight transactions. A false positive (Stripe blip misread as outage) could cause split-brain. Manual confirmation prevents this.

> **NOTE — Redis Key:** The `wallet_provider_status` Redis key is new infrastructure. It does not exist in the current Redis setup. Add it to the Redis configuration alongside existing keys. Default value on deploy: `'stripe'`.

### 13.6 Health Probe Implementation

```
Every 30 seconds:
    │
    ├── Stripe: GET /v1/account (with 5s timeout)
    │     └── Success → stripe_consecutive_failures = 0
    │     └── Failure → stripe_consecutive_failures++
    │           └── if >= 3 → SET wallet_provider_status "read_only"
    │                         → ALERT ops
    │
    └── PayPal: POST /v1/oauth2/token (with 5s timeout)
          └── Success → paypal_healthy = true
          └── Failure → paypal_healthy = false
                        → if already in failover, ALERT critical
```

---

## Appendix A: Decision Log

Every major architectural choice and **why**.

| # | Decision | Why | Alternatives Considered |
|---|----------|-----|------------------------|
| 1 | **Stripe Treasury as monetary source of truth, NOT PostgreSQL** | Eliminates double-entry reconciliation bugs. One source of truth. Stripe handles compliance, fraud monitoring, and balance integrity. | Custom PostgreSQL ledger (rejected: requires double-entry bookkeeping, reconciliation jobs, compliance burden) |
| 2 | **PostgreSQL as orchestration ledger only** | We need to track commission states, hold periods, clawback lifecycle, and idempotency. These are workflow states, not money. Stripe doesn't track "who referred whom at what level." | Stripe metadata only (rejected: 500-char limit, no queryable state machine) |
| 3 | **Commission trigger on `invoice.paid` not `subscription.created`** | Money must actually transfer before commissions accrue. `subscription.created` fires before first payment, leading to commissions on failed payments. | `charge.succeeded` (acceptable fallback, but `invoice.paid` is more reliable for recurring billing) |
| 4 | **14-day hold period** | Industry standard for chargeback window. Stripe chargebacks typically filed within 7-14 days. 14 days catches 95%+ of reversals. | 7 days (too short, misses disputes), 30 days (too long, kills user experience and trust) |
| 5 | **$25 minimum cashout** | Reduces transaction costs per payout. $0.25/txn fee on a $5 cashout = 5% fee. On $25 = 1%. Also reduces fraud surface (micro-withdrawals). | $10 (too many small transactions), $50 (too high, frustrates new earners) |
| 6 | **Venmo as primary cashout, not bank/ACH** | Instant delivery. Majority of VAI's demographic (young athletes/coaches) already uses Venmo. Note: VAI is responsible for 1099-NEC filing for Venmo/PayPal payouts (see Decision #22). | Bank first (slow, 2-3 day ACH), Stripe payouts only (limits reach) |
| 7 | **Connect Express, not Connect Standard or Custom** | Express provides Stripe-hosted onboarding (low friction), handles KYC/identity, requires minimal VAI-side compliance work. | Standard (too complex for users), Custom (too much compliance burden on VAI) |
| 8 | **Platform FA holds pending commissions, not individual user FAs** | Simpler architecture. One pool for all pending money. Users only see money when it's truly available. Prevents users from seeing "phantom" balance they can't use. | Per-user holds in their own FA (complex, requires per-user hold management) |
| 9 | **Customer balance credit for subscription bridge** | Stripe Billing natively consumes Customer balance before charging cards. No custom billing logic needed. Clean integration point. | Custom billing webhook interceptor (fragile), manual invoice payment (poor UX) |
| 10 | **Versioned fee policy table** | $14.95 and $50 threshold WILL change. Hardcoding = code deploy for business decisions. Policy table = config change. | Environment variables (limited), hardcoded constants (inflexible) |
| 11 | **Manual provider failover, not automatic** | Split-brain risk between Stripe and PayPal is worse than brief read-only mode. False positive on health check = transactions on wrong provider = reconciliation nightmare. | Auto-failover (rejected: split-brain risk), no failover (rejected: single point of failure) |
| 12 | **Integer cents, not decimal dollars** | Floating point math is wrong for money. $19.95 * 0.25 = $4.9875 in floats. 1995 * 25 / 100 = 498 in cents (then round). No ambiguity. | Decimal type (acceptable but cent integers are industry standard for payment APIs) |
| 13 | **IPayoutFailover abstraction** | Enables PayPal payout failover for cashouts without changing core wallet business logic. Narrowly scoped to payout operations only (not full wallet replacement). | Full IWalletProvider abstraction (rejected: PayPal cannot replicate Treasury — over-abstraction), Direct Stripe API calls everywhere (rejected: no failover path) |
| 14 | **Debt model for post-payout clawbacks** | Money is gone. Can't reverse a Venmo payout. Only option is to garnish future earnings. 90-day write-off prevents indefinite debt tracking. | Block all payouts until chargeback window fully closes (rejected: 120-day Stripe dispute window = terrible UX) |
| 15 | **Opt-in wallet-pay-subscription** | Users must explicitly choose to have their subscription auto-paid from wallet. Surprise deductions = support tickets and churn. | Auto-enabled (rejected: unexpected balance deductions), per-invoice choice (too much friction) |
| 16 | **5-phase migration with shadow mode** | Zero risk to existing payouts. Shadow mode catches calculation discrepancies before real money moves. Bruno stays operational until new system is proven. | Big bang cutover (rejected: too risky), parallel systems indefinitely (rejected: maintenance burden) |
| 17 | **ANY user earns commissions, not just paid users** | Every VAI account gets a share link. Free users are the growth engine — they share, earn commissions, and upgrade when they see the value. Restricting to paid users kills viral growth. | Paid users only (rejected: kills viral loop) |
| 18 | **Commissions on discounted price, not full price** | All referred subscribers get 50% off. The referrer earns commission on what the subscriber actually pays. This is honest and sustainable. Paying commissions on $19.95 when the subscriber pays $9.95 = net loss on the affiliate channel. | Full price commissions (rejected: unsustainable unit economics) |
| 19 | **JIT FA activation at $5 threshold** | Avoids KYC friction for ~100K users who may never earn meaningful commissions. Only users who demonstrate real earning activity ($5+ accrued) are prompted for identity verification and wallet activation. Reduces Stripe account overhead and onboarding drop-off. | Provision FA for every user at signup (rejected: unnecessary KYC friction, wasted Stripe accounts) |
| 20 | **Stripe API version strategy** | The vai-api codebase uses BOTH Stripe API versions: v1 StripeClient SDK for most operations AND v2 preview HTTP for Connect account/account-link operations. Treasury FinancialAccount operations MUST use v1 SDK (Treasury is not available on v2 for platforms). New wallet code uses v1 StripeClient for all Treasury and payment operations. Connect onboarding continues using the existing v2 preview HTTP pattern. | Single-version approach (rejected: v2 preview already in use for Connect) |
| 21 | **PayPal failover scoped to payout-only** | PayPal Commerce Platform cannot replicate Stripe Treasury's balance holding, internal transfers, or subscription bridge. Full wallet replacement is not feasible. PayPal failover covers cashouts only (Venmo/PayPal payouts). During Stripe outage: accruals queue in DB, mentor payments disabled, subscription bridge falls back to card. | Full PayPal wallet replacement (rejected: PayPal lacks Treasury-equivalent capabilities) |
| 22 | **1099-NEC filing responsibility is VAI's** | VAI is the payor for affiliate commissions. Stripe Connect Express handles W-9 collection and 1099-NEC generation for the Stripe payout rail. For PayPal/Venmo payouts, VAI must independently track cumulative amounts and file 1099-NEC for recipients exceeding $600/year. Venmo does NOT issue 1099-K on VAI's behalf for payouts made via Payouts API. | Assume Venmo handles tax reporting (rejected: incorrect — Venmo 1099-K applies to personal Venmo volume, not platform payouts) |
| 23 | **Provisional dispute hold, not immediate clawback** | Disputes may be won by the merchant. Immediate clawback on dispute creation wrongfully reverses commissions for disputes that are later resolved in VAI's favor. Provisional hold blocks settlement/cashout without reversing. Finalize only on `charge.dispute.closed`. | Immediate clawback on dispute (rejected: wrongful reversal on won disputes) |
| 24 | **FTC affiliate disclosure required in app** | Any screen showing earnings, share links, or commission rates must include disclosure language per FTC Endorsement Guidelines (16 CFR Part 255). Users must understand they earn commissions from referrals. Exact copy to be approved by counsel before launch. Non-compliance risks FTC enforcement action. | No disclosure (rejected: FTC compliance risk), disclosure only at signup (rejected: must be proximate to material connection per guidelines) |

---

## Appendix B: Database Schema

All tables are PostgreSQL on AWS RDS (existing database). These tables are ADDED — no existing tables are modified.

### commission_ledger

The orchestration ledger for all commission events. NOT a money ledger — Stripe Treasury is the money truth.

```sql
CREATE TABLE commission_ledger (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    builder_user_id         UUID NOT NULL REFERENCES users(id),
    source_user_id          UUID NOT NULL,
    source_subscription_id  VARCHAR(255) NOT NULL,
    source_charge_id        VARCHAR(255) NOT NULL,
    source_invoice_id       VARCHAR(255) NOT NULL,  -- NEVER NULL. For charge-only rows (no invoice), store charge_id prefixed with 'chrg_' (e.g., 'chrg_ch_abc123').
    affiliate_level         SMALLINT NOT NULL CHECK (affiliate_level BETWEEN 1 AND 5),
    commission_rate_bps     INTEGER NOT NULL,             -- basis points: 2500 = 25%
    gross_amount_cents      INTEGER NOT NULL,             -- subscription price in cents
    commission_amount_cents INTEGER NOT NULL,             -- calculated commission in cents
    currency                VARCHAR(3) NOT NULL DEFAULT 'USD',
    status                  VARCHAR(30) NOT NULL DEFAULT 'ACCRUED_PENDING',
    hold_until              TIMESTAMP WITH TIME ZONE NOT NULL,
    available_at            TIMESTAMP WITH TIME ZONE,
    settling_at             TIMESTAMP WITH TIME ZONE,
    stripe_transfer_id      VARCHAR(255),
    source_currency         VARCHAR(3) NOT NULL DEFAULT 'usd',
    exchange_rate           DECIMAL(12,6) NOT NULL DEFAULT 1.000000,
    dispute_hold            BOOLEAN NOT NULL DEFAULT false,
    is_shadow               BOOLEAN NOT NULL DEFAULT false,
    clawback_reason         VARCHAR(50),
    clawback_at             TIMESTAMP WITH TIME ZONE,
    idempotency_key         VARCHAR(255) NOT NULL,
    retry_count             SMALLINT NOT NULL DEFAULT 0,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_source_invoice_not_null CHECK (source_invoice_id IS NOT NULL),

    -- source_invoice_id is NEVER NULL. For charge-only rows without an invoice,
    -- the charge_id is stored with 'chrg_' prefix (e.g., 'chrg_ch_abc123').
    -- This maintains uniqueness and avoids NULL-related dedup gaps.
    CONSTRAINT uq_commission_idempotency
        UNIQUE (source_invoice_id, builder_user_id, affiliate_level)
);

CREATE INDEX idx_cl_builder_status ON commission_ledger(builder_user_id, status);
CREATE INDEX idx_cl_hold_pending ON commission_ledger(status, hold_until)
    WHERE status = 'ACCRUED_PENDING';
CREATE INDEX idx_cl_source_charge ON commission_ledger(source_charge_id);
CREATE INDEX idx_cl_source_subscription ON commission_ledger(source_subscription_id);
CREATE INDEX idx_cl_release_scheduled ON commission_ledger(status)
    WHERE status = 'RELEASE_SCHEDULED';
```

### payout_accounts

User's linked payout destinations.

```sql
CREATE TABLE payout_accounts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id),
    method              VARCHAR(20) NOT NULL CHECK (method IN ('venmo', 'paypal', 'bank')),
    identifier_encrypted VARCHAR(512) NOT NULL,   -- encrypted at rest
    identifier_masked   VARCHAR(50) NOT NULL,     -- "@your****" for display
    is_default          BOOLEAN DEFAULT false,
    is_verified         BOOLEAN DEFAULT false,
    verified_at         TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_pa_default ON payout_accounts(user_id)
    WHERE is_default = true;
CREATE INDEX idx_pa_user ON payout_accounts(user_id);
```

### payout_requests

Tracks cashout requests.

```sql
CREATE TABLE payout_requests (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id),
    payout_account_id   UUID NOT NULL REFERENCES payout_accounts(id),
    amount_cents        INTEGER NOT NULL,
    fee_cents           INTEGER NOT NULL DEFAULT 0,
    net_amount_cents    INTEGER NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'USD',
    status              VARCHAR(20) NOT NULL DEFAULT 'PROCESSING'
                        CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'QUEUED_LIQUIDITY')),
    external_payout_id  VARCHAR(255),
    error_message       TEXT,
    idempotency_key     VARCHAR(255) NOT NULL UNIQUE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_pr_user_status ON payout_requests(user_id, status);
CREATE INDEX idx_pr_processing ON payout_requests(status) WHERE status = 'PROCESSING';
```

### debt_records

Tracks post-payout clawback debt.

```sql
CREATE TABLE debt_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id),
    original_commission_id UUID NOT NULL REFERENCES commission_ledger(id),
    amount_cents        INTEGER NOT NULL,
    remaining_cents     INTEGER NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'USD',
    reason              VARCHAR(50) NOT NULL,
    commission_id       UUID REFERENCES commission_ledger(id),
    status              VARCHAR(20) NOT NULL DEFAULT 'OUTSTANDING'
                        CHECK (status IN ('OUTSTANDING', 'RECOVERED', 'WRITTEN_OFF')),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    recovered_at        TIMESTAMP WITH TIME ZONE,
    written_off_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_dr_user_outstanding ON debt_records(user_id, status)
    WHERE status = 'OUTSTANDING';
```

### vai_invoices

Mentor-to-user invoices.

```sql
CREATE TABLE vai_invoices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mentor_user_id      UUID NOT NULL REFERENCES users(id),
    client_user_id      UUID NOT NULL REFERENCES users(id),
    amount_cents        INTEGER NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'USD',
    description         TEXT,
    status              VARCHAR(30) NOT NULL DEFAULT 'CREATED'
                        CHECK (status IN ('CREATED', 'PAYMENT_IN_PROGRESS', 'WALLET_DEBITED', 'CARD_CHARGED', 'TRANSFER_COMPLETE', 'PAID', 'WALLET_REVERSED', 'FAILED', 'CANCELLED', 'EXPIRED')),
    due_date            DATE,
    paid_at             TIMESTAMP WITH TIME ZONE,
    payment_wallet_cents INTEGER,
    payment_card_cents  INTEGER,
    platform_fee_cents  INTEGER,
    stripe_payment_intent_id VARCHAR(255),
    idempotency_key     VARCHAR(255),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vi_mentor ON vai_invoices(mentor_user_id, status);
CREATE INDEX idx_vi_client ON vai_invoices(client_user_id, status);
```

### fee_policies

Versioned policy table for the $14.95 fee.

```sql
CREATE TABLE fee_policies (
    id                      SERIAL PRIMARY KEY,
    fee_amount_cents        INTEGER NOT NULL,
    threshold_cents         INTEGER NOT NULL,
    waiver_tiers            JSONB NOT NULL DEFAULT '["PLUS", "MENTOR"]',
    recurring_months_required INTEGER NOT NULL DEFAULT 2,
    effective_date          DATE NOT NULL,
    superseded_date         DATE,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Seed the initial policy
INSERT INTO fee_policies (fee_amount_cents, threshold_cents, effective_date)
VALUES (1495, 5000, '2026-05-01');
```

### fee_assessments

Monthly fee assessment records.

```sql
CREATE TABLE fee_assessments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id),
    fee_policy_id       INTEGER NOT NULL REFERENCES fee_policies(id),
    assessment_month    DATE NOT NULL,           -- first of month
    recurring_earnings_cents INTEGER NOT NULL,
    fee_amount_cents    INTEGER NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'ASSESSED'
                        CHECK (status IN ('ASSESSED', 'CHARGED', 'WAIVED', 'DEFERRED')),
    waiver_reason       VARCHAR(50),
    charged_at          TIMESTAMP WITH TIME ZONE,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_fee_user_month UNIQUE (user_id, assessment_month)
);
```

### wallet_accounts

Maps users to their Stripe Connect + Treasury objects.

```sql
CREATE TABLE wallet_accounts (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL UNIQUE REFERENCES users(id),
    stripe_connect_id       VARCHAR(255) NOT NULL UNIQUE,
    stripe_financial_account_id VARCHAR(255) UNIQUE,
    onboarding_status       VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                            CHECK (onboarding_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETE', 'FAILED')),
    charges_enabled         BOOLEAN DEFAULT false,
    payouts_enabled         BOOLEAN DEFAULT false,
    identity_verified       BOOLEAN DEFAULT false,
    created_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wa_connect ON wallet_accounts(stripe_connect_id);
```

### wallet_user_settings

User wallet preferences and JIT activation prompt state. Stores auto-pay, auto-cashout, notification preferences, and activation prompt flags.

```sql
CREATE TABLE wallet_user_settings (
    id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                         INT NOT NULL UNIQUE REFERENCES users(id),
    auto_pay_subscription           BOOLEAN NOT NULL DEFAULT false,
    auto_cashout_enabled            BOOLEAN NOT NULL DEFAULT false,
    auto_cashout_threshold_cents    INTEGER,
    auto_cashout_frequency          VARCHAR(20) CHECK (auto_cashout_frequency IN ('daily', 'weekly', 'monthly')),
    auto_cashout_payout_account_id  UUID REFERENCES wallet_payout_accounts(id),
    notify_commission_available     BOOLEAN NOT NULL DEFAULT true,
    notify_clawback                 BOOLEAN NOT NULL DEFAULT true,
    notify_cashout_complete         BOOLEAN NOT NULL DEFAULT true,
    activation_prompt_required      BOOLEAN NOT NULL DEFAULT false,
    activation_prompt_reason        VARCHAR(100),
    activation_prompt_set_at        TIMESTAMP WITH TIME ZONE,
    activation_prompt_cleared_at    TIMESTAMP WITH TIME ZONE,
    created_at                      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at                      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallet_user_settings_prompt_required ON wallet_user_settings(user_id)
    WHERE activation_prompt_required = true;
CREATE INDEX idx_wallet_user_settings_user ON wallet_user_settings(user_id);
```

> **Note on activation_prompt_* columns:** These fields track JIT wallet activation state. `activation_prompt_required` is set to true when pending commissions reach >= 500 cents and the user has no wallet_accounts row. The flag is immediately cleared to false (with `cleared_at` timestamp) when the user completes wallet activation via POST /v1/wallet/activate. The `set_at` and `cleared_at` timestamps preserve history for audit trails. Updates to these fields MUST go through dedicated repository methods (`SetActivationPromptRequiredAsync` and `ClearActivationPromptAsync`) to preserve idempotency and timestamp logic. General upserts via `UpsertWalletSettingsAsync` do NOT touch activation_prompt_* fields.

### wallet_holds

Tracks cashout reservations, subscription bridge holds, and fee deductions against user balances.

```sql
CREATE TABLE wallet_holds (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id),
    amount_cents        INTEGER NOT NULL,
    currency            VARCHAR(3) NOT NULL DEFAULT 'USD',
    hold_type           VARCHAR(30) NOT NULL
                        CHECK (hold_type IN ('CASHOUT_RESERVE', 'SUBSCRIPTION_BRIDGE', 'FEE_DEDUCTION', 'INVOICE_PAYMENT')),
    stripe_reference_id VARCHAR(255),
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                        CHECK (status IN ('ACTIVE', 'RELEASED', 'EXPIRED')),
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_wh_user_active ON wallet_holds(user_id, status)
    WHERE status = 'ACTIVE';
CREATE INDEX idx_wh_expiring ON wallet_holds(expires_at)
    WHERE status = 'ACTIVE';
CREATE UNIQUE INDEX idx_wallet_holds_active_bridge ON wallet_holds(user_id, hold_type, stripe_reference_id)
    WHERE status = 'ACTIVE';
```

> **Note on `idx_wallet_holds_active_bridge`:** This partial unique index prevents duplicate active bridge holds for the same invoice. Without it, a retry of the T-48h subscription bridge worker could create a second `SUBSCRIPTION_BRIDGE` hold for the same `stripe_reference_id`, double-debiting the user's FA.

### webhook_events

Queue table for deferred webhook processing (see Section 10.3).

```sql
CREATE TABLE webhook_events (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider            VARCHAR(20) NOT NULL,    -- 'stripe' or 'paypal'
    event_type          VARCHAR(100) NOT NULL,
    event_id            VARCHAR(255) NOT NULL,
    payload             JSONB NOT NULL,
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                        CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    attempts            SMALLINT NOT NULL DEFAULT 0,
    last_error          TEXT,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    processed_at        TIMESTAMP WITH TIME ZONE,

    CONSTRAINT uq_webhook_event_queue UNIQUE (provider, event_id)
);

CREATE INDEX idx_we_pending ON webhook_events(status, created_at)
    WHERE status = 'PENDING';
```

### webhook_log

Audit trail for all incoming webhooks.

```sql
CREATE TABLE webhook_log (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider            VARCHAR(20) NOT NULL,    -- 'stripe' or 'paypal'
    event_type          VARCHAR(100) NOT NULL,
    event_id            VARCHAR(255) NOT NULL,
    payload             JSONB NOT NULL,
    processed           BOOLEAN DEFAULT false,
    processed_at        TIMESTAMP WITH TIME ZONE,
    error_message       TEXT,
    created_at          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_webhook_event UNIQUE (provider, event_id)
);

CREATE INDEX idx_wl_unprocessed ON webhook_log(processed, created_at)
    WHERE processed = false;
```

### reconciliation_runs

Audit log for daily reconciliation cron runs (Job 3).

```sql
CREATE TABLE reconciliation_runs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_date            DATE NOT NULL,
    job_name            VARCHAR(50) NOT NULL,
    charges_checked     INTEGER NOT NULL DEFAULT 0,
    discrepancies_found INTEGER NOT NULL DEFAULT 0,
    actions_taken       JSONB,
    started_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at        TIMESTAMP,
    status              VARCHAR(20) NOT NULL DEFAULT 'RUNNING'
                        CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED'))
);
CREATE INDEX idx_reconciliation_date ON reconciliation_runs(run_date DESC);
```

---

## Appendix C: Commission Math Reference

Quick reference for all commission calculations. All amounts in cents.

### Plus Subscription ($9.95/mo after 50% affiliate discount)

| Level | Rate | Calculation | Monthly Commission |
|-------|------|-------------|-------------------|
| L1 | 25% | 995 * 25 / 100 = 248.75 → **249** | $2.49 |
| L2 | 10% | 995 * 10 / 100 = 99.5 → **100** | $1.00 |
| L3 | 5% | 995 * 5 / 100 = 49.75 → **50** | $0.50 |
| L4 | 3% | 995 * 3 / 100 = 29.85 → **30** | $0.30 |
| L5 | 2% | 995 * 2 / 100 = 19.9 → **20** | $0.20 |
| **Total** | **45%** | | **$4.49** |

### Mentor Subscription ($49.95/mo after 50% affiliate discount)

| Level | Rate | Calculation | Monthly Commission |
|-------|------|-------------|-------------------|
| L1 | 25% | 4995 * 25 / 100 = 1248.75 → **1249** | $12.49 |
| L2 | 10% | 4995 * 10 / 100 = 499.5 → **500** | $5.00 |
| L3 | 5% | 4995 * 5 / 100 = 249.75 → **250** | $2.50 |
| L4 | 3% | 4995 * 3 / 100 = 149.85 → **150** | $1.50 |
| L5 | 2% | 4995 * 2 / 100 = 99.9 → **100** | $1.00 |
| **Total** | **45%** | | **$22.49** |

### Rounding Rule

All commission calculations: multiply base cents by rate, divide by 100, **round up** (ceiling). This slightly favors the referrer and avoids sub-cent discrepancies.

> **Cross-reference:** All affiliate commission calculations use CEILING rounding (round up to next cent). This matches the rates in this appendix. Code must use `Math.Ceiling`, not `Math.Round`.

### Flywheel Example

User A shares with 4 friends who subscribe to Plus:
- 4 x 249 cents = 996 cents/mo ($9.96)
- Plus subscription = 995 cents/mo ($9.95)
- **Net: +1 cent/mo. Subscription is free.** The progress bar shows 100%.

---

## Appendix D: Existing vs New Infrastructure

### Already Exists (Do Not Rebuild)

| Component | Status | Notes |
|-----------|--------|-------|
| Stripe Connect | Active | Express accounts already being created for some users |
| Stripe Billing | Active | Subscription management, invoicing, webhooks |
| Stripe Webhooks | Partially wired | `charge.succeeded`, subscription events exist. Refund/dispute handlers need adding. Treasury webhook handlers do NOT exist. |
| PayPal Payouts API | Integrated | Used for existing Venmo/PayPal payouts |
| Venmo Payouts | Integrated | Via PayPal Payouts API |
| PostgreSQL on RDS | Active | Existing database, new tables added alongside |
| C#/.NET Backend on ECS | Active | New endpoints added to existing API |
| React Native/Expo App | Active | New wallet tab added |
| Bruno's Payout Process | Active (to be replaced) | Manual audit + push via Stripe dashboard |
| JWT Authentication (Auth0) | Active | Auth0 issues JWTs. All new `/v1/wallet/*` endpoints use existing auth middleware. |
| AWS Cognito | Active | Used alongside Auth0 for user identity. Wallet user mapping ties to Cognito user pool. |
| Push Notifications (OneSignal + FCM) | Active | The vai-mobile app uses react-native-onesignal and @react-native-firebase/messaging for push notifications, NOT Expo Push. Wallet notification events (commission available, clawback, payout complete, fee assessed) should use the existing OneSignal integration. |
| Stream Chat | Active | In-app chat. Mentor invoice notifications can be sent as Stream messages alongside push. |
| AWS SES | Active | Email service. Payout confirmations, invoice receipts, fee notices sent via SES. |
| AWS S3 | Active | File storage. Invoice PDFs, receipt exports stored here. |
| AWS CloudWatch | Active | Monitoring. Wallet audit cron failures, payout processing errors alert to CloudWatch → #vai-prod-alerts. |
| Redis (ElastiCache) | Active | Session cache + provider failover flag (`wallet_provider_status`). |

> **CRITICAL — Treasury is 100% Greenfield:** Stripe Treasury is 100% greenfield. No treasury.* webhook handlers, no FinancialAccount code, no Treasury API calls exist in the current codebase. ALL Treasury infrastructure must be built from scratch. Existing Stripe infrastructure (Connect, Billing, Payments, Payouts) is live. Treasury wallet code is ADDITIVE — new feature folders, new tables, new webhook handlers. The ONE required modification to existing code is the P0 commission trigger fix: changing the referral compensation trigger from customer.subscription.created to invoice.paid in the existing SubscriptionsV1Controller. This is a targeted behavioral change, not a structural refactor.

### Canonical User Identity

**Canonical user identity: `users.id` (UUID) in PostgreSQL is the single source of truth.** Auth0 `sub` and Cognito `user_pool_id` both map to this UUID via the existing `user_identities` table. All wallet tables reference `users.id`, never Auth0 or Cognito IDs directly. When creating `commission_ledger` rows, `wallet_accounts`, or any wallet-related records, always resolve to `users.id` first. This prevents identity fragmentation across auth providers.

### Must Be Built

| Component | Owner | Priority |
|-----------|-------|----------|
| Commission trigger fix (`subscription.created` → `invoice.paid`) | Francis | P0 — before anything else |
| Feature flag `wallet_commission_engine_active` + single writer gate | Francis | P0 |
| `commission_ledger` table + 9 other new tables (incl. `wallet_holds`, `webhook_events`) | Francis | P0 |
| New webhook handlers (refund, dispute, treasury events) | Francis | P0 |
| Daily audit cron (5 jobs + monthly fee assessment) | Francis | P1 |
| Treasury Financial Account JIT provisioning ($5 threshold trigger) | Francis | P1 |
| Wallet balance endpoint | Francis | P1 |
| Cashout processing (Venmo/PayPal/Bank routing) | Francis | P1 |
| Wallet tab UI | Badinho | P1 |
| Cashout flow UI | Badinho | P1 |
| Link payout account flow UI | Badinho | P1 |
| User-to-Mentor invoice + payment flow | Francis + Badinho | P2 |
| Subscription-from-wallet bridge (pre-billing worker) | Francis | P2 |
| $14.95 fee assessment + collection | Francis | P2 |
| Progress bar UI | Badinho | P2 |
| Wallet settings UI | Badinho | P2 |
| Admin dashboard for payout monitoring | Francis | P2 |
| `IPayoutFailover` abstraction + PayPal payout implementation | Francis | P3 |
| Redis provider flag + health probes | Francis | P3 |
| `user_identities` table (if not exists) -- maps Auth0 `sub` + Cognito `user_pool_id` to canonical `users.id` UUID. Required for wallet user resolution. | Francis | P0 |
| Auto-cashout feature | Francis + Badinho | P3 |

---

*End of spec (Version 4.2 FINAL | STRIPE SDK-FIRST | AUDIT-REMEDIATED). This document is the single source of truth for the VAI Wallet system architecture. All implementation questions should reference this spec first.*
