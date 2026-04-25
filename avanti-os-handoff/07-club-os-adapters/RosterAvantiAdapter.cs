using System.Text.Json;
using Vai.Api.Features.Avanti.Core;
using Vai.Api.Features.ClubOS.Gameday.Teams;

namespace Vai.Api.Features.ClubOS.Avanti.Adapters;

public sealed class RosterAvantiAdapter(
    ITeamsService teamsService,
    IAvantiActionRunWriter actionRunWriter) : IAvantiFeatureAdapter
{
    public string FeatureKey => "roster";

    public async Task<AvantiFeatureContextDto> GetContextAsync(
        AvantiContextRequest request,
        CancellationToken cancellationToken = default)
    {
        var health = await teamsService
            .GetRosterHealthAsync(request.ClubId, request.ActorUserId, cancellationToken)
            .ConfigureAwait(false);

        var riskLevel = health.BlockedCount > 0 ? "red"
            : health.YellowCount > 0 ? "yellow"
            : "green";

        return new AvantiFeatureContextDto(
            TileId: "roster",
            FeatureKey: FeatureKey,
            Title: "Roster",
            RiskLevel: riskLevel,
            Summary: $"{health.TotalAthletes} athletes · {health.BlockedCount} BLOCKED",
            QuickPrompts: [
                "Who is blocked on my roster?",
                "Find athletes missing team assignments",
                "Show YELLOW athletes this week"
            ],
            Navigate: new AvantiNavigateDto("Open Roster", "/club-os/teams")
        );
    }

    public async Task<IReadOnlyList<AvantiPreparedActionDto>> GetPreparedActionsAsync(
        AvantiContextRequest request,
        CancellationToken cancellationToken = default)
    {
        // Returns Yellow action if there are blocked athletes with actionable reminders
        var blocked = await teamsService
            .GetBlockedAthletesAsync(request.ClubId, request.ActorUserId, cancellationToken)
            .ConfigureAwait(false);

        if (!blocked.Any())
            return [];

        return [new AvantiPreparedActionDto(
            FeatureKey: FeatureKey,
            TileId: "roster",
            ActionType: "roster.prepare_parent_nudge",
            RiskLevel: "yellow",
            RequiresConfirmation: true,
            Label: "Remind blocked athletes",
            Summary: $"Send PLAY Status reminders to {blocked.Count} families",
            Preview: JsonSerializer.SerializeToElement(new
            {
                recipientCount = blocked.Count,
                athletes = blocked.Select(a => a.Name).Take(5)
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
        var outboxId = await teamsService
            .SendRosterNudgesAsync(request, cancellationToken)
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
