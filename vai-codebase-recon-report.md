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

**Backend (`Vai.Api.csproj`):** `Stripe.net`, `Dapper`, `Npgsql.EntityFrameworkCore.PostgreSQL`, `Microsoft.AspNetCore.Authentication.JwtBearer`, AWS SDK (S3, SES, SNS, **Scheduler**), `StackExchange.Redis`, Stream SDKs, `RazorLight`, `Auth0.ManagementApi`.

**Mobile (`package.json`):** `@stripe/stripe-react-native`, `axios`, `@apollo/client`, `@tanstack/react-query`, `zustand`, `react-native-auth0`, `nativewind`, `tailwindcss`, `@react-native-firebase/messaging`, `react-native-onesignal`, `@react-navigation/*`, `expo` 53 / RN 0.79.

---

## Obi-Wan — oversight checklist (before you treat this as “done”)

1. **Re-pull after your PR base changes** — this recon is a point-in-time snapshot of `main`.
2. **Confirm secrets/config** — Stripe/PayPal/AWS sections must exist in real deployed settings; the sample `appsettings.json` alone is insufficient.
3. **Run `dotnet build` + mobile `yarn lint` / tests** on your branch before claiming parity with production.
4. **Do not copy** `DevContext` hardcoded connection string if it appears in your tree — treat as dev-only.
5. If you need a **normal** local clone, use your host terminal; Cursor sandboxes may block default `git clone` hooks.

---

*End of report.*
