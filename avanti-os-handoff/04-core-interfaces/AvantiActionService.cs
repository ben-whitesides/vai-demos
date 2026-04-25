using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace Vai.Api.Features.Avanti.Core;

public sealed class AvantiActionService(
    IEnumerable<IAvantiFeatureAdapter> adapters,
    IAvantiActionRunWriter actionRunWriter,
    ILogger<AvantiActionService> logger) : IAvantiActionService
{
    public async Task<AvantiPrepareResultDto> PrepareAsync(PrepareAvantiActionRequest request, CancellationToken ct = default)
    {
        var existing = await actionRunWriter
            .GetByIdempotencyAsync(request.ActorUserId, request.IdempotencyKey, ct)
            .ConfigureAwait(false);

        if (existing is not null)
        {
            if (existing.Status is "prepared" or "confirmation_required" or "confirmed" or "succeeded")
            {
                return new AvantiPrepareResultDto(
                    existing.Id,
                    existing.RiskLevel,
                    existing.Status,
                    existing.RequiresConfirmation,
                    ExtractString(existing.PreparedPayload, "label"),
                    ExtractString(existing.PreparedPayload, "summary"),
                    existing.PreparedPayload,
                    existing.ExpiresAt,
                    true,
                    null,
                    null);
            }

            return new AvantiPrepareResultDto(
                existing.Id,
                existing.RiskLevel,
                existing.Status,
                existing.RequiresConfirmation,
                ExtractString(existing.PreparedPayload, "label"),
                ExtractString(existing.PreparedPayload, "summary"),
                existing.PreparedPayload,
                existing.ExpiresAt,
                false,
                "idempotency_key_reused_terminal",
                "Existing action run is terminal. Use a new idempotency key for a new attempt.");
        }

        var adapter = ResolveAdapter(request.FeatureKey);
        if (adapter is null)
        {
            return new AvantiPrepareResultDto(
                null,
                null,
                "failed",
                false,
                null,
                null,
                null,
                null,
                false,
                "feature_key_not_found",
                $"No AVANTI adapter registered for feature '{request.FeatureKey}'.");
        }

        var context = new AvantiContextRequest(
            request.ActorUserId,
            request.ActorRole,
            request.ActorTier,
            request.TileId,
            request.ContextEntityType,
            request.ContextEntityId,
            request.AthleteId,
            request.ClubId,
            request.OrgId,
            request.Surface);

        var actions = await adapter.GetPreparedActionsAsync(context, ct).ConfigureAwait(false);
        var selected = actions.FirstOrDefault(a => string.Equals(a.ActionType, request.ActionType, StringComparison.OrdinalIgnoreCase));
        if (selected is null)
        {
            return new AvantiPrepareResultDto(
                null,
                null,
                "failed",
                false,
                null,
                null,
                null,
                null,
                false,
                "action_type_not_supported",
                $"Action type '{request.ActionType}' is not supported for feature '{request.FeatureKey}'.");
        }

        var status = selected.RiskLevel switch
        {
            "red" => "blocked",
            _ when selected.RequiresConfirmation => "confirmation_required",
            _ => "succeeded"
        };

        var preparedPayload = JsonSerializer.SerializeToElement(new
        {
            label = selected.Label,
            summary = selected.Summary,
            preview = selected.Preview
        });

        var actionRunId = await actionRunWriter.WriteAsync(
            new AvantiActionRunWriteDto(
                request.ActorUserId,
                request.ActorRole,
                request.ActorTier,
                request.TileId,
                request.FeatureKey,
                request.ActionType,
                selected.RiskLevel,
                status,
                request.ContextEntityType,
                request.ContextEntityId,
                selected.TargetEntityType,
                selected.TargetEntityId,
                request.IdempotencyKey,
                selected.RequiresConfirmation,
                preparedPayload,
                null,
                null,
                selected.ExpiresAt),
            ct).ConfigureAwait(false);

        return new AvantiPrepareResultDto(
            actionRunId,
            selected.RiskLevel,
            status,
            selected.RequiresConfirmation,
            selected.Label,
            selected.Summary,
            selected.Preview,
            selected.ExpiresAt,
            true,
            null,
            null);
    }

    public async Task<AvantiConfirmResultDto> ConfirmAsync(ConfirmAvantiActionRequest request, CancellationToken ct = default)
    {
        var actionRun = await actionRunWriter.GetByIdAsync(request.ActionRunId, ct).ConfigureAwait(false);
        if (actionRun is null)
        {
            return new AvantiConfirmResultDto(request.ActionRunId, "failed", false, "action_run_not_found", "Action run does not exist.");
        }

        if (actionRun.ActorUserId != request.ActorUserId)
        {
            return new AvantiConfirmResultDto(request.ActionRunId, actionRun.Status, false, "forbidden", "Action run owner mismatch.");
        }

        if (actionRun.Status == "confirmed")
        {
            return new AvantiConfirmResultDto(request.ActionRunId, "confirmed", true, null, null);
        }

        if (actionRun.Status != "confirmation_required")
        {
            return new AvantiConfirmResultDto(request.ActionRunId, actionRun.Status, false, "invalid_state_transition", "Action is not waiting for confirmation.");
        }

        await actionRunWriter
            .UpdateConfirmAsync(request.ActionRunId, request.ActorUserId, request.ConfirmationPayload, ct)
            .ConfigureAwait(false);

        return new AvantiConfirmResultDto(request.ActionRunId, "confirmed", true, null, null);
    }

    public async Task<AvantiExecuteResultDto> ExecuteAsync(ExecuteAvantiActionRequest request, CancellationToken ct = default)
    {
        var actionRun = await actionRunWriter.GetByIdAsync(request.ActionRunId, ct).ConfigureAwait(false);
        if (actionRun is null)
        {
            return new AvantiExecuteResultDto(request.ActionRunId, "failed", false, "action_run_not_found", "Action run does not exist.", null);
        }

        if (actionRun.ActorUserId != request.ActorUserId)
        {
            return new AvantiExecuteResultDto(request.ActionRunId, actionRun.Status, false, "forbidden", "Action run owner mismatch.", null);
        }

        if (string.Equals(actionRun.RiskLevel, "red", StringComparison.OrdinalIgnoreCase))
        {
            return new AvantiExecuteResultDto(request.ActionRunId, actionRun.Status, false, "red_action_blocked", "Red actions cannot be executed.", null);
        }

        if (actionRun.Status == "succeeded")
        {
            return new AvantiExecuteResultDto(request.ActionRunId, "succeeded", true, null, null, actionRun.ExecutionResult);
        }

        if (actionRun.Status != "confirmed")
        {
            return new AvantiExecuteResultDto(request.ActionRunId, actionRun.Status, false, "invalid_state_transition", "Action must be confirmed before execution.", null);
        }

        var adapter = ResolveAdapter(actionRun.FeatureKey);
        if (adapter is null)
        {
            return new AvantiExecuteResultDto(request.ActionRunId, "failed", false, "feature_key_not_found", $"No AVANTI adapter registered for feature '{actionRun.FeatureKey}'.", null);
        }

        try
        {
            var confirmedRequest = new AvantiConfirmedActionRequest(
                request.ActionRunId,
                request.ActorUserId,
                actionRun.ActionType,
                actionRun.FeatureKey,
                actionRun.ConfirmationPayload,
                request.IdempotencyKey);

            var result = await adapter.ExecuteAsync(confirmedRequest, ct).ConfigureAwait(false);
            var nextStatus = result.Success ? "succeeded" : "failed";

            await actionRunWriter
                .UpdateStatusAsync(request.ActionRunId, nextStatus, result.Result, result.FailureCode, result.FailureMessage, ct)
                .ConfigureAwait(false);

            return new AvantiExecuteResultDto(request.ActionRunId, nextStatus, result.Success, result.FailureCode, result.FailureMessage, result.Result);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "AVANTI action execution failed for ActionRunId {ActionRunId}", request.ActionRunId);
            await actionRunWriter
                .UpdateStatusAsync(request.ActionRunId, "failed", null, "execution_exception", "An internal error occurred during execution.", ct)
                .ConfigureAwait(false);

            return new AvantiExecuteResultDto(
                request.ActionRunId,
                "failed",
                false,
                "execution_exception",
                "An internal error occurred during execution.",
                null);
        }
    }

    public async Task<AvantiActionHistoryResultDto> GetHistoryAsync(AvantiActionHistoryQuery query, CancellationToken ct = default)
    {
        var historyRows = await actionRunWriter.GetHistoryAsync(query, ct).ConfigureAwait(false);
        var redactPayloads = string.Equals(query.ActorRole, "athlete", StringComparison.OrdinalIgnoreCase);

        var items = historyRows.Select(row => new AvantiActionHistoryItemDto(
            row.Id,
            row.FeatureKey,
            row.ActionType,
            row.RiskLevel,
            row.Status,
            ExtractString(row.PreparedPayload, "summary"),
            row.CreatedAt,
            row.ExecutedAt,
            redactPayloads ? null : row.PreparedPayload,
            redactPayloads ? null : row.ConfirmationPayload,
            redactPayloads ? null : row.ExecutionPayload,
            redactPayloads ? null : row.ExecutionResult
        )).ToList();

        var baseOffset = int.TryParse(query.Cursor, out var cursorOffset) ? Math.Max(cursorOffset, 0) : 0;
        var hasMore = items.Count >= query.Limit;
        var nextCursor = hasMore ? (baseOffset + items.Count).ToString() : null;

        return new AvantiActionHistoryResultDto(items, nextCursor);
    }

    private IAvantiFeatureAdapter? ResolveAdapter(string featureKey)
    {
        var matches = adapters
            .Where(a => string.Equals(a.FeatureKey, featureKey, StringComparison.OrdinalIgnoreCase))
            .ToList();

        if (matches.Count > 1)
        {
            logger.LogCritical(
                "Multiple AVANTI adapters registered for feature key {FeatureKey}. Using first registration.",
                featureKey);
        }

        return matches.FirstOrDefault();
    }

    private static string? ExtractString(JsonElement element, string propertyName)
    {
        if (element.ValueKind != JsonValueKind.Object)
        {
            return null;
        }

        if (!element.TryGetProperty(propertyName, out var property))
        {
            return null;
        }

        return property.ValueKind == JsonValueKind.String ? property.GetString() : property.ToString();
    }
}
