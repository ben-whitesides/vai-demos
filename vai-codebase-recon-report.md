# VAI Codebase Recon — BUILD BIBLE (wallet feature)

**Sources:** `vai-app/vai-api` and `vai-app/vai-mobile-react-native` at `HEAD` of default branch (`main`), extracted 2026-04-09.  
**Method:** Bare `git clone` + `git archive` into `~/code/vai-recon-work/` (standard `git clone` to working tree failed on `.git/hooks` in this environment; `.vscode` excluded from archive for the same reason).  
**Obi-Wan oversight:** No findings below are invented; where the committed `appsettings` is incomplete, that is called out explicitly.

---

## Part A — vai-api (C# / .NET 8)

### 1. Folder structure — `Vai.Api/Features/`

Top-level feature folders (exact list):

`Abilities`, `Activities`, `App`, `Audit`, `Connect`, `DataExport`, `Events`, `Groups`, `Invitations`, `Management`, `Notifications`, `Onboarding`, `Payments`, `Payouts`, `Promotions`, `Referrals`, `ScheduledEvents`, `SocialConnections`, `Stats`, `Subscriptions`, `System`, `Token`, `UserAbilities`, `Users`

**Infrastructure** (high-signal files for payments & integrations): under `Vai.Api/Infrastructure/` — `Services/StripeService.cs`, `Services/PaypalService.cs`, `Services/SchedulerService.cs`, `Services/SnsService.cs`, `Configuration/StripeConfiguration.cs`, `Configuration/PaypalConfiguration.cs`, `Auth0/`, `Middleware/UserContext/`, `Api/VaiSecureControllerBase.cs`, `DependencyResolution.cs`.

### 2. DependencyResolution pattern

Each feature has a `*DependencyResolution.cs` with a static `Configure(IServiceCollection services)` registering repositories and services.

**Reference — full file** (`Vai.Api/Features/Invitations/InvitationsDependencyResolution.cs`):

```csharp
using Microsoft.Extensions.DependencyInjection;
using Vai.Api.Features.Invitations.Data;
using Vai.Api.Features.Invitations.Services;

namespace Vai.Api.Features.Invitations;

public class InvitationsDependencyResolution
{
    public static void Configure(IServiceCollection services)
    {
        services.AddScoped<IInvitationsRepository, InvitationsRepository>();
        services.AddScoped<IInvitationsService, InvitationsService>();
    }
}
```

**Pattern to follow:** Feature-local `Configure` methods are invoked from `Infrastructure/DependencyResolution.cs` alongside infrastructure singletons/scoped services.

### 3. Stripe integration

**Files (non-exhaustive but complete for navigation):**

- `Vai.Api/Infrastructure/Services/StripeService.cs` — primary implementation
- `Vai.Api/Infrastructure/Services/IStripeService.cs`
- `Vai.Api/Infrastructure/Configuration/StripeConfiguration.cs`
- `Vai.Api/Infrastructure/DependencyResolution.cs` — `services.Configure<StripeConfiguration>(configuration.GetSection("Stripe"));`, `AddScoped<IStripeService, StripeService>()`
- `Vai.Api/Features/Payments/` — payment flows, payment sheet, webhooks (see below)
- `Vai.Api/Features/Subscriptions/` — checkout, mobile subscription, **subscription webhook**
- `Vai.Api/Features/Payouts/` — Stripe payout webhook handling
- `Vai.Api/Data/Entities/StripePayout.cs`
- `Vai.Tests/Features/Payments/PaymentsServiceTests.cs` — mocks `IStripeService`

**How calls are made:**

- **`StripeClient`** from `Stripe.net` for most v1 APIs (`CustomerService`, `PaymentIntentService`, `SessionService`, `EphemeralKeyService`, billing portal, subscriptions, etc.).
- **Stripe “v2” preview HTTP** — separate `HttpClient` with base `https://api.stripe.com/v2`, header `Stripe-Version: 2025-05-28.preview`, used for Connect account / account link style operations (see `StripeService.cs` constants and `ExecuteStripeV2RequestAsync`).
- **Connected accounts:** `RequestOptions { StripeAccount = connectedAccountId }` on PaymentIntents, Ephemeral Keys, Customers on connected accounts, etc.

**Stripe objects in active use (from code paths):** `Customer`, `PaymentIntent`, `EphemeralKey`, Checkout `Session` (subscriptions), `Subscription` / `SubscriptionService`, Billing Portal `Session`, Connect account + account links (via v2 dynamic API), payout webhook verification via `EventUtility` / `StripeException`.

### 4. PayPal / Venmo integration

**Files:**

- `Vai.Api/Infrastructure/Services/PaypalService.cs`
- `Vai.Api/Infrastructure/Services/IPaypalService.cs`
- `Vai.Api/Infrastructure/Models/PaypalModels.cs`, `PaypalModels.NestedTypes.cs`
- `Vai.Api/Infrastructure/Configuration/PaypalConfiguration.cs`
- `Vai.Api/Features/Payments/PaymentsV1Controller.cs` — REST + webhooks + `CreatePaypalOrder`
- `Vai.Api/Features/Payouts/Services/PayPalPayoutsService.cs` — PayPal payout webhooks

**How calls are made:** `HttpClient` to PayPal REST (`/v1/...`, `/v2/checkout/orders/...`). **Venmo** is modeled as a payment method on order create (`PaypalPaymentMethod.Venmo` branch in `CreateOrderAsync`).

### 5. Webhook handlers

| Provider | Route / location | Pattern |
|----------|------------------|---------|
| Stripe onboarding | `POST /v1/payments/stripe/onboarding` | `[AllowAnonymous]`, read raw body, `Stripe-Signature` → `IStripeService.ParseOnboardingWebhookEvent` → `IPaymentsService.HandleStripeAccountUpdatedWebhookAsync` |
| Stripe payment | `POST /v1/payments/stripe/payment` | Same, `ParsePaymentWebhookEvent` → `HandleStripePaymentWebhookAsync` |
| Stripe subscription | `POST /v1/subscriptions/webhook` | `SubscriptionsV1Controller`, `ParseSubscriptionWebhookEvent` → `ISubscriptionsService.HandleWebhookEventAsync` |
| Stripe payout | `PayoutsV1Controller` (`ProcessStripePayoutWebhook`) | Payout-specific parsing / services |
| PayPal onboarding | `POST /v1/payments/paypal/onboarding` | PayPal transmission headers + `VerifyAsync` + handler |
| PayPal payment | `POST /v1/payments/paypal/payment` | Raw body → `HandlePaypalPaymentWebhookAsync` |
| PayPal invoice | `POST /v1/payments/paypal/invoice` | `HandlePaypalInvoicingWebhookAsync` |

**Pattern to follow:** **Synchronous** ASP.NET controller methods; raw body read; signature verification in infrastructure service; delegate to feature service. No queue abstraction visible in these controllers.

**Snippet — payments webhook entrypoints** (`PaymentsV1Controller.cs`):

```csharp
[HttpPost("stripe/onboarding")]
[AllowAnonymous]
public async Task ProcessStripeWebhookEvent()
{
    var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
    var stripeSignature = Request.Headers["Stripe-Signature"].FirstOrDefault();
    var stripeEvent = stripeService.ParseOnboardingWebhookEvent(json, stripeSignature);
    await paymentsService.HandleStripeAccountUpdatedWebhookAsync(stripeEvent);
}
// ... stripe/payment, paypal/onboarding, paypal/payment, paypal/invoice ...
```

### 6. Database patterns

- **Primary:** **Dapper** + **Npgsql** — repositories take `ISqlConnection` / `PostgresDbConnectionProvider`, `Dapper.DefaultTypeMap.MatchNamesWithUnderscores = true` in `DependencyResolution.cs`.
- **EF Core:** `DevContext : DbContext` exists under `Vai.Api/Data/Entities/DevContext.cs` (appears dev-oriented; not the main app data path for features).
- **Migrations / schema:** **`Vai.Database/Scripts/*.sql`** numbered SQL migrations (e.g. `024_CreatePaymentAccounts.sql`, `043_CreateUserReferrals.sql`, `044_AddReferralCommissionTiers.sql`, `045_CreatePayoutTables.sql`, `052_CreateConnectTables.sql`). **`Vai.Database/Program.cs`** drives application of scripts.

**Entity example** (`Vai.Api/Data/Entities/StripePayout.cs`):

```csharp
public class StripePayout
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string StripeOutboundPaymentId { get; set; } = null!;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "usd";
    public string Status { get; set; } = null!;
    public string? StripeAccountId { get; set; }
    // ...
}
```

### 7. Background jobs

- **Hangfire:** not observed.
- **AWS EventBridge Scheduler:** `SchedulerService` + `IAmazonScheduler` — one-time and recurring schedules targeting ARNs (Lambda/SQS/SNS-style integration).
- **In-process cron:** `Vai.Ledger/LedgerHostedService.cs` — `BackgroundService` using **Cronos** expressions from config keys `Ledger:CronDailyCashFlow`, `Ledger:CronReconciliation`, `Ledger:CronEarningsBalance`.

### 8. Authentication

- **JWT Bearer** with two schemes: **`CognitoBearer`** (legacy pool in `us-west-1`) and **`Auth0Bearer`** (Authority `https://{Auth0:Domain}/`, custom audience validation).
- **Default:** Controllers inherit `VaiSecureControllerBase` → `[Authorize]` at base class; user resolved via `IUserContextService` / `UserContextMiddleware`.
- **Public endpoints:** `[AllowAnonymous]` on webhooks and selected routes.

**Snippet** (`VaiSecureControllerBase.cs`):

```csharp
[ApiController]
[Authorize]
public abstract class VaiSecureControllerBase(IUserContextService userContextService) : Controller
{
    protected User LoggedInUser => _userContextService.RequestUser;
}
```

### 9. appsettings structure

Committed `Vai.Api/appsettings.json` includes: `Logging`, `AllowedHosts`, `AppDatabase`, `ApiConfiguration`, `Auth0`, `XApi`, `Subscription`, `Redis`, `Ledger`.  
**Gotcha:** `DependencyResolution` also binds **`Stripe`**, **`Paypal`**, **`AWS`**, **`StreamConfiguration`**, etc. Those sections are **expected** in environment-specific or `appSettings.local.json` (not fully present in the snippet below).

```json
{
  "AppDatabase": {
    "ConnectionString": {
      "Host": "localhost",
      "Database": "dev",
      "Username": "dev",
      "Port": "5433",
      "Password": "",
      "ApplicationName": "Vai.Api"
    }
  },
  "Auth0": {
    "Domain": "",
    "ClientId": "",
    "ClientSecret": "",
    "ChildAccountsConnection": "",
    "ManagementApiAudience": ""
  },
  "Ledger": {
    "LookbackHours": 24,
    "CronDailyCashFlow": "0 15 * * *",
    "CronReconciliation": "0 15 * * *",
    "CronEarningsBalance": "0 15 L * *"
  }
}
```

**Program.cs** loads `appSettings.json` / `appSettings.{Environment}.json` / `appSettings.local.json` (development).

### 10. Test patterns

- **Location:** `Vai.Tests/`, mirroring features (e.g. `Vai.Tests/Features/Payments/`).
- **Framework:** **NUnit 3**, **Moq**, **AutoFixture**, **coverlet**.
- **Pattern:** Mock infrastructure services (`IStripeService`, `IPaypalService`), assert on service behavior.

### 11. Referral / commission / payout-related code

- **`Vai.Api/Features/Referrals/`** — `ReferralsV1Controller` (`/v1/referrals/my-referrer`, `/my-referrals`), `ReferralsRepository`, services.
- **SQL:** `043_CreateUserReferrals.sql`, `044_AddReferralCommissionTiers.sql`, `049_AddReferralSuspension.sql`.
- **Subscriptions:** `IReferralCompensationService` — processes referral compensation tied to Stripe subscription/customer state.
- **Payouts:** `PayoutsV1Controller`, `StripePayoutsService`, `PayPalPayoutsService`, `StripePayout` entity, payout SQL scripts.

### 12. Stripe Connect

- **Yes, wired:** `StripeService` uses **connected account** IDs for customers, payment intents, ephemeral keys, Express dashboard links; v2 API paths for account creation/account links.
- **Feature overlap:** `Features/Connect/` (batch/contact APIs) exists alongside **Payments** Connect onboarding; DB script `052_CreateConnectTables.sql`.
- **Mobile:** passes `stripeAccountId` / `creatorStripeAccountId` into Stripe React Native provider (see mobile section).

**Gotchas**

- **Dual Stripe API surface:** v1 SDK + v2 HTTP preview — new code must match existing service patterns and secrets per webhook type (`Onboarding`, `Payment`, `Subscription`, `Payout` secrets in `StripeConfiguration`).
- **`Program.cs` filename casing:** `appSettings.json` vs `appsettings.json` — verify deployment filesystem case.
- **`UpdateEventPaymentStatus`** in `PaymentsV1Controller` is **disabled** (commented service call).

---

## Part B — vai-mobile-react-native (Expo / React Native)

### 1. Folder structure — `src/`

Large tree (~800+ files). Major areas:

- `src/router/` — `index.tsx`, `appRoutes.tsx`, `TabNavigator.tsx`, `routes.ts`, `nested/*`
- `src/screens/` — feature screens (Gameday, Profile, Payments-related under `components/Gameday/Payments/`, etc.)
- `src/core/` — `apolloClient.ts`, `auth0.ts`, `query.ts`, `streamChat.ts`, etc.
- `src/mutations/` — includes `payments.ts`, `stripe.ts`, `paypal.ts`
- `src/payments/` — `paypalCheckout.ts`
- `src/contexts/`, `src/hooks/`, `src/types/`

### 2. API client pattern

- **GraphQL:** **Apollo Client** — `src/core/apolloClient.ts`, endpoint `${API_URL}authorized/gql/query`, Auth0 bearer + `X-Location` via `setContext`.
- **REST:** **Axios** — `src/api/base.ts`: two instances (`API_URL` legacy, `NEW_API_URL` for new API); interceptors attach **Auth0** `Authorization` and **`X-Location`**.
- **Base URLs:** `ENVIRONMENT_CONFIG` from `src/utils/constants.ts` (and Expo env).

### 3. State management

- **Zustand** — `zustand` in `package.json`; auth and other stores (e.g. `useAuthStore`).
- **React Query (`@tanstack/react-query`)** — `src/core/query.ts` exports `queryClient`; used across hooks.
- **Apollo cache** — GraphQL.
- **Immer / use-immer** — for immutable updates where used.

### 4. Navigation

- **React Navigation v6** — `@react-navigation/native`, `native-stack`, `bottom-tabs`, `drawer`, `stack`.
- **Tabs:** `createBottomTabNavigator` in `src/router/TabNavigator.tsx` (Gameday, Feeds, Search, Profile stacks).

### 5. Payment-related UI

Examples: `src/components/Gameday/Payments/StripeCheckout.tsx`, `StripePaymentButton`, `ApplePayButton`, `src/payments/paypalCheckout.ts`, `src/mutations/payments.ts`, `src/mutations/stripe.ts`, `src/mutations/paypal.ts`, subscription/mentor flows (`VaiPlusUpsell`, `useVaiMentorSubscription`, price IDs in `constants.ts`).

### 6. UI / design system

- **NativeWind** (`nativewind`, `tailwind.config.js`, `global.css`)
- **React Native Paper**, **RNEUI** (`@rneui/base`, `@rneui/themed`)
- **Styled Components**
- **Shared theme:** `@/theme/GlobalStyles` (used in screens)
- **Expo** modules throughout (`expo-image`, `expo-linear-gradient`, etc.)

### 7. Push notifications

- **OneSignal** — `react-native-onesignal`, `onesignal-expo-plugin`
- **Firebase messaging** — `@react-native-firebase/messaging`, `src/core/backgroundMessage.ts` (and related hooks)

### 8. Stripe SDK

- **Package:** `@stripe/stripe-react-native` **^0.53.1**
- **Configuration:** `StripeProvider` with `publishableKey`, `merchantIdentifier`, `urlScheme`, **`stripeAccountId={creatorStripeAccountId}`** for Connect.

**Snippet** (`src/components/Gameday/Payments/StripeCheckout.tsx`):

```tsx
<StripeProvider
  publishableKey={STRIPE_PUBLISHABLE_KEY}
  merchantIdentifier={STRIPE_MERCHANT_ID}
  urlScheme={APP_SCHEME}
  stripeAccountId={creatorStripeAccountId}
>
```

### 9. PayPal / Venmo

- **No dedicated Braintree SDK** in `package.json`; PayPal flows go through **backend** (`CreatePaypalOrder`, webhooks) and app mutations/helpers (`paypalCheckout.ts`, `mutations/paypal.ts`).

### 10. Screen template (reference file)

**Full reference:** `src/screens/Landing.tsx` — Auth0 `authorize`, `StackScreenProps`, `@/` imports, `VaiButton`, `expo-av` `Video`, `expo-image`, `StyleSheet`, theme tokens, `Toast`.

---

## Wallet-relevant dependencies (quick list)

**Backend (`Vai.Api.csproj`):** `Stripe.net` **50.1.0** (pinned line 39), `Dapper`, `Npgsql.EntityFrameworkCore.PostgreSQL`, `Microsoft.AspNetCore.Authentication.JwtBearer`, AWS SDK (S3, SES, SNS, **Scheduler**), `StackExchange.Redis`, Stream SDKs, `RazorLight`, `Auth0.ManagementApi`.

**Mobile (`package.json`):** `@stripe/stripe-react-native` **0.53.1**, `axios`, `@apollo/client`, `@tanstack/react-query`, `zustand`, `react-native-auth0`, `nativewind`, `tailwindcss`, `@react-native-firebase/messaging`, `react-native-onesignal`, `@react-navigation/*`, `expo` 53 / RN 0.79.

---

## Part C — VAI Wallet Feature (added 2026-04-11)

**This section is NEW as of 2026-04-11. It documents the `Features/Wallet/` structure built over 14 audit rounds and Masters R3 binding PASS.**

### C1. Folder structure — `Vai.Api/Features/Wallet/`

```
Vai.Api/Features/Wallet/
├── WalletDependencyResolution.cs         (feature DI registration)
├── WalletV1Controller.cs                 (balance, transactions, cashout, payout-accounts, settings, activate, status, recent-recipients, resolve-recipient)
├── WalletSendMoneyController.cs          (Phase 4 — POST /send, POST /send/{id}/confirm)
├── WalletAdminController.cs              (admin payouts, audit-log, health)
├── WalletWebhookController.cs            (Stripe webhook entrypoint for wallet events)
├── WalletHostedService.cs                (cron-based release holds + settlement)
├── WalletWebhookProcessorHostedService.cs (background webhook queue processor)
├── WalletStripeEventTypes.cs             (event type constants)
├── Controllers/                          (empty in current sandbox — consolidated at feature root)
├── Data/
│   ├── IWalletRepository.cs              (includes CreateWalletHoldAsync, ReleaseActiveHoldByReferenceAsync, GetReservedCentsAsync — SEND_PAYMENT aware)
│   ├── WalletRepository.cs               (Dapper + parameterized SQL)
│   ├── IWalletPaymentRepository.cs       (Phase 4 — InsertPaymentAsync, GetPaymentByIdempotencyKeyAsync sender-scoped, UpdatePaymentStatusAsync, CountSendsSinceAsync, SumSendsSinceAsync, OldestCountedSendAtAsync, GetExpiredAwaitingCardForSenderAsync, TryExpireAwaitingCardAsync)
│   └── WalletPaymentRepository.cs
├── DTOs/
│   ├── WalletBalanceResponse.cs
│   ├── TransactionHistoryResponse.cs     (status_display field — mobile renders this, NEVER raw status)
│   ├── WalletSettingsResponse.cs         (notifications: new_earnings, earning_reversed, cashout_complete)
│   ├── WalletSettingsUpdateRequest.cs    (same field names as response — GET/PUT consistency enforced)
│   ├── WalletSettingsMapper.cs           (maps DB columns notify_commission_available → new_earnings, notify_clawback → earning_reversed)
│   ├── CashoutRequest.cs
│   ├── CashoutResponse.cs
│   ├── RecentRecipientResponse.cs        (remediation layer)
│   ├── ResolveRecipientResponse.cs       (remediation layer)
│   └── SendMoney/
│       ├── SendMoneyRequest.cs           (recipient_handle, amount_cents, currency, category, note, payment_source, idempotency_key)
│       ├── SendMoneyResponse.cs          (payment_id, status, status_display, amount_cents, recipient, payment_breakdown, stripe_client_secret, stripe_customer_id, stripe_ephemeral_key, category, note, created_at)
│       ├── SendMoneyConfirmRequest.cs
│       └── SendMoneyConfirmResponse.cs
├── Helpers/
│   ├── WalletStatusDisplayHelper.cs      (maps all status enums to user-facing strings)
│   ├── WalletUsd.cs                      (WalletUsd.Format(int cents) → "$75.00")
│   └── WalletPayQrPayloadValidator.cs    (strict regex ^https://vai\.app/pay/@[a-zA-Z0-9_]+$, no amount from QR)
├── Models/
│   ├── WalletModels.cs                   (WalletAccount, WalletHoldInsert with Id/UserId/AmountCents/HoldType/StripeReferenceId/ExpiresAt, WalletUserSettingsRow, etc.)
│   ├── CommissionLedger.cs
│   ├── DebtRecord.cs
│   ├── PayoutAccount.cs
│   ├── PayoutRequest.cs
│   ├── VaiInvoice.cs
│   └── WalletPayment.cs                  (Phase 4 — sender_user_id, recipient_user_id, amount_cents, currency, category, note, status, status_display, payment_source, wallet_cents, card_cents, platform_fee_cents, stripe_payment_intent_id, stripe_outbound_payment_id, idempotency_key, created_at, completed_at)
└── Services/
    ├── WalletActivationService.cs        (Connect Express + Treasury FA provisioning at $5 JIT threshold)
    ├── WalletBalanceService.cs           (reads raw Treasury cash + GetReservedCentsAsync — SEND_PAYMENT holds included)
    ├── WalletCashoutService.cs           (Venmo/Bank routing, $25 min, dollar-formatted error messages)
    ├── WalletCommissionCalculator.cs     (5-level affiliate math, 5.5%/2.5%/1%/0.5%/0.25%)
    ├── WalletCronService.cs              (release holds + settlement cron)
    ├── WalletStripeEventProcessor.cs     (invoice.paid, charge.refunded, disputes, payout.* handlers)
    ├── WalletTreasuryService.cs          (FinancialAccount reads, v1 StripeClient)
    ├── WalletPayoutAccountService.cs
    ├── PaypalWalletPayoutService.cs      (silent failover rail — never shown in UI per Section 8.7)
    ├── RecentRecipientsService.cs        (top 10, IMemoryCache 5-min TTL)
    ├── IRecentRecipientsService.cs
    ├── RecipientResolutionService.cs     (handle + QR payload → payable user object, wallet_active check)
    ├── IRecipientResolutionService.cs
    └── SendMoney/                        (Phase 4 subdirectory)
        ├── ISendMoneyService.cs
        ├── SendMoneyService.cs           (~580 LOC orchestrator — thin wrapper around Stripe SDK, no custom saga)
        ├── WalletException.cs            (structured Extras dict for error responses like next_eligible_at)
        └── SendMoneyStatusDisplay.cs     (SendMoney-specific status_display mappings)
```

### C2. Wallet endpoints (full API surface)

| Method | Route | Controller | Purpose |
|--------|-------|-----------|---------|
| GET | `/v1/wallet/balance` | WalletV1 | Balance breakdown |
| GET | `/v1/wallet/transactions` | WalletV1 | History (status_display included) |
| GET | `/v1/wallet/summary` | WalletV1 | Monthly earnings summary |
| **POST** | **`/v1/wallet/send`** | **WalletSendMoney** | **Phase 4 — send money to any user** |
| **POST** | **`/v1/wallet/send/{id}/confirm`** | **WalletSendMoney** | **Phase 4 — confirm card portion after PaymentSheet** |
| **GET** | **`/v1/wallet/recent-recipients`** | **WalletV1** | **Remediation — top 10 recent recipients** |
| **GET** | **`/v1/wallet/resolve-recipient`** | **WalletV1** | **Remediation — resolve handle or QR payload** |
| POST | `/v1/wallet/cashout` | WalletV1 | Initiate cashout |
| GET | `/v1/wallet/payout-accounts` | WalletV1 | List linked accounts |
| POST | `/v1/wallet/payout-accounts` | WalletV1 | Add payout account |
| DELETE | `/v1/wallet/payout-accounts/{id}` | WalletV1 | Remove payout account |
| PUT | `/v1/wallet/payout-accounts/{id}/default` | WalletV1 | Set default |
| POST | `/v1/invoices` | WalletV1 | Create payment request (mentor-initiated) |
| GET | `/v1/invoices` | WalletV1 | List sent/received requests |
| GET | `/v1/invoices/{id}` | WalletV1 | Request detail |
| POST | `/v1/invoices/{id}/pay` | WalletV1 | Pay request (same Stripe flow as /send) |
| POST | `/v1/invoices/{id}/cancel` | WalletV1 | Cancel request |
| GET | `/v1/wallet/settings` | WalletV1 | Get wallet settings (notifications use new field names) |
| PUT | `/v1/wallet/settings` | WalletV1 | Update wallet settings (GET/PUT field names aligned) |
| POST | `/v1/wallet/activate` | WalletV1 | Start wallet onboarding |
| GET | `/v1/wallet/status` | WalletV1 | Check wallet status |
| GET | `/v1/admin/payouts` | WalletAdmin | List payout requests (admin) |
| POST | `/v1/admin/payouts/{id}/approve` | WalletAdmin | Approve flagged payout |
| POST | `/v1/admin/payouts/{id}/reject` | WalletAdmin | Reject payout |
| GET | `/v1/admin/commissions/audit-log` | WalletAdmin | Daily audit results |
| GET | `/v1/admin/wallet/health` | WalletAdmin | System health |

### C3. Stripe SDK extensions to `Infrastructure/Services/StripeService.cs`

Phase 4 added 4 new methods to `IStripeService` / `StripeService` (all using v1 `_stripeClient`, NOT v2 HTTP preview):

```csharp
// Treasury FA-to-FA transfer (wallet-to-wallet send portion)
Task<OutboundPayment> CreateOutboundPaymentAsync(
    string sourceFaId, string destFaId, int amountCents, string description,
    string sourceConnectedAccountId, string idempotencyKey, CancellationToken ct);

// PaymentIntent with transfer_data (card portion → destination charge to recipient's Connect account)
Task<PaymentIntent> CreatePaymentIntentWithTransferAsync(
    int amountCents, string customerId, string destinationConnectAccountId,
    int platformFeeCents, string setupFutureUsage,
    IReadOnlyDictionary<string, string>? metadata, CancellationToken ct);

// Ephemeral key for platform customer (unlocks saved cards in mobile PaymentSheet)
Task<EphemeralKey> CreateEphemeralKeyForPlatformCustomerAsync(
    string customerId, CancellationToken ct);

// Retrieve PaymentIntent from platform account (verify succeeded before executing wallet portion)
Task<PaymentIntent?> GetPlatformPaymentIntentAsync(
    string paymentIntentId, CancellationToken ct);
```

**Stripe.net 50.1.0 API verification:** All types used (`OutboundPaymentService`, `OutboundPaymentCreateOptions`, `PaymentIntentCreateOptions.TransferData`, `PaymentIntentCreateOptions.AutomaticPaymentMethods`, `PaymentIntentCreateOptions.SetupFutureUsage`, `PaymentIntentCreateOptions.ApplicationFeeAmount`, `EphemeralKeyCreateOptions.Customer`, `RequestOptions.StripeAccount`) are confirmed present in the pinned 50.1.0 version.

### C4. Stripe migrations added

All in `Vai.Database/Scripts/`:

| File | Purpose |
|------|---------|
| `054_WalletTreasurySchema.sql` | Base Treasury schema: commission_ledger, debt_records, wallet_accounts, wallet_holds (with inline anonymous CHECK constraint on hold_type), wallet_payout_accounts, wallet_payout_requests, webhook_events, webhook_log |
| `055_AddWalletActivationPromptFlag.sql` | activation_prompt_* columns on wallet_user_settings |
| `056_AddInvoiceCategory.sql` | Remediation — category column on vai_invoices + bootstraps vai_invoices table if missing |
| `057_CreateWalletPayments.sql` | Phase 4 — wallet_payments table + composite unique index `(sender_user_id, idempotency_key)` + sender_status index for sweep query |
| `058_AddSendPaymentHoldType.sql` | Phase 4 — DO block: discovers anonymous CHECK constraint on wallet_holds.hold_type via pg_constraint, drops it, recreates as named `wallet_holds_hold_type_check` with SEND_PAYMENT added |

**Migration 058 pattern (anonymous constraint rediscovery):**
```sql
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    SELECT c.conname INTO constraint_name
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE t.relname = 'wallet_holds'
      AND c.contype = 'c'
      AND pg_get_constraintdef(c.oid) LIKE '%hold_type%';

    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE wallet_holds DROP CONSTRAINT %I', constraint_name);
    END IF;

    ALTER TABLE wallet_holds
        ADD CONSTRAINT wallet_holds_hold_type_check
        CHECK (hold_type IN ('CASHOUT_RESERVE', 'SUBSCRIPTION_BRIDGE', 'FEE_DEDUCTION', 'INVOICE_PAYMENT', 'SEND_PAYMENT'));
END $$;
```

Safe on fresh install (054 → 058) AND re-run (058 → 058 rebuilds its own named constraint).

### C5. Push notification pipeline (Option B — inline pattern)

**Wired via existing `IUserActivityEventService.PublishActivityAsync` pipeline** — matches `PaymentsService.cs:1320-1352` precedent exactly. No new `INotificationService` subsystem was created.

**Pipeline:** `IUserActivityEventService.PublishActivityAsync(UserActivityEventModel)` → `SnsService.PublishEventAsync("user-activity-topic")` → OneSignal/FCM fan-out

**2 new activity types added to `Vai.Api/Features/Management/Modules/Common/Types/NotificationActivityType.cs`:**
```csharp
public const string PaymentSent = "payment_sent";
public const string PaymentReceived = "payment_received";
```

**`IUserActivityEventService` is globally registered in `Infrastructure/DependencyResolution.cs:226`** — feature-level DI registration not required.

**`SendMoneyService` injects `IUserActivityEventService` + `IUserRepository`** (for lazy-loading sender/recipient entities in ConfirmAsync where they're not in scope).

**Fire sites:**
1. Wallet-only SendAsync COMPLETED branch — after `UpdatePaymentStatusAsync("COMPLETED", ...)` and in-memory row mutation
2. ConfirmAsync COMPLETED branch — after the final UpdatePaymentStatusAsync and best-effort hold release

**Both helpers wrapped in try/catch → LogWarning → return.** Never throw. Never roll back money movement.

**PII envelope (eventArgs JSON):**
- ✅ `PaymentId` (opaque server-generated ID)
- ✅ `AmountCents` (user already knows the amount they sent)
- ✅ `Category` (whitelist-validated enum)
- ✅ `FirstName` (sender or recipient, one per event — not both)
- ❌ Never: last4, Stripe PI/PM/customer IDs, emails, exact balances, last names, handles without consent

### C6. Apple Pay / Google Pay — ZERO backend code

Stripe's React Native SDK (`@stripe/stripe-react-native 0.53.1`) handles native wallets automatically when mobile passes `customerId` + `customerEphemeralKeySecret` + `paymentIntentClientSecret` to `initPaymentSheet()`. PaymentSheet shows saved cards + Apple Pay + Google Pay + Link based on device capability. **The only backend code is passing the 3 Stripe fields in the SendMoneyResponse.**

**⚠️ HIDDEN DEPENDENCY — OPS GATE:** `AutomaticPaymentMethods.Enabled = true` in the backend only honors what's toggled in **Stripe Dashboard → Settings → Payment Methods** on the platform account. If only "Card" is enabled in the dashboard, Apple Pay / Google Pay silently do NOT appear in mobile PaymentSheet. This is invisible in code — it's a Stripe platform config gate. Must be included in pre-launch ops checklists.

### C7. Jargon scrub rules (Section 8.7 of v4.2 spec — enforced in code)

**NEVER in user-facing strings (error messages, push notifications, response descriptions, DTO field names):**

| Backend term | User-facing replacement |
|-------------|------------------------|
| commission | earning |
| clawback | reversed |
| KYC / CIP / Know Your Customer | "verify your identity" |
| Connect Express account | (invisible — "your wallet") |
| Treasury FA / Financial Account | "your wallet" or "your account" |
| OutboundPayment / OutboundTransfer | (invisible — "money is on the way") |
| PaymentIntent / PI | (invisible — "payment processing") |
| saga / compensating transaction | (invisible — user sees success or failure) |
| raw cents in errors | dollars via `WalletUsd.Format()` → "$75.00" |
| backend status enum (ACCRUED_PENDING, RELEASE_SCHEDULED, etc.) | `status_display` field |

**Backend ALWAYS returns both `status` (internal enum) and `status_display` (user-facing text) on transaction responses.** Mobile MUST render `status_display`, NEVER raw `status`. Section 8.6 of the v4.2 spec has the full mapping table.

### C8. Error response patterns

All `WalletException` errors get mapped to structured JSON response bodies via `MapWalletError` on the controllers:

```csharp
private static IActionResult MapWalletError(WalletException ex)
{
    var body = new Dictionary<string, object?>
    {
        ["error"] = ex.Code,
        ["message"] = ex.Message
    };
    if (ex.Extras != null)
    {
        foreach (var kv in ex.Extras)
            body[kv.Key] = kv.Value;
    }

    return ex.Code switch
    {
        "USER_NOT_FOUND" => new NotFoundObjectResult(body),
        "NOT_FOUND" => new NotFoundObjectResult(body),
        "FORBIDDEN" => new ObjectResult(body) { StatusCode = StatusCodes.Status403Forbidden },
        "RATE_LIMITED" => new ObjectResult(body) { StatusCode = StatusCodes.Status429TooManyRequests },
        "WALLET_TRANSFER_FAILED_AFTER_CARD" => new ObjectResult(body) { StatusCode = StatusCodes.Status502BadGateway },
        _ => new BadRequestObjectResult(body)
    };
}
```

**`WalletException` supports structured Extras dict** for fields like `next_eligible_at` on 429 responses (computed from `MIN(created_at) + 24h` of counted rows).

### C9. Money movement correctness rules (locked in via 14-round audit arc)

These are hard rules. Violating any of them fails the Masters audit:

1. **Money is truth. Notifications are best-effort.** All notification code wrapped in try/catch → LogWarning → return. Never roll back money movement.
2. **Use existing pipelines, not new subsystems.** `IUserActivityEventService.PublishActivityAsync` is the proven notification path. Don't build parallel abstractions.
3. **Race-safe state transitions via compare-and-swap SQL.** Use `TryExpireAwaitingCardAsync` pattern: `UPDATE ... WHERE status = 'EXPECTED'` + return affected row count. Caller checks rows > 0.
4. **Reserved balance includes ALL active hold types + expires_at filter.** `GetReservedCentsAsync` queries `hold_type IN (...) AND (expires_at IS NULL OR expires_at > NOW())`.
5. **Option C inline self-healing sweep** (no background worker) for 30-min TTL state machines. Runs at top of "new request" handler before main logic.
6. **Idempotency replay must re-issue short-lived Stripe secrets** (client_secret + ephemeral key) if the row is in AWAITING_CARD and the PI is still alive.
7. **Sender-scoped idempotency lookup** via composite unique index `(sender_user_id, idempotency_key)` — prevents cross-tenant metadata disclosure.
8. **Confirm after PI verification, not from client signal.** Re-fetch PI from Stripe, verify `pi.Status == "succeeded"` AND `pi.Id == row.StripePaymentIntentId` BEFORE executing wallet portion.
9. **Partial failure state for confirm-side money loss.** Distinct status (`PARTIAL_FAILURE`) + distinct error code (`WALLET_TRANSFER_FAILED_AFTER_CARD`) mapped to HTTP 502.
10. **Update ledger BEFORE non-essential side effects.** Update `status = 'COMPLETED'` first, then release hold in try/catch. Silent corruption if reversed.

Full patterns documented in `~/.claude/projects/-Users-benjaminwhitesides/memory/mastery/vai-dotnet-stripe-mastery.md`.

### C10. Audit arc summary

**14 audit rounds. 15 blockers found. 15 blockers fixed. Masters R3 binding PASS: Security 9.0 / Logic 8.5 / Quality 9.0.**

| Round | Auditor | Verdict |
|-------|---------|---------|
| R1 Masters | Opus | FAIL — 6 blockers (status_display, notifications, 429, idempotency, rate limit, PI substitution) |
| R1 Haiku | Haiku | FAIL — 3 blockers |
| R1 Cursor | GPT-5 | FAIL — 4 blockers |
| R2 Masters | Opus | FAIL — 2 new (migration 058, sweep race) |
| R3 Cursor | GPT-5 | PASS + 1 follow-up |
| R3 Haiku | Haiku | PASS + 2 advisories |
| **R3 Masters** | **Opus (binding)** | **PASS 9.0 / 8.5 / 9.0** |
| R3 Backend plug-in | Opus | SEAMLESS in snapshot |
| R3 Mobile + infra plug-in | Opus | MINOR FRICTION (1 blocker B1, 1 ops gate B2) |
| R4 Council (5 models) | Multi | Converged on Option B |
| R4 Masters advisory | Opus | Option B inline pattern |
| R4 Build | Opus | +124 LOC, 0 errors |
| R4 Masters lightweight | Opus | PASS 8.8 / 9.2 / 9.0 |

---

1. **Re-pull after your PR base changes** — this recon is a point-in-time snapshot of `main`.
2. **Confirm secrets/config** — Stripe/PayPal/AWS sections must exist in real deployed settings; the sample `appsettings.json` alone is insufficient.
3. **Run `dotnet build` + mobile `yarn lint` / tests** on your branch before claiming parity with production.
4. **Do not copy** `DevContext` hardcoded connection string if it appears in your tree — treat as dev-only.
5. If you need a **normal** local clone, use your host terminal; Cursor sandboxes may block default `git clone` hooks.

---

*End of report.*
