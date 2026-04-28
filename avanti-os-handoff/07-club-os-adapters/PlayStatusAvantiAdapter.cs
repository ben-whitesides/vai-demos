using System.Text.Json;
using Vai.Api.Features.Avanti.Core;
using Vai.Api.Features.ClubOS.Compliance;

namespace Vai.Api.Features.ClubOS.Avanti.Adapters;

public sealed class PlayStatusAvantiAdapter(
    IComplianceService complianceService,
    IAvantiActionRunWriter actionRunWriter) : IAvantiFeatureAdapter
{
    public string FeatureKey => "play_status";

    public async Task<AvantiFeatureContextDto> GetContextAsync(
        AvantiContextRequest request,
        CancellationToken cancellationToken = default)
    {
        // Green: summarize PLAY counts for club/athlete scope
        // Returns: GREEN/YELLOW/RED counts, top blockers, no raw medical detail
        var summary = await complianceService
            .GetPlayStatusSummaryAsync(request.ClubId, request.AthleteId, cancellationToken)
            .ConfigureAwait(false);

        var riskLevel = summary.RedCount > 0 ? "red"
            : summary.YellowCount > 0 ? "yellow"
            : "green";

        return new AvantiFeatureContextDto(
            TileId: "play_status",
            FeatureKey: FeatureKey,
            Title: "PLAY Status",
            RiskLevel: riskLevel,
            Summary: $"{summary.GreenCount} GREEN · {summary.YellowCount} YELLOW · {summary.RedCount} RED",
            QuickPrompts: [
                "What is blocking my athletes?",
                "List athletes expiring this week",
                "Explain the latest policy version"
            ],
            Navigate: new AvantiNavigateDto("Open PLAY Status", "/club-os/play-status")
        );
    }

    public async Task<IReadOnlyList<AvantiPreparedActionDto>> GetPreparedActionsAsync(
        AvantiContextRequest request,
        CancellationToken cancellationToken = default)
    {
        var actions = new List<AvantiPreparedActionDto>();

        // Green (club-scoped): read-only PLAY status summary for the club
        // No mutation, no confirmation. Available whenever ClubId is in scope.
        if (request.ClubId.HasValue)
        {
            var summary = await complianceService
                .GetPlayStatusSummaryAsync(request.ClubId, request.AthleteId, cancellationToken)
                .ConfigureAwait(false);

            actions.Add(new AvantiPreparedActionDto(
                FeatureKey: FeatureKey,
                TileId: "play_status",
                ActionType: "play_status.summarize_club",
                RiskLevel: "green",
                RequiresConfirmation: false,
                Label: "Summarize club PLAY status",
                Summary: $"{summary.GreenCount} GREEN · {summary.YellowCount} YELLOW · {summary.RedCount} RED",
                Preview: JsonSerializer.SerializeToElement(new
                {
                    greenCount = summary.GreenCount,
                    yellowCount = summary.YellowCount,
                    redCount = summary.RedCount,
                    totalAthletes = summary.GreenCount + summary.YellowCount + summary.RedCount
                }),
                TargetEntityType: "club",
                TargetEntityId: request.ClubId,
                ExpiresAt: DateTimeOffset.UtcNow.AddMinutes(15)
            ));
        }

        if (request.AthleteId.HasValue)
        {
            var block = await complianceService
                .GetTopBlockerAsync(request.AthleteId.Value, request.ClubId, cancellationToken)
                .ConfigureAwait(false);

            if (block is not null && block.IsActionable)
            {
                // Yellow: prepare reminder — requires exact recipient + message preview
                actions.Add(new AvantiPreparedActionDto(
                    FeatureKey: FeatureKey,
                    TileId: "play_status",
                    ActionType: "play_status.prepare_compliance_nudge",
                    RiskLevel: "yellow",
                    RequiresConfirmation: true,
                    Label: "Send reminder",
                    Summary: $"Remind {block.AthleteName}'s guardian about {block.GateLabel}",
                    Preview: JsonSerializer.SerializeToElement(new
                    {
                        recipientCount = 1,
                        athleteName = block.AthleteName,
                        gateLabel = block.GateLabel,
                        messagePreview = block.SuggestedMessagePreview
                    }),
                    TargetEntityType: "athlete",
                    TargetEntityId: request.AthleteId,
                    ExpiresAt: DateTimeOffset.UtcNow.AddHours(24)
                ));
            }
        }

        return actions;
    }

    public async Task<AvantiExecutionResultDto> ExecuteAsync(
        AvantiConfirmedActionRequest request,
        CancellationToken cancellationToken = default)
    {
        // Green action: summarize_club is read-only. Settled at prepare time.
        // Should never reach Execute, but guard defensively if a caller misroutes.
        if (request.ActionType == "play_status.summarize_club")
        {
            return new AvantiExecutionResultDto(
                Success: true,
                OutboxEventId: null,
                FailureCode: null,
                FailureMessage: null,
                Result: JsonSerializer.SerializeToElement(new { read_only = true })
            );
        }

        // Yellow action: dispatch to compliance comms service — never mutates PLAY state directly
        var outboxId = await complianceService
            .SendComplianceNudgeAsync(request, cancellationToken)
            .ConfigureAwait(false);

        // Fail closed: if the service didn't produce an outbox id, the side effect didn't happen.
        // Never report Success: true without verifiable evidence the nudge was queued.
        if (string.IsNullOrEmpty(outboxId))
        {
            return new AvantiExecutionResultDto(
                Success: false,
                OutboxEventId: null,
                FailureCode: "service_returned_no_outbox",
                FailureMessage: "ComplianceService.SendComplianceNudgeAsync returned null/empty outbox id; reminder was not queued.",
                Result: JsonSerializer.SerializeToElement(new { sent = false })
            );
        }

        return new AvantiExecutionResultDto(
            Success: true,
            OutboxEventId: outboxId,
            FailureCode: null,
            FailureMessage: null,
            Result: JsonSerializer.SerializeToElement(new { sent = true })
        );
    }
}
