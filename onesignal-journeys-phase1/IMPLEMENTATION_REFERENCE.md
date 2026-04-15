# OneSignal Journeys Phase 1 — Implementation Reference

Quick guide for Francis: 6 methods, what each does, and expected responses.

---

## Overview

The JourneyOrchestrationService orchestrates user progress through 11 predefined notification journeys. All business logic (state transitions, timing, frequency capping) lives here. OneSignal is delivery-only.

**Database Tables:**
- `journey_templates` — 11 predefined journeys with steps and timing
- `notification_journey_states` — tracks user progress through journeys

**Background Job:**
- `ProcessPendingJourneyStepsHostedService` — runs every 5 minutes to send pending steps

---

## Method Implementations

### 1. TriggerJourneyAsync(userId, triggerEventType, payload)
**Returns:** `Task<bool>` (true if triggered, false if already in progress)

**What it does:**
1. Looks up journey template for the trigger event type
2. Checks idempotency (prevents duplicate in-progress journeys)
3. Inserts journey state into database
4. Queues first step for processing

**SQL Pattern:**
```sql
-- Lookup template
SELECT id, template_id, steps_json FROM journey_templates 
WHERE trigger_event = @triggerEventType LIMIT 1;

-- Check idempotency
SELECT id FROM notification_journey_states
WHERE user_id = @userId AND journey_template_id = @templateId
AND status NOT IN ('COMPLETED', 'ABANDONED');

-- If exists, return false (already in progress)

-- Calculate next_step_at: NOW() + first_step.wait_minutes
-- Insert journey state
INSERT INTO notification_journey_states
(user_id, journey_template_id, current_step_index, status, event_payload_json, triggered_at, next_step_at)
VALUES (@userId, @templateId, 0, 'INITIATED', @payloadJson::jsonb, NOW(), @nextStepAt)
RETURNING id;
```

**C# Notes:**
- Deserialize `steps_json` from journey template (JSONB array)
- Extract first step's `wait_minutes` to calculate `next_step_at`
- Return true if insert succeeds, false if duplicate found

---

### 2. ProcessPendingStepsAsync()
**Returns:** `Task<int>` (number of steps processed)

**What it does:**
1. Fetches all journeys with pending steps (using SELECT FOR UPDATE to prevent race conditions)
2. For each journey:
   - Gets the current step from the template
   - Populates template variables from event payload (HtmlEncode all values)
   - Sends notification via OneSignal API
   - Updates journey state (current step, next timing)
   - Marks as COMPLETED if final step

**SQL Pattern:**
```sql
-- Fetch pending journeys (with locking for race condition prevention)
SELECT id, user_id, journey_template_id, current_step_index, event_payload_json, status
FROM notification_journey_states
WHERE status NOT IN ('COMPLETED', 'ABANDONED')
AND next_step_at <= NOW()
FOR UPDATE SKIP LOCKED;

-- For each journey:
-- 1. Load journey_template WHERE template_id = journey.journey_template_id
-- 2. Get current step: steps[current_step_index]
-- 3. Determine if last step: current_step_index == total_steps - 1
-- 4. Call OneSignal to send notification
-- 5. Update journey state:
UPDATE notification_journey_states
SET current_step_index = current_step_index + 1,
    status = CASE 
      WHEN current_step_index + 1 = (SELECT jsonb_array_length(steps_json) FROM journey_templates WHERE template_id = @templateId)
      THEN 'COMPLETED'
      ELSE 'STEP_' || (current_step_index + 1) || '_SENT'
    END,
    next_step_at = CASE 
      WHEN current_step_index + 1 = (SELECT jsonb_array_length(steps_json) FROM journey_templates WHERE template_id = @templateId)
      THEN NOW()
      ELSE NOW() + ((@nextWaitMinutes * INTERVAL '1 minute'))
    END,
    completed_at = CASE 
      WHEN current_step_index + 1 = (SELECT jsonb_array_length(steps_json) FROM journey_templates WHERE template_id = @templateId)
      THEN NOW()
      ELSE NULL
    END,
    last_onesignal_message_id = @oneSignalMessageId,
    updated_at = NOW()
WHERE id = @journeyStateId;
```

**C# Notes:**
- **Must use `FOR UPDATE SKIP LOCKED`** to prevent multiple instances processing same journey
- HtmlEncode all user data before passing to OneSignal (e.g., `System.Net.WebUtility.HtmlEncode(payload["user_name"])`)
- Handle OneSignal API failures with retry logic
- Track OneSignal message ID for audit/tracking
- **ProcessPendingJourneyStepsHostedService now uses `BackgroundService` + `IServiceScopeFactory`** (not `IHostedService` + direct injection). This prevents DI lifetime conflicts when injecting scoped services like DbContext. Always create a new scope per execution via `serviceScopeFactory.CreateScope()`

**Test Case:**
- Create journey, wait for first step to be ready, call ProcessPendingStepsAsync(), verify status updated
- Verify second step scheduled with correct timing

---

### 3. AbandonJourneyAsync(userId, journeyTemplateId)
**Returns:** `Task` (void)

**What it does:**
Marks a journey as ABANDONED (user opted out, subscription cancelled, etc.)

**SQL Pattern:**
```sql
UPDATE notification_journey_states
SET status = 'ABANDONED', completed_at = NOW(), updated_at = NOW()
WHERE user_id = @userId AND journey_template_id = @journeyTemplateId
AND status NOT IN ('COMPLETED', 'ABANDONED');
```

**C# Notes:**
- Simple update query
- Called when user unsubscribes or context changes

---

### 4. GetJourneyStateAsync(userId, journeyTemplateId)
**Returns:** `Task<JourneyStateModel?>` (null if not found)

**What it does:**
Retrieves current state of a user's journey (for debugging/admin use)

**SQL Pattern:**
```sql
SELECT id, user_id, journey_template_id, current_step_index, status,
       event_payload_json, triggered_at, next_step_at, completed_at, last_onesignal_message_id
FROM notification_journey_states
WHERE user_id = @userId AND journey_template_id = @journeyTemplateId;
```

**C# Notes:**
- Map database row to JourneyStateModel
- Parse event_payload_json back to dictionary

**Test Case:**
- Trigger journey, immediately query state, verify status is INITIATED

---

### 5. GetUserJourneysAsync(userId)
**Returns:** `Task<List<JourneyStateModel>>` (empty list if none)

**What it does:**
Gets all active journeys for a user (not completed or abandoned)

**SQL Pattern:**
```sql
SELECT id, user_id, journey_template_id, current_step_index, status,
       event_payload_json, triggered_at, next_step_at, completed_at, last_onesignal_message_id
FROM notification_journey_states
WHERE user_id = @userId AND status NOT IN ('COMPLETED', 'ABANDONED')
ORDER BY triggered_at DESC;
```

**C# Notes:**
- Returns list of active journeys
- Useful for admin/debugging panels

---

### 6. VerifyOneSignalConfigAsync()
**Returns:** `Task<bool>` (true if API accessible, false otherwise)

**What it does:**
Tests OneSignal API connectivity (called at startup or via admin endpoint)

**Implementation Pattern:**
```csharp
// Load OneSignal API key from IConfiguration
var apiKey = _config["OneSignal:ApiKey"];
if (string.IsNullOrEmpty(apiKey))
    return false;

// Make test API call (e.g., get app)
var client = new HttpClient();
client.DefaultRequestHeaders.Add("Authorization", $"Basic {apiKey}");
var response = await client.GetAsync("https://onesignal.com/api/v1/apps/{appId}");

return response.IsSuccessStatusCode;
```

---

## Template Variable Population

**Security Rule:** All user data MUST be HtmlEncoded before sending to OneSignal.

**Example:**
```csharp
var payload = new Dictionary<string, object>
{
    { "user_name", System.Net.WebUtility.HtmlEncode(user.FirstName) },
    { "amount_cents", payment.AmountCents }, // numbers don't need encoding
    { "coach_name", System.Net.WebUtility.HtmlEncode(coach.FirstName) }
};
```

---

## Race Condition Prevention

The `ProcessPendingStepsAsync` method MUST use `SELECT FOR UPDATE SKIP LOCKED`:

- **FOR UPDATE** locks the rows so no other transaction can modify them
- **SKIP LOCKED** allows other instances to skip locked rows and process different journeys
- This allows multiple cron instances to safely run in parallel without stepping on each other

---

## Idempotency Pattern

The unique constraint prevents duplicate in-progress journeys:
```sql
UNIQUE INDEX uq_journey_states_user_template_active
    ON notification_journey_states(user_id, journey_template_id)
    WHERE status NOT IN ('COMPLETED', 'ABANDONED');
```

If a duplicate trigger arrives, `TriggerJourneyAsync` returns false (already in progress).

---

## Database Tables

### journey_templates
- **id** (uuid) — primary key
- **template_id** (varchar) — unique, e.g., "payment_received"
- **name** (varchar) — display name
- **category** (varchar) — e.g., "MONEY", "AVANTI", "RETENTION"
- **trigger_event** (varchar) — event type, e.g., "payment_received"
- **steps_json** (jsonb) — array of steps: `[{step_index, wait_minutes, message_type, template_id}, ...]`
- **is_active** (boolean) — default true
- **created_at, updated_at** (timestamptz)

### notification_journey_states
- **id** (uuid) — primary key
- **user_id** (varchar) — foreign key to users(id)
- **journey_template_id** (varchar) — foreign key to journey_templates(template_id)
- **current_step_index** (integer) — 0-based index into steps array
- **status** (varchar) — "INITIATED", "STEP_1_SENT", "STEP_2_SENT", ..., "COMPLETED", "ABANDONED"
- **event_payload_json** (jsonb) — original trigger payload for template variable population
- **triggered_at** (timestamptz) — when journey started
- **next_step_at** (timestamptz) — when next step should send
- **completed_at** (timestamptz) — when journey finished or was abandoned
- **last_onesignal_message_id** (varchar) — OneSignal message ID of last sent step
- **created_at, updated_at** (timestamptz)

---

## Testing Checklist

- [ ] `setup-onesignal-feature.sh` runs without errors
- [ ] DI registration in Program.cs
- [ ] Migrations 055 + 056 applied to database
- [ ] All 6 methods implemented (no more `throw NotImplementedException()`)
- [ ] All 11 journey templates seeded in database (verify: `SELECT COUNT(*) FROM journey_templates WHERE is_active = true;` should be 11)
- [ ] Run `dotnet build` — zero errors
- [ ] Run `test-journey-integration.sh` — all tests pass
- [ ] Trigger a payment_received journey manually, verify in database
- [ ] Wait for ProcessPendingStepsAsync to run (every 5 minutes), verify status updated
- [ ] Verify OneSignal receives push notification request
- [ ] Compare responses vs vai-admin schema (if admin routes exist)

---

**Good luck! DM if you hit blockers.**
