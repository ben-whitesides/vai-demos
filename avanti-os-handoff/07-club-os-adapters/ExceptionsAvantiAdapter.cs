using System.Text.Json;
using Vai.Api.Features.Avanti.Core;
using Vai.Api.Features.ClubOS.Avanti;
using Vai.Api.Features.ClubOS.Comms;

namespace Vai.Api.Features.ClubOS.Avanti.Adapters;

public sealed class ExceptionsAvantiAdapter(
    IAvantiService legacyAvantiService,   // wraps existing Club OS AVANTI service
    ICommsService commsService,
    IAvantiActionRunWriter actionRunWriter) : IAvantiFeatureAdapter
{
    public string FeatureKey => "exceptions";

    public async Task<AvantiFeatureContextDto> GetContextAsync(
        AvantiContextRequest request,
        CancellationToken cancellationToken = default)
    {
        var queue = await legacyAvantiService
            .GetExceptionsQueueSummaryAsync(request.ClubId, cancellationToken)
            .ConfigureAwait(false);

        var riskLevel = queue.UrgentCount > 0 ? "red"
            : queue.OpenCount > 0 ? "yellow"
            : "green";

        return new AvantiFeatureContextDto(
            TileId: "exceptions",
            FeatureKey: FeatureKey,
            Title: "Exceptions",
            RiskLevel: riskLevel,
            Summary: $"{queue.OpenCount} open · {queue.UrgentCount} urgent",
            QuickPrompts: [
                "Summarize the exception queue",
                "Group by root cause",
                "Explain the oldest escalation"
            ],
            Navigate: new AvantiNavigateDto("Open Exceptions", "/club-os/exceptions")
        );
    }

    public async Task<IReadOnlyList<AvantiPreparedActionDto>> GetPreparedActionsAsync(
        AvantiContextRequest request,
        CancellationToken cancellationToken = default)
    {
        var actionable = await legacyAvantiService
            .GetActionableExceptionsAsync(request.ClubId, cancellationToken)
            .ConfigureAwait(false);

        if (!actionable.Any())
            return [];

        return [new AvantiPreparedActionDto(
            FeatureKey: FeatureKey,
            TileId: "exceptions",
            ActionType: "exceptions.prepare_bulk_nudge",
            RiskLevel: "yellow",
            RequiresConfirmation: true,
            Label: "Send bulk reminder",
            Summary: $"Prepare reminders for {actionable.Count} unresolved exceptions",
            Preview: JsonSerializer.SerializeToElement(new
            {
                recipientCount = actionable.Count,
                categories = actionable
                    .GroupBy(e => e.Category)
                    .Select(g => new { category = g.Key, count = g.Count() })
            }),
            TargetEntityType: "club",
            TargetEntityId: request.ClubId,
            ExpiresAt: DateTimeOffset.UtcNow.AddHours(24)
        )];
    }

    public async Task<AvantiExecutionResultDto> ExecuteAsync(
        AvantiConfirmedActionRequest request,
        CancellationToken cancellationToken = default)
    {
        var outboxId = await commsService
            .SendBulkExceptionNudgesAsync(request, cancellationToken)
            .ConfigureAwait(false);

        return new AvantiExecutionResultDto(
            Success: true,
            OutboxEventId: outboxId,
            FailureCode: null,
            FailureMessage: null,
            Result: JsonSerializer.SerializeToElement(new { sent = true })
        );
    }
}
