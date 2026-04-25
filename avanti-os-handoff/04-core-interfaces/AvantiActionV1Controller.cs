using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Vai.Api.Infrastructure.Api;
using Vai.Api.Infrastructure.Attributes;
using Vai.Api.Infrastructure.Middleware.UserContext;

namespace Vai.Api.Features.Avanti;

// ─────────────────────────────────────────────────────────────────────────────
// AvantiActionV1Controller
//
// Shared AVANTI action pipeline endpoints.
// These are the SAME endpoints consumed by:
//   • Mobile Home Grid (tile overlay)
//   • GAMEDAY Command Rail + Side Panel
//   • Club OS AVANTI chips (after pre-PR patch)
//   • Camp + Tryout program adapters
//   • Admin Portal AVANTI Ops Console
//
// Adapters registered via DI resolve actions by FeatureKey.
// ─────────────────────────────────────────────────────────────────────────────

[Route("/v1/avanti")]
public sealed class AvantiActionV1Controller(
    IUserContextService userContextService,
    IAvantiActionService avantiActionService) : VaiSecureControllerBase(userContextService)
{
    // ── Prepare ───────────────────────────────────────────────────────────────
    // Creates or reuses an avanti_action_runs row.
    // Green: completes immediately (status=succeeded).
    // Yellow: stops at confirmation_required.
    // Red: stored as blocked, never executable.
    [HttpPost("actions/prepare")]
    [AuthorizeScopes("vai:user")]
    [RateLimit(20, per: "1min")]
    public async Task<IActionResult> Prepare(
        [FromBody] PrepareAvantiActionRequest request,
        [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey)
    {
        if (!TryGetActorTier(out var actorTier))
        {
            return Forbid();
        }

        request.ActorUserId = GetActorUserId();
        request.ActorRole = GetActorRole();
        request.ActorTier = actorTier;
        request.IdempotencyKey = idempotencyKey ?? Guid.NewGuid().ToString();

        var result = await avantiActionService.PrepareAsync(request).ConfigureAwait(false);
        return ToApiResult(result);
    }

    // ── Confirm ───────────────────────────────────────────────────────────────
    // Transitions a Yellow action from confirmation_required → confirmed.
    // Validates actor is owner or authorized approver.
    [HttpPost("actions/{actionRunId:guid}/confirm")]
    [AuthorizeScopes("vai:user")]
    [RateLimit(10, per: "1min")]
    public async Task<IActionResult> Confirm(
        Guid actionRunId,
        [FromBody] ConfirmAvantiActionRequest request,
        [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey)
    {
        request.ActionRunId = actionRunId;
        request.ActorUserId = GetActorUserId();
        request.IdempotencyKey = idempotencyKey ?? Guid.NewGuid().ToString();

        var result = await avantiActionService.ConfirmAsync(request).ConfigureAwait(false);
        return ToApiResult(result);
    }

    // ── Execute ───────────────────────────────────────────────────────────────
    // Dispatches through the feature adapter's typed executor.
    // Yellow actions must be confirmed first (status=confirmed).
    // Red actions cannot execute — returns 409 red_action_blocked.
    [HttpPost("actions/{actionRunId:guid}/execute")]
    [AuthorizeScopes("vai:user")]
    [RateLimit(5, per: "1min")]
    public async Task<IActionResult> Execute(
        Guid actionRunId,
        [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey)
    {
        var request = new ExecuteAvantiActionRequest
        {
            ActionRunId = actionRunId,
            ActorUserId = GetActorUserId(),
            IdempotencyKey = idempotencyKey ?? Guid.NewGuid().ToString()
        };

        var result = await avantiActionService.ExecuteAsync(request).ConfigureAwait(false);
        return ToApiResult(result);
    }

    // ── History ───────────────────────────────────────────────────────────────
    // Returns action history scoped to actor.
    // Redacts sensitive payloads by role.
    [HttpGet("actions/history")]
    [AuthorizeScopes("vai:user")]
    public async Task<IActionResult> History(
        [FromQuery] string? featureKey,
        [FromQuery] string? status,
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] int limit = 50,
        [FromQuery] string? cursor = null)
    {
        var query = new AvantiActionHistoryQuery
        {
            ActorUserId = GetActorUserId(),
            ActorRole = GetActorRole(),
            FeatureKey = featureKey,
            Status = status,
            From = from,
            To = to,
            Limit = Math.Min(limit, 100),
            Cursor = cursor
        };

        var result = await avantiActionService.GetHistoryAsync(query).ConfigureAwait(false);
        return ToApiResult(result);
    }

    private Guid GetActorUserId() =>
        Guid.Parse(LoggedInUser.PublicId);

    private string GetActorRole() =>
        LoggedInUser.Roles.FirstOrDefault()?.Name ?? "athlete";

    private bool TryGetActorTier(out string actorTier)
    {
        var tier =
            User.FindFirstValue("subscription_tier") ??
            User.FindFirstValue("tier") ??
            User.FindFirstValue("vai_tier");

        if (string.IsNullOrWhiteSpace(tier) || tier is not ("free" or "plus" or "mentor"))
        {
            actorTier = string.Empty;
            return false;
        }

        actorTier = tier;
        return true;
    }
}
