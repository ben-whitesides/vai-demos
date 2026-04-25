using System.Text.Json;
using Vai.Api.Features.Avanti.Core;
using Vai.Api.Features.ClubOS.Gameday.Standings;
using Vai.Api.Features.ClubOS.Gameday.Scoring;

namespace Vai.Api.Features.ClubOS.Avanti.Adapters;

public sealed class StandingsAvantiAdapter(
    IStandingsService standingsService,
    IScoringService scoringService,
    IAvantiActionRunWriter actionRunWriter) : IAvantiFeatureAdapter
{
    public string FeatureKey => "standings";

    public async Task<AvantiFeatureContextDto> GetContextAsync(
        AvantiContextRequest request,
        CancellationToken cancellationToken = default)
    {
        var summary = await standingsService
            .GetStandingsSummaryAsync(request.ClubId, cancellationToken)
            .ConfigureAwait(false);

        return new AvantiFeatureContextDto(
            TileId: "standings",
            FeatureKey: FeatureKey,
            Title: "Standings",
            RiskLevel: "green",
            Summary: summary is not null
                ? $"#{summary.Rank} · {summary.Record} · {summary.SeasonName}"
                : "No active season",
            QuickPrompts: [
                "Explain our ranking movement",
                "What changed since last week?",
                "Show recent game events"
            ],
            Navigate: new AvantiNavigateDto("Open Standings", "/club-os/standings")
        );
    }

    public async Task<IReadOnlyList<AvantiPreparedActionDto>> GetPreparedActionsAsync(
        AvantiContextRequest request,
        CancellationToken cancellationToken = default)
    {
        // Score corrections are Yellow — requires assigned ref identity + event diff + confirmation
        if (!request.ContextEntityId.HasValue)
            return [];

        var pendingCorrection = await scoringService
            .GetPendingCorrectionAsync(request.ContextEntityId.Value, cancellationToken)
            .ConfigureAwait(false);

        if (pendingCorrection is null)
            return [];

        return [new AvantiPreparedActionDto(
            FeatureKey: FeatureKey,
            TileId: "standings",
            ActionType: "standings.prepare_score_correction",
            RiskLevel: "yellow",
            RequiresConfirmation: true,
            Label: "Apply score correction",
            Summary: pendingCorrection.Description,
            Preview: JsonSerializer.SerializeToElement(new
            {
                eventId = pendingCorrection.EventId,
                currentScore = pendingCorrection.CurrentScore,
                correctedScore = pendingCorrection.CorrectedScore,
                refUserId = pendingCorrection.RefUserId
            }),
            TargetEntityType: "scheduled_event",
            TargetEntityId: request.ContextEntityId,
            ExpiresAt: DateTimeOffset.UtcNow.AddHours(12)
        )];
    }

    public async Task<AvantiExecutionResultDto> ExecuteAsync(
        AvantiConfirmedActionRequest request,
        CancellationToken cancellationToken = default)
    {
        // Routes through IScoringService — append-only game events
        var outboxId = await scoringService
            .ApplyScoreCorrectionAsync(request, cancellationToken)
            .ConfigureAwait(false);

        return new AvantiExecutionResultDto(
            Success: true,
            OutboxEventId: outboxId,
            FailureCode: null,
            FailureMessage: null,
            Result: JsonSerializer.SerializeToElement(new { applied = true })
        );
    }
}
