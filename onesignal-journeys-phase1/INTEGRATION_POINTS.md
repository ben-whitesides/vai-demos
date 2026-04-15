# OneSignal Journey Integration Points

## Overview
The JourneyOrchestrationService orchestrates journey execution. Six existing services must emit events to trigger journeys. This document shows what to integrate and where.

**Key Rule:** All user data must be `System.Net.WebUtility.HtmlEncode()` before passing to JourneyOrchestrationService to prevent XSS injection into OneSignal templates.

---

## Integration Points by Event

### 1. **payment_received**
**Service:** `PaymentService` (vai-api/Features/Payments/)
**Trigger:** When payment is successfully recorded

```csharp
// In PaymentService.RecordPaymentAsync() or similar:
await _journeyService.TriggerJourneyAsync(
    userId: user.PublicId,
    triggerEventType: "payment_received",
    payload: new
    {
        amount_cents = payment.AmountCents,
        payment_type = payment.PaymentType, // e.g., "affiliate_payout"
        user_name = System.Net.WebUtility.HtmlEncode(user.FirstName),
        user_email = System.Net.WebUtility.HtmlEncode(user.Email)
    }
);
```

---

### 2. **referral_welcome**
**Service:** `ReferralsService` (vai-api/Features/Referrals/)
**Trigger:** When a new user joins via referral link

```csharp
// In ReferralsService.ProcessReferralSignupAsync() or similar:
await _journeyService.TriggerJourneyAsync(
    userId: referredUser.PublicId,
    triggerEventType: "referral_welcome",
    payload: new
    {
        referrer_name = System.Net.WebUtility.HtmlEncode(referrer.FirstName),
        referrer_handle = System.Net.WebUtility.HtmlEncode(referrer.Handle),
        user_name = System.Net.WebUtility.HtmlEncode(referredUser.FirstName)
    }
);
```

---

### 3. **affiliate_earnings**
**Service:** `CommissionService` (vai-api/Features/Affiliates/ or Commissions/)
**Trigger:** When affiliate earns commission from referral activity

```csharp
// In CommissionService.RecordCommissionAsync() or similar:
await _journeyService.TriggerJourneyAsync(
    userId: affiliate.PublicId,
    triggerEventType: "affiliate_earnings",
    payload: new
    {
        amount_cents = commission.AmountCents,
        commission_source = System.Net.WebUtility.HtmlEncode(commission.Source), // e.g., "subscription_upgrade"
        affiliate_name = System.Net.WebUtility.HtmlEncode(affiliate.FirstName)
    }
);
```

---

### 4. **earnings_milestone**
**Service:** `CommissionService` (vai-api/Features/Affiliates/ or Commissions/)
**Trigger:** When affiliate reaches cumulative earnings milestone ($100, $500, $1000, etc.)

```csharp
// In CommissionService.RecordCommissionAsync() after updating cumulative earnings:
if (affiliate.CumulativeEarningsCents >= 50000 && previous < 50000) // $500 milestone
{
    await _journeyService.TriggerJourneyAsync(
        userId: affiliate.PublicId,
        triggerEventType: "earnings_milestone",
        payload: new
        {
            milestone_amount_cents = 50000,
            total_earnings_cents = affiliate.CumulativeEarningsCents,
            affiliate_name = System.Net.WebUtility.HtmlEncode(affiliate.FirstName)
        }
    );
}
```

---

### 5. **referral_commission**
**Service:** `CommissionService` or `ReferralsService`
**Trigger:** When a direct referral converts and commission is earned (quick confirmation)

```csharp
// In ReferralsService or CommissionService:
await _journeyService.TriggerJourneyAsync(
    userId: referrer.PublicId,
    triggerEventType: "referral_commission",
    payload: new
    {
        amount_cents = commission.AmountCents,
        referred_user_name = System.Net.WebUtility.HtmlEncode(referredUser.FirstName),
        referrer_name = System.Net.WebUtility.HtmlEncode(referrer.FirstName)
    }
);
```

---

### 6. **monthly_stats**
**Service:** `StatsService` or scheduled cron (vai-api/Features/Analytics/ or similar)
**Trigger:** Monthly (e.g., via Hangfire job at beginning of month)

```csharp
// In scheduled job (e.g., first day of month):
var activeUsers = await _userService.GetActiveUsersLastMonthAsync();
foreach (var user in activeUsers)
{
    var stats = await _statsService.GetUserMonthlyStatsAsync(user.PublicId);
    await _journeyService.TriggerJourneyAsync(
        userId: user.PublicId,
        triggerEventType: "monthly_stats",
        payload: new
        {
            user_name = System.Net.WebUtility.HtmlEncode(user.FirstName),
            total_earnings_cents = stats.TotalEarnings,
            referrals_this_month = stats.NewReferrals,
            subscriptions_count = stats.ActiveSubscriptions
        }
    );
}
```

---

### 7. **affiliate_invite**
**Service:** `AffiliateService` or `InviteService`
**Trigger:** When platform invites a user to join affiliate program

```csharp
// In AffiliateService.InviteUserToAffiliateAsync() or similar:
await _journeyService.TriggerJourneyAsync(
    userId: user.PublicId,
    triggerEventType: "affiliate_invite",
    payload: new
    {
        user_name = System.Net.WebUtility.HtmlEncode(user.FirstName),
        user_sport = System.Net.WebUtility.HtmlEncode(user.Sport?.Name ?? ""),
        commission_rate = "25%" // First level commission
    }
);
```

---

### 8. **brief_delivery**
**Service:** `AVANTIService` or `BriefService` (vai-api/Features/AVANTI/)
**Trigger:** When AVANTI generates and delivers a brief to user

```csharp
// In AVANTIService.DeliverBriefAsync() or similar:
await _journeyService.TriggerJourneyAsync(
    userId: user.PublicId,
    triggerEventType: "brief_delivery",
    payload: new
    {
        user_name = System.Net.WebUtility.HtmlEncode(user.FirstName),
        sport = System.Net.WebUtility.HtmlEncode(user.Sport?.Name ?? "Training"),
        brief_topic = System.Net.WebUtility.HtmlEncode(brief.Topic)
    }
);
```

---

### 9. **coach_message**
**Service:** `CoachingService` or `AVANTIConnectService` (vai-api/Features/AVANTIConnect/)
**Trigger:** When coach sends message to user via AVANTI Connect

```csharp
// In AVANTIConnectService.SendCoachMessageAsync() or similar:
await _journeyService.TriggerJourneyAsync(
    userId: user.PublicId,
    triggerEventType: "coach_message",
    payload: new
    {
        user_name = System.Net.WebUtility.HtmlEncode(user.FirstName),
        coach_name = System.Net.WebUtility.HtmlEncode(coach.FirstName),
        message_preview = System.Net.WebUtility.HtmlEncode(message.Content[..100]) // First 100 chars
    }
);
```

---

### 10. **tier_upgraded**
**Service:** `SubscriptionsService` (vai-api/Features/Subscriptions/)
**Trigger:** When user upgrades subscription tier (Basic → Plus, Plus → Mentor, etc.)

```csharp
// In SubscriptionsService.UpgradeSubscriptionAsync() or similar:
await _journeyService.TriggerJourneyAsync(
    userId: user.PublicId,
    triggerEventType: "tier_upgraded",
    payload: new
    {
        user_name = System.Net.WebUtility.HtmlEncode(user.FirstName),
        previous_tier = System.Net.WebUtility.HtmlEncode(previousPlan.DisplayName),
        new_tier = System.Net.WebUtility.HtmlEncode(newPlan.DisplayName),
        price_cents = newPlan.PriceCents
    }
);
```

---

### 11. **onboarding_complete** (triggers "onboarding_welcome" journey)
**Service:** `OnboardingService` (vai-api/Features/Onboarding/)
**Trigger:** When user completes all onboarding steps

```csharp
// In OnboardingService.CompleteOnboardingAsync() or similar:
await _journeyService.TriggerJourneyAsync(
    userId: user.PublicId,
    triggerEventType: "onboarding_complete",
    payload: new
    {
        user_name = System.Net.WebUtility.HtmlEncode(user.FirstName),
        sport = System.Net.WebUtility.HtmlEncode(user.Sport?.Name ?? ""),
        signup_date = user.CreatedAt.ToString("yyyy-MM-dd")
    }
);
```

---

## Security Rules (MANDATORY)

1. **HTML Encode All User Data:** `System.Net.WebUtility.HtmlEncode(userProvidedString)`
   - Protects against XSS injection into OneSignal email/push templates
   - Examples: first name, email, sport, city, custom attributes

2. **Numeric Data:** Pass as numbers, not strings
   - `amount_cents: 5000` (not `"$50.00"`)
   - Let the template handle formatting

3. **Never Pass Raw Database Objects:** Always construct new payload dictionaries with only needed fields

---

## Testing Each Integration

After implementing each integration:

```csharp
// In test:
var result = await _journeyService.TriggerJourneyAsync(testUserId, "payment_received", payload);
Assert.True(result);

// Verify in database:
var journey = await _db.NotificationJourneyStates
    .Where(j => j.UserId == testUserId && j.JourneyTemplateId == "payment_received")
    .FirstOrDefaultAsync();
Assert.NotNull(journey);
Assert.Equal("INITIATED", journey.Status);
```

---

## Dependency Injection

Register in `Program.cs` (DependencyResolution.cs):

```csharp
builder.Services.AddScoped<IJourneyOrchestrationService, JourneyOrchestrationService>();
builder.Services.AddHostedService<ProcessPendingJourneyStepsHostedService>();
```

Then inject into each service:

```csharp
public class PaymentService(
    IDbContext db,
    IJourneyOrchestrationService journeyService, // ← Add this
    ILogger<PaymentService> logger)
{
    // ...
}
```
