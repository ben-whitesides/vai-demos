#!/bin/bash
# Generate C# method stubs from IJourneyOrchestrationService interface
# Includes SQL hints and TODO comments for quick implementation
# Usage: ./generate-method-stubs.sh > JourneyOrchestrationService.stubs.cs

cat << 'EOF'
// Generated stubs for JourneyOrchestrationService implementation
// Replace the throw NotImplementedException() with your database queries
// All user data MUST be HtmlEncoded before insertion to prevent XSS

public async Task<bool> TriggerJourneyAsync(string userId, string triggerEventType, object payload)
{
    // TODO: Trigger a journey for a user
    // 1. Query journey_templates WHERE trigger_event = @triggerEventType
    //    SELECT * FROM journey_templates WHERE trigger_event = @triggerEventType LIMIT 1;
    // 2. Check idempotency (prevent duplicate in-progress journeys):
    //    SELECT id FROM notification_journey_states
    //    WHERE user_id = @userId AND journey_template_id = @templateId
    //    AND status NOT IN ('COMPLETED', 'ABANDONED');
    //    If result exists, return false (already in progress)
    // 3. Calculate next_step_at for first step (wait_minutes from steps[0]):
    //    next_step_at = NOW() + (@waitMinutes * interval '1 minute')
    // 4. INSERT journey state:
    //    INSERT INTO notification_journey_states
    //    (user_id, journey_template_id, current_step_index, status, event_payload_json, triggered_at, next_step_at)
    //    VALUES (@userId, @templateId, 0, 'INITIATED', @payloadJson::jsonb, NOW(), @nextStepAt);
    // 5. Return true
    throw new NotImplementedException();
}

public async Task<int> ProcessPendingStepsAsync()
{
    // TODO: Process all pending journey steps (called every 5 minutes)
    // 1. Lock and fetch pending journeys (prevents race conditions):
    //    SELECT id, user_id, journey_template_id, current_step_index, event_payload_json
    //    FROM notification_journey_states
    //    WHERE status NOT IN ('COMPLETED', 'ABANDONED')
    //    AND next_step_at <= NOW()
    //    FOR UPDATE SKIP LOCKED;
    // 2. For each journey:
    //    a. Load journey_template for this journey_template_id
    //    b. Get current step: steps[current_step_index]
    //    c. Populate template variables from event_payload_json (HtmlEncode all values)
    //    d. Determine message type (push, email, in_app) from step.message_type
    //    e. Call OneSignal API or email service to send
    //    f. Store OneSignal message ID in last_onesignal_message_id
    //    g. Update journey state:
    //       - current_step_index = current_step_index + 1
    //       - status = 'STEP_' + (index+1) + '_SENT'
    //       - next_step_at = NOW() + (steps[index+1].wait_minutes * interval '1 minute') [if not last step]
    //       - completed_at = NOW() [if last step]
    //       - status = 'COMPLETED' [if last step]
    // 3. Return count of steps processed
    throw new NotImplementedException();
}

public async Task AbandonJourneyAsync(string userId, string journeyTemplateId)
{
    // TODO: Abandon an in-progress journey
    // UPDATE notification_journey_states
    // SET status = 'ABANDONED', completed_at = NOW()
    // WHERE user_id = @userId AND journey_template_id = @journeyTemplateId
    // AND status NOT IN ('COMPLETED', 'ABANDONED');
    throw new NotImplementedException();
}

public async Task<JourneyStateModel?> GetJourneyStateAsync(string userId, string journeyTemplateId)
{
    // TODO: Get current state of a user's journey
    // SELECT id, user_id, journey_template_id, current_step_index, status,
    //        event_payload_json, triggered_at, next_step_at, completed_at, last_onesignal_message_id
    // FROM notification_journey_states
    // WHERE user_id = @userId AND journey_template_id = @journeyTemplateId;
    // Map result to JourneyStateModel and return (or null if not found)
    throw new NotImplementedException();
}

public async Task<List<JourneyStateModel>> GetUserJourneysAsync(string userId)
{
    // TODO: Get all active journeys for a user
    // SELECT id, user_id, journey_template_id, current_step_index, status,
    //        event_payload_json, triggered_at, next_step_at, completed_at, last_onesignal_message_id
    // FROM notification_journey_states
    // WHERE user_id = @userId AND status NOT IN ('COMPLETED', 'ABANDONED')
    // ORDER BY triggered_at DESC;
    // Map results to List<JourneyStateModel> and return
    throw new NotImplementedException();
}

public async Task<bool> VerifyOneSignalConfigAsync()
{
    // TODO: Verify OneSignal API connectivity
    // 1. Load OneSignal API key from IConfiguration or environment variable
    // 2. Call OneSignal API health endpoint (or simple API call)
    // 3. Return true if successful, false if API unreachable
    throw new NotImplementedException();
}
EOF
